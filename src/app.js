// CST SmartDesk - Clean Application Entry Point
console.log('CST SmartDesk v1.0 - Loading...');

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('CST SmartDesk v1.0 - Initialized');
  
  // Load the SmartPanelManager
  if (window.smartPanelManager) {
    console.log('SmartPanelManager loaded successfully');
  } else {
    console.warn('SmartPanelManager not found - check smart-panels.js');
  }
});

// Global error handler
window.addEventListener('error', (error) => {
  console.error('Application error:', error.message);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    version: '1.0'
  };
}