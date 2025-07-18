// Blog Statistics Dashboard
class StatsManager {
  constructor() {
    this.stats = JSON.parse(localStorage.getItem('blogStats') || '{}');
    this.initializeStats();
  }

  initializeStats() {
    this.trackPageView();
    this.createStatsWidget();
    this.updateStats();
  }

  trackPageView() {
    const currentPage = window.location.pathname;
    const timestamp = new Date().toISOString();
    
    // Track overall page views
    if (!this.stats.pageViews) {
      this.stats.pageViews = {};
    }
    
    if (!this.stats.pageViews[currentPage]) {
      this.stats.pageViews[currentPage] = [];
    }
    
    this.stats.pageViews[currentPage].push(timestamp);
    
    // Track specific blog views
    if (currentPage.includes('blog.html')) {
      const blogId = new URLSearchParams(window.location.search).get('id');
      if (blogId) {
        if (!this.stats.blogViews) {
          this.stats.blogViews = {};
        }
        
        if (!this.stats.blogViews[blogId]) {
          this.stats.blogViews[blogId] = [];
        }
        
        this.stats.blogViews[blogId].push(timestamp);
      }
    }
    
    // Track session data
    if (!this.stats.sessions) {
      this.stats.sessions = [];
    }
    
    const sessionId = sessionStorage.getItem('sessionId') || this.generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
    
    const existingSession = this.stats.sessions.find(s => s.id === sessionId);
    if (existingSession) {
      existingSession.pages.push({
        path: currentPage,
        timestamp: timestamp
      });
    } else {
      this.stats.sessions.push({
        id: sessionId,
        startTime: timestamp,
        pages: [{
          path: currentPage,
          timestamp: timestamp
        }]
      });
    }
    
    // Track likes
    if (!this.stats.likes) {
      this.stats.likes = {};
    }
    
    this.saveStats();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  createStatsWidget() {
    // Only show on index page
    if (!(window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
      return;
    }

    const statsWidget = document.createElement('div');
    statsWidget.className = 'stats-widget collapsed';
    statsWidget.innerHTML = `
      <div class="stats-header">
        <h3 class="stats-title">📊 Blog Statistics</h3>
        <button class="stats-toggle" onclick="this.closest('.stats-widget').classList.toggle('collapsed')">
          <span class="collapsed-icon">📊</span>
          <svg class="expanded-icon w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <div class="stats-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number" id="totalViews">-</div>
            <div class="stat-label">Total Views</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="totalSessions">-</div>
            <div class="stat-label">Sessions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="totalBlogs">-</div>
            <div class="stat-label">Total Blogs</div>
          </div>
          <div class="stat-card">
            <div class="stat-number" id="totalLikes">-</div>
            <div class="stat-label">Total Likes</div>
          </div>
        </div>
        <div class="stats-charts">
          <div class="chart-container">
            <h4>Most Viewed Posts</h4>
            <div class="chart-content" id="topPosts"></div>
          </div>
          <div class="chart-container">
            <h4>Daily Activity</h4>
            <div class="chart-content" id="dailyActivity"></div>
          </div>
        </div>
      </div>
    `;

    // Insert after hero section
    const heroSection = document.querySelector('.hero-banner');
    if (heroSection) {
      heroSection.insertAdjacentElement('afterend', statsWidget);
    }

    this.updateStats();
  }

  updateStats() {
    const totalViews = this.getTotalViews();
    const totalSessions = this.stats.sessions ? this.stats.sessions.length : 0;
    const totalBlogs = this.getBlogCount();
    const totalLikes = this.getTotalLikes();

    // Update stats display
    const totalViewsEl = document.getElementById('totalViews');
    const totalSessionsEl = document.getElementById('totalSessions');
    const totalBlogsEl = document.getElementById('totalBlogs');
    const totalLikesEl = document.getElementById('totalLikes');

    if (totalViewsEl) totalViewsEl.textContent = totalViews;
    if (totalSessionsEl) totalSessionsEl.textContent = totalSessions;
    if (totalBlogsEl) totalBlogsEl.textContent = totalBlogs;
    if (totalLikesEl) totalLikesEl.textContent = totalLikes;

    // Update charts
    this.updateTopPosts();
    this.updateDailyActivity();
  }

  getTotalViews() {
    if (!this.stats.pageViews) return 0;
    let total = 0;
    Object.values(this.stats.pageViews).forEach(views => {
      total += views.length;
    });
    return total;
  }

  getBlogCount() {
    // This would ideally come from your Firebase data
    // For now, return a placeholder
    return Object.keys(this.stats.blogViews || {}).length;
  }

  getTotalLikes() {
    if (!this.stats.likes) return 0;
    return Object.values(this.stats.likes).reduce((total, likes) => total + likes, 0);
  }

  updateTopPosts() {
    const topPostsEl = document.getElementById('topPosts');
    if (!topPostsEl || !this.stats.blogViews) return;

    const blogViews = Object.entries(this.stats.blogViews)
      .map(([id, views]) => ({ id, views: views.length }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    topPostsEl.innerHTML = blogViews.map(blog => `
      <div class="chart-item">
        <span class="chart-label">Blog ${blog.id}</span>
        <div class="chart-bar">
          <div class="chart-fill" style="width: ${(blog.views / Math.max(...blogViews.map(b => b.views))) * 100}%"></div>
        </div>
        <span class="chart-value">${blog.views}</span>
      </div>
    `).join('');
  }

  updateDailyActivity() {
    const dailyActivityEl = document.getElementById('dailyActivity');
    if (!dailyActivityEl || !this.stats.pageViews) return;

    const dailyViews = {};
    Object.values(this.stats.pageViews).forEach(views => {
      views.forEach(timestamp => {
        const date = new Date(timestamp).toDateString();
        dailyViews[date] = (dailyViews[date] || 0) + 1;
      });
    });

    const sortedDays = Object.entries(dailyViews)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-7); // Last 7 days

    const maxViews = Math.max(...sortedDays.map(([, views]) => views));

    dailyActivityEl.innerHTML = sortedDays.map(([date, views]) => `
      <div class="chart-item">
        <span class="chart-label">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <div class="chart-bar">
          <div class="chart-fill" style="width: ${(views / maxViews) * 100}%"></div>
        </div>
        <span class="chart-value">${views}</span>
      </div>
    `).join('');
  }

  trackLike(blogId) {
    if (!this.stats.likes) {
      this.stats.likes = {};
    }
    
    this.stats.likes[blogId] = (this.stats.likes[blogId] || 0) + 1;
    this.saveStats();
    this.updateStats();
  }

  saveStats() {
    localStorage.setItem('blogStats', JSON.stringify(this.stats));
  }

  // Export stats for analysis
  exportStats() {
    const dataStr = JSON.stringify(this.stats, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'blog-stats-' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Reset stats (for testing)
  resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      this.stats = {};
      this.saveStats();
      this.updateStats();
    }
  }
}

// Initialize stats manager
document.addEventListener('DOMContentLoaded', () => {
  window.statsManager = new StatsManager();
});
