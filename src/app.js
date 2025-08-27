import { createI18n } from './utils/i18n.js';
import { buildPrompt } from './utils/copilot.js';
import { parseText } from './utils/parser.js'; // keep if you use it elsewhere
// T11: theme + splash + clickability enhancements

const state = {
  settings: null,
  i18n: null,
  cspViolations: [],
  lastFetchRun: null,
  copilotSamples: [],
  copilotReachable: null,
  splashShown: false,
  lang: 'en',
  redirectTo: null,
  engine: localStorage.getItem('cst_engine') || 'templates', // 'templates' | 'local-llm'
  jsErrors: [],
};
let splashMsgTimer = null;
let splashAnimDone = false;
let splashAssetsDone = false;
let splashPct = 0;
let splashPctTimer = null;
let splashKeyHandler = null;

// Global error capture (helps diagnose production issues)
try {
  const pushErr = (msg) => {
    try {
      state.jsErrors = state.jsErrors || [];
      if (msg && state.jsErrors[0] !== msg) {
        state.jsErrors.unshift(String(msg));
        state.jsErrors = state.jsErrors.slice(0, 5);
      }
      // reflect in status when available
      try { renderStatus(); } catch { /* noop */ }
    } catch { /* noop */ }
  };
  window.addEventListener('error', (e) => {
    const m = e?.error?.message || e?.message || 'Unknown error';
    pushErr('Error: ' + m);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason;
    const m = (reason && (reason.message || reason.toString?.())) || 'Unhandled rejection';
    pushErr('Promise: ' + m);
  });
} catch { /* noop */ }

// Detect if running under automation (e.g., Playwright)
function isAutomation() {
  try {
    return !!(typeof navigator !== 'undefined' && 'webdriver' in navigator && navigator.webdriver);
  } catch {
    return false;
  }
}

// Copilot engine toggle (console-friendly)
function setEngine(v) {
  state.engine = v;
  localStorage.setItem('cst_engine', v);
  showToast('Engine: ' + v);
}
// expose for console usage
try {
  window.setEngine = setEngine;
} catch {
  /* ignore */
}

async function localLLM(prompt) {
  // Placeholder offline path: returns templated draft. Future: load WebGPU/WASM model locally.
  return `[LOCAL ENGINE]\n\n` + String(prompt || '') + `\n\n(Template assist applied.)`;
}

// Ensure the Copilot select always has at least one option
function ensureCopilotSeed(lang) {
  const sel = document.querySelector('#copilotSample');
  if (!sel) return;
  if (!sel.options || sel.options.length === 0) {
    const o = document.createElement('option');
    o.value = 'serve_solve_sell';
    const labels = {
      en: 'Serve / Solve / Sell (starter)',
      es: 'Atender / Resolver / Ofrecer (inicio)',
    };
    o.textContent = labels[lang] || labels.en;
    o.setAttribute(
      'data-prompt',
      'Follow Observe-AI style. In English and Spanish, write a concise, professional response that (1) serves: acknowledge & empathize, (2) solves: steps, checks, policy guardrails, (3) sells: set expectation, optional upsell or value reinforcement. Ask a confirm-at-end question. If the user pasted context, adapt to it.',
    );
    sel.appendChild(o);
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  // Admin gate: set localStorage.cst_admin = '1' to enable admin-only UI/actions
  // Detect Codex mode (env flag, query param, or local setting)
  let CODEX = false;
  try {
    // Vite exposes import.meta.env at runtime
    CODEX = !!(import.meta && import.meta.env && import.meta.env.VITE_CODEX === '1');
  } catch {
    // ignore
  }
  if (!CODEX) {
    const qp = new URLSearchParams(location.search).get('codex');
    CODEX = qp === '1' || localStorage.getItem('codexMode') === '1';
  }
  if (CODEX) document.documentElement.classList.add('codex');
  // Compute redirect target early
  state.redirectTo = getRedirectTarget();
  // In automation, suppress unhandled promise rejections to avoid debugger pauses
  try {
    if (typeof isAutomation === 'function' && isAutomation()) {
      window.addEventListener('unhandledrejection', (e) => { e.preventDefault?.(); }, { capture: true });
    }
  } catch { /* noop */ }
  // language
  const lang = localStorage.getItem('lang') || 'en';
  state.i18n = await createI18n(lang);
  state.lang = lang;
  // localize static title immediately
  localizeStatic();
  // splash behavior: first visit auto; button to re-open
  // In automation, skip splash to keep tests stable
  let firstVisit;
  try {
    if (typeof isAutomation === 'function' && isAutomation()) {
      localStorage.setItem('welcomeSeen', '1');
      firstVisit = false;
    } else {
      firstVisit = CODEX || localStorage.getItem('welcomeSeen') !== '1';
    }
  } catch {
    firstVisit = CODEX || localStorage.getItem('welcomeSeen') !== '1';
  }
  const btnShow = document.getElementById('showWelcome');
  if (btnShow) btnShow.addEventListener('click', () => forceShowSplash());
  const btnStart = document.getElementById('splashStart');
  if (btnStart)
    btnStart.addEventListener('click', () => {
      localStorage.setItem('welcomeSeen', '1');
      hideSplash();
    });
  const btnDismiss = document.getElementById('splashDismiss');
  if (btnDismiss)
    btnDismiss.addEventListener('click', () => {
      localStorage.setItem('welcomeSeen', '1');
      hideSplash();
    });
  if (firstVisit) {
    showSplash();
  } else if (state.redirectTo) {
    // No splash: redirect after initial paint
    setTimeout(() => safeRedirect(state.redirectTo), 80);
  }

  // Keep header always clickable over any decorative layers
  const top = document.querySelector('header.topbar');
  if (top) top.style.zIndex = '20';

  // Sidebar tabs: fast, accessible switching
  try {
    const tabsWrap = document.querySelector('#sidebar .tabs');
    const tabs = tabsWrap ? Array.from(tabsWrap.querySelectorAll('[role="tab"]')) : [];
    const panels = Array.from(document.querySelectorAll('#sidebar .side-panel'));
    const select = (name) => {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
      panels.forEach((p) => {
        p.hidden = p.getAttribute('data-panel') !== name;
      });
    };
    tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab)));
    // Ensure initial selection
    if (tabs.length) select(tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.tab || 'carriers');
  } catch { /* noop */ }

  // theme + listeners... Use saved theme if available else light for Codex, dark otherwise
  try {
    const saved = (JSON.parse(localStorage.getItem('cst.settings')||'{}')||{}).theme;
    applyTheme(saved || (CODEX ? 'light' : 'dark'));
  } catch { applyTheme(CODEX ? 'light' : 'dark'); }
  document.getElementById('themeToggle')?.addEventListener('click', cycleTheme);
  document.getElementById('openSettingsTop')?.addEventListener('click', () => openModal('settings'));
  document.getElementById('openCopilotBtn')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-copilot');
    if (modal) openCopilotModal();
  });
  document.getElementById('langToggle').addEventListener('click', toggleLang);
  // Help menu wiring
  const helpBtn = document.getElementById('helpMenuBtn');
  const helpMenu = document.getElementById('helpMenu');
  const helpWrap = document.getElementById('helpMenuWrap');
  const helpWelcome = document.getElementById('helpWelcomeItem');
  if (helpBtn && helpMenu) {
    let open = false;
    const setOpen = (v)=>{ open = v; helpMenu.style.display = v ? 'block' : 'none'; };
    helpBtn.addEventListener('click', (e)=>{ e.stopPropagation(); setOpen(!open); });
    document.addEventListener('click', (e)=>{
      if (!open) return;
      if (helpWrap && helpWrap.contains(e.target)) return;
      setOpen(false);
    });
  }
  if (helpWelcome) {
    helpWelcome.addEventListener('click', ()=>{
      try { ensureWelcomeModal(); renderWelcomeModal(); showWelcomeModal(); } catch { /* noop */ }
      const helpMenu = document.getElementById('helpMenu'); if (helpMenu) helpMenu.style.display = 'none';
    });
  }

  // setup wizard
  const wiz = document.getElementById('setupWizard');
  const btnOpenSettings = document.getElementById('openSettings');
  if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => openModal('settings'));
  document.getElementById('wizardSave').addEventListener('click', onSaveWizard);
  state.settings = loadSettings();

  // tests modal
  const testsModal = document.getElementById('testsModal');
  const btnOpenTests = document.getElementById('openTests');
  if (btnOpenTests) btnOpenTests.addEventListener('click', () => openModal('tests'));
  document.getElementById('testsClose').addEventListener('click', () => testsModal.close());
  document.getElementById('testsFetchBtn').addEventListener('click', runFetchTest);
  // Tests: wire Doctor and OCR status badge
  document.getElementById('t_run_doctor')?.addEventListener('click', runDoctorTest);
  // Tests: UI audit + splash diagnostics
  document.getElementById('t_run_ui_audit')?.addEventListener('click', runUiTextAudit);
  document.getElementById('t_run_splash_diag')?.addEventListener('click', runSplashDiagnostics);
  checkOCRStatus();

  // denials modal
  const denialsModal = document.getElementById('denialsModal');
  const denialsClose = document.getElementById('denialsClose');
  if (denialsClose) denialsClose.addEventListener('click', () => denialsModal?.close());

  // carrier modal close
  const carrierModal = document.getElementById('carrierModal');
  const carrierClose = document.getElementById('carrierClose');
  if (carrierClose) carrierClose.addEventListener('click', () => carrierModal?.close());

  // Load copilot prompts (best-effort), then seed if none
  try {
    state.copilotSamples = await fetch('/copilot-prompts.json').then((r) => (r.ok ? r.json() : []));
  } catch {
    state.copilotSamples = [];
  }
  initCopilot();
  renderCopilotUI();
  ensureCopilotSeed(state.lang);
  checkCopilot();

  // drag & drop / paste
  const dz = document.getElementById('dropzone');
  dz.addEventListener('dragover', (e) => {
    e.preventDefault();
    dz.classList.add('hover');
  });
  dz.addEventListener('dragleave', () => dz.classList.remove('hover'));
  dz.addEventListener('drop', onDrop);
  document.addEventListener('paste', onPaste);

  // CSP violations
  window.addEventListener('securitypolicyviolation', (e) => {
    const blocked = e.blockedURI || '';
    // Ignore non-actionable CSP noise (Vercel Live helper + inline style attributes)
    if (blocked.includes('vercel.live')) return;
    if (e.violatedDirective === 'style-src-attr') return;
    state.cspViolations.push(`${e.violatedDirective} @ ${blocked || 'inline'}`);
    renderStatus();
  });

  // first render
  renderStatus();
  run4PointUrlTest();
  // initial highlights load
  loadHighlights();

  // Lightweight QA probes (console-only)
  runQA();
  // Contrast QA: auto-enable high-contrast if needed
  ensureContrast();

  // Wire global search dropdown (grouped: quick actions + next suggestions)
  try { wireTopSearch(); } catch { /* noop */ }

  // Sidebar: handle [data-open] clicks (carriers, tools, products)
  document.addEventListener('click', (ev) => {
    const el = ev.target?.closest?.('[data-open]');
    if (!el) return;
    const key = el.getAttribute('data-open');
    if (!key) return;
    // Known quick actions
  if (key === 'tests') return openModal('tests');
    if (key === 'tools:denials') {
      openDenials();
      return;
    }
    if (key === 'settings') return openModal('settings');
    if (key === 'tools:copilot') {
      const modal = document.getElementById('modal-copilot');
      if (modal) {
        openCopilotModal();
        return;
      }
      const sec = document.getElementById('copilotSection');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // Carriers (USA/Canada)
    if (key.startsWith('carrier:')) {
      const carrier = key.split(':')[1];
      openCarrier(carrier);
      return;
    }
    const toolMap = {
      'tools:rpfr': 'RPFR / PFR',
      'tools:fmip': 'FMIP Script',
      'tools:denials': 'Denials',
      'tools:affidavits': 'Affidavits',
      'tools:byod': 'BYOD Premium Check',
      'tools:smartdrop': 'SmartDrop (OCR)',
      // compatibility if a plain key is used in markup
      smartdrop: 'SmartDrop (OCR)'
    };
    const productMap = {
      'product:UBIF': 'uBreakiFix',
      'product:RSG': 'Repair Service Group',
      'product:HOMEPLUS': 'Asurion Home+',
      'product:APPLIANCEPLUS': 'Asurion Appliance+',
      'product:VZ_HDP': 'Verizon Home Device Protect',
      'product:ATT_HTP': 'AT&T Home Tech Protection',
    };
    if (toolMap[key]) {
      if (key === 'tools:smartdrop' || key === 'smartdrop') {
        openSmartDrop();
      } else {
        logQA(`Tool open → ${toolMap[key]} (TODO: modal/panel)`);
        showToast(toolMap[key]);
      }
      return;
    }
    if (productMap[key]) {
      logQA(`Product panel open → ${productMap[key]} (TODO)`);
      showToast(productMap[key]);
    }
  });
});

