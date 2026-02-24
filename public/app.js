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
  // language
  const lang = localStorage.getItem('lang') || 'en';
  state.i18n = await createI18n(lang);
  state.lang = lang;
  // localize static title immediately
  localizeStatic();
  // splash behavior: first visit auto; button to re-open
  const firstVisit = localStorage.getItem('welcomeSeen') !== '1';
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
  if (firstVisit) showSplash();

  // Keep header always clickable over any decorative layers
  const top = document.querySelector('header.topbar');
  if (top) top.style.zIndex = '20';

  // theme + listeners...
  applyTheme(loadSettings()?.theme || 'light');
  const langToggle = document.getElementById('langToggle');
  langToggle?.addEventListener('click', toggleLang);

  // setup wizard
  const wiz = document.getElementById('setupWizard');
  const openSettings = document.getElementById('openSettings');
  openSettings?.addEventListener('click', () => wiz?.showModal());
  const wizardSave = document.getElementById('wizardSave');
  wizardSave?.addEventListener('click', onSaveWizard);
  state.settings = loadSettings();

  // tests modal
  const testsModal = document.getElementById('testsModal');
  const openTests = document.getElementById('openTests');
  openTests?.addEventListener('click', () => testsModal?.showModal());
  const testsClose = document.getElementById('testsClose');
  testsClose?.addEventListener('click', () => testsModal?.close());
  const testsFetchBtn = document.getElementById('testsFetchBtn');
  testsFetchBtn?.addEventListener('click', runFetchTest);

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
  if (dz) {
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('hover');
    });
    dz.addEventListener('dragleave', () => dz.classList.remove('hover'));
    dz.addEventListener('drop', onDrop);
  }
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
});

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
  if (bar) {
    const onEnd = () => {
      splashAnimDone = true;
      maybeCloseSplash();
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
  });
}

function maybeCloseSplash() {
  if (splashAnimDone && splashAssetsDone) {
    splashPct = 100;
    updatePct();
    hideSplash();
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
  if (name === 'dark') el.classList.add('theme-dark');
  else if (name === 'glass') el.classList.add('theme-glass');
  else el.classList.add('theme-light');
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
  // Updated for new markup: content is a section with class "content"
  const main = document.querySelector('.content');
  if (!main) return; // safety: don't crash if structure changes
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
