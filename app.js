const MOVIE_SERVERS = (id) => [
  `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  `https://vidsrc.to/embed/movie/${id}`,
  `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  `https://www.2embed.cc/embed/${id}`,
];
const TV_SERVERS = (id, s=1, e=1) => [
  `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
];

let currentServers = [];
let currentServerIndex = 0;
let pageHistory = [];
let lastPage = 'moviesPage';

function openSettings() {
  document.getElementById('settingsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
  document.body.style.overflow = '';
}
function setColor(color, btn) {
  document.documentElement.style.setProperty('--primary', color);
  document.documentElement.style.setProperty('--splash-color', color);
  document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  localStorage.setItem('primaryColor', color);
}
function setBg(bg, bg2, btn) {
  document.documentElement.style.setProperty('--bg', bg);
  document.documentElement.style.setProperty('--bg2', bg2);
  localStorage.setItem('bgColor', bg);
  localStorage.setItem('bg2Color', bg2);
}
function loadSettings() {
  const color = localStorage.getItem('primaryColor');
  const bg    = localStorage.getItem('bgColor');
  const bg2   = localStorage.getItem('bg2Color');
  if (color) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--splash-color', color);
  }
  if (bg)  document.documentElement.style.setProperty('--bg', bg);
  if (bg2) document.documentElement.style.setProperty('--bg2', bg2);
}

let currentLang = localStorage.getItem('siteLang') || 'ar';
function applyLang() {
  const isAr = currentLang === 'ar';
  const root = document.getElementById('htmlRoot');
  root.setAttribute('lang', currentLang);
  root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  const btnAr = document.getElementById('btnLangAr');
  const btnEn = document.getElementById('btnLangEn');
  if (btnAr) { btnAr.style.background = isAr ? 'var(--primary)' : 'transparent'; btnAr.style.borderColor = isAr ? 'var(--primary)' : '#444'; }
  if (btnEn) { btnEn.style.background = !isAr ? 'var(--primary)' : 'transparent'; btnEn.style.borderColor = !isAr ? 'var(--primary)' : '#444'; }
}
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('siteLang', lang);
  applyLang();
  fetchMovies();
  fetchSeries();
  fetchAnime();
}

// ===== BOTTOM NAV =====
function bnavGo(tab) {
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  if (tab === 'home') {
    document.getElementById('bnavHome').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('moviesPage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = '';
  } else if (tab === 'search') {
    document.getElementById('bnavSearch').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('searchPage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    const wlGrid = document.getElementById('watchlistGrid');
    if (wlGrid) renderWatchlistGrid(wlGrid);
    const wlGrid2 = document.getElementById('watchLaterGrid2');
    if (wlGrid2) renderWatchLaterGrid(wlGrid2);
  } else if (tab === 'browse') {
    document.getElementById('bnavBrowse').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('browsePage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    fetchMovies(); fetchSeries(); fetchAnime();
  } else if (tab === 'library') {
    document.getElementById('bnavLibrary').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('libraryPage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    document.getElementById('bnavLibrary')?.classList.remove('active');
    loadLibraryTab('libWatchlist');
  } else if (tab === 'profile') {
    document.getElementById('bnavProfile').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('profilePage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
  }
}

function renderWatchlistGrid(grid) {
  const items = getWatchlist();
  if (!items.length) { grid.innerHTML = '<div style="opacity:.4;padding:10px;">لا توجد أفلام بعد</div>'; return; }
  grid.innerHTML = items.map(i => `<div class="card" onclick="openDetails(${i.id},'${i.type||'movie'}')"><div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${i.poster}" alt="${i.title}" loading="lazy"><div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="card-title">${i.title}</span></div>`).join('');
}
function renderWatchLaterGrid(grid) {
  const items = getWatchLater();
  if (!items.length) { grid.innerHTML = '<div style="opacity:.4;padding:10px;">لا توجد أفلام بعد</div>'; return; }
  grid.innerHTML = items.map(i => `<div class="card" onclick="openDetails(${i.id},'${i.type||'movie'}')"><div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${i.poster}" alt="${i.title}" loading="lazy"><div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="card-title">${i.title}</span></div>`).join('');
}

