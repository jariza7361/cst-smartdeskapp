// ===== Utilities & State =====
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const state = {
  lang: localStorage.getItem('cst_lang') || 'en',
  bilingual: localStorage.getItem('cst_bilingual') === 'on' ? 'on' : 'off',
  theme: localStorage.getItem('cst_theme') || 'dark',
  profile: JSON.parse(localStorage.getItem('cst_profile') || 'null'),
  nosplash: localStorage.getItem('cst_nosplash') === '1'
};

function saveProfile(p) {
  localStorage.setItem('cst_profile', JSON.stringify(p));
  state.profile = p;
}
function setLang(v) {
  state.lang = v; localStorage.setItem('cst_lang', v);
  const lbl = $('#langLabel'); if (lbl) lbl.textContent = v.toUpperCase();
}
function setBilingual(v) {
  state.bilingual = v; localStorage.setItem('cst_bilingual', v);
  const sel = $('#cp_bilingual'); if (sel) sel.value = v;
}
function setTheme(v) {
  state.theme = v; localStorage.setItem('cst_theme', v);
  document.documentElement.dataset.theme = v;
  // simple theme switches
  if (v === 'light') document.documentElement.style.setProperty('--bg', '#f7f8fc');
  else document.documentElement.style.setProperty('--bg', '#0d0d0f');
  if (v === 'glass') {
    document.body.style.backdropFilter = 'saturate(120%) blur(8px)';
  } else {
    document.body.style.backdropFilter = '';
  }
}
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
function showToast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1600);
}
function writeTray(text) {
  const tray = $('#tray'); const out = $('#trayOut');
  if (out) out.value = text || '';
  tray?.classList.remove('collapsed');
}

// ===== Splash =====
const QUOTES = [
  "Small steps done consistently beat big plans undone.",
  "Clarity first, then speed. You’ve got this.",
  "Serve → Solve → Sell: lead with empathy, finish with options.",
  "Measure twice. Paste once. Ship often."
];
function startSplash() {
  const s = $('#splash'); if (!s) return;
  if (state.nosplash) { s.style.display = 'none'; afterSplash(); return; }
  const q = $('#splashQuote'); if (q) q.textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  const bar = $('#splash .bar>div'); let p = 0;
  const timer = setInterval(() => {
    p = Math.min(100, p + 7 + Math.random() * 8);
    if (bar) bar.style.width = p + '%';
    if (p >= 100) { clearInterval(timer); s.style.display = 'none'; afterSplash(); }
  }, 180);
}
function afterSplash() {
  hydrateProfile();
  setTheme(state.theme);
  setLang(state.lang);
  setBilingual(state.bilingual);
}

// ===== Profile & Settings =====
function hydrateProfile() {
  const p = state.profile;
  const badge = $('#profileBadge');
  const name = p ? `${p.first || ''} ${p.last || ''}`.trim() : '';
  if (badge) badge.textContent = `👤 ${name || 'Agent'}${p ? ' | 🆔 '+(p.id||'—')+' | ☎️ '+(p.ext||'—') : ''}`;
  const wn = $('#welcomeName'); if (wn) wn.textContent = name ? ', ' + name.split(' ')[0] : '';
}

// Open/close modals
function openModal(id){ const m = document.getElementById(`modal-${id}`); if(m){ m.style.display='flex'; document.body.style.overflow='hidden'; } }
function closeModal(el){ const b = el?.closest('.modal-b'); if(b){ b.style.display='none'; document.body.style.overflow=''; } }
$$('[data-close]').forEach(b=> b.addEventListener('click', e => closeModal(e.target)));
$('#openSettings')?.addEventListener('click', ()=> openModal('settings'));
$('#openProfile')?.addEventListener('click', ()=> openModal('profile'));
$('#openProfile2')?.addEventListener('click', ()=> openModal('profile'));

// Drawer
const drawer = $('#drawer'), scrim = $('#scrim');
$('#openDrawer')?.addEventListener('click', ()=>{ drawer?.classList.add('open'); scrim?.classList.add('show'); });
scrim?.addEventListener('click', ()=>{ drawer?.classList.remove('open'); scrim?.classList.remove('show'); });

// Sidebar tiles
$$('.tile[data-open]').forEach(t => t.addEventListener('click', () => {
  const key = t.getAttribute('data-open');
  if (key) openModal(key);
}));

// Carrier Hub clicks (logo tiles)
$$('.logo-tile').forEach(el=>{
  el.addEventListener('click', ()=>{
    const c = el.getAttribute('data-carrier');
    // For now: run a T&C test fetch when Verizon is clicked, otherwise info
    if (c === 'VZW') runTncTest();
    showToast((c==='VZW'?'Verizon':c==='ATT'?'AT&T':c==='CRK'?'Cricket':c)+' selected');
  });
});

// Settings bindings
$('#themeSel')?.addEventListener('change', e => setTheme(e.target.value));
$('#bilingualDefault')?.addEventListener('change', e => setBilingual(e.target.value));
$('#langToggle')?.addEventListener('click', ()=> { setLang(state.lang==='en'?'es':'en'); showToast('Language: '+state.lang.toUpperCase()); });

