// public/app.js — CST SmartDesk baseline (EN/ES, secure, audit, DnD TXT, PDF placeholder)
(function () {
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  let toastTimer;

  // --- Utils ---
  function toast(msg,type='success'){
    const t=$('#toast'); if(!t) return;
    t.textContent=msg; t.className=''; t.classList.add(type);
    requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),1800);
  }
  function logQA(line){ const log=$('#qaLog'); if(log) log.textContent=(line+'\n'+(log.textContent||'')).slice(0,8000); }
  const sanitize = (str)=>String(str||'').replace(/[<>]/g, m => m === '<' ? '&lt;' : '&gt;');

  // --- Splash ---
  function startSplash(){
    const splash=$('#splash'); if(!splash) return afterSplash();
    const bar=$('#splash .bar>div'); let p=0;
    const t=setInterval(()=>{ p=Math.min(100,p+8+Math.random()*7); if(bar) bar.style.width=p+'%'; if(p>=100){clearInterval(t); finish();}},180);
    $('#splashSkip')?.addEventListener('click',()=>{clearInterval(t);finish();});
    setTimeout(()=>{clearInterval(t);finish();logQA('Splash forced complete (timeout)');},5000);
    function finish(){ splash.style.display='none'; afterSplash(); }
  }
  function afterSplash(){ if(!state.profile){ open('setup'); } else { hydrateProfile(); } }

  // --- State ---
  const state={
    lang: localStorage.getItem('cst_lang')||'en',
    profile: JSON.parse(localStorage.getItem('cst_profile')||'null'),
    bilingual: localStorage.getItem('cst_bilingual')==='1'
  };
  function setLang(v){ state.lang=v; localStorage.setItem('cst_lang',v); const L=$('#langLabel'); if(L) L.textContent=v.toUpperCase(); }
  function hydrateProfile(){
    const p=state.profile; if(!p) return;
    const full = p.first && p.last ? `${p.first} ${p.last}` : (p.full||'Agent');
    const badge=$('#profileBadge'); if(badge) badge.textContent=`👤 ${full} | 🆔 ${p.id||'—'} | ☎️ ${p.ext||'—'} | ${state.lang.toUpperCase()}`;
    const wn=$('#welcomeName'); if(wn) wn.textContent = full ? ', '+full.split(' ')[0] : '';
  }

  // --- Modal system ---
  const MODALS={
    setup: $('#modal-setup'),
    copilot: $('#modal-copilot'),
    tests: $('#modal-tests'),
    settings: $('#modal-settings'),
    status: $('#modal-status')
  };
  function open(key){ const m=MODALS[key]; if(!m) return; m.style.display='flex'; document.body.style.overflow='hidden'; }
  function close(el){ const mb=el?.closest?.('.modal-backdrop'); if(mb){ mb.style.display='none'; document.body.style.overflow=''; } }
  $$('[data-close]').forEach(b=> b.addEventListener('click',e=>close(e.target)));
  $('#openCopilot')?.addEventListener('click', ()=> open('copilot'));
  $('#openStatus')?.addEventListener('click', async()=>{ await loadAndRenderStatus(); open('status'); });

  // --- Sidebar mobile ---
  const sidebar=$('#sidebar'), navToggle=$('#navToggle'), scrim=$('#scrim');
  function setSidebar(on){ if(!sidebar) return; if(on){ sidebar.classList.add('open'); navToggle?.setAttribute('aria-expanded','true'); scrim?.classList.add('show'); } else { sidebar.classList.remove('open'); navToggle?.setAttribute('aria-expanded','false'); scrim?.classList.remove('show'); } }
  navToggle?.addEventListener('click',()=> setSidebar(!sidebar.classList.contains('open')));
  scrim?.addEventListener('click',()=> setSidebar(false));
  $$('[data-open]').forEach(li=> li.addEventListener('click',()=> setSidebar(false)));

  // --- Setup form ---
  $('#setupForm')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const profile={ first:sanitize($('#f_first').value.trim()), last:sanitize($('#f_last').value.trim()), id:sanitize($('#f_id').value.trim()), ext:sanitize($('#f_ext').value.trim()) };
    if(!profile.first||!profile.last||!profile.id||!profile.ext){ toast('Please complete required fields.','warn'); return; }
    localStorage.setItem('cst_profile', JSON.stringify(profile));
    state.profile=profile; hydrateProfile();
    if($('#f_nosplash').checked) localStorage.setItem('cst_nosplash','1');
    toast('Profile saved.'); close($('#modal-setup [data-close]'));
  });

  // --- Language + bilingual ---
  $('#opt_bilingual')?.addEventListener('change',e=>{ const on=e.target.checked; state.bilingual=on; localStorage.setItem('cst_bilingual',on?'1':'0'); toast('Bilingual '+(on?'ON':'OFF')); });
  $('#opt_bilingual_settings')?.addEventListener('change',e=>{ const on=e.target.checked; state.bilingual=on; localStorage.setItem('cst_bilingual',on?'1':'0'); toast('Bilingual '+(on?'ON':'OFF')); });

  // --- Copilot denial skeletons (EN/ES) ---
  const DENIAL={
    NO_ENROLL:{ en:{reason:`Your number isn’t enrolled in a protection plan, so we can’t approve the claim.`, rebuttal:`If you think there’s been an error, your carrier can verify why coverage wasn’t added and review options.`},
                es:{reason:`Su número no está inscrito en un plan de protección, por lo que no podemos aprobar la reclamación.`, rebuttal:`Si cree que hubo un error, su proveedor puede verificar por qué no se agregó la cobertura y revisar opciones.`}},
    NO_AIRTIME:{ en:{reason:`We found no airtime—no calls, texts, or data—since enrollment. Coverage requires usage after enrollment.`, rebuttal:`Airtime after enrollment confirms the device was in working order. Your carrier can review alternatives.`},
                es:{reason:`No se encontró uso (llamadas, mensajes o datos) desde la inscripción. La cobertura requiere uso posterior a la inscripción.`, rebuttal:`El uso posterior confirma que el equipo funcionaba correctamente. Su proveedor puede revisar alternativas.`}},
    PRE_EXISTING:{ en:{reason:`The device had pre-existing damage or the loss happened before coverage started.`, rebuttal:`Coverage applies only if the device was in good condition before insurance was added.`},
                   es:{reason:`El dispositivo tenía daños preexistentes o la pérdida ocurrió antes del inicio de la cobertura.`, rebuttal:`La cobertura aplica solo si el equipo estaba en buen estado antes de añadir el seguro.`}},
    ACTIVE_IMEI:{ en:{reason:`The device shows activity after the provided date of loss; lost/stolen devices shouldn’t be active.`, rebuttal:`Suspend the line and block the device with the carrier, then refile using the last activity date.`},
                  es:{reason:`El dispositivo muestra actividad posterior a la fecha de pérdida; un equipo perdido/robado no debe estar activo.`, rebuttal:`Suspenda la línea y bloquee el equipo con el proveedor; luego presente de nuevo usando la última fecha de uso.`}}
  };
  function greeting(){ const h=(new Date()).getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening'; }
  function intro(){ const who=state.profile?.first||'Agent'; return `${greeting()}, this is ${who} with CST.`; }
  function buildDenial(key){ const p=DENIAL[key]; if(!p) return 'Unknown reason.'; const en=`SERVE: ${intro()}\n\nSOLVE: ${p.en.reason}\n\nSELL: ${p.en.rebuttal}`; if(!state.bilingual) return en; const es=`\n\n—\n\nSERVIR: ${intro().replace('This','Este')}\n\nRESOLVER: ${p.es.reason}\n\nVALOR: ${p.es.rebuttal}`; return en+es; }
  $('#cp_run')?.addEventListener('click',()=>{
    const q=($('#cp_in').value||'').trim();
    let out;
    if(/no\s*airtime/i.test(q)) out=buildDenial('NO_AIRTIME');
    else if(/no\s*enroll|not\s*enrolled/i.test(q)) out=buildDenial('NO_ENROLL');
    else if(/pre.?existing/i.test(q)) out=buildDenial('PRE_EXISTING');
    else if(/active\s*imei/i.test(q)) out=buildDenial('ACTIVE_IMEI');
    else out=intro()+`\n\nPlease provide a specific denial reason (e.g., "No Airtime").`;
    $('#cp_out').value=out;
  });
  $('#cp_copy')?.addEventListener('click', async()=>{ try{ await navigator.clipboard.writeText($('#cp_out').value||''); toast('Copied'); }catch{ toast('Copy failed','warn'); } });

  // --- Tests: Verizon T&C fetch probe ---
  $('#t_fetch_vzw_pdf')?.addEventListener('click', async ()=>{
    const url='https://www.asurion.com/pdf/nw-consumer-vmp-25/';
    const log=$('#testLog'); if(log) log.textContent='Fetching… '+url;
    try{
      const res=await fetch('/api/tnc-fetch?url='+encodeURIComponent(url));
      const data=await res.json();
      if(log) log.textContent=JSON.stringify(data,null,2);
      if(!data.ok) logQA('NOTE: If contentType=text/html, the URL is a landing page; use a direct PDF link.');
    }catch(e){ if(log) log.textContent='Error: '+e.message; }
  });

  // --- Drag & Drop parser (TXT works now; PDF placeholder) ---
  const drop=$('#dropZone'), paste=$('#pasteIn'), out=$('#parseOut');
  if(drop){
    ;['dragenter','dragover'].forEach(evt=> drop.addEventListener(evt,(e)=>{ e.preventDefault(); drop.style.background='#141a2c'; }));
    ;['dragleave','drop'].forEach(evt=> drop.addEventListener(evt,(e)=>{ e.preventDefault(); drop.style.background=''; }));
    drop.addEventListener('drop', async (e)=>{
      const file=e.dataTransfer?.files?.[0]; if(!file) return;
      if(file.type==='text/plain'){ const txt=await file.text(); renderParsed(txt); }
      else if(file.type==='application/pdf'){ out.textContent='PDF detected — text extraction module not enabled yet. (We can add PDF.js next.)'; logQA('PDF dropped (placeholder)'); }
      else { out.textContent='Unsupported file type: '+sanitize(file.type); }
    });
  }
  $('#parseBtn')?.addEventListener('click',()=> renderParsed(paste?.value||''));

  function renderParsed(raw){
    const text = (raw||'').trim();
    if(!text){ out.textContent='(empty)'; return; }
    // very simple extractor example (lines with Key: Value)
    const lines = text.split(/\r?\n/);
    const kv = {};
    for(const ln of lines){
      const m = ln.match(/^\s*([A-Za-z ]+)\s*:\s*(.+)$/);
      if(m) kv[m[1].trim().toLowerCase()] = m[2].trim();
    }
    out.textContent = JSON.stringify({ length: text.length, fields: kv, preview: text.slice(0,400) }, null, 2);
    toast('Parsed');
  }

  // --- System Status modal ---
  async function loadAndRenderStatus() {
    const el = {
      build: $('#st_build'),
      node: $('#st_node'),
      runtime: $('#st_runtime'),
      time: $('#st_time'),
      checks: $('#st_checks'),
      browser: $('#st_browser')
    };
    if (el.checks) el.checks.innerHTML = 'Loading…';

    // server health
    let health = null;
    try {
      const r = await fetch('/api/healthz', { cache: 'no-store' });
      health = await r.json();
    } catch (e) { health = { status: 'error', error: String(e) }; }

    // client checks
    const browserChecks = [
      ['Drag & Drop support', (() => { try { return 'draggable' in document.createElement('div'); } catch { return false; } })()],
      ['localStorage available', (() => { try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; } catch { return false; } })()],
      ['WebSocket available', typeof window !== 'undefined' && 'WebSocket' in window]
    ];

    // fill server info
    if (el.build) el.build.textContent = health?.commitSha ?? '—';
    if (el.node) el.node.textContent = health?.node ?? '—';
    if (el.runtime) el.runtime.textContent = health?.vercel ? 'Vercel' : 'Local/Other';
    if (el.time) el.time.textContent = health?.time ?? '—';

    // env checks
    if (el.checks) {
      const entries = health?.checks ? Object.entries(health.checks) : [];
      el.checks.innerHTML = entries.length
        ? entries.map(([k, v]) => `<li><code>${k}</code> — ${v.ok ? 'OK' : 'MISSING'}${v.detail ? ` (${v.detail})` : ''}</li>`).join('')
        : '<li>—</li>';
    }
    // browser checks
    if (el.browser) el.browser.innerHTML = browserChecks.map(([label, ok]) => `<li>${label}: ${ok ? 'OK' : 'FAIL'}</li>`).join('');
  }

  // --- Deep self-audit hook (lights the QA dot) ---
  function runQA(){
    const misses=[];
    if(!$('script[src="/app.js"]')) misses.push('Missing script include /app.js');
    ['modal-setup','modal-copilot','modal-tests','modal-settings','modal-status'].forEach(id=>{ if(!document.getElementById(id)) misses.push('Missing node: '+id); });
    // quick path probes (won't block)
    fetch('/app.js',{method:'HEAD'}).then(r=>{ if(!r.ok) misses.push('HEAD /app.js returned '+r.status); });
    fetch('/assets/verizon.svg',{method:'HEAD'}).then(r=>{ if(!r.ok) misses.push('HEAD /assets/verizon.svg returned '+r.status); });
    const dot=$('#qaDot'); if(dot) dot.style.background = misses.length? (misses.length>2? 'var(--bad)':'var(--warn)') : 'var(--ok)';
    logQA(misses.length? 'Deep Audit:\n- '+misses.join('\n- ') : 'Deep Audit: OK');
  }

  // --- Boot ---
  window.addEventListener('DOMContentLoaded',()=>{
    setLang(state.lang);
    startSplash();
    runQA();
  });
})();
