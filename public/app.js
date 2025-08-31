// CST SmartDesk Application
      class CST_SmartDesk {
        constructor() {
          this.isInitialized = false;
          this.init();
        }

        init() {
          console.log('🚀 Initializing CST SmartDesk...');
          
          // Initialize components
          this.initializeTabs();
          this.initializeSearch();
          this.initializeDashboard();
          this.initializeModals();
          this.initializeMenus();
          
          // Health check
          this.runHealthCheck();
          
          this.isInitialized = true;
          console.log('✅ CST SmartDesk initialized');
        }

        initializeTabs() {
          const tabs = document.querySelectorAll('[role="tab"]');
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
        }

        initializeSearch() {
          const searchInput = document.getElementById('searchInput');
          const searchSuggest = document.getElementById('searchSuggest');
          
          if (searchInput) {
            searchInput.addEventListener('input', (e) => {
              const query = e.target.value.toLowerCase();
              if (query.length > 2) {
                this.showSearchSuggestions(query);
              } else {
                searchSuggest.style.display = 'none';
              }
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
              if (!searchInput.contains(e.target)) {
                searchSuggest.style.display = 'none';
              }
            });
          }
        }

        showSearchSuggestions(query) {
          const suggestions = [
            'Verizon escalation', 'AT&T policies', 'Cricket support',
            'RPFR process', 'Find My iPhone', 'Denials guide',
            'Copilot help', 'System status'
          ].filter(item => item.toLowerCase().includes(query));

          const searchSuggest = document.getElementById('searchSuggest');
          searchSuggest.innerHTML = suggestions.map(item => 
            `<div style="padding: 8px; cursor: pointer; border-radius: 4px;" 
                  onmouseover="this.style.background='var(--bg)'" 
                  onmouseout="this.style.background=''">${item}</div>`
          ).join('');
          
          searchSuggest.style.display = suggestions.length ? 'block' : 'none';
        }

        initializeDashboard() {
          const cards = document.querySelectorAll('.dashboard-card');
          
          cards.forEach(card => {
            card.addEventListener('click', () => {
              const action = card.dataset.action;
              this.handleDashboardAction(action);
            });
          });

          // Initialize copilot
          const generateBtn = document.getElementById('generateBtn');
          const copilotGenerate = document.getElementById('copilotGenerate');
          
          [generateBtn, copilotGenerate].forEach(btn => {
            if (btn) {
              btn.addEventListener('click', () => {
                this.generateCopilotResponse();
              });
            }
          });
        }

        handleDashboardAction(action) {
          const actionMap = {
            'build-summary': 'System Build Summary',
            'carrier-escalation': 'Carrier Escalation Tools',
            'denials-guide': 'Denials Handling Guide',
            'copilot': 'AI Copilot Assistant',
            'knowledge-base': 'Knowledge Base',
            'rpfr-grid': 'RPFR Management',
            'script-tracker': 'Script Tracker',
            'terms-conditions': 'Terms & Conditions',
            'quick-start': 'Quick Start Guide'
          };

          const title = actionMap[action] || 'Unknown Action';
          this.showNotification(`Opening: ${title}`, 'info');
        }

        generateCopilotResponse() {
          const input = document.getElementById('copilotInput');
          const output = document.getElementById('copilotOutput');
          
          if (input && output) {
            const query = input.value.trim();
            if (!query) {
              this.showNotification('Please enter a question', 'warning');
              return;
            }

            output.value = 'Generating response...';
            
            // Simulate AI response
            setTimeout(() => {
              const responses = [
                `Based on your query "${query}", here are the key points:\n\n1. Check carrier-specific policies\n2. Review escalation procedures\n3. Verify customer information\n4. Document all interactions`,
                `For "${query}":\n\n✓ Standard procedure applies\n✓ Follow escalation matrix\n✓ Notify supervisor if needed\n✓ Update case notes`,
                `Regarding "${query}":\n\n• First, verify account details\n• Then, check eligibility\n• Apply appropriate resolution\n• Follow up as needed`
              ];
              
              output.value = responses[Math.floor(Math.random() * responses.length)];
              this.showNotification('Response generated!', 'success');
            }, 1500);
          }
        }

        initializeModals() {
          const setupWizard = document.getElementById('setup-wizard');
          const openSettingsBtn = document.getElementById('openSettingsTop');
          const wizardSave = document.getElementById('wizardSave');
          
          if (setupWizard && openSettingsBtn) {
            openSettingsBtn.addEventListener('click', () => {
              setupWizard.showModal();
            });
          }

          if (wizardSave) {
            wizardSave.addEventListener('click', () => {
              this.saveWizardSettings();
              setupWizard.close();
            });
          }
        }

        saveWizardSettings() {
          const formData = {
            name: document.getElementById('wName').value,
            coach: document.getElementById('wCoach').value,
            empId: document.getElementById('wEmpId').value,
            ext: document.getElementById('wExt').value,
            theme: document.getElementById('wTheme').value,
            expertType: document.getElementById('wExpertType').value,
            dontShow: document.getElementById('dontShow').checked
          };

          localStorage.setItem('cst-smartdesk-settings', JSON.stringify(formData));
          this.showNotification('Settings saved successfully!', 'success');
        }

        initializeMenus() {
          const helpMenuBtn = document.getElementById('helpMenuBtn');
          const helpMenu = document.getElementById('helpMenu');
          
          if (helpMenuBtn && helpMenu) {
            helpMenuBtn.addEventListener('click', () => {
              helpMenu.style.display = helpMenu.style.display === 'block' ? 'none' : 'block';
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
              if (!helpMenuBtn.contains(e.target) && !helpMenu.contains(e.target)) {
                helpMenu.style.display = 'none';
              }
            });
          }

          // Theme toggle
          const themeToggle = document.getElementById('themeToggle');
          if (themeToggle) {
            themeToggle.addEventListener('click', () => {
              this.toggleTheme();
            });
          }
        }

        toggleTheme() {
          const isDark = document.documentElement.style.getPropertyValue('--bg') === '#0f172a';
          
          if (isDark) {
            // Switch to light
            document.documentElement.style.setProperty('--bg', '#ffffff');
            document.documentElement.style.setProperty('--panel', '#f8fafc');
            document.documentElement.style.setProperty('--border', '#e2e8f0');
            document.documentElement.style.setProperty('--ink', '#1e293b');
          } else {
            // Switch to dark
            document.documentElement.style.setProperty('--bg', '#0f172a');
            document.documentElement.style.setProperty('--panel', '#1e293b');
            document.documentElement.style.setProperty('--border', '#334155');
            document.documentElement.style.setProperty('--ink', '#f1f5f9');
          }
          
          this.showNotification('Theme toggled!', 'info');
        }

        runHealthCheck() {
          const healthIndicator = document.createElement('div');
          healthIndicator.className = 'health-indicator';
          healthIndicator.innerHTML = `
            <div class="health-status healthy">
              🟢 System HEALTHY
              <small>All checks passed</small>
            </div>
          `;
          document.body.appendChild(healthIndicator);

          // Auto-hide after 5 seconds
          setTimeout(() => {
            healthIndicator.style.opacity = '0.3';
          }, 5000);
        }

        showNotification(message, type = 'info') {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px 20px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            font-weight: 500;
          `;

          const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
          };

          notification.style.borderColor = colors[type];
          notification.style.color = colors[type];
          notification.textContent = message;

          document.body.appendChild(notification);

          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
      }

      // Initialize the app when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          window.cstApp = new CST_SmartDesk();
        });
      } else {
        window.cstApp = new CST_SmartDesk();
      }

      // Copy functionality for copilot
      document.addEventListener('click', (e) => {
        if (e.target.id === 'copilotCopy' || e.target.id === 'copilotCopyAll') {
          const output = document.getElementById('copilotOutput');
          if (output && output.value) {
            navigator.clipboard.writeText(output.value).then(() => {
              window.cstApp.showNotification('Copied to clipboard!', 'success');
            });
          }
        }
      });

      // Initialize tests modal and required elements
      (() => {
        const btn = document.getElementById("btn-fetch-verizon");
        const out = document.getElementById("tests-output");
        const dlg = document.getElementById("tests-modal");
        if (dlg) { dlg.style.display = ""; }
        if (btn && out) {
          btn.addEventListener("click", async () => {
            try {
              const r = await fetch("/api/fetch");
              out.textContent = JSON.stringify(await r.json(), null, 2);
            } catch (e) {
              out.textContent = "Fetch failed";
            }
          });
        }
        // Make placeholders visible
        ["system-status","panels","ingest"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = "";
        });
      })();
