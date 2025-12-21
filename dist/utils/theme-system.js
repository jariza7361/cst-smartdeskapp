// 5-Theme System: Light, Dark, Glass, macOS, Asurion Deep Purple
class ThemeSystem {
  constructor() {
    this.themes = ['light', 'dark', 'glass', 'macos', 'asurion'];
    this.currentTheme = localStorage.getItem('theme') || 'asurion';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.cycleTheme());
    }
  }

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];
    
    this.setTheme(nextTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific styles
    const themeStyles = {
      light: {
        '--bg-primary': '#ffffff',
        '--text-primary': '#333333',
        '--accent': '#007bff'
      },
      dark: {
        '--bg-primary': '#1a1a1a',
        '--text-primary': '#ffffff',
        '--accent': '#4dabf7'
      },
      glass: {
        '--bg-primary': 'rgba(255,255,255,0.1)',
        '--text-primary': '#333333',
        '--accent': '#00d4aa'
      },
      macos: {
        '--bg-primary': '#f5f5f7',
        '--text-primary': '#1d1d1f',
        '--accent': '#007aff'
      },
      asurion: {
        '--bg-primary': '#663399',
        '--text-primary': '#ffffff',
        '--accent': '#8A2BE2'
      }
    };
    
    const styles = themeStyles[theme] || themeStyles.asurion;
    Object.entries(styles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }
}

// Initialize Theme System
document.addEventListener('DOMContentLoaded', () => {
  new ThemeSystem();
});