// --- Top search (grouped suggestions) ---
function wireTopSearch(){
  const host = document.getElementById('topSearch');
  const input = document.getElementById('searchInput');
  const list = document.getElementById('searchSuggest');
  if (!input || !list) return;
  try { if (localStorage.getItem('ui.search') === '0'){ if (host) host.style.display='none'; return; } } catch { /* noop */ }

  const t = (k)=> (state.i18n?.t ? state.i18n.t(k) : k);

  // Quick actions (no query)
  const quick = [
    { id:'qa:copilot', label:()=>t('QuickOpenCopilot'), run:()=>{ const modal=document.getElementById('modal-copilot'); if(modal) openCopilotModal(); else document.getElementById('copilotSection')?.scrollIntoView({behavior:'smooth'}); } },
    { id:'qa:denials', label:()=>t('QuickOpenDenials'), run:()=>openDenials() },
    { id:'qa:smartdrop', label:()=>t('QuickOpenSmartDrop'), run:()=>openSmartDrop() },
    { id:'qa:policies', label:()=>t('QuickOpenPolicies'), run:()=>showToast('Policies hub coming soon') },
    { id:'qa:xr', label:()=>t('QuickOpenXR'), run:()=>showToast('XR Library coming soon') },
    { id:'qa:byod', label:()=>t('QuickOpenBYOD'), run:()=>showToast('BYOD Check coming soon') },
  { id:'qa:rpfr', label:()=>t('QuickOpenRPFR'), run:()=>{ const link = document.querySelector('[data-open="bucket:rpfr"]'); if (link) link.click(); else showToast('RPFR'); } },
  ];

  // Next suggestions (contextual; minimal heuristic)
  function nextSuggestions(q){
    const s = String(q||'').trim().toLowerCase();
    const arr = [];
    if (!s) return arr;
    if (s.includes('denial') || s.includes('no airtime') || s.includes('deneg')) arr.push(quick.find(x=>x.id==='qa:denials'));
    if (s.includes('rpfr') || s.includes('reimburse')) arr.push(quick.find(x=>x.id==='qa:rpfr'));
    if (s.includes('fmip') || s.includes('icloud') || s.includes('find my')) arr.push({ id:'qa:fmip', label:()=> 'Open FMIP Script', run:()=> showToast('FMIP Script coming soon') });
    if (s.includes('scan') || s.includes('pdf') || s.includes('ocr')) arr.push(quick.find(x=>x.id==='qa:smartdrop'));
    if (!arr.find(x=>x?.id==='qa:copilot')) arr.push(quick.find(x=>x.id==='qa:copilot'));
    return arr.filter(Boolean).slice(0,4);
  }

  let items = [];
  let active = -1;

  function render(q){
    list.innerHTML = '';
    const hasText = !!String(q||'').trim();
  // option list is built directly into DOM; no temp array needed
    const addLabel = (text)=>{
      const d = document.createElement('div'); d.className='suggest-label'; d.textContent = text; list.appendChild(d);
    };
    const addOption = (it)=>{
      const d = document.createElement('div'); d.className='suggest-option'; d.setAttribute('role','option'); d.dataset.id=it.id; d.textContent = typeof it.label==='function'? it.label() : it.label; list.appendChild(d); return d; };

    if (!hasText){
      addLabel(t('QuickActions'));
      quick.forEach((it)=> addOption(it));
    } else {
      // For now we only show Next suggestions when typing
      addLabel(t('NextSuggestions'));
      nextSuggestions(q).forEach((it)=> addOption(it));
    }

    items = Array.from(list.querySelectorAll('[role="option"]'));
    active = items.length? 0 : -1;
    updateActive();
    list.style.display = items.length? 'block' : 'none';
    input.setAttribute('aria-expanded', items.length? 'true':'false');
  }
  function updateActive(){
    items.forEach((el,i)=> el.classList.toggle('active', i===active));
  }
  function runActive(){
    const el = items[active]; if(!el) return; const id = el.dataset.id; const it = [...quick, ...nextSuggestions(input.value)].find(x=>x?.id===id);
  if (it && typeof it.run==='function'){ try{ it.run(); } catch { /* noop */ } }
    list.style.display='none'; input.setAttribute('aria-expanded','false');
  }

  input.addEventListener('input', ()=> render(input.value));
  input.addEventListener('focus', ()=> render(input.value));
  input.addEventListener('blur', ()=> setTimeout(()=>{ list.style.display='none'; input.setAttribute('aria-expanded','false'); }, 120));
  input.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowDown'){ e.preventDefault(); if(items.length){ active = (active+1) % items.length; updateActive(); } }
    else if (e.key==='ArrowUp'){ e.preventDefault(); if(items.length){ active = (active-1+items.length) % items.length; updateActive(); } }
    else if (e.key==='Enter'){ if (active>-1){ e.preventDefault(); runActive(); } }
    else if (e.key==='Escape'){ list.style.display='none'; input.setAttribute('aria-expanded','false'); }
  });

  list.addEventListener('mousedown', (e)=>{
    const el = e.target?.closest?.('[role="option"]'); if(!el) return; const idx = items.indexOf(el); if(idx>-1){ active=idx; updateActive(); runActive(); }
  });
}

