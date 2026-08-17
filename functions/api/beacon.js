let memStore = new Map();

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

  // POST /api/beacon
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const { pageId, from, duration } = data;

      if (useKV) {
        if (pageId) await incrementKV(env.ANALYTICS, `visit:${pageId}`);
        if (from) await incrementKV(env.ANALYTICS, `exit:${from}`);
        if (duration && from) await appendDurationKV(env.ANALYTICS, from, duration);
        if (from && pageId) await incrementKV(env.ANALYTICS, `flow:${from}->${pageId}`);
      } else {
        if (pageId) memStore.set(`visit:${pageId}`, (memStore.get(`visit:${pageId}`) || 0) + 1);
        if (from) memStore.set(`exit:${from}`, (memStore.get(`exit:${from}`) || 0) + 1);
        if (duration && from) {
          const key = `durations:${from}`;
          const durs = memStore.get(key) || [];
          durs.push(duration);
          if (durs.length > 200) durs.shift();
          memStore.set(key, durs);
        }
        if (from && pageId) memStore.set(`flow:${from}->${pageId}`, (memStore.get(`flow:${from}->${pageId}`) || 0) + 1);
      }

      return new Response('ok', { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response('bad request: ' + e.message, { status: 400, headers: corsHeaders });
    }
  }

  // GET /api/beacon
  if (request.method === 'GET') {
    let stats = {};

    if (useKV) {
      const list = await env.ANALYTICS.list();
      for (const key of list.keys) {
        stats[key.name] = await env.ANALYTICS.get(key.name);
      }
    } else {
      stats = Object.fromEntries(memStore);
    }

    const debug = url.searchParams.get('debug') === '1';
    const storageMode = useKV ? 'KV 持久存储' : '内存存储（Worker 重启后清空）';
    return new Response(renderDashboard(stats, storageMode, debug), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html;charset=utf-8' }
    });
  }

  return new Response('Not found', { status: 404 });
}

async function incrementKV(kv, key) {
  const current = await kv.get(key);
  await kv.put(key, String(parseInt(current || '0') + 1));
}

async function appendDurationKV(kv, pageId, duration) {
  const key = `durations:${pageId}`;
  let durs = [];
  try {
    durs = JSON.parse(await kv.get(key) || '[]');
  } catch (e) { /* ignore */ }
  durs.push(duration);
  if (durs.length > 200) durs.shift();
  await kv.put(key, JSON.stringify(durs));
}

function renderDashboard(stats, storageMode, debug) {
  const visits = {};
  const exits = {};
  const durations = {};
  const flows = {};

  for (const [key, value] of Object.entries(stats)) {
    if (key.startsWith('visit:')) {
      visits[key.replace('visit:', '')] = parseInt(value);
    } else if (key.startsWith('exit:')) {
      exits[key.replace('exit:', '')] = parseInt(value);
    } else if (key.startsWith('durations:')) {
      try {
        const durs = Array.isArray(value) ? value : JSON.parse(value);
        const avg = durs.length ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length) : 0;
        durations[key.replace('durations:', '')] = { avg, count: durs.length };
      } catch (e) { /* ignore */ }
    } else if (key.startsWith('flow:')) {
      flows[key.replace('flow:', '')] = parseInt(value);
    }
  }

  const sortedVisits = Object.entries(visits).sort((a, b) => b[1] - a[1]);
  const sortedExits = Object.entries(exits).sort((a, b) => b[1] - a[1]);
  const sortedFlows = Object.entries(flows).sort((a, b) => b[1] - a[1]);

  const exitRates = {};
  for (const [page, count] of Object.entries(exits)) {
    const totalVisits = visits[page] || 0;
    exitRates[page] = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
  }
  const sortedExitRates = Object.entries(exitRates).sort((a, b) => b[1] - a[1]);

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
.mode{display:inline-block;padding:2px 10px;border-radius:10px;font-size:0.75rem;margin-bottom:16px}
.mode.kv{background:#1a3a1a;color:#60e060}
.mode.mem{background:#3a2a1a;color:#f0a060}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.empty{color:#666;text-align:center;padding:40px}
@media(max-width:768px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>🌠 流星雨的约定 — 玩家行为分析</h1>
<p class="refresh">刷新页面更新数据</p>
<p class="mode ${storageMode.includes('KV') ? 'kv' : 'mem'}">存储模式: ${storageMode}</p>
${!hasData ? '<div class="empty">暂无数据，等待玩家游戏后自动出现</div>' : `
<div class="grid">
<div>
<h2>📊 页面访问量 TOP 15</h2>
<div class="card">
<table>
<tr><th>页面</th><th>访问次数</th></tr>
${sortedVisits.slice(0, 15).map(([page, count]) => {
  const max = sortedVisits[0] ? sortedVisits[0][1] : 1;
  const w = Math.round((count / max) * 100);
  return `<tr><td>${page}</td><td><span class="num">${count}</span><span class="bar" style="width:${w}px"></span></td></tr>`;
}).join('')}
</table>
</div>
</div>
<div>
<h2>🚪 流失率最高的页面</h2>
<div class="card">
<table>
<tr><th>页面</th><th>流失率</th><th>离开次数</th></tr>
${sortedExitRates.slice(0, 10).map(([page, rate]) => {
  const maxRate = sortedExitRates[0] ? sortedExitRates[0][1] : 1;
  const w = Math.round((rate / maxRate) * 100);
  return `<tr><td>${page}</td><td><span class="rate">${rate}%</span><span class="bar red" style="width:${w}px"></span></td><td>${exits[page]}</td></tr>`;
}).join('')}
</table>
</div>
</div>
</div>
<h2>⏱️ 平均停留时长</h2>
<div class="card">
<table>
<tr><th>页面</th><th>平均停留（秒）</th><th>样本数</th></tr>
${Object.entries(durations).sort((a, b) => b[1].avg - a[1].avg).slice(0, 15).map(([page, d]) => {
  return `<tr><td>${page}</td><td><span class="num">${d.avg}</span>s</td><td>${d.count}</td></tr>`;
}).join('') || '<tr><td colspan="3">暂无数据</td></tr>'}
</table>
</div>
<h2>🔗 页面跳转路径 TOP 20</h2>
<div class="card">
<table>
<tr><th>跳转路径</th><th>次数</th></tr>
${sortedFlows.slice(0, 20).map(([flow, count]) => {
  const max = sortedFlows[0] ? sortedFlows[0][1] : 1;
  const w = Math.round((count / max) * 100);
  return `<tr><td>${flow}</td><td><span class="num">${count}</span><span class="bar purple" style="width:${w}px"></span></td></tr>`;
}).join('') || '<tr><td colspan="2">暂无数据</td></tr>'}
</table>
</div>
`}
</body>
</html>`;
}
