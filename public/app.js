// public/app.js — boot + quick “fetch T&C” test UI
(function () {
  console.log("CST SmartDesk app boot");

  // --- Ensure a status panel exists
  var status = document.getElementById('qaLog');
  if (!status) {
    status = document.createElement('pre');
    status.id = 'qaLog';
    status.style.position = 'fixed';
    status.style.left = '12px';
    status.style.bottom = '12px';
    status.style.maxWidth = '92vw';
    status.style.maxHeight = '35vh';
    status.style.overflow = 'auto';
    status.style.padding = '10px';
    status.style.border = '1px solid #26314d';
    status.style.borderRadius = '10px';
    status.style.background = '#0f172a';
    status.style.color = '#e6eaff';
    status.style.zIndex = 9999;
    document.body.appendChild(status);
  }
  function log(line) {
    status.textContent = (line + "\n" + (status.textContent || "")).slice(0, 4000);
  }
  status.textContent = "Status: Ready (app.js loaded)";

  // --- Add a small test button to call /api/fetch for the Verizon PDF
  var panel = document.getElementById('cst-mini-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'cst-mini-panel';
    panel.style.position = 'fixed';
    panel.style.right = '12px';
    panel.style.bottom = '12px';
    panel.style.display = 'flex';
    panel.style.gap = '8px';
    panel.style.zIndex = 9999;
    document.body.appendChild(panel);

    var btn = document.createElement('button');
    btn.textContent = 'Test Verizon T&C';
    btn.style.padding = '8px 10px';
    btn.style.borderRadius = '10px';
    btn.style.border = '1px solid #26314d';
    btn.style.background = '#1e293b';
    btn.style.color = '#e6eaff';
    btn.style.cursor = 'pointer';
    btn.onclick = async function () {
      const url = 'https://www.asurion.com/pdf/nw-consumer-vmp-25/';
      log('Testing fetch: ' + url);
      try {
        const res = await fetch('/api/fetch?url=' + encodeURIComponent(url));
        const data = await res.json();
        log('Result: ' + JSON.stringify(data, null, 2));
        if (!data.ok) {
          log('NOTE: If contentType is text/html, the URL might redirect to a landing page.');
        }
      } catch (e) {
        log('Error: ' + e.message);
      }
    };
    panel.appendChild(btn);
  }

  // --- (Optional) Replace sidebar carrier labels with clean names (no emojis)
  try {
    document.querySelectorAll('.sidebar .nav li[data-open^="carrier:"]').forEach(li => {
      const key = li.getAttribute('data-open'); // e.g., "carrier:VZW"
      const map = { 'carrier:VZW':'Verizon', 'carrier:ATT':'AT&T', 'carrier:CRK':'Cricket',
                    'carrier:LIB':'Liberty', 'carrier:USC':'US Cellular',
                    'carrier:COX':'Cox', 'carrier:OPT':'Optimum', 'carrier:CSC':'Consumer Cellular' };
      if (map[key]) li.textContent = map[key];
    });
  } catch(_) {}
})();