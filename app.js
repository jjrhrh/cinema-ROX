// ===== NAVIGATION =====
function bnavGo(tab) {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));

  const map = { home:'homePage', search:'searchPage', library:'libraryPage', profile:'profilePage' };
  const bmap = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', profile:'bnavProfile' };

  if (tab === 'browse') { toggleRoxMenu(); return; }

  const pageId = map[tab];
  const btnId  = bmap[tab];
  if (pageId) document.getElementById(pageId)?.classList.add('active');
  if (btnId)  document.getElementById(btnId)?.classList.add('active');

  if (hero) hero.style.display = tab === 'home' ? '' : 'none';
  if (tab === 'library') loadLibraryTab?.('libWatchlist');

  window.scrollTo(0, 0);
}

function goBack() {
  bnavGo('home');
}

// ===== ROX MENU =====
let roxOpen = false;
function toggleRoxMenu() {
  roxOpen = !roxOpen;
  const menu    = document.getElementById('roxMenu');
  const overlay = document.getElementById('roxOverlay');
  const btn     = document.getElementById('bnavCenter');
  menu?.classList.toggle('hidden', !roxOpen);
  overlay?.classList.toggle('hidden', !roxOpen);
  if (btn) btn.style.transform = roxOpen ? 'rotate(45deg) scale(1.1)' : '';
}

