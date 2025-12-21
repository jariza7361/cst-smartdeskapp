// Advanced Analytics System
class AdvancedAnalytics {
  constructor() {
    this.usageData = new Map();
    this.patterns = [];
    this.recommendations = [];
    this.init();
  }

  init() {
    this.startUsageTracking();
    this.loadHistoricalData();
    this.generateRecommendations();
  }

  startUsageTracking() {
    // Track user interactions
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', event.target);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        this.trackInteraction('keyboard', event.target);
      }
    });

    // Track time spent on different sections
    this.trackTimeSpent();
  }

  trackInteraction(type, element) {
    const timestamp = Date.now();
    const elementInfo = {
      tag: element.tagName,
      class: element.className,
      id: element.id,
      text: element.textContent?.substring(0, 50)
    };

    const interaction = {
      type,
      element: elementInfo,
      timestamp,
      sessionId: this.getSessionId()
    };

    this.recordInteraction(interaction);
  }

  trackTimeSpent() {
    let startTime = Date.now();
    let currentSection = 'dashboard';

    // Track section changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
          const endTime = Date.now();
          const timeSpent = endTime - startTime;
          
          this.recordTimeSpent(currentSection, timeSpent);
          
          currentSection = mutation.target.dataset.tab || 'unknown';
          startTime = endTime;
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-selected']
    });
  }

  recordInteraction(interaction) {
    const key = `${interaction.type}_${interaction.element.tag}`;
    const current = this.usageData.get(key) || { count: 0, lastUsed: null };
    
    this.usageData.set(key, {
      count: current.count + 1,
      lastUsed: interaction.timestamp,
      element: interaction.element
    });
  }

  recordTimeSpent(section, duration) {
    const key = `time_${section}`;
    const current = this.usageData.get(key) || { totalTime: 0, sessions: 0 };
    
    this.usageData.set(key, {
      totalTime: current.totalTime + duration,
      sessions: current.sessions + 1,
      averageTime: (current.totalTime + duration) / (current.sessions + 1)
    });
  }

  loadHistoricalData() {
    // Simulate historical data
    this.historicalData = {
      dailyUsage: [
        { date: '2025-01-20', interactions: 245, timeSpent: 28800 },
        { date: '2025-01-21', interactions: 198, timeSpent: 25200 },
        { date: '2025-01-22', interactions: 267, timeSpent: 30600 }
      ],
      topFeatures: [
        { feature: 'Copilot', usage: 45 },
        { feature: 'Carrier Search', usage: 38 },
        { feature: 'SmartDrop OCR', usage: 22 },
        { feature: 'Performance Metrics', usage: 18 }
      ]
    };
  }

  generateRecommendations() {
    this.recommendations = [
      {
        type: 'efficiency',
        title: 'Keyboard Shortcuts',
        description: 'Use Ctrl+K to quickly access search. This could save you 15 seconds per search.',
        impact: 'high',
        category: 'productivity'
      },
      {
        type: 'workflow',
        title: 'Batch Processing',
        description: 'Process similar cases together to improve efficiency by 23%.',
        impact: 'medium',
        category: 'workflow'
      },
      {
        type: 'feature',
        title: 'Auto-fill Templates',
        description: 'Enable auto-fill for common responses to reduce typing time.',
        impact: 'high',
        category: 'automation'
      }
    ];
  }

  getUsagePatterns() {
    const patterns = [];
    
    // Analyze most used features
    const sortedUsage = Array.from(this.usageData.entries())
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);

    patterns.push({
      type: 'most_used',
      data: sortedUsage.map(([key, data]) => ({
        feature: key,
        count: data.count,
        lastUsed: new Date(data.lastUsed).toLocaleString()
      }))
    });

    return patterns;
  }

  getPredictiveText(context) {
    // Simple predictive text based on usage patterns
    const suggestions = [
      'Thank you for contacting Asurion',
      'I understand your concern',
      'Let me check your policy details',
      'I will escalate this to our specialized team'
    ];

    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(context.toLowerCase())
    );
  }

  getEfficiencyScore() {
    const totalInteractions = Array.from(this.usageData.values())
      .reduce((sum, data) => sum + (data.count || 0), 0);
    
    const totalTime = Array.from(this.usageData.values())
      .reduce((sum, data) => sum + (data.totalTime || 0), 0);

    // Calculate efficiency score (interactions per minute)
    const efficiencyScore = totalTime > 0 ? (totalInteractions / (totalTime / 60000)) : 0;
    
    return {
      score: Math.round(efficiencyScore * 100) / 100,
      totalInteractions,
      totalTime: Math.round(totalTime / 1000), // Convert to seconds
      recommendations: this.recommendations
    };
  }

  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
  }

  exportAnalytics() {
    return {
      usageData: Object.fromEntries(this.usageData),
      patterns: this.patterns,
      recommendations: this.recommendations,
      historicalData: this.historicalData,
      efficiencyScore: this.getEfficiencyScore(),
      exportDate: new Date().toISOString()
    };
  }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
  window.advancedAnalytics = new AdvancedAnalytics();
});