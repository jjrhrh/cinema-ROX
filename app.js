const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// ===== عرض صفحة =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  window.scrollTo(0, 0);
}

// ===== جلب الأفلام =====
async function fetchMovies(page = 1) {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${page}`);
    const data = await res.json();
    renderGrid(data.results, 'moviesGrid', 'movie');
  } catch (err) {
    document.getElementById('moviesGrid').innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب المسلسلات =====
async function fetchSeries(page = 1) {
  const grid = document.getElementById('seriesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const res = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${page}`);
    const data = await res.json();
    renderGrid(data.results, 'seriesGrid', 'tv');
  } catch (err) {
    document.getElementById('seriesGrid').innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب الأنمي =====
async function fetchAnime() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const query = `query {
    Page(perPage: 20) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id title { romaji native } coverImage { extraLarge }
      }
    }
  }`;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    renderGrid(data.data.Page.media, 'animeGrid', 'anime');
  } catch (err) {
    document.getElementById('animeGrid').innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== رندر الكروت =====
function renderGrid(items, gridId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(item => {
    const title = type === 'movie'
      ? (item.title || item.original_title)
      : type === 'tv'
      ? (item.name || item.original_name)
      : (item.title.native || item.title.romaji);

    const image = type === 'anime'
      ? item.coverImage.extraLarge
      : item.poster_path
      ? `${IMG_BASE}${item.poster_path}`
      : 'https://via.placeholder.com/300x450/111/555?text=No+Image';

    const rating = item.vote_average ? item.vote_average.toFixed(1) : '';

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${image}" alt="${title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/111/555?text=No+Image'">
        ${rating ? `<span class="card-rating">⭐ ${rating}</span>` : ''}
        <div class="card-overlay"><span class="play-btn">▶ مشاهدة</span></div>
      </div>
      <div class="card-info"><h4>${title}</h4></div>
    `;
    card.onclick = () => openPlayer(item.id, type);
    grid.appendChild(card);
  });
}

// ===== فتح المشغل =====
function openPlayer(id, type) {
  // سيرفرات متعددة تشتغل
  let url = '';
  if (type === 'movie') {
    url = `https://embed.su/embed/movie/${id}`;
  } else if (type === 'tv') {
    url = `https://embed.su/embed/tv/${id}/1/1`;
  } else {
    url = `https://animepahe.ru/anime/${id}`;
  }

  const modal = document.getElementById('playerModal');
  const iframe = document.getElementById('playerFrame');
  iframe.src = url;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ===== إغلاق المشغل =====
function closePlayer() {
  const modal = document.getElementById('playerModal');
  document.getElementById('playerFrame').src = '';
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== البحث =====
async function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري البحث...</div>';
  try {
    const [movRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=ar-SA&query=${encodeURIComponent(q)}`),
      fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&language=ar-SA&query=${encodeURIComponent(q)}`)
    ]);
    const [movData, tvData] = await Promise.all([movRes.json(), tvRes.json()]);
    const all = [
      ...movData.results.map(r => ({ ...r, _type: 'movie' })),
      ...tvData.results.map(r => ({ ...r, _type: 'tv' }))
    ].filter(r => r.poster_path);

    grid.innerHTML = '';
    if (!all.length) {
      grid.innerHTML = '<div class="loading">لا توجد نتائج</div>';
      return;
    }
    all.forEach(item => {
      const title = item._type === 'movie'
        ? (item.title || item.original_title)
        : (item.name || item.original_name);
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">
          ${rating ? `<span class="card-rating">⭐ ${rating}</span>` : ''}
          <div class="card-overlay"><span class="play-btn">▶ مشاهدة</span></div>
        </div>
        <div class="card-info">
          <h4>${title}</h4>
          <span class="type-badge">${item._type === 'movie' ? 'فيلم' : 'مسلسل'}</span>
        </div>
      `;
      card.onclick = () => openPlayer(item.id, item._type);
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في البحث</div>';
  }
}

// ===== تهيئة =====
window.onload = () => {
  fetchMovies();
  fetchSeries();
  fetchAnime();

  // بحث بضغطة Enter
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  // إغلاق بالضغط خارج المشغل
  document.getElementById('playerModal').addEventListener('click', function(e) {
    if (e.target === this) closePlayer();
  });
};

// تحديث كل 10 دقائق
setInterval(() => { fetchMovies(); fetchSeries(); fetchAnime(); }, 600000);
