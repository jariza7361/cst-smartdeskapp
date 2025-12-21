// Enhanced Functionality Integration
class EnhancedFunctionality {
  constructor() {
    this.init();
  }

  init() {
    this.setupNotifications();
    this.setupSearchFilters();
    this.setupStatusIndicators();
    this.setupFloatingCopilot();
    this.setupAriaEnhancements();
    this.setupDashboardInteractions();
  }

  setupNotifications() {
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');

    if (notificationsBtn && notificationsPanel) {
      notificationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notificationsPanel.style.display === 'block';
        notificationsPanel.style.display = isOpen ? 'none' : 'block';
        notificationsBtn.setAttribute('aria-expanded', !isOpen);
      });

      // Close when clicking outside
      document.addEventListener('click', () => {
        notificationsPanel.style.display = 'none';
        notificationsBtn.setAttribute('aria-expanded', 'false');
      });

      // Mark notifications as read when clicked
      notificationsPanel.addEventListener('click', (e) => {
        if (e.target.closest('.notification-item')) {
          e.target.closest('.notification-item').style.opacity = '0.7';
          this.updateNotificationBadge();
        }
      });
    }
  }

  updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      const currentCount = parseInt(badge.textContent) || 0;
      const newCount = Math.max(0, currentCount - 1);
      badge.textContent = newCount;
      if (newCount === 0) {
        badge.style.display = 'none';
      }
    }
  }

  setupSearchFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchFilters = document.getElementById('searchFilters');
    const searchFilterBtn = document.getElementById('searchFilters');

    if (searchInput) {
      // Enhanced search with real-time suggestions
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.showSearchSuggestions(query);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.performSearch(e.target.value);
        }
      });
    }

    // Recent search tags
    document.querySelectorAll('.recent-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = tag.textContent;
          this.performSearch(tag.textContent);
        }
      });
    });
  }

  showSearchSuggestions(query) {
    const suggestions = [
      'VZW deductible information',
      'ATT escalation process',
      'Cricket claim denial',
      'Samsung device troubleshooting',
      'TELUS policy updates',
      'Copilot assistance',
      'SmartDrop OCR usage',
      'Performance metrics'
    ];

    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(query) && query.length > 1
    );

    const suggestDiv = document.getElementById('searchSuggest');
    if (suggestDiv && filtered.length > 0) {
      suggestDiv.innerHTML = filtered.map(suggestion => 
        `<div class="suggestion-item" onclick="this.selectSuggestion('${suggestion}')">${suggestion}</div>`
      ).join('');
      suggestDiv.style.display = 'block';
    } else if (suggestDiv) {
      suggestDiv.style.display = 'none';
    }
  }

  performSearch(query) {
    console.log('Performing search for:', query);
    // Hide suggestions
    const suggestDiv = document.getElementById('searchSuggest');
    if (suggestDiv) {
      suggestDiv.style.display = 'none';
    }
    
    // Show search results (simulated)
    this.showSearchResults(query);
  }

  showSearchResults(query) {
    // Create search results overlay
    const overlay = document.createElement('div');
    overlay.className = 'search-results-overlay';
    overlay.innerHTML = `
      <div class="search-results-panel">
        <div class="search-results-header">
          <h3>Search Results for "${query}"</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">×</button>
        </div>
        <div class="search-results-content">
          <div class="result-item">
            <h4>VZW Deductible Information</h4>
            <p>Current deductible rates for Verizon Wireless devices...</p>
          </div>
          <div class="result-item">
            <h4>Escalation Process</h4>
            <p>Step-by-step escalation workflow for complex cases...</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  setupStatusIndicators() {
    // Simulate real-time status updates
    setInterval(() => {
      this.updateStatusIndicators();
    }, 30000); // Update every 30 seconds
  }

  updateStatusIndicators() {
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
      const dot = item.querySelector('.status-dot');
      if (dot && Math.random() > 0.9) { // 10% chance to change status
        const statuses = ['status-online', 'status-warning', 'status-offline'];
        const currentStatus = statuses.find(s => dot.classList.contains(s));
        dot.classList.remove(currentStatus);
        dot.classList.add(statuses[Math.floor(Math.random() * statuses.length)]);
      }
    });
  }

  setupFloatingCopilot() {
    // Create floating copilot button
    const floatingCopilot = document.createElement('div');
    floatingCopilot.className = 'floating-copilot';
    floatingCopilot.innerHTML = `
      <button class="floating-copilot-btn" aria-label="Open floating Copilot">
        <img src="/assets-png/icons/copilot.png" alt="Copilot" class="copilot-icon">
      </button>
      <div class="floating-copilot-panel" style="display: none;">
        <div class="floating-copilot-header">
          <h4>Quick Copilot</h4>
          <button class="close-floating" aria-label="Close">×</button>
        </div>
        <div class="floating-copilot-content">
          <textarea placeholder="Ask me anything..." rows="3" class="floating-input"></textarea>
          <button class="floating-generate-btn">Generate</button>
          <div class="floating-output" style="display: none;">
            <div class="output-text"></div>
            <button class="copy-output-btn">Copy</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(floatingCopilot);

    // Setup floating copilot interactions
    const floatingBtn = floatingCopilot.querySelector('.floating-copilot-btn');
    const floatingPanel = floatingCopilot.querySelector('.floating-copilot-panel');
    const closeBtn = floatingCopilot.querySelector('.close-floating');
    const generateBtn = floatingCopilot.querySelector('.floating-generate-btn');
    const input = floatingCopilot.querySelector('.floating-input');
    const output = floatingCopilot.querySelector('.floating-output');

    floatingBtn.addEventListener('click', () => {
      const isVisible = floatingPanel.style.display === 'block';
      floatingPanel.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      floatingPanel.style.display = 'none';
    });

    generateBtn.addEventListener('click', () => {
      this.generateFloatingCopilotResponse(input.value, output);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        this.generateFloatingCopilotResponse(input.value, output);
      }
    });
  }

  generateFloatingCopilotResponse(query, outputDiv) {
    if (!query.trim()) return;

    const outputText = outputDiv.querySelector('.output-text');
    outputText.textContent = 'Generating response...';
    outputDiv.style.display = 'block';

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        'escalation': 'Here is the escalation workflow: 1) Verify customer info, 2) Document issue, 3) Route to specialized team.',
        'deductible': 'Current deductible rates: iPhone $249, Samsung $199, Basic phones $99.',
        'denial': 'For claim denials, review policy terms, document reason, and provide clear explanation to customer.',
        'default': `Based on your query "${query}", here are the recommended next steps: 1) Check policy coverage, 2) Verify customer eligibility, 3) Process according to guidelines.`
      };

      const key = Object.keys(responses).find(k => query.toLowerCase().includes(k)) || 'default';
      outputText.textContent = responses[key];
    }, 1500);
  }

  setupAriaEnhancements() {
    // Enhanced ARIA support for dynamic content
    document.addEventListener('DOMNodeInserted', (e) => {
      if (e.target.nodeType === 1) { // Element node
        this.enhanceAriaForElement(e.target);
      }
    });

    // Keyboard navigation improvements
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
  }

  enhanceAriaForElement(element) {
    // Auto-add ARIA labels for buttons without them
    const buttons = element.querySelectorAll ? element.querySelectorAll('button:not([aria-label])') : [];
    buttons.forEach(button => {
      if (button.textContent.trim()) {
        button.setAttribute('aria-label', button.textContent.trim());
      }
    });

    // Auto-add roles for interactive elements
    const interactiveElements = element.querySelectorAll ? element.querySelectorAll('[data-action]:not([role])') : [];
    interactiveElements.forEach(el => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    });
  }

  handleKeyboardNavigation(e) {
    // Escape key closes modals/panels
    if (e.key === 'Escape') {
      document.querySelectorAll('.floating-copilot-panel, .notifications-panel, .help-menu').forEach(panel => {
        panel.style.display = 'none';
      });
    }

    // Tab navigation improvements
    if (e.key === 'Tab') {
      this.highlightFocusedElement();
    }
  }

  highlightFocusedElement() {
    // Add visual focus indicators
    setTimeout(() => {
      const focused = document.activeElement;
      if (focused && focused !== document.body) {
        focused.style.outline = '2px solid #007aff';
        focused.style.outlineOffset = '2px';
      }
    }, 10);
  }

  setupDashboardInteractions() {
    // Dashboard card interactions
    document.querySelectorAll('.dashboard-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const action = card.dataset.action;
        this.handleDashboardAction(action, card);
      });

      // Add keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const copilotInput = document.getElementById('copilotInput');
        if (copilotInput) {
          copilotInput.value = chip.textContent;
          copilotInput.focus();
        }
      });
    });

    // Enhanced copilot functionality
    const copilotGenerate = document.getElementById('copilotGenerate');
    const copilotInput = document.getElementById('copilotInput');
    const copilotOutput = document.getElementById('copilotOutput');

    if (copilotGenerate && copilotInput && copilotOutput) {
      copilotGenerate.addEventListener('click', () => {
        this.generateCopilotResponse(copilotInput.value, copilotOutput);
      });

      copilotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          this.generateCopilotResponse(copilotInput.value, copilotOutput);
        }
      });
    }

    // Copy buttons
    document.getElementById('copilotCopy')?.addEventListener('click', () => {
      this.copyToClipboard(copilotOutput.value);
    });

    document.getElementById('copilotCopyAll')?.addEventListener('click', () => {
      this.copyBilingualResponse(copilotOutput.value);
    });
  }

  handleDashboardAction(action, card) {
    console.log('Dashboard action:', action);
    
    // Add visual feedback
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);

    // Handle specific actions
    switch (action) {
      case 'performance-metrics':
        this.showPerformanceMetrics();
        break;
      case 'smartdrop-ocr':
        this.openSmartDropOCR();
        break;
      case 'copilot':
        this.focusCopilot();
        break;
      default:
        this.showActionModal(action);
    }
  }

  generateCopilotResponse(query, outputElement) {
    if (!query.trim()) return;

    outputElement.value = 'Generating response...';
    
    setTimeout(() => {
      const responses = {
        'escalation': 'ESCALATION SCRIPT:\n\n"I understand this situation requires special attention. Let me connect you with our escalation team who can provide the specialized assistance you need. They will review your case thoroughly and ensure we find the best resolution for you."\n\nNext steps:\n1. Document case details\n2. Route to escalation queue\n3. Set follow-up reminder',
        
        'deductible': 'DEDUCTIBLE INFORMATION:\n\nCurrent rates by device tier:\n• Premium devices (iPhone Pro, Samsung Galaxy S): $249\n• Standard smartphones: $199\n• Basic phones: $99\n• Tablets: $149\n\nNote: Rates may vary by carrier and plan type. Always verify with current policy.',
        
        'denial': 'CLAIM DENIAL SCRIPT:\n\n"I\'ve reviewed your claim and unfortunately, it doesn\'t meet the coverage requirements because [specific reason]. I want to explain exactly what this means and what options are available to you."\n\nDenial reasons to check:\n• Policy exclusions\n• Damage type not covered\n• Claim limits exceeded\n• Missing documentation',
        
        'default': `GENERAL ASSISTANCE:\n\nBased on your query: "${query}"\n\nRecommended approach:\n1. Verify customer account and policy status\n2. Review specific case details\n3. Apply appropriate policy guidelines\n4. Document all interactions\n5. Provide clear next steps to customer\n\nWould you like me to generate a specific script for this situation?`
      };

      const key = Object.keys(responses).find(k => query.toLowerCase().includes(k)) || 'default';
      outputElement.value = responses[key];
    }, 1500);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Copied to clipboard!');
    });
  }

  copyBilingualResponse(text) {
    const bilingual = `ENGLISH:\n${text}\n\nESPAÑOL:\n[Spanish translation would be generated here]`;
    navigator.clipboard.writeText(bilingual).then(() => {
      this.showToast('Bilingual response copied!');
    });
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #34c759;
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

  showPerformanceMetrics() {
    const modal = document.createElement('div');
    modal.className = 'performance-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Performance Metrics</h3>
          <button onclick="this.closest('.performance-modal').remove()" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="metric-item">
            <span>Cases Today:</span>
            <span>23</span>
          </div>
          <div class="metric-item">
            <span>Average Handle Time:</span>
            <span>4.2 minutes</span>
          </div>
          <div class="metric-item">
            <span>CSAT Score:</span>
            <span>98%</span>
          </div>
          <div class="metric-item">
            <span>Goal Progress:</span>
            <span>85% (On Track)</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function initHelpMenuWiring() {
  const btn = document.getElementById('helpMenuBtn') || document.querySelector('[data-testid="help-menu-btn"]');
  const menu = document.getElementById('helpMenu') || document.querySelector('[data-testid="help-menu"]');
  const welcomeBtn = document.getElementById('helpWelcomeItem') || document.querySelector('[data-testid="help-menu-item-welcome"]');
  const welcomeModal = document.getElementById('welcome-modal') || document.querySelector('[data-testid="welcome-modal"]');

  if (!btn || !menu) return;
  if (btn.dataset.wired === '1' || menu.dataset.wired === '1') return;
  btn.dataset.wired = '1';
  menu.dataset.wired = '1';

  const closeMenu = () => {
    menu.classList.remove('open');
    menu.hidden = true;
    menu.setAttribute('hidden', '');
    menu.style.display = 'none';
  };

  const openMenu = () => {
    menu.hidden = false;
    menu.removeAttribute('hidden');
    menu.style.display = 'block';
    menu.classList.add('open');
  };

  // Start closed (safe)
  closeMenu();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isHidden = menu.hidden || menu.hasAttribute('hidden') || menu.style.display === 'none';
    if (isHidden) openMenu();
    else closeMenu();
  });

  // Clicking inside the menu should NOT close it
  menu.addEventListener('click', (e) => e.stopPropagation());

  // Click outside closes
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && !menu.contains(target) && !btn.contains(target)) {
      closeMenu();
    }
  });

  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  if (welcomeBtn && welcomeModal) {
    if (welcomeModal.dataset.wired !== '1') {
      welcomeModal.dataset.wired = '1';
      const closeWelcome = () => {
        welcomeModal.classList.add('hidden');
        welcomeModal.hidden = true;
        welcomeModal.setAttribute('hidden', '');
        welcomeModal.style.display = 'none';
      };
      const openWelcome = () => {
        welcomeModal.hidden = false;
        welcomeModal.removeAttribute('hidden');
        welcomeModal.style.display = 'block';
        welcomeModal.classList.remove('hidden');
      };

      closeWelcome();

      welcomeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        openWelcome();
      });

      const closeBtn = welcomeModal.querySelector('[data-testid="welcome-close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeWelcome();
        });
      }

      welcomeModal.addEventListener('click', (e) => {
        if (e.target === welcomeModal) {
          closeWelcome();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeWelcome();
      });
    }
  }
}

// Initialize enhanced functionality
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedFunctionality = new EnhancedFunctionality();
  initHelpMenuWiring();
});