// Minimal helpers (safe no-ops if UI not present)
function openModal(name) {
  const id = name === 'settings' ? 'setupWizard' : name === 'tests' ? 'testsModal' : name;
  const el = document.getElementById(id);
  if (!el) return;
  if (typeof el.showModal === 'function') el.showModal();
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function showToast(msg) {
  try {
    // Non-intrusive: console only; can be upgraded later
    console.log('[Toast]', msg);
  } catch {
    /* ignore */
  }
}
function cycleTheme(){
  try {
    const root = document.documentElement;
    const themes = ['theme-dark','theme-light','theme-glass','theme-macos'];
    const curClass = themes.find(t=>root.classList.contains(t)) || 'theme-dark';
    const cur = curClass.replace('theme-','');
    const order = ['dark','light','glass','macos'];
    const next = order[(order.indexOf(cur)+1) % order.length];
    applyTheme(next);
    // persist into settings if present
    try{
      const s = JSON.parse(localStorage.getItem('cst.settings')||'{}')||{};
      s.theme = next; localStorage.setItem('cst.settings', JSON.stringify(s));
    }catch{}
    showToast('Theme: '+next);
  } catch {}
}
function logQA(msg) {
  try {
    console.debug('[QA]', msg);
  } catch {
    /* ignore */
  }
}

// --- SmartDrop modal/controller (local, no backend) ---
function openSmartDrop() {
  const modal = document.getElementById('modal-smartdrop');
  if (!modal) return showToast('SmartDrop not available');
  modal.hidden = false;
  // close handler
  const closeBtn = modal.querySelector('[data-close]');
  if (closeBtn) closeBtn.onclick = () => (modal.hidden = true);

  const drop = document.getElementById('sd_drop');
  const file = document.getElementById('sd_file');
  const prev = document.getElementById('sd_preview');
  const status = document.getElementById('sd_status');
  const suggestWrap = document.getElementById('sd_suggest');
  const suggestLabel = document.getElementById('sd_suggest_label');
  const learnChk = document.getElementById('sd_learn');
  const btnDen = document.getElementById('sd_route_denials');
  const btnRpf = document.getElementById('sd_route_rpfr');
  const btnFmi = document.getElementById('sd_route_fmip');

  function setStatus(msg) {
    if (status) status.textContent = msg || '';
  }
  function tokenize(s) {
    const STOP = new Set(
      (
        'a,an,the,of,to,in,for,on,and,or,if,then,with,by,be,is,are,was,were,as,at,from,that,this,it,its,into,you,your,' +
        'de,la,el,los,las,un,una,para,por,con,en,es,son,era,eran,como,que,esto,este,su'
      ).split(',')
    );
    return (s || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .slice(0, 400);
  }
  function loadJSON(key, def) {
    try {
      return JSON.parse(localStorage.getItem(key) || '') || def;
    } catch {
      return def;
    }
  }
  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  function saveToBucket(dest, text, meta = {}) {
    const ROUTE_KEYS = { denials: 'cst_bucket_denials', rpfr: 'cst_bucket_rpfr', fmip: 'cst_bucket_fmip' };
    const legacyKey = ROUTE_KEYS[dest];
    const unifiedKey = 'cst_bucket:' + dest;
    if (!dest) return;
    const entry = { ts: Date.now(), text: String(text || '').slice(0, 20000), meta };
    // write legacy key (for backward compatibility)
    if (legacyKey) {
      const arr = loadJSON(legacyKey, []);
      arr.unshift(entry);
      saveJSON(legacyKey, arr.slice(0, 200));
    }
    // write unified key used by Bucket Views/Compose
    const uarr = loadJSON(unifiedKey, []);
    uarr.unshift(entry);
    saveJSON(unifiedKey, uarr.slice(0, 200));
  }
  function learnRoute(dest, text) {
    const RULES_KEY = 'cst_route_rules_v1';
    const rules = loadJSON(RULES_KEY, {});
    for (const tok of tokenize(text)) {
      rules[tok] ??= { denials: 0, rpfr: 0, fmip: 0 };
      rules[tok][dest] += 1;
    }
    saveJSON(RULES_KEY, rules);
  }
  function suggestRoute(text) {
    const RULES_KEY = 'cst_route_rules_v1';
    const rules = loadJSON(RULES_KEY, {});
    const score = { denials: 0, rpfr: 0, fmip: 0 };
    for (const tok of tokenize(text)) {
      const r = rules[tok];
      if (!r) continue;
      score.denials += r.denials;
      score.rpfr += r.rpfr;
      score.fmip += r.fmip;
    }
    const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
    return { score, best: best && best[1] > 0 ? best[0] : null };
  }
  function setSuggest(text) {
    const s = suggestRoute(text || '');
    if (s.best) {
      suggestWrap.style.display = '';
      const label = s.best === 'rpfr' ? 'RPFR' : s.best === 'fmip' ? 'FMIP' : 'Denials';
      suggestLabel.textContent = `${label} (learned)`;
    } else {
      suggestWrap.style.display = 'none';
      suggestLabel.textContent = '';
    }
  }

  // drag/drop
  ['dragenter', 'dragover'].forEach((evt) =>
    drop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.style.background = '#141422';
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    drop.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      drop.style.background = '';
    })
  );

  drop.addEventListener('drop', async (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    await handleFile(f);
  });
  file.addEventListener('change', async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await handleFile(f);
    file.value = '';
  });

  async function handleFile(f) {
    setStatus(`Processing "${f.name}"…`);
    showToast('Analyzing file…');
    try {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      let txt = '';
      if (/(png|jpg|jpeg|bmp|gif|webp|tif|tiff|pdf|heic)$/.test(ext)) {
        txt = await runOCRFromFile(f);
      } else if (/(txt|csv|log|md|json)$/.test(ext)) {
        txt = await f.text();
      } else {
        try {
          txt = await f.text();
        } catch {
          txt = `[${ext.toUpperCase()} unsupported for OCR preview]`;
        }
      }
      prev.value = String(txt || '').trim();
      const previewShort = (prev.value.slice(0, 240) || '(no text)').replace(/\s+/g, ' ');
      logQA(`SmartDrop: ${f.name}\n→ ${previewShort}${prev.value.length > 240 ? '…' : ''}`);
      setSuggest(prev.value);
      setStatus('Ready to route. Tip: edit the text before routing if needed.');
    } catch (err) {
      setStatus('Error reading file.');
      showToast('SmartDrop failed', 'warn');
      logQA('SmartDrop error: ' + (err?.message || err));
    }
  }

  function route(dest) {
    const text = prev.value.trim();
    if (!text) {
      showToast('Nothing to route', 'warn');
      return;
    }
    saveToBucket(dest, text, { from: 'smartdrop' });
    if (learnChk?.checked) learnRoute(dest, text);
    showToast(`Routed to ${dest.toUpperCase()}`);
    setStatus(`Routed to ${dest.toUpperCase()} at ${new Date().toLocaleTimeString()}`);
  }

  btnDen.addEventListener('click', () => route('denials'));
  btnRpf.addEventListener('click', () => route('rpfr'));
  btnFmi.addEventListener('click', () => route('fmip'));
}

// --- Denials Library (starter content, extend freely) ---
const DENIAL = {
  DEVICE_INELIGIBLE: {
    en: {
      reason: "This device isn’t eligible under the plan.",
      rebuttal: 'We can review alternate coverage options or repair pathways that might fit your device.'
    },
    es: {
      reason: 'Este equipo no es elegible bajo el plan.',
      rebuttal: 'Podemos revisar opciones alternativas de cobertura o reparación que podrían ajustarse a su equipo.'
    }
  },
};

function openDenials() {
  const modal = document.getElementById('denialsModal');
  const host = document.getElementById('denialsContent');
  if (!modal || !host) return;
  host.innerHTML = renderDenialsHtml(DENIAL, state.lang || 'en');
  modal.showModal();
}

function renderDenialsHtml(map, lang) {
  const entries = Object.entries(map || {});
  if (!entries.length) return '<p class="muted">No denials defined yet.</p>';
  const blocks = entries
    .map(([key, v]) => {
      const en = v.en || {};
      const tr = v[lang] || v.en || {};
      return `
        <article class="card">
          <h3><code>${escapeHtml(key)}</code></h3>
          <div class="cols">
            <div>
              <h4>EN</h4>
              <p><strong>Reason:</strong> ${escapeHtml(en.reason || '')}</p>
              <p><strong>Rebuttal:</strong> ${escapeHtml(en.rebuttal || '')}</p>
            </div>
            <div>
              <h4>${lang.toUpperCase()}</h4>
              <p><strong>Reason:</strong> ${escapeHtml(tr.reason || '')}</p>
              <p><strong>Rebuttal:</strong> ${escapeHtml(tr.rebuttal || '')}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
  return `<section>${blocks}</section>`;
}

async function openCarrier(id) {
  logQA(`Carrier hub open → ${id}`);
  const modal = document.getElementById('carrierModal');
  const host = document.getElementById('carrierContent');
  if (!modal || !host) return;
  host.textContent = 'Loading…';
  try {
    const data = await fetch(`/carriers/${id}.json`, { cache: 'no-store' }).then((r) =>
      r.ok ? r.json() : Promise.reject(new Error('Not found')),
    );
    host.innerHTML = renderCarrierHtml(data);
  } catch {
    host.textContent = `Failed to load carrier ${id}`;
  }
  modal.showModal();
}

function renderCarrierHtml(data) {
  const esc = (s) => escapeHtml(String(s || ''));
  const list = (arr, map) =>
    Array.isArray(arr) && arr.length
      ? `<ul>${arr.map(map).join('')}</ul>`
      : '<p class="muted">None</p>';
  const tcs = list(data.tcs, (x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noreferrer noopener">${esc(x.label)}</a></li>`);
  const denials = list(data.common_denials, (x) => `<li><code>${esc(x.key)}</code> — ${esc(x.label)}</li>`);
  const fmipEn = list(data.fmip?.steps_en, (x) => `<li>${esc(x)}</li>`);
  const fmipEs = list(data.fmip?.steps_es, (x) => `<li>${esc(x)}</li>`);
  const links = list(data.support_links, (x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noreferrer noopener">${esc(x.label)}</a></li>`);
  return `
    <h2>${esc(data.name || data.id)}</h2>
    <section>
      <h3>Terms & Policies</h3>
      ${tcs}
    </section>
    <section>
      <h3>Common Denials</h3>
      ${denials}
    </section>
    <section>
      <h3>RPFR</h3>
      <p>${esc(data.rpfr?.eligibility_hint || '')}</p>
      ${data.rpfr?.note_template_en ? `<pre class="preview">${esc(data.rpfr.note_template_en)}</pre>` : ''}
    </section>
    <section>
      <h3>FMIP</h3>
      <div class="cols">
        <div><h4>EN</h4>${fmipEn}</div>
        <div><h4>ES</h4>${fmipEs}</div>
      </div>
    </section>
    <section>
      <h3>Support</h3>
      ${links}
    </section>
  `;
}

function getRedirectTarget() {
  try {
    const qp = new URLSearchParams(location.search);
    const nextParam = qp.get('next');
    if (nextParam) return nextParam;
  } catch {
    // ignore
  }
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_AFTER_SPLASH_URL)
      return import.meta.env.VITE_AFTER_SPLASH_URL;
  } catch {
    // ignore
  }
  const ls = localStorage.getItem('redirectAfterSplash');
  return ls || null;
}

function safeRedirect(target) {
  try {
  // Avoid redirects during automation to keep frames stable in tests
  if (typeof isAutomation === 'function' && isAutomation()) return;
    if (!target || typeof target !== 'string') return;
    const same = target === location.href || target === location.pathname;
    if (same) return;
    location.href = target;
  } catch {
    // ignore
  }
}

// --- i18n ---
async function toggleLang() {
  const current = localStorage.getItem('lang') || 'en';
  const next = current === 'en' ? 'es' : 'en';
  localStorage.setItem('lang', next);
  state.i18n = await createI18n(next);
  state.lang = next;
  localizeStatic();
  renderCopilotUI();
  renderStatus();
  loadHighlights();
}

function localizeStatic() {
  document
    .querySelectorAll('[data-i18n]')
    .forEach((el) => (el.textContent = state.i18n.t(el.dataset.i18n)));
  const title = document.querySelector('title[data-i18n]');
  if (title) title.textContent = state.i18n.t(title.dataset.i18n);
  document
    .querySelectorAll('[data-i18n-placeholder]')
    .forEach((el) => (el.placeholder = state.i18n.t(el.dataset.i18nPlaceholder)));
}

function setStep(textKey) {
  const el = document.getElementById('splashStep');
  if (!el) return;
  el.textContent = state.i18n ? state.i18n.t(textKey) : textKey;
}

function showSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  el.hidden = false;
  el.classList.add('show');
  // Optional tagline (localized one-liner)
  try {
    const title = document.getElementById('splashTitle');
    if (title && !document.getElementById('splashTagline')) {
      const tag = document.createElement('p');
      tag.id = 'splashTagline';
      tag.className = 'muted';
      tag.style.marginTop = '4px';
      tag.style.fontSize = '14px';
      tag.textContent = state.i18n ? state.i18n.t('SplashTagline') : 'White-glove support. Faster workflows. Gold-standard results.';
      title.insertAdjacentElement('afterend', tag);
    } else if (title) {
      const tag = document.getElementById('splashTagline');
      if (tag) tag.textContent = state.i18n ? state.i18n.t('SplashTagline') : tag.textContent;
    }
  } catch { /* noop */ }
  const bar = document.getElementById('splashBar');
  if (bar) {
    bar.classList.remove('run');
    requestAnimationFrame(() => bar.classList.add('run'));
  }
  // focus trap & Esc to close after first visit
  const container = document.getElementById('splash');
  const panel = container?.querySelector('.banner-inner');
  if (panel) {
    panel.setAttribute('tabindex', '-1');
    panel.focus();
  }
  splashKeyHandler = (e) => {
    if (e.key === 'Escape' && localStorage.getItem('welcomeSeen') === '1') hideSplash();
    if (e.key !== 'Tab') return;
    const F = "a[href],button,textarea,input,select,[tabindex]:not([tabindex='-1'])";
    const nodes = [...container.querySelectorAll(F)].filter((el) => !el.disabled);
    if (!nodes.length) return;
    const first = nodes[0],
      last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    }
    if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };
  container.addEventListener('keydown', splashKeyHandler);
  // % counter (smooth, capped until finish)
  splashPct = 0;
  updatePct();
  clearInterval(splashPctTimer);
  splashPctTimer = setInterval(() => {
    splashPct = Math.min(splashPct + 7, 97);
    updatePct();
    if (splashPct >= 97) clearInterval(splashPctTimer);
  }, 180);
  const retry = document.getElementById('splashRetry');
  if (retry)
    retry.onclick = () => {
      clearInterval(splashPctTimer);
      showSplash();
    };
  const steps = ['LoadingUI', 'LoadingTranslations', 'CheckingCore', 'StartingApp'];
  let idx = 0;
  setStep(steps[idx]);
  clearInterval(splashMsgTimer);
  splashMsgTimer = setInterval(() => {
    idx = Math.min(idx + 1, steps.length - 1);
    setStep(steps[idx]);
  }, 700);
  splashAnimDone = false;
  splashAssetsDone = false;
  waitForSplashFinish();
}
function updatePct() {
  const el = document.getElementById('splashPct');
  if (el) el.textContent = `${splashPct}%`;
}

