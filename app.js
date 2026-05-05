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
async function fetchMovies(endpoint = '/movie/popular', page = 1) {
  const url = `${CONFIG.API.TMDB_BASE}${endpoint}?api_key=${CONFIG.KEYS.TMDB}&language=ar-SA&page=${page}`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch(e) { return []; }
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  bnavGo('home');
  loadHomePage();
});
// ===== END INIT =====
