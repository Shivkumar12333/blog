// Reading Progress Indicator
class ReadingProgressManager {
  constructor() {
    this.createProgressBar();
    this.initializeProgress();
    this.createReadingStats();
  }

  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    progressBar.innerHTML = `
      <div class="progress-fill"></div>
      <div class="progress-info">
        <span class="progress-percentage">0%</span>
        <span class="reading-time">0 min read</span>
      </div>
    `;
    
    document.body.appendChild(progressBar);
  }

  initializeProgress() {
    const progressBar = document.querySelector('.reading-progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const readingTimeSpan = document.querySelector('.reading-time');

    // Calculate reading time
    const content = document.querySelector('#blog') || document.querySelector('main');
    if (content) {
      const text = content.textContent || content.innerText;
      const wordsPerMinute = 200; // Average reading speed
      const wordCount = text.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);
      readingTimeSpan.textContent = `${readingTime} min read`;
    }

    // Update progress on scroll
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      progressFill.style.width = `${Math.min(progress, 100)}%`;
      progressPercentage.textContent = `${Math.round(progress)}%`;
      
      // Show/hide progress bar based on scroll
      if (scrollTop > 100) {
        progressBar.classList.add('visible');
      } else {
        progressBar.classList.remove('visible');
      }
    });

    // Auto-hide after inactivity
    let hideTimeout;
    document.addEventListener('mousemove', () => {
      progressBar.classList.add('active');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        progressBar.classList.remove('active');
      }, 3000);
    });
  }

  createReadingStats() {
    // Save reading progress to localStorage
    const blogId = new URLSearchParams(window.location.search).get('id');
    if (blogId) {
      const readingStats = JSON.parse(localStorage.getItem('readingStats') || '{}');
      
      // Track reading time
      const startTime = Date.now();
      
      window.addEventListener('beforeunload', () => {
        const endTime = Date.now();
        const readingTime = Math.round((endTime - startTime) / 1000); // in seconds
        
        if (!readingStats[blogId]) {
          readingStats[blogId] = {
            visits: 0,
            totalTime: 0,
            lastVisit: null,
            completed: false
          };
        }
        
        readingStats[blogId].visits++;
        readingStats[blogId].totalTime += readingTime;
        readingStats[blogId].lastVisit = new Date().toISOString();
        
        // Mark as completed if scrolled more than 90%
        const scrollProgress = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollProgress > 90) {
          readingStats[blogId].completed = true;
        }
        
        localStorage.setItem('readingStats', JSON.stringify(readingStats));
      });
    }
  }
}

// Initialize reading progress
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('blog.html')) {
    new ReadingProgressManager();
  }
});
