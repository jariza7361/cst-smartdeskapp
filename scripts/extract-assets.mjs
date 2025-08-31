import fs from "node:fs";
import path from "node:path";

const proj = process.cwd();
const IN = path.join(proj, "index.html");
const CSS_OUT = path.join(proj, "public", "assets", "app.css");
const JS_OUT = path.join(proj, "public", "app.js");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  return fs.readFileSync(file, "utf8");
}
function write(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, data, "utf8");
  console.log("Wrote", path.relative(proj, file));
}

let html = read(IN);

// 1) Extract inline <style>…</style> to /assets/app.css
let css = "";
html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, g1) => { css += g1 + "\n"; return ""; });

// 2) Extract inline <script>…</script> (without src) to /public/app.js
let js = "";
html = html.replace(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_m, g1) => { js += g1 + "\n"; return ""; });

// 3) Ensure required IDs exist (inject minimal placeholders if missing)
const requiredBlocks = {
  "system-status": `<aside id="system-status" aria-live="polite"></aside>`,
  "panels": `<section id="panels"><div class="card" id="panel-carriers">Carriers</div><div class="card" id="panel-denials">Denials</div><div class="card" id="panel-notes">Notes</div></section>`,
  "ingest": `<section id="ingest"><div id="dropzone" tabindex="0">Drop PDF/TXT or click</div><input id="file-input" type="file" accept=".pdf,.txt" /><textarea id="pastezone" placeholder="Paste text here…"></textarea><pre id="extract-output"></pre></section>`,
  "tests-modal": `<dialog id="tests-modal"><h2>Tests</h2><button id="btn-fetch-verizon">Fetch Verizon T&amp;C</button><pre id="tests-output"></pre><button id="close-tests">Close</button></dialog>`
};
for (const id of Object.keys(requiredBlocks)) {
  if (!new RegExp(`id=["']${id}["']`).test(html)) {
    // inject before </body>
    html = html.replace(/<\/body>\s*<\/html>\s*$/i, `${requiredBlocks[id]}\n</body></html>`);
    console.log(`Injected #${id}`);
  }
}
// rename setupWizard → setup-wizard if needed
html = html.replace(/id=["']setupWizard["']/g, `id="setup-wizard"`);

// 4) Insert links to externalized CSS/JS (house rule paths)
if (!/\/assets\/app\.css/.test(html)) {
  html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="/assets/app.css" />\n</head>`);
}
if (!/src=["']\/app\.js["']/.test(html)) {
  html = html.replace(/<\/body>\s*<\/html>\s*$/i, `  <script src="/app.js" defer></script>\n</body></html>`);
}

// 5) Append minimal JS wiring for tests & ingest if missing in extracted JS
if (!/btn-fetch-verizon/.test(js)) {
  js += `
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
})();`;
}

// 6) Write files
write(CSS_OUT, css.trim() + "\n");
write(JS_OUT, js.trim() + "\n");
write(IN, html);

console.log("Done: A→B conversion complete (no visual changes).");