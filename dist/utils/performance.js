// Performance Monitoring and Optimization
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    this.measureLoadTime();
    this.optimizeImages();
    this.enableLazyLoading();
  }

  measureLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.metrics.loadTime = loadTime;
      
      if (loadTime > 2000) {
        console.warn('Page load time exceeds 2 seconds:', loadTime);
      }
    });
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }

  enableLazyLoading() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// Initialize Performance Monitor
document.addEventListener('DOMContentLoaded', () => {
  new PerformanceMonitor();
});