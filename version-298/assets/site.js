
(function () {
  function normalize(text) {
    return (text || "").toString().toLowerCase();
  }

  function setupSearch(root) {
    const input = root.querySelector('.js-search');
    const cards = Array.from(root.querySelectorAll('[data-search]'));
    const count = root.querySelector('.js-count');
    if (!input || !cards.length) return;

    function applyFilter() {
      const q = normalize(input.value).trim();
      let visible = 0;
      cards.forEach((card) => {
        const hay = normalize(card.getAttribute('data-search'));
        const show = !q || hay.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (count) count.textContent = String(visible);
    }

    input.addEventListener('input', applyFilter);
    applyFilter();
  }

  function setupMobileMenu(root) {
    const btn = root.querySelector('.js-menu-toggle');
    const menu = root.querySelector('.js-mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }

  function setupPlayer() {
    const video = document.querySelector('.js-player');
    if (!video) return;
    const url = video.getAttribute('data-video-url');
    if (!url) return;
    const playBtn = document.querySelector('[data-play-toggle]');

    function initNative() {
      video.src = url;
    }

    const canNative = video.canPlayType('application/vnd.apple.mpegurl');
    if (canNative) {
      initNative();
    } else {
      import('./hls-vendor-dru42stk.js').then((mod) => {
        const Hls = mod.H || mod.default || mod.hls || mod;
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(() => {});
          });
        } else {
          initNative();
        }
      }).catch(() => {
        initNative();
      });
    }

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        video.play().catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu(document);
    setupSearch(document);
    setupPlayer();
  });
})();
