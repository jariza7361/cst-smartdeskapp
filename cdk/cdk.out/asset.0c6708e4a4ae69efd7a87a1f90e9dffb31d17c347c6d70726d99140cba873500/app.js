(() => {
  const btn = document.getElementById("btn-fetch-verizon");
  const out = document.getElementById("tests-output");
  const dlg = document.getElementById("tests-modal");
  if (dlg && !dlg.open) { try { dlg.showModal?.(); dlg.close?.(); } catch {}
  }
  if (btn && out) {
    btn.addEventListener("click", async () => {
      try {
        const r = await fetch("/api/fetch");
        out.textContent = JSON.stringify(await r.json(), null, 2);
      } catch { out.textContent = "Fetch failed"; }
    });
  }
  const dz = document.getElementById("dropzone");
  const fi = document.getElementById("file-input");
  const paste = document.getElementById("pastezone");
  if (dz && fi) {
    dz.addEventListener("click", () => fi.click());
    dz.addEventListener("dragover", e => e.preventDefault());
    dz.addEventListener("drop", async e => { e.preventDefault(); if (e.dataTransfer?.files?.length) { const t = await e.dataTransfer.files[0].text(); const o = document.getElementById("extract-output"); if (o) o.textContent = t; } });
    fi.addEventListener("change", async () => { if (fi.files?.length) { const t = await fi.files[0].text(); const o = document.getElementById("extract-output"); if (o) o.textContent = t; } });
  }
})();