function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  el.classList.remove('show');
  el.hidden = true;
  clearInterval(splashMsgTimer);
  clearInterval(splashPctTimer);
  el.removeEventListener('keydown', splashKeyHandler);
  splashKeyHandler = null;
}

function waitForSplashFinish() {
  const bar = document.getElementById('splashBar');
  // Failsafe: always hide splash after 3 seconds
  const failsafeTimeout = setTimeout(() => {
  if (!splashAnimDone || !splashAssetsDone) {
      splashAnimDone = true;
      splashAssetsDone = true;
  maybeCloseSplash();
    }
  }, 3000);

  if (bar) {
    const onEnd = () => {
      splashAnimDone = true;
      maybeCloseSplash();
      clearTimeout(failsafeTimeout);
    };
    bar.addEventListener('animationend', onEnd, { once: true });
    setTimeout(onEnd, 2600);
  } else {
    splashAnimDone = true;
  }
  Promise.allSettled([
    fetch('/i18n/en.json', { cache: 'no-store' }),
    fetch('/i18n/es.json', { cache: 'no-store' }),
    fetch('/assets/logo.svg', { cache: 'no-store' }),
  ]).then(() => {
    splashAssetsDone = true;
    maybeCloseSplash();
    clearTimeout(failsafeTimeout);
  });
}

  function maybeCloseSplash() {
  if (splashAnimDone && splashAssetsDone) {
    splashPct = 100;
    updatePct();
    hideSplash();
  // Open setup on first run; else redirect if configured
  const onboarded = localStorage.getItem('onboarded') === '1';
  if (!onboarded) {
    const wiz = document.getElementById('setupWizard');
    if (wiz && typeof wiz.showModal === 'function') setTimeout(()=>wiz.showModal(), 80);
  } else if (state.redirectTo) {
    setTimeout(() => safeRedirect(state.redirectTo), 60);
  }
      // Self-test (silent): check Copilot button clickability after splash closes
      setTimeout(() => {
        const btn = document.getElementById('copilotRun');
        if (btn) {
          try {
            const rect = btn.getBoundingClientRect();
            const elAtPoint = document.elementFromPoint(rect.left + 2, rect.top + 2);
            // compute-only; no console noise in production
            void (elAtPoint === btn || btn.contains(elAtPoint));
          } catch {
            // ignore
          }
        }
      }, 100);
  }
}

// --- Setup Wizard ---
function onSaveWizard() {
  // dialog value is "save"
  const s = {
    name: val('#wName'),
    coach: val('#wCoach'),
    empId: val('#wEmpId'),
    ext: val('#wExt'),
    theme: val('#wTheme'),
    expertType: (document.getElementById('wExpertType')?.value)||'english',
  };
  if (!s.name || !s.empId || !s.ext) return; // native required also guards
  saveSettings(s);
  localStorage.setItem('splashSeen', '1');
  if (document.getElementById('dontShow').checked) {
    localStorage.setItem('onboarded', '1');
  }
  // Persist bilingual preference + default output mode
  const isBilingual = s.expertType === 'bilingual';
  localStorage.setItem('cst_bilingual', isBilingual ? '1' : '0');
  if (!localStorage.getItem('cst_output_mode')) {
    localStorage.setItem('cst_output_mode', isBilingual ? 'both' : 'en');
  }
  document.getElementById('setupWizard').close();
  renderStatus();
  // Show welcome modal once after setup save
  if (localStorage.getItem('welcomeShown') !== '1') {
    try { ensureWelcomeModal(); renderWelcomeModal(); showWelcomeModal(); } catch { /* noop */ }
  }
}
function val(sel) {
  return document.querySelector(sel).value?.trim();
}
function saveSettings(s) {
  localStorage.setItem('cst.settings', JSON.stringify(s));
  state.settings = s;
  if (s.theme) applyTheme(s.theme);
}
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('cst.settings') || '{}');
  } catch {
    return {};
  }
}

function applyTheme(name) {
  const el = document.documentElement;
  el.classList.remove('theme-light', 'theme-dark', 'theme-glass', 'theme-macos');
  if (name === 'glass') el.classList.add('theme-glass');
  else if (name === 'light') el.classList.add('theme-light');
  else if (name === 'macos') el.classList.add('theme-macos');
  else el.classList.add('theme-dark');
}

function forceShowSplash() {
  try {
    localStorage.removeItem('welcomeSeen');
    const el = document.getElementById('splash');
    if (!el) return;
    el.hidden = false;
    el.classList.add('show');
    // auto-dismiss after a second
    setTimeout(() => el.classList.remove('show'), 1200);
  } catch {
    /* ignore */
  }
}

