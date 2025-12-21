// CST SmartDesk - Enhanced Smart Panels with Security & Performance
class SmartPanelManager {
  constructor() {
    try {
      this.panels = new Map();
      this.expertProfile = this.loadExpertProfile();
      this.fileInput = null;
      this.initializePanels();
      this.setupEventListeners();
    } catch (error) {
      console.error('SmartPanelManager initialization failed:', error);
    }
  }

  loadExpertProfile() {
    try {
      const setupData = localStorage.getItem('cst_setup_data');
      if (!setupData) {
        return { firstName: 'Expert', lastName: '', expertType: 'english' };
      }
      const parsed = JSON.parse(setupData);
      const name = typeof parsed.wName === 'string' ? parsed.wName.trim() : '';
      const [firstName = 'Expert', ...rest] = name.split(/\s+/);
      const lastName = rest.join(' ');
      const expertType = parsed.wExpertType || 'english';
      return { firstName, lastName, expertType };
    } catch (error) {
      console.error('Failed to load expert profile:', error);
      return { firstName: 'Expert', lastName: '', expertType: 'english' };
    }
  }

  getPersonalizedGreeting() {
    return `CST ${this.sanitizeText(this.expertProfile.firstName)}`;
  }

  initializePanels() {
    const panelConfig = [
      { id: 'build-summary', element: '#systemStatusSection', active: false },
      { id: 'carrier-escalation', element: '#panel-carriers', active: false },
      { id: 'denials-guide', element: '#panel-denials', active: false },
      { id: 'copilot', element: '.copilot-workspace', active: true },
      { id: 'knowledge-base', element: '#panel-notes', active: false },
      { id: 'rpfr-grid', element: '[data-panel="tools"]', active: false },
      { id: 'script-tracker', element: '[data-panel="products"]', active: false },
      { id: 'terms-conditions', element: '[data-panel="buckets"]', active: false },
      { id: 'quick-start', element: '#setup-wizard', active: false },
      { id: 'smartdrop-ocr', element: '.smartdrop-card', active: false },
      { id: 'system-status', element: '#system-status', active: false },
      { id: 'tests-debug', element: '#tests-modal', active: false }
    ];

    panelConfig.forEach(config => {
      this.panels.set(config.id, config);
    });
  }

  setupEventListeners() {
    try {
      document.querySelectorAll('.dashboard-card').forEach(card => {
        card.addEventListener('click', (e) => {
          try {
            const action = card.dataset.action;
            if (action) {
              this.activatePanel(action);
            }
          } catch (error) {
            console.error('Panel activation error:', error);
          }
        });
      });

      const copilotGenerate = document.getElementById('copilotGenerate');
      if (copilotGenerate) {
        copilotGenerate.addEventListener('click', () => {
          try {
            this.generateCopilotResponse();
          } catch (error) {
            console.error('Copilot generation error:', error);
          }
        });
      }
    } catch (error) {
      console.error('Event listener setup failed:', error);
    }
  }

  activatePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;

    this.panels.forEach((p) => {
      const element = document.querySelector(p.element);
      if (element) {
        element.classList.add('hidden');
        p.active = false;
      }
    });

