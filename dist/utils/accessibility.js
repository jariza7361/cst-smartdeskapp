// Accessibility Enhancement (WCAG 2.1 AA Compliance)
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.addSkipLinks();
    this.enhanceKeyboardNavigation();
    this.improveScreenReaderSupport();
    this.addFocusManagement();
  }

  addSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  enhanceKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  improveScreenReaderSupport() {
    // Add ARIA labels where missing
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        const img = button.querySelector('img');
        if (img && img.alt) {
          button.setAttribute('aria-label', img.alt);
        }
      }
    });

    // Enhance form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      if (input.placeholder && !input.labels.length) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });
  }

  addFocusManagement() {
    // Ensure focus is visible
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize Accessibility Enhancer
document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityEnhancer();
});