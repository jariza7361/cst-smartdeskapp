// Complete CST SmartDesk Functionality System
class CompleteFunctionality {
  constructor() {
    this.init();
  }

  init() {
    this.setupAllDashboardCards();
    this.setupSidebarNavigation();
    this.setupSmartDropOCR();
    this.setupHelpMenu();
    this.setupThemeSystem();
    this.setupLanguageToggle();
    this.setupTestsModal();
    this.setupCarrierData();
    this.setupToolsPanel();
    this.setupBucketsPanel();
    this.setupProductsPanel();
  }

  setupAllDashboardCards() {
    const cardActions = {
      'build-summary': () => this.showBuildSummary(),
      'metrics': () => this.showTeamMetrics(),
      'carrier-escalation': () => this.showCarrierEscalation(),
      'denials-guide': () => this.showDenialsGuide(),
      'copilot': () => this.focusCopilot(),
      'knowledge-base': () => this.showKnowledgeBase(),
      'rpfr-grid': () => this.showRPFRGrid(),
      'script-tracker': () => this.showScriptTracker(),
      'terms-conditions': () => this.showTermsConditions(),
      'smartdrop-ocr': () => this.openSmartDropOCR(),
      'quick-start': () => this.openQuickStart(),
      'performance-metrics': () => this.showDetailedMetrics()
    };

    document.querySelectorAll('.dashboard-card').forEach(card => {
      const action = card.dataset.action;
      if (cardActions[action]) {
        card.addEventListener('click', cardActions[action]);
      }
    });
  }

