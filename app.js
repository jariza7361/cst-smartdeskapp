// ========================= i18n =========================
const dict = {
  en: {
    uiLanguage: 'UI Language',
    bilingual: 'Bilingual scripting',
    bilingualHint: 'Return EN + ES scripts',
    sdTitle: 'SmartDrop Upload (MVP)',
    sdHint: 'Drop PDF/DOCX/EML/TXT/CSV/JSON here or use the picker.',
    drop: 'Drag & drop files here',
    or: 'or',
    routeLbl: 'Routing note (optional)',
    output: 'Output',
    processed: (n) => `Processed ${n} file(s). Saved to local library.`,
    ngTitle: 'Note Generator',
    ngHint: 'Type a brief summary; output is auto‑prefixed with greeting + agent name. If “Bilingual” is ON, you’ll get EN and ES.',
    ngInLbl: 'Summary',
    ngOutLbl: 'Output',
    settings: 'Settings',
    profileSetup: 'Profile Setup',
    stTitle: 'Settings',
    stTheme: 'Theme',
    stBiDefault: 'Bilingual default',
    stBiHint: 'Keep bilingual ON by default'
  },
  es: {
    uiLanguage: 'Idioma de la interfaz',
    bilingual: 'Guiones bilingües',
    bilingualHint: 'Devolver EN + ES',
    sdTitle: 'Carga SmartDrop (MVP)',
    sdHint: 'Suelta PDF/DOCX/EML/TXT/CSV/JSON aquí o usa el selector.',
    drop: 'Arrastra y suelta archivos aquí',
    or: 'o',
    routeLbl: 'Nota de enrutamiento (opcional)',
    output: 'Salida',
    processed: (n) => `Procesado(s) ${n} archivo(s). Guardado en la biblioteca local.`,
    ngTitle: 'Generador de notas',
    ngHint: 'Escribe un resumen; la salida incluye saludo + nombre del agente. Si “Bilingüe” está activo, obtendrás EN y ES.',
    ngInLbl: 'Resumen',
    ngOutLbl: 'Salida',
    settings: 'Ajustes',
    profileSetup: 'Configuración de perfil',
    stTitle: 'Ajustes',
    stTheme: 'Tema',
    stBiDefault: 'Predeterminar bilingüe',
    stBiHint: 'Mantener bilingüe activado por defecto'
  }
};

// ========================= state =========================
const state = {
  uiLang: localStorage.getItem('uiLang') || 'en',
  bilingual: localStorage.getItem('bilingual') === '1',
  biDefault: localStorage.getItem('biDefault') === '1',
  theme: localStorage.getItem('theme') || 'dark', // dark|light|glass
  files: [],
  profile: JSON.parse(localStorage.getItem('cst_profile') || 'null'),
};

const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const out = (obj) => { $('#out').textContent = JSON.stringify(obj, null, 2); };

