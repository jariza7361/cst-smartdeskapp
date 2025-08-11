// ===== helpers & state =====
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const state = {
  lang: localStorage.getItem('cst_lang') || 'en',
  bilingual: localStorage.getItem('cst_bilingual') === '1',
  collapseOnPhone: localStorage.getItem('cst_collapse_on_phone') === '1',
  theme: localStorage.getItem('cst_theme') || 'auto', // auto|dark|light|glass|mac
  profile: JSON.parse(localStorage.getItem('cst_profile') || 'null'),
  nosplash: localStorage.getItem('cst_nosplash') === '1'
};

// ===== theming =====
function applyTheme(){
  const root = document.documentElement;
  // clear any explicit theme data attr
  root.removeAttribute('data-theme');
  if(state.theme === 'auto'){
    // respect prefers-color-scheme; nothing to set here
  } else if(state.theme === 'dark'){
    // default tokens already dark
  } else if(state.theme === 'light'){
    root.setAttribute('data-theme','light');
  } else if(state.theme === 'glass'){
    root.setAttribute('data-theme','glass');
  } else if(state.theme === 'mac'){
    root.setAttribute('data-theme','mac');
  }
}
function setTheme(v){ state.theme=v; localStorage.setItem('cst_theme',v); applyTheme(); }

// language
function setLang(v){
  state.lang=v;
  localStorage.setItem('cst_lang',v);
  const el=$('#uiLang'); if(el) el.textContent=v.toUpperCase();
}
setLang(state.lang);
applyTheme();

if (isMobile) document.body.classList.add('is-mobile');

// ===== splash + first-run profile =====
(function bootSplash(){
  const splash = $('#splash');
  if(!splash) return;
  const bar = splash.querySelector('.bar > div');
  function done(){ splash.style.display='none'; maybeOpenProfile(); }
  if(state.nosplash) return done();
  splash.style.display='flex';
  let p=0;
  const t=setInterval(()=>{ p=Math.min(100,p+12+Math.random()*10); if(bar) bar.style.width=p+'%'; if(p>=100){clearInterval(t); setTimeout(done,200);} },180);
})();
function maybeOpenProfile(){
  if(!state.profile){ openProfile(); return; }
  if(state.profile.lang && state.profile.lang !== state.lang) setLang(state.profile.lang);
}

// ===== drawer (mobile sidebar) =====
const drawer = $('#drawer');
$('#openDrawer')?.addEventListener('click', ()=>{ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); });
$('#drawerClose')?.addEventListener('click', ()=>{ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); });
$('#openSettingsFromDrawer')?.addEventListener('click', ()=>{ drawer.classList.remove('open'); openSettings(); });
$('#openProfileFromDrawer')?.addEventListener('click', ()=>{ drawer.classList.remove('open'); openProfile(); });

// ===== profile modal =====
function openProfile(){ const m=$('#profileModal'); if(!m) return; m.style.display='flex'; m.setAttribute('aria-hidden','false'); fillProfileForm(); }
function closeProfile(){ const m=$('#profileModal'); if(!m) return; m.style.display='none'; m.setAttribute('aria-hidden','true'); }
$('#openProfile')?.addEventListener('click', openProfile);
$('#openProfileFromAside')?.addEventListener('click', openProfile);
$('#profileClose')?.addEventListener('click', closeProfile);