// --- Welcome Modal (post-setup intro) ---
function ensureWelcomeModal(){
  if (document.getElementById('modal-welcome')) return;
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.id = 'modal-welcome';
  wrap.setAttribute('data-testid', 'welcome-modal');
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="welTitle">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <h3 id="welTitle" data-testid="welcome-title" style="margin:0"></h3>
        <button class="btn secondary" data-testid="welcome-close" data-close>Close</button>
      </header>
      <div class="content">
        <div id="welBlocks" data-testid="welcome-blocks" style="display:grid;gap:10px"></div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <input type="checkbox" id="welDontShow" data-testid="welcome-dontshow" />
          <span id="welDontShowLabel" data-testid="welcome-dontshow-label"></span>
        </label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button id="welOpenCopilot" data-testid="welcome-open-copilot" class="btn"></button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  // Close handlers
  wrap.addEventListener('click', (e)=>{ if (e.target === wrap) { hideWelcomeModal(true); } });
  wrap.querySelector('[data-close]')?.addEventListener('click', ()=> hideWelcomeModal(true));
  document.getElementById('welOpenCopilot')?.addEventListener('click', ()=>{
    hideWelcomeModal(true);
    try {
      const modal = document.getElementById('modal-copilot');
      if (modal) openCopilotModal();
      else {
  if (!document.getElementById('copilotSection')) { try { initCopilot(); renderCopilotUI(); } catch { /* noop */ } }
        document.getElementById('copilotSection')?.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    } catch { /* noop */ }
  });
}
function renderWelcomeModal(){
  const t = (s)=> state.i18n ? state.i18n.t(s) : s;
  const title = document.getElementById('welTitle');
  const blocks = document.getElementById('welBlocks');
  const cta = document.getElementById('welOpenCopilot');
  const dontLbl = document.getElementById('welDontShowLabel');
  if (!blocks || !cta) return;
  if (title) title.textContent = t('WelcomeHeadline');
  cta.textContent = t('CTAOpenCopilot');
  if (dontLbl) dontLbl.textContent = t('Do Not Show Again');
  // Build blocks by output mode
  const mode = getOutputMode();
  const wantEN = mode === 'en' || mode === 'both';
  const wantES = mode === 'es' || mode === 'both';
  const mk = (lang)=>{
    const wrap = document.createElement('section');
    wrap.className = 'wel-block';
    const h = document.createElement('h4');
    h.className = 'muted';
    h.style.margin = '0';
    h.style.fontWeight = '600';
    h.textContent = lang === 'es' ? 'Español' : 'English';
    const sub = document.createElement('p');
    sub.style.margin = '6px 0 0 0';
  sub.textContent = t('WelcomeSubheadline');
    const body = document.createElement('p');
    body.className = 'muted';
    body.style.margin = '6px 0 0 0';
  body.textContent = t('WelcomeBody');
    wrap.appendChild(h);
    wrap.appendChild(sub);
    wrap.appendChild(body);
    return wrap;
  };
  blocks.innerHTML = '';
  if (wantEN) blocks.appendChild(mk('en'));
  if (wantES) blocks.appendChild(mk('es'));
}
function showWelcomeModal(){
  const el = document.getElementById('modal-welcome'); if (!el) return;
  const chk = document.getElementById('welDontShow'); if (chk) chk.checked = false;
  el.hidden = false;
}
function hideWelcomeModal(markSeen){
  const el = document.getElementById('modal-welcome'); if (!el) return;
  el.hidden = true;
  if (markSeen) {
    const chk = document.getElementById('welDontShow');
    if (chk?.checked) localStorage.setItem('welcomeShown','1');
  }
}

// --- Copilot Modal wiring (proxies to existing Copilot engine) ---
function openCopilotModal(){
  const modal = document.getElementById('modal-copilot');
  if (!modal) return;
  modal.hidden = false;
  // close handler
  const closeBtn = modal.querySelector('[data-close]');
  if (closeBtn) closeBtn.onclick = () => (modal.hidden = true);

  // seed quick starters
  const q1 = document.getElementById('cp_quick_rpfr');
  const q2 = document.getElementById('cp_quick_fmip');
  const input = document.getElementById('cp_in');
  if (q1) q1.onclick = () => (input.value = 'RPFR: customer purchased accessory at retail; requesting reimbursement.');
  if (q2) q2.onclick = () => (input.value = 'FMIP override: customer forgot Apple ID; need safe coaching and Alpha note.');

  // run bridges to main copilot
  const runBtn = document.getElementById('cp_run');
  if (runBtn) runBtn.onclick = async () => {
    // ensure main Copilot exists
  try { initCopilot(); renderCopilotUI(); } catch { /* noop */ }
    const box = document.getElementById('copilotInput');
    if (box) box.value = input.value;
    const btn = document.getElementById('copilotRun');
    if (btn) btn.click();
    // After a short delay, mirror outputs into modal textarea
    setTimeout(() => {
      const en = document.getElementById('copilotEn')?.textContent || '';
      const es = document.getElementById('copilotEs')?.textContent || '';
      const out = document.getElementById('cp_out');
      if (out) out.value = [en, es && '\n\n— ES —\n' + es].filter(Boolean).join('\n');
    }, 400);
  };
  const copy = document.getElementById('cp_copy');
  if (copy) copy.onclick = () => {
    const en = document.getElementById('copilotEn')?.textContent || '';
    const es = document.getElementById('copilotEs')?.textContent || '';
    const mode = getOutputMode();
    const txt = mode === 'en' ? en : mode === 'es' ? es : (state.lang === 'es' ? es : en);
    navigator.clipboard.writeText(txt).then(()=>showToast('Copied'));
  };
  const copyAll = document.getElementById('cp_copy_all');
  if (copyAll) { copyAll.style.display = 'none'; }
  updateModalCopyLabel();
}

function updateModalCopyLabel(){
  const btn = document.getElementById('cp_copy'); if (!btn) return;
  const t = (s)=> state.i18n ? state.i18n.t(s) : s;
  const mode = getOutputMode();
  if (mode === 'en') btn.textContent = t('Copy EN');
  else if (mode === 'es') btn.textContent = t('Copy ES');
  else btn.textContent = (state.lang === 'es') ? t('Copy ES') : t('Copy EN');
}

// --- Tests Modal action ---
async function runFetchTest() {
  const out = document.getElementById('testsOutput');
  out.textContent = 'Running /api/fetch…';
  try {
    const res = await fetch('/api/fetch');
    const json = await res.json();
    state.lastFetchRun = { ok: res.ok, at: new Date().toISOString() };
    out.textContent = JSON.stringify(json, null, 2);
  } catch (e) {
    out.textContent = 'Fetch error: ' + e.message;
    state.lastFetchRun = { ok: false, at: new Date().toISOString(), err: e.message };
  }
  renderStatus();
}

// --- Drag & Drop / Paste ---
async function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('hover');
  const file = e.dataTransfer.files?.[0];
  if (!file) return;
  if (file.type === 'text/plain') {
    const text = await file.text();
    preview(parseText(text));
  } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    preview({ error: 'PDF parsing stub — add pdf.js (self-hosted) later.' });
  } else {
    preview({ error: `Unsupported type: ${file.type || file.name}` });
  }
}
function onPaste(e) {
  const text = e.clipboardData?.getData('text');
  if (text && text.length > 5) {
    preview(parseText(text));
  }
}
function preview(obj) {
  document.getElementById('preview').textContent = JSON.stringify(obj, null, 2);
}

// ---- Tests helpers: OCR status + Doctor runner ----
async function checkOCRStatus() {
  const badge = document.getElementById('ocrBadge');
  if (!badge) return;
  try {
    const r = await fetch('/api/doctor?check=ocr');
    if (r.ok) {
      const data = await r.json();
      if (data.ok && data.ocr?.ready) {
        badge.textContent = 'OCR: Ready ✅';
        badge.style.borderColor = '#16a34a';
      } else {
        badge.textContent = 'OCR: Offline ⚠️';
        badge.style.borderColor = '#ffb020';
        if (data.ocr?.missing?.length) {
          badge.title = 'Missing: ' + data.ocr.missing.join(', ');
        }
      }
      return;
    }
  } catch { /* noop */ }
  const targets = [
    '/libs/tesseract/tesseract.min.js',
    '/libs/tesseract/worker.min.js',
    '/libs/tesseract/tesseract-core.wasm',
  ];
  const missing = [];
  await Promise.all(
    targets.map(async (p) => {
      try {
        const r = await fetch(p, { method: 'HEAD', cache: 'no-store' });
        if (!r.ok) missing.push(p);
      } catch {
        missing.push(p);
      }
    }),
  );
  if (missing.length === 0) {
    badge.textContent = 'OCR: Ready ✅';
    badge.style.borderColor = '#16a34a';
  } else {
    badge.textContent = 'OCR: Offline ⚠️';
    badge.style.borderColor = '#ffb020';
    badge.title = 'Missing: ' + missing.join(', ');
  }
}