function liveSearch() {
  const q = document.getElementById('searchInput')?.value?.trim();
  const sqLinks = document.getElementById('searchQuickLinks');
  if (sqLinks) sqLinks.style.display = q ? 'none' : '';
  if (q && q.length > 1) doSearch();
}

async function applyFilters() {
  const type  = document.getElementById('filterType')?.value;
  const genre = document.getElementById('filterGenre')?.value;
  const year  = document.getElementById('filterYear')?.value;
  const sort  = document.getElementById('filterSort')?.value || 'popularity.desc';
  const grid  = document.getElementById('searchGrid');
  const sqLinks = document.getElementById('searchQuickLinks');
  if (sqLinks) sqLinks.style.display = 'none';
  if (!grid) return;
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const ep = type === 'tv' ? 'tv' : 'movie';
  let url = `${TMDB_BASE}/discover/${ep}?api_key=${TMDB_KEY}&language=ar-SA&sort_by=${sort}&page=1`;
  if (genre) url += `&with_genres=${genre}`;
  if (year && ep === 'movie') url += `&primary_release_year=${year}`;
  if (year && ep === 'tv')    url += `&first_air_date_year=${year}`;
  try {
    const data = await fetch(url).then(r=>r.json());
    const results = (data.results||[]).filter(i=>i.poster_path);
    if (!results.length) { grid.innerHTML = '<div class="loading">لا توجد نتائج</div>'; return; }
    grid.innerHTML = results.map(i => {
      const t = i.title||i.name||i.original_title||'';
      const r = i.vote_average?i.vote_average.toFixed(1):'';
      return `<div class="card" onclick="openDetails(${i.id},'${type||'movie'}')"><div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${i.poster_path}" alt="${t}" loading="lazy">${r?`<span class="card-rating">⭐ ${r}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="card-title">${t}</span></div>`;
    }).join('');
  } catch(e) { grid.innerHTML = '<div class="loading">❌ خطأ</div>'; }
}

// ===== المكتبة =====
function switchLibTab(btn, panelId) {
  document.querySelectorAll('.lib-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.lib-panel').forEach(p => p.style.display = 'none');
  document.getElementById(panelId).style.display = '';
  loadLibraryTab(panelId);
}

function loadLibraryTab(panelId) {
  if (panelId === 'libWatchlist') {
    const grid = document.getElementById('libWatchlistGrid');
    if (!grid) return;
    const items = getWatchlist();
    if (!items.length) {
      grid.innerHTML = '<div class="lib-empty">❤️<br>قائمة المفضلة فارغة<br><small>أضف أفلامك المفضلة من صفحة التفاصيل</small></div>';
      return;
    }
    grid.innerHTML = items.map(i => `<div class="card" onclick="openDetails(${i.id},'${i.type||'movie'}')"><div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${i.poster}" alt="${i.title}" loading="lazy"><div class="card-overlay"><span class="play-btn">▶</span></div><button class="lib-remove-btn" onclick="event.stopPropagation();removeFromWatchlist(${i.id});loadLibraryTab('libWatchlist')">✕</button></div><span class="card-title">${i.title}</span></div>`).join('');
  }
  else if (panelId === 'libWatchLater') {
    const grid = document.getElementById('libWatchLaterGrid');
    if (!grid) return;
    const items = getWatchLater();
    if (!items.length) {
      grid.innerHTML = '<div class="lib-empty">⏰<br>القائمة فارغة<br><small>أضف ما تريد مشاهدته لاحقاً</small></div>';
      return;
    }
    grid.innerHTML = items.map(i => `<div class="card" onclick="openDetails(${i.id},'${i.type||'movie'}')"><div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${i.poster}" alt="${i.title}" loading="lazy"><div class="card-overlay"><span class="play-btn">▶</span></div><button class="lib-remove-btn" onclick="event.stopPropagation();removeFromWatchLater(${i.id});loadLibraryTab('libWatchLater')">✕</button></div><span class="card-title">${i.title}</span></div>`).join('');
  }
  else if (panelId === 'libNotes') {
    const container = document.getElementById('libNotesList');
    if (!container) return;
    const notes = JSON.parse(localStorage.getItem('cinemaRoxNotes') || '{}');
    const keys = Object.keys(notes);
    if (!keys.length) {
      container.innerHTML = '<div class="lib-empty">💬<br>لا توجد ملاحظات بعد</div>';
      return;
    }
    container.innerHTML = keys.map(k => `<div class="note-card"><div class="note-title">${notes[k].title||'فيلم'}</div><div class="note-text">${notes[k].text}</div><div class="note-date">${notes[k].date||''}</div><button class="note-delete" onclick="deleteNote('${k}');loadLibraryTab('libNotes')">🗑 حذف</button></div>`).join('');
  }
  else if (panelId === 'libStats') {
    const container = document.getElementById('libStatsContent');
    if (!container) return;
    const watchlist  = getWatchlist();
    const watchLater = getWatchLater();
    const notes  = JSON.parse(localStorage.getItem('cinemaRoxNotes') || '{}');
    const movies = watchlist.filter(i => i.type === 'movie' || !i.type).length;
    const series = watchlist.filter(i => i.type === 'tv').length;
    const anime  = watchlist.filter(i => i.type === 'anime').length;
    container.innerHTML = `<div class="stats-grid"><div class="stat-card"><div class="stat-num">${watchlist.length}</div><div class="stat-label">❤️ المفضلة</div></div><div class="stat-card"><div class="stat-num">${watchLater.length}</div><div class="stat-label">⏰ سأشاهده</div></div><div class="stat-card"><div class="stat-num">${Object.keys(notes).length}</div><div class="stat-label">💬 ملاحظات</div></div><div class="stat-card"><div class="stat-num">${movies}</div><div class="stat-label">🎬 أفلام</div></div><div class="stat-card"><div class="stat-num">${series}</div><div class="stat-label">📺 مسلسلات</div></div><div class="stat-card"><div class="stat-num">${anime}</div><div class="stat-label">✨ أنمي</div></div></div>`;
  }
}

function deleteNote(key) {
  const notes = JSON.parse(localStorage.getItem('cinemaRoxNotes') || '{}');
  delete notes[key];
  localStorage.setItem('cinemaRoxNotes', JSON.stringify(notes));
}
function removeFromWatchlist(id) {
  let list = getWatchlist().filter(i => i.id !== id);
  localStorage.setItem('cinemaRoxWatchlist', JSON.stringify(list));
}
function removeFromWatchLater(id) {
  let list = getWatchLater().filter(i => i.id !== id);
  localStorage.setItem('cinemaRoxWatchLater', JSON.stringify(list));
}
function getWatchlist()  { return JSON.parse(localStorage.getItem('cinemaRoxWatchlist')  || '[]'); }
function getWatchLater() { return JSON.parse(localStorage.getItem('cinemaRoxWatchLater') || '[]'); }

// ===== جلب البيانات =====
async function fetchMovies() {
  const grid = document.getElementById('moviesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const results = await Promise.all([1,2,3,4,5].map(p =>
      fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=${lang}&page=${p}`).then(r=>r.json()).then(d=>d.results||[])
    ));
    renderGrid(results.flat(), 'moviesGrid', 'movie');
  } catch(e) { grid.innerHTML = '<div class="loading">❌ خطأ</div>'; }
}

async function fetchSeries() {
  const grid = document.getElementById('seriesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const results = await Promise.all([1,2,3,4,5].map(p =>
      fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=${lang}&page=${p}`).then(r=>r.json()).then(d=>d.results||[])
    ));
    renderGrid(results.flat(), 'seriesGrid', 'tv');
  } catch(e) { if(grid) grid.innerHTML = '<div class="loading">❌ خطأ</div>'; }
}

