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
};
let splashMsgTimer = null;
let splashAnimDone = false;
let splashAssetsDone = false;
let splashPct = 0;
let splashPctTimer = null;
let splashKeyHandler = null;

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
      logQA(`Tool open → ${toolMap[key]} (TODO: modal/panel)`);
      showToast(toolMap[key]);
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
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error();
    outEn.textContent = data.en || '';
    outEs.textContent = data.es || '';
    msg.hidden = true;
  } catch {
    msg.textContent = state.i18n.t('Set OPENAI_API_KEY in Vercel to enable Copilot.');
  }
  await checkCopilot();
}
async function copyText(id) {
  try {
    await navigator.clipboard.writeText(document.getElementById(id).textContent);
  } catch {
    /* noop */
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