async function runDoctorTest() {
  const log = document.getElementById('testLog') || document.getElementById('testsOutput');
  const btn = document.getElementById('t_run_doctor');
  const timestamp = new Date().toISOString();
  
  // Prevent double-clicking
  if (btn) {
    if (btn.disabled) {
      console.log(`[${timestamp}] Doctor test already running, ignoring request`);
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Running...';
  }
  
  console.log(`[${timestamp}] Doctor test started`);
  if (log) log.textContent = `Doctor: running… [${timestamp}]`;
  
  try {
    console.log(`[${timestamp}] Fetching /api/doctor`);
    const r = await fetch('/api/doctor', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'X-Request-ID': `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });
    
    console.log(`[${timestamp}] Doctor response status:`, r.status);
    const j = await r.json();
    console.log(`[${timestamp}] Doctor response:`, j);
    
    if (log) log.textContent = JSON.stringify(j, null, 2);
    checkOCRStatus();
    showToast(j.ok ? 'Doctor passed' : 'Doctor found issues');
  } catch (e) {
    console.error(`[${timestamp}] Doctor error:`, e);
    if (log) log.textContent = 'Doctor error: ' + (e?.message || e);
    showToast('Doctor error', 'warn');
  } finally {
    // Re-enable button
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Doctor';
    }
  }
}

// --- UI Text Audit (temporary diagnostics) ---
function runUiTextAudit(){
  const out = document.getElementById('testLog') || document.getElementById('testsOutput');
  if (out) out.textContent = 'UI Text Audit: scanning…';
  try {
    // Collect visible text nodes from main content area and modals
    const isVisible = (el)=>{
      if (!el) return false;
      const s = getComputedStyle(el);
      return s && s.display !== 'none' && s.visibility !== 'hidden' && el.offsetParent !== null;
    };
    const roots = [
      document.querySelector('.content'),
      document.getElementById('modal-copilot'),
      document.getElementById('modal-smartdrop'),
      document.getElementById('modal-welcome'),
    ].filter(Boolean);
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())){
      const t = (node.nodeValue||'').replace(/\s+/g,' ').trim();
      if (!t) continue;
      const parent = node.parentElement;
      if (!parent || !isVisible(parent)) continue;
      // skip code/pre/script/style
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') continue;
      texts.push(t);
    }
    // Flag repeated consecutive tokens (>=3) or repeated lines (>=2 identical in a row)
    const issues = [];
    const tokenRe = /([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-']*)(?:\s+\1){2,}/i;
    texts.forEach((line, i)=>{
      if (tokenRe.test(line)) issues.push({ i, type:'repeat-token', line });
      if (i>0 && texts[i-1]===line) issues.push({ i, type:'repeat-line', line });
    });
    const report = {
      totalLines: texts.length,
      issues: issues.slice(0,50),
      hint: 'Look for repeat-token or repeat-line entries.'
    };
    if (out) out.textContent = JSON.stringify(report, null, 2);
  } catch (e){ if (out) out.textContent = 'UI Text Audit error: ' + (e?.message||e); }
}

// --- Splash Diagnostics (temporary) ---
function runSplashDiagnostics(){
  const out = document.getElementById('testLog') || document.getElementById('testsOutput');
  if (out) out.textContent = 'Splash diagnostics: collecting…';
  try {
    const el = document.getElementById('splash');
    const step = document.getElementById('splashStep')?.textContent || '';
    const pct = document.getElementById('splashPct')?.textContent || '';
    const hasShow = el?.classList.contains('show');
    const hidden = !!el?.hidden;
    const seen = localStorage.getItem('welcomeSeen') || '0';
    const onboarded = localStorage.getItem('onboarded') || '0';
    const summary = { showClass: hasShow, hidden, step, pct, welcomeSeen: seen, onboarded };
    if (out) out.textContent = JSON.stringify(summary, null, 2);
  } catch (e){ if (out) out.textContent = 'Splash diagnostics error: ' + (e?.message||e); }
}

// --- Copilot ---
function initCopilot() {
  // Avoid duplicates if already present
  if (document.getElementById('copilotSection')) return;
  let main = document.querySelector('.content');
  if (!main) {
    // fallback: create .content if missing
    main = document.createElement('div');
    main.className = 'content';
    document.body.appendChild(main);
  }
  const sec = document.createElement('section');
  sec.id = 'copilotSection';
  sec.setAttribute('data-testid', 'copilot-section');
  sec.innerHTML = `
    <div class="copilot-header">
      <h2 id="copilotTitle" data-testid="copilot-title"></h2>
      <span id="copilotEngine" data-testid="copilot-engine" class="pill" title="Locked to offline engine"></span>
      <label style="margin-left:auto;display:flex;align-items:center;gap:6px">
        <span id="copilotOutputLabel" data-testid="copilot-output-label" style="font-size:12px;opacity:.8">Output</span>
        <select id="copilotMode" data-testid="copilot-mode">
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="both">Bilingual</option>
        </select>
      </label>
    </div>
    <label><span id="copilotSampleLabel"></span><select id="copilotSample" data-testid="copilot-sample"></select></label>
    <label><span id="copilotInputLabel"></span><textarea id="copilotInput" data-testid="copilot-input"></textarea></label>
    <button id="copilotRun" data-testid="copilot-run"></button>
    <div id="copilotOutput" class="copilot-output" data-testid="copilot-output">
      <div class="copilot-col">
        <h3 id="copilotEnLabel" data-testid="copilot-en-label"></h3>
        <pre id="copilotEn" data-testid="copilot-en" class="preview"></pre>
        <button id="copilotCopyEn" data-testid="copilot-copy-en"></button>
      </div>
      <div class="copilot-col">
        <h3 id="copilotEsLabel" data-testid="copilot-es-label"></h3>
        <pre id="copilotEs" data-testid="copilot-es" class="preview"></pre>
        <button id="copilotCopyEs" data-testid="copilot-copy-es"></button>
      </div>
    </div>
    <p id="copilotMsg" class="warn" hidden></p>
  `;
  // Insert Copilot before the System Status card when present
  const statusNode = document.getElementById('systemStatus');
  if (statusNode && statusNode.parentNode === main) {
    main.insertBefore(sec, statusNode);
  } else {
    main.appendChild(sec);
  }
  document.getElementById('copilotRun').addEventListener('click', onCopilotRun);
  document.getElementById('copilotCopyEn').addEventListener('click', () => copyText('copilotEn'));
  document.getElementById('copilotCopyEs').addEventListener('click', () => copyText('copilotEs'));
}
function renderCopilotUI() {
  if (!document.getElementById('copilotSection')) return;
  const t = (s) => state.i18n.t(s);
  document.getElementById('copilotTitle').textContent = t('Copilot');
  const outLbl = document.getElementById('copilotOutputLabel');
  if (outLbl) outLbl.textContent = t('Output');
  // Engine badge (Free mode lock)
  const eng = document.getElementById('copilotEngine');
  if (eng) {
    // Default to locked offline mode; allow override with localStorage.freeLock = '0'
    let isLocked = true;
    try {
      if (localStorage.getItem('freeLock') === '0') isLocked = false;
      else if (import.meta && import.meta.env && import.meta.env.VITE_FREE_LOCK === '0') isLocked = false;
    } catch {
      /* ignore */
    }
    if (isLocked) {
      eng.textContent = t('EngineOfflineLocked');
      eng.title = t('LockedOfflineEngine');
      eng.setAttribute('aria-disabled', 'true');
      eng.hidden = false;
    } else {
      eng.hidden = true;
    }
  }
  document.getElementById('copilotSampleLabel').textContent = t('Sample prompt');
  document.getElementById('copilotInputLabel').textContent = t('Additional instructions');
  document.getElementById('copilotRun').textContent = t('Generate');
  document.getElementById('copilotEnLabel').textContent = t('English');
  document.getElementById('copilotEsLabel').textContent = t('Spanish');
  document.getElementById('copilotCopyEn').textContent = t('Copy EN');
  document.getElementById('copilotCopyEs').textContent = t('Copy ES');
  const sel = document.getElementById('copilotSample');
  sel.innerHTML = '';
  if (Array.isArray(state.copilotSamples)) {
    state.copilotSamples.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = (p.label && (p.label[state.lang] || p.label.en)) || p.id;
      if (p.prompt) opt.setAttribute('data-prompt', p.prompt);
      sel.appendChild(opt);
    });
  }
  // Output mode selector
  try {
    const modeSel = document.getElementById('copilotMode');
    if (modeSel && !modeSel.dataset.wired) {
      modeSel.dataset.wired = '1';
      // Localize option labels
      if (modeSel.options && modeSel.options.length >= 3) {
        modeSel.options[0].textContent = t('English');
        modeSel.options[1].textContent = t('Spanish');
        modeSel.options[2].textContent = t('Bilingual');
      }
      modeSel.value = getOutputMode();
      modeSel.addEventListener('change', () => {
        setOutputMode(modeSel.value);
        applyOutputModeVisibility();
  try { updateModalCopyLabel(); } catch { /* noop */ }
      });
      applyOutputModeVisibility();
    } else if (modeSel) {
      if (modeSel.options && modeSel.options.length >= 3) {
        modeSel.options[0].textContent = t('English');
        modeSel.options[1].textContent = t('Spanish');
        modeSel.options[2].textContent = t('Bilingual');
      }
      modeSel.value = getOutputMode();
      applyOutputModeVisibility();
    }
  } catch { /* noop */ }
}
async function onCopilotRun() {
  const sel = document.getElementById('copilotSample');
  const sample = state.copilotSamples.find((p) => p.id === sel.value);
  const user = document.getElementById('copilotInput').value;
  let context = null;
  try {
    const txt = document.getElementById('preview').textContent;
    if (txt) context = JSON.parse(txt);
  } catch {
    /* noop */
  }
  const prompt = buildPrompt(
    sample?.prompt || sel.selectedOptions[0]?.getAttribute('data-prompt') || '',
    user,
    context,
  );
  const outEn = document.getElementById('copilotEn');
  const outEs = document.getElementById('copilotEs');
  const msg = document.getElementById('copilotMsg');
  outEn.textContent = outEs.textContent = '';
  msg.textContent = state.i18n.t('Loading...');
  msg.hidden = false;
  try {
    if (state.engine === 'local-llm') {
      const out = await localLLM(prompt);
      outEn.textContent = out;
      outEs.textContent = out; // simple mirror for now
      msg.hidden = true;
    } else {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(res.status || 'Copilot error'));
      outEn.textContent = data.en || '';
      outEs.textContent = data.es || '';
      msg.hidden = true;
    }
  } catch {
    if (state.engine === 'templates') {
      // Provide a graceful offline draft instead of a hard failure
      const offline = 'Draft: ' + (user || '').trim() + '\n\n(Select a specific denial or switch engine to Local LLM beta.)';
      outEn.textContent = offline;
      outEs.textContent = offline;
      msg.hidden = true;
    } else {
      msg.textContent = state.i18n.t('Set OPENAI_API_KEY in Vercel to enable Copilot.');
    }
  }
  await checkCopilot();
  // Apply output mode filtering after content updates
  applyOutputModeVisibility();
}
// ---- Output mode helpers (EN / ES / Both) ----
function getOutputMode(){
  const saved = localStorage.getItem('cst_output_mode');
  if (saved === 'en' || saved === 'es' || saved === 'both') return saved;
  return localStorage.getItem('cst_bilingual') === '1' ? 'both' : 'en';
}
function setOutputMode(v){
  const val = v === 'es' ? 'es' : v === 'both' ? 'both' : 'en';
  localStorage.setItem('cst_output_mode', val);
}
function applyOutputModeVisibility(){
  const mode = getOutputMode();
  const colEn = document.getElementById('copilotEn')?.parentElement;
  const colEs = document.getElementById('copilotEs')?.parentElement;
  if (!colEn || !colEs) return;
  if (mode === 'en') {
    colEn.style.display = '';
    colEs.style.display = 'none';
  } else if (mode === 'es') {
    colEn.style.display = 'none';
    colEs.style.display = '';
  } else {
    colEn.style.display = '';
    colEs.style.display = '';
  }
}
async function copyText(id) {
  try {
    let el = null;
    if (id && id.startsWith && id.startsWith('#')) el = document.querySelector(id);
    else el = document.getElementById(id);
    const value = (el && (el.value || el.textContent)) || '';
    await navigator.clipboard.writeText(value);
    showToast('Copied');
  } catch {
    showToast('Copy failed', 'warn');
  }
}
async function checkCopilot() {
  try {
    const r = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'ping' }),
    });
    await r.json();
    state.copilotReachable = true;
  } catch {
    state.copilotReachable = false;
  }
  renderStatus();
}

// ---- Local OCR (Tesseract.js) wiring ----
let OCR_READY = false;
let TESS = null;
async function ensureOCR() {
  if (OCR_READY) return true;
  try {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = '/libs/tesseract/tesseract.min.js';
      s.onload = res;
      s.onerror = () => rej(new Error('Failed to load OCR lib'));
      document.head.appendChild(s);
    });
    if (!window.Tesseract) return false;
    TESS = window.Tesseract;
    OCR_READY = true;
    return true;
  } catch {
    return false;
  }
}
async function runOCRFromFile(file) {
  const ok = await ensureOCR();
  if (!ok) throw new Error('OCR not available');
  const worker = await TESS.createWorker({
    workerPath: '/libs/tesseract/worker.min.js',
    langPath: '/libs/tesseract/',
    corePath: '/libs/tesseract/tesseract-core.wasm',
  });
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data?.text || '';
}

// --- System Status ---
async function run4PointUrlTest() {
  // 1) Check the bundled main module tag Vite emits (e.g., /assets/index-XXXXX.js)
  const hasMainScript = !!document.querySelector('script[type="module"][src*="/assets/index-"]');

  // 2) Network probes for stable endpoints
  const list = ['/assets/logo.svg', '/api/fetch'];
  const results = await Promise.all(
    list.map(async (p) => {
      try {
        const r = await fetch(p, { method: 'GET' });
        return [p, r.ok];
      } catch {
        return [p, false];
      }
    }),
  );

  // 3) Store results under stable keys
  state.urlTest = Object.fromEntries([...results, ['mainScript', hasMainScript]]);
  renderStatus();
}
function renderStatus() {
  const items = [];

  // required IDs/handlers present?
  const requiredIds = ['setupWizard', 'wizardForm', 'openTests', 'testsFetchBtn'];
  const missing = requiredIds.filter((id) => !document.getElementById(id));
  items.push(
    mark(
      'Required UI elements',
      missing.length ? `Missing: ${missing.join(', ')}` : 'OK',
      !missing.length,
    ),
  );

  // CSP
  items.push(
    mark(
      'CSP violations',
      state.cspViolations.length ? state.cspViolations.join(' • ') : 'None',
      state.cspViolations.length === 0,
    ),
  );

  // Core assets presence
  const u = state.urlTest || {};
  const urlOk = u.mainScript === true && ['/assets/logo.svg', '/api/fetch'].every((p) => u[p]);
  items.push(mark('Core assets test', JSON.stringify(u), urlOk));

  // Bilingual ready
  items.push(mark('i18n', `lang=${localStorage.getItem('lang') || 'en'}`, !!state.i18n));

  // Last fetch run
  items.push(
    mark(
      'T&C fetch',
      state.lastFetchRun ? JSON.stringify(state.lastFetchRun) : 'Not yet',
      !!state.lastFetchRun?.ok,
    ),
  );

  // Settings saved
  items.push(
    mark(
      'Setup',
      state.settings && state.settings.name ? 'Saved' : 'Not set',
      !!(state.settings && state.settings.name),
    ),
  );

  if (state.copilotReachable !== null) {
    items.push(
      mark(
        state.i18n.t('Copilot reachable'),
        state.copilotReachable ? 'OK' : 'Fail',
        state.copilotReachable,
      ),
    );
  }

  // Recent JS errors (if any)
  if (Array.isArray(state.jsErrors) && state.jsErrors.length) {
    items.push(mark('Errors', state.jsErrors.join(' | '), false));
  }

  document.getElementById('statusList').innerHTML = items
    .map(
      (li) =>
        `<li class="${li.ok ? 'ok' : 'fail'}"><strong>${li.label}:</strong> ${escapeHtml(li.msg)}</li>`,
    )
    .join('');
}
function mark(label, msg, ok) {
  return { label, msg, ok };
}
function escapeHtml(s) {
  return String(s).replace(
    /[&<>'"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c],
  );
}

window.addEventListener('load', () => {
  if (localStorage.getItem('welcomeSeen') !== '1') setTimeout(maybeCloseSplash, 400);
});

// ---------- Highlights: render from public/highlights.json ----------
async function loadHighlights() {
  const host = document.getElementById('highlightsList');
  if (!host) return;
  try {
    const list = await fetch('/highlights.json', { cache: 'no-store' }).then((r) =>
      r.ok ? r.json() : [],
    );
    host.innerHTML = '';
    list.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card';
      const title = item.title?.[state.lang] || item.title?.en || '';
      const body = item.body?.[state.lang] || item.body?.en || '';
      card.innerHTML = `<h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p>`;
      host.appendChild(card);
    });
  } catch {
    // keep empty on error
  }
}

// run on first load and when language toggles
document.addEventListener('DOMContentLoaded', loadHighlights);

// --- QA quick checks ---
function runQA() {
  const misses = [];
  // quick presence checks for new groups
  [
    'virgin.svg',
    'consumer-cellular.svg',
    'uscellular.svg',
    'optimum.svg',
    'cox.svg',
    'telus.svg',
    'koodo.svg',
    'bell.svg',
    'samsung.svg',
    'ubreakifix.svg',
    'rsg.svg',
    'homeplus.svg',
    'applianceplus.svg',
    'vz-hdp.svg',
    'att-htp.svg',
  ]
    .forEach((n) => {
      fetch('/assets/' + n, { method: 'HEAD' })
        .then((r) => {
          if (!r.ok) {
            misses.push('/assets/' + n);
            logQA('Missing asset: /assets/' + n);
          }
        })
        .catch(() => {
          misses.push('/assets/' + n);
          logQA('Missing asset: /assets/' + n);
        });
    });
  ['SAMSUNG.json', 'VIRGIN.json'].forEach((n) => {
    fetch('/carriers/' + n, { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) {
          misses.push('/carriers/' + n);
          logQA('Missing carrier json: /carriers/' + n);
        }
      })
      .catch(() => {
        misses.push('/carriers/' + n);
        logQA('Missing carrier json: /carriers/' + n);
      });
  });
  // final summary (async best-effort; slight delay to collect results)
  setTimeout(() => {
    if (misses.length) logQA('QA misses: ' + misses.join(', '));
  }, 600);
}

/* ================================
   BUCKET VIEWS (Denials / RPFR / FMIP)
   Single paste: drop at the bottom of /app.js
   ================================ */

(function bucketViewsInit(){
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

  // ---- 1) Create "Routed Buckets" section in the sidebar (no HTML edits needed)
  const sidebar = $('#sidebar');
  if (sidebar && !$('#bucketSection')) {
    const title = document.createElement('div');
    title.className = 'side-title';
    title.textContent = 'Routed Buckets';
    title.id = 'bucketSection';

    const list = document.createElement('ul');
    list.className = 'nav';
    list.innerHTML = `
  <li data-open="tools:copilot">🤖 Copilot</li>
      <li data-open="bucket:denials">🚨 Denials</li>
      <li data-open="bucket:rpfr">💳 RPFR</li>
      <li data-open="bucket:fmip">📱 FMIP</li>
    `;

    sidebar.appendChild(title);
    sidebar.appendChild(list);

    // hook the new openers
    list.querySelectorAll('[data-open]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const key = el.getAttribute('data-open');
        if(key?.startsWith('bucket:')){
          const name = key.split(':')[1];
          openBucket(name);
        }
      });
    });
  }

  // ---- 2) Inject a generic Bucket Modal into DOM (still no HTML file edits)
  if (!$('#modal-bucket')) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.id = 'modal-bucket';
    wrap.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="bucketTitle">
        <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h3 id="bucketTitle" style="margin:0">Bucket</h3>
          <div style="display:flex;gap:8px">
            <button class="btn secondary" id="bucketExport">Export JSON</button>
            <button class="btn secondary" id="bucketClear">Clear</button>
            <button class="btn secondary" data-close>Close</button>
          </div>
        </header>
        <div class="content">
          <div id="bucketMeta" class="muted" style="margin-bottom:8px"></div>
          <div id="bucketEmpty" class="muted" style="display:none">No items yet. Use SmartDrop to route content here.</div>
          <div id="bucketList" style="display:grid;gap:10px"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    // close handlers (backdrop & button)
    wrap.addEventListener('click', (e)=>{ if(e.target===wrap) closeModal(wrap); });
    wrap.querySelector('[data-close]')?.addEventListener('click', ()=> closeModal(wrap));
  }

  // ---- 3) Local helpers
  const BKT_LABEL = { denials: 'Denials', rpfr: 'RPFR', fmip: 'FMIP' };
  function readBucket(name){
    try { return JSON.parse(localStorage.getItem('cst_bucket:'+name) || '[]'); }
    catch { return []; }
  }
  function writeBucket(name, arr){
    localStorage.setItem('cst_bucket:'+name, JSON.stringify(arr||[]));
  }
  function fmtDate(ts){
    try{ return new Date(ts).toLocaleString(); } catch { return ''+ts; }
  }
  function fmtBytes(n){
    const b = Number(n)||0; if(b<1024) return b+' B';
    const u=['KB','MB','GB']; let i=-1, s=b;
    do { s/=1024; i++; } while (s>=1024 && i<u.length-1);
    return s.toFixed(s<10?2:1)+' '+u[i];
  }
  async function copyText(s){
    try{ await navigator.clipboard.writeText(s||''); showToast?.('Copied'); }catch{ showToast?.('Copy failed','warn'); }
  }
  function downloadJSON(filename, data){
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  // ---- 4) Renderer
  function renderBucket(name){
    const arr = readBucket(name);
    const modal = $('#modal-bucket');
    const list = $('#bucketList');
    const empty = $('#bucketEmpty');
    const meta = $('#bucketMeta');

    if (!modal || !list || !empty || !meta) return;
    $('#bucketTitle').textContent = `${BKT_LABEL[name] || name} Bucket`;
    meta.textContent = `${arr.length} item(s) · key: cst_bucket:${name}`;

    list.innerHTML = '';
    if (!arr.length){
      empty.style.display = 'block';
      list.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    list.style.display = 'grid';

    arr
    // newest first
    .slice().sort((a,b)=>(b?.ts||0)-(a?.ts||0))
    .forEach((it, idx)=>{
      // tolerant fields
      const title = it?.name || it?.fileName || `Item ${idx+1}`;
      const when = fmtDate(it?.ts || Date.now());
      const type = it?.type || it?.mime || 'text/plain';
      const size = fmtBytes(it?.size || (it?.text? it.text.length : 0));
      const text = (it?.text || it?.content || '').toString();

      const card = document.createElement('article');
      card.className = 'tile';
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</div>
          <div class="muted" style="font-size:12px">${when}</div>
        </div>
        <div class="muted" style="font-size:12px;margin:6px 0">${type} · ${size}</div>
        <textarea readonly rows="5" style="width:100%;resize:vertical;background:var(--panel-2);border:1px solid var(--border);color:var(--ink);padding:8px;border-radius:8px">${text}</textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button class="btn secondary" data-act="copy">Copy</button>
          <button class="btn secondary" data-act="remove">Remove</button>
        </div>
      `;
      card.querySelector('[data-act="copy"]')?.addEventListener('click', ()=> copyText(text));
      card.querySelector('[data-act="remove"]')?.addEventListener('click', ()=>{
        const fresh = readBucket(name);
        const idxToRemove = fresh.findIndex(x => (x?.id && x.id===it.id) || x===it);
        if (idxToRemove>-1) { fresh.splice(idxToRemove,1); writeBucket(name, fresh); }
        renderBucket(name);
      });
      list.appendChild(card);
    });

    // wire Export/Clear
    $('#bucketExport')?.addEventListener('click', ()=> {
      const data = readBucket(name);
      downloadJSON(`cst-${name}-bucket.json`, data);
    });
    $('#bucketClear')?.addEventListener('click', ()=> {
      // eslint-disable-next-line no-alert
      if (!window.confirm(`Clear all items from ${BKT_LABEL[name]||name}?`)) return;
      writeBucket(name, []);
      renderBucket(name);
      showToast?.('Bucket cleared.');
    });
  }

  // ---- 5) Open/Close helpers (reuse app modal UX)
  function openBucket(name){
    renderBucket(name);
    const modal = $('#modal-bucket');
    if (!modal) return;
    modal.style.display='flex';
    document.body.style.overflow='hidden';
  }
  function closeModal(el){
    const mb = el?.closest?.('.modal-backdrop') || el;
    if(mb){ mb.style.display='none'; document.body.style.overflow=''; }
  }

  // ---- 6) Also hook global [data-open] if app added more later
  $$('[data-open]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.getAttribute('data-open');
      if(key?.startsWith?.('bucket:')) openBucket(key.split(':')[1]);
    });
  });

  // Optional: QA log hint
  try {
    const sizes = ['denials','rpfr','fmip'].map(n=>`${n}:${(readBucket(n)||[]).length}`).join(' | ');
    (window.logQA||console.debug)(`Buckets: ${sizes}`);
  } catch { /* noop */ }
})();

