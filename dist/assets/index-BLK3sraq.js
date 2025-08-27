(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();async function ge(e="en"){const[t,n]=await Promise.all([fetch("/i18n/en.json").then(o=>o.json()),fetch("/i18n/es.json").then(o=>o.json())]);return{t(o,s){return((s||e)==="es"?n:t)[o]??o}}}function ze(e="",t="",n=null){let o=[];if(n){let s=typeof n=="string"?n:JSON.stringify(n);o.push("CONTEXT_JSON="+s.slice(0,3e3))}return e&&o.push(e.trim()),t&&o.push(t.trim()),o.join(`

`).trim()}var W={BASE_URL:"/",MODE:"production",DEV:!1,PROD:!0,SSR:!1};let Z="en",O={name:"",empId:"",extension:"",coach:"",type:"english"},S={shiftStart:"",shiftEnd:"",breakDuration:15,lunchDuration:30,currentStatus:"available",nextBreak:null,nextLunch:null,onBreak:!1,breakStartTime:null};const d={settings:null,i18n:null,copilotReachable:null,lang:"en",jsErrors:[]};async function Be(){try{console.log("Initializing CST SmartDesk v1.0..."),d.i18n=ge(),await d.i18n.init(Z),Je(),Ye(),Se(),setInterval(Se,1e3),console.log("CST SmartDesk v1.0 initialized successfully")}catch(e){console.error("Failed to initialize app:",e)}}function Je(){const e=localStorage.getItem("cst_expert_info");e?(O=JSON.parse(e),xe()):Ke();const t=localStorage.getItem("cst_schedule_info");t&&(S={...S,...JSON.parse(t)},Ae())}function Ge(){localStorage.setItem("cst_expert_info",JSON.stringify(O)),xe()}function xe(){const e=document.getElementById("expertName"),t=document.getElementById("expertEmpId"),n=document.getElementById("expertExtension"),o=document.getElementById("expertCoach");e&&(e.textContent=O.name||"Not Set"),t&&(t.textContent=O.empId||"Not Set"),n&&(n.textContent=O.extension||"Not Set"),o&&(o.textContent=O.coach||"Not Set")}function Se(){const e=new Date,t=e.toLocaleTimeString(),n=e.toLocaleDateString(),o=document.getElementById("currentTime");o&&(o.textContent=`${t} - ${n}`),Ve(e)}function Ve(e){if(!S.shiftStart||!S.shiftEnd){const n=document.getElementById("scheduleStatus");n&&(n.textContent="Schedule not set");return}const t=document.getElementById("scheduleStatus");if(S.onBreak){const n=new Date(S.breakStartTime),o=new Date(n.getTime()+S.breakDuration*6e4),s=Math.ceil((o-e)/6e4);if(s<=0)Te(),Le("Break time is over! Please return to available status.");else{const i=document.getElementById("breakTimeLeft");i&&(i.textContent=`Break ends in ${s} minutes`),t&&(t.textContent=`On Break (${s}m left)`)}}else t&&(t.textContent=`Available - ${S.currentStatus}`),Qe(e)}function Qe(e){const t=e.getHours()*60+e.getMinutes();if(t>=720&&t<=840){const n=localStorage.getItem("cst_last_lunch_alert"),o=e.toDateString();n!==o&&(localStorage.setItem("cst_last_lunch_alert",o),ke("lunch","Time for lunch break!"))}if(t>=900&&t<=960){const n=localStorage.getItem("cst_last_break_alert"),o=e.toDateString();n!==o&&(localStorage.setItem("cst_last_break_alert",o),ke("break","Time for your afternoon break!"))}}function ke(e,t){Le(t);const n=document.createElement("div");n.className="break-alert",n.innerHTML=`
    <div class="alert-content">
      <h3>${e==="lunch"?"🍽️":"☕"} ${t}</h3>
      <div class="alert-actions">
        <button onclick="startBreak('${e}')" class="btn-primary">Start ${e}</button>
        <button onclick="dismissBreakAlert(this)" class="btn-secondary">Later</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.style.display="block",setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},3e4)}function Le(e){const t=new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcCDuM0fPTgjMGH3PE8OObTgwOWK/n77JiGg");t.volume=.3,t.play().catch(()=>{"Notification"in window&&Notification.permission==="granted"&&new Notification("CST SmartDesk",{body:e})}),de(e)}function Te(){S.onBreak=!1,S.breakStartTime=null,S.currentStatus="available";const e=document.getElementById("breakTimer");e&&(e.style.display="none"),ye(),de("Break ended - Status: Available")}function ye(){localStorage.setItem("cst_schedule_info",JSON.stringify(S)),Ae()}function Ae(){const e=document.getElementById("scheduleStatus");e&&(S.onBreak?e.textContent=`On ${S.currentStatus}`:e.textContent=S.shiftStart?`Available (${S.shiftStart} - ${S.shiftEnd})`:"Schedule not set")}function Ke(){const e=document.getElementById("setupWizard");e&&(e.style.display="block")}function Ye(){const e=document.getElementById("setupForm");e&&e.addEventListener("submit",Xe),document.addEventListener("click",s=>{s.target.classList.contains("close-modal")&&be(s.target.closest(".modal"))}),Ze();const t=document.getElementById("languageToggle");t&&t.addEventListener("click",Oe);const n=document.getElementById("scheduleSettings");n&&n.addEventListener("click",Re);const o=document.getElementById("endBreak");o&&o.addEventListener("click",Te),"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission()}function Xe(e){e.preventDefault();const t=new FormData(e.target);O.name=t.get("name"),O.empId=t.get("empId"),O.extension=t.get("extension"),O.coach=t.get("coach"),O.type=t.get("type"),t.get("shiftStart")&&(S.shiftStart=t.get("shiftStart"),S.shiftEnd=t.get("shiftEnd"),S.breakDuration=parseInt(t.get("breakDuration"))||15,S.enableBreakAlerts=!0,S.enableAudioAlerts=!0,ye()),Ge(),be(document.getElementById("setupWizard")),de("Welcome to CST SmartDesk v1.0! Setup complete.")}function Ze(){document.querySelectorAll(".smart-card").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.card;De(n)})})}function De(e){switch(console.log(`Opening ${e} modal`),e){case"fmip":tt();break;case"hero-denial":nt();break;case"byod":ot();break;case"spanish-templates":st();break;case"auto-fill":it();break;case"escalations":at();break;case"alpha-notes":lt();break;case"rpfr":ct();break;case"settings":Re();break;case"language-toggle":Oe();break;default:console.log(`No handler for card type: ${e}`)}}function Re(){const e=M("Schedule Settings",`
    <div class="schedule-settings-content">
      <h3>⏰ Work Schedule Configuration</h3>
      <form id="scheduleForm">
        <div class="schedule-form">
          <label for="shiftStart">Shift Start Time:</label>
          <input type="time" id="shiftStart" value="${S.shiftStart||"09:00"}" required>
          
          <label for="shiftEnd">Shift End Time:</label>
          <input type="time" id="shiftEnd" value="${S.shiftEnd||"17:00"}" required>
          
          <label for="breakDuration">Break Duration (minutes):</label>
          <input type="number" id="breakDuration" value="${S.breakDuration}" min="5" max="60" required>
          
          <label for="lunchDuration">Lunch Duration (minutes):</label>
          <input type="number" id="lunchDuration" value="${S.lunchDuration}" min="15" max="90" required>
          
          <div class="checkbox-group">
            <label>
              <input type="checkbox" id="enableBreakAlerts" ${S.enableBreakAlerts!==!1?"checked":""}>
              Enable break reminder alerts
            </label>
            <label>
              <input type="checkbox" id="enableAudioAlerts" ${S.enableAudioAlerts!==!1?"checked":""}>
              Enable audio notifications
            </label>
          </div>
        </div>
        
        <div class="schedule-actions">
          <button type="submit" class="btn-primary">Save Schedule</button>
          <button type="button" onclick="testAlert()" class="btn-secondary">Test Alert</button>
        </div>
      </form>
      
      <div class="schedule-status-display">
        <h4>Current Status</h4>
        <p><strong>Schedule:</strong> ${S.shiftStart||"Not set"} - ${S.shiftEnd||"Not set"}</p>
        <p><strong>Status:</strong> ${S.currentStatus}</p>
        <p><strong>Break Duration:</strong> ${S.breakDuration} minutes</p>
        <p><strong>Lunch Duration:</strong> ${S.lunchDuration} minutes</p>
      </div>
    </div>
  `);$(e);const t=document.getElementById("scheduleForm");t&&t.addEventListener("submit",et)}function et(e){e.preventDefault();const t=new FormData(e.target);S.shiftStart=t.get("shiftStart"),S.shiftEnd=t.get("shiftEnd"),S.breakDuration=parseInt(t.get("breakDuration")),S.lunchDuration=parseInt(t.get("lunchDuration")),S.enableBreakAlerts=document.getElementById("enableBreakAlerts").checked,S.enableAudioAlerts=document.getElementById("enableAudioAlerts").checked,ye(),be(document.querySelector(".modal")),de("Schedule settings saved successfully!")}function tt(){const e=M("FMIP Workflow Assistant",`
    <div class="fmip-content">
      <h3>Find My iPhone/iPad Workflow</h3>
      <div class="workflow-steps">
        <div class="step">
          <h4>Step 1: Verify Device Ownership</h4>
          <p>Ask customer for Apple ID and device serial number</p>
          <button onclick="copyToClipboard('Can you please provide your Apple ID and the serial number of your device?')" class="btn-primary">Copy Script</button>
        </div>
        <div class="step">
          <h4>Step 2: Check FMIP Status</h4>
          <p>Navigate to iCloud.com/find to check device status</p>
          <button onclick="openFMIPChecker()" class="btn-primary">Open FMIP Checker</button>
        </div>
        <div class="step">
          <h4>Step 3: Removal Instructions</h4>
          <p>Guide customer through FMIP removal process</p>
          <button onclick="showFMIPRemovalSteps()" class="btn-primary">Show Steps</button>
        </div>
      </div>
    </div>
  `);$(e)}function nt(){const e=M("HERO Denial Scripts",`
    <div class="hero-denial-content">
      <h3>Carrier-Specific Denial Scripts</h3>
      <div class="carrier-selector">
        <select id="carrierSelect" onchange="loadDenialScript()">
          <option value="">Select Carrier</option>
          <option value="VZW">Verizon</option>
          <option value="ATT">AT&T</option>
          <option value="TMO">T-Mobile</option>
          <option value="SPR">Sprint</option>
        </select>
      </div>
      <div id="denialScriptContent" class="script-content">
        <p>Please select a carrier to view denial scripts.</p>
      </div>
    </div>
  `);$(e)}function ot(){const e=M("BYOD Logic Helper",`
    <div class="byod-content">
      <h3>Bring Your Own Device Logic</h3>
      <div class="device-checker">
        <label for="deviceModel">Device Model:</label>
        <input type="text" id="deviceModel" placeholder="e.g., iPhone 13 Pro">
        
        <label for="targetCarrier">Target Carrier:</label>
        <select id="targetCarrier">
          <option value="">Select Carrier</option>
          <option value="VZW">Verizon</option>
          <option value="ATT">AT&T</option>
          <option value="TMO">T-Mobile</option>
        </select>
        
        <button onclick="checkBYODCompatibility()" class="btn-primary">Check Compatibility</button>
        
        <div id="byodResults" class="results-section" style="display: none;">
          <h4>Compatibility Results</h4>
          <div id="compatibilityResults"></div>
        </div>
      </div>
    </div>
  `);$(e)}function st(){const e=M("Spanish Templates",`
    <div class="spanish-templates-content">
      <h3>Plantillas en Español</h3>
      <div class="template-categories">
        <div class="template-category">
          <h4>Greetings / Saludos</h4>
          <button onclick="copySpanishTemplate('greeting')" class="btn-primary">Copy Template</button>
        </div>
        <div class="template-category">
          <h4>Technical Support / Soporte Técnico</h4>
          <button onclick="copySpanishTemplate('tech_support')" class="btn-primary">Copy Template</button>
        </div>
        <div class="template-category">
          <h4>Billing Inquiries / Consultas de Facturación</h4>
          <button onclick="copySpanishTemplate('billing')" class="btn-primary">Copy Template</button>
        </div>
        <div class="template-category">
          <h4>Closing / Despedida</h4>
          <button onclick="copySpanishTemplate('closing')" class="btn-primary">Copy Template</button>
        </div>
      </div>
    </div>
  `);$(e)}function it(){const e=M("Auto-Fill Forms",`
    <div class="auto-fill-content">
      <h3>Auto-Fill Customer Forms</h3>
      <div class="form-generator">
        <div class="customer-info">
          <h4>Customer Information</h4>
          <label for="customerName">Customer Name:</label>
          <input type="text" id="customerName" placeholder="Customer Name">
          
          <label for="customerPhone">Phone Number:</label>
          <input type="tel" id="customerPhone" placeholder="(555) 123-4567">
          
          <label for="customerEmail">Email:</label>
          <input type="email" id="customerEmail" placeholder="customer@email.com">
          
          <label for="issueDescription">Issue Description:</label>
          <textarea id="issueDescription" placeholder="Describe the customer's issue..."></textarea>
        </div>
        
        <div class="form-actions">
          <button onclick="generateClaimNote()" class="btn-primary">Generate Claim Note</button>
          <button onclick="generateFollowUpEmail()" class="btn-secondary">Generate Follow-up Email</button>
          <button onclick="fillCommonForms()" class="btn-secondary">Fill Common Forms</button>
        </div>
        
        <div id="generatedContent" class="generated-content" style="display: none;">
          <h4>Generated Content</h4>
          <textarea id="contentOutput" readonly></textarea>
          <button onclick="copyGeneratedContent()" class="btn-primary">Copy to Clipboard</button>
        </div>
      </div>
    </div>
  `);$(e)}function at(){const e=M("Escalations Tracking",`
    <div class="escalations-content">
      <h3>Assistant Escalations Toolkit</h3>
      <div class="escalation-tracker">
        <div class="escalation-form">
          <label for="escalationType">Escalation Type:</label>
          <select id="escalationType">
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing Dispute</option>
            <option value="policy">Policy Exception</option>
            <option value="supervisor">Supervisor Request</option>
          </select>
          
          <label for="escalationReason">Reason:</label>
          <textarea id="escalationReason" placeholder="Detailed reason for escalation..."></textarea>
          
          <label for="customerMood">Customer Mood:</label>
          <select id="customerMood">
            <option value="calm">Calm</option>
            <option value="frustrated">Frustrated</option>
            <option value="angry">Angry</option>
            <option value="confused">Confused</option>
          </select>
          
          <button onclick="logEscalation()" class="btn-primary">Log Escalation</button>
        </div>
        
        <div id="escalationHistory" class="escalation-history">
          <h4>Recent Escalations</h4>
          <div id="escalationList"></div>
        </div>
      </div>
    </div>
  `);$(e)}function lt(){const e=M("Alpha Notes Generator",`
    <div class="alpha-notes-content">
      <h3>Alpha Notes Generator</h3>
      <div class="note-generator">
        <div class="note-settings">
          <label for="noteType">Note Type:</label>
          <select id="noteType">
            <option value="interaction">Customer Interaction</option>
            <option value="technical">Technical Resolution</option>
            <option value="followup">Follow-up Required</option>
            <option value="escalation">Escalation Note</option>
          </select>
          
          <label for="interactionDetails">Interaction Details:</label>
          <textarea id="interactionDetails" placeholder="Describe the customer interaction..."></textarea>
          
          <label for="resolutionSteps">Resolution Steps:</label>
          <textarea id="resolutionSteps" placeholder="List the steps taken to resolve the issue..."></textarea>
          
          <label for="outcomeStatus">Outcome:</label>
          <select id="outcomeStatus">
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
            <option value="escalated">Escalated</option>
            <option value="followup">Follow-up Required</option>
          </select>
        </div>
        
        <div class="note-actions">
          <button onclick="generateAlphaNote()" class="btn-primary">Generate Alpha Note</button>
          <button onclick="saveNoteDraft()" class="btn-secondary">Save Draft</button>
        </div>
        
        <div id="alphaNoteOutput" class="note-output" style="display: none;">
          <h4>Generated Alpha Note</h4>
          <textarea id="alphaNoteText" readonly></textarea>
          <button onclick="copyAlphaNote()" class="btn-primary">Copy to Clipboard</button>
        </div>
      </div>
    </div>
  `);$(e)}function ct(){const e=M("RPFR vs PFR Guide",`
    <div class="rpfr-content">
      <h3>RPFR vs PFR - What's the Difference?</h3>
      <div class="comparison-grid">
        <div class="comparison-item">
          <h4>PFR (Pending Further Review)</h4>
          <ul>
            <li>Standard review process</li>
            <li>Normal processing timeframes</li>
            <li>Routine case handling</li>
            <li>No special flags required</li>
          </ul>
          <button onclick="copyPFRTemplate()" class="btn-primary">Copy PFR Template</button>
        </div>
        
        <div class="comparison-item">
          <h4>RPFR (Requires Pending Further Review)</h4>
          <ul>
            <li>Complex case requiring special attention</li>
            <li>Extended review timeframes</li>
            <li>Additional documentation needed</li>
            <li>Special handling protocols</li>
          </ul>
          <button onclick="copyRPFRTemplate()" class="btn-primary">Copy RPFR Template</button>
        </div>
      </div>
      
      <div class="rpfr-tools">
        <h4>RPFR Classification Helper</h4>
        <p>Does this case require RPFR?</p>
        <div class="rpfr-checklist">
          <label><input type="checkbox" id="complexIssue"> Complex technical issue</label>
          <label><input type="checkbox" id="policyException"> Policy exception required</label>
          <label><input type="checkbox" id="multipleAttempts"> Multiple previous attempts</label>
          <label><input type="checkbox" id="escalationHistory"> Previous escalation history</label>
        </div>
        <button onclick="evaluateRPFRNeed()" class="btn-primary">Evaluate RPFR Need</button>
        <div id="rpfrRecommendation" style="display: none;"></div>
      </div>
    </div>
  `);$(e)}function M(e,t){const n=document.createElement("div");return n.className="modal",n.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h2>${e}</h2>
        <span class="close-modal">&times;</span>
      </div>
      <div class="modal-body">
        ${t}
      </div>
    </div>
  `,n}function $(e){document.body.appendChild(e),e.style.display="block"}function be(e){e&&(e.style.display="none",e.parentNode&&e.parentNode.removeChild(e))}function de(e){const t=document.createElement("div");t.className="notification",t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.classList.add("show")},100),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>{document.body.removeChild(t)},300)},3e3)}function Oe(){Z=Z==="en"?"es":"en",d.i18n.init(Z),console.log(`Language switched to: ${Z}`)}document.addEventListener("DOMContentLoaded",Be);window.addEventListener("error",e=>{console.error("Global error:",e),d.jsErrors.push({message:e.message,filename:e.filename,line:e.lineno,timestamp:new Date().toISOString()})});typeof module<"u"&&module.exports&&(module.exports={expertInfo:O,state:d,init:Be,handleCardClick:De});let me=null,z=!1,te=!1,J=0,ee=null,ae=null;try{const e=t=>{try{d.jsErrors=d.jsErrors||[],t&&d.jsErrors[0]!==t&&(d.jsErrors.unshift(String(t)),d.jsErrors=d.jsErrors.slice(0,5));try{j()}catch{}}catch{}};window.addEventListener("error",t=>{var o;const n=((o=t==null?void 0:t.error)==null?void 0:o.message)||(t==null?void 0:t.message)||"Unknown error";e("Error: "+n)}),window.addEventListener("unhandledrejection",t=>{var s;const n=t==null?void 0:t.reason,o=n&&(n.message||((s=n.toString)==null?void 0:s.call(n)))||"Unhandled rejection";e("Promise: "+o)})}catch{}function G(){try{return!!(typeof navigator<"u"&&"webdriver"in navigator&&navigator.webdriver)}catch{return!1}}function rt(e){d.engine=e,localStorage.setItem("cst_engine",e),I("Engine: "+e)}try{window.setEngine=rt}catch{}async function dt(e){return`[LOCAL ENGINE]

`+String(e||"")+`

(Template assist applied.)`}function ut(e){const t=document.querySelector("#copilotSample");if(t&&(!t.options||t.options.length===0)){const n=document.createElement("option");n.value="serve_solve_sell";const o={en:"Serve / Solve / Sell (starter)",es:"Atender / Resolver / Ofrecer (inicio)"};n.textContent=o[e]||o.en,n.setAttribute("data-prompt","Follow Observe-AI style. In English and Spanish, write a concise, professional response that (1) serves: acknowledge & empathize, (2) solves: steps, checks, policy guardrails, (3) sells: set expectation, optional upsell or value reinforcement. Ask a confirm-at-end question. If the user pasted context, adapt to it."),t.appendChild(n)}}document.addEventListener("DOMContentLoaded",async()=>{var T,F,_,E,r,C,L;let e=!1;try{e=!!(import.meta&&W&&W.VITE_CODEX==="1")}catch{}e||(e=new URLSearchParams(location.search).get("codex")==="1"||localStorage.getItem("codexMode")==="1"),e&&document.documentElement.classList.add("codex"),d.redirectTo=bt();try{typeof G=="function"&&G()&&window.addEventListener("unhandledrejection",v=>{var B;(B=v.preventDefault)==null||B.call(v)},{capture:!0})}catch{}const t=localStorage.getItem("lang")||"en";d.i18n=await ge(t),d.lang=t,Pe();let n;try{typeof G=="function"&&G()?(localStorage.setItem("welcomeSeen","1"),n=!1):n=e||localStorage.getItem("welcomeSeen")!=="1"}catch{n=e||localStorage.getItem("welcomeSeen")!=="1"}const o=document.getElementById("showWelcome");o&&o.addEventListener("click",()=>Ct());const s=document.getElementById("splashStart");s&&s.addEventListener("click",()=>{localStorage.setItem("welcomeSeen","1"),le()});const i=document.getElementById("splashDismiss");i&&i.addEventListener("click",()=>{localStorage.setItem("welcomeSeen","1"),le()}),n?Me():d.redirectTo&&setTimeout(()=>_e(d.redirectTo),80);const a=document.querySelector("header.topbar");a&&(a.style.zIndex="20");try{const v=document.querySelector("#sidebar .tabs"),B=v?Array.from(v.querySelectorAll('[role="tab"]')):[],k=Array.from(document.querySelectorAll("#sidebar .side-panel")),R=A=>{B.forEach(D=>D.setAttribute("aria-selected",String(D.dataset.tab===A))),k.forEach(D=>{D.hidden=D.getAttribute("data-panel")!==A})};B.forEach(A=>A.addEventListener("click",()=>R(A.dataset.tab))),B.length&&R(((T=B.find(A=>A.getAttribute("aria-selected")==="true"))==null?void 0:T.dataset.tab)||"carriers")}catch{}try{const v=(JSON.parse(localStorage.getItem("cst.settings")||"{}")||{}).theme;ce(v||(e?"light":"dark"))}catch{ce(e?"light":"dark")}(F=document.getElementById("themeToggle"))==null||F.addEventListener("click",mt),(_=document.getElementById("openSettingsTop"))==null||_.addEventListener("click",()=>H("settings")),(E=document.getElementById("openCopilotBtn"))==null||E.addEventListener("click",()=>{document.getElementById("modal-copilot")&&re()}),document.getElementById("langToggle").addEventListener("click",Et);const c=document.getElementById("helpMenuBtn"),m=document.getElementById("helpMenu"),p=document.getElementById("helpMenuWrap"),g=document.getElementById("helpWelcomeItem");if(c&&m){let v=!1;const B=k=>{v=k,m.style.display=k?"block":"none"};c.addEventListener("click",k=>{k.stopPropagation(),B(!v)}),document.addEventListener("click",k=>{v&&(p&&p.contains(k.target)||B(!1))})}g&&g.addEventListener("click",()=>{try{$e(),Fe(),qe()}catch{}const v=document.getElementById("helpMenu");v&&(v.style.display="none")}),document.getElementById("setupWizard");const f=document.getElementById("openSettings");f&&f.addEventListener("click",()=>H("settings")),document.getElementById("wizardSave").addEventListener("click",St),d.settings=It();const u=document.getElementById("testsModal"),y=document.getElementById("openTests");y&&y.addEventListener("click",()=>H("tests")),document.getElementById("testsClose").addEventListener("click",()=>u.close()),document.getElementById("testsFetchBtn").addEventListener("click",wt),(r=document.getElementById("t_run_doctor"))==null||r.addEventListener("click",Lt),(C=document.getElementById("t_run_ui_audit"))==null||C.addEventListener("click",Tt),(L=document.getElementById("t_run_splash_diag"))==null||L.addEventListener("click",At),He();const b=document.getElementById("denialsModal"),l=document.getElementById("denialsClose");l&&l.addEventListener("click",()=>b==null?void 0:b.close());const h=document.getElementById("carrierModal"),x=document.getElementById("carrierClose");x&&x.addEventListener("click",()=>h==null?void 0:h.close());try{d.copilotSamples=await fetch("/copilot-prompts.json").then(v=>v.ok?v.json():[])}catch{d.copilotSamples=[]}ue(),ne(),ut(d.lang),We();const w=document.getElementById("dropzone");w.addEventListener("dragover",v=>{v.preventDefault(),w.classList.add("hover")}),w.addEventListener("dragleave",()=>w.classList.remove("hover")),w.addEventListener("drop",Bt),document.addEventListener("paste",xt),window.addEventListener("securitypolicyviolation",v=>{const B=v.blockedURI||"";B.includes("vercel.live")||v.violatedDirective!=="style-src-attr"&&(d.cspViolations.push(`${v.violatedDirective} @ ${B||"inline"}`),j())}),j(),_t(),ve(),Pt(),Mt();try{pt()}catch{}try{$t()}catch{}document.addEventListener("click",v=>{var D,Q;const B=(Q=(D=v.target)==null?void 0:D.closest)==null?void 0:Q.call(D,"[data-open]");if(!B)return;const k=B.getAttribute("data-open");if(!k)return;if(k==="tests")return H("tests");if(k==="tools:denials"){Ee();return}if(k==="settings")return H("settings");if(k==="tools:copilot"){if(document.getElementById("modal-copilot")){re();return}const K=document.getElementById("copilotSection");K&&K.scrollIntoView({behavior:"smooth",block:"start"});return}if(k.startsWith("carrier:")){const U=k.split(":")[1];gt(U);return}const R={"tools:rpfr":"RPFR / PFR","tools:fmip":"FMIP Script","tools:denials":"Denials","tools:affidavits":"Affidavits","tools:byod":"BYOD Premium Check","tools:smartdrop":"SmartDrop (OCR)",smartdrop:"SmartDrop (OCR)"},A={"product:UBIF":"uBreakiFix","product:RSG":"Repair Service Group","product:HOMEPLUS":"Asurion Home+","product:APPLIANCEPLUS":"Asurion Appliance+","product:VZ_HDP":"Verizon Home Device Protect","product:ATT_HTP":"AT&T Home Tech Protection"};if(R[k]){k==="tools:smartdrop"||k==="smartdrop"?Ne():(N(`Tool open → ${R[k]} (TODO: modal/panel)`),I(R[k]));return}A[k]&&(N(`Product panel open → ${A[k]} (TODO)`),I(A[k]))})});function pt(){const e=document.getElementById("topSearch"),t=document.getElementById("searchInput"),n=document.getElementById("searchSuggest");if(!t||!n)return;try{if(localStorage.getItem("ui.search")==="0"){e&&(e.style.display="none");return}}catch{}const o=f=>{var u;return(u=d.i18n)!=null&&u.t?d.i18n.t(f):f},s=[{id:"qa:copilot",label:()=>o("QuickOpenCopilot"),run:()=>{var u;document.getElementById("modal-copilot")?re():(u=document.getElementById("copilotSection"))==null||u.scrollIntoView({behavior:"smooth"})}},{id:"qa:denials",label:()=>o("QuickOpenDenials"),run:()=>Ee()},{id:"qa:smartdrop",label:()=>o("QuickOpenSmartDrop"),run:()=>Ne()},{id:"qa:policies",label:()=>o("QuickOpenPolicies"),run:()=>I("Policies hub coming soon")},{id:"qa:xr",label:()=>o("QuickOpenXR"),run:()=>I("XR Library coming soon")},{id:"qa:byod",label:()=>o("QuickOpenBYOD"),run:()=>I("BYOD Check coming soon")},{id:"qa:rpfr",label:()=>o("QuickOpenRPFR"),run:()=>{const f=document.querySelector('[data-open="bucket:rpfr"]');f?f.click():I("RPFR")}}];function i(f){const u=String(f||"").trim().toLowerCase(),y=[];return u?((u.includes("denial")||u.includes("no airtime")||u.includes("deneg"))&&y.push(s.find(b=>b.id==="qa:denials")),(u.includes("rpfr")||u.includes("reimburse"))&&y.push(s.find(b=>b.id==="qa:rpfr")),(u.includes("fmip")||u.includes("icloud")||u.includes("find my"))&&y.push({id:"qa:fmip",label:()=>"Open FMIP Script",run:()=>I("FMIP Script coming soon")}),(u.includes("scan")||u.includes("pdf")||u.includes("ocr"))&&y.push(s.find(b=>b.id==="qa:smartdrop")),y.find(b=>(b==null?void 0:b.id)==="qa:copilot")||y.push(s.find(b=>b.id==="qa:copilot")),y.filter(Boolean).slice(0,4)):y}let a=[],c=-1;function m(f){n.innerHTML="";const u=!!String(f||"").trim(),y=l=>{const h=document.createElement("div");h.className="suggest-label",h.textContent=l,n.appendChild(h)},b=l=>{const h=document.createElement("div");return h.className="suggest-option",h.setAttribute("role","option"),h.dataset.id=l.id,h.textContent=typeof l.label=="function"?l.label():l.label,n.appendChild(h),h};u?(y(o("NextSuggestions")),i(f).forEach(l=>b(l))):(y(o("QuickActions")),s.forEach(l=>b(l))),a=Array.from(n.querySelectorAll('[role="option"]')),c=a.length?0:-1,p(),n.style.display=a.length?"block":"none",t.setAttribute("aria-expanded",a.length?"true":"false")}function p(){a.forEach((f,u)=>f.classList.toggle("active",u===c))}function g(){const f=a[c];if(!f)return;const u=f.dataset.id,y=[...s,...i(t.value)].find(b=>(b==null?void 0:b.id)===u);if(y&&typeof y.run=="function")try{y.run()}catch{}n.style.display="none",t.setAttribute("aria-expanded","false")}t.addEventListener("input",()=>m(t.value)),t.addEventListener("focus",()=>m(t.value)),t.addEventListener("blur",()=>setTimeout(()=>{n.style.display="none",t.setAttribute("aria-expanded","false")},120)),t.addEventListener("keydown",f=>{f.key==="ArrowDown"?(f.preventDefault(),a.length&&(c=(c+1)%a.length,p())):f.key==="ArrowUp"?(f.preventDefault(),a.length&&(c=(c-1+a.length)%a.length,p())):f.key==="Enter"?c>-1&&(f.preventDefault(),g()):f.key==="Escape"&&(n.style.display="none",t.setAttribute("aria-expanded","false"))}),n.addEventListener("mousedown",f=>{var b,l;const u=(l=(b=f.target)==null?void 0:b.closest)==null?void 0:l.call(b,'[role="option"]');if(!u)return;const y=a.indexOf(u);y>-1&&(c=y,p(),g())})}function H(e){const t=e==="settings"?"setupWizard":e==="tests"?"testsModal":e,n=document.getElementById(t);n&&(typeof n.showModal=="function"?n.showModal():n.scrollIntoView({behavior:"smooth",block:"start"}))}function I(e){try{console.log("[Toast]",e)}catch{}}function mt(){try{const e=document.documentElement,o=(["theme-dark","theme-light","theme-glass","theme-macos"].find(a=>e.classList.contains(a))||"theme-dark").replace("theme-",""),s=["dark","light","glass","macos"],i=s[(s.indexOf(o)+1)%s.length];ce(i);try{const a=JSON.parse(localStorage.getItem("cst.settings")||"{}")||{};a.theme=i,localStorage.setItem("cst.settings",JSON.stringify(a))}catch{}I("Theme: "+i)}catch{}}function N(e){try{console.debug("[QA]",e)}catch{}}function Ne(){const e=document.getElementById("modal-smartdrop");if(!e)return I("SmartDrop not available");e.hidden=!1;const t=e.querySelector("[data-close]");t&&(t.onclick=()=>e.hidden=!0);const n=document.getElementById("sd_drop"),o=document.getElementById("sd_file"),s=document.getElementById("sd_preview"),i=document.getElementById("sd_status"),a=document.getElementById("sd_suggest"),c=document.getElementById("sd_suggest_label"),m=document.getElementById("sd_learn"),p=document.getElementById("sd_route_denials"),g=document.getElementById("sd_route_rpfr"),f=document.getElementById("sd_route_fmip");function u(E){i&&(i.textContent=E||"")}function y(E){const r=new Set("a,an,the,of,to,in,for,on,and,or,if,then,with,by,be,is,are,was,were,as,at,from,that,this,it,its,into,you,your,de,la,el,los,las,un,una,para,por,con,en,es,son,era,eran,como,que,esto,este,su".split(","));return(E||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter(C=>C.length>2&&!r.has(C)).slice(0,400)}function b(E,r){try{return JSON.parse(localStorage.getItem(E)||"")||r}catch{return r}}function l(E,r){localStorage.setItem(E,JSON.stringify(r))}function h(E,r,C={}){const v={denials:"cst_bucket_denials",rpfr:"cst_bucket_rpfr",fmip:"cst_bucket_fmip"}[E],B="cst_bucket:"+E;if(!E)return;const k={ts:Date.now(),text:String(r||"").slice(0,2e4),meta:C};if(v){const A=b(v,[]);A.unshift(k),l(v,A.slice(0,200))}const R=b(B,[]);R.unshift(k),l(B,R.slice(0,200))}function x(E,r){const C="cst_route_rules_v1",L=b(C,{});for(const v of y(r))L[v]??(L[v]={denials:0,rpfr:0,fmip:0}),L[v][E]+=1;l(C,L)}function w(E){const C=b("cst_route_rules_v1",{}),L={denials:0,rpfr:0,fmip:0};for(const B of y(E)){const k=C[B];k&&(L.denials+=k.denials,L.rpfr+=k.rpfr,L.fmip+=k.fmip)}const v=Object.entries(L).sort((B,k)=>k[1]-B[1])[0];return{score:L,best:v&&v[1]>0?v[0]:null}}function T(E){const r=w(E||"");if(r.best){a.style.display="";const C=r.best==="rpfr"?"RPFR":r.best==="fmip"?"FMIP":"Denials";c.textContent=`${C} (learned)`}else a.style.display="none",c.textContent=""}["dragenter","dragover"].forEach(E=>n.addEventListener(E,r=>{r.preventDefault(),r.stopPropagation(),n.style.background="#141422"})),["dragleave","drop"].forEach(E=>n.addEventListener(E,r=>{r.preventDefault(),r.stopPropagation(),n.style.background=""})),n.addEventListener("drop",async E=>{var C,L;const r=(L=(C=E.dataTransfer)==null?void 0:C.files)==null?void 0:L[0];r&&await F(r)}),o.addEventListener("change",async E=>{var C;const r=(C=E.target.files)==null?void 0:C[0];r&&(await F(r),o.value="")});async function F(E){u(`Processing "${E.name}"…`),I("Analyzing file…");try{const r=(E.name.split(".").pop()||"").toLowerCase();let C="";if(/(png|jpg|jpeg|bmp|gif|webp|tif|tiff|pdf|heic)$/.test(r))C=await Nt(E);else if(/(txt|csv|log|md|json)$/.test(r))C=await E.text();else try{C=await E.text()}catch{C=`[${r.toUpperCase()} unsupported for OCR preview]`}s.value=String(C||"").trim();const L=(s.value.slice(0,240)||"(no text)").replace(/\s+/g," ");N(`SmartDrop: ${E.name}
→ ${L}${s.value.length>240?"…":""}`),T(s.value),u("Ready to route. Tip: edit the text before routing if needed.")}catch(r){u("Error reading file."),I("SmartDrop failed"),N("SmartDrop error: "+((r==null?void 0:r.message)||r))}}function _(E){const r=s.value.trim();if(!r){I("Nothing to route");return}h(E,r,{from:"smartdrop"}),m!=null&&m.checked&&x(E,r),I(`Routed to ${E.toUpperCase()}`),u(`Routed to ${E.toUpperCase()} at ${new Date().toLocaleTimeString()}`)}p.addEventListener("click",()=>_("denials")),g.addEventListener("click",()=>_("rpfr")),f.addEventListener("click",()=>_("fmip"))}const ft={DEVICE_INELIGIBLE:{en:{reason:"This device isn’t eligible under the plan.",rebuttal:"We can review alternate coverage options or repair pathways that might fit your device."},es:{reason:"Este equipo no es elegible bajo el plan.",rebuttal:"Podemos revisar opciones alternativas de cobertura o reparación que podrían ajustarse a su equipo."}}};function Ee(){const e=document.getElementById("denialsModal"),t=document.getElementById("denialsContent");!e||!t||(t.innerHTML=ht(ft,d.lang||"en"),e.showModal())}function ht(e,t){const n=Object.entries(e||{});return n.length?`<section>${n.map(([s,i])=>{const a=i.en||{},c=i[t]||i.en||{};return`
        <article class="card">
          <h3><code>${P(s)}</code></h3>
          <div class="cols">
            <div>
              <h4>EN</h4>
              <p><strong>Reason:</strong> ${P(a.reason||"")}</p>
              <p><strong>Rebuttal:</strong> ${P(a.rebuttal||"")}</p>
            </div>
            <div>
              <h4>${t.toUpperCase()}</h4>
              <p><strong>Reason:</strong> ${P(c.reason||"")}</p>
              <p><strong>Rebuttal:</strong> ${P(c.rebuttal||"")}</p>
            </div>
          </div>
        </article>
      `}).join("")}</section>`:'<p class="muted">No denials defined yet.</p>'}async function gt(e){N(`Carrier hub open → ${e}`);const t=document.getElementById("carrierModal"),n=document.getElementById("carrierContent");if(!(!t||!n)){n.textContent="Loading…";try{const o=await fetch(`/carriers/${e}.json`,{cache:"no-store"}).then(s=>s.ok?s.json():Promise.reject(new Error("Not found")));n.innerHTML=yt(o)}catch{n.textContent=`Failed to load carrier ${e}`}t.showModal()}}function yt(e){var m,p,g,f;const t=u=>P(String(u||"")),n=(u,y)=>Array.isArray(u)&&u.length?`<ul>${u.map(y).join("")}</ul>`:'<p class="muted">None</p>',o=n(e.tcs,u=>`<li><a href="${t(u.url)}" target="_blank" rel="noreferrer noopener">${t(u.label)}</a></li>`),s=n(e.common_denials,u=>`<li><code>${t(u.key)}</code> — ${t(u.label)}</li>`),i=n((m=e.fmip)==null?void 0:m.steps_en,u=>`<li>${t(u)}</li>`),a=n((p=e.fmip)==null?void 0:p.steps_es,u=>`<li>${t(u)}</li>`),c=n(e.support_links,u=>`<li><a href="${t(u.url)}" target="_blank" rel="noreferrer noopener">${t(u.label)}</a></li>`);return`
    <h2>${t(e.name||e.id)}</h2>
    <section>
      <h3>Terms & Policies</h3>
      ${o}
    </section>
    <section>
      <h3>Common Denials</h3>
      ${s}
    </section>
    <section>
      <h3>RPFR</h3>
      <p>${t(((g=e.rpfr)==null?void 0:g.eligibility_hint)||"")}</p>
      ${(f=e.rpfr)!=null&&f.note_template_en?`<pre class="preview">${t(e.rpfr.note_template_en)}</pre>`:""}
    </section>
    <section>
      <h3>FMIP</h3>
      <div class="cols">
        <div><h4>EN</h4>${i}</div>
        <div><h4>ES</h4>${a}</div>
      </div>
    </section>
    <section>
      <h3>Support</h3>
      ${c}
    </section>
  `}function bt(){try{const n=new URLSearchParams(location.search).get("next");if(n)return n}catch{}try{if(import.meta&&W&&W.VITE_AFTER_SPLASH_URL)return W.VITE_AFTER_SPLASH_URL}catch{}return localStorage.getItem("redirectAfterSplash")||null}function _e(e){try{if(typeof G=="function"&&G()||!e||typeof e!="string"||e===location.href||e===location.pathname)return;location.href=e}catch{}}async function Et(){const t=(localStorage.getItem("lang")||"en")==="en"?"es":"en";localStorage.setItem("lang",t),d.i18n=await ge(t),d.lang=t,Pe(),ne(),j(),ve()}function Pe(){document.querySelectorAll("[data-i18n]").forEach(t=>t.textContent=d.i18n.t(t.dataset.i18n));const e=document.querySelector("title[data-i18n]");e&&(e.textContent=d.i18n.t(e.dataset.i18n)),document.querySelectorAll("[data-i18n-placeholder]").forEach(t=>t.placeholder=d.i18n.t(t.dataset.i18nPlaceholder))}function Ie(e){const t=document.getElementById("splashStep");t&&(t.textContent=d.i18n?d.i18n.t(e):e)}function Me(){const e=document.getElementById("splash");if(!e)return;e.hidden=!1,e.classList.add("show");try{const c=document.getElementById("splashTitle");if(c&&!document.getElementById("splashTagline")){const m=document.createElement("p");m.id="splashTagline",m.className="muted",m.style.marginTop="4px",m.style.fontSize="14px",m.textContent=d.i18n?d.i18n.t("SplashTagline"):"White-glove support. Faster workflows. Gold-standard results.",c.insertAdjacentElement("afterend",m)}else if(c){const m=document.getElementById("splashTagline");m&&(m.textContent=d.i18n?d.i18n.t("SplashTagline"):m.textContent)}}catch{}const t=document.getElementById("splashBar");t&&(t.classList.remove("run"),requestAnimationFrame(()=>t.classList.add("run")));const n=document.getElementById("splash"),o=n==null?void 0:n.querySelector(".banner-inner");o&&(o.setAttribute("tabindex","-1"),o.focus()),ae=c=>{if(c.key==="Escape"&&localStorage.getItem("welcomeSeen")==="1"&&le(),c.key!=="Tab")return;const p=[...n.querySelectorAll("a[href],button,textarea,input,select,[tabindex]:not([tabindex='-1'])")].filter(u=>!u.disabled);if(!p.length)return;const g=p[0],f=p[p.length-1];c.shiftKey&&document.activeElement===g&&(f.focus(),c.preventDefault()),!c.shiftKey&&document.activeElement===f&&(g.focus(),c.preventDefault())},n.addEventListener("keydown",ae),J=0,fe(),clearInterval(ee),ee=setInterval(()=>{J=Math.min(J+7,97),fe(),J>=97&&clearInterval(ee)},180);const s=document.getElementById("splashRetry");s&&(s.onclick=()=>{clearInterval(ee),Me()});const i=["LoadingUI","LoadingTranslations","CheckingCore","StartingApp"];let a=0;Ie(i[a]),clearInterval(me),me=setInterval(()=>{a=Math.min(a+1,i.length-1),Ie(i[a])},700),z=!1,te=!1,vt()}function fe(){const e=document.getElementById("splashPct");e&&(e.textContent=`${J}%`)}function le(){const e=document.getElementById("splash");e&&(e.classList.remove("show"),e.hidden=!0,clearInterval(me),clearInterval(ee),e.removeEventListener("keydown",ae),ae=null)}function vt(){const e=document.getElementById("splashBar"),t=setTimeout(()=>{(!z||!te)&&(z=!0,te=!0,oe())},3e3);if(e){const n=()=>{z=!0,oe(),clearTimeout(t)};e.addEventListener("animationend",n,{once:!0}),setTimeout(n,2600)}else z=!0;Promise.allSettled([fetch("/i18n/en.json",{cache:"no-store"}),fetch("/i18n/es.json",{cache:"no-store"}),fetch("/assets/logo.svg",{cache:"no-store"})]).then(()=>{te=!0,oe(),clearTimeout(t)})}function oe(){if(z&&te){if(J=100,fe(),le(),localStorage.getItem("onboarded")==="1")d.redirectTo&&setTimeout(()=>_e(d.redirectTo),60);else{const t=document.getElementById("setupWizard");t&&typeof t.showModal=="function"&&setTimeout(()=>t.showModal(),80)}setTimeout(()=>{const t=document.getElementById("copilotRun");if(t)try{const n=t.getBoundingClientRect(),o=document.elementFromPoint(n.left+2,n.top+2);o===t||t.contains(o)}catch{}},100)}}function St(){var n;const e={name:X("#wName"),coach:X("#wCoach"),empId:X("#wEmpId"),ext:X("#wExt"),theme:X("#wTheme"),expertType:((n=document.getElementById("wExpertType"))==null?void 0:n.value)||"english"};if(!e.name||!e.empId||!e.ext)return;kt(e),localStorage.setItem("splashSeen","1"),document.getElementById("dontShow").checked&&localStorage.setItem("onboarded","1");const t=e.expertType==="bilingual";if(localStorage.setItem("cst_bilingual",t?"1":"0"),localStorage.getItem("cst_output_mode")||localStorage.setItem("cst_output_mode",t?"both":"en"),document.getElementById("setupWizard").close(),j(),localStorage.getItem("welcomeShown")!=="1")try{$e(),Fe(),qe()}catch{}}function X(e){var t;return(t=document.querySelector(e).value)==null?void 0:t.trim()}function kt(e){localStorage.setItem("cst.settings",JSON.stringify(e)),d.settings=e,e.theme&&ce(e.theme)}function It(){try{return JSON.parse(localStorage.getItem("cst.settings")||"{}")}catch{return{}}}function ce(e){const t=document.documentElement;t.classList.remove("theme-light","theme-dark","theme-glass","theme-macos"),e==="glass"?t.classList.add("theme-glass"):e==="light"?t.classList.add("theme-light"):e==="macos"?t.classList.add("theme-macos"):t.classList.add("theme-dark")}function Ct(){try{localStorage.removeItem("welcomeSeen");const e=document.getElementById("splash");if(!e)return;e.hidden=!1,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),1200)}catch{}}function $e(){var t,n;if(document.getElementById("modal-welcome"))return;const e=document.createElement("div");e.className="modal-backdrop",e.id="modal-welcome",e.setAttribute("data-testid","welcome-modal"),e.hidden=!0,e.innerHTML=`
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="welTitle">
      <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <h3 id="welTitle" data-testid="welcome-title" style="margin:0"></h3>
        <button class="btn secondary" data-testid="welcome-close" data-close>Close</button>
      </header>
      <div class="content">
        <div id="welBlocks" data-testid="welcome-blocks" style="display:grid;gap:10px"></div>
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <input type="checkbox" id="welDontShow" data-testid="welcome-dontshow" />
          <span id="welDontShowLabel" data-testid="welcome-dontshow-label"></span>
        </label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button id="welOpenCopilot" data-testid="welcome-open-copilot" class="btn"></button>
        </div>
      </div>
    </div>`,document.body.appendChild(e),e.addEventListener("click",o=>{o.target===e&&pe()}),(t=e.querySelector("[data-close]"))==null||t.addEventListener("click",()=>pe()),(n=document.getElementById("welOpenCopilot"))==null||n.addEventListener("click",()=>{var o;pe();try{if(document.getElementById("modal-copilot"))re();else{if(!document.getElementById("copilotSection"))try{ue(),ne()}catch{}(o=document.getElementById("copilotSection"))==null||o.scrollIntoView({behavior:"smooth",block:"start"})}}catch{}})}function Fe(){const e=p=>d.i18n?d.i18n.t(p):p,t=document.getElementById("welTitle"),n=document.getElementById("welBlocks"),o=document.getElementById("welOpenCopilot"),s=document.getElementById("welDontShowLabel");if(!n||!o)return;t&&(t.textContent=e("WelcomeHeadline")),o.textContent=e("CTAOpenCopilot"),s&&(s.textContent=e("Do Not Show Again"));const i=V(),a=i==="en"||i==="both",c=i==="es"||i==="both",m=p=>{const g=document.createElement("section");g.className="wel-block";const f=document.createElement("h4");f.className="muted",f.style.margin="0",f.style.fontWeight="600",f.textContent=p==="es"?"Español":"English";const u=document.createElement("p");u.style.margin="6px 0 0 0",u.textContent=e("WelcomeSubheadline");const y=document.createElement("p");return y.className="muted",y.style.margin="6px 0 0 0",y.textContent=e("WelcomeBody"),g.appendChild(f),g.appendChild(u),g.appendChild(y),g};n.innerHTML="",a&&n.appendChild(m("en")),c&&n.appendChild(m("es"))}function qe(){const e=document.getElementById("modal-welcome");if(!e)return;const t=document.getElementById("welDontShow");t&&(t.checked=!1),e.hidden=!1}function pe(e){const t=document.getElementById("modal-welcome");if(t){t.hidden=!0;{const n=document.getElementById("welDontShow");n!=null&&n.checked&&localStorage.setItem("welcomeShown","1")}}}function re(){const e=document.getElementById("modal-copilot");if(!e)return;e.hidden=!1;const t=e.querySelector("[data-close]");t&&(t.onclick=()=>e.hidden=!0);const n=document.getElementById("cp_quick_rpfr"),o=document.getElementById("cp_quick_fmip"),s=document.getElementById("cp_in");n&&(n.onclick=()=>s.value="RPFR: customer purchased accessory at retail; requesting reimbursement."),o&&(o.onclick=()=>s.value="FMIP override: customer forgot Apple ID; need safe coaching and Alpha note.");const i=document.getElementById("cp_run");i&&(i.onclick=async()=>{try{ue(),ne()}catch{}const m=document.getElementById("copilotInput");m&&(m.value=s.value);const p=document.getElementById("copilotRun");p&&p.click(),setTimeout(()=>{var y,b;const g=((y=document.getElementById("copilotEn"))==null?void 0:y.textContent)||"",f=((b=document.getElementById("copilotEs"))==null?void 0:b.textContent)||"",u=document.getElementById("cp_out");u&&(u.value=[g,f&&`

— ES —
`+f].filter(Boolean).join(`
`))},400)});const a=document.getElementById("cp_copy");a&&(a.onclick=()=>{var u,y;const m=((u=document.getElementById("copilotEn"))==null?void 0:u.textContent)||"",p=((y=document.getElementById("copilotEs"))==null?void 0:y.textContent)||"",g=V(),f=g==="en"?m:g==="es"||d.lang==="es"?p:m;navigator.clipboard.writeText(f).then(()=>I("Copied"))});const c=document.getElementById("cp_copy_all");c&&(c.style.display="none"),je()}function je(){const e=document.getElementById("cp_copy");if(!e)return;const t=o=>d.i18n?d.i18n.t(o):o,n=V();n==="en"?e.textContent=t("Copy EN"):n==="es"?e.textContent=t("Copy ES"):e.textContent=d.lang==="es"?t("Copy ES"):t("Copy EN")}async function wt(){const e=document.getElementById("testsOutput");e.textContent="Running /api/fetch…";try{const t=await fetch("/api/fetch"),n=await t.json();d.lastFetchRun={ok:t.ok,at:new Date().toISOString()},e.textContent=JSON.stringify(n,null,2)}catch(t){e.textContent="Fetch error: "+t.message,d.lastFetchRun={ok:!1,at:new Date().toISOString(),err:t.message}}j()}async function Bt(e){var n;e.preventDefault(),e.currentTarget.classList.remove("hover");const t=(n=e.dataTransfer.files)==null?void 0:n[0];if(t)if(t.type==="text/plain"){const o=await t.text();se(parseText(o))}else t.type==="application/pdf"||t.name.endsWith(".pdf")?se({error:"PDF parsing stub — add pdf.js (self-hosted) later."}):se({error:`Unsupported type: ${t.type||t.name}`})}function xt(e){var n;const t=(n=e.clipboardData)==null?void 0:n.getData("text");t&&t.length>5&&se(parseText(t))}function se(e){document.getElementById("preview").textContent=JSON.stringify(e,null,2)}async function He(){var o,s,i;const e=document.getElementById("ocrBadge");if(!e)return;try{const a=await fetch("/api/doctor?check=ocr");if(a.ok){const c=await a.json();c.ok&&((o=c.ocr)!=null&&o.ready)?(e.textContent="OCR: Ready ✅",e.style.borderColor="#16a34a"):(e.textContent="OCR: Offline ⚠️",e.style.borderColor="#ffb020",(i=(s=c.ocr)==null?void 0:s.missing)!=null&&i.length&&(e.title="Missing: "+c.ocr.missing.join(", ")));return}}catch{}const t=["/libs/tesseract/tesseract.min.js","/libs/tesseract/worker.min.js","/libs/tesseract/tesseract-core.wasm"],n=[];await Promise.all(t.map(async a=>{try{(await fetch(a,{method:"HEAD",cache:"no-store"})).ok||n.push(a)}catch{n.push(a)}})),n.length===0?(e.textContent="OCR: Ready ✅",e.style.borderColor="#16a34a"):(e.textContent="OCR: Offline ⚠️",e.style.borderColor="#ffb020",e.title="Missing: "+n.join(", "))}async function Lt(){const e=document.getElementById("testLog")||document.getElementById("testsOutput"),t=document.getElementById("t_run_doctor"),n=new Date().toISOString();if(t){if(t.disabled){console.log(`[${n}] Doctor test already running, ignoring request`);return}t.disabled=!0,t.textContent="Running..."}console.log(`[${n}] Doctor test started`),e&&(e.textContent=`Doctor: running… [${n}]`);try{console.log(`[${n}] Fetching /api/doctor`);const o=await fetch("/api/doctor",{method:"GET",cache:"no-store",headers:{"X-Request-ID":`doctor-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}});console.log(`[${n}] Doctor response status:`,o.status);const s=await o.json();console.log(`[${n}] Doctor response:`,s),e&&(e.textContent=JSON.stringify(s,null,2)),He(),I(s.ok?"Doctor passed":"Doctor found issues")}catch(o){console.error(`[${n}] Doctor error:`,o),e&&(e.textContent="Doctor error: "+((o==null?void 0:o.message)||o)),I("Doctor error")}finally{t&&(t.disabled=!1,t.textContent="Doctor")}}function Tt(){const e=document.getElementById("testLog")||document.getElementById("testsOutput");e&&(e.textContent="UI Text Audit: scanning…");try{const t=m=>{if(!m)return!1;const p=getComputedStyle(m);return p&&p.display!=="none"&&p.visibility!=="hidden"&&m.offsetParent!==null},n=[],o=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);let s;for(;s=o.nextNode();){const m=(s.nodeValue||"").replace(/\s+/g," ").trim();if(!m)continue;const p=s.parentElement;if(!p||!t(p))continue;const g=p.tagName;g==="SCRIPT"||g==="STYLE"||g==="CODE"||g==="PRE"||n.push(m)}const i=[],a=/([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-']*)(?:\s+\1){2,}/i;n.forEach((m,p)=>{a.test(m)&&i.push({i:p,type:"repeat-token",line:m}),p>0&&n[p-1]===m&&i.push({i:p,type:"repeat-line",line:m})});const c={totalLines:n.length,issues:i.slice(0,50),hint:"Look for repeat-token or repeat-line entries."};e&&(e.textContent=JSON.stringify(c,null,2))}catch(t){e&&(e.textContent="UI Text Audit error: "+((t==null?void 0:t.message)||t))}}function At(){var t,n;const e=document.getElementById("testLog")||document.getElementById("testsOutput");e&&(e.textContent="Splash diagnostics: collecting…");try{const o=document.getElementById("splash"),s=((t=document.getElementById("splashStep"))==null?void 0:t.textContent)||"",i=((n=document.getElementById("splashPct"))==null?void 0:n.textContent)||"",a=o==null?void 0:o.classList.contains("show"),c=!!(o!=null&&o.hidden),m=localStorage.getItem("welcomeSeen")||"0",p=localStorage.getItem("onboarded")||"0",g={showClass:a,hidden:c,step:s,pct:i,welcomeSeen:m,onboarded:p};e&&(e.textContent=JSON.stringify(g,null,2))}catch(o){e&&(e.textContent="Splash diagnostics error: "+((o==null?void 0:o.message)||o))}}function ue(){if(document.getElementById("copilotSection"))return;let e=document.querySelector(".content");e||(e=document.createElement("div"),e.className="content",document.body.appendChild(e));const t=document.createElement("section");t.id="copilotSection",t.setAttribute("data-testid","copilot-section"),t.innerHTML=`
    <div class="copilot-header">
      <h2 id="copilotTitle" data-testid="copilot-title"></h2>
      <span id="copilotEngine" data-testid="copilot-engine" class="pill" title="Locked to offline engine"></span>
      <label style="margin-left:auto;display:flex;align-items:center;gap:6px">
        <span id="copilotOutputLabel" data-testid="copilot-output-label" style="font-size:12px;opacity:.8">Output</span>
        <select id="copilotMode" data-testid="copilot-mode">
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="both">Bilingual</option>
        </select>
      </label>
    </div>
    <label><span id="copilotSampleLabel"></span><select id="copilotSample" data-testid="copilot-sample"></select></label>
    <label><span id="copilotInputLabel"></span><textarea id="copilotInput" data-testid="copilot-input"></textarea></label>
    <button id="copilotRun" data-testid="copilot-run"></button>
    <div id="copilotOutput" class="copilot-output" data-testid="copilot-output">
      <div class="copilot-col">
        <h3 id="copilotEnLabel" data-testid="copilot-en-label"></h3>
        <pre id="copilotEn" data-testid="copilot-en" class="preview"></pre>
        <button id="copilotCopyEn" data-testid="copilot-copy-en"></button>
      </div>
      <div class="copilot-col">
        <h3 id="copilotEsLabel" data-testid="copilot-es-label"></h3>
        <pre id="copilotEs" data-testid="copilot-es" class="preview"></pre>
        <button id="copilotCopyEs" data-testid="copilot-copy-es"></button>
      </div>
    </div>
    <p id="copilotMsg" class="warn" hidden></p>
  `;const n=document.getElementById("systemStatus");n&&n.parentNode===e?e.insertBefore(t,n):e.appendChild(t),document.getElementById("copilotRun").addEventListener("click",Dt),document.getElementById("copilotCopyEn").addEventListener("click",()=>Ce("copilotEn")),document.getElementById("copilotCopyEs").addEventListener("click",()=>Ce("copilotEs"))}function ne(){if(!document.getElementById("copilotSection"))return;const e=s=>d.i18n.t(s);document.getElementById("copilotTitle").textContent=e("Copilot");const t=document.getElementById("copilotOutputLabel");t&&(t.textContent=e("Output"));const n=document.getElementById("copilotEngine");if(n){let s=!0;try{(localStorage.getItem("freeLock")==="0"||import.meta&&W&&W.VITE_FREE_LOCK==="0")&&(s=!1)}catch{}s?(n.textContent=e("EngineOfflineLocked"),n.title=e("LockedOfflineEngine"),n.setAttribute("aria-disabled","true"),n.hidden=!1):n.hidden=!0}document.getElementById("copilotSampleLabel").textContent=e("Sample prompt"),document.getElementById("copilotInputLabel").textContent=e("Additional instructions"),document.getElementById("copilotRun").textContent=e("Generate"),document.getElementById("copilotEnLabel").textContent=e("English"),document.getElementById("copilotEsLabel").textContent=e("Spanish"),document.getElementById("copilotCopyEn").textContent=e("Copy EN"),document.getElementById("copilotCopyEs").textContent=e("Copy ES");const o=document.getElementById("copilotSample");o.innerHTML="",Array.isArray(d.copilotSamples)&&d.copilotSamples.forEach(s=>{const i=document.createElement("option");i.value=s.id,i.textContent=s.label&&(s.label[d.lang]||s.label.en)||s.id,s.prompt&&i.setAttribute("data-prompt",s.prompt),o.appendChild(i)});try{const s=document.getElementById("copilotMode");s&&!s.dataset.wired?(s.dataset.wired="1",s.options&&s.options.length>=3&&(s.options[0].textContent=e("English"),s.options[1].textContent=e("Spanish"),s.options[2].textContent=e("Bilingual")),s.value=V(),s.addEventListener("change",()=>{Rt(s.value),ie();try{je()}catch{}}),ie()):s&&(s.options&&s.options.length>=3&&(s.options[0].textContent=e("English"),s.options[1].textContent=e("Spanish"),s.options[2].textContent=e("Bilingual")),s.value=V(),ie())}catch{}}async function Dt(){var m;const e=document.getElementById("copilotSample"),t=d.copilotSamples.find(p=>p.id===e.value),n=document.getElementById("copilotInput").value;let o=null;try{const p=document.getElementById("preview").textContent;p&&(o=JSON.parse(p))}catch{}const s=ze((t==null?void 0:t.prompt)||((m=e.selectedOptions[0])==null?void 0:m.getAttribute("data-prompt"))||"",n,o),i=document.getElementById("copilotEn"),a=document.getElementById("copilotEs"),c=document.getElementById("copilotMsg");i.textContent=a.textContent="",c.textContent=d.i18n.t("Loading..."),c.hidden=!1;try{if(d.engine==="local-llm"){const p=await dt(s);i.textContent=p,a.textContent=p,c.hidden=!0}else{const p=await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:s})}),g=await p.json();if(!p.ok)throw new Error(String(p.status||"Copilot error"));i.textContent=g.en||"",a.textContent=g.es||"",c.hidden=!0}}catch{if(d.engine==="templates"){const p="Draft: "+(n||"").trim()+`

(Select a specific denial or switch engine to Local LLM beta.)`;i.textContent=p,a.textContent=p,c.hidden=!0}else c.textContent=d.i18n.t("Set OPENAI_API_KEY in Vercel to enable Copilot.")}await We(),ie()}function V(){const e=localStorage.getItem("cst_output_mode");return e==="en"||e==="es"||e==="both"?e:localStorage.getItem("cst_bilingual")==="1"?"both":"en"}function Rt(e){const t=e==="es"?"es":e==="both"?"both":"en";localStorage.setItem("cst_output_mode",t)}function ie(){var o,s;const e=V(),t=(o=document.getElementById("copilotEn"))==null?void 0:o.parentElement,n=(s=document.getElementById("copilotEs"))==null?void 0:s.parentElement;!t||!n||(e==="en"?(t.style.display="",n.style.display="none"):e==="es"?(t.style.display="none",n.style.display=""):(t.style.display="",n.style.display=""))}async function Ce(e){try{let t=null;e&&e.startsWith&&e.startsWith("#")?t=document.querySelector(e):t=document.getElementById(e);const n=t&&(t.value||t.textContent)||"";await navigator.clipboard.writeText(n),I("Copied")}catch{I("Copy failed")}}async function We(){try{await(await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:"ping"})})).json(),d.copilotReachable=!0}catch{d.copilotReachable=!1}j()}let we=!1,Ue=null;async function Ot(){if(we)return!0;try{return await new Promise((e,t)=>{const n=document.createElement("script");n.src="/libs/tesseract/tesseract.min.js",n.onload=e,n.onerror=()=>t(new Error("Failed to load OCR lib")),document.head.appendChild(n)}),window.Tesseract?(Ue=window.Tesseract,we=!0,!0):!1}catch{return!1}}async function Nt(e){if(!await Ot())throw new Error("OCR not available");const n=await Ue.createWorker({workerPath:"/libs/tesseract/worker.min.js",langPath:"/libs/tesseract/",corePath:"/libs/tesseract/tesseract-core.wasm"});await n.loadLanguage("eng"),await n.initialize("eng");const{data:o}=await n.recognize(e);return await n.terminate(),(o==null?void 0:o.text)||""}async function _t(){const e=!!document.querySelector('script[type="module"][src*="/assets/index-"]'),t=["/assets/logo.svg","/api/fetch"],n=await Promise.all(t.map(async o=>{try{const s=await fetch(o,{method:"GET"});return[o,s.ok]}catch{return[o,!1]}}));d.urlTest=Object.fromEntries([...n,["mainScript",e]]),j()}function j(){var i;const e=[],n=["setupWizard","wizardForm","openTests","testsFetchBtn"].filter(a=>!document.getElementById(a));e.push(q("Required UI elements",n.length?`Missing: ${n.join(", ")}`:"OK",!n.length)),e.push(q("CSP violations",d.cspViolations.length?d.cspViolations.join(" • "):"None",d.cspViolations.length===0));const o=d.urlTest||{},s=o.mainScript===!0&&["/assets/logo.svg","/api/fetch"].every(a=>o[a]);e.push(q("Core assets test",JSON.stringify(o),s)),e.push(q("i18n",`lang=${localStorage.getItem("lang")||"en"}`,!!d.i18n)),e.push(q("T&C fetch",d.lastFetchRun?JSON.stringify(d.lastFetchRun):"Not yet",!!((i=d.lastFetchRun)!=null&&i.ok))),e.push(q("Setup",d.settings&&d.settings.name?"Saved":"Not set",!!(d.settings&&d.settings.name))),d.copilotReachable!==null&&e.push(q(d.i18n.t("Copilot reachable"),d.copilotReachable?"OK":"Fail",d.copilotReachable)),Array.isArray(d.jsErrors)&&d.jsErrors.length&&e.push(q("Errors",d.jsErrors.join(" | "),!1)),document.getElementById("statusList").innerHTML=e.map(a=>`<li class="${a.ok?"ok":"fail"}"><strong>${a.label}:</strong> ${P(a.msg)}</li>`).join("")}function q(e,t,n){return{label:e,msg:t,ok:n}}function P(e){return String(e).replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}window.addEventListener("load",()=>{localStorage.getItem("welcomeSeen")!=="1"&&setTimeout(oe,400)});async function ve(){const e=document.getElementById("highlightsList");if(e)try{const t=await fetch("/highlights.json",{cache:"no-store"}).then(n=>n.ok?n.json():[]);e.innerHTML="",t.forEach(n=>{var a,c,m,p;const o=document.createElement("article");o.className="card";const s=((a=n.title)==null?void 0:a[d.lang])||((c=n.title)==null?void 0:c.en)||"",i=((m=n.body)==null?void 0:m[d.lang])||((p=n.body)==null?void 0:p.en)||"";o.innerHTML=`<h3>${P(s)}</h3><p>${P(i)}</p>`,e.appendChild(o)})}catch{}}document.addEventListener("DOMContentLoaded",ve);function Pt(){const e=[];["virgin.svg","consumer-cellular.svg","uscellular.svg","optimum.svg","cox.svg","telus.svg","koodo.svg","bell.svg","samsung.svg","ubreakifix.svg","rsg.svg","homeplus.svg","applianceplus.svg","vz-hdp.svg","att-htp.svg"].forEach(t=>{fetch("/assets/"+t,{method:"HEAD"}).then(n=>{n.ok||(e.push("/assets/"+t),N("Missing asset: /assets/"+t))}).catch(()=>{e.push("/assets/"+t),N("Missing asset: /assets/"+t)})}),["SAMSUNG.json","VIRGIN.json"].forEach(t=>{fetch("/carriers/"+t,{method:"HEAD"}).then(n=>{n.ok||(e.push("/carriers/"+t),N("Missing carrier json: /carriers/"+t))}).catch(()=>{e.push("/carriers/"+t),N("Missing carrier json: /carriers/"+t)})}),setTimeout(()=>{e.length&&N("QA misses: "+e.join(", "))},600)}(function(){var b;const t=(l,h=document)=>h.querySelector(l),n=(l,h=document)=>Array.from(h.querySelectorAll(l)),o=t("#sidebar");if(o&&!t("#bucketSection")){const l=document.createElement("div");l.className="side-title",l.textContent="Routed Buckets",l.id="bucketSection";const h=document.createElement("ul");h.className="nav",h.innerHTML=`
  <li data-open="tools:copilot">🤖 Copilot</li>
      <li data-open="bucket:denials">🚨 Denials</li>
      <li data-open="bucket:rpfr">💳 RPFR</li>
      <li data-open="bucket:fmip">📱 FMIP</li>
    `,o.appendChild(l),o.appendChild(h),h.querySelectorAll("[data-open]").forEach(x=>{x.addEventListener("click",()=>{const w=x.getAttribute("data-open");if(w!=null&&w.startsWith("bucket:")){const T=w.split(":")[1];u(T)}})})}if(!t("#modal-bucket")){const l=document.createElement("div");l.className="modal-backdrop",l.id="modal-bucket",l.innerHTML=`
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="bucketTitle">
        <header style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h3 id="bucketTitle" style="margin:0">Bucket</h3>
          <div style="display:flex;gap:8px">
            <button class="btn secondary" id="bucketExport">Export JSON</button>
            <button class="btn secondary" id="bucketClear">Clear</button>
            <button class="btn secondary" data-close>Close</button>
          </div>
        </header>
        <div class="content">
          <div id="bucketMeta" class="muted" style="margin-bottom:8px"></div>
          <div id="bucketEmpty" class="muted" style="display:none">No items yet. Use SmartDrop to route content here.</div>
          <div id="bucketList" style="display:grid;gap:10px"></div>
        </div>
      </div>
    `,document.body.appendChild(l),l.addEventListener("click",h=>{h.target===l&&y(l)}),(b=l.querySelector("[data-close]"))==null||b.addEventListener("click",()=>y(l))}const s={denials:"Denials",rpfr:"RPFR",fmip:"FMIP"};function i(l){try{return JSON.parse(localStorage.getItem("cst_bucket:"+l)||"[]")}catch{return[]}}function a(l,h){localStorage.setItem("cst_bucket:"+l,JSON.stringify(h||[]))}function c(l){try{return new Date(l).toLocaleString()}catch{return""+l}}function m(l){const h=Number(l)||0;if(h<1024)return h+" B";const x=["KB","MB","GB"];let w=-1,T=h;do T/=1024,w++;while(T>=1024&&w<x.length-1);return T.toFixed(T<10?2:1)+" "+x[w]}async function p(l){try{await navigator.clipboard.writeText(l||""),I==null||I("Copied")}catch{I==null||I("Copy failed")}}function g(l,h){const x=new Blob([JSON.stringify(h,null,2)],{type:"application/json"}),w=URL.createObjectURL(x),T=document.createElement("a");T.href=w,T.download=l,document.body.appendChild(T),T.click(),setTimeout(()=>{URL.revokeObjectURL(w),T.remove()},0)}function f(l){var _,E;const h=i(l),x=t("#modal-bucket"),w=t("#bucketList"),T=t("#bucketEmpty"),F=t("#bucketMeta");if(!(!x||!w||!T||!F)){if(t("#bucketTitle").textContent=`${s[l]||l} Bucket`,F.textContent=`${h.length} item(s) · key: cst_bucket:${l}`,w.innerHTML="",!h.length){T.style.display="block",w.style.display="none";return}T.style.display="none",w.style.display="grid",h.slice().sort((r,C)=>((C==null?void 0:C.ts)||0)-((r==null?void 0:r.ts)||0)).forEach((r,C)=>{var D,Q;const L=(r==null?void 0:r.name)||(r==null?void 0:r.fileName)||`Item ${C+1}`,v=c((r==null?void 0:r.ts)||Date.now()),B=(r==null?void 0:r.type)||(r==null?void 0:r.mime)||"text/plain",k=m((r==null?void 0:r.size)||(r!=null&&r.text?r.text.length:0)),R=((r==null?void 0:r.text)||(r==null?void 0:r.content)||"").toString(),A=document.createElement("article");A.className="tile",A.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${L}</div>
          <div class="muted" style="font-size:12px">${v}</div>
        </div>
        <div class="muted" style="font-size:12px;margin:6px 0">${B} · ${k}</div>
        <textarea readonly rows="5" style="width:100%;resize:vertical;background:var(--panel-2);border:1px solid var(--border);color:var(--ink);padding:8px;border-radius:8px">${R}</textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button class="btn secondary" data-act="copy">Copy</button>
          <button class="btn secondary" data-act="remove">Remove</button>
        </div>
      `,(D=A.querySelector('[data-act="copy"]'))==null||D.addEventListener("click",()=>p(R)),(Q=A.querySelector('[data-act="remove"]'))==null||Q.addEventListener("click",()=>{const U=i(l),K=U.findIndex(Y=>(Y==null?void 0:Y.id)&&Y.id===r.id||Y===r);K>-1&&(U.splice(K,1),a(l,U)),f(l)}),w.appendChild(A)}),(_=t("#bucketExport"))==null||_.addEventListener("click",()=>{const r=i(l);g(`cst-${l}-bucket.json`,r)}),(E=t("#bucketClear"))==null||E.addEventListener("click",()=>{window.confirm(`Clear all items from ${s[l]||l}?`)&&(a(l,[]),f(l),I==null||I("Bucket cleared."))})}}function u(l){f(l);const h=t("#modal-bucket");h&&(h.style.display="flex",document.body.style.overflow="hidden")}function y(l){var x;const h=((x=l==null?void 0:l.closest)==null?void 0:x.call(l,".modal-backdrop"))||l;h&&(h.style.display="none",document.body.style.overflow="")}n("[data-open]").forEach(l=>{l.addEventListener("click",()=>{var x;const h=l.getAttribute("data-open");(x=h==null?void 0:h.startsWith)!=null&&x.call(h,"bucket:")&&u(h.split(":")[1])})});try{const l=["denials","rpfr","fmip"].map(h=>`${h}:${(i(h)||[]).length}`).join(" | ");(window.logQA||console.debug)(`Buckets: ${l}`)}catch{}})();function Mt(){try{const e=(p,g)=>getComputedStyle(p).getPropertyValue(g).trim(),t=document.body,n=e(t,"background-color"),o=e(t,"color"),s=he(n,o),i=document.querySelector(".tile")||t,a=e(i,"background-color"),c=e(i,"color")||o,m=he(a,c);(s<4.3||m<4.3)&&document.documentElement.classList.add("high-contrast")}catch{}}function he(e,t){function n(b){const l=b&&b.match&&b.match(/rgba?\(([^)]+)\)/i);if(!l)return[0,0,0];const h=l[1].split(",").map(x=>parseFloat(x.trim()));return h.length>=3?[h[0],h[1],h[2]]:[0,0,0]}function o(b){const l=b/255;return l<=.03928?l/12.92:Math.pow((l+.055)/1.055,2.4)}const[s,i,a]=n(e),[c,m,p]=n(t),g=.2126*o(s)+.7152*o(i)+.0722*o(a)+1e-4,f=.2126*o(c)+.7152*o(m)+.0722*o(p)+1e-4,u=Math.max(g,f),y=Math.min(g,f);return(u+.05)/(y+.05)}try{window._themeAudit=function(){const e=["theme-dark","theme-light","theme-glass"],t=document.documentElement;e.forEach((n,o)=>{setTimeout(()=>{t.classList.remove("theme-dark","theme-light","theme-glass"),t.classList.add(n),setTimeout(()=>{const s=getComputedStyle(document.body).backgroundColor,i=getComputedStyle(document.body).color;console.log(`[${n}] body contrast`,he(s,i).toFixed(2))},30)},o*80)})}}catch{}(function(){function t(i,a){var u;const c=((u=JSON.parse(localStorage.getItem("cst_profile")||"null"))==null?void 0:u.first)||"Agent",m=(localStorage.getItem("cst_lang")||localStorage.getItem("lang")||"en").toUpperCase(),p=localStorage.getItem("cst_bilingual")==="1",g=`You are CST Copilot. Return:
1) Chat Script (${m}${p?"+ES":""})
2) Alpha Note
3) Tag
4) Email (if needed)
`,f=`Expert: ${c}
Source bucket: ${String(i||"general").toUpperCase()}
---
`+(a||"").trim();return i==="denials"?`${g}
Denial context below. Produce SERVE/SOLVE/SELL.
${f}`:i==="rpfr"?`${g}
RPFR (Retail Purchase For Reimbursement) case. Summarize deductible handling and refund path.
${f}`:i==="fmip"?`${g}
FMIP (Find My iPhone) override coaching. Return customer-facing steps + internal Alpha.
${f}`:`${g}
General CST assistance.
${f}`}function n(i,a){if(!document.getElementById("copilotSection"))try{ue(),ne()}catch{}const c=t(i,a||""),m=document.getElementById("copilotInput");m&&(m.value=c,m.focus());const p=document.getElementById("copilotSection");p&&p.scrollIntoView({behavior:"smooth",block:"start"});const g=document.getElementById("copilotRun");g&&g.click()}try{window.openCopilotWith=n}catch{}const o=()=>{const i=document.getElementById("modal-bucket");if(i&&!i.dataset.composePatched){i.dataset.composePatched="1";const a=i.querySelector("header div");if(a){const c=document.createElement("button");c.className="btn secondary",c.id="bucketComposeAll",c.textContent="Compose All",a.insertBefore(c,a.firstChild),c.addEventListener("click",()=>{var u;const m=(((u=document.getElementById("bucketTitle"))==null?void 0:u.textContent)||"Bucket").toLowerCase(),p=m.includes("denials")?"denials":m.includes("rpfr")?"rpfr":m.includes("fmip")?"fmip":"general";let g=[];try{g=JSON.parse(localStorage.getItem("cst_bucket:"+p)||"[]")}catch{}const f=(g||[]).slice().sort((y,b)=>((b==null?void 0:b.ts)||0)-((y==null?void 0:y.ts)||0)).map(y=>(y==null?void 0:y.text)||(y==null?void 0:y.content)||"").filter(Boolean).join(`

—

`);if(!f){(window.showToast||alert)("Bucket is empty.");return}n(p,f)})}}};o();const s=document.getElementById("bucketList");s&&new MutationObserver(()=>{o(),s.querySelectorAll("article.tile").forEach(a=>{if(a.dataset.composeWired)return;a.dataset.composeWired="1";const c=a.querySelector('div[style*="justify-content:flex-end"]');if(c){const m=document.createElement("button");m.className="btn secondary",m.textContent="Compose",m.addEventListener("click",()=>{var u,y;const p=((u=a.querySelector("textarea"))==null?void 0:u.value)||"",g=(((y=document.getElementById("bucketTitle"))==null?void 0:y.textContent)||"").toLowerCase(),f=g.includes("denials")?"denials":g.includes("rpfr")?"rpfr":g.includes("fmip")?"fmip":"general";n(f,p)}),c.insertBefore(m,c.firstChild)}})}).observe(s,{childList:!0,subtree:!0})})();function $t(){document.querySelectorAll(".dashboard-card").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-action");Ft(a),i.classList.add("active"),setTimeout(()=>i.classList.remove("active"),300)})});const e=document.getElementById("dashboardCopilotInput"),t=document.getElementById("dashboardCopilotOutput"),n=document.getElementById("dashboardCopilotGenerate"),o=document.getElementById("dashboardCopilotCopy"),s=document.getElementById("dashboardCopilotCopyAll");document.querySelectorAll(".suggestion-chip").forEach(i=>{i.addEventListener("click",()=>{e&&(e.value=i.textContent,e.focus())})}),n&&e&&t&&n.addEventListener("click",async()=>{const i=e.value.trim();if(i){n.disabled=!0,n.textContent="Generating...",t.value="Generating response...";try{const c=await(await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:i})})).json();c.en?t.value=`English: ${c.en}

Spanish: ${c.es||"N/A"}`:t.value="Generated response would appear here."}catch(a){t.value=`Error: ${a.message}`}finally{n.disabled=!1,n.textContent="Generate"}}}),o&&t&&o.addEventListener("click",()=>{t.select(),document.execCommand("copy"),I("Response copied to clipboard")}),s&&t&&s.addEventListener("click",()=>{const a=`EN: ${t.value}

ES: [Spanish translation would be generated]`;navigator.clipboard.writeText(a).then(()=>{I("EN+ES response copied to clipboard")}).catch(()=>{t.value=a,t.select(),document.execCommand("copy"),I("EN+ES response copied to clipboard")})})}function Ft(e){var t,n,o;switch(e){case"build-summary":H("tests");break;case"carrier-escalation":(t=document.querySelector('[data-tab="carriers"]'))==null||t.click();break;case"denials-guide":Ee();break;case"copilot":(n=document.getElementById("copilotInput"))==null||n.focus();break;case"knowledge-base":I("Knowledge Base - Feature coming soon");break;case"rpfr-grid":(o=document.querySelector('[data-open="tools:rpfr"]'))==null||o.click();break;case"script-tracker":I("Script Tracker - Feature coming soon");break;case"terms-conditions":I("Terms & Conditions - Feature coming soon");break;case"quick-start":H("settings");break;default:I(`${e} - Feature coming soon`)}}
