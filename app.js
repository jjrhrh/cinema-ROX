// ===== NAVIGATION SYSTEM =====
const Pages = {
  active: null,

  show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(id);
    if (page) {
      page.classList.add('active');
      this.active = id;
      window.scrollTo(0, 0);
    }
  }
};

// ===== BOTTOM NAV =====
function bnavGo(tab) {
  const hero = document.getElementById('heroBanner');
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('bnav' + tab.charAt(0).toUpperCase() + tab.slice(1))?.classList.add('active');

  if (tab === 'home') {
    Pages.show('homePage');
    if (hero) hero.style.display = '';
  } else if (tab === 'search') {
    Pages.show('searchPage');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'library') {
    Pages.show('libraryPage');
    if (hero) hero.style.display = 'none';
    loadLibraryTab('libWatchlist');
  } else if (tab === 'profile') {
    Pages.show('profilePage');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'browse') {
    toggleRoxMenu();
  }
}

function goBack() {
  const hero = document.getElementById('heroBanner');
  Pages.show('homePage');
  if (hero) hero.style.display = '';
  document.getElementById('bnavHome')?.classList.add('active');
}

// ===== ROX MENU =====
let roxMenuOpen = false;
function toggleRoxMenu() {
  roxMenuOpen = !roxMenuOpen;
  document.getElementById('roxMenu')?.classList.toggle('open', roxMenuOpen);
  document.getElementById('roxOverlay')?.classList.toggle('open', roxMenuOpen);
}

// ===== START =====
window.onload = () => {
  Pages.show('homePage');
  document.getElementById('bnavHome')?.classList.add('active');
  setTimeout(() => {
    const s = document.getElementById('splash-screen');
    if (s) { s.style.opacity = '0'; setTimeout(() => s.style.display = 'none', 600); }
  }, 1500);
};
// ===== NAVIGATION =====
function bnavGo(tab) {
  // إخفاء كل الصفحات
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // إلغاء تفعيل كل الأزرار
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));

  const hero = document.getElementById('heroSection');

  if (tab === 'home') {
    document.getElementById('bnavHome').classList.add('active');
    document.getElementById('homePage').classList.add('active');
    if (hero) hero.style.display = '';
  } else if (tab === 'search') {
    document.getElementById('bnavSearch').classList.add('active');
    document.getElementById('searchPage').classList.add('active');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'library') {
    document.getElementById('bnavLibrary').classList.add('active');
    document.getElementById('libraryPage').classList.add('active');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'profile') {
    document.getElementById('bnavProfile').classList.add('active');
    document.getElementById('profilePage').classList.add('active');
    if (hero) hero.style.display = 'none';
  }
  window.scrollTo(0, 0);
}

// ===== ROX MENU =====
let roxOpen = false;
function toggleRoxMenu() {
  roxOpen = !roxOpen;
  const menu    = document.getElementById('roxMenu');
  const overlay = document.getElementById('roxOverlay');
  const btn     = document.getElementById('bnavCenter');
  menu.classList.toggle('hidden', !roxOpen);
  overlay.classList.toggle('hidden', !roxOpen);
  if (btn) btn.style.transform = roxOpen ? 'rotate(45deg) scale(1.1)' : '';
}
// ===== END NAVIGATION =====
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
    const timeout = setTimeout(() => {
      controller.abort();
    }, CONFIG.PERFORMANCE.REQUEST_TIMEOUT_MS || 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`TMDB ${res.status}`);

    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];

    return results
      .filter(item => {
        if (requirePoster && !item.poster_path) return false;
        if (requireBackdrop && !item.backdrop_path) return false;
        return true;
      })
      .slice(0, limit)
      .map(item => ({
        ...item,
        media_type: item.media_type || type,
      }));
  } catch (err) {
    console.warn('fetchMovies failed:', endpoint, err);
    return [];
  }
}


// ===== BUILD HOME PAGE =====
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
    </div>
  `;
}

function buildSection(title, movies, type = 'movie') {
  if (!movies.length) return '';
  return `
    <div class="home-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${title}</h2>
      </div>
      <div class="movies-row">
        ${movies.map(m => buildMovieCard(m, type)).join('')}
      </div>
    </div>
  `;
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
// ===== END HOME =====
// ===== HERO SLIDER =====
let heroIndex = 0;
let heroTimer = null;

async function loadHeroSlider() {
  const imgs = [];

  // أولاً: نحاول Fanart
  const FANART_IDS = [238, 278, 240, 424, 389, 155, 550, 680, 13, 122];
  for (const id of FANART_IDS) {
    try {
      const url = `${CONFIG.API.FANART_BASE}/movies/${id}?api_key=${CONFIG.KEYS.FANART}`;
      const res  = await fetch(url);
      const data = await res.json();
      const bg   = data.moviebackground?.[0]?.url
                || data.hdmoviebackground?.[0]?.url;
      if (bg) imgs.push(bg);
    } catch(e) {}
  }

  // Fallback: TMDB إذا Fanart فشل أو أعطى أقل من 3 صور
  if (imgs.length < 3) {
    try {
      const url = `${CONFIG.API.TMDB_BASE}/movie/popular?api_key=${CONFIG.KEYS.TMDB}&language=ar-SA`;
      const res  = await fetch(url);
      const data = await res.json();
      (data.results || []).slice(0, 8).forEach(m => {
        if (m.backdrop_path)
          imgs.push(`https://image.tmdb.org/t/p/original${m.backdrop_path}`);
      });
    } catch(e) {}
  }

  if (!imgs.length) return;

  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  slider.innerHTML = imgs.map((src, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}"
         style="background-image:url('${src}')"></div>
  `).join('');

  clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    slides[heroIndex].classList.remove('active');
    heroIndex = (heroIndex + 1) % slides.length;
    slides[heroIndex].classList.add('active');
  }, 5000);
}
// ===== END HERO =====
// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  bnavGo('home');
  loadHomePage();
});
// ===== END INIT =====