// ---- Contrast safety: enable .high-contrast when ratios are low ----
function ensureContrast(){
  try{
    const cs = (el,prop) => getComputedStyle(el).getPropertyValue(prop).trim();
    const body = document.body;
    const bg = cs(body,'background-color');
    const ink = cs(body,'color');
    const ratio = contrastRatio(bg, ink);
    const tile = document.querySelector('.tile') || body;
    const tbg = cs(tile,'background-color');
    const tink = cs(tile,'color') || ink;
    const tratio = contrastRatio(tbg, tink);
    if (ratio < 4.3 || tratio < 4.3){
      document.documentElement.classList.add('high-contrast');
    }
  }catch{/* noop */}
}
function contrastRatio(bg, fg){
  function toRGB(x){
    const m = x && x.match && x.match(/rgba?\(([^)]+)\)/i); if(!m) return [0,0,0];
    const p = m[1].split(',').map(s=>parseFloat(s.trim()));
    return p.length>=3? [p[0],p[1],p[2]] : [0,0,0];
  }
  function rel(c){
    const s = c/255; return s<=0.03928? s/12.92 : Math.pow((s+0.055)/1.055, 2.4);
  }
  const [r1,g1,b1] = toRGB(bg), [r2,g2,b2] = toRGB(fg);
  const L1 = 0.2126*rel(r1)+0.7152*rel(g1)+0.0722*rel(b1)+1e-4;
  const L2 = 0.2126*rel(r2)+0.7152*rel(g2)+0.0722*rel(b2)+1e-4;
  const a = Math.max(L1,L2), b = Math.min(L1,L2);
  return (a+0.05)/(b+0.05);
}

