
function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function initMobileNav() {
  const btn = qs('[data-mobile-toggle]');
  const panel = qs('[data-mobile-panel]');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    btn.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
  });
}

function initHeroSlider() {
  const root = qs('[data-hero-slider]');
  if (!root) return;
  const slides = qsa('[data-hero-slide]', root);
  const dots = qsa('[data-hero-dot]', root);
  if (slides.length <= 1) return;
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  const prev = qs('[data-hero-prev]', root);
  const next = qs('[data-hero-next]', root);
  if (prev) prev.addEventListener('click', () => show(index - 1));
  if (next) next.addEventListener('click', () => show(index + 1));
  setInterval(() => show(index + 1), 5000);
}

function initTabs() {
  const root = qs('[data-tabs]');
  if (!root) return;
  const buttons = qsa('[data-tab-btn]', root);
  const panels = qsa('[data-tab-panel]', root);
  const activate = (name) => {
    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.tabBtn === name));
    panels.forEach(panel => panel.classList.toggle('active', panel.dataset.tabPanel === name));
  };
  buttons.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tabBtn)));
  const initial = buttons.find(btn => btn.classList.contains('active'))?.dataset.tabBtn || buttons[0]?.dataset.tabBtn;
  if (initial) activate(initial);
}

function initVideoPlayers() {
  const videos = qsa('video[data-src]');
  if (!videos.length) return;
  const loadHls = () => new Promise((resolve, reject) => {
    if (window.Hls) return resolve(window.Hls);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => resolve(window.Hls);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  videos.forEach(async (video) => {
    const src = video.dataset.src;
    if (!src) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }
    try {
      const Hls = await loadHls();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    } catch (err) {
      video.src = src;
    }
  });
}

async function initSearchPage() {
  const app = qs('[data-search-app]');
  if (!app) return;
  const input = qs('[data-search-input]', app);
  const results = qs('[data-search-results]', app);
  const count = qs('[data-search-count]', app);
  const category = qs('[data-search-category]', app);
  const year = qs('[data-search-year]', app);
  const q = new URLSearchParams(location.search).get('q') || '';
  const region = new URLSearchParams(location.search).get('region') || '';
  if (input && q) input.value = q;

  let data = [];
  try {
    const res = await fetch('assets/catalog.json', { cache: 'no-store' });
    data = await res.json();
  } catch (err) {
    results.innerHTML = '<div class="muted-box">搜索数据加载失败，请刷新页面重试。</div>';
    return;
  }

  const render = () => {
    const kw = (input?.value || '').trim().toLowerCase();
    const selectedRegion = category?.value || region;
    const selectedYear = year?.value || '';
    const filtered = data.filter(item => {
      const hit = !kw || [item.title, item.region, item.genre, item.one_line, item.summary, (item.tags || []).join(' ')].join(' ').toLowerCase().includes(kw);
      const regionHit = !selectedRegion || item.category === selectedRegion || item.region.includes(selectedRegion);
      const yearHit = !selectedYear || String(item.year) === selectedYear;
      return hit && regionHit && yearHit;
    });
    if (count) count.textContent = String(filtered.length);
    if (!filtered.length) {
      results.innerHTML = '<div class="muted-box">没有找到匹配影片，请尝试更换关键词。</div>';
      return;
    }
    results.innerHTML = filtered.map(item => `
      <article class="movie-card">
        <a class="movie-card-link" href="video/${item.id}/">
          <div class="movie-poster-wrap">
            <img class="movie-poster" src="${item.poster}" alt="${item.title}海报">
            <div class="movie-overlay"></div>
            <div class="movie-hover"><span class="hover-play">▶ 立即观看</span></div>
          </div>
          <div class="movie-body">
            <h3>${item.title}</h3>
            <p class="movie-meta">${item.region} · ${item.year} · ${item.genre}</p>
            <p class="movie-desc">${item.one_line}</p>
            <div class="movie-tags">${(item.tags || []).slice(0, 3).map(t => `<span class="chip">${t}</span>`).join('')}</div>
          </div>
        </a>
      </article>
    `).join('');
  };

  if (input) input.addEventListener('input', debounce(render, 120));
  if (category) category.addEventListener('change', render);
  if (year) year.addEventListener('change', render);
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initHeroSlider();
  initTabs();
  initVideoPlayers();
  initSearchPage();
});
