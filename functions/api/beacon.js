// 内存计数器（全局聚合，允许丢失）
let memCounters = new Map();
// 会话写入缓冲：sid -> { lastFlush:number, pending:[] }（避免每次上报都写 KV）
let memBuffers = new Map();
// 批量写 KV 的最小间隔（毫秒）；玩家退出时无视该间隔立即落盘
const FLUSH_INTERVAL_MS = 60000;
// 单个会话缓冲上限（达到即强制落盘，避免内存无界）
const BUF_MAX = 200;
// 面板总览用的聚合键
const AGG_KEY = 'agg:dash';
// 老版本历史数据回填标记（只在首次运行时扫描一次旧的聚合/会话键）
const BACKFILL_META = 'meta:backfill';
let backfillChecked = false;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const useKV = !!(env && env.ANALYTICS);

  // POST /api/beacon — 接收批量事件
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      // 支持单个事件或批量事件数组
      const events = Array.isArray(body) ? body : [body];

      // 首次运行时先把老版本历史数据并入聚合键，再让后续落盘增量更新
      if (useKV) await ensureBackfill(env.ANALYTICS);

      // 按 sid 分组；final:true 表示该会话已结束，本次必须立即落盘
      const bySid = {};
      const finalSids = new Set();
      for (const ev of events) {
        const { sid, pageId, from, duration } = ev;
        if (!sid) continue;
        if (ev.final === true) finalSids.add(sid);

        // 更新内存计数器
        if (pageId) memCounters.set(`v:${pageId}`, (memCounters.get(`v:${pageId}`) || 0) + 1);
        if (from) memCounters.set(`x:${from}`, (memCounters.get(`x:${from}`) || 0) + 1);
        if (duration && from) {
          const key = `d:${from}`;
          const durs = memCounters.get(key) || [];
          durs.push(duration);
          if (durs.length > 200) durs.shift();
          memCounters.set(key, durs);
        }
        if (from && pageId) memCounters.set(`f:${from}->${pageId}`, (memCounters.get(`f:${from}->${pageId}`) || 0) + 1);

        // 进入会话缓冲（暂不写 KV）
        if (!bySid[sid]) bySid[sid] = [];
        bySid[sid].push({ ts: ev.ts || Date.now(), p: pageId || '', fr: from || '', d: duration || 0 });
      }

      // 需要落盘的会话名（节流到期 或 缓冲区满 或 会话已退出）
      const toFlush = Object.keys(bySid).filter(sid => {
        const b = memBuffers.get(sid) || { lastFlush: 0, pending: [] };
        if (!memBuffers.has(sid)) {
          b.pending = bySid[sid].slice(-BUF_MAX);
          memBuffers.set(sid, b);
          return finalSids.has(sid) || b.pending.length >= BUF_MAX; // 首次进缓冲：退出或已超上限才落盘
        }
        b.pending.push(...bySid[sid]);
        if (b.pending.length > BUF_MAX) b.pending = b.pending.slice(-BUF_MAX);
        const reached = Date.now() - b.lastFlush >= FLUSH_INTERVAL_MS;
        const full = b.pending.length >= BUF_MAX;
        return reached || full || finalSids.has(sid);
      });

      // 写入 KV（不阻塞响应）；已退出的会话立即清缓冲
      if (useKV && toFlush.length > 0) {
        context.waitUntil((async () => {
          for (const sid of toFlush) {
            const b = memBuffers.get(sid);
            if (!b || b.pending.length === 0) continue;
            await flushSessionToKV(env.ANALYTICS, sid, b);
            if (finalSids.has(sid)) memBuffers.delete(sid);
          }
        })());
      }

      return new Response('ok', { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response('bad request', { status: 400, headers: corsHeaders });
    }
  }

  // GET /api/beacon — 仪表盘
  if (request.method === 'GET') {
    // 查看单个会话
    const viewSid = url.searchParams.get('sid');
    if (viewSid && useKV) {
      try {
        const raw = await env.ANALYTICS.get(`s:${viewSid}`);
        const events = raw ? JSON.parse(raw) : [];
        return new Response(renderSessionDetail(viewSid, events), {
          headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
        });
      } catch (e) {
        return new Response(renderSessionDetail(viewSid, []), {
          headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
        });
      }
    }

    // 总览仪表盘
    let sessionData = {};
    let aggCounters = new Map(); // 持久化的汇总指标（v:/x:/d:/f:），来自 agg:dash
    if (useKV) {
      try {
        // 首次运行先回填老版本历史数据，保证面板能看到历史汇总
        await ensureBackfill(env.ANALYTICS);
      } catch (e) { /* 回填失败不阻断面板 */ }

      try {
        // 优先读汇总聚合键（1 次 KV get），避免逐个会话全量读取
        const aggra = await env.ANALYTICS.get(AGG_KEY);
        if (aggra) {
          const agg = JSON.parse(aggra);
          if (Array.isArray(agg.s)) {
            for (const x of agg.s) {
              // 面板只需摘要列；key 保持 s: 前缀，值是摘要对象（renderDashboard 识别）
              sessionData[`s:${x.id}`] = {
                _agg: true,
                ts: x.lastTs,
                count: x.count,
                pageCount: x.pageCount || 0,
                lastPage: x.lastPage || '?'
              };
            }
          }
          // 汇总指标同样优先从聚合键读（持久化，历史数据也在此）
          for (const [p, c] of Object.entries(agg.v || {})) aggCounters.set(`v:${p}`, c);
          for (const [p, c] of Object.entries(agg.x || {})) aggCounters.set(`x:${p}`, c);
          for (const [p, durs] of Object.entries(agg.d || {})) {
            if (Array.isArray(durs)) aggCounters.set(`d:${p}`, durs);
          }
          for (const [p, c] of Object.entries(agg.f || {})) aggCounters.set(`f:${p}`, c);
        }
      } catch (e) { /* 聚合键缺失或损坏 → 走回退 */ }

      // 回退：聚合键缺失/损坏且面板无数据时，从 s: 全量重建一次（正常时不会走到这里）
      if (Object.keys(sessionData).length === 0) {
        try {
          const list = await env.ANALYTICS.list({ prefix: 's:' });
          for (const key of list.keys) {
            try {
              const arr = JSON.parse(await env.ANALYTICS.get(key.name));
              if (!Array.isArray(arr) || arr.length === 0) continue;
              sessionData[key.name] = arr;
            } catch (e) { /* skip corrupt entries */ }
          }
        } catch (e) { /* ignore KV errors */ }
      }
    }

    // 有 KV 用持久化汇总；无 KV（纯内存回退）用实时内存计数
    const dashboardCounters = useKV ? aggCounters : memCounters;
    return new Response(renderDashboard(dashboardCounters, sessionData, !!useKV), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  return new Response('Not found', { status: 404 });
}

// 按 sid 串行化 KV 写入（避免读-改-写竞态导致事件丢失）
const writeLocks = new Map();
function withLock(key, fn) {
  const prev = writeLocks.get(key) || Promise.resolve();
  const next = prev.catch(() => {}).then(fn);
  writeLocks.set(key, next);
  return next;
}

// 将某会话的缓冲事件写入 KV；节流内重复事件去重；顺带更新总览聚合键
async function flushSessionToKV(kv, sid, buf) {
  return withLock(`s:${sid}`, async () => {
    const key = `s:${sid}`;
    try {
      let existing = [];
      const raw = await kv.get(key);
      if (raw) {
        try { existing = JSON.parse(raw); } catch (e) { /* ignore */ }
      }

      // 去重：只关心与已存最后一条完全相同的重复事件（同 from+pageId+ts）
      let last = existing.length ? existing[existing.length - 1] : null;
      const added = [];
      for (const ev of buf.pending) {
        const same = last && last.p === ev.p && last.fr === ev.fr && last.d === ev.d && last.ts === ev.ts;
        if (same) continue; // 跳过完全重复
        added.push(ev);
        last = ev;
      }
      const appended = added.length > 0;
      existing.push(...added);
      if (existing.length > 500) existing = existing.slice(-500);

      if (appended) await kv.put(key, JSON.stringify(existing));
      buf.lastFlush = Date.now();
      buf.pending = [];

      // 维护总览聚合键（会话摘要 + 汇总指标增量）
      await updateAggOnFlush(kv, sid, existing, added);
    } catch (e) { /* KV 写入失败则不存 */ }
  });
}

// 更新面板总览聚合键：读 agg:dash，把新增事件并入汇总指标，并(新增/更新)该会话摘要后写回
async function updateAggOnFlush(kv, sid, existing, added) {
  try {
    const aggra = await kv.get(AGG_KEY);
    let agg = {};
    try { agg = aggra ? JSON.parse(aggra) : {}; } catch (e) { agg = {}; }
    if (!Array.isArray(agg.s)) agg.s = [];
    if (!agg.v) agg.v = {};
    if (!agg.x) agg.x = {};
    if (!agg.d) agg.d = {};
    if (!agg.f) agg.f = {};

    // 汇总指标：只并入本次新增(added)事件，避免重复累计
    for (const ev of added) {
      if (ev.p) agg.v[ev.p] = (agg.v[ev.p] || 0) + 1;
      if (ev.fr) agg.x[ev.fr] = (agg.x[ev.fr] || 0) + 1;
      if (ev.fr && ev.p) {
        const k = ev.fr + '->' + ev.p;
        agg.f[k] = (agg.f[k] || 0) + 1;
      }
      if (ev.d && ev.fr) {
        if (!Array.isArray(agg.d[ev.fr])) agg.d[ev.fr] = [];
        agg.d[ev.fr].push(ev.d);
        if (agg.d[ev.fr].length > 200) agg.d[ev.fr].shift();
      }
    }

    // 会话摘要：基于 existing 去重窗口重建（幂等）
    const idx = agg.s.findIndex(x => x.id === sid);
    // pageCount：统计 existing（去重截断后的窗口）里的不同页面；窗口内足够近似
    const pages = new Set();
    existing.forEach(e => { if (e && e.p) pages.add(e.p); });
    const entry = {
      id: sid,
      firstTs: existing.length ? existing[0].ts : Date.now(),
      lastTs: existing.length ? existing[existing.length - 1].ts : Date.now(),
      count: existing.length,
      pageCount: pages.size,
      lastPage: existing.length ? existing[existing.length - 1].p || '' : ''
    };
    if (idx >= 0) agg.s[idx] = entry; else agg.s.push(entry);
    await kv.put(AGG_KEY, JSON.stringify(agg));
  } catch (e) { /* 聚合键失败不影响会话明细 */ }
}

// ==================== 历史数据回填（一次性） ====================

// 首次运行后，把老版本写入的聚合键(visit:/exit:/flow:/durations:)与会话明细(s:*)
// 一并并入 agg:dash，保证切换后历史汇总与历史会话仍显示在面板上。
// 用 meta:backfill 标记一次，且仅此 Worker 生命周期内检查一次。
async function ensureBackfill(kv) {
  if (backfillChecked) return;
  backfillChecked = true;
  try {
    const meta = await kv.get(BACKFILL_META);
    if (meta) return;

    let aggra = await kv.get(AGG_KEY);
    let agg = {};
    try { agg = aggra ? JSON.parse(aggra) : {}; } catch (e) { agg = {}; }
    if (!Array.isArray(agg.s)) agg.s = [];
    if (!agg.v) agg.v = {};
    if (!agg.x) agg.x = {};
    if (!agg.d) agg.d = {};
    if (!agg.f) agg.f = {};

    // 1) 合并旧版计数聚合键
    const METRIC_PREFIXES = ['visit:', 'exit:', 'flow:', 'durations:'];
    for (const prefix of METRIC_PREFIXES) {
      let cursor;
      do {
        const page = await kv.list({ prefix, cursor });
        for (const key of page.keys) {
          const name = key.name;
          try {
            if (name.startsWith('visit:')) {
              const p = name.slice('visit:'.length);
              agg.v[p] = (agg.v[p] || 0) + (parseInt(await kv.get(name)) || 0);
            } else if (name.startsWith('exit:')) {
              const p = name.slice('exit:'.length);
              agg.x[p] = (agg.x[p] || 0) + (parseInt(await kv.get(name)) || 0);
            } else if (name.startsWith('flow:')) {
              const p = name.slice('flow:'.length);
              agg.f[p] = (agg.f[p] || 0) + (parseInt(await kv.get(name)) || 0);
            } else if (name.startsWith('durations:')) {
              const p = name.slice('durations:'.length);
              const arr = JSON.parse(await kv.get(name) || '[]');
              if (Array.isArray(arr) && arr.length) agg.d[p] = arr.slice(0, 200);
            }
          } catch (e) { /* 损坏的旧键跳过 */ }
        }
        cursor = page.cursor;
      } while (cursor);
    }

    // 2) 为历史会话明细(s:*)生成摘要，并入会话列表
    let cursor;
    do {
      const page = await kv.list({ prefix: 's:', cursor });
      for (const key of page.keys) {
        const sid = key.name.slice('s:'.length);
        if (!sid) continue;
        // 已有该会话摘要则跳过（说明新代码已管理过）
        if (agg.s.some(x => x.id === sid)) continue;
        try {
          const arr = JSON.parse(await kv.get(key.name) || '[]');
          if (!Array.isArray(arr) || arr.length === 0) continue;
          const pages = new Set();
          arr.forEach(e => { if (e && e.p) pages.add(e.p); });
          agg.s.push({
            id: sid,
            firstTs: arr[0].ts || Date.now(),
            lastTs: arr[arr.length - 1].ts || Date.now(),
            count: arr.length,
            pageCount: pages.size,
            lastPage: arr[arr.length - 1].p || ''
          });
        } catch (e) { /* 损坏的会话键跳过 */ }
      }
      cursor = page.cursor;
    } while (cursor);

    await kv.put(AGG_KEY, JSON.stringify(agg));
    await kv.put(BACKFILL_META, String(Date.now()));
  } catch (e) {
    backfillChecked = false; // 失败则允许下次请求重试
  }
}

// ==================== 仪表盘 ====================

function renderDashboard(counters, sessions, useKV) {
  // 解析计数器
  const visits = {}, exits = {}, durations = {}, flows = {};
  for (const kv of counters) {
    // kv is {key, value} or need to iterate
  }
  for (const [key, value] of counters.entries()) {
    if (key.startsWith('v:')) visits[key.slice(2)] = parseInt(value) || 0;
    else if (key.startsWith('x:')) exits[key.slice(2)] = parseInt(value) || 0;
    else if (key.startsWith('d:')) {
      try {
        const durs = Array.isArray(value) ? value : JSON.parse(value);
        durations[key.slice(2)] = { total: durs.reduce((a,b) => a+b, 0), count: durs.length };
      } catch(e) {}
    }
    else if (key.startsWith('f:')) flows[key.slice(2)] = parseInt(value) || 0;
  }

  // 解析会话（兼容完整数组 与 聚合摘要对象两种形态）
  const sessionList = [];
  for (const [key, events] of Object.entries(sessions)) {
    const sid = key.startsWith('s:') ? key.slice(2) : key;
    if (events && events._agg) {
      // 聚合摘要对象
      sessionList.push({
        sid,
        firstTs: events.ts,
        lastTs: events.ts,
        count: events.count || 0,
        pageCount: events.pageCount || 0,
        lastPage: events.lastPage || '?'
      });
      continue;
    }
    if (!Array.isArray(events) || events.length === 0) continue;
    const pages = new Set();
    let firstTs = events[0].ts;
    let lastTs = events[events.length-1].ts;
    events.forEach(e => { if (e.p) pages.add(e.p); });
    sessionList.push({
      sid,
      firstTs,
      lastTs,
      count: events.length,
      pageCount: pages.size,
      lastPage: events[events.length-1].p || '?'
    });
  }
  sessionList.sort((a, b) => b.lastTs - a.lastTs);

  const sortedVisits = Object.entries(visits).sort((a,b) => b[1]-a[1]);
  const sortedFlows = Object.entries(flows).sort((a,b) => b[1]-a[1]);
  const exitRates = {};
  for (const [page, count] of Object.entries(exits)) {
    exitRates[page] = (visits[page] || 0) > 0 ? Math.round((count / visits[page]) * 100) : 0;
  }
  const sortedExitRates = Object.entries(exitRates).sort((a,b) => b[1]-a[1]);

  const hasData = sortedVisits.length > 0 || sessionList.length > 0;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<title>流星雨的约定 - 玩家分析</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f1a;color:#e0e0e0;padding:24px;min-height:100vh}
h1{font-size:1.5rem;color:#f0c060;margin-bottom:8px}
h2{font-size:1.1rem;color:#c0a0e0;margin:24px 0 12px;border-bottom:1px solid #2a2a3a;padding-bottom:8px}
.card{background:#1a1a2e;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #2a2a3a}
table{width:100%;border-collapse:collapse}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #2a2a3a}
th{color:#888;font-weight:500;font-size:0.85rem}
td{font-size:0.9rem}
.bar{display:inline-block;height:6px;background:#f0c060;border-radius:3px;min-width:2px;vertical-align:middle;margin-left:8px}
.bar.red{background:#e06060}
.bar.purple{background:#c0a0e0}
.num{font-variant-numeric:tabular-nums;color:#f0c060}
.rate{color:#e06060}
.refresh{color:#888;font-size:0.8rem;margin-bottom:8px}
.mode{display:inline-block;padding:2px 10px;border-radius:10px;font-size:0.75rem;margin-bottom:16px;background:#1a3a1a;color:#60e060}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.empty{color:#666;text-align:center;padding:40px}
.sid{font-family:monospace;font-size:0.8rem;color:#888}
.sid a{color:#c0a0e0;text-decoration:none}
.sid a:hover{text-decoration:underline}
@media(max-width:768px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>🌠 流星雨的约定 — 玩家行为分析</h1>
<p class="refresh">刷新页面更新数据 | 玩家数: ${sessionList.length}</p>
<p class="mode">存储: ${useKV ? 'KV持久' : '内存（Worker重启丢失）'}</p>
${!hasData ? '<div class="empty">暂无数据，等待玩家游戏后自动出现</div>' : `
<div class="grid">
<div>
<h2>📊 页面访问量 TOP 15</h2>
<div class="card">
<table>
<tr><th>页面</th><th>访问次数</th></tr>
${sortedVisits.slice(0,15).map(([p,c]) => {
  const max = sortedVisits[0] ? sortedVisits[0][1] : 1;
  return '<tr><td>'+p+'</td><td><span class="num">'+c+'</span><span class="bar" style="width:'+Math.round(c/max*100)+'px"></span></td></tr>';
}).join('')}
</table>
</div>
</div>
<div>
<h2>🚪 流失率最高的页面</h2>
<div class="card">
<table>
<tr><th>页面</th><th>流失率</th><th>离开次数</th></tr>
${sortedExitRates.slice(0,10).map(([p,r]) => {
  const maxR = sortedExitRates[0] ? sortedExitRates[0][1] : 1;
  return '<tr><td>'+p+'</td><td><span class="rate">'+r+'%</span><span class="bar red" style="width:'+Math.round(r/maxR*100)+'px"></span></td><td>'+(exits[p]||0)+'</td></tr>';
}).join('')}
</table>
</div>
</div>
</div>
<h2>⏱️ 平均停留时长</h2>
<div class="card">
<table>
<tr><th>页面</th><th>平均停留（秒）</th><th>样本数</th></tr>
${Object.entries(durations).sort((a,b)=>b[1].total/b[1].count-a[1].total/a[1].count).slice(0,15).map(([p,d])=>{
  return '<tr><td>'+p+'</td><td><span class="num">'+Math.round(d.total/d.count)+'</span>s</td><td>'+d.count+'</td></tr>';
}).join('')||'<tr><td colspan="3">暂无数据</td></tr>'}
</table>
</div>
<h2>🔗 页面跳转路径 TOP 20</h2>
<div class="card">
<table>
<tr><th>跳转路径</th><th>次数</th></tr>
${sortedFlows.slice(0,20).map(([f,c]) => {
  const max = sortedFlows[0] ? sortedFlows[0][1] : 1;
  return '<tr><td>'+f+'</td><td><span class="num">'+c+'</span><span class="bar purple" style="width:'+Math.round(c/max*100)+'px"></span></td></tr>';
}).join('')||'<tr><td colspan="2">暂无数据</td></tr>'}
</table>
</div>
<h2>👤 玩家会话 (${sessionList.length}人)</h2>
<div class="card">
<table>
<tr><th>会话ID</th><th>开始时间</th><th>浏览页数</th><th>事件数</th><th>最后页面</th><th>操作</th></tr>
${sessionList.map(s => {
  const start = new Date(s.firstTs);
  const time = start.getHours().toString().padStart(2,'0')+':'+start.getMinutes().toString().padStart(2,'0');
  const dur = s.lastTs > s.firstTs ? Math.round((s.lastTs - s.firstTs) / 1000) + 's' : '-';
  return '<tr><td class="sid">'+s.sid.slice(0,12)+'</td><td>'+time+' ('+dur+')</td><td>'+s.pageCount+'</td><td>'+s.count+'</td><td>'+s.lastPage+'</td><td><a href="?sid='+s.sid+'">查看详情</a></td></tr>';
}).join('')}
</table>
</div>
`}
</body>
</html>`;
}

// ==================== 会话详情页 ====================

function renderSessionDetail(sid, events) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>会话 ${sid.slice(0,12)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f1a;color:#e0e0e0;padding:24px;min-height:100vh}
h1{font-size:1.3rem;color:#f0c060;margin-bottom:4px}
.back{margin-bottom:16px}
.back a{color:#c0a0e0;text-decoration:none;font-size:0.9rem}
.card{background:#1a1a2e;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #2a2a3a}
table{width:100%;border-collapse:collapse}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #2a2a3a}
th{color:#888;font-weight:500;font-size:0.85rem}
td{font-size:0.9rem}
.num{font-variant-numeric:tabular-nums;color:#f0c060}
.timeline{position:relative;padding-left:24px}
.timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:#2a2a3a}
.tl-item{position:relative;padding:8px 0;padding-left:16px}
.tl-item::before{content:'';position:absolute;left:-20px;top:14px;width:10px;height:10px;border-radius:50%;background:#f0c060}
.tl-time{font-size:0.75rem;color:#888}
.tl-page{color:#f0c060}
.tl-dur{color:#888;font-size:0.85rem}
</style>
</head>
<body>
<div class="back"><a href=".">&larr; 返回总览</a></div>
<h1>👤 会话: ${sid.slice(0,12)}...</h1>
<p style="color:#888;font-size:0.85rem;margin-bottom:16px">${events.length} 个事件</p>

<h2>📋 浏览路径</h2>
<div class="card">
<div class="timeline">
${events.map(e => {
  const t = new Date(e.ts);
  const time = t.getHours().toString().padStart(2,'0')+':'+t.getMinutes().toString().padStart(2,'0')+':'+t.getSeconds().toString().padStart(2,'0');
  if (e.fr && e.p) {
    return '<div class="tl-item"><span class="tl-time">'+time+'</span> <span class="tl-page">'+e.fr+'</span> &rarr; <span class="tl-page">'+e.p+'</span> <span class="tl-dur">('+ (e.d||0) +'s)</span></div>';
  } else if (e.p) {
    return '<div class="tl-item"><span class="tl-time">'+time+'</span> 进入 <span class="tl-page">'+e.p+'</span></div>';
  } else {
    return '<div class="tl-item"><span class="tl-time">'+time+'</span> 离开 <span class="tl-page">'+e.fr+'</span> <span class="tl-dur">('+ e.d +'s)</span></div>';
  }
}).join('')}
</div>
</div>
</body>
</html>`;
}
