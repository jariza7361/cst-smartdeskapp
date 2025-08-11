// public/app.js — baseline boot + status panel + setup + test fetch
(function () {
  console.log("CST SmartDesk app boot");

  // ----- status panel
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
    status.style.color = '#e6e6ff';
    status.style.zIndex = 9999;
    document.body.appendChild(status);
  }
  function log(line){ status.textContent = (line + "\n" + (status.textContent || "")).slice(0, 6000); }
  log("Status: Ready (app.js loaded)");

  // ----- setup dialog
  var dlg = document.getElementById('setupDialog');
  var openBtn = document.getElementById('openSetup');
  if (dlg && openBtn) {
    openBtn.addEventListener('click', () => dlg.showModal());
    var save = document.getElementById('saveProfile');
    if (save) {
      save.addEventListener('click', (e) => {
        // very light persistence
        var profile = {
          first: document.getElementById('f_first').value.trim(),
          last:  document.getElementById('f_last').value.trim(),
          id:    document.getElementById('f_id').value.trim(),
          ext:   document.getElementById('f_ext').value.trim()
        };
        if (!profile.first || !profile.last || !profile.id || !profile.ext) {
          e.preventDefault();
          log("Setup: please complete all fields.");
          return;
        }
        localStorage.setItem('cst_profile', JSON.stringify(profile));
        var wn = document.getElementById('welcomeName');
        if (wn) wn.textContent = ", " + profile.first;
        log("Setup: profile saved.");
      });
    }
    // auto-open once if no profile
    try {
      if (!localStorage.getItem('cst_profile')) dlg.showModal();
    } catch(_){}
  }

  // ----- mini tester: Verizon T&C
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
    btn.style.color = '#e6e6ff';
    btn.style.cursor = 'pointer';
    btn.onclick = async function () {
      const url = 'https://www.asurion.com/pdf/nw-consumer-vmp-25/';
      log('Testing fetch: ' + url);
      try {
        const res = await fetch('/api/fetch?url=' + encodeURIComponent(url));
        const data = await res.json();
        log('Result:\n' + JSON.stringify(data, null, 2));
        if (!data.ok) log('Note: If contentType is text/html, upstream might be a landing or redirect.');
      } catch (e) {
        log('Error: ' + e.message);
      }
    };
    panel.appendChild(btn);
  }

  // ----- carriers click (future hook)
  document.querySelectorAll('#carrierNav [data-open]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.getAttribute('data-open');
      log('Open: ' + key);
    });
  });
})();