function t() { return dict[state.uiLang] || dict.en; }
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
function saludo() {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

// ========================= UI language & labels =========================
function applyLang() {
  $('#lbl-ui-lang').textContent = t().uiLanguage;
  $('#lbl-bilingual').textContent = t().bilingual;
  $('#bilingualHint').textContent = t().bilingualHint;

  $('#sd_title').textContent = t().sdTitle;
  $('#sd_hint').textContent = t().sdHint;
  $('#dropText').textContent = t().drop;
  $('#dropSub').textContent = t().or;
  $('#sd_route_lbl').textContent = t().routeLbl;

  $('#out_title').textContent = t().output;

  $('#ng_title').textContent = t().ngTitle;
  $('#ng_hint').textContent = t().ngHint;
  $('#ng_in_lbl').textContent = t().ngInLbl;
  $('#ng_out_lbl').textContent = t().ngOutLbl;

  $('#st_title').textContent = t().stTitle;
  $('#st_theme_lbl').textContent = t().stTheme;
  $('#st_bi_lbl').textContent = t().stBiDefault;
  $('#st_bi_hint').textContent = t().stBiHint;

  $('#openSettings').textContent = t().settings;
  $('#profileTitle').textContent = t().profileSetup;
}
function applyTheme() {
  document.body.classList.remove('theme-dark','theme-light','theme-glass');
  document.body.classList.add(`theme-${state.theme}`);
}
applyLang();
applyTheme();

// header controls
const uiLang = $('#uiLang');
const bilingual = $('#bilingual');
uiLang.value = state.uiLang;
bilingual.checked = state.bilingual;

uiLang.addEventListener('change', () => {
  state.uiLang = uiLang.value;
  localStorage.setItem('uiLang', state.uiLang);
  applyLang();
});

bilingual.addEventListener('change', () => {
  state.bilingual = bilingual.checked;
  localStorage.setItem('bilingual', state.bilingual ? '1' : '0');
});

// ========================= Settings (theme + bilingual default) =========================
const themeSel = $('#theme');
const biDefault = $('#st_bi_default');
themeSel.value = state.theme;
biDefault.checked = state.biDefault;

themeSel.addEventListener('change', ()=>{
  state.theme = themeSel.value;
  localStorage.setItem('theme', state.theme);
  applyTheme();
});
biDefault.addEventListener('change', ()=>{
  state.biDefault = biDefault.checked;
  localStorage.setItem('biDefault', state.biDefault ? '1' : '0');
  // optionally sync the header bilingual toggle to match default
  if (state.biDefault) {
    state.bilingual = true;
    localStorage.setItem('bilingual','1');
    $('#bilingual').checked = true;
  }
});

// ========================= Profile Setup / Settings modal =========================
const back = $('#profileBack');
const openSettings = $('#openSettings');
const reopenProfile = $('#reopenProfile');
const btnSave = $('#profileSave');
const btnCancel = $('#profileCancel');

function showProfileModal() {
  const p = state.profile || {};
  $('#p_first').value = p.first || '';
  $('#p_last').value  = p.last  || '';
  $('#p_id').value    = p.id    || '';
  $('#p_ext').value   = p.ext   || '';
  $('#p_coach').value = p.coach || '';
  $('#p_lang').value  = p.lang  || state.uiLang || 'en';
  $('#p_nosplash').checked = p.nosplash === '1';
  back.style.display = 'flex';
}
function hideProfileModal() { back.style.display = 'none'; }

openSettings.addEventListener('click', showProfileModal);
reopenProfile.addEventListener('click', showProfileModal);
btnCancel.addEventListener('click', hideProfileModal);
back.addEventListener('click', (e)=>{ if(e.target === back) hideProfileModal(); });

btnSave.addEventListener('click', ()=>{
  const profile = {
    first: $('#p_first').value.trim(),
    last:  $('#p_last').value.trim(),
    id:    $('#p_id').value.trim(),
    ext:   $('#p_ext').value.trim(),
    coach: $('#p_coach').value.trim(),
    lang:  $('#p_lang').value,
    nosplash: $('#p_nosplash').checked ? '1' : '0'
  };
  state.profile = profile;
  localStorage.setItem('cst_profile', JSON.stringify(profile));
  state.uiLang = profile.lang || state.uiLang;
  localStorage.setItem('uiLang', state.uiLang);
  uiLang.value = state.uiLang;
  applyLang();
  hideProfileModal();
});

// First run: if no profile or not “don’t show again”, open it once
(function maybeAskProfile(){
  const p = state.profile;
  if (!p || p.nosplash !== '1') {
    showProfileModal();
  }
})();

// ========================= Note Generator (bilingual aware) =========================
$('#ng_gen').addEventListener('click', ()=>{
  const base = ($('#ng_in').value || '').trim();
  const agent = state.profile?.first ? `${state.profile.first}` : 'Agent';
  const en = `${greeting()}, this is ${agent} with CST.\n\n${base}`;
  if (!(state.bilingual || state.biDefault)) {
    $('#ng_out').textContent = en;
    return;
  }
  // Simple ES rendering; can swap for real translation later
  const es = `${saludo()}, soy ${agent} de CST.\n\n${base}`;
  $('#ng_out').textContent = `EN:\n${en}\n\nES:\n${es}`;
});

// ========================= SmartDrop (client + server queue) =========================
const dropZone = $('#dropZone');
const picker = $('#filePicker');
const list = $('#sdList');

['dragenter','dragover'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.add('dragover');
  })
);
['dragleave','drop'].forEach(evt =>
  dropZone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.remove('dragover');
  })
);

