(function () {
  const body = document.body;

  function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    let current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initSearch() {
    const panel = document.getElementById('searchPanel');
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    const openers = Array.from(document.querySelectorAll('.search-toggle'));
    const closers = Array.from(document.querySelectorAll('[data-search-close]'));
    const movies = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];

    if (!panel || !input || !results) {
      return;
    }

    function openPanel() {
      panel.hidden = false;
      body.classList.add('search-open');
      window.setTimeout(function () {
        input.focus();
      }, 30);
    }

    function closePanel() {
      panel.hidden = true;
      body.classList.remove('search-open');
      input.value = '';
      results.innerHTML = '';
    }

    function render(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        results.innerHTML = '<div class="search-empty">输入关键词即可搜索片库内容。</div>';
        return;
      }

      const matched = movies.filter(function (movie) {
        return movie.search.toLowerCase().includes(q);
      }).slice(0, 18);

      if (matched.length === 0) {
        results.innerHTML = '<div class="search-empty">未找到相关影片。</div>';
        return;
      }

      results.innerHTML = matched.map(function (movie) {
        return '<a class="search-result-item" href="' + movie.link + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
          '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span></span>' +
          '</a>';
      }).join('');
    }

    openers.forEach(function (opener) {
      opener.addEventListener('click', openPanel);
    });

    closers.forEach(function (closer) {
      closer.addEventListener('click', closePanel);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        closePanel();
      }
    });
  }

  function initLocalFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      const section = panel.closest('.content-section');
      const input = panel.querySelector('[data-local-search]');
      const buttons = Array.from(panel.querySelectorAll('[data-filter]'));
      const cards = section ? Array.from(section.querySelectorAll('[data-card]')) : [];
      let active = '';

      function apply() {
        const q = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          const haystack = (card.getAttribute('data-search') || '').toLowerCase();
          const matchText = !q || haystack.includes(q);
          const matchFilter = !active || haystack.includes(active.toLowerCase());
          card.hidden = !(matchText && matchFilter);
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = button.getAttribute('data-filter') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearch();
    initLocalFilters();
  });
})();
