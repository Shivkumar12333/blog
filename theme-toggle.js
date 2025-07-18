// Theme Toggle System
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.initializeTheme();
    this.createToggleButton();
  }

  initializeTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.applyTheme();
  }

  applyTheme() {
    const root = document.documentElement;
    
    if (this.currentTheme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--accent-bg', '#f1f5f9');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    } else {
      root.style.setProperty('--bg-primary', '#0a0a0a');
      root.style.setProperty('--bg-secondary', '#111111');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a0a0a0');
      root.style.setProperty('--border-color', '#333333');
      root.style.setProperty('--accent-bg', '#1a1a1a');
      root.style.setProperty('--card-bg', '#111111');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    }
  }

  createToggleButton() {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.innerHTML = `
      <div class="theme-toggle-inner">
        <span class="theme-icon sun">☀️</span>
        <span class="theme-icon moon">🌙</span>
      </div>
    `;
    
    toggleButton.addEventListener('click', () => this.toggleTheme());
    
    // Add to header
    const header = document.querySelector('header .header-content');
    if (header) {
      header.appendChild(toggleButton);
    }
    
    this.updateToggleButton();
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    this.initializeTheme();
    this.updateToggleButton();
    
    // Smooth transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  updateToggleButton() {
    const toggleButton = document.querySelector('.theme-toggle');
    if (toggleButton) {
      toggleButton.setAttribute('data-theme', this.currentTheme);
    }
  }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
});