// Dev helper: cycle themes and print contrast ratios
try {
  window._themeAudit = function(){
    const themes = ['theme-dark','theme-light','theme-glass'];
    const root = document.documentElement;
    themes.forEach((t, i)=>{
      setTimeout(()=>{
        root.classList.remove('theme-dark','theme-light','theme-glass');
        root.classList.add(t);
        setTimeout(()=>{
          const bg = getComputedStyle(document.body).backgroundColor;
          const ink = getComputedStyle(document.body).color;
          console.log(`[${t}] body contrast`, contrastRatio(bg, ink).toFixed(2));
        }, 30);
      }, i*80);
    });
  };
} catch { /* noop */ }

/* =========================================
   BUCKET ➜ COPILOT COMPOSE WIRING
   Drop at the bottom of /app.js
   ========================================= */

(function bucketToCopilot(){
  // (intentionally no local $/$$ helpers to satisfy lint rules)

  // ---- Templates per bucket
  function buildBucketPrompt(kind, itemText){
    const who = (JSON.parse(localStorage.getItem('cst_profile')||'null')?.first) || 'Agent';
    const lang = (localStorage.getItem('cst_lang')||localStorage.getItem('lang')||'en').toUpperCase();
    const bilingual = localStorage.getItem('cst_bilingual')==='1';

    const header = `You are CST Copilot. Return:\n1) Chat Script (${lang}${bilingual?'+ES':''})\n2) Alpha Note\n3) Tag\n4) Email (if needed)\n`;
    const context = `Expert: ${who}\nSource bucket: ${String(kind||'general').toUpperCase()}\n---\n` + (itemText||'').trim();

    if (kind === 'denials') {
      return `${header}\nDenial context below. Produce SERVE/SOLVE/SELL.\n${context}`;
    }
    if (kind === 'rpfr') {
      return `${header}\nRPFR (Retail Purchase For Reimbursement) case. Summarize deductible handling and refund path.\n${context}`;
    }
    if (kind === 'fmip') {
      return `${header}\nFMIP (Find My iPhone) override coaching. Return customer-facing steps + internal Alpha.\n${context}`;
    }
    return `${header}\nGeneral CST assistance.\n${context}`;
  }

  // ---- Open Copilot with text (adapts to existing Copilot UI in this app)
  function openCopilotWith(kind, text){
    // Ensure Copilot section exists
    if (!document.getElementById('copilotSection')) {
      try { initCopilot(); renderCopilotUI(); } catch { /* noop */ }
    }
    // Fill the additional instructions textarea with the built prompt
    const prompt = buildBucketPrompt(kind, text||'');
    const box = document.getElementById('copilotInput');
    if (box){ box.value = prompt; box.focus(); }
    // Scroll into view and auto-trigger generation
    const sec = document.getElementById('copilotSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const runBtn = document.getElementById('copilotRun');
    if (runBtn) runBtn.click();
  }

  // expose globally so other modules can call later if needed
  try { window.openCopilotWith = openCopilotWith; } catch { /* noop */ }

  // ---- Patch bucket modal to add "Compose All"
  const patchComposeHeader = () => {
    const bucketModal = document.getElementById('modal-bucket');
    if (bucketModal && !bucketModal.dataset.composePatched){
      bucketModal.dataset.composePatched = '1';
      const hdr = bucketModal.querySelector('header div');
      if (hdr){
        const btn = document.createElement('button');
        btn.className = 'btn secondary';
        btn.id = 'bucketComposeAll';
        btn.textContent = 'Compose All';
        hdr.insertBefore(btn, hdr.firstChild);

        btn.addEventListener('click', ()=>{
          const title = (document.getElementById('bucketTitle')?.textContent || 'Bucket').toLowerCase();
          const name = title.includes('denials') ? 'denials' : title.includes('rpfr') ? 'rpfr' : title.includes('fmip') ? 'fmip' : 'general';
          let data = [];
          try { data = JSON.parse(localStorage.getItem('cst_bucket:'+name) || '[]'); } catch { /* noop */ }
          const merged = (data||[])
            .slice()
            .sort((a,b)=>(b?.ts||0)-(a?.ts||0))
            .map(it => (it?.text || it?.content || '')).filter(Boolean)
            .join('\n\n—\n\n');
          if (!merged) { (window.showToast||alert)('Bucket is empty.'); return; }
          openCopilotWith(name, merged);
        });
      }
    }
  };
  patchComposeHeader();

  // ---- Add per-item "Compose" button when bucket renders (observe list)
  const list = document.getElementById('bucketList');
  if (list){
    const mo = new MutationObserver(()=>{
      patchComposeHeader();
      list.querySelectorAll('article.tile').forEach(card=>{
        if (card.dataset.composeWired) return;
        card.dataset.composeWired = '1';
        const btnRow = card.querySelector('div[style*="justify-content:flex-end"]');
        if (btnRow){
          const compose = document.createElement('button');
          compose.className = 'btn secondary';
          compose.textContent = 'Compose';
          compose.addEventListener('click', ()=>{
            const txt = (card.querySelector('textarea')?.value || '');
            const title = (document.getElementById('bucketTitle')?.textContent || '').toLowerCase();
            const name = title.includes('denials') ? 'denials' : title.includes('rpfr') ? 'rpfr' : title.includes('fmip') ? 'fmip' : 'general';
            openCopilotWith(name, txt);
          });
          btnRow.insertBefore(compose, btnRow.firstChild);
        }
      });
    });
    mo.observe(list, { childList:true, subtree:true });
  }
})();
