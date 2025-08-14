const FALLBACK_PROMPTS = [
  {
    id: 'serve_solve_sell',
    label: 'Serve / Solve / Sell (starter)',
    prompt:
      'Create a concise, professional response that serves the customer, solves the stated issue, and sells the appropriate value-add. Include next steps.',
  },
];

function ensureCopilotPanel() {
  let root = document.getElementById('app');
  if (!root) {
    root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
  }
  // Build panel once if missing
  if (!document.getElementById('copilotPanel')) {
    const panel = document.createElement('section');
    panel.id = 'copilotPanel';
    panel.innerHTML = `
      <h1 id="title">CST SmartDesk</h1>
      <div id="copilot">
        <label for="copilotSample">Sample</label>
        <select id="copilotSample"></select>
        <label for="copilotInput">Input</label>
        <textarea id="copilotInput" rows="3" placeholder="Type extra details..."></textarea>
        <button id="copilotRun" type="button">Generate</button>
        <div id="results" style="margin-top:12px;">
          <div><strong>EN</strong></div>
          <div id="copilotEn" role="status"></div>
          <div style="margin-top:8px;"><strong>ES</strong></div>
          <div id="copilotEs" role="status"></div>
        </div>
      </div>
    `;
    root.replaceChildren(panel);
  }
}

function populateSelect(options) {
  const sel = document.getElementById('copilotSample');
  if (!sel) return;
  sel.innerHTML = ''; // reset
  for (const p of options) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    opt.dataset.prompt = p.prompt;
    sel.appendChild(opt);
  }
}

async function hydratePrompts() {
  try {
    const res = await fetch('/public/copilot-prompts.json', { cache: 'no-store' });
    if (!res.ok) return;
    const list = await res.json();
    if (Array.isArray(list) && list.length) populateSelect(list);
  } catch {
    /* ignore */
  }
}

async function runCopilot() {
  const sel = document.getElementById('copilotSample');
  const ta = document.getElementById('copilotInput');
  const enOut = document.getElementById('copilotEn');
  const esOut = document.getElementById('copilotEs');

  const selected = sel?.selectedOptions?.[0];
  const samplePrompt = selected?.dataset?.prompt || '';
  const user = (ta?.value || '').trim();
  const finalPrompt = [samplePrompt, user].filter(Boolean).join('\n---\n');

  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: finalPrompt }),
    });
    const data = await res.json().catch(() => ({}));
    enOut.textContent = data.en || '';
    esOut.textContent = data.es || '';
  } catch {
    enOut.textContent = '(error)';
    esOut.textContent = '(error)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ensureCopilotPanel();
  // Synchronous fallback so Playwright can select index:0 immediately
  populateSelect(FALLBACK_PROMPTS);
  // Then hydrate from JSON (if available)
  hydratePrompts();
  // Wire actions
  const btn = document.getElementById('copilotRun');
  btn?.addEventListener('click', runCopilot);
  // Minimal boot text for smoke
  const title = document.getElementById('title');
  if (title && !title.dataset.booted) {
    title.dataset.booted = '1';
  }
});
