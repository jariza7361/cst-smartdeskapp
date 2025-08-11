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
    profileSetup: 'Profile Setup'
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
    profileSetup: 'Configuración de perfil'
  }
};

// ========================= state =========================
const state = {
  uiLang: localStorage.getItem('uiLang') || 'en',
  bilingual: localStorage.getItem('bilingual') === '1',
  files: [],
  profile: JSON.parse(localStorage.getItem('cst_profile') || 'null'), // {first,last,id,ext,coach,lang,nosplash}
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

// ========================= UI language & header =========================
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
  $('#openSettings').textContent = t().settings;
  $('#profileTitle').textContent = t().profileSetup;
}
applyLang();

// controls
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

// ========================= Profile Setup / Settings =========================
const back = $('#profileBack');
const openSettings = $('#openSettings');
const btnSave = $('#profileSave');
const btnCancel = $('#profileCancel');

function showProfileModal() {
  // hydrate fields from state
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
  // sync UI language to preferred
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
  if (!state.bilingual) {
    $('#ng_out').textContent = en;
    return;
  }
  // Simple ES rendering; can be replaced with proper translation later
  const es = `${saludo()}, soy ${agent} de CST.\n\n${base}`;
  $('#ng_out').textContent = `EN:\n${en}\n\nES:\n${es}`;
});

// ========================= SmartDrop MVP =========================
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
    const text = await extractText(item._file, item.ext);
    results.push({
      name: item.name,
      ext: item.ext,
      size: item.size,
      type: item.type,
      route,
      text: text || null
    });
  }
  saveLibrary(results);
  out({ ok:true, message: t().processed(results.length), savedCount: results.length });
  state.files = [];
  renderList();
});

// extraction – client-only placeholder
async function extractText(file, ext) {
  try {
    if (['txt','csv','json','md','eml','rtf','log'].includes(ext)) {
      return await file.text();
    }
    if (ext === 'pdf') {
      return '[PDF uploaded – text extraction pending (server-side).]';
    }
    if (['doc','docx','xlsx','pptx'].includes(ext)) {
      return '[Office doc uploaded – text extraction pending (server-side).]';
    }
    return await file.text(); // fallback
  } catch (e) {
    return `[Extraction error: ${e?.message||e}]`;
  }
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