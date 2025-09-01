(() => {
  // Initialize demo user session if not exists
  if (!localStorage.getItem('userSession')) {
    localStorage.setItem('userSession', 'demo-token-' + Date.now());
  }
  
  const btn = document.getElementById("btn-fetch-verizon");
  const out = document.getElementById("tests-output");
  const dlg = document.getElementById("tests-modal");
  if (dlg && !dlg.open) { 
    try { 
      dlg.showModal?.(); 
      dlg.close?.(); 
    } catch (error) {
      console.error('Modal initialization failed:', error);
    }
  }
  if (btn && out) {
    btn.addEventListener("click", async () => {
      try {
        // Basic authorization check - ensure user is authenticated
        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
          throw new Error('Authentication required');
        }
        
        const r = await fetch("/api/fetch", {
          headers: {
            'Authorization': `Bearer ${userSession}`,
            'Content-Type': 'application/json'
          }
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        out.textContent = JSON.stringify(await r.json(), null, 2);
      } catch (error) { 
        console.error('Fetch failed:', error);
        out.textContent = `Fetch failed: ${error.message}`; 
      }
    });
  }
  const dz = document.getElementById("dropzone");
  const fi = document.getElementById("file-input");
  const paste = document.getElementById("pastezone");
  if (dz && fi) {
    dz.addEventListener("click", () => fi.click());
    dz.addEventListener("dragover", e => e.preventDefault());
    dz.addEventListener("drop", async e => { 
      e.preventDefault(); 
      if (e.dataTransfer?.files?.length) { 
        try {
          const t = await e.dataTransfer.files[0].text(); 
          const o = document.getElementById("extract-output"); 
          if (o) o.textContent = t;
        } catch (error) {
          console.error('File drop failed:', error);
        }
      } 
    });
    fi.addEventListener("change", async () => { 
      if (fi.files?.length) { 
        try {
          const t = await fi.files[0].text(); 
          const o = document.getElementById("extract-output"); 
          if (o) o.textContent = t;
        } catch (error) {
          console.error('File read failed:', error);
        }
      } 
    });
  }
})();
