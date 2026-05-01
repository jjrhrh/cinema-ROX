const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// سيرفرات الأفلام بالترتيب (يجرب الأول، إذا فشل يجرب الثاني...)
const MOVIE_SERVERS = (id) => [
  `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  `https://vidsrc.to/embed/movie/${id}`,
  `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  `https://www.2embed.cc/embed/${id}`,
];

const TV_SERVERS = (id, s = 1, e = 1) => [
  `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
];

let currentServers = [];
let currentServerIndex = 0;

// ===== عرض صفحة =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
  window.scrollTo(0, 0);
}

// ===== جلب الأفلام (5 صفحات = ~100 فيلم) =====
async function fetchMovies() {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const pages = [1, 2, 3, 4, 5];
    const results = await Promise.all(
      pages.map(p =>
        fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r => r.json())
          .then(d => d.results || [])
      )
    );
    const all = results.flat();
    renderGrid(all, 'moviesGrid', 'movie');
  } catch (err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب المسلسلات (5 صفحات = ~100 مسلسل) =====
async function fetchSeries() {
  const grid = document.getElementById('seriesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const pages = [1, 2, 3, 4, 5];
    const results = await Promise.all(
      pages.map(p =>
        fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r => r.json())
          .then(d => d.results || [])
      )
    );
    const all = results.flat();
    renderGrid(all, 'seriesGrid', 'tv');
  } catch (err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب الأنمي (50 أنمي) =====
async function fetchAnime() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const query = `query {
    Page(perPage: 50) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji native }
        coverImage { extraLarge }
        averageScore
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
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
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

    const rating = type === 'anime'
      ? (item.averageScore ? (item.averageScore / 10).toFixed(1) : '')
      : (item.vote_average ? item.vote_average.toFixed(1) : '');

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

// ===== فتح المشغل مع fallback =====
function openPlayer(id, type) {
  if (type === 'movie') {
    currentServers = MOVIE_SERVERS(id);
  } else if (type === 'tv') {
    currentServers = TV_SERVERS(id);
  } else {
    // أنمي — استخدام AniWatch
    currentServers = [
      `https://aniwatch.to/watch/${id}`,
      `https://9anime.to/watch/${id}`,
    ];
  }

  currentServerIndex = 0;
  loadServer(currentServerIndex);

  const modal = document.getElementById('playerModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function loadServer(index) {
  const iframe = document.getElementById('playerFrame');
  iframe.src = currentServers[index];
}

// زر "جرب سيرفر آخر"
function nextServer() {
  if (currentServerIndex < currentServers.length - 1) {
    currentServerIndex++;
    loadServer(currentServerIndex);
    updateServerBtn();
  } else {
    alert('لا يوجد سيرفر آخر متاح حالياً');
  }
}

function updateServerBtn() {
  const btn = document.getElementById('nextServerBtn');
  if (btn) {
    btn.textContent = `🔄 سيرفر ${currentServerIndex + 1}/${currentServers.length}`;
  }
}

// ===== إغلاق المشغل =====
function closePlayer() {
  const modal = document.getElementById('playerModal');
  document.getElementById('playerFrame').src = '';
  modal.classList.remove('open');
  document.body.style.overflow = '';
  currentServers = [];
  currentServerIndex = 0;
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
          <span class="type-badge">${item._type === 'movie' ? '🎬 فيلم' : '📺 مسلسل'}</span>
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

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });

  document.getElementById('playerModal').addEventListener('click', function(e) {
    if (e.target === this) closePlayer();
  });
};

// تحديث كل 10 دقائق
setInterval(() => { fetchMovies(); fetchSeries(); fetchAnime(); }, 600000);
