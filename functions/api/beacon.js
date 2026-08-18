// 内存计数器（全局聚合，允许丢失）
let memCounters = new Map();

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

      // 按 sid 分组
      const bySid = {};
      for (const ev of events) {
        const { sid, pageId, from, duration } = ev;
        if (!sid) continue;

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

        // 分组会话事件
        if (!bySid[sid]) bySid[sid] = [];
        bySid[sid].push({ ts: ev.ts || Date.now(), p: pageId || '', fr: from || '', d: duration || 0 });
      }

      // 写入 KV（每个会话一次读+一次写）
      if (useKV) {
        const promises = [];
        for (const [sid, evts] of Object.entries(bySid)) {
          promises.push(appendSessionToKV(env.ANALYTICS, sid, evts));
        }
        // 不阻塞响应
        context.waitUntil(Promise.all(promises));
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
    if (useKV) {
      try {
        const list = await env.ANALYTICS.list({ prefix: 's:' });
        for (const key of list.keys) {
          try {
            sessionData[key.name] = JSON.parse(await env.ANALYTICS.get(key.name));
          } catch (e) { /* skip corrupt entries */ }
        }
      } catch (e) { /* ignore KV errors */ }
    }

    return new Response(renderDashboard(memCounters, sessionData, !!useKV), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  return new Response('Not found', { status: 404 });
}

async function appendSessionToKV(kv, sid, events) {
  const key = `s:${sid}`;
  try {
    let existing = [];
    const raw = await kv.get(key);
    if (raw) {
      try { existing = JSON.parse(raw); } catch (e) { /* ignore */ }
    }
    existing.push(...events);
    if (existing.length > 500) existing = existing.slice(-500);
    await kv.put(key, JSON.stringify(existing));
  } catch (e) { /* KV 写入失败则不存 */ }
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

  // 解析会话
  const sessionList = [];
  for (const [key, events] of Object.entries(sessions)) {
    const sid = key.startsWith('s:') ? key.slice(2) : key;
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