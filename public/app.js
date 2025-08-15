import { createI18n } from '/utils/i18n.js';
import { buildPrompt } from '/utils/copilot.js';

function ensureSeed() {
  const sel = document.querySelector('#copilotSample');
  if (!sel) return;
  if (!sel.options || sel.options.length === 0) {
    const o = document.createElement('option');
    o.value = 'serve_solve_sell';
    o.textContent = 'Serve / Solve / Sell (starter)';
    o.setAttribute(
      'data-prompt',
      'Create a concise, professional response that serves, solves, and sells. Include clear next steps and ask for confirmation.',
    );
    sel.appendChild(o);
  }
}
ensureSeed();

// Optional hydrate (append-only). Keep seed in place.
fetch('/copilot-prompts.json')
  .then((r) => (r.ok ? r.json() : []))
  .then((list) => {
    const sel = document.querySelector('#copilotSample');
    if (!sel || !Array.isArray(list)) return;
    const have = new Set([...sel.options].map((o) => o.value));
    for (const p of list) {
      if (!have.has(p.id)) {
        const o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.label;
        o.setAttribute('data-prompt', p.prompt);
        sel.appendChild(o);
      }
    }
  })
  .catch(() => {
    /* keep seed only */
  });

const state = {
  settings: null,
  i18n: null,
  cspViolations: [],
  lastFetchRun: null,
  copilotReachable: null,
  lang: 'en',
};

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  // language
  const lang = localStorage.getItem('lang') || 'en';
  state.i18n = await createI18n(lang);
  state.lang = lang;
  document.getElementById('langToggle').addEventListener('click', toggleLang);

  // setup wizard
  const onboarded = localStorage.getItem('onboarded') === '1';
  const wiz = document.getElementById('setupWizard');
  document.getElementById('openSettings').addEventListener('click', () => wiz.showModal());
  document.getElementById('wizardSave').addEventListener('click', onSaveWizard);
  state.settings = loadSettings();

  if (!onboarded) wiz.showModal();

  // tests modal
  const testsModal = document.getElementById('testsModal');
  document.getElementById('openTests').addEventListener('click', () => testsModal.showModal());
  document.getElementById('testsClose').addEventListener('click', () => testsModal.close());
  document.getElementById('testsFetchBtn').addEventListener('click', runFetchTest);

  initCopilot();
  renderCopilotUI();
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
  renderCopilotUI();
  renderStatus();
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
}
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('cst.settings') || '{}');
  } catch {
    return {};
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
    preview(parseToNormalizedRecord(text));
  } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    preview({ error: 'PDF parsing stub — add pdf.js (self-hosted) later.' });
  } else {
    preview({ error: `Unsupported type: ${file.type || file.name}` });
  }
}
function onPaste(e) {
  const text = e.clipboardData?.getData('text');
  if (text && text.length > 5) {
    preview(parseToNormalizedRecord(text));
  }
}
function preview(obj) {
  document.getElementById('preview').textContent = JSON.stringify(obj, null, 2);
}
function parseToNormalizedRecord(text) {
  // naive extractor demo; refine in Codex task D
  const lower = text.toLowerCase();
  return {
    carrier: (/verizon|at&t|cricket/.exec(lower) || ['unknown'])[0],
    fees: findSection(lower, /(fee|charge|surcharge)/g),
    dates: findSection(lower, /(effective|date|updated)/g),
    prohibited: findSection(lower, /(prohibit|not allowed|forbidden)/g),
    links: Array.from(text.matchAll(/https?:\/\/\S+/g)).map((m) => m[0]),
    rawLength: text.length,
    lang: localStorage.getItem('lang') || 'en',
  };
}
function findSection(text, rx) {
  const idx = text.search(rx);
  if (idx < 0) return null;
  return text.slice(idx, idx + 240);
}

// --- Copilot ---
function initCopilot() {
  const run = document.getElementById('copilotRun');
  if (!run) return;
  run.addEventListener('click', onCopilotRun);
  document
    .getElementById('copilotCopyEn')
    .addEventListener('click', () => copyText('copilotEn'));
  document
    .getElementById('copilotCopyEs')
    .addEventListener('click', () => copyText('copilotEs'));
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
}
async function onCopilotRun() {
  const sel = document.getElementById('copilotSample');
  const samplePrompt = sel.selectedOptions[0]?.getAttribute('data-prompt') || '';
  const user = document.getElementById('copilotInput').value;
  let context = null;
  try {
    const txt = document.getElementById('preview').textContent;
    if (txt) context = JSON.parse(txt);
  } catch {
    /* noop */
  }
  const prompt = buildPrompt(samplePrompt, user, context);
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
