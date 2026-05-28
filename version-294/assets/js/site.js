(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var searchPanel = document.querySelector('[data-search-panel]');
  var searchInput = document.getElementById('site-search-input');
  var searchResults = document.getElementById('site-search-results');
  var activeFilter = 'all';

  function openSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden', 'false');
    renderSearch();
    setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 40);
  }

  function closeSearch() {
    if (!searchPanel) {
      return;
    }
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-search-toggle]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-search-close]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function movieMatches(movie, query) {
    if (!query) {
      return true;
    }
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      movie.category,
      (movie.tags || []).join(' ')
    ].join(' ');
    return normalize(text).indexOf(query) !== -1;
  }

  function createResultCard(movie) {
    var link = document.createElement('a');
    link.className = 'search-card';
    link.href = movie.file;

    var img = document.createElement('img');
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = 'lazy';
    link.appendChild(img);

    var body = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    body.appendChild(title);

    var meta = document.createElement('small');
    meta.textContent = movie.rating + ' · ' + movie.year + ' · ' + movie.category;
    body.appendChild(meta);

    link.appendChild(body);
    return link;
  }

  function renderSearch() {
    if (!searchResults || !window.SITE_MOVIES) {
      return;
    }
    var query = normalize(searchInput ? searchInput.value.trim() : '');
    var pool = window.SITE_MOVIES.filter(function (movie) {
      var filterMatch = activeFilter === 'all' || movie.category === activeFilter;
      return filterMatch && movieMatches(movie, query);
    }).slice(0, 48);

    searchResults.textContent = '';
    if (!pool.length) {
      var empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = '暂无匹配影片';
      searchResults.appendChild(empty);
      return;
    }
    pool.forEach(function (movie) {
      searchResults.appendChild(createResultCard(movie));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderSearch);
  }

  document.querySelectorAll('[data-filter]').forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      document.querySelectorAll('[data-filter]').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      renderSearch();
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function restartHero() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  });

  document.querySelectorAll('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  showSlide(0);
  startHero();
})();
