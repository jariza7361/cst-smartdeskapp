// Security Enhancement System
class SecurityEnhancements {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTimeout = 25 * 60 * 1000; // 25 minutes
    this.activityLog = [];
    this.lastActivity = Date.now();
    this.init();
  }

  init() {
    this.setupSessionMonitoring();
    this.setupActivityLogging();
    this.setupSecureStorage();
    this.initAuditTrail();
  }

  setupSessionMonitoring() {
    // Track user activity
    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });

    // Set up session timeout warnings
    this.startSessionTimer();
  }

  updateLastActivity() {
    this.lastActivity = Date.now();
  }

  startSessionTimer() {
    // Warning timer
    setTimeout(() => {
      if (Date.now() - this.lastActivity >= this.warningTimeout) {
        this.showSessionWarning();
      }
    }, this.warningTimeout);

    // Timeout timer
    setTimeout(() => {
      if (Date.now() - this.lastActivity >= this.sessionTimeout) {
        this.handleSessionTimeout();
      }
    }, this.sessionTimeout);
  }

  showSessionWarning() {
    const warning = document.createElement('div');
    warning.className = 'session-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <h3>Session Timeout Warning</h3>
        <p>Your session will expire in 5 minutes due to inactivity.</p>
        <div class="warning-actions">
          <button id="extendSession" class="btn btn-primary">Extend Session</button>
          <button id="logoutNow" class="btn btn-secondary">Logout Now</button>
        </div>
      </div>
    `;

    document.body.appendChild(warning);

    // Handle user response
    document.getElementById('extendSession').addEventListener('click', () => {
      this.extendSession();
      warning.remove();
    });

    document.getElementById('logoutNow').addEventListener('click', () => {
      this.handleSessionTimeout();
    });
  }

  extendSession() {
    this.lastActivity = Date.now();
    this.logActivity('session_extended', 'User extended session');
    this.startSessionTimer();
  }

  handleSessionTimeout() {
    this.logActivity('session_timeout', 'Session expired due to inactivity');
    
    // Clear sensitive data
    this.clearSecureStorage();
    
    // Show timeout message
    this.showTimeoutMessage();
    
    // Redirect to login (simulated)
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  showTimeoutMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'timeout-overlay';
    overlay.innerHTML = `
      <div class="timeout-message">
        <h2>Session Expired</h2>
        <p>Your session has expired for security reasons.</p>
        <p>You will be redirected to the login page.</p>
        <div class="loading-spinner"></div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  setupActivityLogging() {
    // Log important user activities
    const loggedEvents = [
      'copilot_query',
      'file_upload',
      'case_access',
      'escalation_created',
      'data_export'
    ];

    loggedEvents.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.logActivity(eventType, event.detail);
      });
    });
  }

  logActivity(action, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: 'jesus.ariza',
      sessionId: this.getSessionId(),
      ipAddress: '192.168.1.100', // Simulated
      userAgent: navigator.userAgent.substring(0, 100)
    };

    this.activityLog.push(logEntry);
    
    // Keep only last 1000 entries
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }

    // In production, send to secure logging service
    console.log('Security Log:', logEntry);
  }

  setupSecureStorage() {
    // Encrypt sensitive data before storing
    this.secureStorage = {
      set: (key, value) => {
        const encrypted = this.encrypt(JSON.stringify(value));
        sessionStorage.setItem(`secure_${key}`, encrypted);
      },
      get: (key) => {
        const encrypted = sessionStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;
        try {
          const decrypted = this.decrypt(encrypted);
          return JSON.parse(decrypted);
        } catch (error) {
          console.error('Failed to decrypt data:', error);
          return null;
        }
      },
      remove: (key) => {
        sessionStorage.removeItem(`secure_${key}`);
      }
    };
  }

  encrypt(text) {
    // Simple encryption for demo (use proper encryption in production)
    return btoa(text.split('').reverse().join(''));
  }

  decrypt(encrypted) {
    // Simple decryption for demo
    return atob(encrypted).split('').reverse().join('');
  }

  clearSecureStorage() {
    // Clear all secure storage items
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('secure_')) {
        sessionStorage.removeItem(key);
      }
    }
  }

  initAuditTrail() {
    // Initialize audit trail for compliance
    this.auditTrail = {
      sessionStart: new Date().toISOString(),
      userId: 'jesus.ariza',
      department: 'CST',
      accessLevel: 'standard',
      activities: []
    };

    this.logActivity('session_start', 'User session initiated');
  }

  getSecurityStatus() {
    const now = Date.now();
    const timeRemaining = this.sessionTimeout - (now - this.lastActivity);
    
    return {
      sessionActive: timeRemaining > 0,
      timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)),
      lastActivity: new Date(this.lastActivity).toLocaleString(),
      activitiesLogged: this.activityLog.length,
      secureStorageItems: this.getSecureStorageCount()
    };
  }

  getSecureStorageCount() {
    let count = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('secure_')) {
        count++;
      }
    }
    return count;
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  exportAuditLog() {
    return {
      auditTrail: this.auditTrail,
      activityLog: this.activityLog.slice(-100), // Last 100 activities
      securityStatus: this.getSecurityStatus(),
      exportTimestamp: new Date().toISOString()
    };
  }
}

// Initialize security enhancements
document.addEventListener('DOMContentLoaded', () => {
  window.securityEnhancements = new SecurityEnhancements();
});