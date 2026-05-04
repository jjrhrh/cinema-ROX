// ============================================================
//   Cinema-ROX — APP.JS
//   المحرك الرئيسي للموقع | النسخة 2.0 | Production Ready
// ============================================================

'use strict';

class CinemaROX {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  /**
   * تهيئة التطبيق - الخطوة الأولى
   */
  init() {
    console.log('🚀 Cinema-ROX يتم تحميله...');

    // التحقق من وجود CONFIG
    if (typeof CONFIG === 'undefined') {
      this.showCriticalError('❌ ملف config.js غير موجود أو لم يتم تحميله');
      return;
    }

    console.log('✅ CONFIG محمل بنجاح');
    this.isInitialized = true;

    // إخفاء شاشة التحميل
    this.hideSplashScreen();

    // تحميل المحتوى الافتراضي
    this.loadTrendingMovies();
  }

  /**
   * إخفاء شاشة التحميل
   */
  hideSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
      splashScreen.style.display = 'none';
      console.log('✅ شاشة التحميل مخفية');
    }
  }

  /**
   * عرض خطأ حرج يوقف التطبيق
   * @param {string} message - رسالة الخطأ
   */
  showCriticalError(message) {
    console.error(message);
    
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = `
        <div class="critical-error">
          <h2>خطأ حرج</h2>
          <p>${message}</p>
          <p>يرجى إعادة تحميل الصفحة أو التحقق من ملف config.js</p>
        </div>
      `;
    }
    
    document.body.classList.add('error-state');
  }

  /**
   * تحميل الأفلام الرائجة (المحتوى الافتراضي)
   */
  async loadTrendingMovies() {
    if (!this.isInitialized) return;

    console.log('📥 جاري تحميل الأفلام الرائجة...');
    
    try {
      this.showLoadingState();
      
      const movies = await this.fetchMovies('/trending/movie/week', {
        page: 1
      });

      if (movies && movies.length > 0) {
        this.renderMovies(movies, 'الأفلام الرائجة هذا الأسبوع');
        console.log(`✅ تم عرض ${movies.length} فيلم`);
      } else {
        this.showNoResults('لا توجد أفلام رائجة حالياً');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الأفلام:', error);
      this.showError('فشل في تحميل الأفلام. تحقق من الاتصال بالإنترنت');
    }
  }

  /**
   * جلب الأفلام من TMDB باستخدام buildTMDBUrl من config.js
   * @param {string} endpoint - نقطة النهاية
   * @param {Object} params - المعاملات الإضافية
   * @returns {Promise<Array>} قائمة الأفلام
   */
  async fetchMovies(endpoint, params = {}) {
    const url = buildTMDBUrl(endpoint, params);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.PERFORMANCE.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results) {
        return data.results;
      } else {
        console.warn('⚠️ لا توجد نتائج results في الاستجابة:', data);
        return [];
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('انتهت مهلة الطلب');
      }
      throw error;
    }
  }

  /**
   * عرض حالة التحميل
   */
  showLoadingState() {
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>جاري تحميل الأفلام...</p>
        </div>
      `;
    }
  }

  /**
   * عرض الأفلام في الحاوية
   * @param {Array} movies - قائمة الأفلام
   * @param {string} title - عنوان القسم
   */
  renderMovies(movies, title) {
    const container = document.querySelector('.search-results');
    if (!container) {
      console.error('❌ .search-results غير موجود');
      return;
    }

    // مسح الحاوية تماماً
    container.innerHTML = '';

    // عنوان القسم
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = title;
    container.appendChild(sectionTitle);

    // حاوية الشبكة
    const gridContainer = document.createElement('div');
    gridContainer.className = 'movies-grid';

    // إنشاء كروت الأفلام (الحد الأقصى من CONFIG)
    const maxMovies = Math.min(movies.length, CONFIG.DISPLAY.POSTERS_IN_SEARCH);
    
    for (let i = 0; i < maxMovies; i++) {
      const movie = movies[i];
      const card = this.createMovieCard(movie);
      gridContainer.appendChild(card);
    }

    container.appendChild(gridContainer);
  }

  /**
   * إنشاء كرت فيلم كامل (بوستر + عنوان + تقييم)
   * @param {Object} movie - بيانات الفيلم من TMDB
   * @returns {HTMLElement} الكرت الجاهز
   */
  createMovieCard(movie) {
    // الحاوية الرئيسية للكرت
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;
    card.dataset.movieTitle = movie.title || movie.name || 'غير معروف';
    card.dataset.movieYear = movie.release_date?.substring(0, 4) || '----';
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');

    // صورة البوستر
    const posterImg = document.createElement('img');
    posterImg.className = 'movie-poster';
    posterImg.src = buildImageURL(movie.poster_path, 'MD');
    posterImg.alt = `${movie.title || movie.name || 'فيلم'} - ${movie.release_date?.substring(0, 4) || 'غير معروف'}`;
    posterImg.loading = CONFIG.PERFORMANCE.LAZY_LOAD ? 'lazy' : 'eager';
    posterImg.onerror = () => {
      posterImg.src = CONFIG.IMAGES.PLACEHOLDER;
    };

    // حاوية المعلومات النصية
    const infoContainer = document.createElement('div');
    infoContainer.className = 'movie-info';

    // العنوان
    const titleElement = document.createElement('h3');
    titleElement.className = 'movie-title';
    titleElement.textContent = movie.title || movie.name || 'غير معروف';
    titleElement.title = movie.title || movie.name || 'غير معروف';

    // التقييم
    const ratingElement = document.createElement('div');
    ratingElement.className = 'movie-rating';
    
    const ratingScore = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    ratingElement.innerHTML = `
      <span class="rating-star">⭐</span>
      <span class="rating-score">${ratingScore}</span>
      <span class="rating-out-of">/ 10</span>
    `;

    // تجميع المعلومات
    infoContainer.appendChild(titleElement);
    infoContainer.appendChild(ratingElement);

    // تجميع الكرت كاملاً
    card.appendChild(posterImg);
    card.appendChild(infoContainer);

    return card;
  }

  /**
   * عرض رسالة عدم وجود نتائج
   * @param {string} message
   */
  showNoResults(message) {
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <h3>لا توجد نتائج</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }

  /**
   * عرض رسالة خطأ عادية
   * @param {string} message
   */
  showError(message) {
    const container = document.querySelector('.search-results');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h3>حدث خطأ</h3>
          <p>${message}</p>
          <button class="retry-btn" onclick="window.CinemaROX?.loadTrendingMovies()">إعادة المحاولة</button>
        </div>
      `;
    }
  }
}

// ============================================================
//   بدء التطبيق عند تحميل DOM
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.CinemaROX = new CinemaROX();
  });
} else {
  window.CinemaROX = new CinemaROX();
}

// ============================================================
//   API عام لإعادة التحميل من الخارج
// ============================================================
window.reloadMovies = () => {
  if (window.CinemaROX && window.CinemaROX.isInitialized) {
    window.CinemaROX.loadTrendingMovies();
  }
};

console.log('🎬 Cinema-ROX جاهز للعمل!');