  showBuildSummary() {
    this.createModal('Build Summary', `
      <div class="build-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <h4>System Status</h4>
            <div class="status-indicator online">
              <span class="status-dot"></span>
              All Systems Operational
            </div>
          </div>
          <div class="summary-item">
            <h4>Performance</h4>
            <div class="metric-list">
              <div>Response Time: 1.2s</div>
              <div>Uptime: 99.9%</div>
              <div>Load: Normal</div>
            </div>
          </div>
          <div class="summary-item">
            <h4>Features Active</h4>
            <div class="feature-list">
              <div>✓ Enhanced Copilot</div>
              <div>✓ SmartDrop OCR</div>
              <div>✓ Real-time Status</div>
              <div>✓ Multi-language Support</div>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  showTeamMetrics() {
    this.createModal('Team & Personal Metrics', `
      <div class="metrics-dashboard">
        <div class="metrics-tabs">
          <button class="tab-btn active" data-tab="personal">Personal</button>
          <button class="tab-btn" data-tab="team">Team</button>
          <button class="tab-btn" data-tab="goals">Goals</button>
        </div>
        <div class="tab-content active" data-content="personal">
          <div class="metric-cards">
            <div class="metric-card">
              <h4>Cases Today</h4>
              <div class="metric-value">23</div>
              <div class="metric-change">+15% vs yesterday</div>
            </div>
            <div class="metric-card">
              <h4>CSAT Score</h4>
              <div class="metric-value">98%</div>
              <div class="metric-change">+2% this week</div>
            </div>
            <div class="metric-card">
              <h4>Avg Handle Time</h4>
              <div class="metric-value">4.2min</div>
              <div class="metric-change">-0.8min improved</div>
            </div>
          </div>
        </div>
        <div class="tab-content" data-content="team">
          <div class="team-rankings">
            <div class="ranking-item">
              <span class="rank">#1</span>
              <span class="name">Jesus Ariza</span>
              <span class="score">98% CSAT</span>
            </div>
            <div class="ranking-item">
              <span class="rank">#2</span>
              <span class="name">Maria Rodriguez</span>
              <span class="score">96% CSAT</span>
            </div>
            <div class="ranking-item">
              <span class="rank">#3</span>
              <span class="name">Carlos Martinez</span>
              <span class="score">94% CSAT</span>
            </div>
          </div>
        </div>
        <div class="tab-content" data-content="goals">
          <div class="goals-progress">
            <div class="goal-item">
              <div class="goal-header">
                <span>Daily Cases Goal</span>
                <span>23/25</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 92%"></div>
              </div>
            </div>
            <div class="goal-item">
              <div class="goal-header">
                <span>CSAT Target</span>
                <span>98/95%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
    this.setupMetricsTabs();
  }

  showCarrierEscalation() {
    this.createModal('Carrier Escalation Workflows', `
      <div class="escalation-workflows">
        <div class="carrier-selector">
          <select id="escalationCarrier">
            <option value="">Select Carrier</option>
            <option value="VZW">Verizon Wireless</option>
            <option value="ATT">AT&T</option>
            <option value="CRK">Cricket</option>
            <option value="TELUS">TELUS</option>
          </select>
        </div>
        <div class="escalation-types">
          <div class="escalation-card" data-type="billing">
            <h4>Billing Disputes</h4>
            <p>Complex billing issues requiring carrier intervention</p>
            <button class="btn-primary">View Workflow</button>
          </div>
          <div class="escalation-card" data-type="technical">
            <h4>Technical Issues</h4>
            <p>Device or network problems beyond standard support</p>
            <button class="btn-primary">View Workflow</button>
          </div>
          <div class="escalation-card" data-type="policy">
            <h4>Policy Exceptions</h4>
            <p>Cases requiring policy interpretation or exceptions</p>
            <button class="btn-primary">View Workflow</button>
          </div>
        </div>
      </div>
    `);
  }

  showDenialsGuide() {
    this.createModal('Denials Guide & Scripts', `
      <div class="denials-guide">
        <div class="denial-categories">
          <div class="category-card">
            <h4>Device Damage</h4>
            <div class="denial-reasons">
              <div class="reason-item">
                <span class="reason">Physical Damage</span>
                <button class="script-btn" data-script="physical">Get Script</button>
              </div>
              <div class="reason-item">
                <span class="reason">Water Damage</span>
                <button class="script-btn" data-script="water">Get Script</button>
              </div>
              <div class="reason-item">
                <span class="reason">Intentional Damage</span>
                <button class="script-btn" data-script="intentional">Get Script</button>
              </div>
            </div>
          </div>
          <div class="category-card">
            <h4>Policy Exclusions</h4>
            <div class="denial-reasons">
              <div class="reason-item">
                <span class="reason">Pre-existing Condition</span>
                <button class="script-btn" data-script="preexisting">Get Script</button>
              </div>
              <div class="reason-item">
                <span class="reason">Coverage Lapse</span>
                <button class="script-btn" data-script="lapse">Get Script</button>
              </div>
            </div>
          </div>
        </div>
        <div class="script-output" id="denialScriptOutput" style="display: none;">
          <h4>Denial Script</h4>
          <textarea readonly rows="8"></textarea>
          <div class="script-actions">
            <button class="btn-secondary" onclick="this.copyScript()">Copy Script</button>
            <button class="btn-secondary" onclick="this.copyBilingual()">Copy EN+ES</button>
          </div>
        </div>
      </div>
    `);
    this.setupDenialScripts();
  }

  showKnowledgeBase() {
    this.createModal('Knowledge Base', `
      <div class="knowledge-base">
        <div class="kb-search">
          <input type="search" placeholder="Search knowledge base..." id="kbSearch">
          <button class="search-btn">🔍</button>
        </div>
        <div class="kb-categories">
          <div class="kb-category">
            <h4>Device Support</h4>
            <ul>
              <li><a href="#" onclick="this.showKBArticle('iphone-setup')">iPhone Setup Guide</a></li>
              <li><a href="#" onclick="this.showKBArticle('android-troubleshooting')">Android Troubleshooting</a></li>
              <li><a href="#" onclick="this.showKBArticle('device-replacement')">Device Replacement Process</a></li>
            </ul>
          </div>
          <div class="kb-category">
            <h4>Policy Information</h4>
            <ul>
              <li><a href="#" onclick="this.showKBArticle('deductibles')">Deductible Rates</a></li>
              <li><a href="#" onclick="this.showKBArticle('coverage-terms')">Coverage Terms</a></li>
              <li><a href="#" onclick="this.showKBArticle('exclusions')">Policy Exclusions</a></li>
            </ul>
          </div>
          <div class="kb-category">
            <h4>Carrier Specific</h4>
            <ul>
              <li><a href="#" onclick="this.showKBArticle('vzw-policies')">Verizon Policies</a></li>
              <li><a href="#" onclick="this.showKBArticle('att-procedures')">AT&T Procedures</a></li>
              <li><a href="#" onclick="this.showKBArticle('cricket-guidelines')">Cricket Guidelines</a></li>
            </ul>
          </div>
        </div>
      </div>
    `);
  }

  showRPFRGrid() {
    this.createModal('PFR/RPFR Price Tool & Note Generator', `
      <div class="rpfr-tool">
        <div class="device-selector">
          <h4>Device Information</h4>
          <div class="form-row">
            <select id="deviceBrand">
              <option value="">Select Brand</option>
              <option value="apple">Apple</option>
              <option value="samsung">Samsung</option>
              <option value="google">Google</option>
            </select>
            <select id="deviceModel">
              <option value="">Select Model</option>
            </select>
          </div>
          <div class="form-row">
            <select id="deviceStorage">
              <option value="">Storage</option>
              <option value="64gb">64GB</option>
              <option value="128gb">128GB</option>
              <option value="256gb">256GB</option>
            </select>
            <select id="deviceColor">
              <option value="">Color</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="blue">Blue</option>
            </select>
          </div>
        </div>
        <div class="pricing-results" id="pricingResults" style="display: none;">
          <h4>Pricing Information</h4>
          <div class="price-grid">
            <div class="price-item">
              <span class="price-label">Retail Price:</span>
              <span class="price-value" id="retailPrice">$999</span>
            </div>
            <div class="price-item">
              <span class="price-label">Deductible:</span>
              <span class="price-value" id="deductiblePrice">$249</span>
            </div>
            <div class="price-item">
              <span class="price-label">Replacement Cost:</span>
              <span class="price-value" id="replacementCost">$249</span>
            </div>
          </div>
          <div class="note-generator">
            <h4>Generated Note</h4>
            <textarea id="generatedNote" rows="4" readonly></textarea>
            <button class="btn-primary" onclick="this.copyNote()">Copy Note</button>
          </div>
        </div>
      </div>
    `);
    this.setupRPFRTool();
  }

  setupSidebarNavigation() {
    const tabs = document.querySelectorAll('.tabs button[role="tab"]');
    const panels = document.querySelectorAll('.side-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.tab;
        
        // Update tab states
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');
        
        // Update panel visibility
        panels.forEach(panel => {
          panel.hidden = panel.dataset.panel !== targetPanel;
        });
      });
    });

    // Setup carrier navigation
    document.querySelectorAll('[data-open^="carrier:"]').forEach(item => {
      item.addEventListener('click', () => {
        const carrier = item.dataset.open.split(':')[1];
        this.loadCarrierData(carrier);
      });
    });

    // Setup product navigation
    document.querySelectorAll('[data-open^="product:"]').forEach(item => {
      item.addEventListener('click', () => {
        const product = item.dataset.open.split(':')[1];
        this.loadProductData(product);
      });
    });

    // Setup tools navigation
    document.querySelectorAll('[data-open^="tools:"]').forEach(item => {
      item.addEventListener('click', () => {
        const tool = item.dataset.open.split(':')[1];
        this.openTool(tool);
      });
    });
  }

  setupSmartDropOCR() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const pastezone = document.getElementById('pastezone');
    const extractOutput = document.getElementById('extract-output');

    if (dropzone) {
      dropzone.addEventListener('click', () => fileInput?.click());
      
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        this.handleFileUpload(e.dataTransfer.files);
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFileUpload(e.target.files);
      });
    }

    if (pastezone) {
      pastezone.addEventListener('input', (e) => {
        if (extractOutput) {
          extractOutput.textContent = `Processed text:\n${e.target.value}`;
        }
      });
    }
  }

  handleFileUpload(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    const extractOutput = document.getElementById('extract-output');
    
    if (extractOutput) {
      extractOutput.textContent = `Processing ${file.name}...`;
      
      // Simulate OCR processing
      setTimeout(() => {
        extractOutput.textContent = `Extracted text from ${file.name}:\n\nSample extracted text content would appear here. The OCR engine would process the uploaded file and extract all readable text content.`;
      }, 2000);
    }
  }

  setupHelpMenu() {
    const helpMenuBtn = document.getElementById('helpMenuBtn');
    const helpMenu = document.getElementById('helpMenu');

    if (helpMenuBtn && helpMenu) {
      helpMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = helpMenu.style.display === 'block';
        helpMenu.style.display = isOpen ? 'none' : 'block';
        helpMenuBtn.setAttribute('aria-expanded', !isOpen);
      });

      document.addEventListener('click', () => {
        helpMenu.style.display = 'none';
        helpMenuBtn.setAttribute('aria-expanded', 'false');
      });

      // Help menu items
      document.getElementById('helpWelcomeItem')?.addEventListener('click', () => {
        this.showWelcomeScreen();
      });

      document.getElementById('helpDocsItem')?.addEventListener('click', () => {
        this.showDocumentation();
      });

      document.getElementById('helpSupportItem')?.addEventListener('click', () => {
        this.showSupport();
      });
    }
  }

  setupThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    const themes = ['light', 'dark', 'glass', 'macos', 'asurion'];
    let currentThemeIndex = 4; // Start with Asurion theme

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];
        this.applyTheme(newTheme);
        this.showToast(`Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
      });
    }
  }

  applyTheme(themeName) {
    const body = document.body;
    body.classList.remove('theme-light', 'theme-dark', 'theme-glass', 'theme-macos', 'theme-asurion');
    body.classList.add(`theme-${themeName}`);
    localStorage.setItem('cst_theme', themeName);
  }

  setupLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    let currentLang = 'en';

    if (langToggle) {
      langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'es' : 'en';
        this.switchLanguage(currentLang);
        this.showToast(`Language: ${currentLang === 'en' ? 'English' : 'Español'}`);
      });
    }
  }

  switchLanguage(lang) {
    // This would integrate with the i18n system
    console.log(`Switching to language: ${lang}`);
    localStorage.setItem('cst_language', lang);
  }

  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'premium-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="this.closest('.premium-modal').remove()">×</button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add modal styles if not already present
    if (!document.getElementById('modal-styles')) {
      this.addModalStyles();
    }
  }

  addModalStyles() {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .premium-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: modalFadeIn 0.3s ease;
      }
      
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
      }
      
      .modal-container {
        position: relative;
        background: white;
        border-radius: 16px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #f5f5f7;
        background: linear-gradient(135deg, #663399, #8A2BE2);
        color: white;
      }
      
      .modal-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }
      
      .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .modal-content {
        padding: 24px;
        overflow-y: auto;
        max-height: calc(90vh - 80px);
      }
      
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #663399;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  focusCopilot() {
    const copilotInput = document.getElementById('copilotInput');
    if (copilotInput) {
      copilotInput.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => copilotInput.focus(), 500);
    }
  }
}

// Initialize Complete Functionality
document.addEventListener('DOMContentLoaded', () => {
  window.completeFunctionality = new CompleteFunctionality();
});