    const element = document.querySelector(panel.element);
    if (element) {
      element.classList.remove('hidden');
      panel.active = true;
      this.handleSpecialPanel(panelId, element);
    }
  }

  handleSpecialPanel(panelId, element) {
    switch(panelId) {
      case 'build-summary':
        this.loadSystemStatus();
        break;
      case 'copilot':
        this.initializeCopilot();
        break;
      case 'smartdrop-ocr':
        this.initializeSmartDrop();
        break;
      case 'quick-start':
        this.showSetupWizard();
        break;
    }
  }

  loadSystemStatus() {
    const statusList = document.getElementById('statusList');
    if (statusList) {
      statusList.innerHTML = `
        <li>✅ System: Online</li>
        <li>✅ Panels: Active</li>
        <li>✅ Security: Enabled</li>
      `;
    }
  }

  initializeCopilot() {
    const output = document.getElementById('copilotOutput');
    if (output && !output.value) {
      output.placeholder = `${this.getPersonalizedGreeting()} responses will appear here...`;
    }
  }

  generateCopilotResponse() {
    const input = document.getElementById('copilotInput');
    const output = document.getElementById('copilotOutput');
    
    if (!input || !output) return;

    const prompt = this.sanitizeText(input.value.trim());
    if (!prompt) return;

    const greeting = this.getPersonalizedGreeting();
    const timestamp = new Date().toLocaleString();
    
    let response = `${greeting}\n\n`;
    
    if (prompt.toLowerCase().includes('escalation')) {
      response += `ESCALATION SCRIPT - Generated ${timestamp}\n`;
      response += `===========================================\n\n`;
      response += `Hello, this is ${this.sanitizeText(this.expertProfile.firstName)} from Asurion Customer Support Technology.\n\n`;
      response += `I'm reaching out regarding a customer case that requires escalation assistance.\n\n`;
      response += `NEXT STEPS:\n`;
      response += `1. Review case details with supervisor\n`;
      response += `2. Verify customer eligibility and coverage\n`;
      response += `3. Document all interactions in case notes\n`;
      response += `4. Follow up within 24 hours\n\n`;
      response += `Best regards,\n${greeting}`;
    } else if (prompt.toLowerCase().includes('denial')) {
      response += `DENIAL HANDLING GUIDANCE\n`;
      response += `========================\n\n`;
      response += `1. VERIFY DENIAL REASON:\n`;
      response += `   • Check policy terms and conditions\n`;
      response += `   • Confirm customer eligibility\n`;
      response += `   • Review claim documentation\n\n`;
      response += `2. CUSTOMER COMMUNICATION:\n`;
      response += `   • Explain denial reason clearly\n`;
      response += `   • Provide policy reference\n`;
      response += `   • Offer alternative solutions if available\n\n`;
      response += `How else can I assist you today?`;
    } else {
      response += `Thank you for your question: "${this.sanitizeText(prompt)}"\n\n`;
      response += `I'm here to help with:\n`;
      response += `• Carrier-specific policies and procedures\n`;
      response += `• Escalation scripts and templates\n`;
      response += `• Denial handling guidance\n`;
      response += `• General CST support procedures\n\n`;
      response += `Please provide more specific details about what you need help with.\n\n`;
      response += `How else can I assist you today?`;
    }

    output.value = response;
    input.value = '';
  }

  initializeSmartDrop() {
    const smartDropCard = document.querySelector('[data-action="smartdrop-ocr"]');
    if (smartDropCard) {
      this.setupSmartDropCard(smartDropCard);
    }
  }
  
  setupSmartDropCard(card) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      card.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      card.addEventListener(eventName, () => {
        card.classList.add('drag-over');
        this.showDropOverlay(card);
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      card.addEventListener(eventName, () => {
        card.classList.remove('drag-over');
        this.hideDropOverlay(card);
      });
    });

    card.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        this.processFiles(files, card);
      }
    });

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.progress-text')) {
        this.openFilePicker(card);
      }
    });
  }
  
  showDropOverlay(card) {
    let overlay = card.querySelector('.drop-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'drop-overlay';
      overlay.innerHTML = '<div class="drop-icon">📁</div><div>Drop files here</div>';
      card.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  hideDropOverlay(card) {
    const overlay = card.querySelector('.drop-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  openFilePicker(card) {
    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.multiple = true;
      this.fileInput.accept = 'image/*,.pdf,.txt,.doc,.docx';
      this.fileInput.style.display = 'none';
      document.body.appendChild(this.fileInput);
    }

    this.fileInput.onchange = (e) => {
      if (e.target.files.length > 0) {
        this.processFiles(Array.from(e.target.files), card);
      }
    };
    this.fileInput.click();
  }

  processFiles(files, card) {
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('File too large. Maximum size is 10MB.', 'error');
        return;
      }
      
      if (file.type.startsWith('image/')) {
        this.processImageFile(file, card);
      } else {
        this.showNotification('Only image files are supported for OCR', 'error');
      }
    });
  }

  processImageFile(file, card) {
    this.showProgress(card, 'Processing...', 0);
    
    if (typeof Tesseract !== 'undefined') {
      Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            this.updateProgress(card, 'Extracting text...', Math.round(m.progress * 100));
          }
        }
      }).then(({ data: { text } }) => {
        this.hideProgress(card);
        this.showResults(file.name, text);
        this.showNotification('Text extracted successfully!', 'success');
      }).catch(error => {
        this.hideProgress(card);
        this.showNotification('OCR processing failed', 'error');
        console.error('OCR Error:', this.sanitizeText(error.message));
      });
    } else {
      this.hideProgress(card);
      this.showNotification('Tesseract library not loaded', 'error');
    }
  }

  showProgress(card, text, percent) {
    let progress = card.querySelector('.smartdrop-progress');
    if (!progress) {
      progress = document.createElement('div');
      progress.className = 'smartdrop-progress';
      progress.innerHTML = `
        <div class="progress-bar"><div class="progress-fill"></div></div>
        <div class="progress-text"><span class="status"></span><span class="percent"></span></div>
      `;
      card.appendChild(progress);
    }
    progress.querySelector('.status').textContent = text;
    progress.querySelector('.percent').textContent = `${percent}%`;
    progress.querySelector('.progress-fill').style.width = `${percent}%`;
    progress.style.display = 'block';
  }

  updateProgress(card, text, percent) {
    const progress = card.querySelector('.smartdrop-progress');
    if (progress) {
      progress.querySelector('.status').textContent = text;
      progress.querySelector('.percent').textContent = `${percent}%`;
      progress.querySelector('.progress-fill').style.width = `${percent}%`;
    }
  }

  hideProgress(card) {
    const progress = card.querySelector('.smartdrop-progress');
    if (progress) {
      progress.style.display = 'none';
    }
  }

  showResults(fileName, text) {
    const modal = document.createElement('div');
    modal.className = 'smartdrop-results-modal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div>
            <h3 class="file-name">${this.sanitizeText(fileName)}</h3>
            <p class="file-info">Extracted ${text.length} characters</p>
          </div>
          <button class="close-btn">×</button>
        </div>
        <textarea class="extracted-text" readonly>${this.sanitizeText(text)}</textarea>
        <div class="modal-actions">
          <button class="copy-btn">Copy Text</button>
          <button class="send-copilot-btn">Send to Copilot</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.querySelector('.copy-btn').onclick = () => {
      try {
        navigator.clipboard.writeText(text).then(() => {
          this.showNotification('Text copied to clipboard!', 'success');
        }).catch(() => {
          this.showNotification('Failed to copy text', 'error');
        });
      } catch (error) {
        this.showNotification('Copy not supported', 'error');
      }
    };
    
    modal.querySelector('.send-copilot-btn').onclick = () => {
      const copilotInput = document.getElementById('copilotInput');
      if (copilotInput) {
        copilotInput.value = `Please analyze this extracted text: ${this.sanitizeText(text)}`;
        this.activatePanel('copilot');
        modal.remove();
        this.showNotification('Text sent to Copilot!', 'success');
      }
    };
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `smartdrop-notification ${type}`;
    notification.textContent = this.sanitizeText(message);
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showSetupWizard() {
    const wizard = document.getElementById('setup-wizard');
    if (wizard) {
      wizard.showModal();
    }
  }

  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>&"']/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entities[char] || char;
    });
  }
}

window.SmartPanelManager = SmartPanelManager;