dropZone.addEventListener('drop', (e) => {
  const files = [...(e.dataTransfer?.files || [])];
  queueFiles(files);
});
picker.addEventListener('change', (e) => {
  const files = [...(e.target.files || [])];
  queueFiles(files);
});

function queueFiles(files) {
  files.forEach(f => {
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    state.files.push({ name: f.name, size: f.size, type: f.type, ext, _file: f });
  });
  renderList();
}

function renderList() {
  if (!state.files.length) { list.innerHTML = '<div class="muted">No files yet.</div>'; return; }
  list.innerHTML = state.files.map((f,i)=>`
    <div class="item">
      <div>${i+1}. ${f.name} <span class="muted">(${Math.round(f.size/1024)} KB)</span></div>
      <div><button data-rm="${i}">Remove</button></div>
    </div>
  `).join('');
  $$('button[data-rm]').forEach(b=> b.addEventListener('click', (e)=>{
    const i = +e.currentTarget.getAttribute('data-rm');
    state.files.splice(i,1); renderList();
  }));
}
renderList();

$('#clear').addEventListener('click', ()=>{ state.files = []; renderList(); out({ cleared:true }); });

$('#process').addEventListener('click', async ()=>{
  const route = $('#sdRoute').value.trim();
  const results = [];
  for (const item of state.files) {
    const text = await extractText(item._file, item.ext); // now calls server for PDF/Office
    results.push({
      name: item.name, ext: item.ext, size: item.size, type: item.type, route, text
    });
  }
  saveLibrary(results);
  out({ ok:true, message: t().processed(results.length), savedCount: results.length });
  state.files = [];
  renderList();
});

// extraction – uses server queue for PDF/Office, client for texty files
async function extractText(file, ext) {
  try {
    if (['txt','csv','json','md','eml','rtf','log'].includes(ext)) {
      return await file.text();
    }
    // Use server extractor (queue)
    if (['pdf','doc','docx','xlsx','pptx'].includes(ext)) {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/enqueue', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name: file.name, ext, data: base64 })
      });
      const job = await res.json(); // {jobId}
      // poll until done (simple MVP)
      const text = await pollJob(job.jobId, 30, 400); // up to ~12s
      return text;
    }
    return await file.text(); // fallback
  } catch (e) {
    return `[Extraction error: ${e?.message||e}]`;
  }
}
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(String(r.result).split(',').pop());
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
async function pollJob(jobId, tries, delayMs){
  for(let i=0;i<tries;i++){
    const r = await fetch(`/api/job?id=${encodeURIComponent(jobId)}`);
    const j = await r.json(); // {status:'queued'|'processing'|'done'|'error', result?}
    if (j.status === 'done') return j.result || '';
    if (j.status === 'error') return `[Server extractor error: ${j.error}]`;
    await new Promise(res=> setTimeout(res, delayMs));
  }
  return '[Server extractor timed out; try again.]';
}

// local library store
function saveLibrary(items) {
  const key = 'cst_library';
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const now = Date.now();
  items.forEach(it => it.savedAt = now);
  const all = [...items, ...existing].slice(0, 200);
  localStorage.setItem(key, JSON.stringify(all));
}

// ========================= API ping =========================
$('#pingApi').addEventListener('click', async ()=>{
  try{
    const res = await fetch('/api/copilot');
    const data = await res.json();
    out({ ok:true, api:data });
  }catch(e){
    out({ ok:false, error:String(e) });
  }
});