async function fetchAnime() {
  const grid = document.getElementById('animeGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const query = `query{Page(perPage:50){media(type:ANIME,sort:POPULARITY_DESC){id title{romaji native}coverImage{extraLarge}averageScore}}}`;
  try {
    const res = await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
    const data = await res.json();
    renderGrid(data.data.Page.media, 'animeGrid', 'anime');
  } catch(e) { grid.innerHTML = '<div class="loading">❌ خطأ</div>'; }
}

function renderGrid(items, gridId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(item => {
    const title = type==='movie' ? (item.title||item.original_title)
                : type==='tv'   ? (item.name||item.original_name)
                : (item.title.native||item.title.romaji);
    const image = type==='anime' ? item.coverImage.extraLarge
                : item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : 'https://via.placeholder.com/300x450/111/555?text=No+Image';
    const rating = type==='anime'
      ? (item.averageScore ? (item.averageScore/10).toFixed(1) : '')
      : (item.vote_average ? item.vote_average.toFixed(1) : '');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class="card-img-wrap"><img src="${image}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/111/555?text=No+Image'">${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}<div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div></div><span class="card-title">${title}</span>`;
    card.onclick = () => openDetails(item.id, type);
    grid.appendChild(card);
  });
}

// ===== البحث =====
async function doSearch() {
  const q = document.getElementById('searchInput')?.value?.trim();
  if (!q) return;
  const grid = document.getElementById('searchGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading">⏳ جاري البحث...</div>';
  try {
    const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const [m, t] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=${lang}&query=${encodeURIComponent(q)}`).then(r=>r.json()),
      fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&language=${lang}&query=${encodeURIComponent(q)}`).then(r=>r.json()),
    ]);
    const all = [...(m.results||[]).map(r=>({...r,_type:'movie'})),...(t.results||[]).map(r=>({...r,_type:'tv'}))].filter(r=>r.poster_path);
    grid.innerHTML = '';
    if (!all.length) { grid.innerHTML='<div class="loading">لا توجد نتائج</div>'; return; }
    all.forEach(item=>{
      const title=item._type==='movie'?(item.title||item.original_title):(item.name||item.original_name);
      const rating=item.vote_average?item.vote_average.toFixed(1):'';
      const card=document.createElement('div');
      card.className='card';
      card.innerHTML=`<div class="card-img-wrap"><img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}" loading="lazy">${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="card-title">${title}</span>`;
      card.onclick=()=>openDetails(item.id,item._type);
      grid.appendChild(card);
    });
  } catch(e) { grid.innerHTML='<div class="loading">❌ خطأ</div>'; }
}

