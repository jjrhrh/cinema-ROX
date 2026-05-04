// ملف app.js — نسخة منقحة للعمل مع config.js و style.css

// الاستخدام الأساسي للـ CONFIG
const TMDB_KEY = CONFIG.KEYS.TMDB;
const TMDB_BASE = CONFIG.API.TMDB_BASE;
const IMG_BASE = CONFIG.IMAGES.POSTER_LG;
const POSTERS_IN_SEARCH = CONFIG.DISPLAY.POSTERS_IN_SEARCH; // 20 (عدد النتائج)

const splashScreen = document.getElementById('splash-screen');
const searchGrid = document.getElementById('searchGrid');

// تشغيل شاشة التحميل
function showSplash() {
  if (splashScreen) splashScreen.style.display = 'grid';
}

// إخفاء شاشة التحميل
function hideSplash() {
  if (splashScreen) splashScreen.style.display = 'none';
}

// دالة لجلب البيانات من TMDB (بناء على فلتر البحث)
async function fetchSearchResults(params = {}) {
  showSplash();
  try {
    const url = new URL(`${TMDB_BASE}/search/multi`);
    url.searchParams.set('api_key', TMDB_KEY);
    url.searchParams.set('language', CONFIG.LOCALE.DEFAULT_LANG);
    url.searchParams.set('query', params.query || '');
    url.searchParams.set('page', params.page || '1');
    url.searchParams.set('include_adult', CONFIG.SEARCH.INCLUDE_ADULT);

    if (params.language) {
      url.searchParams.set('with_original_language', params.language);
    }

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();

    return (data.results || []).filter(item => item.poster_path || item.profile_path);
  } catch (error) {
    console.error('خطأ في جلب نتائج البحث:', error);
    return [];
  } finally {
    hideSplash();
  }
}

// وظيفة العرض: عرض العناصر في searchGrid ببوسترين في السطر كما في style.css
function renderSearchResults(items) {
  if (!searchGrid) return;
  searchGrid.innerHTML = '';

  // أخذ فقط الـ POSTERS_IN_SEARCH الأوائل
  const itemsToShow = items.slice(0, POSTERS_IN_SEARCH);

  itemsToShow.forEach(item => {
    const title = item.title || item.name || '';
    const imageSrc = item.poster_path ? `${IMG_BASE}${item.poster_path}` : item.profile_path ? `${IMG_BASE}${item.profile_path}` : CONFIG.IMAGES.PLACEHOLDER;

    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${imageSrc}" alt="${title}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'" />
        <div class="card-overlay"><span class="play-btn">▶</span></div>
      </div>
      <span class="card-title">${title}</span>
    `;

    // يمكن تعديل هنا لاستدعاء تفاصيل العنصر عند الضغط على البطاقة
    card.onclick = () => alert(`تم الضغط على: ${title}`);

    searchGrid.appendChild(card);
  });
}

// تطبيق الفلاتر من الواجهة والأحداث، ثم جلب وعرض البيانات
async function applyFilters() {
  const queryInput = document.getElementById('searchInput');
  const type = document.getElementById('filterType')?.value || '';
  const genre = document.getElementById('filterGenre')?.value || '';
  const year = document.getElementById('filterYear')?.value || '';
  const lang = document.getElementById('filterLang')?.value || '';
  const sort = document.getElementById('filterSort')?.value || 'popularity.desc';

  let query = queryInput?.value?.trim() || '';
  if (!query) {
    searchGrid.innerHTML = '<div class="placeholder-card">يرجى إدخال نص للبحث</div>';
    return;
  }

  // بناء URL حسب نوع البحث (movie, tv, multi)
  let endpoint = '/search/multi';
  if (type === 'movie') endpoint = '/search/movie';
  else if (type === 'tv') endpoint = '/search/tv';

  showSplash();

  try {
    let url = new URL(TMDB_BASE + endpoint);
    url.searchParams.set('api_key', TMDB_KEY);
    url.searchParams.set('language', CONFIG.LOCALE.DEFAULT_LANG);
    url.searchParams.set('query', query);
    url.searchParams.set('page', '1');
    url.searchParams.set('include_adult', CONFIG.SEARCH.INCLUDE_ADULT);

    if (lang) url.searchParams.set('with_original_language', lang);
    if (year) {
      if (type === 'movie') url.searchParams.set('primary_release_year', year);
      else if (type === 'tv') url.searchParams.set('first_air_date_year', year);
    }
    if (genre) url.searchParams.set('with_genres', genre);
    url.searchParams.set('sort_by', sort);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to load data');
    const data = await res.json();

    const results = (data.results || []).filter(item => item.poster_path);

    if (results.length === 0) {
      searchGrid.innerHTML = '<div class="placeholder-card">لا توجد نتائج</div>';
    } else {
      renderSearchResults(results);
    }
  } catch (e) {
    console.error(e);
    searchGrid.innerHTML = '<div class="placeholder-card">حدث خطأ أثناء التحميل</div>';
  } finally {
    hideSplash();
  }
}

// تنفيذ البحث السريع من زر البحث أعلى الصفحة
function doQuickSearch() {
  applyFilters();
}

// إضافة الاستماع على إدخال النص لبحث مباشر عند الحاجة (اختياري)
const searchInputElem = document.getElementById('searchInput');
if (searchInputElem) {
  searchInputElem.addEventListener('input', () => {
    if (searchInputElem.value.trim().length >= CONFIG.SEARCH.MIN_CHARS) {
      applyFilters();
    } else {
      if (searchGrid) searchGrid.innerHTML = '';
    }
  });
}

// تحكم في التنقل بين الصفحات (إذا احتجت لإضافة دعم التنقل)
function bnavGo(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(tab + 'Page') || document.getElementById(tab);
  if (targetPage) targetPage.classList.add('active');
}

// بدء التشغيل: إخفاء شاشة التحميل تلقائياً بعد 3 ثواني لو لم يتم جلب بيانات (تجربة)
// أو يمكن تركها تظهر وتختفي حسب البيانات
window.addEventListener('load', () => {
  setTimeout(hideSplash, 3000);
});
