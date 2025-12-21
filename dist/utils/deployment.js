// Deployment Health Check and Monitoring
class DeploymentMonitor {
  constructor() {
    this.healthChecks = [];
    this.init();
  }

  init() {
    this.runHealthChecks();
    this.setupErrorMonitoring();
    this.trackUsageMetrics();
  }

  runHealthChecks() {
    // Check critical resources
    this.checkAssets();
    this.checkFunctionality();
    this.reportHealth();
  }

  checkAssets() {
    const criticalAssets = [
      '/assets/app.css',
      '/app.js',
      '/utils/copilot.js'
    ];

    criticalAssets.forEach(asset => {
      fetch(asset)
        .then(response => {
          this.healthChecks.push({
            asset,
            status: response.ok ? 'OK' : 'FAILED',
            timestamp: new Date()
          });
        })
        .catch(() => {
          this.healthChecks.push({
            asset,
            status: 'FAILED',
            timestamp: new Date()
          });
        });
    });
  }

  checkFunctionality() {
    // Test core functionality
    const tests = [
      () => document.getElementById('copilotInput') !== null,
      () => document.querySelector('.dashboard-grid') !== null,
      () => document.querySelector('.sidebar') !== null
    ];

    tests.forEach((test, index) => {
      try {
        const result = test();
        this.healthChecks.push({
          test: `functionality-${index}`,
          status: result ? 'OK' : 'FAILED',
          timestamp: new Date()
        });
      } catch (error) {
        this.healthChecks.push({
          test: `functionality-${index}`,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date()
        });
      }
    });
  }

  setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      console.error('Application Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
  }

  trackUsageMetrics() {
    // Basic usage tracking
    const metrics = {
      loadTime: performance.now(),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      url: window.location.href
    };

    // Store metrics locally
    localStorage.setItem('app-metrics', JSON.stringify(metrics));
  }

  reportHealth() {
    setTimeout(() => {
      const failedChecks = this.healthChecks.filter(check => 
        check.status === 'FAILED' || check.status === 'ERROR'
      );

      if (failedChecks.length > 0) {
        console.warn('Health Check Failures:', failedChecks);
      } else {
        console.log('All health checks passed ✅');
      }
    }, 2000);
  }

  getHealthStatus() {
    return this.healthChecks;
  }
}

// Initialize Deployment Monitor
document.addEventListener('DOMContentLoaded', () => {
  new DeploymentMonitor();
});