// ===== صفحة التفاصيل =====
function goBack() {
  const hero = document.getElementById('heroBanner');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(lastPage || 'moviesPage').classList.add('active');
  if (lastPage === 'moviesPage' && hero) hero.style.display = '';
}

async function openDetails(id, type) {
  lastPage = document.querySelector('.page.active')?.id || 'moviesPage';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  const page = document.getElementById('detailPage');
  page.classList.add('active');
  page.innerHTML = '<div class="loading" style="padding:120px 0">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  try {
    if (type === 'anime') await renderAnimeDetails(id);
    else await renderTMDBDetails(id, type);
  } catch(e) {
    page.innerHTML = '<div class="loading">❌ خطأ في تحميل التفاصيل</div>';
  }
}

async function renderTMDBDetails(id, type) {
  const ep = type==='movie' ? 'movie' : 'tv';
  const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
  const [detail, credits, similar, videos, watch] = await Promise.all([
    fetch(`${TMDB_BASE}/${ep}/${id}?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/similar?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/videos?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/watch/providers?api_key=${TMDB_KEY}`).then(r=>r.json()),
  ]);
  const title    = type==='movie'?(detail.title||detail.original_title):(detail.name||detail.original_name);
  const year     = type==='movie'?(detail.release_date||'').slice(0,4):(detail.first_air_date||'').slice(0,4);
  const runtime  = type==='movie'?(detail.runtime?`${detail.runtime} د`:''):(detail.episode_run_time?.[0]?`${detail.episode_run_time[0]} د/حلقة`:'');
  const rating   = detail.vote_average?detail.vote_average.toFixed(1):'';
  const genres   = (detail.genres||[]).map(g=>g.name).join(' · ');
  const overview = detail.overview||'لا يوجد وصف متاح';
  const backdrop = detail.backdrop_path?`https://image.tmdb.org/t/p/original${detail.backdrop_path}`:'';
  const poster   = detail.poster_path?`https://image.tmdb.org/t/p/w500${detail.poster_path}`:'';
  const trailer  = (videos.results||[]).find(v=>v.type==='Trailer'&&v.site==='YouTube')||(videos.results||[])[0];
  const trailerKey = trailer?trailer.key:null;
  const providers = watch.results?.SA||watch.results?.US||watch.results?.AE||null;
  const streams   = providers?.flatrate||[];
  const cast      = (credits.cast||[]).slice(0,15);
  const similar2  = (similar.results||[]).filter(s=>s.poster_path).slice(0,12);
  const inWatchlist = getWatchlist().some(i=>i.id===id);
  const inWatchLater = getWatchLater().some(i=>i.id===id);
  let seasonsHTML = '';
  if (type==='tv' && detail.seasons) seasonsHTML = await buildSeasonsHTML(id, detail.seasons);
  const page = document.getElementById('detailPage');
  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="detail-hero" style="background-image:url('${backdrop}')">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        ${poster?`<img class="detail-poster" src="${poster}" alt="${title}">`:''}
        <div class="detail-meta">
          <h1 class="detail-title">${title}</h1>
          <div class="detail-badges">
            ${year?`<span class="badge">📅 ${year}</span>`:''}
            ${runtime?`<span class="badge">⏱ ${runtime}</span>`:''}
            ${rating?`<span class="badge gold">⭐ ${rating}</span>`:''}
          </div>
          ${genres?`<div class="detail-genres">${genres}</div>`:''}
          <div class="detail-btns">
            <button class="btn-watch" onclick="openPlayerFromDetail(${id},'${type}')">▶ مشاهدة</button>
            ${trailerKey?`<button class="btn-trailer" onclick="openTrailer('${trailerKey}')">🎬 تريلر</button>`:''}
            <button class="btn-fav ${inWatchlist?'active':''}" onclick="toggleWatchlist(${id},'${type}','${title}','${poster}',this)">
              ${inWatchlist?'❤️':'🤍'}
            </button>
            <button class="btn-later ${inWatchLater?'active':''}" onclick="toggleWatchLater(${id},'${type}','${title}','${poster}',this)">
              ${inWatchLater?'⏰':'🕐'}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <section class="detail-section">
        <h2 class="detail-section-title">📖 القصة</h2>
        <p class="detail-overview">${overview}</p>
      </section>
      ${streams.length?`<section class="detail-section"><h2 class="detail-section-title">📺 أين تشاهده</h2><div class="providers-row">${streams.map(p=>`<div class="provider-chip"><img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}"><span>${p.provider_name}</span></div>`).join('')}</div></section>`:''}
      ${cast.length?`<section class="detail-section"><h2 class="detail-section-title">🎭 الممثلون</h2><div class="cast-row" id="castRow${id}">${cast.map(a=>`<div class="cast-card"><img src="${a.profile_path?'https://image.tmdb.org/t/p/w500'+a.profile_path:'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}" alt="${a.name}" loading="lazy"><span class="cast-name">${a.name}</span><span class="cast-char">${a.character||''}</span></div>`).join('')}</div></section>`:''}
      ${seasonsHTML}
      ${similar2.length?`<section class="detail-section"><h2 class="detail-section-title">🎬 مشابهة</h2><div class="similar-row" id="simRow${id}">${similar2.map(s=>{const st=type==='movie'?(s.title||s.original_title):(s.name||s.original_name);const sr=s.vote_average?s.vote_average.toFixed(1):'';return `<div class="similar-card" onclick="openDetails(${s.id},'${type}')"><div class="similar-img-wrap"><img src="https://image.tmdb.org/t/p/w500${s.poster_path}" alt="${st}" loading="lazy">${sr?`<span class="card-rating">⭐ ${sr}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="similar-title">${st}</span></div>`;}).join('')}</div></section>`:''}
    </div>`;
  initRowDrag('castRow'+id);
  initRowDrag('simRow'+id);
}

