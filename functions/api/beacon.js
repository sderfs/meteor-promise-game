// 内存存储（同一 Worker 实例内共享）
let memStore = new Map(); // key -> value (计数器或会话JSON)
let lastFlush = 0;

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

  // POST /api/beacon — 零 KV 操作，只写内存
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const { sid, pageId, from, duration } = data;

      // 1. 聚合计数器（全局统计）
      if (pageId) memStore.set(`v:${pageId}`, (memStore.get(`v:${pageId}`) || 0) + 1);
      if (from) memStore.set(`x:${from}`, (memStore.get(`x:${from}`) || 0) + 1);
      if (duration && from) {
        const key = `d:${from}`;
        const durs = memStore.get(key) || [];
        durs.push(duration);
        if (durs.length > 200) durs.shift();
        memStore.set(key, durs);
      }
      if (from && pageId) memStore.set(`f:${from}->${pageId}`, (memStore.get(`f:${from}->${pageId}`) || 0) + 1);

      // 2. 会话事件（每个玩家的浏览路径）
      if (sid) {
        const sKey = `s:${sid}`;
        const events = memStore.get(sKey) || [];
        const ev = { ts: Date.now() };
        if (pageId) ev.p = pageId;
        if (from) ev.fr = from;
        if (duration) ev.d = duration;
        events.push(ev);
        if (events.length > 500) events.shift();
        memStore.set(sKey, events);
      }

      return new Response('ok', { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response('bad request', { status: 400, headers: corsHeaders });
    }
  }

  // GET /api/beacon — 仪表盘
  if (request.method === 'GET') {
    let kvData = {};

    if (useKV) {
      try {
        const list = await env.ANALYTICS.list();
        for (const key of list.keys) {
          kvData[key.name] = await env.ANALYTICS.get(key.name);
        }
      } catch (e) { /* ignore KV read errors */ }
    }

    // 合并 KV + 内存
    const merged = {};
    for (const [key, value] of [...Object.entries(kvData), ...memStore.entries()]) {
      const existing = merged[key];
      if (existing === undefined) {
        merged[key] = value;
      } else {
        if (key.startsWith('d:')) {
          const a = Array.isArray(existing) ? existing : (() => { try { return JSON.parse(existing); } catch(e) { return []; } })();
          const b = Array.isArray(value) ? value : (() => { try { return JSON.parse(value); } catch(e) { return []; } })();
          merged[key] = [...a, ...b].slice(-200);
        } else if (key.startsWith('s:')) {
          const a = Array.isArray(existing) ? existing : (() => { try { return JSON.parse(existing); } catch(e) { return []; } })();
          const b = Array.isArray(value) ? value : (() => { try { return JSON.parse(value); } catch(e) { return []; } })();
          merged[key] = [...a, ...b].slice(-500);
        } else {
          merged[key] = (parseInt(existing) || 0) + (parseInt(value) || 0);
        }
      }
    }

    // 5分钟批量刷新到 KV
    if (useKV && memStore.size > 0 && (Date.now() - lastFlush > 300000)) {
      lastFlush = Date.now();
      try {
        const promises = [];
        for (const [key, value] of Object.entries(merged)) {
          promises.push(env.ANALYTICS.put(key, typeof value === 'object' ? JSON.stringify(value) : String(value)));
        }
        context.waitUntil(Promise.all(promises));
        memStore = new Map();
      } catch (e) { /* ignore */ }
    }

    const viewSid = url.searchParams.get('sid');
    if (viewSid) {
      const sKey = `s:${viewSid}`;
      const raw = merged[sKey];
      let events = [];
      if (raw) {
        events = Array.isArray(raw) ? raw : (() => { try { return JSON.parse(raw); } catch(e) { return []; } })();
      }
      return new Response(renderSessionDetail(viewSid, events), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
      });
    }

    return new Response(renderDashboard(merged), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  return new Response('Not found', { status: 404 });
}

// ==================== 仪表盘 ====================

