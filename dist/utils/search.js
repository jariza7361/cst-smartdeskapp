// Enhanced Search with Autocomplete
class SearchSystem {
  constructor() {
    this.searchItems = [
      'Verizon', 'AT&T', 'Cricket', 'Bell', 'TELUS', 'Koodo', 'Virgin',
      'Liberty', 'Consumer Cellular', 'US Cellular', 'Optimum', 'Cox', 'Samsung',
      'Copilot', 'SmartDrop OCR', 'RPFR', 'Find My iPhone', 'Denials',
      'Affidavits', 'BYOD', 'Tests', 'Settings', 'Escalation', 'Knowledge Base'
    ];
    this.init();
  }

  init() {
    const searchInput = document.getElementById('searchInput');
    const searchSuggest = document.getElementById('searchSuggest');
    
    if (!searchInput || !searchSuggest) return;
    
    searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value, searchSuggest);
    });
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSuggestions(searchSuggest);
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#topSearch')) {
        this.clearSuggestions(searchSuggest);
      }
    });
  }

  handleSearch(query, suggestContainer) {
    if (!query.trim()) {
      this.clearSuggestions(suggestContainer);
      return;
    }
    
    const matches = this.searchItems.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    this.displaySuggestions(matches, suggestContainer, query);
  }

  displaySuggestions(matches, container, query) {
    container.innerHTML = '';
    
    if (matches.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    matches.forEach(match => {
      const suggestion = document.createElement('div');
      suggestion.className = 'search-suggestion';
      suggestion.textContent = match;
      suggestion.addEventListener('click', () => {
        this.selectSuggestion(match);
        this.clearSuggestions(container);
      });
      container.appendChild(suggestion);
    });
    
    container.style.display = 'block';
  }

  selectSuggestion(item) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = item;
    }
    
    // Trigger search action
    console.log('Selected:', item);
  }

  clearSuggestions(container) {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

// Initialize Search System
document.addEventListener('DOMContentLoaded', () => {
  new SearchSystem();
});