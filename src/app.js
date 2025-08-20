import { createI18n } from './utils/i18n.js';
import { buildPrompt } from './utils/copilot.js';
import { parseText } from './utils/parser.js';

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

  // SHOW SPLASH (new)
  initSplash();

  // theme + listeners...
  applyTheme(loadSettings()?.theme || 'light');
  document.getElementById('langToggle').addEventListener('click', toggleLang);

  // setup wizard
  const onboarded = localStorage.getItem('onboarded') === '1';
  const wiz = document.getElementById('setupWizard');
  document.getElementById('openSettings').addEventListener('click', () => wiz.showModal());
  document.getElementById('wizardSave').addEventListener('click', onSaveWizard);
  state.settings = loadSettings();

  if (!onboarded) {
    wiz.showModal();
  }

  // tests modal
  const testsModal = document.getElementById('testsModal');
  document.getElementById('openTests').addEventListener('click', () => testsModal.showModal());
  document.getElementById('testsClose').addEventListener('click', () => testsModal.close());
  document.getElementById('testsFetchBtn').addEventListener('click', runFetchTest);

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
    state.cspViolations.push(`${e.violatedDirective} @ ${e.blockedURI || 'inline'}`);
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

// --- replace your existing showSplash() with this ---
function initSplash() {
  const el = document.getElementById('splash');
  if (!el) return;

  // respect prior dismiss/onboarding
  const dismissed = localStorage.getItem('cst.splash.dismissed') === '1';
  const onboarded = localStorage.getItem('onboarded') === '1';
  if (dismissed || onboarded) return;

  // actually show it
  el.hidden = false; // ⬅️ key fix: unhide
  requestAnimationFrame(() => {
    el.classList.add('show'); // optional animation class
  });

  // buttons
  const start = document.getElementById('splashStart');
  const dismiss = document.getElementById('splashDismiss');

  start?.addEventListener('click', () => {
    el.hidden = true;
    // guide user into the setup wizard on first use
    document.getElementById('setupWizard')?.showModal();
  });

  dismiss?.addEventListener('click', () => {
    el.hidden = true;
    localStorage.setItem('cst.splash.dismissed', '1');
  });
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
  document.documentElement.classList.toggle('theme-dark', name === 'dark');
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
    <div id="copilotOutput" style="display:flex;gap:1rem">
      <div style="flex:1">
        <h3 id="copilotEnLabel"></h3>
        <pre id="copilotEn" class="preview"></pre>
        <button id="copilotCopyEn"></button>
      </div>
      <div style="flex:1">
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
  const list = ['/app.js', '/assets/logo.svg', '/api/fetch'];
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
  state.urlTest = Object.fromEntries(results);
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

  // 4-point URL (3 here; index.html is implicit)
  const u = state.urlTest || {};
  const urlOk = ['/app.js', '/assets/logo.svg', '/api/fetch'].every((p) => u[p]);
  items.push(mark('4-point URL test', JSON.stringify(u), urlOk));

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