// Profile form
$('#profileForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const p = {
    first: $('#p_first').value.trim(),
    last: $('#p_last').value.trim(),
    id: $('#p_id').value.trim(),
    ext: $('#p_ext').value.trim(),
    coach: $('#p_coach').value.trim(),
    lang: $('#p_lang').value,
    nosplash: $('#p_nosplash').checked
  };
  if (!p.first || !p.last || !p.id || !p.ext) { showToast('Fill required fields'); return; }
  saveProfile(p); setLang(p.lang || state.lang); hydrateProfile();
  if (p.nosplash) localStorage.setItem('cst_nosplash','1');
  showToast('Profile saved');
  closeModal($('#modal-profile .btn.secondary'));
});

// ===== Output tray =====
$('#trayToggle')?.addEventListener('click', ()=> $('#tray')?.classList.toggle('collapsed'));
$('#trayCopy')?.addEventListener('click', async ()=> {
  try { await navigator.clipboard.writeText($('#trayOut')?.value || ''); showToast('Copied'); }
  catch { showToast('Copy failed'); }
});

// ===== Copilot (Denials) =====
function parseDenialPrompt(input){
  // Try quick pattern: "denial: code (carrier)"
  const m = /denial:\s*([a-z0-9_ ]+)(?:\s*\((vzw|att|crk)\))?/i.exec(input);
  if (m) return { type:'denial', code: m[1].trim().replace(/\s+/g,'_'), carrier: (m[2]||'').toUpperCase() };
  // loose guesses
  const low = input.toLowerCase();
  const map = [
    ['no_airtime', /(no\s*air\s*time|no\s*usage)/],
    ['no_enrollment', /(no\s*enroll|not\s*enrolled)/],
    ['no_ins_at_tol', /(no\s*(ins|coverage).*(tol|time\s*of\s*loss))/],
    ['preexisting_damage', /(pre.?existing)/],
    ['active_imei_after_loss', /(active.*imei|used.*after.*loss)/],
    ['model_not_in_use_at_tol', /(model.*not.*in.*use|wrong.*model)/],
    ['eopa', /(eopa|program\s*abuse|evidence\s*of\s*program)/]
  ];
  for (const [code, rx] of map) if (rx.test(low)) return { type:'denial', code };
  return { type:'text', text: input };
}
async function callCopilot(payload){
  try{
    const res = await fetch('/api/copilot', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){
    return { error: String(err) };
  }
}
$('#cp_run')?.addEventListener('click', async ()=>{
  const raw = $('#cp_in').value.trim();
  const bilingual = $('#cp_bilingual').value || state.bilingual;
  const profName = state.profile ? (state.profile.first || 'Agent') : 'Agent';
  const parsed = parseDenialPrompt(raw);
  if (parsed.type !== 'denial') {
    writeTray(`${greeting()}, this is ${profName} with CST.\n\n${raw || 'Please enter a denial: <code>'}`);
    return;
  }
  const resp = await callCopilot({ type:'denial', code: parsed.code, carrier: parsed.carrier || '', bilingual, agent: profName });
  if (resp.error) { writeTray('Error: '+resp.error); return; }
  writeTray(resp.text || '');
});

// ===== Tests =====
$('#t_clipboard')?.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText('clipboard-ok'); showToast('Clipboard OK'); }catch{ showToast('Clipboard blocked'); }
});
$('#t_denials')?.addEventListener('click', async ()=>{
  const samples = ['denial: no_enrollment','denial: no_airtime (att)','denial: eopa (vzw)','denial: model_not_in_use_at_tol (crk)'];
  const outputs = [];
  for (const s of samples){
    const p = parseDenialPrompt(s);
    const r = await callCopilot({ type:'denial', code:p.code, carrier:p.carrier||'', bilingual:'off', agent: (state.profile?.first||'Agent') });
    outputs.push(`> ${s}\n${r.text}\n`);
  }
  $('#test_out').textContent = outputs.join('\n');
});
async function runTncTest(){
  const url = 'https://www.asurion.com/pdf/nw-consumer-vmp-25/';
  const res = await fetch(`/api/tnc-fetch?url=${encodeURIComponent(url)}`);
  const out = await res.json().catch(()=>({error:'parse failed'}));
  $('#test_out').textContent = JSON.stringify(out, null, 2);
  openModal('tests');
}
$('#t_tnc')?.addEventListener('click', runTncTest);

// ===== SmartDrop (stub) =====
$('#sd_queue')?.addEventListener('click', async ()=>{
  const files = $('#sd_files').files;
  const text = $('#sd_text').value.trim();
  const names = files ? Array.from(files).map(f=>f.name) : [];
  const res = await fetch('/api/smartdrop-queue', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ names, text, when: Date.now() }) });
  const data = await res.json().catch(()=>({error:'parse'}));
  $('#sd_status').textContent = data.error ? 'Error: '+data.error : `Queued id=${data.id}`;
});

// ===== Init =====
window.addEventListener('DOMContentLoaded', ()=>{
  // populate settings with saved values
  $('#themeSel') && ($('#themeSel').value = state.theme);
  $('#bilingualDefault') && ($('#bilingualDefault').value = state.bilingual);
  $('#cp_bilingual') && ($('#cp_bilingual').value = state.bilingual);
  setTheme(state.theme);
  setLang(state.lang);
  startSplash();
});