function fillProfileForm(){
  const p = state.profile || {};
  $('#pf_first').value = p.first || '';
  $('#pf_last').value  = p.last  || '';
  $('#pf_id').value    = p.id    || '';
  $('#pf_ext').value   = p.ext   || '';
  $('#pf_coach').value = p.coach || '';
  $('#pf_lang').value  = p.lang  || state.lang;
  $('#pf_nosplash').checked = state.nosplash;
}
$('#profileForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const profile = {
    first: $('#pf_first').value.trim(),
    last:  $('#pf_last').value.trim(),
    id:    $('#pf_id').value.trim(),
    ext:   $('#pf_ext').value.trim(),
    coach: $('#pf_coach').value.trim(),
    lang:  $('#pf_lang').value
  };
  if(!profile.first || !profile.last || !profile.id || !profile.ext){ alert('Please complete required fields.'); return; }
  localStorage.setItem('cst_profile', JSON.stringify(profile));
  state.profile = profile;
  setLang(profile.lang);
  const nosplash = $('#pf_nosplash').checked;
  localStorage.setItem('cst_nosplash', nosplash ? '1' : '0');
  state.nosplash = nosplash;
  closeProfile();
});

// ===== settings modal =====
function openSettings(){
  const m=$('#settingsModal'); if(!m) return;
  $('#set_theme').value = state.theme;
  $('#set_lang').value  = state.lang;
  $('#set_bilingual').checked = state.bilingual;
  $('#set_collapse').checked  = state.collapseOnPhone;
  m.style.display='flex'; m.setAttribute('aria-hidden','false');
}
function closeSettings(){ const m=$('#settingsModal'); if(!m) return; m.style.display='none'; m.setAttribute('aria-hidden','true'); }
$('#openSettings')?.addEventListener('click', openSettings);
$('#openSettingsFromAside')?.addEventListener('click', openSettings);
$('#settingsReopenProfile')?.addEventListener('click', ()=>{ closeSettings(); openProfile(); });
$('#settingsSave')?.addEventListener('click', ()=>{
  setTheme($('#set_theme').value);
  setLang($('#set_lang').value);
  state.bilingual = $('#set_bilingual').checked;
  state.collapseOnPhone = $('#set_collapse').checked;
  localStorage.setItem('cst_bilingual', state.bilingual ? '1' : '0');
  localStorage.setItem('cst_collapse_on_phone', state.collapseOnPhone ? '1' : '0');
  closeSettings();
});
$('#settingsClose')?.addEventListener('click', closeSettings);

// ===== language toggle quick button =====
$('#toggleLang')?.addEventListener('click', ()=> setLang(state.lang === 'en' ? 'es' : 'en'));

// ===== output =====
const out = $('#out');
function writeOut(obj){
  try{
    const text = (typeof obj === 'string') ? obj : JSON.stringify(obj, null, 2);
    out.textContent = text;
    if(isMobile && state.collapseOnPhone){ out.scrollTop = 0; }
  }catch(e){ out.textContent = String(obj); }
}
writeOut({status:'ready'});

// ===== Copilot (stub) =====
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
  const agent = state.profile?.first ? state.profile.first : 'Agent';
  const base = `${greeting()}, this is ${agent} with CST.\n\n[EN] Draft response for: ${q}`;
  writeOut(bilingualNote(base));
});

// ===== SmartDrop (client-side queue demo) =====
const files = [];
const dz = $('#dropZone');
const picker = $('#picker');
function renderList(){
  if(!dz) return;
  if(!files.length){ dz.innerHTML = '<em id="dropText">Drop files</em>'; return; }
  dz.textContent = files.map(f=>`• ${f.name} (${Math.round(f.size/1024)} KB)`).join('\n');
}
function addFiles(fileList){
  for (const f of fileList) files.push(f);
  renderList();
}
picker?.addEventListener('change', (e)=> addFiles(e.target.files));
['dragenter','dragover'].forEach(evt=>{
  dz?.addEventListener(evt,(e)=>{ e.preventDefault(); dz.style.background='var(--tile-hover)'; });
});
['dragleave','drop'].forEach(evt=>{
  dz?.addEventListener(evt,(e)=>{ e.preventDefault(); dz.style.background=''; if(evt==='drop'){ addFiles(e.dataTransfer.files); } });
});
// mobile hint
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
  writeOut({queued:true, note, files: files.map(f=>({name:f.name, size:f.size}))});
});