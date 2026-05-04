// ===== بناء الهيدر =====
function buildHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <div class="header-logo">
        Cinema <span>ROX</span>
      </div>
      <div class="header-search">
        <input
          type="text"
          id="searchInput"
          placeholder="🔍 ابحث عن فيلم..."
          oninput="handleSearch(this.value)"
          class="search-input"
        >
      </div>
    </div>
  `;
}
// ===== جلب الأفلام من TMDB =====
async function fetchMovies(endpoint = '/movie/popular') {
  const url = `${CONFIG.API.TMDB_BASE}${endpoint}?api_key=${CONFIG.KEYS.TMDB}&language=ar-SA&page=1`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('خطأ في جلب الأفلام:', e);
    return [];
  }
}

// ===== جلب تريلر الفيلم =====
async function fetchTrailer(movieId) {
  const url = `${CONFIG.API.TMDB_BASE}/movie/${movieId}${CONFIG.VIDEO.TMDB_VIDEO_PATH}?api_key=${CONFIG.KEYS.TMDB}`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    const trailer = (data.results || []).find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    );
    return trailer ? `${CONFIG.VIDEO.YOUTUBE_EMBED}${trailer.key}?autoplay=1` : null;
  } catch (e) {
    console.error('خطأ في جلب التريلر:', e);
    return null;
}
}
// ===== بناء شبكة الأفلام =====
function buildMoviesGrid(movies) {
  const main = document.getElementById('mainContent');
  if (!main) return;
  main.innerHTML = `
    <div class="movies-grid" id="moviesGrid">
      ${movies.map(movie => `
        <div class="movie-card" data-id="${movie.id}" onclick="onMovieClick(${movie.id})">
          <div class="movie-poster-wrap">
            <img
              class="movie-poster"
              src="${CONFIG.IMAGES.POSTER_MD}${movie.poster_path}"
              alt="${movie.title}"
              loading="lazy"
              onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'"
            >
            <div class="movie-play-icon">▶</div>
          </div>
          <div class="movie-title">${movie.title}</div>
          <div class="movie-rating">⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== منطق النقر على فيلم =====
async function onMovieClick(movieId) {
  const trailerUrl = await fetchTrailer(movieId);
  if (!trailerUrl) {
    alert('لا يوجد تريلر متاح لهذا الفيلم');
    return;
  }
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  frame.src = trailerUrl;
  overlay.classList.remove('hidden');
}

// ===== إغلاق التريلر =====
function closeTrailerPlayer() {
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  frame.src = '';
  overlay.classList.add('hidden');
}
}
// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', async () => {
  buildHeader();
  const movies = await fetchMovies();
  buildMoviesGrid(movies);
  document.getElementById('closeTrailer')
    .addEventListener('click', closeTrailerPlayer);
});