function toggleWatchlist(id, type, title, poster, btn) {
  let list = getWatchlist();
  const exists = list.some(i=>i.id===id);
  if (exists) {
    list = list.filter(i=>i.id!==id);
    btn.textContent = '🤍';
    btn.classList.remove('active');
  } else {
    list.push({id,type,title,poster});
    btn.textContent = '❤️';
    btn.classList.add('active');
  }
  localStorage.setItem('cinemaRoxWatchlist', JSON.stringify(list));
}

function toggleWatchLater(id, type, title, poster, btn) {
  let list = getWatchLater();
  const exists = list.some(i=>i.id===id);
  if (exists) {
    list = list.filter(i=>i.id!==id);
    btn.textContent = '🕐';
    btn.classList.remove('active');
  } else {
    list.push({id,type,title,poster});
    btn.textContent = '⏰';
    btn.classList.add('active');
  }
  localStorage.setItem('cinemaRoxWatchLater', JSON.stringify(list));
}

async function buildSeasonsHTML(seriesId, seasons) {
  const real = seasons.filter(s=>s.season_number>0);
  if (!real.length) return '';
  const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
  const data = await fetch(`${TMDB_BASE}/tv/${seriesId}/season/${real[0].season_number}?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json());
  return `<section class="detail-section"><h2 class="detail-section-title">📋 المواسم والحلقات</h2><div class="season-tabs" id="stabs${seriesId}">${real.map((s,i)=>`<button class="season-tab ${i===0?'active':''}" onclick="loadSeason(${seriesId},${s.season_number},this)">موسم ${s.season_number}</button>`).join('')}</div><div class="episodes-list" id="eplist${seriesId}">${buildEpisodesHTML(data.episodes||[])}</div></section>`;
}

function buildEpisodesHTML(eps) {
  if (!eps.length) return '<p style="color:#aaa;padding:10px 0">لا توجد حلقات</p>';
  return eps.map(ep=>`<div class="episode-row"><span class="ep-num">${ep.episode_number}</span><div class="ep-info"><span class="ep-name">${ep.name||'حلقة '+ep.episode_number}</span><span class="ep-date">${ep.air_date?'📅 '+ep.air_date:''}</span></div><button class="ep-play-btn" onclick="openPlayerEpisode(${ep.show_id||0},${ep.season_number},${ep.episode_number})">▶</button></div>`).join('');
}

async function loadSeason(seriesId, num, btn) {
  btn.closest('.season-tabs').querySelectorAll('.season-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const list = document.getElementById('eplist'+seriesId);
  list.innerHTML = '<div class="loading" style="padding:20px 0">⏳</div>';
  const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
  const data = await fetch(`${TMDB_BASE}/tv/${seriesId}/season/${num}?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json());
  list.innerHTML = buildEpisodesHTML(data.episodes||[]);
}

