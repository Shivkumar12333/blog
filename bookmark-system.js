// Bookmark System
class BookmarkManager {
  constructor() {
    this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    this.initializeBookmarks();
  }

  initializeBookmarks() {
    // Add bookmark buttons to blog cards
    this.addBookmarkButtons();
    
    // Create bookmarks page
    this.createBookmarksPage();
  }

  addBookmarkButtons() {
    // For index page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      // Override the existing renderBlogs function to include bookmark buttons
      const originalRenderBlogs = window.renderBlogs;
      if (originalRenderBlogs) {
        window.renderBlogs = (category) => {
          originalRenderBlogs(category);
          setTimeout(() => {
            this.addBookmarkButtonsToCards();
          }, 100);
        };
      }
    }
    
    // For individual blog page
    if (window.location.pathname.includes('blog.html')) {
      setTimeout(() => {
        this.addBookmarkButtonToBlogPage();
      }, 1000);
    }
  }

  addBookmarkButtonsToCards() {
    const blogCards = document.querySelectorAll('.modern-card');
    blogCards.forEach(card => {
      const readMoreLink = card.querySelector('a[href*="blog.html"]');
      if (readMoreLink && !card.querySelector('.bookmark-btn')) {
        const blogId = readMoreLink.href.split('id=')[1];
        const bookmarkBtn = this.createBookmarkButton(blogId);
        
        // Add to blog actions
        const blogActions = card.querySelector('.blog-actions');
        if (blogActions) {
          blogActions.appendChild(bookmarkBtn);
        }
      }
    });
  }

  addBookmarkButtonToBlogPage() {
    const blogId = new URLSearchParams(window.location.search).get('id');
    if (blogId) {
      const actionsDiv = document.querySelector('.flex.gap-4.mt-6');
      if (actionsDiv && !actionsDiv.querySelector('.bookmark-btn')) {
        const bookmarkBtn = this.createBookmarkButton(blogId, true);
        actionsDiv.appendChild(bookmarkBtn);
      }
    }
  }

  createBookmarkButton(blogId, isFullPage = false) {
    const isBookmarked = this.bookmarks.some(b => b.id === blogId);
    const button = document.createElement('button');
    button.className = `bookmark-btn ${isBookmarked ? 'bookmarked' : ''} ${isFullPage ? 'px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700' : 'blog-action'}`;
    button.innerHTML = isFullPage ? 
      `${isBookmarked ? '★' : '☆'} ${isBookmarked ? 'Bookmarked' : 'Bookmark'}` :
      `<svg class="w-4 h-4" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
      </svg>
      ${isBookmarked ? 'Saved' : 'Save'}`;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleBookmark(blogId, button);
    });
    
    return button;
  }

  async toggleBookmark(blogId, button) {
    try {
      const isBookmarked = this.bookmarks.some(b => b.id === blogId);
      
      if (isBookmarked) {
        // Remove bookmark
        this.bookmarks = this.bookmarks.filter(b => b.id !== blogId);
        button.classList.remove('bookmarked');
        button.innerHTML = button.classList.contains('blog-action') ?
          `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          Save` :
          '☆ Bookmark';
        
        this.showToast('Bookmark removed', 'info');
      } else {
        // Add bookmark
        const blogData = await this.fetchBlogData(blogId);
        if (blogData) {
          this.bookmarks.unshift({
            id: blogId,
            title: blogData.title,
            category: blogData.category,
            bookmarkedAt: new Date().toISOString(),
            ...blogData
          });
          
          button.classList.add('bookmarked');
          button.innerHTML = button.classList.contains('blog-action') ?
            `<svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            Saved` :
            '★ Bookmarked';
          
          this.showToast('Bookmark added', 'success');
        }
      }
      
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      this.showToast('Error updating bookmark', 'error');
    }
  }

  async fetchBlogData(blogId) {
    try {
      const doc = await firebase.firestore().collection('blogs').doc(blogId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    }
    return null;
  }

  createBookmarksPage() {
    // Add bookmarks navigation link
    const nav = document.querySelector('nav');
    if (nav && !nav.querySelector('.bookmarks-link')) {
      const bookmarksLink = document.createElement('a');
      bookmarksLink.href = '#bookmarks';
      bookmarksLink.className = 'bookmarks-link nav-link text-gray-300 hover:text-white transition-colors';
      bookmarksLink.textContent = `📚 Bookmarks (${this.bookmarks.length})`;
      bookmarksLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showBookmarksModal();
      });
      nav.appendChild(bookmarksLink);
    }
  }

  showBookmarksModal() {
    const modal = document.createElement('div');
    modal.className = 'bookmarks-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="text-2xl font-bold">Your Bookmarks</h2>
          <button class="close-btn" onclick="this.closest('.bookmarks-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          ${this.bookmarks.length === 0 ? 
            '<div class="empty-bookmarks"><p>No bookmarks yet. Start saving your favorite articles!</p></div>' :
            this.bookmarks.map(bookmark => this.createBookmarkCard(bookmark)).join('')
          }
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  createBookmarkCard(bookmark) {
    const bookmarkedAt = new Date(bookmark.bookmarkedAt).toLocaleDateString();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = bookmark.content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const snippet = plainText.substring(0, 100);
    
    return `
      <div class="bookmark-card">
        <div class="bookmark-header">
          <h3 class="bookmark-title">
            <a href="blog.html?id=${bookmark.id}">${bookmark.title}</a>
          </h3>
          <button class="remove-bookmark" onclick="window.bookmarkManager.removeBookmark('${bookmark.id}')">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="bookmark-meta">
          <span class="category">${bookmark.category}</span>
          <span class="bookmark-date">Saved: ${bookmarkedAt}</span>
        </div>
        <p class="bookmark-snippet">${snippet}...</p>
        <div class="bookmark-actions">
          <a href="blog.html?id=${bookmark.id}" class="read-bookmark">Read Article</a>
        </div>
      </div>
    `;
  }

  removeBookmark(blogId) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== blogId);
    localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    
    // Update bookmark buttons
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
      if (btn.onclick && btn.onclick.toString().includes(blogId)) {
        btn.classList.remove('bookmarked');
        btn.innerHTML = btn.classList.contains('blog-action') ?
          `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          Save` :
          '☆ Bookmark';
      }
    });
    
    // Update bookmarks count
    const bookmarksLink = document.querySelector('.bookmarks-link');
    if (bookmarksLink) {
      bookmarksLink.textContent = `📚 Bookmarks (${this.bookmarks.length})`;
    }
    
    // Refresh modal if open
    const modal = document.querySelector('.bookmarks-modal');
    if (modal) {
      modal.remove();
      this.showBookmarksModal();
    }
    
    this.showToast('Bookmark removed', 'info');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize bookmark manager
document.addEventListener('DOMContentLoaded', () => {
  window.bookmarkManager = new BookmarkManager();
});
