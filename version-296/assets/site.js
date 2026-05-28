(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('.poster-img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
      image.removeAttribute('src');
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const scope = panel.closest('.container') || document;
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const input = panel.querySelector('[data-search-input]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const years = new Set();
    const types = new Set();

    cards.forEach(function (card) {
      if (card.dataset.year) years.add(card.dataset.year);
      if (card.dataset.type) types.add(card.dataset.type);
    });

    Array.from(years).sort().reverse().forEach(function (year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (yearSelect) yearSelect.appendChild(option);
    });

    Array.from(types).sort().forEach(function (type) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      if (typeSelect) typeSelect.appendChild(option);
    });

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        const yearOk = !year || card.dataset.year === year;
        const typeOk = !type || card.dataset.type === type;
        card.classList.toggle('is-hidden', !(keywordOk && yearOk && typeOk));
      });
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
  });

  document.querySelectorAll('[data-video-player]').forEach(function (player) {
    const video = player.querySelector('[data-video-element]');
    const button = player.querySelector('[data-play-button]');
    const sourceList = player.closest('.player-card') ? player.closest('.player-card').querySelector('[data-source-list]') : null;
    let hls = null;
    let loaded = false;

    function currentSource() {
      return video ? video.dataset.source : '';
    }

    function destroyHls() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
      hls = null;
    }

    function loadAndPlay() {
      if (!video) return;
      const url = currentSource();
      if (!url) return;

      if (!loaded) {
        destroyHls();
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = url;
          video.play().catch(function () {});
        }
        loaded = true;
      } else {
        video.play().catch(function () {});
      }
      player.classList.add('is-playing');
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) player.classList.remove('is-playing');
      });
    }

    if (sourceList && video) {
      sourceList.querySelectorAll('[data-source]').forEach(function (item) {
        item.addEventListener('click', function () {
          sourceList.querySelectorAll('[data-source]').forEach(function (other) {
            other.classList.remove('active');
          });
          item.classList.add('active');
          destroyHls();
          loaded = false;
          video.pause();
          video.removeAttribute('src');
          video.load();
          video.dataset.source = item.dataset.source;
          loadAndPlay();
        });
      });
    }
  });
})();
