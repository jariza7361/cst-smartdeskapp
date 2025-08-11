// ===== tiny helpers =====
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const state = {
  lang: localStorage.getItem('cst_lang') || 'en',
  bilingual: localStorage.getItem('cst_bilingual') === '1'
};
function setLang(v){ state.lang=v; localStorage.setItem('cst_lang',v); const el=$('#uiLang'); if(el) el.textContent=v.toUpperCase(); }
setLang(state.lang);

// ===== Mobile detection =====
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) document.body.classList.add('is-mobile');

// ===== Output helpers =====
const outWrap = $('#outWrap');
const outSummary = $('#outSummary');
const out = $('#out');
function writeOut(obj){
  try {
    const text = (typeof obj === 'string') ? obj : JSON.stringify(obj, null, 2);
    out.textContent = text;
    if (isMobile && outWrap) { outWrap.open = false; } // auto-collapse after update on phones
  } catch(e){
    out.textContent = String(obj);
  }
}
writeOut({status:'ready'});

// collapse Output by default on mobile (first load)
if (isMobile && outWrap) {
  outWrap.open = false;
  if (outSummary) outSummary.textContent = 'Output (tap to expand)';
}

// ===== Language toggle =====
$('#toggleLang')?.addEventListener('click', ()=>{
  setLang(state.lang === 'en' ? 'es' : 'en');
});

// ===== Copilot (client-side stub) =====
function greeting(){
  const h=(new Date()).getHours();
  return h<12? 'Good morning' : h<18? 'Good afternoon' : 'Good evening';
}
function bilingualNote(enText){
  if(!state.bilingual || state.lang!=='en') return enText;
  const esText = enText
    .replace('Good morning','Buenos días')
    .replace('Good afternoon','Buenas tardes')
    .replace('Good evening','Buenas noches')
    .replace('This is','Soy')
    .replace('with CST.','de CST.');
  return enText + '\n\n' + esText;
}
$('#cp_suggest')?.addEventListener('click', ()=>{
  const samples = [
    'Script for FMIP override – Cricket',
    'Repair delay escalation note – AT&T',
    'RPFR Alpha note – iPhone 14',
    'PL1 note – damage claim'
  ];
  writeOut(samples.join('\n'));
});
$('#cp_run')?.addEventListener('click', async ()=>{
  const q = $('#cp_in')?.value?.trim();
  if(!q) return;
  // You can replace this stub with a call to /api/copilot
  const base = `${greeting()}, this is Agent with CST.\n\n[EN] Draft response for: ${q}`;
  writeOut(bilingualNote(base));
});

// ===== SmartDrop (client-side queue demo) =====
const files = [];
const dz = $('#dropZone');
const picker = $('#picker');

function renderList(){
  if(!dz) return;
  if(!files.length){ dz.innerHTML = '<em id="dropText">Drop files</em>'; return; }
  dz.innerHTML = files.map(f=>`• ${f.name} (${Math.round(f.size/1024)} KB)`).join('\n');
}
function addFiles(fileList){
  for (const f of fileList) files.push(f);
  renderList();
}
picker?.addEventListener('change', (e)=> addFiles(e.target.files));

['dragenter','dragover'].forEach(evt=>{
  dz?.addEventListener(evt,(e)=>{ e.preventDefault(); dz.style.background='#0e1423'; });
});
['dragleave','drop'].forEach(evt=>{
  dz?.addEventListener(evt,(e)=>{ e.preventDefault(); dz.style.background=''; if(evt==='drop'){ addFiles(e.dataTransfer.files); } });
});

// Tweak SmartDrop hint on phones
if (isMobile) {
  const dropText = document.getElementById('dropText');
  const dropSub  = document.getElementById('dropSub');
  if (dropText) dropText.textContent = 'Select files';
  if (dropSub)  dropSub.textContent  = '';
}

$('#sd_clear')?.addEventListener('click', ()=>{ files.length = 0; renderList(); writeOut({status:'cleared'}); });
$('#sd_process')?.addEventListener('click', async ()=>{
  if(!files.length){ writeOut({error:'no_files'}); return; }
  const note = $('#sd_note')?.value?.trim() || '';
  // send to server stub (you can swap with real endpoints later)
  try{
    const body = new FormData();
    files.forEach((f,i)=> body.append('file'+i, f, f.name));
    body.append('note', note);
    // This endpoint can be implemented later; for now we simulate:
    // const res = await fetch('/api/enqueue',{ method:'POST', body });
    // const data = await res.json();
    // writeOut(data);
    writeOut({queued:true, note, files: files.map(f=>({name:f.name, size:f.size}))});
  }catch(e){
    writeOut({error:String(e)});
  }
});