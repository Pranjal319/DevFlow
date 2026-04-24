/**
 * BLOGGING WEB - Interactive Client Scripts
 * Theme toggle, live search, categories filter, bookmarks, toasts, reading progress
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initSearchAndFilters();
  initBookmarks();
  initNewsletter();
  initCardSpotlight();
  initCodeCopyButtons();
  initReadingProgress();
  initReactions();
});

/* ==========================================================================
   Theme Toggle (Dark / Light)
   ========================================================================== */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('blog_theme') || 'dark';

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('blog_theme', nextTheme);
      updateThemeIcons(nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, '🌓');
    });
  });
}

function updateThemeIcons(theme) {
  const themeIcons = document.querySelectorAll('.theme-icon');
  const themeLabels = document.querySelectorAll('.theme-label-text');
  themeIcons.forEach(icon => {
    icon.innerHTML = theme === 'dark' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  });
  themeLabels.forEach(lbl => {
    lbl.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  });
}

/* ==========================================================================
   Sidebar Drawer (Mobile & Desktop)
   ========================================================================== */
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const hamburger = document.querySelector('.hamburger-btn');
  const overlay = document.querySelector('.mobile-overlay');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', openSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Close sidebar on navigation on mobile
  const navLinks = sidebar.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });
}

/* ==========================================================================
   Live Search & Category Filter
   ========================================================================== */
function initSearchAndFilters() {
  const searchInput = document.querySelector('.search-input');
  const filterPills = document.querySelectorAll('.filter-pill');
  const articleCards = document.querySelectorAll('[data-article]');
  const noResultsCard = document.querySelector('.no-results-card');

  let activeCategory = 'all';
  let searchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    articleCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const excerpt = (card.querySelector('.card-excerpt')?.textContent || '').toLowerCase();

      const matchesCat = activeCategory === 'all' || category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        card.style.animation = 'fadeIn 0.3s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsCard) {
      noResultsCard.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Global keyboard shortcut: pressing '/' focuses search input
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });
}

/* ==========================================================================
   Bookmarks & Reading List
   ========================================================================== */
function initBookmarks() {
  const bookmarkButtons = document.querySelectorAll('.card-bookmark-btn');
  const savedCounterBadge = document.querySelector('.saved-counter');
  
  let savedArticles = JSON.parse(localStorage.getItem('blog_bookmarks') || '[]');

  function updateBadge() {
    if (savedCounterBadge) {
      savedCounterBadge.textContent = savedArticles.length;
    }
  }

  function syncBookmarkButtons() {
    bookmarkButtons.forEach(btn => {
      const id = btn.getAttribute('data-id');
      if (savedArticles.includes(id)) {
        btn.classList.add('saved');
        btn.setAttribute('aria-label', 'Remove from bookmarks');
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
      } else {
        btn.classList.remove('saved');
        btn.setAttribute('aria-label', 'Save article');
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
      }
    });
    updateBadge();
  }

  bookmarkButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title') || 'Article';

      if (savedArticles.includes(id)) {
        savedArticles = savedArticles.filter(item => item !== id);
        showToast(`Removed "${title}" from reading list`, '🔖');
      } else {
        savedArticles.push(id);
        showToast(`Saved "${title}" to your reading list!`, '⭐');
      }

      localStorage.setItem('blog_bookmarks', JSON.stringify(savedArticles));
      syncBookmarkButtons();
    });
  });

  syncBookmarkButtons();
}

/* ==========================================================================
   Newsletter Subscription Form
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById('subscribeFront');
  const emailInput = document.getElementById('subscribeFrontEmail');
  const feedback = document.getElementById('subscribeFrontFeedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (emailInput?.value || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      displayFeedback('Please enter your email address.', true);
      return;
    }

    if (!emailRegex.test(email)) {
      displayFeedback('Please enter a valid email address.', true);
      return;
    }

    // Success State
    displayFeedback('🎉 Welcome aboard! Please check your inbox to confirm your subscription.', false);
    form.reset();
    showToast('Subscribed to developer weekly!', '📬');
  });

  function displayFeedback(msg, isError) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = `newsletter-feedback ${isError ? 'error' : 'success'}`;
  }
}

/* ==========================================================================
   Mouse Spotlight Effect on Glass Cards
   ========================================================================== */
function initCardSpotlight() {
  const cards = document.querySelectorAll('.card-glass');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   Code Copy Button Handler
   ========================================================================== */
function initCodeCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-code-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const wrapper = btn.closest('.code-block-wrapper');
      const code = wrapper ? wrapper.querySelector('pre code')?.innerText : '';
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
        btn.style.color = '#10b981';
        btn.style.borderColor = '#10b981';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);

        showToast('Code copied to clipboard!', '📋');
      } catch (err) {
        showToast('Failed to copy code.', '⚠️');
      }
    });
  });
}

/* ==========================================================================
   Reading Progress Bar (for Article Pages)
   ========================================================================== */
function initReadingProgress() {
  const bar = document.querySelector('.reading-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  });
}

/* ==========================================================================
   Clap / Reactions Counter
   ========================================================================== */
function initReactions() {
  const clapBtn = document.querySelector('.clap-btn');
  if (!clapBtn) return;

  const countSpan = clapBtn.querySelector('.clap-count');
  let count = parseInt(localStorage.getItem('article_claps') || '42', 10);
  if (countSpan) countSpan.textContent = count;

  clapBtn.addEventListener('click', () => {
    count++;
    if (countSpan) countSpan.textContent = count;
    localStorage.setItem('article_claps', count.toString());
    clapBtn.style.transform = 'scale(1.15)';
    setTimeout(() => { clapBtn.style.transform = ''; }, 200);
    showToast(`You clapped for this article! (+1)`, '👏');
  });
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, icon = '✦') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
