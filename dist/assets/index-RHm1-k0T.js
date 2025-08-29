(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();function ue(e="en"){let t={},n=e;return{async init(o="en"){try{n=o;const[s,i]=await Promise.all([fetch("/i18n/en.json").then(l=>l.json()).catch(()=>({})),fetch("/i18n/es.json").then(l=>l.json()).catch(()=>({}))]);return t={en:s,es:i},!0}catch(s){return console.error("Failed to load translations:",s),t={en:{},es:{}},!1}},t(o,s){return(t[s||n]||t.en||{})[o]??o},setLanguage(o){n=o}}}function je(e="",t="",n=null){let o=[];if(n){let s=typeof n=="string"?n:JSON.stringify(n);o.push("CONTEXT_JSON="+s.slice(0,3e3))}return e&&o.push(e.trim()),t&&o.push(t.trim()),o.join(`

`).trim()}const pe={BASE_URL:"/",DEV:!1,MODE:"production",PROD:!0,SSR:!1};let z="en",R={name:"",empId:"",extension:"",coach:"",type:"english"},b={shiftStart:"",shiftEnd:"",breakDuration:15,lunchDuration:30,currentStatus:"available",nextBreak:null,nextLunch:null,onBreak:!1,breakStartTime:null};const r={settings:null,i18n:null,copilotReachable:null,lang:"en",jsErrors:[]};async function ke(){try{console.log("Initializing CST SmartDesk v1.0..."),nt(),r.i18n=ue(),await r.i18n.init(z),Ue(),ze(),ye(),setInterval(ye,1e3),console.log("CST SmartDesk v1.0 initialized successfully")}catch(e){console.error("Failed to initialize app:",e)}}function Ue(){const e=localStorage.getItem("cst_expert_info");e?(R=JSON.parse(e),Ie()):Je();const t=localStorage.getItem("cst_schedule_info");t&&(b={...b,...JSON.parse(t)},xe())}function He(){localStorage.setItem("cst_expert_info",JSON.stringify(R)),Ie()}function Ie(){const e=document.getElementById("expertName"),t=document.getElementById("expertEmpId"),n=document.getElementById("expertExtension"),o=document.getElementById("expertCoach");e&&(e.textContent=R.name||"Not Set"),t&&(t.textContent=R.empId||"Not Set"),n&&(n.textContent=R.extension||"Not Set"),o&&(o.textContent=R.coach||"Not Set")}function ye(){const e=new Date,t=e.toLocaleTimeString(),n=e.toLocaleDateString(),o=document.getElementById("currentTime");o&&(o.textContent=`${t} - ${n}`),We(e)}function We(e){if(!b.shiftStart||!b.shiftEnd){const n=document.getElementById("scheduleStatus");n&&(n.textContent="Schedule not set");return}const t=document.getElementById("scheduleStatus");if(b.onBreak){const n=new Date(b.breakStartTime),o=new Date(n.getTime()+b.breakDuration*6e4),s=Math.ceil((o-e)/6e4);if(s<=0)we(),Ce("Break time is over! Please return to available status.");else{const i=document.getElementById("breakTimeLeft");i&&(i.textContent=`Break ends in ${s} minutes`),t&&(t.textContent=`On Break (${s}m left)`)}}else t&&(t.textContent=`Available - ${b.currentStatus}`),Ge(e)}function Ge(e){const t=e.getHours()*60+e.getMinutes();if(t>=720&&t<=840){const n=localStorage.getItem("cst_last_lunch_alert"),o=e.toDateString();n!==o&&(localStorage.setItem("cst_last_lunch_alert",o),be("lunch","Time for lunch break!"))}if(t>=900&&t<=960){const n=localStorage.getItem("cst_last_break_alert"),o=e.toDateString();n!==o&&(localStorage.setItem("cst_last_break_alert",o),be("break","Time for your afternoon break!"))}}function be(e,t){Ce(t);const n=document.createElement("div");n.className="break-alert",n.innerHTML=`
    <div class="alert-content">
      <h3>${e==="lunch"?"🍽️":"☕"} ${t}</h3>
      <div class="alert-actions">
        <button onclick="startBreak('${e}')" class="btn-primary">Start ${e}</button>
        <button onclick="dismissBreakAlert(this)" class="btn-secondary">Later</button>
      </div>
    </div>
  `,document.body.appendChild(n),n.style.display="block",setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},3e4)}function Ce(e){const t=new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcCDuM0fPTgjMGH3PE8OObTgwOWK/n77JiGg");t.volume=.3,t.play().catch(()=>{"Notification"in window&&Notification.permission==="granted"&&new Notification("CST SmartDesk",{body:e})}),ie(e)}function we(){b.onBreak=!1,b.breakStartTime=null,b.currentStatus="available";const e=document.getElementById("breakTimer");e&&(e.style.display="none"),me(),ie("Break ended - Status: Available")}function me(){localStorage.setItem("cst_schedule_info",JSON.stringify(b)),xe()}function xe(){const e=document.getElementById("scheduleStatus");e&&(b.onBreak?e.textContent=`On ${b.currentStatus}`:e.textContent=b.shiftStart?`Available (${b.shiftStart} - ${b.shiftEnd})`:"Schedule not set")}function Je(){const e=document.getElementById("setupWizard");e&&(e.style.display="block")}function ze(){const e=document.getElementById("setupForm");e&&e.addEventListener("submit",Ke),document.addEventListener("click",i=>{i.target.classList.contains("close-modal")&&se(i.target.closest(".modal"))}),Ye();const t=document.getElementById("languageToggle");t&&t.addEventListener("click",Te);const n=document.getElementById("scheduleSettings");n&&n.addEventListener("click",Be);const o=document.getElementById("endBreak");o&&o.addEventListener("click",we);const s=document.getElementById("helpBtn");s&&s.addEventListener("click",Le),"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission(),document.addEventListener("keydown",Ve)}function Ve(e){if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;const t=document.querySelector('.modal[style*="block"]');if(t){e.key==="Escape"&&se(t);return}const n=e.key.toLowerCase(),o={f:"fmip",h:"hero-denial",b:"byod",s:"spanish-templates",a:"auto-fill",e:"escalations",n:"alpha-notes",r:"rpfr",t:"settings",l:"language-toggle",p:"performance","?":"help"};o[n]&&(e.preventDefault(),n==="?"?Le():fe(o[n]))}function Ke(e){e.preventDefault();const t=new FormData(e.target);R.name=t.get("name"),R.empId=t.get("empId"),R.extension=t.get("extension"),R.coach=t.get("coach"),R.type=t.get("type"),t.get("shiftStart")&&(b.shiftStart=t.get("shiftStart"),b.shiftEnd=t.get("shiftEnd"),b.breakDuration=parseInt(t.get("breakDuration"))||15,b.enableBreakAlerts=!0,b.enableAudioAlerts=!0,me()),He(),se(document.getElementById("setupWizard")),ie("Welcome to CST SmartDesk v1.0! Setup complete.")}function Ye(){document.querySelectorAll(".smart-card").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.card;fe(n)})})}function fe(e){switch(console.log(`Opening ${e} modal`),tt("smartPanelUsage"),e){case"fmip":st();break;case"hero-denial":it();break;case"byod":at();break;case"spanish-templates":lt();break;case"auto-fill":ct();break;case"escalations":rt();break;case"alpha-notes":dt();break;case"rpfr":ut();break;case"settings":Be();break;case"language-toggle":Te();break;case"performance":Qe();break;default:console.log(`No handler for card type: ${e}`)}}function Qe(){const e=Ze(),t=O("Performance Metrics",`
    <div class="performance-content">
      <h3>📊 Expert Performance Dashboard</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h4>🕒 Session Time</h4>
          <div class="metric-value">${e.sessionTime}</div>
          <div class="metric-label">Current session</div>
        </div>
        
        <div class="metric-card">
          <h4>🎯 SmartPanel Usage</h4>
          <div class="metric-value">${e.smartPanelUsage}</div>
          <div class="metric-label">Cards opened today</div>
        </div>
        
        <div class="metric-card">
          <h4>📝 Notes Generated</h4>
          <div class="metric-value">${e.notesGenerated}</div>
          <div class="metric-label">Auto-generated notes</div>
        </div>
        
        <div class="metric-card">
          <h4>📋 Clipboard Actions</h4>
          <div class="metric-value">${e.clipboardActions}</div>
          <div class="metric-label">Items copied</div>
        </div>
        
        <div class="metric-card">
          <h4>⚡ Break Compliance</h4>
          <div class="metric-value">${e.breakCompliance}%</div>
          <div class="metric-label">On-time breaks</div>
        </div>
        
        <div class="metric-card">
          <h4>🚀 Escalations</h4>
          <div class="metric-value">${e.escalations}</div>
          <div class="metric-label">Today's escalations</div>
        </div>
      </div>
      
      <div class="performance-insights">
        <h4>💡 Insights & Recommendations</h4>
        <ul id="performanceInsights">
          ${Xe(e)}
        </ul>
      </div>
      
      <div class="performance-actions">
        <button onclick="exportPerformanceData()" class="btn-primary">Export Data</button>
        <button onclick="resetDailyStats()" class="btn-secondary">Reset Daily Stats</button>
      </div>
    </div>
  `);P(t)}function Ze(){const e=localStorage.getItem("cst_session_start")||new Date().toISOString(),t=new Date,n=new Date(e),o=Math.floor((t-n)/6e4),s=JSON.parse(localStorage.getItem("cst_performance_stats")||"{}"),i=t.toDateString(),l=s[i]||{smartPanelUsage:0,notesGenerated:0,clipboardActions:0,escalations:0,breaksOnTime:0,totalBreaks:0};return{sessionTime:et(o),smartPanelUsage:l.smartPanelUsage,notesGenerated:l.notesGenerated,clipboardActions:l.clipboardActions,escalations:l.escalations,breakCompliance:l.totalBreaks>0?Math.round(l.breaksOnTime/l.totalBreaks*100):100}}function Xe(e){const t=[];return e.smartPanelUsage>10?t.push("<li>✅ Great SmartPanel usage! You're leveraging automation effectively.</li>"):t.push("<li>💡 Try using more SmartPanel cards to boost productivity.</li>"),e.clipboardActions>5&&t.push("<li>⚡ High copy-paste efficiency - you're working smart!</li>"),e.breakCompliance>=80?t.push("<li>🎯 Excellent break compliance - great work-life balance!</li>"):t.push("<li>⏰ Consider taking regular breaks to maintain productivity.</li>"),e.escalations===0&&t.push("<li>🔥 Zero escalations today - excellent problem resolution!</li>"),t.length===0&&t.push("<li>📈 Keep up the great work! Your metrics look good.</li>"),t.join("")}function et(e){const t=Math.floor(e/60),n=e%60;return t>0?`${t}h ${n}m`:`${n}m`}function tt(e,t=1){const n=new Date().toDateString(),o=JSON.parse(localStorage.getItem("cst_performance_stats")||"{}");o[n]||(o[n]={smartPanelUsage:0,notesGenerated:0,clipboardActions:0,escalations:0,breaksOnTime:0,totalBreaks:0}),o[n][e]+=t,localStorage.setItem("cst_performance_stats",JSON.stringify(o))}function nt(){localStorage.getItem("cst_session_start")||localStorage.setItem("cst_session_start",new Date().toISOString())}function Be(){const e=O("Schedule Settings",`
    <div class="schedule-settings-content">
      <h3>⏰ Work Schedule Configuration</h3>
      <form id="scheduleForm">
        <div class="schedule-form">
          <label for="shiftStart">Shift Start Time:</label>
          <input type="time" id="shiftStart" value="${b.shiftStart||"09:00"}" required>
          
          <label for="shiftEnd">Shift End Time:</label>
          <input type="time" id="shiftEnd" value="${b.shiftEnd||"17:00"}" required>
          
          <label for="breakDuration">Break Duration (minutes):</label>
          <input type="number" id="breakDuration" value="${b.breakDuration}" min="5" max="60" required>
          
          <label for="lunchDuration">Lunch Duration (minutes):</label>
          <input type="number" id="lunchDuration" value="${b.lunchDuration}" min="15" max="90" required>
          
          <div class="checkbox-group">
            <label>
              <input type="checkbox" id="enableBreakAlerts" ${b.enableBreakAlerts!==!1?"checked":""}>
              Enable break reminder alerts
            </label>
            <label>
              <input type="checkbox" id="enableAudioAlerts" ${b.enableAudioAlerts!==!1?"checked":""}>
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
        <p><strong>Schedule:</strong> ${b.shiftStart||"Not set"} - ${b.shiftEnd||"Not set"}</p>
        <p><strong>Status:</strong> ${b.currentStatus}</p>
        <p><strong>Break Duration:</strong> ${b.breakDuration} minutes</p>
        <p><strong>Lunch Duration:</strong> ${b.lunchDuration} minutes</p>
      </div>
    </div>
  `);P(e);const t=document.getElementById("scheduleForm");t&&t.addEventListener("submit",ot)}function ot(e){e.preventDefault();const t=new FormData(e.target);b.shiftStart=t.get("shiftStart"),b.shiftEnd=t.get("shiftEnd"),b.breakDuration=parseInt(t.get("breakDuration")),b.lunchDuration=parseInt(t.get("lunchDuration")),b.enableBreakAlerts=document.getElementById("enableBreakAlerts").checked,b.enableAudioAlerts=document.getElementById("enableAudioAlerts").checked,me(),se(document.querySelector(".modal")),ie("Schedule settings saved successfully!")}function Le(){const e=O("Keyboard Shortcuts",`
    <div class="help-content">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <div class="shortcuts-grid">
        <div class="shortcut-section">
          <h4>SmartPanel Cards</h4>
          <div class="shortcut-list">
            <div class="shortcut-item"><kbd>F</kbd> FMIP Workflow</div>
            <div class="shortcut-item"><kbd>H</kbd> HERO Denial Scripts</div>
            <div class="shortcut-item"><kbd>B</kbd> BYOD Logic</div>
            <div class="shortcut-item"><kbd>S</kbd> Spanish Templates</div>
            <div class="shortcut-item"><kbd>A</kbd> Auto-Fill Forms</div>
            <div class="shortcut-item"><kbd>E</kbd> Escalations</div>
            <div class="shortcut-item"><kbd>N</kbd> Alpha Notes</div>
            <div class="shortcut-item"><kbd>R</kbd> RPFR Guide</div>
            <div class="shortcut-item"><kbd>P</kbd> Performance Metrics</div>
          </div>
        </div>
        
        <div class="shortcut-section">
          <h4>System Functions</h4>
          <div class="shortcut-list">
            <div class="shortcut-item"><kbd>T</kbd> Schedule Settings</div>
            <div class="shortcut-item"><kbd>L</kbd> Language Toggle</div>
            <div class="shortcut-item"><kbd>?</kbd> Show This Help</div>
            <div class="shortcut-item"><kbd>Esc</kbd> Close Modal</div>
          </div>
        </div>
      </div>
      
      <div class="help-tips">
        <h4>💡 Pro Tips</h4>
        <ul>
          <li>Shortcuts work when not typing in input fields</li>
          <li>Press <kbd>Esc</kbd> to quickly close any modal</li>
          <li>All shortcuts are case-insensitive</li>
          <li>Use <kbd>Ctrl+C</kbd> to copy generated content</li>
        </ul>
      </div>
      
      <div class="help-version">
        <p><strong>CST SmartDesk v1.0</strong> - Expert Productivity Suite</p>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `);P(e)}function st(){const e=O("FMIP Workflow Assistant",`
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
  `);P(e)}function it(){const e=O("HERO Denial Scripts",`
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
  `);P(e)}function at(){const e=O("BYOD Logic Helper",`
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
  `);P(e)}function lt(){const e=O("Spanish Templates",`
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
  `);P(e)}function ct(){const e=O("Auto-Fill Forms",`
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
  `);P(e)}function rt(){const e=O("Escalations Tracking",`
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
  `);P(e)}function dt(){const e=O("Alpha Notes Generator",`
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
  `);P(e)}function ut(){const e=O("RPFR vs PFR Guide",`
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
  `);P(e)}function O(e,t){const n=document.createElement("div");return n.className="modal",n.innerHTML=`
    <div class="modal-content">
      <div class="modal-header">
        <h2>${e}</h2>
        <span class="close-modal">&times;</span>
      </div>
      <div class="modal-body">
        ${t}
      </div>
    </div>
  `,n}function P(e){document.body.appendChild(e),e.style.display="block"}function se(e){e&&(e.style.display="none",e.parentNode&&e.parentNode.removeChild(e))}function ie(e){const t=document.createElement("div");t.className="notification",t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.classList.add("show")},100),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>{document.body.removeChild(t)},300)},3e3)}function Te(){z=z==="en"?"es":"en",r.i18n.init(z),console.log(`Language switched to: ${z}`)}document.addEventListener("DOMContentLoaded",ke);window.addEventListener("error",e=>{console.error("Global error:",e),r.jsErrors.push({message:e.message,filename:e.filename,line:e.lineno,timestamp:new Date().toISOString()})});typeof module<"u"&&module.exports&&(module.exports={expertInfo:R,state:r,init:ke,handleCardClick:fe});let ce=null,j=!1,K=!1,U=0,V=null,ee=null;try{const e=t=>{try{r.jsErrors=r.jsErrors||[],t&&r.jsErrors[0]!==t&&(r.jsErrors.unshift(String(t)),r.jsErrors=r.jsErrors.slice(0,5));try{$()}catch{}}catch{}};window.addEventListener("error",t=>{const n=t?.error?.message||t?.message||"Unknown error";e("Error: "+n)}),window.addEventListener("unhandledrejection",t=>{const n=t?.reason,o=n&&(n.message||n.toString?.())||"Unhandled rejection";e("Promise: "+o)})}catch{}function H(){try{return!!(typeof navigator<"u"&&"webdriver"in navigator&&navigator.webdriver)}catch{return!1}}function pt(e){r.engine=e,localStorage.setItem("cst_engine",e),C("Engine: "+e)}try{window.setEngine=pt}catch{}async function mt(e){return`[LOCAL ENGINE]

`+String(e||"")+`

(Template assist applied.)`}function ft(e){const t=document.querySelector("#copilotSample");if(t&&(!t.options||t.options.length===0)){const n=document.createElement("option");n.value="serve_solve_sell";const o={en:"Serve / Solve / Sell (starter)",es:"Atender / Resolver / Ofrecer (inicio)"};n.textContent=o[e]||o.en,n.setAttribute("data-prompt","Follow Observe-AI style. In English and Spanish, write a concise, professional response that (1) serves: acknowledge & empathize, (2) solves: steps, checks, policy guardrails, (3) sells: set expectation, optional upsell or value reinforcement. Ask a confirm-at-end question. If the user pasted context, adapt to it."),t.appendChild(n)}}document.addEventListener("DOMContentLoaded",async()=>{let e=!1;try{e=!!(import.meta&&pe&&!1)}catch{}e||(e=new URLSearchParams(location.search).get("codex")==="1"||localStorage.getItem("codexMode")==="1"),e&&document.documentElement.classList.add("codex"),r.redirectTo=St();try{typeof H=="function"&&H()&&window.addEventListener("unhandledrejection",k=>{k.preventDefault?.()},{capture:!0})}catch{}const t=localStorage.getItem("lang")||"en";r.i18n=await ue(t),r.lang=t,Re();let n;try{typeof H=="function"&&H()?(localStorage.setItem("welcomeSeen","1"),n=!1):n=e||localStorage.getItem("welcomeSeen")!=="1"}catch{n=e||localStorage.getItem("welcomeSeen")!=="1"}const o=document.getElementById("showWelcome");o&&o.addEventListener("click",()=>Bt());const s=document.getElementById("splashStart");s&&s.addEventListener("click",()=>{localStorage.setItem("welcomeSeen","1"),te()});const i=document.getElementById("splashDismiss");i&&i.addEventListener("click",()=>{localStorage.setItem("welcomeSeen","1"),te()}),n?Oe():r.redirectTo&&setTimeout(()=>De(r.redirectTo),80);const l=document.querySelector("header.topbar");l&&(l.style.zIndex="20");try{const k=document.querySelector("#sidebar .tabs"),E=k?Array.from(k.querySelectorAll('[role="tab"]')):[],S=Array.from(document.querySelectorAll("#sidebar .side-panel")),y=f=>{E.forEach(w=>w.setAttribute("aria-selected",String(w.dataset.tab===f))),S.forEach(w=>{w.hidden=w.getAttribute("data-panel")!==f})};E.forEach(f=>f.addEventListener("click",()=>y(f.dataset.tab))),E.length&&y(E.find(f=>f.getAttribute("aria-selected")==="true")?.dataset.tab||"carriers")}catch{}try{const k=(JSON.parse(localStorage.getItem("cst.settings")||"{}")||{}).theme;ne(k||(e?"light":"dark"))}catch{ne(e?"light":"dark")}document.getElementById("themeToggle")?.addEventListener("click",gt),document.getElementById("openSettingsTop")?.addEventListener("click",()=>F("settings")),document.getElementById("openCopilotBtn")?.addEventListener("click",()=>{document.getElementById("modal-copilot")&&oe()}),document.getElementById("langToggle").addEventListener("click",kt);const d=document.getElementById("helpMenuBtn"),a=document.getElementById("helpMenu"),p=document.getElementById("helpMenuWrap"),h=document.getElementById("helpWelcomeItem");if(d&&a){let k=!1;const E=S=>{k=S,a.style.display=S?"block":"none"};d.addEventListener("click",S=>{S.stopPropagation(),E(!k)}),document.addEventListener("click",S=>{k&&(p&&p.contains(S.target)||E(!1))})}h&&h.addEventListener("click",()=>{try{Pe(),Ne(),Me()}catch{}const k=document.getElementById("helpMenu");k&&(k.style.display="none")}),document.getElementById("setupWizard");const u=document.getElementById("openSettings");u&&u.addEventListener("click",()=>F("settings")),document.getElementById("wizardSave").addEventListener("click",Ct),r.settings=xt();const g=document.getElementById("testsModal"),v=document.getElementById("openTests");v&&v.addEventListener("click",()=>F("tests")),document.getElementById("testsClose").addEventListener("click",()=>g.close()),document.getElementById("testsFetchBtn").addEventListener("click",Lt),document.getElementById("t_run_doctor")?.addEventListener("click",Dt),document.getElementById("t_run_ui_audit")?.addEventListener("click",Rt),document.getElementById("t_run_splash_diag")?.addEventListener("click",Ot),$e();const c=document.getElementById("denialsModal"),m=document.getElementById("denialsClose");m&&m.addEventListener("click",()=>c?.close());const I=document.getElementById("carrierModal"),B=document.getElementById("carrierClose");B&&B.addEventListener("click",()=>I?.close());try{r.copilotSamples=await fetch("/copilot-prompts.json").then(k=>k.ok?k.json():[])}catch{r.copilotSamples=[]}ae(),Y(),ft(r.lang),Fe();const x=document.getElementById("dropzone");x.addEventListener("dragover",k=>{k.preventDefault(),x.classList.add("hover")}),x.addEventListener("dragleave",()=>x.classList.remove("hover")),x.addEventListener("drop",Tt),document.addEventListener("paste",At),window.addEventListener("securitypolicyviolation",k=>{const E=k.blockedURI||"";E.includes("vercel.live")||k.violatedDirective!=="style-src-attr"&&(r.cspViolations.push(`${k.violatedDirective} @ ${E||"inline"}`),$())}),$(),$t(),ge(),Ft(),qt();try{ht()}catch{}try{jt()}catch{}document.addEventListener("click",k=>{const E=k.target?.closest?.("[data-open]");if(!E)return;const S=E.getAttribute("data-open");if(!S)return;if(S==="tests")return F("tests");if(S==="tools:denials"){he();return}if(S==="settings")return F("settings");if(S==="tools:copilot"){if(document.getElementById("modal-copilot")){oe();return}const L=document.getElementById("copilotSection");L&&L.scrollIntoView({behavior:"smooth",block:"start"});return}if(S.startsWith("carrier:")){const w=S.split(":")[1];vt(w);return}const y={"tools:rpfr":"RPFR / PFR","tools:fmip":"FMIP Script","tools:denials":"Denials","tools:affidavits":"Affidavits","tools:byod":"BYOD Premium Check","tools:smartdrop":"SmartDrop (OCR)",smartdrop:"SmartDrop (OCR)"},f={"product:UBIF":"uBreakiFix","product:RSG":"Repair Service Group","product:HOMEPLUS":"Asurion Home+","product:APPLIANCEPLUS":"Asurion Appliance+","product:VZ_HDP":"Verizon Home Device Protect","product:ATT_HTP":"AT&T Home Tech Protection"};if(y[S]){S==="tools:smartdrop"||S==="smartdrop"?Ae():(N(`Tool open → ${y[S]} (TODO: modal/panel)`),C(y[S]));return}f[S]&&(N(`Product panel open → ${f[S]} (TODO)`),C(f[S]))})});function ht(){const e=document.getElementById("topSearch"),t=document.getElementById("searchInput"),n=document.getElementById("searchSuggest");if(!t||!n)return;try{if(localStorage.getItem("ui.search")==="0"){e&&(e.style.display="none");return}}catch{}const o=u=>r.i18n?.t?r.i18n.t(u):u,s=[{id:"qa:copilot",label:()=>o("QuickOpenCopilot"),run:()=>{document.getElementById("modal-copilot")?oe():document.getElementById("copilotSection")?.scrollIntoView({behavior:"smooth"})}},{id:"qa:denials",label:()=>o("QuickOpenDenials"),run:()=>he()},{id:"qa:smartdrop",label:()=>o("QuickOpenSmartDrop"),run:()=>Ae()},{id:"qa:policies",label:()=>o("QuickOpenPolicies"),run:()=>C("Policies hub coming soon")},{id:"qa:xr",label:()=>o("QuickOpenXR"),run:()=>C("XR Library coming soon")},{id:"qa:byod",label:()=>o("QuickOpenBYOD"),run:()=>C("BYOD Check coming soon")},{id:"qa:rpfr",label:()=>o("QuickOpenRPFR"),run:()=>{const u=document.querySelector('[data-open="bucket:rpfr"]');u?u.click():C("RPFR")}}];function i(u){const g=String(u||"").trim().toLowerCase(),v=[];return g?((g.includes("denial")||g.includes("no airtime")||g.includes("deneg"))&&v.push(s.find(c=>c.id==="qa:denials")),(g.includes("rpfr")||g.includes("reimburse"))&&v.push(s.find(c=>c.id==="qa:rpfr")),(g.includes("fmip")||g.includes("icloud")||g.includes("find my"))&&v.push({id:"qa:fmip",label:()=>"Open FMIP Script",run:()=>C("FMIP Script coming soon")}),(g.includes("scan")||g.includes("pdf")||g.includes("ocr"))&&v.push(s.find(c=>c.id==="qa:smartdrop")),v.find(c=>c?.id==="qa:copilot")||v.push(s.find(c=>c.id==="qa:copilot")),v.filter(Boolean).slice(0,4)):v}let l=[],d=-1;function a(u){n.innerHTML="";const g=!!String(u||"").trim(),v=m=>{const I=document.createElement("div");I.className="suggest-label",I.textContent=m,n.appendChild(I)},c=m=>{const I=document.createElement("div");return I.className="suggest-option",I.setAttribute("role","option"),I.dataset.id=m.id,I.textContent=typeof m.label=="function"?m.label():m.label,n.appendChild(I),I};g?(v(o("NextSuggestions")),i(u).forEach(m=>c(m))):(v(o("QuickActions")),s.forEach(m=>c(m))),l=Array.from(n.querySelectorAll('[role="option"]')),d=l.length?0:-1,p(),n.style.display=l.length?"block":"none",t.setAttribute("aria-expanded",l.length?"true":"false")}function p(){l.forEach((u,g)=>u.classList.toggle("active",g===d))}function h(){const u=l[d];if(!u)return;const g=u.dataset.id,v=[...s,...i(t.value)].find(c=>c?.id===g);if(v&&typeof v.run=="function")try{v.run()}catch{}n.style.display="none",t.setAttribute("aria-expanded","false")}t.addEventListener("input",()=>a(t.value)),t.addEventListener("focus",()=>a(t.value)),t.addEventListener("blur",()=>setTimeout(()=>{n.style.display="none",t.setAttribute("aria-expanded","false")},120)),t.addEventListener("keydown",u=>{u.key==="ArrowDown"?(u.preventDefault(),l.length&&(d=(d+1)%l.length,p())):u.key==="ArrowUp"?(u.preventDefault(),l.length&&(d=(d-1+l.length)%l.length,p())):u.key==="Enter"?d>-1&&(u.preventDefault(),h()):u.key==="Escape"&&(n.style.display="none",t.setAttribute("aria-expanded","false"))}),n.addEventListener("mousedown",u=>{const g=u.target?.closest?.('[role="option"]');if(!g)return;const v=l.indexOf(g);v>-1&&(d=v,p(),h())})}function F(e){const t=e==="settings"?"setupWizard":e==="tests"?"testsModal":e,n=document.getElementById(t);n&&(typeof n.showModal=="function"?n.showModal():n.scrollIntoView({behavior:"smooth",block:"start"}))}function C(e){try{console.log("[Toast]",e)}catch{}}function gt(){try{const e=document.documentElement,o=(["theme-dark","theme-light","theme-glass","theme-macos"].find(l=>e.classList.contains(l))||"theme-dark").replace("theme-",""),s=["dark","light","glass","macos"],i=s[(s.indexOf(o)+1)%s.length];ne(i);try{const l=JSON.parse(localStorage.getItem("cst.settings")||"{}")||{};l.theme=i,localStorage.setItem("cst.settings",JSON.stringify(l))}catch{}C("Theme: "+i)}catch{}}function N(e){try{console.debug("[QA]",e)}catch{}}function Ae(){const e=document.getElementById("modal-smartdrop");if(!e)return C("SmartDrop not available");e.hidden=!1;const t=e.querySelector("[data-close]");t&&(t.onclick=()=>e.hidden=!0);const n=document.getElementById("sd_drop"),o=document.getElementById("sd_file"),s=document.getElementById("sd_preview"),i=document.getElementById("sd_status"),l=document.getElementById("sd_suggest"),d=document.getElementById("sd_suggest_label"),a=document.getElementById("sd_learn"),p=document.getElementById("sd_route_denials"),h=document.getElementById("sd_route_rpfr"),u=document.getElementById("sd_route_fmip");function g(y){i&&(i.textContent=y||"")}function v(y){const f=new Set("a,an,the,of,to,in,for,on,and,or,if,then,with,by,be,is,are,was,were,as,at,from,that,this,it,its,into,you,your,de,la,el,los,las,un,una,para,por,con,en,es,son,era,eran,como,que,esto,este,su".split(","));return(y||"").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter(w=>w.length>2&&!f.has(w)).slice(0,400)}function c(y,f){try{return JSON.parse(localStorage.getItem(y)||"")||f}catch{return f}}function m(y,f){localStorage.setItem(y,JSON.stringify(f))}function I(y,f,w={}){const T={denials:"cst_bucket_denials",rpfr:"cst_bucket_rpfr",fmip:"cst_bucket_fmip"}[y],D="cst_bucket:"+y;if(!y)return;const A={ts:Date.now(),text:String(f||"").slice(0,2e4),meta:w};if(T){const q=c(T,[]);q.unshift(A),m(T,q.slice(0,200))}const G=c(D,[]);G.unshift(A),m(D,G.slice(0,200))}function B(y,f){const w="cst_route_rules_v1",L=c(w,{});for(const T of v(f))L[T]??={denials:0,rpfr:0,fmip:0},L[T][y]+=1;m(w,L)}function x(y){const w=c("cst_route_rules_v1",{}),L={denials:0,rpfr:0,fmip:0};for(const D of v(y)){const A=w[D];A&&(L.denials+=A.denials,L.rpfr+=A.rpfr,L.fmip+=A.fmip)}const T=Object.entries(L).sort((D,A)=>A[1]-D[1])[0];return{score:L,best:T&&T[1]>0?T[0]:null}}function k(y){const f=x(y||"");if(f.best){l.style.display="";const w=f.best==="rpfr"?"RPFR":f.best==="fmip"?"FMIP":"Denials";d.textContent=`${w} (learned)`}else l.style.display="none",d.textContent=""}["dragenter","dragover"].forEach(y=>n.addEventListener(y,f=>{f.preventDefault(),f.stopPropagation(),n.style.background="#141422"})),["dragleave","drop"].forEach(y=>n.addEventListener(y,f=>{f.preventDefault(),f.stopPropagation(),n.style.background=""})),n.addEventListener("drop",async y=>{const f=y.dataTransfer?.files?.[0];f&&await E(f)}),o.addEventListener("change",async y=>{const f=y.target.files?.[0];f&&(await E(f),o.value="")});async function E(y){g(`Processing "${y.name}"…`),C("Analyzing file…");try{const f=(y.name.split(".").pop()||"").toLowerCase();let w="";if(/(png|jpg|jpeg|bmp|gif|webp|tif|tiff|pdf|heic)$/.test(f))w=await _t(y);else if(/(txt|csv|log|md|json)$/.test(f))w=await y.text();else try{w=await y.text()}catch{w=`[${f.toUpperCase()} unsupported for OCR preview]`}s.value=String(w||"").trim();const L=(s.value.slice(0,240)||"(no text)").replace(/\s+/g," ");N(`SmartDrop: ${y.name}
→ ${L}${s.value.length>240?"…":""}`),k(s.value),g("Ready to route. Tip: edit the text before routing if needed.")}catch(f){g("Error reading file."),C("SmartDrop failed"),N("SmartDrop error: "+(f?.message||f))}}function S(y){const f=s.value.trim();if(!f){C("Nothing to route");return}I(y,f,{from:"smartdrop"}),a?.checked&&B(y,f),C(`Routed to ${y.toUpperCase()}`),g(`Routed to ${y.toUpperCase()} at ${new Date().toLocaleTimeString()}`)}p.addEventListener("click",()=>S("denials")),h.addEventListener("click",()=>S("rpfr")),u.addEventListener("click",()=>S("fmip"))}const yt={DEVICE_INELIGIBLE:{en:{reason:"This device isn’t eligible under the plan.",rebuttal:"We can review alternate coverage options or repair pathways that might fit your device."},es:{reason:"Este equipo no es elegible bajo el plan.",rebuttal:"Podemos revisar opciones alternativas de cobertura o reparación que podrían ajustarse a su equipo."}}};function he(){const e=document.getElementById("denialsModal"),t=document.getElementById("denialsContent");!e||!t||(t.innerHTML=bt(yt,r.lang||"en"),e.showModal())}function bt(e,t){const n=Object.entries(e||{});return n.length?`<section>${n.map(([s,i])=>{const l=i.en||{},d=i[t]||i.en||{};return`
        <article class="card">
          <h3><code>${M(s)}</code></h3>
          <div class="cols">
            <div>
              <h4>EN</h4>
              <p><strong>Reason:</strong> ${M(l.reason||"")}</p>
              <p><strong>Rebuttal:</strong> ${M(l.rebuttal||"")}</p>
            </div>
            <div>
              <h4>${t.toUpperCase()}</h4>
              <p><strong>Reason:</strong> ${M(d.reason||"")}</p>
              <p><strong>Rebuttal:</strong> ${M(d.rebuttal||"")}</p>
            </div>
          </div>
        </article>
      `}).join("")}</section>`:'<p class="muted">No denials defined yet.</p>'}async function vt(e){N(`Carrier hub open → ${e}`);const t=document.getElementById("carrierModal"),n=document.getElementById("carrierContent");if(!(!t||!n)){n.textContent="Loading…";try{const o=await fetch(`/carriers/${e}.json`,{cache:"no-store"}).then(s=>s.ok?s.json():Promise.reject(new Error("Not found")));n.innerHTML=Et(o)}catch{n.textContent=`Failed to load carrier ${e}`}t.showModal()}}function Et(e){const t=a=>M(String(a||"")),n=(a,p)=>Array.isArray(a)&&a.length?`<ul>${a.map(p).join("")}</ul>`:'<p class="muted">None</p>',o=n(e.tcs,a=>`<li><a href="${t(a.url)}" target="_blank" rel="noreferrer noopener">${t(a.label)}</a></li>`),s=n(e.common_denials,a=>`<li><code>${t(a.key)}</code> — ${t(a.label)}</li>`),i=n(e.fmip?.steps_en,a=>`<li>${t(a)}</li>`),l=n(e.fmip?.steps_es,a=>`<li>${t(a)}</li>`),d=n(e.support_links,a=>`<li><a href="${t(a.url)}" target="_blank" rel="noreferrer noopener">${t(a.label)}</a></li>`);return`
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
      <p>${t(e.rpfr?.eligibility_hint||"")}</p>
      ${e.rpfr?.note_template_en?`<pre class="preview">${t(e.rpfr.note_template_en)}</pre>`:""}
    </section>
    <section>
      <h3>FMIP</h3>
      <div class="cols">
        <div><h4>EN</h4>${i}</div>
        <div><h4>ES</h4>${l}</div>
      </div>
    </section>
    <section>
      <h3>Support</h3>
      ${d}
    </section>
  `}function St(){try{const n=new URLSearchParams(location.search).get("next");if(n)return n}catch{}return localStorage.getItem("redirectAfterSplash")||null}function De(e){try{if(typeof H=="function"&&H()||!e||typeof e!="string"||e===location.href||e===location.pathname)return;location.href=e}catch{}}async function kt(){const t=(localStorage.getItem("lang")||"en")==="en"?"es":"en";localStorage.setItem("lang",t),r.i18n=await ue(t),r.lang=t,Re(),Y(),$(),ge()}function Re(){document.querySelectorAll("[data-i18n]").forEach(t=>t.textContent=r.i18n.t(t.dataset.i18n));const e=document.querySelector("title[data-i18n]");e&&(e.textContent=r.i18n.t(e.dataset.i18n)),document.querySelectorAll("[data-i18n-placeholder]").forEach(t=>t.placeholder=r.i18n.t(t.dataset.i18nPlaceholder))}function ve(e){const t=document.getElementById("splashStep");t&&(t.textContent=r.i18n?r.i18n.t(e):e)}function Oe(){const e=document.getElementById("splash");if(!e)return;e.hidden=!1,e.classList.add("show");try{const d=document.getElementById("splashTitle");if(d&&!document.getElementById("splashTagline")){const a=document.createElement("p");a.id="splashTagline",a.className="muted",a.style.marginTop="4px",a.style.fontSize="14px",a.textContent=r.i18n?r.i18n.t("SplashTagline"):"White-glove support. Faster workflows. Gold-standard results.",d.insertAdjacentElement("afterend",a)}else if(d){const a=document.getElementById("splashTagline");a&&(a.textContent=r.i18n?r.i18n.t("SplashTagline"):a.textContent)}}catch{}const t=document.getElementById("splashBar");t&&(t.classList.remove("run"),requestAnimationFrame(()=>t.classList.add("run")));const n=document.getElementById("splash"),o=n?.querySelector(".banner-inner");o&&(o.setAttribute("tabindex","-1"),o.focus()),ee=d=>{if(d.key==="Escape"&&localStorage.getItem("welcomeSeen")==="1"&&te(),d.key!=="Tab")return;const p=[...n.querySelectorAll("a[href],button,textarea,input,select,[tabindex]:not([tabindex='-1'])")].filter(g=>!g.disabled);if(!p.length)return;const h=p[0],u=p[p.length-1];d.shiftKey&&document.activeElement===h&&(u.focus(),d.preventDefault()),!d.shiftKey&&document.activeElement===u&&(h.focus(),d.preventDefault())},n.addEventListener("keydown",ee),U=0,re(),clearInterval(V),V=setInterval(()=>{U=Math.min(U+7,97),re(),U>=97&&clearInterval(V)},180);const s=document.getElementById("splashRetry");s&&(s.onclick=()=>{clearInterval(V),Oe()});const i=["LoadingUI","LoadingTranslations","CheckingCore","StartingApp"];let l=0;ve(i[l]),clearInterval(ce),ce=setInterval(()=>{l=Math.min(l+1,i.length-1),ve(i[l])},700),j=!1,K=!1,It()}function re(){const e=document.getElementById("splashPct");e&&(e.textContent=`${U}%`)}function te(){const e=document.getElementById("splash");e&&(e.classList.remove("show"),e.hidden=!0,clearInterval(ce),clearInterval(V),e.removeEventListener("keydown",ee),ee=null)}function It(){const e=document.getElementById("splashBar"),t=setTimeout(()=>{(!j||!K)&&(j=!0,K=!0,Q())},3e3);if(e){const n=()=>{j=!0,Q(),clearTimeout(t)};e.addEventListener("animationend",n,{once:!0}),setTimeout(n,2600)}else j=!0;Promise.allSettled([fetch("/i18n/en.json",{cache:"no-store"}),fetch("/i18n/es.json",{cache:"no-store"}),fetch("/assets/logo.svg",{cache:"no-store"})]).then(()=>{K=!0,Q(),clearTimeout(t)})}function Q(){if(j&&K){if(U=100,re(),te(),localStorage.getItem("onboarded")==="1")r.redirectTo&&setTimeout(()=>De(r.redirectTo),60);else{const t=document.getElementById("setupWizard");t&&typeof t.showModal=="function"&&setTimeout(()=>t.showModal(),80)}setTimeout(()=>{const t=document.getElementById("copilotRun");if(t)try{const n=t.getBoundingClientRect(),o=document.elementFromPoint(n.left+2,n.top+2);o===t||t.contains(o)}catch{}},100)}}function Ct(){const e={name:J("#wName"),coach:J("#wCoach"),empId:J("#wEmpId"),ext:J("#wExt"),theme:J("#wTheme"),expertType:document.getElementById("wExpertType")?.value||"english"};if(!e.name||!e.empId||!e.ext)return;wt(e),localStorage.setItem("splashSeen","1"),document.getElementById("dontShow").checked&&localStorage.setItem("onboarded","1");const t=e.expertType==="bilingual";if(localStorage.setItem("cst_bilingual",t?"1":"0"),localStorage.getItem("cst_output_mode")||localStorage.setItem("cst_output_mode",t?"both":"en"),document.getElementById("setupWizard").close(),$(),localStorage.getItem("welcomeShown")!=="1")try{Pe(),Ne(),Me()}catch{}}function J(e){return document.querySelector(e).value?.trim()}function wt(e){localStorage.setItem("cst.settings",JSON.stringify(e)),r.settings=e,e.theme&&ne(e.theme)}function xt(){try{return JSON.parse(localStorage.getItem("cst.settings")||"{}")}catch{return{}}}function ne(e){const t=document.documentElement;t.classList.remove("theme-light","theme-dark","theme-glass","theme-macos"),e==="glass"?t.classList.add("theme-glass"):e==="light"?t.classList.add("theme-light"):e==="macos"?t.classList.add("theme-macos"):t.classList.add("theme-dark")}function Bt(){try{localStorage.removeItem("welcomeSeen");const e=document.getElementById("splash");if(!e)return;e.hidden=!1,e.classList.add("show"),setTimeout(()=>e.classList.remove("show"),1200)}catch{}}function Pe(){if(document.getElementById("modal-welcome"))return;const e=document.createElement("div");e.className="modal-backdrop",e.id="modal-welcome",e.setAttribute("data-testid","welcome-modal"),e.hidden=!0,e.innerHTML=`
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
    </div>`,document.body.appendChild(e),e.addEventListener("click",t=>{t.target===e&&le()}),e.querySelector("[data-close]")?.addEventListener("click",()=>le()),document.getElementById("welOpenCopilot")?.addEventListener("click",()=>{le();try{if(document.getElementById("modal-copilot"))oe();else{if(!document.getElementById("copilotSection"))try{ae(),Y()}catch{}document.getElementById("copilotSection")?.scrollIntoView({behavior:"smooth",block:"start"})}}catch{}})}function Ne(){const e=p=>r.i18n?r.i18n.t(p):p,t=document.getElementById("welTitle"),n=document.getElementById("welBlocks"),o=document.getElementById("welOpenCopilot"),s=document.getElementById("welDontShowLabel");if(!n||!o)return;t&&(t.textContent=e("WelcomeHeadline")),o.textContent=e("CTAOpenCopilot"),s&&(s.textContent=e("Do Not Show Again"));const i=W(),l=i==="en"||i==="both",d=i==="es"||i==="both",a=p=>{const h=document.createElement("section");h.className="wel-block";const u=document.createElement("h4");u.className="muted",u.style.margin="0",u.style.fontWeight="600",u.textContent=p==="es"?"Español":"English";const g=document.createElement("p");g.style.margin="6px 0 0 0",g.textContent=e("WelcomeSubheadline");const v=document.createElement("p");return v.className="muted",v.style.margin="6px 0 0 0",v.textContent=e("WelcomeBody"),h.appendChild(u),h.appendChild(g),h.appendChild(v),h};n.innerHTML="",l&&n.appendChild(a("en")),d&&n.appendChild(a("es"))}function Me(){const e=document.getElementById("modal-welcome");if(!e)return;const t=document.getElementById("welDontShow");t&&(t.checked=!1),e.hidden=!1}function le(e){const t=document.getElementById("modal-welcome");t&&(t.hidden=!0,document.getElementById("welDontShow")?.checked&&localStorage.setItem("welcomeShown","1"))}function oe(){const e=document.getElementById("modal-copilot");if(!e)return;e.hidden=!1;const t=e.querySelector("[data-close]");t&&(t.onclick=()=>e.hidden=!0);const n=document.getElementById("cp_quick_rpfr"),o=document.getElementById("cp_quick_fmip"),s=document.getElementById("cp_in");n&&(n.onclick=()=>s.value="RPFR: customer purchased accessory at retail; requesting reimbursement."),o&&(o.onclick=()=>s.value="FMIP override: customer forgot Apple ID; need safe coaching and Alpha note.");const i=document.getElementById("cp_run");i&&(i.onclick=async()=>{try{ae(),Y()}catch{}const a=document.getElementById("copilotInput");a&&(a.value=s.value);const p=document.getElementById("copilotRun");p&&p.click(),setTimeout(()=>{const h=document.getElementById("copilotEn")?.textContent||"",u=document.getElementById("copilotEs")?.textContent||"",g=document.getElementById("cp_out");g&&(g.value=[h,u&&`

— ES —
`+u].filter(Boolean).join(`
`))},400)});const l=document.getElementById("cp_copy");l&&(l.onclick=()=>{const a=document.getElementById("copilotEn")?.textContent||"",p=document.getElementById("copilotEs")?.textContent||"",h=W(),u=h==="en"?a:h==="es"||r.lang==="es"?p:a;navigator.clipboard.writeText(u).then(()=>C("Copied"))});const d=document.getElementById("cp_copy_all");d&&(d.style.display="none"),_e()}function _e(){const e=document.getElementById("cp_copy");if(!e)return;const t=o=>r.i18n?r.i18n.t(o):o,n=W();n==="en"?e.textContent=t("Copy EN"):n==="es"?e.textContent=t("Copy ES"):e.textContent=r.lang==="es"?t("Copy ES"):t("Copy EN")}async function Lt(){const e=document.getElementById("testsOutput");e.textContent="Running /api/fetch…";try{const t=await fetch("/api/fetch"),n=await t.json();r.lastFetchRun={ok:t.ok,at:new Date().toISOString()},e.textContent=JSON.stringify(n,null,2)}catch(t){e.textContent="Fetch error: "+t.message,r.lastFetchRun={ok:!1,at:new Date().toISOString(),err:t.message}}$()}async function Tt(e){e.preventDefault(),e.currentTarget.classList.remove("hover");const t=e.dataTransfer.files?.[0];if(t)if(t.type==="text/plain"){const n=await t.text();Z(parseText(n))}else t.type==="application/pdf"||t.name.endsWith(".pdf")?Z({error:"PDF parsing stub — add pdf.js (self-hosted) later."}):Z({error:`Unsupported type: ${t.type||t.name}`})}function At(e){const t=e.clipboardData?.getData("text");t&&t.length>5&&Z(parseText(t))}function Z(e){document.getElementById("preview").textContent=JSON.stringify(e,null,2)}async function $e(){const e=document.getElementById("ocrBadge");if(!e)return;try{const o=await fetch("/api/doctor?check=ocr");if(o.ok){const s=await o.json();s.ok&&s.ocr?.ready?(e.textContent="OCR: Ready ✅",e.style.borderColor="#16a34a"):(e.textContent="OCR: Offline ⚠️",e.style.borderColor="#ffb020",s.ocr?.missing?.length&&(e.title="Missing: "+s.ocr.missing.join(", ")));return}}catch{}const t=["/libs/tesseract/tesseract.min.js","/libs/tesseract/worker.min.js","/libs/tesseract/tesseract-core.wasm"],n=[];await Promise.all(t.map(async o=>{try{(await fetch(o,{method:"HEAD",cache:"no-store"})).ok||n.push(o)}catch{n.push(o)}})),n.length===0?(e.textContent="OCR: Ready ✅",e.style.borderColor="#16a34a"):(e.textContent="OCR: Offline ⚠️",e.style.borderColor="#ffb020",e.title="Missing: "+n.join(", "))}async function Dt(){const e=document.getElementById("testLog")||document.getElementById("testsOutput"),t=document.getElementById("t_run_doctor"),n=new Date().toISOString();if(t){if(t.disabled){console.log(`[${n}] Doctor test already running, ignoring request`);return}t.disabled=!0,t.textContent="Running..."}console.log(`[${n}] Doctor test started`),e&&(e.textContent=`Doctor: running… [${n}]`);try{console.log(`[${n}] Fetching /api/doctor`);const o=await fetch("/api/doctor",{method:"GET",cache:"no-store",headers:{"X-Request-ID":`doctor-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}});console.log(`[${n}] Doctor response status:`,o.status);const s=await o.json();console.log(`[${n}] Doctor response:`,s),e&&(e.textContent=JSON.stringify(s,null,2)),$e(),C(s.ok?"Doctor passed":"Doctor found issues")}catch(o){console.error(`[${n}] Doctor error:`,o),e&&(e.textContent="Doctor error: "+(o?.message||o)),C("Doctor error")}finally{t&&(t.disabled=!1,t.textContent="Doctor")}}function Rt(){const e=document.getElementById("testLog")||document.getElementById("testsOutput");e&&(e.textContent="UI Text Audit: scanning…");try{const t=a=>{if(!a)return!1;const p=getComputedStyle(a);return p&&p.display!=="none"&&p.visibility!=="hidden"&&a.offsetParent!==null},n=[],o=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);let s;for(;s=o.nextNode();){const a=(s.nodeValue||"").replace(/\s+/g," ").trim();if(!a)continue;const p=s.parentElement;if(!p||!t(p))continue;const h=p.tagName;h==="SCRIPT"||h==="STYLE"||h==="CODE"||h==="PRE"||n.push(a)}const i=[],l=/([A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\-']*)(?:\s+\1){2,}/i;n.forEach((a,p)=>{l.test(a)&&i.push({i:p,type:"repeat-token",line:a}),p>0&&n[p-1]===a&&i.push({i:p,type:"repeat-line",line:a})});const d={totalLines:n.length,issues:i.slice(0,50),hint:"Look for repeat-token or repeat-line entries."};e&&(e.textContent=JSON.stringify(d,null,2))}catch(t){e&&(e.textContent="UI Text Audit error: "+(t?.message||t))}}function Ot(){const e=document.getElementById("testLog")||document.getElementById("testsOutput");e&&(e.textContent="Splash diagnostics: collecting…");try{const t=document.getElementById("splash"),n=document.getElementById("splashStep")?.textContent||"",o=document.getElementById("splashPct")?.textContent||"",s=t?.classList.contains("show"),i=!!t?.hidden,l=localStorage.getItem("welcomeSeen")||"0",d=localStorage.getItem("onboarded")||"0",a={showClass:s,hidden:i,step:n,pct:o,welcomeSeen:l,onboarded:d};e&&(e.textContent=JSON.stringify(a,null,2))}catch(t){e&&(e.textContent="Splash diagnostics error: "+(t?.message||t))}}function ae(){if(document.getElementById("copilotSection"))return;let e=document.querySelector(".content");e||(e=document.createElement("div"),e.className="content",document.body.appendChild(e));const t=document.createElement("section");t.id="copilotSection",t.setAttribute("data-testid","copilot-section"),t.innerHTML=`
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
  `;const n=document.getElementById("systemStatus");n&&n.parentNode===e?e.insertBefore(t,n):e.appendChild(t),document.getElementById("copilotRun").addEventListener("click",Pt),document.getElementById("copilotCopyEn").addEventListener("click",()=>Ee("copilotEn")),document.getElementById("copilotCopyEs").addEventListener("click",()=>Ee("copilotEs"))}function Y(){if(!document.getElementById("copilotSection"))return;const e=s=>r.i18n.t(s);document.getElementById("copilotTitle").textContent=e("Copilot");const t=document.getElementById("copilotOutputLabel");t&&(t.textContent=e("Output"));const n=document.getElementById("copilotEngine");if(n){let s=!0;try{localStorage.getItem("freeLock")==="0"&&(s=!1)}catch{}s?(n.textContent=e("EngineOfflineLocked"),n.title=e("LockedOfflineEngine"),n.setAttribute("aria-disabled","true"),n.hidden=!1):n.hidden=!0}document.getElementById("copilotSampleLabel").textContent=e("Sample prompt"),document.getElementById("copilotInputLabel").textContent=e("Additional instructions"),document.getElementById("copilotRun").textContent=e("Generate"),document.getElementById("copilotEnLabel").textContent=e("English"),document.getElementById("copilotEsLabel").textContent=e("Spanish"),document.getElementById("copilotCopyEn").textContent=e("Copy EN"),document.getElementById("copilotCopyEs").textContent=e("Copy ES");const o=document.getElementById("copilotSample");o.innerHTML="",Array.isArray(r.copilotSamples)&&r.copilotSamples.forEach(s=>{const i=document.createElement("option");i.value=s.id,i.textContent=s.label&&(s.label[r.lang]||s.label.en)||s.id,s.prompt&&i.setAttribute("data-prompt",s.prompt),o.appendChild(i)});try{const s=document.getElementById("copilotMode");s&&!s.dataset.wired?(s.dataset.wired="1",s.options&&s.options.length>=3&&(s.options[0].textContent=e("English"),s.options[1].textContent=e("Spanish"),s.options[2].textContent=e("Bilingual")),s.value=W(),s.addEventListener("change",()=>{Nt(s.value),X();try{_e()}catch{}}),X()):s&&(s.options&&s.options.length>=3&&(s.options[0].textContent=e("English"),s.options[1].textContent=e("Spanish"),s.options[2].textContent=e("Bilingual")),s.value=W(),X())}catch{}}async function Pt(){const e=document.getElementById("copilotSample"),t=r.copilotSamples.find(a=>a.id===e.value),n=document.getElementById("copilotInput").value;let o=null;try{const a=document.getElementById("preview").textContent;a&&(o=JSON.parse(a))}catch{}const s=je(t?.prompt||e.selectedOptions[0]?.getAttribute("data-prompt")||"",n,o),i=document.getElementById("copilotEn"),l=document.getElementById("copilotEs"),d=document.getElementById("copilotMsg");i.textContent=l.textContent="",d.textContent=r.i18n.t("Loading..."),d.hidden=!1;try{if(r.engine==="local-llm"){const a=await mt(s);i.textContent=a,l.textContent=a,d.hidden=!0}else{const a=await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:s})}),p=await a.json();if(!a.ok)throw new Error(String(a.status||"Copilot error"));i.textContent=p.en||"",l.textContent=p.es||"",d.hidden=!0}}catch{if(r.engine==="templates"){const a="Draft: "+(n||"").trim()+`

(Select a specific denial or switch engine to Local LLM beta.)`;i.textContent=a,l.textContent=a,d.hidden=!0}else d.textContent=r.i18n.t("Set OPENAI_API_KEY in Vercel to enable Copilot.")}await Fe(),X()}function W(){const e=localStorage.getItem("cst_output_mode");return e==="en"||e==="es"||e==="both"?e:localStorage.getItem("cst_bilingual")==="1"?"both":"en"}function Nt(e){const t=e==="es"?"es":e==="both"?"both":"en";localStorage.setItem("cst_output_mode",t)}function X(){const e=W(),t=document.getElementById("copilotEn")?.parentElement,n=document.getElementById("copilotEs")?.parentElement;!t||!n||(e==="en"?(t.style.display="",n.style.display="none"):e==="es"?(t.style.display="none",n.style.display=""):(t.style.display="",n.style.display=""))}async function Ee(e){try{let t=null;e&&e.startsWith&&e.startsWith("#")?t=document.querySelector(e):t=document.getElementById(e);const n=t&&(t.value||t.textContent)||"";await navigator.clipboard.writeText(n),C("Copied")}catch{C("Copy failed")}}async function Fe(){try{await(await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:"ping"})})).json(),r.copilotReachable=!0}catch{r.copilotReachable=!1}$()}let Se=!1,qe=null;async function Mt(){if(Se)return!0;try{return await new Promise((e,t)=>{const n=document.createElement("script");n.src="/libs/tesseract/tesseract.min.js",n.onload=e,n.onerror=()=>t(new Error("Failed to load OCR lib")),document.head.appendChild(n)}),window.Tesseract?(qe=window.Tesseract,Se=!0,!0):!1}catch{return!1}}async function _t(e){if(!await Mt())throw new Error("OCR not available");const n=await qe.createWorker({workerPath:"/libs/tesseract/worker.min.js",langPath:"/libs/tesseract/",corePath:"/libs/tesseract/tesseract-core.wasm"});await n.loadLanguage("eng"),await n.initialize("eng");const{data:o}=await n.recognize(e);return await n.terminate(),o?.text||""}async function $t(){const e=!!document.querySelector('script[type="module"][src*="/assets/index-"]'),t=["/assets/logo.svg","/api/fetch"],n=await Promise.all(t.map(async o=>{try{const s=await fetch(o,{method:"GET"});return[o,s.ok]}catch{return[o,!1]}}));r.urlTest=Object.fromEntries([...n,["mainScript",e]]),$()}function $(){const e=[],n=["setupWizard","wizardForm","openTests","testsFetchBtn"].filter(i=>!document.getElementById(i));e.push(_("Required UI elements",n.length?`Missing: ${n.join(", ")}`:"OK",!n.length)),e.push(_("CSP violations",r.cspViolations.length?r.cspViolations.join(" • "):"None",r.cspViolations.length===0));const o=r.urlTest||{},s=o.mainScript===!0&&["/assets/logo.svg","/api/fetch"].every(i=>o[i]);e.push(_("Core assets test",JSON.stringify(o),s)),e.push(_("i18n",`lang=${localStorage.getItem("lang")||"en"}`,!!r.i18n)),e.push(_("T&C fetch",r.lastFetchRun?JSON.stringify(r.lastFetchRun):"Not yet",!!r.lastFetchRun?.ok)),e.push(_("Setup",r.settings&&r.settings.name?"Saved":"Not set",!!(r.settings&&r.settings.name))),r.copilotReachable!==null&&e.push(_(r.i18n.t("Copilot reachable"),r.copilotReachable?"OK":"Fail",r.copilotReachable)),Array.isArray(r.jsErrors)&&r.jsErrors.length&&e.push(_("Errors",r.jsErrors.join(" | "),!1)),document.getElementById("statusList").innerHTML=e.map(i=>`<li class="${i.ok?"ok":"fail"}"><strong>${i.label}:</strong> ${M(i.msg)}</li>`).join("")}function _(e,t,n){return{label:e,msg:t,ok:n}}function M(e){return String(e).replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}window.addEventListener("load",()=>{localStorage.getItem("welcomeSeen")!=="1"&&setTimeout(Q,400)});async function ge(){const e=document.getElementById("highlightsList");if(e)try{const t=await fetch("/highlights.json",{cache:"no-store"}).then(n=>n.ok?n.json():[]);e.innerHTML="",t.forEach(n=>{const o=document.createElement("article");o.className="card";const s=n.title?.[r.lang]||n.title?.en||"",i=n.body?.[r.lang]||n.body?.en||"";o.innerHTML=`<h3>${M(s)}</h3><p>${M(i)}</p>`,e.appendChild(o)})}catch{}}document.addEventListener("DOMContentLoaded",ge);function Ft(){const e=[];["virgin.svg","consumer-cellular.svg","uscellular.svg","optimum.svg","cox.svg","telus.svg","koodo.svg","bell.svg","samsung.svg","ubreakifix.svg","rsg.svg","homeplus.svg","applianceplus.svg","vz-hdp.svg","att-htp.svg"].forEach(t=>{fetch("/assets/"+t,{method:"HEAD"}).then(n=>{n.ok||(e.push("/assets/"+t),N("Missing asset: /assets/"+t))}).catch(()=>{e.push("/assets/"+t),N("Missing asset: /assets/"+t)})}),["SAMSUNG.json","VIRGIN.json"].forEach(t=>{fetch("/carriers/"+t,{method:"HEAD"}).then(n=>{n.ok||(e.push("/carriers/"+t),N("Missing carrier json: /carriers/"+t))}).catch(()=>{e.push("/carriers/"+t),N("Missing carrier json: /carriers/"+t)})}),setTimeout(()=>{e.length&&N("QA misses: "+e.join(", "))},600)}(function(){const t=(c,m=document)=>m.querySelector(c),n=(c,m=document)=>Array.from(m.querySelectorAll(c)),o=t("#sidebar");if(o&&!t("#bucketSection")){const c=document.createElement("div");c.className="side-title",c.textContent="Routed Buckets",c.id="bucketSection";const m=document.createElement("ul");m.className="nav",m.innerHTML=`
  <li data-open="tools:copilot">🤖 Copilot</li>
      <li data-open="bucket:denials">🚨 Denials</li>
      <li data-open="bucket:rpfr">💳 RPFR</li>
      <li data-open="bucket:fmip">📱 FMIP</li>
    `,o.appendChild(c),o.appendChild(m),m.querySelectorAll("[data-open]").forEach(I=>{I.addEventListener("click",()=>{const B=I.getAttribute("data-open");if(B?.startsWith("bucket:")){const x=B.split(":")[1];g(x)}})})}if(!t("#modal-bucket")){const c=document.createElement("div");c.className="modal-backdrop",c.id="modal-bucket",c.innerHTML=`
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
    `,document.body.appendChild(c),c.addEventListener("click",m=>{m.target===c&&v(c)}),c.querySelector("[data-close]")?.addEventListener("click",()=>v(c))}const s={denials:"Denials",rpfr:"RPFR",fmip:"FMIP"};function i(c){try{return JSON.parse(localStorage.getItem("cst_bucket:"+c)||"[]")}catch{return[]}}function l(c,m){localStorage.setItem("cst_bucket:"+c,JSON.stringify(m||[]))}function d(c){try{return new Date(c).toLocaleString()}catch{return""+c}}function a(c){const m=Number(c)||0;if(m<1024)return m+" B";const I=["KB","MB","GB"];let B=-1,x=m;do x/=1024,B++;while(x>=1024&&B<I.length-1);return x.toFixed(x<10?2:1)+" "+I[B]}async function p(c){try{await navigator.clipboard.writeText(c||""),C?.("Copied")}catch{C?.("Copy failed")}}function h(c,m){const I=new Blob([JSON.stringify(m,null,2)],{type:"application/json"}),B=URL.createObjectURL(I),x=document.createElement("a");x.href=B,x.download=c,document.body.appendChild(x),x.click(),setTimeout(()=>{URL.revokeObjectURL(B),x.remove()},0)}function u(c){const m=i(c),I=t("#modal-bucket"),B=t("#bucketList"),x=t("#bucketEmpty"),k=t("#bucketMeta");if(!(!I||!B||!x||!k)){if(t("#bucketTitle").textContent=`${s[c]||c} Bucket`,k.textContent=`${m.length} item(s) · key: cst_bucket:${c}`,B.innerHTML="",!m.length){x.style.display="block",B.style.display="none";return}x.style.display="none",B.style.display="grid",m.slice().sort((E,S)=>(S?.ts||0)-(E?.ts||0)).forEach((E,S)=>{const y=E?.name||E?.fileName||`Item ${S+1}`,f=d(E?.ts||Date.now()),w=E?.type||E?.mime||"text/plain",L=a(E?.size||(E?.text?E.text.length:0)),T=(E?.text||E?.content||"").toString(),D=document.createElement("article");D.className="tile",D.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${y}</div>
          <div class="muted" style="font-size:12px">${f}</div>
        </div>
        <div class="muted" style="font-size:12px;margin:6px 0">${w} · ${L}</div>
        <textarea readonly rows="5" style="width:100%;resize:vertical;background:var(--panel-2);border:1px solid var(--border);color:var(--ink);padding:8px;border-radius:8px">${T}</textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button class="btn secondary" data-act="copy">Copy</button>
          <button class="btn secondary" data-act="remove">Remove</button>
        </div>
      `,D.querySelector('[data-act="copy"]')?.addEventListener("click",()=>p(T)),D.querySelector('[data-act="remove"]')?.addEventListener("click",()=>{const A=i(c),G=A.findIndex(q=>q?.id&&q.id===E.id||q===E);G>-1&&(A.splice(G,1),l(c,A)),u(c)}),B.appendChild(D)}),t("#bucketExport")?.addEventListener("click",()=>{const E=i(c);h(`cst-${c}-bucket.json`,E)}),t("#bucketClear")?.addEventListener("click",()=>{window.confirm(`Clear all items from ${s[c]||c}?`)&&(l(c,[]),u(c),C?.("Bucket cleared."))})}}function g(c){u(c);const m=t("#modal-bucket");m&&(m.style.display="flex",document.body.style.overflow="hidden")}function v(c){const m=c?.closest?.(".modal-backdrop")||c;m&&(m.style.display="none",document.body.style.overflow="")}n("[data-open]").forEach(c=>{c.addEventListener("click",()=>{const m=c.getAttribute("data-open");m?.startsWith?.("bucket:")&&g(m.split(":")[1])})});try{const c=["denials","rpfr","fmip"].map(m=>`${m}:${(i(m)||[]).length}`).join(" | ");(window.logQA||console.debug)(`Buckets: ${c}`)}catch{}})();function qt(){try{const e=(p,h)=>getComputedStyle(p).getPropertyValue(h).trim(),t=document.body,n=e(t,"background-color"),o=e(t,"color"),s=de(n,o),i=document.querySelector(".tile")||t,l=e(i,"background-color"),d=e(i,"color")||o,a=de(l,d);(s<4.3||a<4.3)&&document.documentElement.classList.add("high-contrast")}catch{}}function de(e,t){function n(c){const m=c&&c.match&&c.match(/rgba?\(([^)]+)\)/i);if(!m)return[0,0,0];const I=m[1].split(",").map(B=>parseFloat(B.trim()));return I.length>=3?[I[0],I[1],I[2]]:[0,0,0]}function o(c){const m=c/255;return m<=.03928?m/12.92:Math.pow((m+.055)/1.055,2.4)}const[s,i,l]=n(e),[d,a,p]=n(t),h=.2126*o(s)+.7152*o(i)+.0722*o(l)+1e-4,u=.2126*o(d)+.7152*o(a)+.0722*o(p)+1e-4,g=Math.max(h,u),v=Math.min(h,u);return(g+.05)/(v+.05)}try{window._themeAudit=function(){const e=["theme-dark","theme-light","theme-glass"],t=document.documentElement;e.forEach((n,o)=>{setTimeout(()=>{t.classList.remove("theme-dark","theme-light","theme-glass"),t.classList.add(n),setTimeout(()=>{const s=getComputedStyle(document.body).backgroundColor,i=getComputedStyle(document.body).color;console.log(`[${n}] body contrast`,de(s,i).toFixed(2))},30)},o*80)})}}catch{}(function(){function t(i,l){const d=JSON.parse(localStorage.getItem("cst_profile")||"null")?.first||"Agent",a=(localStorage.getItem("cst_lang")||localStorage.getItem("lang")||"en").toUpperCase(),p=localStorage.getItem("cst_bilingual")==="1",h=`You are CST Copilot. Return:
1) Chat Script (${a}${p?"+ES":""})
2) Alpha Note
3) Tag
4) Email (if needed)
`,u=`Expert: ${d}
Source bucket: ${String(i||"general").toUpperCase()}
---
`+(l||"").trim();return i==="denials"?`${h}
Denial context below. Produce SERVE/SOLVE/SELL.
${u}`:i==="rpfr"?`${h}
RPFR (Retail Purchase For Reimbursement) case. Summarize deductible handling and refund path.
${u}`:i==="fmip"?`${h}
FMIP (Find My iPhone) override coaching. Return customer-facing steps + internal Alpha.
${u}`:`${h}
General CST assistance.
${u}`}function n(i,l){if(!document.getElementById("copilotSection"))try{ae(),Y()}catch{}const d=t(i,l||""),a=document.getElementById("copilotInput");a&&(a.value=d,a.focus());const p=document.getElementById("copilotSection");p&&p.scrollIntoView({behavior:"smooth",block:"start"});const h=document.getElementById("copilotRun");h&&h.click()}try{window.openCopilotWith=n}catch{}const o=()=>{const i=document.getElementById("modal-bucket");if(i&&!i.dataset.composePatched){i.dataset.composePatched="1";const l=i.querySelector("header div");if(l){const d=document.createElement("button");d.className="btn secondary",d.id="bucketComposeAll",d.textContent="Compose All",l.insertBefore(d,l.firstChild),d.addEventListener("click",()=>{const a=(document.getElementById("bucketTitle")?.textContent||"Bucket").toLowerCase(),p=a.includes("denials")?"denials":a.includes("rpfr")?"rpfr":a.includes("fmip")?"fmip":"general";let h=[];try{h=JSON.parse(localStorage.getItem("cst_bucket:"+p)||"[]")}catch{}const u=(h||[]).slice().sort((g,v)=>(v?.ts||0)-(g?.ts||0)).map(g=>g?.text||g?.content||"").filter(Boolean).join(`

—

`);if(!u){(window.showToast||alert)("Bucket is empty.");return}n(p,u)})}}};o();const s=document.getElementById("bucketList");s&&new MutationObserver(()=>{o(),s.querySelectorAll("article.tile").forEach(l=>{if(l.dataset.composeWired)return;l.dataset.composeWired="1";const d=l.querySelector('div[style*="justify-content:flex-end"]');if(d){const a=document.createElement("button");a.className="btn secondary",a.textContent="Compose",a.addEventListener("click",()=>{const p=l.querySelector("textarea")?.value||"",h=(document.getElementById("bucketTitle")?.textContent||"").toLowerCase(),u=h.includes("denials")?"denials":h.includes("rpfr")?"rpfr":h.includes("fmip")?"fmip":"general";n(u,p)}),d.insertBefore(a,d.firstChild)}})}).observe(s,{childList:!0,subtree:!0})})();function jt(){document.querySelectorAll(".dashboard-card").forEach(i=>{i.addEventListener("click",()=>{const l=i.getAttribute("data-action");Ut(l),i.classList.add("active"),setTimeout(()=>i.classList.remove("active"),300)})});const e=document.getElementById("dashboardCopilotInput"),t=document.getElementById("dashboardCopilotOutput"),n=document.getElementById("dashboardCopilotGenerate"),o=document.getElementById("dashboardCopilotCopy"),s=document.getElementById("dashboardCopilotCopyAll");document.querySelectorAll(".suggestion-chip").forEach(i=>{i.addEventListener("click",()=>{e&&(e.value=i.textContent,e.focus())})}),n&&e&&t&&n.addEventListener("click",async()=>{const i=e.value.trim();if(i){n.disabled=!0,n.textContent="Generating...",t.value="Generating response...";try{const d=await(await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:i})})).json();d.en?t.value=`English: ${d.en}

Spanish: ${d.es||"N/A"}`:t.value="Generated response would appear here."}catch(l){t.value=`Error: ${l.message}`}finally{n.disabled=!1,n.textContent="Generate"}}}),o&&t&&o.addEventListener("click",()=>{t.select(),document.execCommand("copy"),C("Response copied to clipboard")}),s&&t&&s.addEventListener("click",()=>{const l=`EN: ${t.value}

ES: [Spanish translation would be generated]`;navigator.clipboard.writeText(l).then(()=>{C("EN+ES response copied to clipboard")}).catch(()=>{t.value=l,t.select(),document.execCommand("copy"),C("EN+ES response copied to clipboard")})})}function Ut(e){switch(e){case"build-summary":F("tests");break;case"carrier-escalation":document.querySelector('[data-tab="carriers"]')?.click();break;case"denials-guide":he();break;case"copilot":document.getElementById("copilotInput")?.focus();break;case"knowledge-base":C("Knowledge Base - Feature coming soon");break;case"rpfr-grid":document.querySelector('[data-open="tools:rpfr"]')?.click();break;case"script-tracker":C("Script Tracker - Feature coming soon");break;case"terms-conditions":C("Terms & Conditions - Feature coming soon");break;case"quick-start":F("settings");break;default:C(`${e} - Feature coming soon`)}}