function renderDashboard(data) {
  // 聚合统计
  const visits = {}, exits = {}, durations = {}, flows = {};
  const sessions = {}; // sid -> { firstTs, lastTs, eventCount, pages }

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('v:')) visits[key.slice(2)] = parseInt(value) || 0;
    else if (key.startsWith('x:')) exits[key.slice(2)] = parseInt(value) || 0;
    else if (key.startsWith('d:')) {
      try {
        const durs = Array.isArray(value) ? value : JSON.parse(value);
        durations[key.slice(2)] = { total: durs.reduce((a,b) => a+b, 0), count: durs.length };
      } catch(e) {}
    }
    else if (key.startsWith('f:')) flows[key.slice(2)] = parseInt(value) || 0;
    else if (key.startsWith('s:')) {
      try {
        const evts = Array.isArray(value) ? value : JSON.parse(value);
        if (evts.length > 0) {
          const pages = new Set();
          const firstTs = evts[0].ts;
          const lastTs = evts[evts.length - 1].ts;
          evts.forEach(e => { if (e.p) pages.add(e.p); });
          sessions[key.slice(2)] = { firstTs, lastTs, count: evts.length, pageCount: pages.size, lastPage: evts[evts.length-1].p || '?' };
        }
      } catch(e) {}
    }
  }

  const sortedVisits = Object.entries(visits).sort((a,b) => b[1]-a[1]);
  const sortedFlows = Object.entries(flows).sort((a,b) => b[1]-a[1]);
  const sortedSessions = Object.entries(sessions).sort((a,b) => b[1].lastTs - a[1].lastTs);

  const exitRates = {};
  for (const [page, count] of Object.entries(exits)) {
    exitRates[page] = (visits[page] || 0) > 0 ? Math.round((count / visits[page]) * 100) : 0;
  }
  const sortedExitRates = Object.entries(exitRates).sort((a,b) => b[1]-a[1]);

  const hasData = sortedVisits.length > 0;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
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
<p class="refresh">刷新页面更新数据 — 玩家数: ${sortedSessions.length}</p>
${!hasData ? '<div class="empty">暂无数据，等待玩家游戏后自动出现</div>' : `
<div class="grid">
<div>
<h2>📊 页面访问量 TOP 15</h2>
<div class="card">
<table>
<tr><th>页面</th><th>访问次数</th></tr>
${sortedVisits.slice(0,15).map(([p,c]) => {
  const max = sortedVisits[0][1] || 1;
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
<h2>👤 玩家会话 (${sortedSessions.length}人)</h2>
<div class="card">
<table>
<tr><th>会话ID</th><th>开始时间</th><th>浏览页数</th><th>事件数</th><th>最后页面</th><th>操作</th></tr>
${sortedSessions.map(([sid, s]) => {
  const start = new Date(s.firstTs);
  const time = start.getHours().toString().padStart(2,'0')+':'+start.getMinutes().toString().padStart(2,'0')+':'+start.getSeconds().toString().padStart(2,'0');
  const dur = s.lastTs > s.firstTs ? Math.round((s.lastTs - s.firstTs) / 1000) + 's' : '-';
  return '<tr><td class="sid">'+sid.slice(0,12)+'</td><td>'+time+' ('+dur+')</td><td>'+s.pageCount+'</td><td>'+s.count+'</td><td>'+s.lastPage+'</td><td><a href="?sid='+sid+'">查看详情</a></td></tr>';
}).join('')}
</table>
</div>
`}
</body>
</html>`;
}

// ==================== 会话详情页 ====================

function renderSessionDetail(sid, events) {
  const pages = [];
  events.forEach(e => {
    if (e.p && (pages.length === 0 || pages[pages.length-1].p !== e.p)) {
      pages.push({ p: e.p, ts: e.ts });
    }
    if (e.fr && e.p && (pages.length === 0 || pages[pages.length-1].p !== e.p)) {
      // back navigation: the fr is the page we came from
    }
  });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>会话 ${sid.slice(0,12)} - 玩家分析</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f1a;color:#e0e0e0;padding:24px;min-height:100vh}
h1{font-size:1.3rem;color:#f0c060;margin-bottom:4px}
h2{font-size:1.1rem;color:#c0a0e0;margin:24px 0 12px;border-bottom:1px solid #2a2a3a;padding-bottom:8px}
.back{margin-bottom:16px}
.back a{color:#c0a0e0;text-decoration:none;font-size:0.9rem}
.back a:hover{text-decoration:underline}
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
.tl-item.enter::before{background:#60e060}
.tl-item.exit::before{background:#e06060}
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
${events.map((e, i) => {
  const t = new Date(e.ts);
  const time = t.getHours().toString().padStart(2,'0')+':'+t.getMinutes().toString().padStart(2,'0')+':'+t.getSeconds().toString().padStart(2,'0');
  if (e.fr && e.p) {
    return '<div class="tl-item"><span class="tl-time">'+time+'</span> <span class="tl-page">'+e.fr+'</span> &rarr; <span class="tl-page">'+e.p+'</span> <span class="tl-dur">('+ (e.d||0) +'s)</span></div>';
  } else if (e.p) {
    return '<div class="tl-item enter"><span class="tl-time">'+time+'</span> 进入 <span class="tl-page">'+e.p+'</span></div>';
  } else if (e.fr && e.d) {
    return '<div class="tl-item exit"><span class="tl-time">'+time+'</span> 离开 <span class="tl-page">'+e.fr+'</span> <span class="tl-dur">('+ e.d +'s)</span></div>';
  } else {
    return '<div class="tl-item"><span class="tl-time">'+time+'</span> '+JSON.stringify(e)+'</div>';
  }
}).join('')}
</div>
</div>

<h2>📊 页面停留统计</h2>
<div class="card">
<table>
<tr><th>页面</th><th>访问次数</th><th>总停留</th></tr>
${(() => {
  const pageStats = {};
  events.forEach(e => {
    if (e.p) {
      if (!pageStats[e.p]) pageStats[e.p] = { count: 0, totalDur: 0 };
      pageStats[e.p].count++;
    }
    if (e.fr && e.d) {
      if (!pageStats[e.fr]) pageStats[e.fr] = { count: 0, totalDur: 0 };
      pageStats[e.fr].totalDur += e.d;
    }
  });
  return Object.entries(pageStats).sort((a,b) => b[1].count - a[1].count).map(([p,s]) => {
    return '<tr><td>'+p+'</td><td><span class="num">'+s.count+'</span></td><td>'+s.totalDur+'s</td></tr>';
  }).join('') || '<tr><td colspan="3">暂无</td></tr>';
})()}
</table>
</div>
</body>
</html>`;
}