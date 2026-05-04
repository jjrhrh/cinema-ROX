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
// ===== تشغيل عند تحميل الصفحة =====
document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
});