async function renderAnimeDetails(id) {
  const query = `query($id:Int){Media(id:$id){id title{romaji native}coverImage{extraLarge}bannerImage averageScore episodes genres description(asHtml:false) startDate{year} characters(sort:ROLE,perPage:15){nodes{name{full}image{medium}}} recommendations(perPage:10){nodes{mediaRecommendation{id title{romaji native}coverImage{extraLarge}averageScore}}} trailer{site id}}}`;
  const res = await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables:{id}})});
  const {data} = await res.json();
  const m = data.Media;
  const title = m.title.native||m.title.romaji;
  const score = m.averageScore?(m.averageScore/10).toFixed(1):'';
  const overview = m.description?.replace(/<[^>]+>/g,'')||'لا يوجد وصف';
  const cast = m.characters?.nodes||[];
  const recs = (m.recommendations?.nodes||[]).filter(n=>n.mediaRecommendation).slice(0,12);
  const trailerKey = m.trailer?.site==='youtube'?m.trailer.id:null;
  const page = document.getElementById('detailPage');
  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="detail-hero" style="${m.bannerImage?`background-image:url('${m.bannerImage}')`:'background:#12141c'}">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <img class="detail-poster" src="${m.coverImage.extraLarge}" alt="${title}">
        <div class="detail-meta">
          <h1 class="detail-title">${title}</h1>
          <div class="detail-badges">
            ${m.startDate?.year?`<span class="badge">📅 ${m.startDate.year}</span>`:''}
            ${m.episodes?`<span class="badge">🎞 ${m.episodes} حلقة</span>`:''}
            ${score?`<span class="badge gold">⭐ ${score}</span>`:''}
          </div>
          ${m.genres?.length?`<div class="detail-genres">${m.genres.join(' · ')}</div>`:''}
          <div class="detail-btns">
            <button class="btn-watch" onclick="openAnimePlayer(${id})">▶ مشاهدة</button>
            ${trailerKey?`<button class="btn-trailer" onclick="openTrailer('${trailerKey}')">🎬 تريلر</button>`:''}
          </div>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <section class="detail-section"><h2 class="detail-section-title">📖 القصة</h2><p class="detail-overview">${overview}</p></section>
      ${cast.length?`<section class="detail-section"><h2 class="detail-section-title">🎭 الشخصيات</h2><div class="cast-row" id="aCast${id}">${cast.map(c=>`<div class="cast-card"><img src="${c.image?.medium||'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}" alt="${c.name.full}" loading="lazy"><span class="cast-name">${c.name.full}</span></div>`).join('')}</div></section>`:''}
      ${recs.length?`<section class="detail-section"><h2 class="detail-section-title">✨ أنمي مشابه</h2><div class="similar-row" id="aRec${id}">${recs.map(n=>{const r=n.mediaRecommendation;const rt=r.title.native||r.title.romaji;const rs=r.averageScore?(r.averageScore/10).toFixed(1):'';return `<div class="similar-card" onclick="openDetails(${r.id},'anime')"><div class="similar-img-wrap"><img src="${r.coverImage.extraLarge}" alt="${rt}" loading="lazy">${rs?`<span class="card-rating">⭐ ${rs}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="similar-title">${rt}</span></div>`;}).join('')}</div></section>`:''}
    </div>`;
  initRowDrag('aCast'+id);
  initRowDrag('aRec'+id);
}

