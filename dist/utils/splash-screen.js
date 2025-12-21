// Asurion Deep Purple Splash Screen
class SplashScreen {
  constructor() {
    this.init();
  }

  init() {
    this.createSplashScreen();
    this.showSplash();
  }

  createSplashScreen() {
    // Splash screen is created in HTML, this handles the logic
    const splash = document.getElementById('splash-screen');
    if (!splash) return;
    
    // Add professional messaging
    const content = splash.querySelector('.splash-content');
    if (content) {
      const tagline = content.querySelector('p');
      if (tagline) {
        tagline.innerHTML = 'White Glove Service &bull; Gold Standard Support';
      }
    }
  }

  showSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;
    
    // Show splash for 5 seconds for complete message absorption
    setTimeout(() => {
      this.hideSplash();
    }, 5000);
  }

  hideSplash() {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;
    
    splash.classList.add('fade-out');
    
    setTimeout(() => {
      splash.remove();
      this.onSplashComplete();
    }, 500);
  }

  onSplashComplete() {
    // Initialize other systems after splash
    document.body.classList.add('app-loaded');
    
    // Trigger custom event
    const event = new CustomEvent('splashComplete');
    document.dispatchEvent(event);
  }
}

// Initialize Splash Screen
document.addEventListener('DOMContentLoaded', () => {
  new SplashScreen();
});