// ===== FETCH MOVIES =====
async function fetchMovies(endpoint = '/movie/popular', options = {}) {
  const {
    page = 1,
    type = endpoint.includes('/tv') ? 'tv' : 'movie',
    limit = CONFIG.DISPLAY.TRENDING_LIMIT || 20,
    requirePoster = true,
    requireBackdrop = false,
    params = {},
  } = options;

  const url = buildTMDBUrl(endpoint, {
    page,
    include_adult: String(CONFIG.SEARCH.INCLUDE_ADULT),
    ...params,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.PERFORMANCE.REQUEST_TIMEOUT_MS || 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();
    return (data.results || [])
      .filter(item => {
        if (requirePoster && !item.poster_path) return false;
        if (requireBackdrop && !item.backdrop_path) return false;
        return true;
      })
      .slice(0, limit)
      .map(item => ({ ...item, media_type: item.media_type || type }));
  } catch (err) {
    console.warn('fetchMovies failed:', endpoint, err.message);
    return [];
  }
}

// ===== HERO SLIDER =====
let heroMovies = [], heroIndex = 0, heroTimer = null;

async function getFanartBackdrop(tmdbId) {
  try {
    const res = await fetch(`${CONFIG.API.FANART_BASE}/movies/${tmdbId}?api_key=${CONFIG.KEYS.FANART}`);
    if (!res.ok) return '';
    const d = await res.json();
    return d.hdmoviebackground?.[0]?.url || d.moviebackground?.[0]?.url || '';
  } catch { return ''; }
}

function resolveHeroBackdrop(movie, fanartUrl = '') {
  if (fanartUrl) return fanartUrl;
  if (movie.backdrop_path) return `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}`;
  if (movie.poster_path)   return `${CONFIG.IMAGES.ORIGINAL}${movie.poster_path}`;
  return '';
}

function setHeroSlide(nextIndex) {
  const slides = document.querySelectorAll('#heroSlider .hero-slide');
  if (!slides.length) return;
  slides[heroIndex]?.classList.remove('active');
  heroIndex = nextIndex;
  slides[heroIndex]?.classList.add('active');
}

function startHeroTimer() {
  clearInterval(heroTimer);
  if (heroMovies.length < 2) return;
  heroTimer = setInterval(() => setHeroSlide((heroIndex + 1) % heroMovies.length), 5000);
}

async function loadHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  let movies = await fetchMovies('/trending/movie/week', { limit: 7, requireBackdrop: true });
  if (!movies.length) movies = await fetchMovies('/movie/popular', { limit: 7, requireBackdrop: true });
  if (!movies.length) { slider.innerHTML = ''; return; }

  const enriched = await Promise.all(movies.map(async m => {
    const fan = await getFanartBackdrop(m.id);
    return { ...m, hero_backdrop: resolveHeroBackdrop(m, fan) };
  }));

  heroMovies = enriched.filter(m => m.hero_backdrop);
  if (!heroMovies.length) { slider.innerHTML = ''; return; }

  heroIndex = 0;
  slider.innerHTML = heroMovies.map((m, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}"
         style="background-image:url('${m.hero_backdrop}')"
         onclick="openDetail(${m.id},'movie')">
    </div>
  `).join('');

  startHeroTimer();
}

// ===== HOME PAGE =====
function buildMovieCard(movie, type = 'movie') {
  const title  = type === 'movie' ? (movie.title || movie.original_title) : (movie.name || movie.original_name);
  const poster = movie.poster_path ? `${CONFIG.IMAGES.POSTER_MD}${movie.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  return `
    <div class="movie-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="movie-poster-wrap">
        <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        ${rating ? `<span class="movie-rating">⭐ ${rating}</span>` : ''}
        <div class="movie-overlay"><span class="play-icon">▶</span></div>
      </div>
    </div>`;
}

function buildSection(title, movies, type = 'movie') {
  if (!movies.length) return '';
  return `
    <div class="home-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${title}</h2>
      </div>
      <div class="movies-row">${movies.map(m => buildMovieCard(m, type)).join('')}</div>
    </div>`;
}

async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';

  const [trending, topRated, series] = await Promise.all([
    fetchMovies('/movie/popular'),
    fetchMovies('/movie/top_rated'),
    fetchMovies('/tv/popular'),
  ]);

  page.innerHTML = `
    ${buildSection('🔥 الأفلام الرائجة', trending, 'movie')}
    ${buildSection('⭐ الأعلى تقييماً', topRated, 'movie')}
    ${buildSection('📺 المسلسلات', series, 'tv')}
  `;
}

// stub لمنع أخطاء الكونسول إن لم تُبنَ الصفحات بعد
// ===== DETAIL PAGE =====
async function openDetail(id, type = 'movie') {
  const page = document.getElementById('detailPage');
  if (!page) return;

  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  page.classList.add('active');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);

  page.innerHTML = '<div class="loading">⏳ جاري تحميل التفاصيل...</div>';

  try {
    const endpoint = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const [detailRes, videosRes, creditsRes] = await Promise.all([
      fetch(buildTMDBUrl(endpoint)),
      fetch(buildTMDBUrl(`${endpoint}/videos`)),
      fetch(buildTMDBUrl(`${endpoint}/credits`)),
    ]);

    const detail  = await detailRes.json();
    const videos  = await videosRes.json();
    const credits = await creditsRes.json();

    const trailer = (videos.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
                 || (videos.results || [])[0];

    const backdrop = detail.backdrop_path
      ? `${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`
      : (detail.poster_path ? `${CONFIG.IMAGES.ORIGINAL}${detail.poster_path}` : '');

    const poster = detail.poster_path
      ? `${CONFIG.IMAGES.POSTER_LG}${detail.poster_path}`
      : CONFIG.IMAGES.PLACEHOLDER;

    const title    = type === 'movie' ? (detail.title || detail.original_title) : (detail.name || detail.original_name);
    const year     = (detail.release_date || detail.first_air_date || '').slice(0, 4);
    const rating   = detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
    const runtime  = detail.runtime ? `${detail.runtime} د` : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} د` : '');
    const genres   = (detail.genres || []).map(g => `<span class="detail-genre">${g.name}</span>`).join('');
    const overview = detail.overview || 'لا يوجد وصف متاح.';
    const cast     = (credits.cast || []).slice(0, 8);

    const castHTML = cast.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">🎭 طاقم التمثيل</h3>
        <div class="cast-row">
          ${cast.map(a => `
            <div class="cast-card">
              <img src="${a.profile_path ? CONFIG.IMAGES.POSTER_SM + a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
                   alt="${a.name}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              <span class="cast-name">${a.name}</span>
              <span class="cast-char">${a.character || ''}</span>
            </div>
          `).join('')}
        </div>
      </div>` : '';

    const trailerBtn = trailer
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${trailer.key}')">▶ المقطع الدعائي</button>`
      : '';
// ===== LIBRARY HELPERS =====
function getLib(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveLib(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function addToWatchlist(id, type) {
  const list = getLib('rox_watchlist');
  if (list.find(i => i.id === id)) {
    showToast('✅ موجود في قائمتك مسبقاً');
    return;
  }
  list.unshift({ id, type, addedAt: Date.now() });
  saveLib('rox_watchlist', list);
  showToast('❤️ تمت الإضافة إلى قائمتك');
}

function addToWatchLater(id, type) {
  const list = getLib('rox_watchlater');
  if (list.find(i => i.id === id)) {
    showToast('⏰ موجود في سأشاهده مسبقاً');
    return;
  }
  list.unshift({ id, type, addedAt: Date.now() });
  saveLib('rox_watchlater', list);
  showToast('⏰ تمت الإضافة إلى سأشاهده لاحقاً');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'rox-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
                                                                                                 }
    // حفظ ID لاستخدامه في أزرار المكتبة
    page.dataset.currentId   = id;
    page.dataset.currentType = type;

    page.innerHTML = `
      <!-- Backdrop -->
      <div class="detail-backdrop" style="background-image:url('${backdrop}')">
        <div class="detail-backdrop-gradient"></div>
        <button class="detail-back-btn" onclick="goBack()">← رجوع</button>
      </div>

      <!-- Main Info -->
      <div class="detail-body">
        <div class="detail-top">
          <img class="detail-poster" src="${poster}" alt="${title}"
               onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="detail-info">
            <h1 class="detail-title">${title}</h1>
            <div class="detail-meta">
              ${year ? `<span class="detail-badge">📅 ${year}</span>` : ''}
              ${runtime ? `<span class="detail-badge">⏱ ${runtime}</span>` : ''}
              <span class="detail-badge detail-rating">⭐ ${rating}</span>
              <span class="detail-badge">${type === 'tv' ? '📺 مسلسل' : '🎬 فيلم'}</span>
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              ${trailerBtn}
              <button class="detail-btn detail-btn-watch"   onclick="addToWatchlist(${id},'${type}')">+ قائمتي</button>
              <button class="detail-btn detail-btn-later"   onclick="addToWatchLater(${id},'${type}')">⏰ سأشاهده</button>
            </div>
          </div>
        </div>

        <!-- Overview -->
        <div class="detail-section">
          <h3 class="detail-section-title">📖 القصة</h3>
          <p class="detail-overview">${overview}</p>
        </div>

        <!-- Production Info -->
        <div class="detail-section detail-prod-grid">
          ${detail.budget ? `<div class="detail-prod-item"><span class="prod-label">💰 الميزانية</span><span class="prod-val">$${(detail.budget/1e6).toFixed(1)}M</span></div>` : ''}
          ${detail.revenue ? `<div class="detail-prod-item"><span class="prod-label">✅ الإيرادات</span><span class="prod-val">$${(detail.revenue/1e6).toFixed(1)}M</span></div>` : ''}
          ${detail.vote_count ? `<div class="detail-prod-item"><span class="prod-label">🗳 التقييمات</span><span class="prod-val">${detail.vote_count.toLocaleString()}</span></div>` : ''}
          ${detail.status ? `<div class="detail-prod-item"><span class="prod-label">📌 الحالة</span><span class="prod-val">${detail.status}</span></div>` : ''}
        </div>

        <!-- Cast -->
        ${castHTML}
      </div>
    `;

  } catch (err) {
    page.innerHTML = `<div class="loading">❌ تعذّر تحميل التفاصيل<br><small>${err.message}</small></div>
      <div style="text-align:center;padding:20px">
        <button class="detail-btn detail-btn-watch" onclick="goBack()">← رجوع</button>
      </div>`;
  }
}

function playTrailer(key) {
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  if (!overlay || !frame) return;
  frame.src = `${CONFIG.VIDEO.YOUTUBE_EMBED}${key}?autoplay=1`;
  overlay.classList.remove('hidden');
  document.getElementById('closeTrailer')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    frame.src = '';
  }, { once: true });
}
function openMovieOfDay() {}
function openStats() {}
function openSurprise() {}
function openAI() {}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // Splash
  setTimeout(() => {
    const s = document.getElementById('splash-screen');
    if (s) { s.style.opacity = '0'; setTimeout(() => s.remove(), 600); }
  }, 1500);

  // تشغيل الهوم
  bnavGo('home');

  // تحميل الهيرو والمحتوى معاً
  await Promise.all([loadHeroSlider(), loadHomePage()]);
});
