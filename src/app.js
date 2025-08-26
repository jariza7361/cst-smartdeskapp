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
};
let splashMsgTimer = null;
let splashAnimDone = false;
let splashAssetsDone = false;
let splashPct = 0;
let splashPctTimer = null;
let splashKeyHandler = null;

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
  const adminOk = localStorage.getItem('cst_admin') === '1';
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
  // language
  const lang = localStorage.getItem('lang') || 'en';
  state.i18n = await createI18n(lang);
  state.lang = lang;
  // localize static title immediately
  localizeStatic();
  // splash behavior: first visit auto; button to re-open
  const firstVisit = CODEX || localStorage.getItem('welcomeSeen') !== '1';
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

  // theme + listeners... Use light theme in Codex mode
  applyTheme(CODEX ? 'light' : 'dark');
  document.getElementById('langToggle').addEventListener('click', toggleLang);

  // setup wizard
  const wiz = document.getElementById('setupWizard');
  document.getElementById('openSettings').addEventListener('click', () => wiz.showModal());
  document.getElementById('wizardSave').addEventListener('click', onSaveWizard);
  state.settings = loadSettings();

  // tests modal
  const testsModal = document.getElementById('testsModal');
  document.getElementById('openTests').addEventListener('click', () => testsModal.showModal());
  document.getElementById('testsClose').addEventListener('click', () => testsModal.close());
  document.getElementById('testsFetchBtn').addEventListener('click', runFetchTest);
  // Tests: wire Doctor and OCR status badge
  document.getElementById('t_run_doctor')?.addEventListener('click', runDoctorTest);
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
  // Redirect (if configured) right after splash hides
  if (state.redirectTo) setTimeout(() => safeRedirect(state.redirectTo), 60);
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
    empId: val('#wEmpId'),
    ext: val('#wExt'),
    theme: val('#wTheme'),
  };
  if (!s.name || !s.empId || !s.ext) return; // native required also guards
  saveSettings(s);
  localStorage.setItem('splashSeen', '1');
  if (document.getElementById('dontShow').checked) {
    localStorage.setItem('onboarded', '1');
  }
  document.getElementById('setupWizard').close();
  renderStatus();
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
  el.classList.remove('theme-light', 'theme-dark', 'theme-glass');
  if (name === 'glass') el.classList.add('theme-glass');
  else if (name === 'light') el.classList.add('theme-light');
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
  } catch {}
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
  if (log) log.textContent = 'Doctor: running…';
  try {
    const r = await fetch('/api/doctor');
    const j = await r.json();
    if (log) log.textContent = JSON.stringify(j, null, 2);
    checkOCRStatus();
    showToast(j.ok ? 'Doctor passed' : 'Doctor found issues');
  } catch (e) {
    if (log) log.textContent = 'Doctor error: ' + (e?.message || e);
    showToast('Doctor error', 'warn');
  }
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
  sec.innerHTML = `
    <h2 id="copilotTitle"></h2>
    <label><span id="copilotSampleLabel"></span><select id="copilotSample"></select></label>
    <label><span id="copilotInputLabel"></span><textarea id="copilotInput"></textarea></label>
    <button id="copilotRun"></button>
    <div id="copilotOutput" class="copilot-output">
      <div class="copilot-col">
        <h3 id="copilotEnLabel"></h3>
        <pre id="copilotEn" class="preview"></pre>
        <button id="copilotCopyEn"></button>
      </div>
      <div class="copilot-col">
        <h3 id="copilotEsLabel"></h3>
        <pre id="copilotEs" class="preview"></pre>
        <button id="copilotCopyEs"></button>
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
      if (!confirm(`Clear all items from ${BKT_LABEL[name]||name}?`)) return;
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
  } catch {}
})();

/* =========================================
   BUCKET ➜ COPILOT COMPOSE WIRING
   Drop at the bottom of /app.js
   ========================================= */

(function bucketToCopilot(){
  const $ = (s,c=document)=>c.querySelector(s);
  const $$= (s,c=document)=>Array.from(c.querySelectorAll(s));

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
      try { initCopilot(); renderCopilotUI(); } catch {}
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
  try { window.openCopilotWith = openCopilotWith; } catch {}

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
          try { data = JSON.parse(localStorage.getItem('cst_bucket:'+name) || '[]'); } catch {}
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
