// Advanced Search System
class SearchManager {
  constructor() {
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    this.createSearchInterface();
    this.initializeSearch();
  }

  createSearchInterface() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <div class="search-wrapper">
        <div class="search-input-wrapper">
          <input type="text" id="advancedSearch" class="search-input" placeholder="Search blogs by title, content, or category..." />
          <button class="search-btn" id="searchBtn">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="search-filters">
          <select id="searchCategory" class="filter-select">
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="news Editorial">News Editorial</option>
            <option value="Business">Business</option>
            <option value="Health">Health</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Sports">Sports</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Education">Education</option>
            <option value="Science">Science</option>
            <option value="Art">Art</option>
            <option value="Other">Other</option>
          </select>
          <select id="searchSort" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="relevant">Most Relevant</option>
          </select>
        </div>
        <div class="search-results" id="searchResults"></div>
        <div class="search-history" id="searchHistory"></div>
      </div>
    `;

    // Insert after hero section
    const heroSection = document.querySelector('.hero-banner');
    if (heroSection) {
      heroSection.insertAdjacentElement('afterend', searchContainer);
    }
  }

  initializeSearch() {
    const searchInput = document.getElementById('advancedSearch');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('searchCategory');
    const sortFilter = document.getElementById('searchSort');

    // Real-time search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    });

    // Search button click
    searchBtn.addEventListener('click', () => {
      this.performSearch();
    });

    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });

    // Filter changes
    categoryFilter.addEventListener('change', () => {
      this.performSearch();
    });

    sortFilter.addEventListener('change', () => {
      this.performSearch();
    });

    // Show search history
    this.displaySearchHistory();
  }

  async performSearch() {
    const query = document.getElementById('advancedSearch').value.trim();
    const category = document.getElementById('searchCategory').value;
    const sort = document.getElementById('searchSort').value;
    const resultsContainer = document.getElementById('searchResults');

    if (!query && !category) {
      resultsContainer.innerHTML = '';
      return;
    }

    // Add to search history
    if (query && !this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10 searches
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
      this.displaySearchHistory();
    }

    try {
      resultsContainer.innerHTML = '<div class="search-loading">🔍 Searching...</div>';
      
      // Get all blogs from Firebase
      const snapshot = await firebase.firestore().collection('blogs').get();
      let blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter blogs
      let filteredBlogs = blogs.filter(blog => {
        const matchesQuery = !query || 
          blog.title.toLowerCase().includes(query.toLowerCase()) ||
          blog.content.toLowerCase().includes(query.toLowerCase()) ||
          blog.category.toLowerCase().includes(query.toLowerCase());
        
        const matchesCategory = !category || blog.category === category;
        
        return matchesQuery && matchesCategory;
      });

      // Sort blogs
      filteredBlogs.sort((a, b) => {
        switch (sort) {
          case 'oldest':
            return a.createdAt?.toDate() - b.createdAt?.toDate();
          case 'popular':
            return (b.likes || 0) - (a.likes || 0);
          case 'relevant':
            // Simple relevance scoring
            const aScore = this.calculateRelevanceScore(a, query);
            const bScore = this.calculateRelevanceScore(b, query);
            return bScore - aScore;
          default: // newest
            return b.createdAt?.toDate() - a.createdAt?.toDate();
        }
      });

      this.displaySearchResults(filteredBlogs, query);
    } catch (error) {
      console.error('Search error:', error);
      resultsContainer.innerHTML = '<div class="search-error">❌ Search failed. Please try again.</div>';
    }
  }

  calculateRelevanceScore(blog, query) {
    if (!query) return 0;
    
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Title matches get higher score
    if (blog.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Category matches
    if (blog.category.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Content matches
    const contentMatches = (blog.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;
    
    // Popularity boost
    score += (blog.likes || 0) * 0.1;
    
    return score;
  }

  displaySearchResults(blogs, query) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (blogs.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">No results found</h3>
          <p class="text-gray-500">Try different keywords or adjust your filters</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div class="search-results-header">
        <h3 class="text-lg font-semibold">Found ${blogs.length} result${blogs.length !== 1 ? 's' : ''}</h3>
        <button class="clear-search" onclick="this.closest('.search-container').querySelector('.search-input').value = ''; this.closest('.search-container').querySelector('.search-results').innerHTML = '';">
          Clear Search
        </button>
      </div>
      <div class="search-results-grid">
        ${blogs.map(blog => this.createSearchResultCard(blog, query)).join('')}
      </div>
    `;
  }

  createSearchResultCard(blog, query) {
    const createdAt = blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : "Unknown date";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = blog.content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    let snippet = plainText.substring(0, 150);
    
    // Highlight search terms
    if (query) {
      const regex = new RegExp(`(${query})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    }

    return `
      <div class="search-result-card">
        <div class="search-result-header">
          <h4 class="search-result-title">
            <a href="blog.html?id=${blog.id}">${blog.title}</a>
          </h4>
          <div class="search-result-meta">
            <span class="category">${blog.category}</span>
            <span class="date">${createdAt}</span>
          </div>
        </div>
        <p class="search-result-snippet">${snippet}...</p>
        <div class="search-result-actions">
          <span class="likes">❤️ ${blog.likes || 0}</span>
          <a href="blog.html?id=${blog.id}" class="read-more">Read More →</a>
        </div>
      </div>
    `;
  }

  displaySearchHistory() {
    const historyContainer = document.getElementById('searchHistory');
    
    if (this.searchHistory.length === 0) {
      historyContainer.innerHTML = '';
      return;
    }

    historyContainer.innerHTML = `
      <div class="search-history-header">
        <h4>Recent Searches</h4>
        <button onclick="localStorage.removeItem('searchHistory'); this.closest('.search-history').innerHTML = '';">
          Clear History
        </button>
      </div>
      <div class="search-history-items">
        ${this.searchHistory.map(term => `
          <button class="search-history-item" onclick="document.getElementById('advancedSearch').value = '${term}'; window.searchManager.performSearch();">
            ${term}
          </button>
        `).join('')}
      </div>
    `;
  }
}

// Initialize search manager
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    window.searchManager = new SearchManager();
  }
});
