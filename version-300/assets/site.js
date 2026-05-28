(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function filterCards(input) {
    var query = normalize(input.value);
    var cards = selectAll('.movie-card');
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var matched = !query || text.indexOf(query) !== -1;
      card.classList.toggle('hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    selectAll('[data-empty-state]').forEach(function (state) {
      state.classList.toggle('is-visible', visible === 0);
    });
  }

  function setupSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    selectAll('[data-search-input]').forEach(function (input) {
      if (query) {
        input.value = query;
      }
      filterCards(input);
      input.addEventListener('input', function () {
        filterCards(input);
      });
    });
  }

  setupMobileNav();
  setupHero();
  setupSearch();
})();
