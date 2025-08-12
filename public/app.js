// public/app.js — deep-audit baseline + mobile UX + denial skeletons + fetch test
(function () {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  let toastTimer;

  // Toast + QA
  function showToast(msg, type='success'){
    const t = $('#toast'); if(!t) return;
    t.textContent = msg; t.className = ''; t.classList.add(type);
    requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
  }
  function logQA(line){
    const log = $('#qaLog'); if(!log) return;
    log.textContent = (line + '\n' + (log.textContent||'')).slice(0, 6000);
  }

  // Quotes (splash)
  const QUOTES = [
    "Small steps every day beat big plans someday.",
    "Clarity first, speed next. Ship, learn, improve.",
    "You don’t rise to the level of goals, you fall to the level of systems."
  ];

  // Splash
  function startSplash(){
    const splash = $('#splash'); if(!splash) return afterSplash();
    const bar = $('#splash .bar>div'); const quote=$('#quote');
    if(quote){ quote.textContent = QUOTES[Math.floor(Math.random()*QUOTES.length)]; }
    let p=0; const t = setInterval(()=>{
      p=Math.min(100, p+8+Math.random()*7);
      if(bar) bar.style.width = p+'%';
      if(p>=100){clearInterval(t); finish();}
    },180);
    setTimeout(()=>{ clearInterval(t); finish(); logQA('Splash forced complete (timeout)'); }, 5000);
    function finish(){ splash.style.display='none'; afterSplash(); }
  }
  function afterSplash(){ if(!state.profile){ openModal('setup'); } else { hydrateProfile(); } }

  // State
  const state = {
    lang: localStorage.getItem('cst_lang') || 'en',
    profile: JSON.parse(localStorage.getItem('cst_profile')||'null'),
    bilingual: localStorage.getItem('cst_bilingual') === '1',
  };
  function setLang(v){ state.lang=v; localStorage.setItem('cst_lang',v); const l=$('#langLabel'); if(l) l.textContent=v.toUpperCase(); }
  function greeting(){ const h=(new Date()).getHours(); return h<12? 'Good morning' : h<18? 'Good afternoon' : 'Good evening'; }
  function hydrateProfile(){
    const p=state.profile; if(!p) return;
    const full = p.first && p.last ? `${p.first} ${p.last}` : (p.full||'Agent');
    const badge = $('#profileBadge'); if(badge){ badge.textContent = `👤 ${full} | 🆔 ${p.id||'—'} | ☎️ ${p.ext||'—'} | ${state.lang.toUpperCase()}`; }
    const wn = $('#welcomeName'); if(wn) wn.textContent = full ? ', '+full.split(' ')[0] : '';
  }

  // Modals
  const MODALS = {
    setup: $('#modal-setup'),
    copilot: $('#modal-copilot'),
    tests: $('#modal-tests'),
    settings: $('#modal-settings'),
  };
  function openModal(key){ const m=MODALS[key]; if(!m) return; m.style.display='flex'; document.body.style.overflow='hidden'; }
  function closeModal(el){ const mb = el?.closest?.('.modal-backdrop'); if(mb){ mb.style.display='none'; document.body.style.overflow=''; } }
  $$('[data-close]').forEach(b=> b.addEventListener('click', e=> closeModal(e.target)));

  // Sidebar toggle (mobile)
  const sidebar = $('#sidebar');
  const navToggle = $('#navToggle');
  function setSidebar(open){
    if(!sidebar) return;
    if(open){ sidebar.classList.add('open'); navToggle?.setAttribute('aria-expanded','true'); }
    else { sidebar.classList.remove('open'); navToggle?.setAttribute('aria-expanded','false'); }
  }
  navToggle?.addEventListener('click', ()=> setSidebar(!sidebar.classList.contains('open')));
  // Close sidebar when clicking a link on mobile
  $$('[data-open]').forEach(li=> li.addEventListener('click', ()=> setSidebar(false)));

  // Setup form
  const setupForm = $('#setupForm');
  setupForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const profile={ first:$('#f_first').value.trim(), last:$('#f_last').value.trim(), id:$('#f_id').value.trim(), ext:$('#f_ext').value.trim(), coach:$('#f_coach').value.trim() };
    if(!profile.first||!profile.last||!profile.id||!profile.ext){ showToast('Please complete required fields.','warn'); return; }
    localStorage.setItem('cst_profile', JSON.stringify(profile));
    state.profile = profile; hydrateProfile();
    if($('#f_nosplash')?.checked){ localStorage.setItem('cst_nosplash','1'); }
    showToast('Profile saved.');
    closeModal($('#modal-setup [data-close]'));
  });

  // Language + options
  $('#langToggle')?.addEventListener('click', ()=>{ setLang(state.lang==='en'?'es':'en'); showToast('Language: '+state.lang.toUpperCase()); hydrateProfile(); });
  $('#opt_bilingual')?.addEventListener('change', (e)=>{ const on=e.target.checked; state.bilingual=on; localStorage.setItem('cst_bilingual', on?'1':'0'); showToast('Bilingual '+(on?'ON':'OFF')); });
  $('#reopen_profile')?.addEventListener('click', ()=> openModal('setup'));

  // Openers for tiles/menu
  $$('[data-open]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const key = el.getAttribute('data-open');
      if(key==='copilot') openModal('copilot');
      else if(key==='tests') openModal('tests');
      else if(key==='settings') openModal('settings');
    });
  });

  // Copilot (serve/solve/sell denial skeletons)
  const DENIAL = {
    NO_ENROLL: {
      en: {
        reason: `Your number isn’t enrolled in a protection plan, so we can’t approve the claim.`,
        rebuttal: `If you think there’s been an error, your carrier can verify why coverage wasn’t added and review options.`
      },
      es: {
        reason: `Su número no está inscrito en un plan de protección, por lo que no podemos aprobar la reclamación.`,
        rebuttal: `Si cree que hubo un error, su proveedor puede verificar por qué no se agregó la cobertura y revisar opciones.`
      }
    },
    NO_AIRTIME: {
      en: {
        reason: `We found no airtime—no calls, texts, or data—since enrollment. Coverage requires usage after enrollment.`,
        rebuttal: `Airtime after enrollment confirms the device was in working order. Your carrier can review alternatives.`
      },
      es: {
        reason: `No se encontró uso (llamadas, mensajes o datos) desde la inscripción. La cobertura requiere uso posterior a la inscripción.`,
        rebuttal: `El uso posterior confirma que el equipo funcionaba correctamente. Su proveedor puede revisar alternativas.`
      }
    },
    PRE_EXISTING: {
      en: {
        reason: `The device had pre-existing damage or the loss happened before coverage started.`,
        rebuttal: `Coverage applies only if the device was in good condition before insurance was added.`
      },
      es: {
        reason: `El dispositivo tenía daños preexistentes o la pérdida ocurrió antes del inicio de la cobertura.`,
        rebuttal: `La cobertura aplica solo si el equipo estaba en buen estado antes de añadir el seguro.`
      }
    },
    ACTIVE_IMEI: {
      en: {
        reason: `The device shows activity after the provided date of loss; lost/stolen devices shouldn’t be active.`,
        rebuttal: `Suspend the line and block the device with the carrier, then refile using the last activity date.`
      },
      es: {
        reason: `El dispositivo muestra actividad posterior a la fecha de pérdida; un equipo perdido/robado no debe estar activo.`,
        rebuttal: `Suspenda la línea y bloquee el equipo con el proveedor; luego presente de nuevo usando la última fecha de uso.`
      }
    }
  };
  function intro(){ const who = state.profile?.first || 'Agent'; return `${greeting()}, this is ${who} with CST.`; }
  function buildDenial(key){
    const pack = DENIAL[key]; if(!pack) return 'Unknown reason. Try: No Airtime, No Enroll, Pre-Existing, Active IMEI.';
    const en = `SERVE: ${intro()}\n\nSOLVE: ${pack.en.reason}\n\nSELL: ${pack.en.rebuttal}`;
    if(!state.bilingual) return en;
    const esIntro = `Hola, soy ${state.profile?.first||'Agente'} de CST.`;
    const es = `\n\n—\n\nSERVIR: ${esIntro}\n\nRESOLVER: ${pack.es.reason}\n\nVALOR: ${pack.es.rebuttal}`;
    return en + es;
  }
  $('#cp_run')?.addEventListener('click', ()=>{
    const q = ($('#cp_in')?.value||'').trim();
    let out;
    if(/no\s*airtime/i.test(q)) out = buildDenial('NO_AIRTIME');
    else if(/no\s*enroll|not\s*enrolled/i.test(q)) out = buildDenial('NO_ENROLL');
    else if(/pre.?existing/i.test(q)) out = buildDenial('PRE_EXISTING');
    else if(/active\s*imei/i.test(q)) out = buildDenial('ACTIVE_IMEI');
    else out = intro() + '\n\nPlease provide a specific denial reason (e.g., "No Airtime").';
    const box = $('#cp_out'); if(box) box.value = out;
  });
  $('#cp_copy')?.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText($('#cp_out')?.value||''); showToast('Copied'); }catch{ showToast('Copy failed','warn');}
  });

  // Tests: call /api/fetch for Verizon PDF
  $('#t_fetch_vzw_pdf')?.addEventListener('click', async ()=>{
    const url = 'https://www.asurion.com/pdf/nw-consumer-vmp-25/';
    const log = $('#testLog'); if(log) log.textContent = 'Fetching… '+url;
    try{
      const res = await fetch('/api/fetch?url='+encodeURIComponent(url));
      const data = await res.json();
      if(log) log.textContent = JSON.stringify(data,null,2);
      if(!data.ok && log) log.textContent += '\nNOTE: If contentType is text/html, the URL may be a landing page.';
    }catch(e){ if(log) log.textContent = 'Error: '+e.message; }
  });

  // Error handling & boot QA
  window.addEventListener('error', (e)=>{ logQA('Boot error: '+(e.message||e.error)); $('#splash')?.remove(); });
  function runQA(){
    const misses = [];
    if(!$('script[src="/app.js"]')) misses.push('Missing /app.js include');
    if(!MODALS.setup) misses.push('Setup modal missing');
    if(!MODALS.copilot) misses.push('Copilot modal missing');
    if(!MODALS.tests) misses.push('Tests modal missing');
    if(!MODALS.settings) misses.push('Settings modal missing');
    logQA(misses.length? 'Deep Audit:\n- '+misses.join('\n- ') : 'Deep Audit: OK');
  }

  // Boot
  window.addEventListener('DOMContentLoaded', ()=>{
    setLang(state.lang);
    startSplash();
    runQA();
  });
})();