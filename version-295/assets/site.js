
(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  // Search / filter support for pages with filterable cards
  const input = document.querySelector('[data-search-input]');
  const typeSelect = document.querySelector('[data-type-filter]');
  const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const counter = document.querySelector('[data-result-count]');

  function applyFilters() {
    if (!cards.length) return;
    const q = (input?.value || '').trim().toLowerCase();
    const type = (typeSelect?.value || 'all').toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const hay = ((card.dataset.title || '') + ' ' + (card.dataset.tags || '') + ' ' + (card.dataset.text || '')).toLowerCase();
      const matchQuery = !q || hay.includes(q);
      const matchType = type === 'all' || (card.dataset.type || '').toLowerCase() === type;
      const ok = matchQuery && matchType;
      card.classList.toggle('is-hidden', !ok);
      if (ok) visible += 1;
    });
    if (counter) counter.textContent = String(visible);
  }

  if (input) input.addEventListener('input', applyFilters);
  if (typeSelect) typeSelect.addEventListener('change', applyFilters);
  if (cards.length) applyFilters();

  // Hero slider
  const slider = document.querySelector('[data-hero-slider]');
  const slides = slider ? Array.from(slider.children) : [];
  const prevBtn = document.querySelector('[data-hero-prev]');
  const nextBtn = document.querySelector('[data-hero-next]');
  let slideIndex = 0;
  let timer = null;

  function goTo(index) {
    if (!slider || !slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slider.style.transform = `translateX(${-slideIndex * 100}%)`;
  }
  function play() {
    if (timer || !slides.length) return;
    timer = setInterval(() => goTo(slideIndex + 1), 4500);
  }
  function pause() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(slideIndex - 1); pause(); play(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(slideIndex + 1); pause(); play(); });
  if (slider && slides.length) {
    slider.parentElement?.addEventListener('mouseenter', pause);
    slider.parentElement?.addEventListener('mouseleave', play);
    play();
  }

  // Player helpers
  const playBtn = document.querySelector('[data-play-btn]');
  const video = document.querySelector('video[data-video]');
  if (playBtn && video) {
    playBtn.addEventListener('click', async () => {
      try {
        if (video.paused) {
          await video.play();
          playBtn.textContent = '暂停播放';
        } else {
          video.pause();
          playBtn.textContent = '继续播放';
        }
      } catch (err) {
        console.warn(err);
      }
    });
    video.addEventListener('play', () => { playBtn.textContent = '暂停播放'; });
    video.addEventListener('pause', () => { playBtn.textContent = '继续播放'; });
  }

  // Basic HLS hook (ready for m3u8 sources if Hls.js is added later)
  document.querySelectorAll('video[data-hls-src]').forEach((el) => {
    const src = el.dataset.hlsSrc;
    if (!src) return;
    if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(el);
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = src;
    }
  });
})();
