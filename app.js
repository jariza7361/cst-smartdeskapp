// Minimal CST SmartDesk shell (no frameworks)
// Safe styles are injected; CSP allows 'unsafe-inline' for style only.

(function () {
  const css = `
    :root{
      --bg:#0d0d0f; --ink:#e8ecf5; --muted:#a9b0bd;
      --panel:#171722; --border:#2b2b3a; --accent:#6f4bd8;
      --ok:#00d48a; --warn:#ffb020; --danger:#ff5d5d;
    }
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;background:var(--bg);color:var(--ink);
      font:15px/1.4 system-ui,-apple-system,Segoe UI,Arial,sans-serif;}
    .top{height:56px;display:flex;align-items:center;justify-content:space-between;
      padding:0 14px;border-bottom:1px solid var(--border);background:#12121a;}
    .brand{display:flex;gap:10px;align-items:center}
    .logo{width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#6f4bd8,#9245ff)}
    .pill{border:1px solid var(--border);background:#1e1e2f;border-radius:999px;padding:6px 10px}
    main{padding:16px}
    .tile{display:block;background:#25253a;border:1px solid var(--border);border-radius:14px;
      padding:14px;max-width:720px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .muted{color:var(--muted)}
    button{background:var(--accent);color:#fff;border:0;border-radius:10px;padding:8px 12px;cursor:pointer}
    pre{white-space:pre-wrap}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="top">
      <div class="brand"><div class="logo"></div><strong>CST SmartDesk</strong></div>
      <div class="pill" id="lang-pill">EN / ES</div>
    </header>
    <main>
      <section class="tile">
        <h2 style="margin:0 0 6px">It’s alive 🎉</h2>
        <p class="muted">Static shell deployed. API route test below.</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="ping">Ping API</button>
          <button id="audit">Deep Audit</button>
        </div>
        <pre id="out" class="muted" style="margin-top:10px">Ready…</pre>
      </section>
    </main>
  `;

  document.getElementById('ping').onclick = async () => {
    try {
      const r = await fetch('/api/copilot', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ ping: 'hello' }) });
      const j = await r.json();
      document.getElementById('out').textContent = JSON.stringify(j, null, 2);
    } catch (e) {
      document.getElementById('out').textContent = 'API error: '+ e.message;
    }
  };

  document.getElementById('audit').onclick = () => {
    const issues = [];
    const htmlEnds = document.documentElement.outerHTML.trim().toLowerCase().endsWith('</html>');
    if (!htmlEnds) issues.push('Missing </html> end tag');
    if (!('fetch' in window)) issues.push('fetch API unavailable');
    const out = issues.length ? `⚠ Found ${issues.length} issue(s):\n- ${issues.join('\n- ')}` : '✅ Deep Audit: OK';
    document.getElementById('out').textContent = out;
  };
})();
