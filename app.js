// ===== HERO FANART SLIDER =====
const HERO_MOVIE_IDS = [238,278,240,424,389,155,550,680,13,122];
let heroSlideIndex = 0;
let heroImages = [];
let heroTimer = null;

async function fetchFanartHero() {
  const imgs = [];
  for (const id of HERO_MOVIE_IDS) {
    try {
      const url = `${CONFIG.API.FANART_BASE}/movies/${id}?api_key=${CONFIG.KEYS.FANART}`;
      const res  = await fetch(url);
      const data = await res.json();
      const bg = data.moviebackground?.[0]?.url
              || data.hdmoviebackground?.[0]?.url
              || data.movieposter?.[0]?.url;
      if (bg) imgs.push({ img: bg, id });
    } catch(e) {}
  }

  // fallback: إذا فشل Fanart نستخدم TMDB backdrops
  if (!imgs.length) {
    try {
      const url = `${CONFIG.API.TMDB_BASE}/movie/popular?api_key=${CONFIG.KEYS.TMDB}&language=ar-SA`;
      const res  = await fetch(url);
      const data = await res.json();
      (data.results||[]).slice(0,8).forEach(m => {
        if (m.backdrop_path) imgs.push({
          img: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          id: m.id
        });
      });
    } catch(e) {}
  }

  heroImages = imgs;
  buildHeroSlider();
}

function buildHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider || !heroImages.length) return;
  slider.innerHTML = heroImages.map((item, i) => `
    <div class="hero-slide ${i===0?'active':''}"
         style="background-image:url('${item.img}')">
    </div>
  `).join('');
  clearInterval(heroTimer);
  heroTimer = setInterval(nextHeroSlide, 5000);
}

function nextHeroSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  if (!slides.length) return;
  slides[heroSlideIndex].classList.remove('active');
  heroSlideIndex = (heroSlideIndex + 1) % slides.length;
  slides[heroSlideIndex].classList.add('active');
}
// ===== END HERO =====
  if (!slides.length) return;
  slides[heroSlideIndex].classList.remove('active');
  heroSlideIndex = (heroSlideIndex + 1) % slides.length;
  slides[heroSlideIndex].classList.add('active');
}
// ===== END HERO =====
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
            <div class="movie-overlay">
              <span class="movie-play-btn">▶</span>
              <span class="movie-rating-badge">⭐ ${movie.vote_average?.toFixed(1) || ''}</span>
            </div>
          </div>
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

// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', async () => {
  fetchFanartHero();
  buildHeader();
  const movies = await fetchMovies();
  buildMoviesGrid(movies);
  const closeBtn = document.getElementById('closeTrailer');
  if (closeBtn) closeBtn.addEventListener('click', closeTrailerPlayer);
  const overlay = document.getElementById('trailerOverlay');
  if (overlay) overlay.classList.add('hidden');
});
