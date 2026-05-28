
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMobileMenu() {
  const toggle = $('[data-menu-toggle]');
  const panel = $('[data-mobile-menu]');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
}

function setupImageFallbacks() {
  $$('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('image-missing');
    });
  });
}

function setupHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  if (slides.length <= 1) {
    return;
  }
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  restart();
}

function cardHaystack(card) {
  return [
    card.dataset.title,
    card.dataset.year,
    card.dataset.genre,
    card.dataset.tags,
    card.dataset.region,
  ].join(' ').toLowerCase();
}

function setupFilterPages() {
  const filter = $('[data-filter-page]');
  const list = $('[data-card-list]');
  if (!filter || !list) {
    return;
  }
  const keyword = $('[data-filter-keyword]', filter);
  const year = $('[data-filter-year]', filter);
  const genre = $('[data-filter-genre]', filter);
  const reset = $('[data-filter-reset]', filter);
  const count = $('[data-filter-count]', filter);
  const cards = $$('[data-card]', list);

  const apply = () => {
    const q = (keyword?.value || '').trim().toLowerCase();
    const y = year?.value || '';
    const g = (genre?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const text = cardHaystack(card);
      const cardYear = card.dataset.year || '';
      const yearOk = !y || (y === '2021' ? Number(cardYear) <= 2021 : cardYear === y);
      const ok = (!q || text.includes(q)) && (!g || text.includes(g)) && yearOk;
      card.classList.toggle('hidden-card', !ok);
      if (ok) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `当前显示 ${visible} / ${cards.length} 部`;
    }
  };

  [keyword, year, genre].forEach((el) => {
    el?.addEventListener('input', apply);
    el?.addEventListener('change', apply);
  });

  reset?.addEventListener('click', () => {
    if (keyword) keyword.value = '';
    if (year) year.value = '';
    if (genre) genre.value = '';
    apply();
  });

  apply();
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
  return `
    <article class="movie-card" data-card>
      <a class="poster" href="${escapeHtml(movie.url)}" data-title="${escapeHtml(movie.title)}">
        <img class="poster-img" src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" data-fallback />
        <span class="poster-badge">${escapeHtml(movie.rating)}</span>
        <span class="poster-play">播放</span>
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.duration)}</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }[char]));
}

function setupSearchPage() {
  const page = $('[data-search-page]');
  if (!page || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const input = $('[data-search-input]', page);
  const category = $('[data-search-category]', page);
  const sort = $('[data-search-sort]', page);
  const clear = $('[data-search-clear]', page);
  const summary = $('[data-search-summary]', page);
  const results = $('[data-search-results]', page);
  const params = new URLSearchParams(window.location.search);
  input.value = params.get('q') || '';

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const cat = category.value;
    const sortBy = sort.value;
    let data = window.MOVIE_SEARCH_DATA.filter((movie) => {
      const text = [
        movie.title,
        movie.region,
        movie.year,
        movie.genreRaw,
        movie.categoryTitle,
        (movie.tags || []).join(' '),
        movie.oneLine,
      ].join(' ').toLowerCase();
      return (!q || text.includes(q)) && (!cat || movie.categoryKey === cat);
    });

    data.sort((a, b) => {
      if (sortBy === 'rating') {
        return Number(b.rating) - Number(a.rating);
      }
      if (sortBy === 'new') {
        return Number(b.id) - Number(a.id);
      }
      if (sortBy === 'year') {
        return Number(b.year) - Number(a.year);
      }
      return Number(b.views) - Number(a.views);
    });

    const shown = data.slice(0, 240);
    summary.textContent = `找到 ${data.length} 部影片，当前展示 ${shown.length} 部。`;
    results.innerHTML = shown.map(movieCardTemplate).join('');
    setupImageFallbacks();
  };

  [input, category, sort].forEach((el) => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    category.value = '';
    sort.value = 'hot';
    render();
  });

  render();
}

async function setupHlsPlayers() {
  const players = $$('[data-hls-player]');
  if (!players.length) {
    return;
  }

  let Hls = null;
  try {
    const mod = await import('./hls-dru42stk.js');
    Hls = mod.H;
  } catch (error) {
    Hls = null;
  }

  players.forEach((video) => {
    const src = video.dataset.src;
    const wrap = video.closest('.video-wrap');
    const status = $('[data-player-status]', wrap || document);
    const playButton = $('[data-play-button]', wrap || document);

    const setStatus = (message) => {
      if (status) {
        status.textContent = message || '';
      }
    };

    if (!src) {
      setStatus('暂未配置播放源。');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，播放器正在尝试重新连接。');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，播放器正在恢复。');
          hls.recoverMediaError();
        } else {
          setStatus('播放初始化失败，请刷新页面后重试。');
          hls.destroy();
        }
      });
    } else {
      video.src = src;
      setStatus('当前浏览器可能不支持 HLS，请更换浏览器或使用支持 HLS 的环境。');
    }

    playButton?.addEventListener('click', async () => {
      try {
        await video.play();
        playButton.classList.add('hidden');
      } catch (error) {
        setStatus('播放被浏览器拦截，请再次点击视频控件开始播放。');
      }
    });

    video.addEventListener('play', () => playButton?.classList.add('hidden'));
    video.addEventListener('pause', () => {
      if (!video.ended) {
        playButton?.classList.remove('hidden');
      }
    });
    video.addEventListener('loadeddata', () => setStatus(''));
  });
}

setupMobileMenu();
setupImageFallbacks();
setupHero();
setupFilterPages();
setupSearchPage();
setupHlsPlayers();
