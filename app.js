// app.js النهائي للعمل مع config.js وstyle.css

const TMDB_KEY = CONFIG.KEYS.TMDB;
const TMDB_BASE = CONFIG.API.TMDB_BASE;
const IMG_BASE = CONFIG.IMAGES.POSTER_LG;

const splashScreen = document.getElementById('splash-screen');
const searchGrid = document.getElementById('searchGrid');
const searchInput = document.getElementById('quickSearchInput');

// إظهار شاشة التحميل
function showSplash() {
  if (splashScreen) splashScreen.style.display = 'grid';
}
// إخفاء شاشة التحميل
function hideSplash() {
  if (splashScreen) splashScreen.style.display = 'none';
}

// عرض الأفلام ببوسترين في السطر كما هو محدد في style.css
function renderMovies(movies) {
  if (!searchGrid) return;
  searchGrid.innerHTML = '';

  // عرض 20 بوستر كحد أقصى (10 صفوف × 2 عمود)
  movies.slice(0, 20).forEach(movie => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = movie.title || movie.original_title || '';
    const posterSrc = movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${posterSrc}" alt="${title}" loading="lazy" 
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'" />
        <div class="card-overlay"><span class="play-btn">▶</span></div>
      </div>
      <span class="card-title">${title}</span>
    `;

    card.onclick = () => alert(`تم اختيار الفيلم: ${title}`);

    searchGrid.appendChild(card);
  });
}

// جلب الأفلام الرائجة
async function fetchTrendingMovies() {
  showSplash();
  try {
    const url = new URL(`${TMDB_BASE}/movie/popular`);
    url.searchParams.set('api_key', TMDB_KEY);
    url.searchParams.set('language', CONFIG.LOCALE.DEFAULT_LANG);
    url.searchParams.set('page', '1');

    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل في جلب الأفلام الرائجة');
    const data = await res.json();
    const movies = (data.results || []).filter(m => m.poster_path);
    return movies;
  } catch (error) {
    console.error(error);
    return [];
  } finally {
    hideSplash();
  }
}

// البحث وعرض النتائج
async function applySearch(query) {
  if (!query || query.trim().length < CONFIG.SEARCH.MIN_CHARS) {
    if (searchGrid) {
      searchGrid.innerHTML = `<div class="placeholder-card">يرجى إدخال نص للبحث (على الأقل ${CONFIG.SEARCH.MIN_CHARS} أحرف)</div>`;
    }
    return;
  }

  showSplash();
  try {
    const url = new URL(`${TMDB_BASE}/search/movie`);
    url.searchParams.set('api_key', TMDB_KEY);
    url.searchParams.set('language', CONFIG.LOCALE.DEFAULT_LANG);
    url.searchParams.set('query', query.trim());
    url.searchParams.set('include_adult', CONFIG.SEARCH.INCLUDE_ADULT);
    url.searchParams.set('page', '1');

    const res = await fetch(url);
    if (!res.ok) throw new Error('خطأ في نتائج البحث');
    const data = await res.json();

    const movies = (data.results || []).filter(m => m.poster_path);
    if (movies.length === 0) {
      searchGrid.innerHTML = `<div class="placeholder-card">لا توجد نتائج بحث</div>`;
    } else {
      renderMovies(movies);
    }
  } catch (error) {
    console.error(error);
    searchGrid.innerHTML = `<div class="placeholder-card">حدث خطأ أثناء البحث</div>`;
  } finally {
    hideSplash();
  }
}

// تهيئة الاستماع لحدث إدخال النص في مربع البحث
function initSearchListener() {
  if (!searchInput) return;

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = searchInput.value;
      if (query.trim().length >= CONFIG.SEARCH.MIN_CHARS) {
        applySearch(query);
      } else {
        if (searchGrid) searchGrid.innerHTML = '';
      }
    }, CONFIG.SEARCH.DEBOUNCE_MS);
  });
}

// بدء التطبيق - جلب الأفلام الرائجة وتشغيل البحث تلقائياً
window.addEventListener('DOMContentLoaded', async () => {
  showSplash();
  initSearchListener();
  const trendingMovies = await fetchTrendingMovies();

  if (trendingMovies.length > 0) {
    renderMovies(trendingMovies);
  } else if (searchGrid) {
    searchGrid.innerHTML = `<div class="placeholder-card">لا توجد أفلام رائجة حاليًا.</div>`;
  }

  hideSplash();
});