// ===== Hero Banner =====
let heroItems = [];
let heroIndex = 0;
let heroTimer = null;

async function initHero() {
  try {
    const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const data = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=${lang}&page=1`).then(r=>r.json());
    heroItems = (data.results||[]).filter(m=>m.backdrop_path).slice(0,8);
    if (!heroItems.length) return;
    buildHeroDots();
    showHeroSlide(0);
    heroTimer = setInterval(()=>{ heroIndex=(heroIndex+1)%heroItems.length; showHeroSlide(heroIndex); }, 5000);
  } catch(e) {}
}

function buildHeroDots() {
  const dots = document.getElementById('heroDots');
  if (!dots) return;
  dots.innerHTML = heroItems.map((_,i)=>`<span class="hero-dot ${i===0?'active':''}" onclick="showHeroSlide(${i})"></span>`).join('');
}

function showHeroSlide(index) {
  heroIndex = index;
  const item = heroItems[index];
  if (!item) return;
  const carousel = document.getElementById('heroCarousel');
  const title    = document.getElementById('heroTitle');
  const meta     = document.getElementById('heroMeta');
  const yearTag  = document.getElementById('heroYearTag');
  const watchBtn = document.getElementById('heroWatchBtn');
  const infoBtn  = document.getElementById('heroInfoBtn');
  const dots     = document.getElementById('heroDots');
  if (carousel) carousel.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${item.backdrop_path}')`;
  if (title)   title.textContent   = item.title||item.original_title;
  if (yearTag) yearTag.textContent = (item.release_date||'').slice(0,4);
  if (meta) {
    const r = item.vote_average?item.vote_average.toFixed(1):'';
    meta.innerHTML = `<span class="hero-tag">🎬 فيلم</span>${r?`<span class="hero-tag gold">⭐ ${r}</span>`:''}`;
  }
  if (watchBtn) watchBtn.onclick = ()=>openPlayerFromDetail(item.id,'movie');
  if (infoBtn)  infoBtn.onclick  = ()=>openDetails(item.id,'movie');
  if (dots) dots.querySelectorAll('.hero-dot').forEach((d,i)=>d.classList.toggle('active',i===index));
}

// ===== المشغل =====
function openPlayerFromDetail(id, type) {
  currentServers = type==='movie' ? MOVIE_SERVERS(id) : TV_SERVERS(id);
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function openPlayerEpisode(sid, s, e) {
  currentServers = TV_SERVERS(sid, s, e);
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function openAnimePlayer(id) {
  currentServers = [`https://aniwatch.to/watch/${id}`,`https://9anime.to/watch/${id}`];
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function openTrailer(key) {
  currentServers = [`https://www.youtube.com/embed/${key}?autoplay=1`];
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function loadServer(i) {
  document.getElementById('playerFrame').src = currentServers[i];
  const btn = document.getElementById('nextServerBtn');
  if (btn) btn.textContent = `🔄 سيرفر ${i+1}/${currentServers.length}`;
}
function nextServer() {
  if (currentServerIndex < currentServers.length-1) { currentServerIndex++; loadServer(currentServerIndex); }
  else alert('لا يوجد سيرفر آخر');
}
function closePlayer() {
  document.getElementById('playerFrame').src = '';
  document.getElementById('playerModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== سحب الصفوف =====
function initRowDrag(id) {
  const row = document.getElementById(id);
  if (!row) return;
  let drag=false, sx=0, sl=0;
  row.addEventListener('mousedown', e=>{ drag=true; sx=e.clientX; sl=row.scrollLeft; row.style.cursor='grabbing'; });
  window.addEventListener('mousemove', e=>{ if(!drag) return; row.scrollLeft=sl-(e.clientX-sx); });
  window.addEventListener('mouseup', ()=>{ drag=false; row.style.cursor='grab'; });
}

// ===== Splash Screen =====
function hideSplash() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(()=>{ splash.style.display='none'; }, 600);
  }
}

// ===== تهيئة =====
window.onload = () => {
  loadSettings();
  applyLang();
  fetchMovies();
  fetchSeries();
  fetchAnime();
  initHero();
  setTimeout(hideSplash, 2500);
  document.getElementById('playerModal')?.addEventListener('click', function(e){ if(e.target===this) closePlayer(); });
  document.getElementById('settingsModal')?.addEventListener('click', function(e){ if(e.target===this) closeSettings(); });
};
