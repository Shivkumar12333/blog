// Mobile Navigation and Responsive Functionality

class MobileNavigation {
  constructor() {
    this.init();
  }

  init() {
    this.createMobileMenuToggle();
    this.setupEventListeners();
    this.handleResize();
  }

  createMobileMenuToggle() {
    // Check if toggle already exists
    if (document.querySelector('.mobile-menu-toggle')) return;

    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.setAttribute('aria-label', 'Toggle mobile menu');
    toggle.innerHTML = `
      <span class="hamburger-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;

    // Add to header
    const header = document.querySelector('header');
    if (header) {
      header.appendChild(toggle);
    }
  }

  setupEventListeners() {
    // Mobile menu toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-menu-toggle')) {
        this.toggleMobileMenu();
      }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const navMenu = document.querySelector('.nav-menu');
      const toggle = document.querySelector('.mobile-menu-toggle');
      
      if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !toggle.contains(e.target)) {
          this.closeMobileMenu();
        }
      }
    });

    // Close mobile menu when clicking on a link
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-menu a')) {
        this.closeMobileMenu();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && toggle) {
      navMenu.classList.toggle('active');
      toggle.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu && toggle) {
      navMenu.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  handleResize() {
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }
}

// Touch gesture handler for mobile
class TouchHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupSwipeGestures();
    this.setupTouchOptimizations();
  }

  setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      this.handleSwipe(startX, startY, endX, endY);
    });
  }

  handleSwipe(startX, startY, endX, endY) {
    const threshold = 50;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) {
        // Swipe right - close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && navMenu.classList.contains('active')) {
          window.mobileNav.closeMobileMenu();
        }
      } else if (deltaX < -threshold) {
        // Swipe left - could be used for other actions
      }
    }
  }

  setupTouchOptimizations() {
    // Improve touch performance
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  }
}

// Viewport handler for responsive design
class ViewportHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setViewportHeight();
    this.setupEventListeners();
  }

  setViewportHeight() {
    // Fix for mobile viewport height issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.setViewportHeight();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.setViewportHeight();
      }, 100);
    });
  }
}

// Performance optimizations for mobile
class MobileOptimizations {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeImages();
    this.optimizeAnimations();
    this.setupLazyLoading();
  }

  optimizeImages() {
    // Add loading="lazy" to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  optimizeAnimations() {
    // Reduce animations on mobile devices
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Reduce animation duration
      const style = document.createElement('style');
      style.textContent = `
        * {
          animation-duration: 0.3s !important;
          transition-duration: 0.3s !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupLazyLoading() {
    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.classList.add('in-view');
          observer.unobserve(element);
        }
      });
    });

    // Observe elements with lazy loading
    const lazyElements = document.querySelectorAll('.lazy-load');
    lazyElements.forEach(el => observer.observe(el));
  }
}

// Initialize mobile functionality
document.addEventListener('DOMContentLoaded', () => {
  // Initialize mobile navigation
  window.mobileNav = new MobileNavigation();
  
  // Initialize touch handler
  window.touchHandler = new TouchHandler();
  
  // Initialize viewport handler
  window.viewportHandler = new ViewportHandler();
  
  // Initialize mobile optimizations
  window.mobileOptimizations = new MobileOptimizations();
  
  // Register service worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.log('❌ Service Worker registration failed:', error);
        });
    });
  }
  
  // Check if app can be installed
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button
    showInstallButton();
  });
  
  function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.innerHTML = `
      <i class="fas fa-download"></i>
      Install App
    `;
    installBtn.style.cssText = `
      position: fixed;
      bottom: 5rem;
      left: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      border-radius: 25px;
      font-size: 0.9rem;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            installBtn.remove();
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
      }
    });
    
    document.body.appendChild(installBtn);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (installBtn.parentNode) {
        installBtn.style.opacity = '0';
        installBtn.style.transform = 'translateY(20px)';
        setTimeout(() => installBtn.remove(), 300);
      }
    }, 10000);
  }
  
  console.log('✅ Mobile responsive functionality initialized');
});

// Export for use in other scripts
window.MobileUtils = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  
  // Show mobile-specific toast
  showMobileToast: (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 1001;
      font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Add necessary CSS for mobile menu toggle
const mobileCSS = `
  .mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
  }

  .hamburger-icon {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .hamburger-icon span {
    width: 25px;
    height: 3px;
    background: white;
    transition: all 0.3s ease;
  }

  .mobile-menu-toggle.active .hamburger-icon span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .mobile-menu-toggle.active .hamburger-icon span:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-toggle.active .hamburger-icon span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    .mobile-menu-toggle {
      display: block;
    }
  }
`;

// Add mobile CSS to head
const mobileStyle = document.createElement('style');
mobileStyle.textContent = mobileCSS;
document.head.appendChild(mobileStyle);
