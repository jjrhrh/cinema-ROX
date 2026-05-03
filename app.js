
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
let lastPage = 'homePage';

// ===== الإعدادات =====
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
// ===== تغيير اللغة =====
let currentLang = localStorage.getItem('siteLang') || 'ar';

function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('siteLang', currentLang);
  applyLang();
  fetchMovies();
  fetchSeries();
  fetchAnime();
}

function applyLang() {
  const isAr = currentLang === 'ar';
  const root = document.getElementById('htmlRoot');
  root.setAttribute('lang', currentLang);
  root.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  const label = document.getElementById('langLabel');
  if (label) label.textContent = isAr ? 'English' : 'عربي';
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
// ===== القائمة الجانبية =====
function openSideMenu() {
  document.getElementById('sideMenu').classList.add('open');
  document.getElementById('sideMenuOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSideMenu() {
  document.getElementById('sideMenu').classList.remove('open');
  document.getElementById('sideMenuOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
// ===== BOTTOM NAV =====
function bnavGo(tab) {
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('bnavHome')?.classList.remove('active');
  document.getElementById('bnavSearch')?.classList.remove('active');
  document.getElementById('bnavBrowse')?.classList.remove('active');
  document.getElementById('bnavProfile')?.classList.remove('active');
document.getElementById('bnavHome')?.classList.remove('active');
  document.getElementById('bnavSearch')?.classList.remove('active');
  document.getElementById('bnavBrowse')?.classList.remove('active');
  document.getElementById('bnavLibrary')?.classList.remove('active');
  document.getElementById('bnavProfile')?.classList.remove('active');
  if (tab === 'home') {
    document.getElementById('bnavHome').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));document.getElementById('homePage')?.classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = '';
  } else if (tab === 'search') {
    document.getElementById('bnavSearch').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('searchPage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    // تحميل المفضلات
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
  } else if (tab === 'center') {
    document.getElementById('bnavBrowse').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    openCenterPage();
  } else if (tab === 'profile') {
    document.getElementById('bnavProfile').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('profilePage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
  } else if (tab === 'library') {
    document.getElementById('bnavLibrary').classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('libraryPage').classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = 'none';
    renderLibraryPage();
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
  const type   = document.getElementById('filterType')?.value;
  const genre  = document.getElementById('filterGenre')?.value;
  const year   = document.getElementById('filterYear')?.value;
  const sort   = document.getElementById('filterSort')?.value || 'popularity.desc';
  const grid   = document.getElementById('searchGrid');
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
// ===== صفحة الشبكات =====
async function openNetworksPage(pageNum) {
  if (!pageNum) pageNum = 1;
  pageHistory.push('networksListPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('networksListPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="networks-page-header">📡 الشبكات والقنوات</div>
    <div class="networks-grid" id="networksGrid"><div class="loading">⏳ جاري التحميل...</div></div>
    <div id="netsPagination" style="display:flex;justify-content:center;align-items:center;gap:16px;padding:24px 0;"></div>
  `;
  window.scrollTo(0, 0);

  const allNetworks = [
    {id:213,name:'Netflix'},{id:49,name:'HBO / Max'},
    {id:2739,name:'Disney+'},{id:1024,name:'Amazon Prime'},
    {id:2552,name:'Apple TV+'},{id:4330,name:'Paramount+'},
    {id:3353,name:'Peacock'},{id:453,name:'Hulu'},
    {id:283,name:'Crunchyroll'},{id:64,name:'Starz'},
    {id:56,name:'Showtime'},{id:318,name:'AMC+'},
    {id:510,name:'Discovery+'},{id:19,name:'FOX'},
    {id:6,name:'NBC'},{id:16,name:'ABC'},
    {id:67,name:'CBS'},{id:71,name:'The CW'},
    {id:174,name:'AMC'},{id:25,name:'FX'},
    {id:84,name:'TNT'},{id:80,name:'TBS'},
    {id:34,name:'Comedy Central'},{id:74,name:'MTV'},
    {id:359,name:'Syfy'},{id:138,name:'Lifetime'},
    {id:31,name:'USA Network'},{id:13,name:'Bravo'},
    {id:35,name:'E!'},{id:85,name:'Adult Swim'},
    {id:361,name:'Cinemax'},{id:43,name:'National Geographic'},
    {id:65,name:'Discovery'},{id:103,name:'History'},
    {id:38,name:'PBS'},{id:53,name:'Cartoon Network'},
    {id:55,name:'Nickelodeon'},{id:63,name:'Disney Channel'},
    {id:4,name:'BBC One'},{id:96,name:'BBC Two'},
    {id:41,name:'ITV'},{id:332,name:'Channel 4'},
    {id:104,name:'Sky One'},{id:308,name:'Sky Atlantic'},
    {id:1,name:'Fuji TV'},{id:77,name:'TV Asahi'},
    {id:66,name:'TV Tokyo'},{id:273,name:'MSNBC'},
    {id:58,name:'A&E'},{id:270,name:'TLC'},
  ];

  try {
    const itemsPerPage = 12;
    const totalPages = Math.ceil(allNetworks.length / itemsPerPage);
    const start = (pageNum - 1) * itemsPerPage;
    const pageItems = allNetworks.slice(start, start + itemsPerPage);

    const details = await Promise.all(
      pageItems.map(n =>
        fetch(`${TMDB_BASE}/network/${n.id}?api_key=${TMDB_KEY}`)
          .then(r => r.json())
          .then(d => ({ ...d, fallbackName: n.name }))
          .catch(() => ({ id: n.id, name: n.name, fallbackName: n.name }))
      )
    );

    const grid = document.getElementById('networksGrid');
    if (!grid) return;
    grid.innerHTML = '';

    details.forEach((net, idx) => {
      const displayName = net.name || net.fallbackName || pageItems[idx]?.name || 'شبكة';
      const card = document.createElement('div');
      card.className = 'network-card';
      if (net.logo_path) {
        card.innerHTML = `<img src="https://image.tmdb.org/t/p/w185${net.logo_path}" alt="${displayName}"><span class="network-card-name">${displayName}</span>`;
      } else {
        card.innerHTML = `<span style="font-size:1rem;font-weight:700;color:#fff;text-align:center;padding:8px;">${displayName}</span><span class="network-card-name">${displayName}</span>`;
      }
      card.onclick = () => openNetwork(net.id || pageItems[idx].id, displayName, 'var(--primary)');
      grid.appendChild(card);
    });

    const pag = document.getElementById('netsPagination');
    if (pag) {
      pag.innerHTML = `
        <button class="pag-btn" ${pageNum<=1?'disabled':''} onclick="openNetworksPage(${pageNum-1})">&#8249; السابق</button>
        <span class="pag-info">${pageNum} من ${totalPages}</span>
        <button class="pag-btn" ${pageNum>=totalPages?'disabled':''} onclick="openNetworksPage(${pageNum+1})">التالي &#8250;</button>
      `;
    }
  } catch(e) {
    const grid = document.getElementById('networksGrid');
    if (grid) grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== الصفحات =====
function showPage(pageId) {
  pageHistory.push(pageId);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');
  if (['homePage','seriesPage','animePage','searchPage'].includes(pageId)) {
    lastPage = pageId;
  }
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = pageId === 'homePage' ? '' : 'none';
  window.scrollTo(0, 0);
}

function goHome() {
  pageHistory = [];
  showPage('homePage');
}

function goBack() {
  pageHistory.pop();
  const prev = pageHistory[pageHistory.length - 1];

if (!prev || prev === 'homePage' || prev === 'seriesPage' || prev === 'animePage' || prev === 'searchPage' || prev === 'surprisePage') {
    const target = prev || lastPage || 'homePage';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-page="${target}"]`);
    if (btn) btn.classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = target === 'homePage' ? '' : 'none';
  } else if (prev === 'networksListPage') {
    pageHistory.pop();
    openNetworksPage(1);
  } else {
    const target = lastPage || 'homePage';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = target === 'homePage' ? '' : 'none';
  }
  window.scrollTo(0, 0);
}

// ===== جلب الأفلام =====
async function fetchMovies() {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const results = [];
    for (const p of [1,2,3,4,5]) {
      const r = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=${currentLang === 'ar' ? 'ar-SA' : 'en-US'}&page=${p}`).then(r=>r.json());
      results.push(...(r.results||[]));
    }
    renderGrid(results, 'moviesGrid', 'movie');
  } catch(e) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب المسلسلات =====
async function fetchSeries() {
  const grid = document.getElementById('seriesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const results = [];
    for (const p of [1,2,3,4,5]) {
      const r = await fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=${currentLang === 'ar' ? 'ar-SA' : 'en-US'}&page=${p}`).then(r=>r.json());
      results.push(...(r.results||[]));
    }
    renderGrid(results, 'seriesGrid', 'tv');
  } catch(e) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب الأنمي =====
async function fetchAnime() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const query = `query{Page(perPage:50){media(type:ANIME,sort:POPULARITY_DESC){id title{romaji native}coverImage{extraLarge}averageScore}}}`;
  try {
    const res = await fetch('https://graphql.anilist.co',{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query})
    });
    const data = await res.json();
    renderGrid(data.data.Page.media, 'animeGrid', 'anime');
  } catch(e) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== رندر الكروت =====
function renderGrid(items, gridId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(item => {
    const title = type==='movie' ? (item.title||item.original_title)
                : type==='tv'   ? (item.name||item.original_name)
                : (item.title?.native||item.title?.romaji||'');
    const image = type==='anime' ? item.coverImage.extraLarge
                : item.poster_path ? `${IMG_BASE}${item.poster_path}`
                : 'https://via.placeholder.com/300x450/111/555?text=No+Image';
    const rating = type==='anime'
      ? (item.averageScore ? (item.averageScore/10).toFixed(1) : '')
      : (item.vote_average ? item.vote_average.toFixed(1) : '');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${image}" alt="${title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/111/555?text=No+Image'">
        ${rating ? `<span class="card-rating">⭐ ${rating}</span>` : ''}
        <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
      </div>
      <div class="card-info"><h4>${title}</h4></div>
    `;
    card.onclick = () => openDetails(item.id, type);
    grid.appendChild(card);
  });
}
// ===== صفحة المنصة =====
const PROVIDER_MAP = {
  213:8, 49:384, 2739:337, 1024:119, 2552:350,
  4330:531, 3353:386, 453:15, 283:283, 64:43,
  56:37, 318:526, 510:510, 361:39
};

async function openNetwork(networkId, networkName, color) {
  pageHistory.push('networkPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('networkPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);

  const pid = PROVIDER_MAP[networkId];

  async function loadNetworkPage(type, pageNum) {
    window.scrollTo(0, 0);
    const grid = document.getElementById('nGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';

    let url;
    if (type === 'tv') {
      url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=${pageNum}`;
    } else {
      if (!pid) {
        grid.innerHTML = '<div class="loading">🎬 لا تتوفر أفلام لهذه القناة</div>';
        document.getElementById('nPagination').innerHTML = '';
        return;
      }
      url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_watch_providers=${pid}&watch_region=US&sort_by=popularity.desc&page=${pageNum}`;
    }

    try {
      const res = await fetch(url).then(r => r.json());
      const items = (res.results || []).filter(x => x.poster_path);
      const totalPages = Math.min(res.total_pages || 1, 135);
      grid.innerHTML = '';
      if (!items.length) {
        grid.innerHTML = '<div class="loading">لا يوجد محتوى متاح حالياً</div>';
        document.getElementById('nPagination').innerHTML = '';
        return;
      }
      items.forEach(item => {
        const title = type === 'tv'
          ? (item.name || item.original_name)
          : (item.title || item.original_title);
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-img-wrap">
            <img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">
            ${rating ? `<span class="card-rating">⭐ ${rating}</span>` : ''}
            <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
          </div>
          <div class="card-info"><h4>${title}</h4></div>
        `;
        card.onclick = () => openDetails(item.id, type);
        grid.appendChild(card);
      });
      document.getElementById('nPagination').innerHTML = `
        <button class="pag-btn" ${pageNum<=1?'disabled':''} onclick="window._nLoad('${type}',${pageNum-1})">&#8249; السابق</button>
        <span class="pag-info">${pageNum} من ${totalPages}</span>
        <button class="pag-btn" ${pageNum>=totalPages?'disabled':''} onclick="window._nLoad('${type}',${pageNum+1})">التالي &#8250;</button>
      `;
    } catch(e) {
      grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
    }
  }

  window._nLoad = loadNetworkPage;

  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="network-header" style="border-color:${color||'var(--primary)'}">
      <div class="network-logo-big" style="color:${color||'var(--primary)'};">${networkName}</div>
    </div>
    <div class="network-tabs">
      <button class="ntab active" id="nTabTv" onclick="
        document.getElementById('nTabTv').classList.add('active');
        document.getElementById('nTabMov').classList.remove('active');
        window._nLoad('tv',1);
      ">📺 المسلسلات</button>
      ${pid ? `<button class="ntab" id="nTabMov" onclick="
        document.getElementById('nTabMov').classList.add('active');
        document.getElementById('nTabTv').classList.remove('active');
        window._nLoad('movie',1);
      ">🎬 الأفلام</button>` : ''}
    </div>
    <div class="container" style="padding-top:10px">
      <div class="grid" id="nGrid"></div>
    </div>
    <div id="nPagination" style="display:flex;justify-content:center;align-items:center;gap:16px;padding:24px 0;"></div>
  `;

  loadNetworkPage('tv', 1);
}

// ===== صفحة التفاصيل =====
async function openDetails(id, type) {
  pageHistory.push('detailPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('detailPage');
  page.classList.add('active');
  page.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:20px;">
    <div style="position:relative;width:90px;height:90px;">
      <div style="position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:var(--primary);animation:spinRing 1s linear infinite;"></div>
      <div style="position:absolute;inset:8px;border-radius:50%;border:3px solid transparent;border-top-color:#ff6b35;animation:spinRing 0.7s linear infinite reverse;"></div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2rem;animation:pulseLogo 1.2s ease-in-out infinite;">🎬</div>
    </div>
    <div style="font-size:1rem;font-weight:700;color:var(--primary);letter-spacing:2px;animation:pulseLogo 1.2s ease-in-out infinite;">Cinema ROX</div>
    <div style="font-size:.8rem;opacity:.5;">جاري التحميل...</div>
  </div>
  <style>
    @keyframes spinRing { to { transform: rotate(360deg); } }
    @keyframes pulseLogo { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(0.95)} }
  </style>`;
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);

  try {
    if (type === 'anime') {
      await renderAnimeDetails(id);
    } else {
      await renderTMDBDetails(id, type);
    }
  } catch(e) {
    page.innerHTML = '<div class="loading">❌ خطأ في تحميل التفاصيل</div>';
  }
}
async function renderTMDBDetails(id, type) {
  const ep = type==='movie' ? 'movie' : 'tv';
  const [detail, credits, similar, videos, watch, reviews] = await Promise.all([
    fetch(`${TMDB_BASE}/${ep}/${id}?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/credits?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/similar?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/videos?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/watch/providers?api_key=${TMDB_KEY}`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/reviews?api_key=${TMDB_KEY}`).then(r=>r.json()),
  ]);
// جلب Fanart Logo
  let fanartLogo = '';
  if (detail.imdb_id) {
    try {
      const ftRes = await fetch(`https://webservice.fanart.tv/v3/movies/${detail.imdb_id}?api_key=${FANART_KEY}`).then(r=>r.json());
      const logos = ftRes.hdmovielogo||ftRes.movielogo||[];
      if (logos.length) fanartLogo = logos[0].url;
    } catch(e){}
  }
  const title    = type==='movie' ? (detail.title||detail.original_title) : (detail.name||detail.original_name);
  const year     = type==='movie' ? (detail.release_date||'').slice(0,4) : (detail.first_air_date||'').slice(0,4);
  const runtime  = type==='movie' ? (detail.runtime ? `${Math.floor(detail.runtime/60)}س ${detail.runtime%60}د` : '') : (detail.episode_run_time?.[0]?`${detail.episode_run_time[0]} د/حلقة`:'');
  const rating   = detail.vote_average ? detail.vote_average.toFixed(1) : '';
  const genres   = (detail.genres||[]).map(g=>g.name).join(' · ');
  const overview = detail.overview || 'لا يوجد وصف متاح بالعربي';
  const backdrop = detail.backdrop_path ? `${IMG_ORIG}${detail.backdrop_path}` : '';
  const poster   = detail.poster_path  ? `${IMG_BASE}${detail.poster_path}`   : '';
  const director = (credits.crew||[]).find(c=>c.job==='Director');
  const writers  = (credits.crew||[]).filter(c=>c.job==='Writer'||c.job==='Screenplay').slice(0,3);
  const trailer  = (videos.results||[]).find(v=>v.type==='Trailer'&&v.site==='YouTube') || (videos.results||[])[0];
  const trailerKey = trailer ? trailer.key : null;
  const allVideos  = (videos.results||[]).filter(v=>v.site==='YouTube').slice(0,6);
  const providers  = watch.results?.SA || watch.results?.US || watch.results?.AE || null;
  const streams    = providers?.flatrate || [];
  const cast       = (credits.cast||[]).slice(0,15);
  const similar2   = (similar.results||[]).filter(s=>s.poster_path).slice(0,12);
  const reviewList = (reviews.results||[]).slice(0,10);
  const isWatchlisted = isInWatchlist(id);
  const isWatchLater  = getWatchLater().some(i=>i.id===id);
  const myNote = getNotes()[id];

  let seasonsHTML = '';
  if (type==='tv' && detail.seasons) {
    seasonsHTML = await buildSeasonsHTML(id, detail.seasons);
  }

  const page = document.getElementById('detailPage');
  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>

    <!-- صورة البانر الكبيرة -->
    <div style="position:relative;width:100%;min-height:480px;background:#000;overflow:hidden;">
      ${backdrop?`<img src="${backdrop}" style="width:100%;height:480px;object-fit:cover;opacity:.6;">`:'' }
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,#0b0c10 100%);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;display:flex;gap:16px;align-items:flex-end;">
        <div style="position:relative;flex-shrink:0;">
          ${poster?`<img src="${poster}" style="width:110px;border-radius:14px;box-shadow:0 8px 24px #000a;">` :''}
        </div>
        <div style="flex:1;">
          <h1 style="font-size:1.4rem;font-weight:900;margin-bottom:8px;line-height:1.3;">${title}</h1>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            ${rating?`<span style="background:#f5a623;color:#000;padding:4px 10px;border-radius:20px;font-weight:700;font-size:.85rem;">⭐ ${rating}</span>`:''}
            ${year?`<span style="background:#ffffff20;padding:4px 10px;border-radius:20px;font-size:.85rem;">📅 ${year}</span>`:''}
            ${runtime?`<span style="background:#ffffff20;padding:4px 10px;border-radius:20px;font-size:.85rem;">⏱ ${runtime}</span>`:''}
          </div>
          ${genres?`<div style="opacity:.7;font-size:.85rem;">${genres}</div>`:''}
        </div>
      </div>
    </div>

    <!-- أزرار الأكشن -->
    <div style="display:flex;gap:10px;padding:16px;flex-wrap:wrap;">
      <button onclick="openPlayerFromDetail(${id},'${type}')" style="flex:1;min-width:120px;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:14px;font-size:1rem;font-family:inherit;cursor:pointer;font-weight:700;">▶ مشاهدة</button>
      ${trailerKey?`<button onclick="openTrailer('${trailerKey}')" style="flex:1;min-width:100px;padding:14px;background:#ffffff15;color:#fff;border:2px solid #ffffff30;border-radius:14px;font-size:1rem;font-family:inherit;cursor:pointer;">🎬 تريلر</button>`:''}
      <button id="wlBtn${id}" onclick="toggleWatchlist(${id},'${title}','${detail.poster_path||''}','${type}',this)" style="flex:1;min-width:100px;padding:14px;background:${isWatchlisted?'var(--primary)':'#ffffff15'};color:#fff;border:2px solid ${isWatchlisted?'var(--primary)':'#ffffff30'};border-radius:14px;font-size:1rem;font-family:inherit;cursor:pointer;">${isWatchlisted?'✅ في القائمة':'➕ قائمتي'}</button>
      <button id="wlBtn2${id}" onclick="toggleWatchLater(${id},'${title}','${detail.poster_path||''}','${type}',this)" style="flex:1;min-width:100px;padding:14px;background:${isWatchLater?'#1a6cff':'#ffffff15'};color:#fff;border:2px solid ${isWatchLater?'#1a6cff':'#ffffff30'};border-radius:14px;font-size:1rem;font-family:inherit;cursor:pointer;">${isWatchLater?'✅ سأشاهده':'⏰ أريد مشاهدته'}</button>
    </div>

    <!-- تقييمي وملاحظتي -->
    <div style="margin:0 16px 20px;background:#ffffff08;border-radius:16px;padding:16px;">
      <div style="font-weight:700;margin-bottom:10px;">💬 رأيك في الفيلم</div>
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        ${[1,2,3,4,5].map(s=>`<button onclick="selectStar(${id},${s})" id="star${id}_${s}" style="background:none;border:none;font-size:1.8rem;cursor:pointer;">${(myNote?.stars||0)>=s?'⭐':'☆'}</button>`).join('')}
      </div>
      <textarea id="noteText${id}" placeholder="اكتب رأيك هنا..." style="width:100%;padding:10px;border-radius:12px;border:2px solid #444;background:#111;color:#fff;font-family:inherit;font-size:.9rem;resize:none;min-height:60px;box-sizing:border-box;">${myNote?.text||''}</textarea>
      <button onclick="saveNote(${id},'${title}','${detail.poster_path||''}',document.getElementById('noteText${id}').value,window._selectedStar${id}||${myNote?.stars||0});this.textContent='✅ تم الحفظ'" style="margin-top:8px;padding:10px 20px;background:var(--primary);color:#fff;border:none;border-radius:12px;cursor:pointer;font-family:inherit;">💾 حفظ</button>
    </div>

    <div style="padding:0 16px;">

      <!-- القصة -->
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">📖 القصة</h2>
        <p style="line-height:1.8;opacity:.85;">${overview}</p>
      </div>

      <!-- المخرج والكتّاب -->
      ${director||writers.length?`
      <div style="margin-bottom:24px;">
        ${director?`<div style="margin-bottom:6px;"><span style="opacity:.6;">المخرج: </span><span style="font-weight:700;">${director.name}</span></div>`:''}
        ${writers.length?`<div><span style="opacity:.6;">الكتابة: </span><span style="font-weight:700;">${writers.map(w=>w.name).join('، ')}</span></div>`:''}
      </div>`:''}

      <!-- أين تشاهده -->
      ${streams.length?`
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">📺 أين تشاهده</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${streams.map(p=>`<div style="display:flex;align-items:center;gap:8px;background:#ffffff10;padding:8px 14px;border-radius:12px;"><img src="https://image.tmdb.org/t/p/w92${p.logo_path}" style="width:28px;border-radius:6px;"><span style="font-size:.9rem;">${p.provider_name}</span></div>`).join('')}
        </div>
      </div>`:''}

      <!-- الممثلون -->
      ${cast.length?`
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">🎭 الممثلون</h2>
        <div class="cast-row" id="castRow${id}">
          ${cast.map(a=>`
            <div style="text-align:center;min-width:80px;max-width:80px;">
              <img src="${a.profile_path?IMG_BASE+a.profile_path:'https://via.placeholder.com/100x100/1a1a2e/555?text=👤'}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;margin-bottom:6px;" loading="lazy">
              <div style="font-size:.75rem;font-weight:700;line-height:1.2;">${a.name}</div>
              <div style="font-size:.7rem;opacity:.6;line-height:1.2;">${a.character||''}</div>
            </div>`).join('')}
        </div>
      </div>`:''}

      <!-- المواسم -->
      ${seasonsHTML}

      <!-- التقييمات والمراجعات -->
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;color:var(--primary);">⭐ التقييمات والمراجعات</h2>
        <div style="background:#ffffff08;border-radius:20px;padding:20px;margin-bottom:16px;text-align:center;">
          <svg viewBox="0 0 200 120" width="200" height="120" style="overflow:visible;">
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ffffff15" stroke-width="10" stroke-linecap="round"/>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#ratingGrad)" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="251.2"
              stroke-dashoffset="${251.2 - (251.2 * Math.min((detail.vote_average||0)/10, 1))}"/>
            <defs>
              <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#00c6ff"/>
                <stop offset="100%" style="stop-color:#f5a623"/>
              </linearGradient>
            </defs>
            <text x="100" y="95" text-anchor="middle" fill="#fff" font-size="28" font-weight="900" font-family="Tajawal">${rating||'—'}</text>
            <text x="100" y="115" text-anchor="middle" fill="#888" font-size="11" font-family="Tajawal">${detail.vote_count?detail.vote_count.toLocaleString()+' تقييم':''}</text>
          </svg>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;">
            <div style="background:#ffffff0d;border-radius:14px;padding:12px;text-align:center;">
              <div style="font-size:1.5rem;margin-bottom:4px;">🍅</div>
              <div style="font-size:1.1rem;font-weight:900;color:#fa320a;" id="rtScore_${id}">—</div>
              <div style="font-size:.7rem;opacity:.6;margin-top:2px;">Rotten Tomatoes</div>
            </div>
            <div style="background:#ffffff0d;border-radius:14px;padding:12px;text-align:center;">
              <div style="background:#f5c518;color:#000;font-weight:900;font-size:.75rem;padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:4px;">IMDb</div>
              <div style="font-size:1.1rem;font-weight:900;color:#f5c518;" id="imdbScore_${id}">—</div>
              <div style="font-size:.7rem;opacity:.6;margin-top:2px;">IMDb</div>
            </div>
            <div style="background:#ffffff0d;border-radius:14px;padding:12px;text-align:center;">
              <div style="font-size:1.5rem;margin-bottom:4px;">🎬</div>
              <div style="font-size:1.1rem;font-weight:900;color:#a8e063;" id="tmdbScore_${id}">${rating||'—'}/10</div>
              <div style="font-size:.7rem;opacity:.6;margin-top:2px;">TMDB</div>
            </div>
          </div>
        </div>
        ${reviewList.length?`
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${reviewList.map(r=>`
            <div style="background:#ffffff08;border-radius:16px;padding:16px;border:1px solid #ffffff0d;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),#ff6b35);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;flex-shrink:0;">${r.author?.charAt(0).toUpperCase()||'؟'}</div>
                <div style="flex:1;">
                  <div style="font-weight:700;font-size:.9rem;">${r.author||'مجهول'}</div>
                  <div style="font-size:.75rem;opacity:.5;">${r.created_at?new Date(r.created_at).toLocaleDateString('ar-SA'):''}</div>
                </div>
                ${r.author_details?.rating?`<div style="background:#f5a62320;color:#f5a623;padding:4px 10px;border-radius:20px;font-size:.8rem;font-weight:700;">⭐ ${r.author_details.rating}/10</div>`:''}
              </div>
              <p style="font-size:.85rem;line-height:1.7;opacity:.85;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${r.content||''}</p>
            </div>`).join('')}
        </div>`:'<div style="text-align:center;opacity:.4;padding:20px;">لا توجد مراجعات بعد</div>'}
      </div>

      <!-- التريلرات -->
      ${allVideos.length?`
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">🎞️ مقاطع الفيديو</h2>
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;">
          ${allVideos.map(v=>`
            <div onclick="openTrailer('${v.key}')" style="flex-shrink:0;width:200px;cursor:pointer;">
              <div style="position:relative;border-radius:12px;overflow:hidden;">
                <img src="https://img.youtube.com/vi/${v.key}/mqdefault.jpg" style="width:200px;height:112px;object-fit:cover;">
                <div style="position:absolute;inset:0;background:#0006;display:flex;align-items:center;justify-content:center;font-size:2rem;">▶</div>
              </div>
              <div style="font-size:.8rem;margin-top:6px;opacity:.8;">${v.name}</div>
            </div>`).join('')}
        </div>
      </div>`:''}

      <!-- مشابهة -->
      ${similar2.length?`
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">🎬 مشابهة</h2>
        <div class="similar-row" id="simRow${id}">
          ${similar2.map(s=>{
            const st=type==='movie'?(s.title||s.original_title):(s.name||s.original_name);
            const sr=s.vote_average?s.vote_average.toFixed(1):'';
            return `<div class="similar-card" onclick="openDetails(${s.id},'${type}')"><div class="similar-img-wrap"><img src="${IMG_BASE}${s.poster_path}" alt="${st}" loading="lazy">${sr?`<span class="card-rating">⭐ ${sr}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="similar-title">${st}</span></div>`;
          }).join('')}
        </div>
      </div>`:''}

    </div>
  `;
  initRowDrag('castRow'+id);
  initRowDrag('simRow'+id);
       if (type === 'movie' && detail.imdb_id) {
    fetch(`https://www.omdbapi.com/?i=${detail.imdb_id}&apikey=${OMDB_KEY}`)
      .then(r=>r.json())
      .then(d=>{
        const rt   = document.getElementById('rtScore_'+id);
        const imdb = document.getElementById('imdbScore_'+id);
        if (rt) {
          const rottenScore = (d.Ratings||[]).find(r=>r.Source==='Rotten Tomatoes');
          if (rottenScore) rt.textContent = rottenScore.Value;
        }
        if (imdb && d.imdbRating && d.imdbRating!=='N/A') {
          imdb.textContent = d.imdbRating;
        }
      }).catch(()=>{});
       }                                                                                                                                                                                                                                          }

async function buildSeasonsHTML(seriesId, seasons) {
  const real = seasons.filter(s=>s.season_number>0);
  if (!real.length) return '';
  const data = await fetch(`${TMDB_BASE}/tv/${seriesId}/season/${real[0].season_number}?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json());
  return `
  <section class="detail-section">
    <h2 class="detail-section-title">📋 المواسم والحلقات</h2>
    <div class="season-tabs" id="stabs${seriesId}">
      ${real.map((s,i)=>`<button class="season-tab ${i===0?'active':''}" onclick="loadSeason(${seriesId},${s.season_number},this)">موسم ${s.season_number}</button>`).join('')}
    </div>
    <div class="episodes-list" id="eplist${seriesId}">${buildEpisodesHTML(data.episodes||[])}</div>
  </section>`;
}

function buildEpisodesHTML(eps) {
  if (!eps.length) return '<p style="color:#aaa;padding:10px 0">لا توجد حلقات</p>';
  return eps.map(ep=>`
    <div class="episode-row">
      <span class="ep-num">${ep.episode_number}</span>
      <div class="ep-info">
        <span class="ep-name">${ep.name||'حلقة '+ep.episode_number}</span>
        <span class="ep-date">${ep.air_date?'📅 '+ep.air_date:''}</span>
      </div>
      <button class="ep-play-btn" onclick="openPlayerEpisode(${ep.show_id||0},${ep.season_number},${ep.episode_number})">▶</button>
    </div>`).join('');
}

async function loadSeason(seriesId, num, btn) {
  btn.closest('.season-tabs').querySelectorAll('.season-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const list = document.getElementById('eplist'+seriesId);
  list.innerHTML = '<div class="loading" style="padding:20px 0">⏳</div>';
  const data = await fetch(`${TMDB_BASE}/tv/${seriesId}/season/${num}?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json());
  list.innerHTML = buildEpisodesHTML(data.episodes||[]);
}

async function renderAnimeDetails(id) {
  const query = `query($id:Int){Media(id:$id){id title{romaji native}coverImage{extraLarge}bannerImage averageScore episodes duration genres description(asHtml:false) startDate{year} characters(sort:ROLE,perPage:15){nodes{name{full}image{medium}}} recommendations(perPage:10){nodes{mediaRecommendation{id title{romaji native}coverImage{extraLarge}averageScore}}} trailer{site id}}}`;
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
      <section class="detail-section">
        <h2 class="detail-section-title">📖 القصة</h2>
        <p class="detail-overview">${overview}</p>
      </section>
      ${cast.length?`
      <section class="detail-section">
        <h2 class="detail-section-title">🎭 الشخصيات</h2>
        <div class="cast-row" id="aCast${id}">
          ${cast.map(c=>`<div class="cast-card"><img src="${c.image?.medium||'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}" alt="${c.name.full}" loading="lazy"><span class="cast-name">${c.name.full}</span></div>`).join('')}
        </div>
      </section>`:''}
      ${recs.length?`
      <section class="detail-section">
        <h2 class="detail-section-title">✨ أنمي مشابه</h2>
        <div class="similar-row" id="aRec${id}">
          ${recs.map(n=>{const r=n.mediaRecommendation;const rt=r.title.native||r.title.romaji;const rs=r.averageScore?(r.averageScore/10).toFixed(1):'';return `<div class="similar-card" onclick="openDetails(${r.id},'anime')"><div class="similar-img-wrap"><img src="${r.coverImage.extraLarge}" alt="${rt}" loading="lazy">${rs?`<span class="card-rating">⭐ ${rs}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="similar-title">${rt}</span></div>`;}).join('')}
        </div>
      </section>`:''}
    </div>
  `;
  initRowDrag('aCast'+id);
  initRowDrag('aRec'+id);
}

// ===== قائمة المشاهدة =====
function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}
function isInWatchlist(id) {
  return getWatchlist().some(i => i.id === id);
}
function toggleWatchlist(id, title, poster, type, btn) {
  let list = getWatchlist();
  if (isInWatchlist(id)) {
    list = list.filter(i => i.id !== id);
    btn.textContent = '➕ قائمتي';
    btn.classList.remove('active');
  } else {
    list.push({ id, title, poster, type });
    btn.textContent = '✅ في القائمة';
    btn.classList.add('active');
  }
  localStorage.setItem('watchlist', JSON.stringify(list));
}
// ===== صفحة قائمتي =====
function openWatchlistPage() {
  pageHistory.push('watchlistPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('watchlistPage').classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  const grid = document.getElementById('watchlistGrid');
  const list = getWatchlist();
  if (!list.length) {
    grid.innerHTML = '<div class="loading">لا يوجد أفلام في قائمتك بعد ❤️</div>';
    return;
  }
  grid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${IMG_BASE}${item.poster}" alt="${item.title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x450/111/555?text=No+Image'">
        <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
      </div>
      <div class="card-info"><h4>${item.title}</h4>
        <span class="type-badge">${item.type==='movie'?'🎬 فيلم':'📺 مسلسل'}</span>
      </div>
    `;
    card.onclick = () => openDetails(item.id, item.type);
    grid.appendChild(card);
  });
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
  updateServerBtn();
}
function nextServer() {
  if (currentServerIndex < currentServers.length-1) { currentServerIndex++; loadServer(currentServerIndex); }
  else alert('لا يوجد سيرفر آخر');
}
function updateServerBtn() {
  const btn = document.getElementById('nextServerBtn');
  if (btn) btn.textContent = `🔄 سيرفر ${currentServerIndex+1}/${currentServers.length}`;
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

// ===== البحث =====
async function doSearch() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return;
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري البحث...</div>';
  try {
    const [m, t] = await Promise.all([
      fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=ar-SA&query=${encodeURIComponent(q)}`).then(r=>r.json()),
      fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&language=ar-SA&query=${encodeURIComponent(q)}`).then(r=>r.json()),
    ]);
    const all = [...(m.results||[]).map(r=>({...r,_type:'movie'})),...(t.results||[]).map(r=>({...r,_type:'tv'}))].filter(r=>r.poster_path);
    grid.innerHTML = '';
    if (!all.length) { grid.innerHTML='<div class="loading">لا توجد نتائج</div>'; return; }
    all.forEach(item=>{
      const title=item._type==='movie'?(item.title||item.original_title):(item.name||item.original_name);
      const rating=item.vote_average?item.vote_average.toFixed(1):'';
      const card=document.createElement('div');
      card.className='card';
      card.innerHTML=`<div class="card-img-wrap"><img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}<div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div></div><div class="card-info"><h4>${title}</h4><span class="type-badge">${item._type==='movie'?'🎬 فيلم':'📺 مسلسل'}</span></div>`;
      card.onclick=()=>openDetails(item.id,item._type);
      grid.appendChild(card);
    });
  } catch(e) { grid.innerHTML='<div class="loading">❌ خطأ في البحث</div>'; }
}

// ===== زر الأعلى =====
function initScrollTop() {
  const btn = document.createElement('button');
  btn.id = 'scrollTopBtn';
  btn.innerHTML = '↑';
  btn.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 400 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 400 ? 'all' : 'none';
  });
}

// ===== HERO BANNER =====
let heroMovies = [];
let heroIndex  = 0;
let heroTimer  = null;

async function initHero() {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=1`);
    const data = await res.json();
    heroMovies = (data.results||[]).filter(m=>m.poster_path).slice(0,8);
    if (!heroMovies.length) return;
    buildHeroDots();
    showHero(0);
    initHeroSwipe();
    heroTimer = setInterval(()=>{ heroIndex=(heroIndex+1)%heroMovies.length; showHero(heroIndex); }, 5000);
  } catch(e) {}
}

function buildHeroDots() {
  const dots = document.getElementById('heroDots');
  if (!dots) return;
  dots.innerHTML = '';
  heroMovies.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = 'hero-dot'+(i===0?' active':'');
    d.onclick = ()=>{
      clearInterval(heroTimer); showHero(i); heroIndex=i;
      heroTimer=setInterval(()=>{ heroIndex=(heroIndex+1)%heroMovies.length; showHero(heroIndex); },5000);
    };
    dots.appendChild(d);
  });
}

function initHeroSwipe() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;
  let startX = 0;
  carousel.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; }, {passive:true});
  carousel.addEventListener('touchend', e=>{
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    clearInterval(heroTimer);
    if (diff > 0) { heroIndex=(heroIndex+1)%heroMovies.length; }
    else          { heroIndex=(heroIndex-1+heroMovies.length)%heroMovies.length; }
    showHero(heroIndex);
    heroTimer=setInterval(()=>{ heroIndex=(heroIndex+1)%heroMovies.length; showHero(heroIndex); },5000);
  }, {passive:true});
}

function showHero(idx) {
  const carousel = document.getElementById('heroCarousel');
  const title    = document.getElementById('heroTitle');
  const yearTag  = document.getElementById('heroYearTag');
  const meta     = document.getElementById('heroMeta');
  const watchBtn = document.getElementById('heroWatchBtn');
  const infoBtn  = document.getElementById('heroInfoBtn');
  if (!carousel || !heroMovies.length) return;

  const total     = heroMovies.length;
  const positions = ['left2','left1','center','right1','right2'];
  const offsets   = [-2,-1,0,1,2];

  carousel.innerHTML = '';
  offsets.forEach((offset, pi) => {
    const mi    = ((idx + offset) % total + total) % total;
    const m     = heroMovies[mi];
    if (!m || !m.poster_path) return;
    const slide = document.createElement('div');
    slide.className = `hero-slide ${positions[pi]}`;
    slide.innerHTML = `<img src="${IMG_BASE}${m.poster_path}" alt="${m.title||''}" loading="lazy">`;
    if (positions[pi] !== 'center') {
      slide.onclick = () => {
        clearInterval(heroTimer);
        const newIdx = ((idx + offset) % total + total) % total;
        showHero(newIdx); heroIndex = newIdx;
        heroTimer = setInterval(()=>{ heroIndex=(heroIndex+1)%heroMovies.length; showHero(heroIndex); },5000);
      };
    }
    carousel.appendChild(slide);
  });

  const m = heroMovies[idx];
  if (title)   title.textContent  = m.title || m.original_title || '';
  const year   = (m.release_date||'').slice(0,4);
  if (yearTag) yearTag.textContent = year;
  const rating = m.vote_average ? m.vote_average.toFixed(1) : '';
  if (meta) meta.innerHTML = `
    ${rating?`<span class="hero-tag rating-tag">⭐ ${rating}</span>`:''}
    ${year?`<span class="hero-tag">📅 ${year}</span>`:''}
    <span class="hero-tag">🎬 فيلم</span>
  `;
  if (watchBtn) watchBtn.onclick = ()=>openPlayerFromDetail(m.id,'movie');
  if (infoBtn)  infoBtn.onclick  = ()=>openDetails(m.id,'movie');
  document.querySelectorAll('.hero-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
}
// ===== END HERO =====
// ===== END HERO =====
// ===== تهيئة =====
// ===== FLOATING ROX MENU =====
let roxMenuOpen = false;
function toggleRoxMenu() {
  roxMenuOpen = !roxMenuOpen;
  const menu    = document.getElementById('roxMenu');
  const overlay = document.getElementById('roxOverlay');
  const btn     = document.getElementById('bnavBrowse');
  if (roxMenuOpen) {
    menu.classList.add('open');
    overlay.classList.add('open');
    if (btn) btn.style.transform = 'rotate(45deg) scale(1.12)';
  } else {
    menu.classList.remove('open');
    overlay.classList.remove('open');
    if (btn) btn.style.transform = '';
  }
}
// ===== END FLOATING MENU =====
window.onload = () => {
  loadSettings();
applyLang();
  // Splash
  setTimeout(function() {
    var s = document.getElementById('splash-screen');
    if (s) { s.style.opacity='0'; s.style.visibility='hidden'; }
    setTimeout(function() { var s2=document.getElementById('splash-screen'); if(s2) s2.remove(); }, 700);
  }, 2500);

  initHero();
  loadHomePage();
  initScrollTop();
  fetchMovies();
  fetchSeries();
  fetchAnime();

  document.getElementById('searchInput').addEventListener('keydown',e=>{ if(e.key==='Enter') doSearch(); });
  document.getElementById('playerModal').addEventListener('click',function(e){ if(e.target===this) closePlayer(); });
  document.getElementById('settingsModal').addEventListener('click',function(e){ if(e.target===this) closeSettings(); });
};

setInterval(()=>{ fetchMovies(); fetchSeries(); fetchAnime(); }, 600000);
// ===== فاجئني =====
async function openSurprisePage() {
  pageHistory.push('surprisePage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('surprisePage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  page.innerHTML = '<div class="loading" style="padding:120px 0">🎲 جاري اختيار فيلم مفاجئ لك...</div>';
  try {
    const randPage = Math.floor(Math.random() * 20) + 1;
    const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=${lang}&page=${randPage}`).then(r=>r.json());
    const movies = (res.results||[]).filter(m=>m.poster_path&&m.overview);
    const movie = movies[Math.floor(Math.random() * movies.length)];
    if (!movie) { page.innerHTML = '<div class="loading">❌ حاول مرة ثانية</div>'; return; }
    page.innerHTML = `
      <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
      <div style="max-width:500px;margin:40px auto;padding:20px;text-align:center;">
        <div style="font-size:3rem;margin-bottom:16px;">🎲</div>
        <h2 style="margin-bottom:20px;color:var(--primary)">فيلمك المفاجئ!</h2>
        <img src="${IMG_ORIG}${movie.poster_path}" style="width:200px;border-radius:16px;box-shadow:0 8px 32px #0008;margin-bottom:20px;">
        <h3 style="margin-bottom:8px;">${movie.title||movie.original_title}</h3>
        <p style="opacity:.7;margin-bottom:20px;line-height:1.6;">${movie.overview.slice(0,150)}...</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button onclick="openDetails(${movie.id},'movie')" style="padding:12px 24px;background:var(--primary);color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:1rem;font-family:inherit;">ℹ️ التفاصيل</button>
          <button onclick="openPlayerFromDetail(${movie.id},'movie')" style="padding:12px 24px;background:#222;color:#fff;border:2px solid var(--primary);border-radius:12px;cursor:pointer;font-size:1rem;font-family:inherit;">▶ مشاهدة</button>
          <button onclick="openSurprisePage()" style="padding:12px 24px;background:#333;color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:1rem;font-family:inherit;">🎲 فيلم آخر</button>
        </div>
      </div>
    `;
  } catch(e) {
    page.innerHTML = '<div class="loading">❌ خطأ، حاول مرة ثانية</div>';
  }
}

// ===== إحصائياتي =====
function openStatsPage() {
  pageHistory.push('statsPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('statsPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);

  const list = getWatchlist();
  const total = list.length;
  const movies = list.filter(i=>i.type==='movie').length;
  const series = list.filter(i=>i.type==='tv').length;
  const anime  = list.filter(i=>i.type==='anime').length;

  page.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div style="max-width:500px;margin:40px auto;padding:20px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:3rem;">📊</div>
        <h2 style="color:var(--primary);margin-top:8px;">إحصائياتي</h2>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <div style="background:var(--bg2);border-radius:16px;padding:20px;text-align:center;border:2px solid var(--primary);">
          <div style="font-size:2.5rem;font-weight:900;color:var(--primary)">${total}</div>
          <div style="opacity:.7;margin-top:4px;">إجمالي قائمتي</div>
        </div>
        <div style="background:var(--bg2);border-radius:16px;padding:20px;text-align:center;">
          <div style="font-size:2.5rem;font-weight:900;">🎬 ${movies}</div>
          <div style="opacity:.7;margin-top:4px;">أفلام</div>
        </div>
        <div style="background:var(--bg2);border-radius:16px;padding:20px;text-align:center;">
          <div style="font-size:2.5rem;font-weight:900;">📺 ${series}</div>
          <div style="opacity:.7;margin-top:4px;">مسلسلات</div>
        </div>
        <div style="background:var(--bg2);border-radius:16px;padding:20px;text-align:center;">
          <div style="font-size:2.5rem;font-weight:900;">✨ ${anime}</div>
          <div style="opacity:.7;margin-top:4px;">أنمي</div>
        </div>
      </div>
      ${total === 0 ? '<div style="text-align:center;opacity:.6;padding:20px;">أضف أفلام لقائمتك لترى إحصائياتك! ❤️</div>' : ''}
    </div>
  `;
}

// ===== بحث سريع من الإعدادات =====
function doQuickSearch() {
  const q = document.getElementById('quickSearchInput').value.trim();
  if (!q) return;
  closeSettings();
  document.getElementById('searchInput').value = q;
  showPage('searchPage');
  doSearch();
    }
// ===== فيلم اليوم =====
async function openMovieOfDayPage() {
  pageHistory.push('movieOfDayPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('movieOfDayPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  page.innerHTML = '<div class="loading" style="padding:120px 0">🌍 جاري تحميل فيلم اليوم...</div>';

  const today = new Date().toDateString();
  const cached = localStorage.getItem('movieOfDay');
  const cachedDate = localStorage.getItem('movieOfDayDate');

  try {
    let movie;
    if (cached && cachedDate === today) {
      movie = JSON.parse(cached);
    } else {
      const seed = new Date().getDate();
      const res = await fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=${currentLang==='ar'?'ar-SA':'en-US'}&page=${seed%5+1}`).then(r=>r.json());
      const movies = (res.results||[]).filter(m=>m.poster_path&&m.overview);
      movie = movies[seed % movies.length];
      localStorage.setItem('movieOfDay', JSON.stringify(movie));
      localStorage.setItem('movieOfDayDate', today);
    }

    const now = new Date();
    const midnight = new Date(); midnight.setHours(24,0,0,0);
    const diff = midnight - now;
    const h = Math.floor(diff/3600000);
    const m = Math.floor((diff%3600000)/60000);

    page.innerHTML = `
      <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
      <div style="max-width:500px;margin:40px auto;padding:20px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:8px;">🌍</div>
        <h2 style="color:var(--primary);margin-bottom:4px;">فيلم اليوم</h2>
        <div style="opacity:.6;font-size:.9rem;margin-bottom:20px;">يتغير بعد: ${h}س ${m}د ⏳</div>
        <img src="${IMG_ORIG}${movie.poster_path}" style="width:200px;border-radius:16px;box-shadow:0 8px 32px #0008;margin-bottom:20px;">
        <h3 style="margin-bottom:8px;">${movie.title||movie.original_title}</h3>
        <div style="margin-bottom:12px;">⭐ ${movie.vote_average?movie.vote_average.toFixed(1):''}</div>
        <p style="opacity:.7;margin-bottom:24px;line-height:1.7;">${(movie.overview||'').slice(0,200)}...</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button onclick="openDetails(${movie.id},'movie')" style="padding:12px 24px;background:var(--primary);color:#fff;border:none;border-radius:12px;cursor:pointer;font-size:1rem;font-family:inherit;">ℹ️ التفاصيل</button>
          <button onclick="openPlayerFromDetail(${movie.id},'movie')" style="padding:12px 24px;background:#222;color:#fff;border:2px solid var(--primary);border-radius:12px;cursor:pointer;font-size:1rem;font-family:inherit;">▶ مشاهدة</button>
        </div>
      </div>
    `;
  } catch(e) {
    page.innerHTML = '<div class="loading">❌ خطأ، حاول مرة ثانية</div>';
  }
}

// ===== أريد مشاهدته =====
function getWatchLater() { return JSON.parse(localStorage.getItem('watchLater')||'[]'); }
function toggleWatchLater(id, title, poster, type, btn) {
  let list = getWatchLater();
  if (list.some(i=>i.id===id)) {
    list = list.filter(i=>i.id!==id);
    if(btn){ btn.textContent='🕐 أريد مشاهدته'; btn.classList.remove('active'); }
  } else {
    list.push({id,title,poster,type,addedAt:new Date().toLocaleDateString('ar')});
    if(btn){ btn.textContent='✅ في القائمة'; btn.classList.add('active'); }
  }
  localStorage.setItem('watchLater', JSON.stringify(list));
}
function openWatchLaterPage() {
  pageHistory.push('watchLaterPage');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('watchLaterPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if(hero) hero.style.display='none';
  window.scrollTo(0,0);
  const list = getWatchLater();
  if(!list.length){
    page.innerHTML=`<button class="back-btn" onclick="goBack()">&#8594; رجوع</button><div class="loading" style="padding:120px 0">لا يوجد أفلام بعد ⏰<br><small style="opacity:.6">أضف أفلام تريد مشاهدتها لاحقاً</small></div>`;
    return;
  }
  page.innerHTML=`
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="container">
      <h2 class="section-title">⏰ أريد مشاهدته (${list.length})</h2>
      <div class="grid" id="watchLaterGrid"></div>
    </div>
  `;
  const grid = document.getElementById('watchLaterGrid');
  list.forEach(item=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <div class="card-img-wrap">
        <img src="${IMG_BASE}${item.poster}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/111/555?text=No+Image'">
        <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
      </div>
      <div class="card-info"><h4>${item.title}</h4>
        <span style="font-size:.75rem;opacity:.6;">أُضيف: ${item.addedAt||''}</span>
      </div>
    `;
    card.onclick=()=>openDetails(item.id,item.type);
    grid.appendChild(card);
  });
}
function selectStar(movieId, stars) {
  window['_selectedStar'+movieId] = stars;
  for(let s=1;s<=5;s++){
    const btn = document.getElementById(`star${movieId}_${s}`);
    if(btn) btn.textContent = s<=stars ? '⭐' : '☆';
  }
}
// ===== ملاحظاتي =====
function getNotes() { return JSON.parse(localStorage.getItem('myNotes')||'{}'); }
function saveNote(id, title, poster, text, stars) {
  const notes = getNotes();
  notes[id] = {id, title, poster, text, stars, date: new Date().toLocaleDateString('ar')};
  localStorage.setItem('myNotes', JSON.stringify(notes));
}
function openNotesPage() {
  pageHistory.push('notesPage');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('notesPage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if(hero) hero.style.display='none';
  window.scrollTo(0,0);
  renderNotesPage();
}
function renderNotesPage() {
  const page = document.getElementById('notesPage');
  const notes = getNotes();
  const list = Object.values(notes);
  if(!list.length){
    page.innerHTML=`<button class="back-btn" onclick="goBack()">&#8594; رجوع</button><div class="loading" style="padding:120px 0">لا توجد ملاحظات بعد 💬<br><small style="opacity:.6">افتح أي فيلم واكتب رأيك</small></div>`;
    return;
  }
  page.innerHTML=`
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
    <div class="container">
      <h2 class="section-title">💬 ملاحظاتي (${list.length})</h2>
      <div style="display:flex;flex-direction:column;gap:16px;padding-bottom:40px;">
        ${list.map(n=>`
          <div style="background:var(--bg2);border-radius:16px;padding:16px;display:flex;gap:14px;align-items:flex-start;">
            <img src="${IMG_BASE}${n.poster}" style="width:60px;border-radius:10px;flex-shrink:0;" onerror="this.style.display='none'">
            <div style="flex:1;">
              <div style="font-weight:700;margin-bottom:4px;">${n.title}</div>
              <div style="margin-bottom:6px;">${'⭐'.repeat(n.stars||0)}${'☆'.repeat(5-(n.stars||0))}</div>
              <div style="opacity:.8;font-size:.9rem;line-height:1.5;">${n.text}</div>
              <div style="opacity:.5;font-size:.75rem;margin-top:6px;">${n.date}</div>
            </div>
            <button onclick="deleteNote(${n.id})" style="background:none;border:none;color:#e50914;font-size:1.2rem;cursor:pointer;">🗑️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function deleteNote(id) {
  const notes = getNotes();
  delete notes[id];
  localStorage.setItem('myNotes', JSON.stringify(notes));
  renderNotesPage();
}

// ===== AI توصيات ذكية =====
async function openAIRecommendations() {
  pageHistory.push('surprisePage');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page = document.getElementById('surprisePage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if(hero) hero.style.display='none';
  window.scrollTo(0,0);
  page.innerHTML='<div class="loading" style="padding:120px 0">🤖 جاري تحليل ذوقك...</div>';

  const list = getWatchlist();
  if(!list.length){
    page.innerHTML=`<button class="back-btn" onclick="goBack()">&#8594; رجوع</button><div class="loading" style="padding:80px 0">أضف أفلام لقائمتك أولاً ❤️<br><small style="opacity:.6">حتى نتعرف على ذوقك</small></div>`;
    return;
  }

  try {
    const randomPick = list[Math.floor(Math.random()*list.length)];
    const lang = currentLang==='ar'?'ar-SA':'en-US';
    const res = await fetch(`${TMDB_BASE}/movie/${randomPick.id}/recommendations?api_key=${TMDB_KEY}&language=${lang}`).then(r=>r.json());
    const recs = (res.results||[]).filter(m=>m.poster_path).slice(0,12);

    page.innerHTML=`
      <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
      <div class="container">
        <div style="text-align:center;padding:24px 0 16px;">
          <div style="font-size:2.5rem;">🤖</div>
          <h2 style="color:var(--primary);margin:8px 0 4px;">توصيات ذكية لك</h2>
          <p style="opacity:.6;font-size:.9rem;">بناءً على "${randomPick.title}"</p>
        </div>
        <div class="grid" id="aiGrid"></div>
      </div>
    `;
    const grid = document.getElementById('aiGrid');
    recs.forEach(item=>{
      const title=item.title||item.original_title;
      const rating=item.vote_average?item.vote_average.toFixed(1):'';
      const card=document.createElement('div');
      card.className='card';
      card.innerHTML=`<div class="card-img-wrap"><img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}<div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div></div><div class="card-info"><h4>${title}</h4></div>`;
      card.onclick=()=>openDetails(item.id,'movie');
      // ===== صفحة مكتبتي (Trakt Style) =====
function renderLibraryPage() {
  const page = document.getElementById('libraryPage');
  if (!page) return;
  window.scrollTo(0, 0);

  const watchlist  = getWatchlist();
  const watchLater = getWatchLater();
  const notes      = Object.values(getNotes());

  const movies   = watchlist.filter(i => (i.type||'movie') === 'movie');
  const series   = watchlist.filter(i => i.type === 'tv');

  function makeRow(items, sectionTitle, viewAllFn) {
    if (!items.length) return '';
    const cards = items.slice(0, 10).map(i => `
      <div onclick="openDetails(${i.id},'${i.type||'movie'}')"
           style="flex:0 0 110px;cursor:pointer;">
        <div style="width:110px;height:160px;border-radius:12px;overflow:hidden;
                    background:var(--bg2);border:1px solid rgba(255,255,255,0.08);
                    position:relative;">
          <img src="https://image.tmdb.org/t/p/w300${i.poster}" alt="${i.title}"
               style="width:100%;height:100%;object-fit:cover;"
               onerror="this.src='https://via.placeholder.com/110x160/111/555?text=?'">
        </div>
        <div style="font-size:11px;color:#ccc;margin-top:6px;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                    width:110px;">${i.title}</div>
        <div style="font-size:10px;color:#888;">${i.title}</div>
      </div>
    `).join('');

    return `
      <div style="margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:0 4% 10px;">
          <div style="font-size:16px;font-weight:800;border-bottom:2px solid var(--primary);
                      padding-bottom:4px;">${sectionTitle}</div>
          <button onclick="${viewAllFn}"
                  style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
                         color:#fff;padding:6px 14px;border-radius:20px;cursor:pointer;
                         font-family:'Tajawal',sans-serif;font-size:12px;">
            عرض الكل ›
          </button>
        </div>
        <div style="display:flex;gap:12px;overflow-x:auto;padding:4px 4% 8px;
                    scrollbar-width:none;">
          ${cards}
        </div>
      </div>
    `;
  }

  function makeNotesRow() {
    if (!notes.length) return '';
    const cards = notes.slice(0, 10).map(n => `
      <div onclick="openDetails(${n.id},'movie')" style="flex:0 0 110px;cursor:pointer;">
        <div style="width:110px;height:160px;border-radius:12px;overflow:hidden;
                    background:var(--bg2);border:1px solid rgba(255,255,255,0.08);">
          <img src="https://image.tmdb.org/t/p/w300${n.poster}" alt="${n.title}"
               style="width:100%;height:100%;object-fit:cover;"
               onerror="this.src='https://via.placeholder.com/110x160/111/555?text=?'">
        </div>
        <div style="font-size:11px;color:#ccc;margin-top:6px;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                    width:110px;">${n.title}</div>
        <div style="font-size:10px;color:var(--gold);">${'⭐'.repeat(n.stars||0)}</div>
      </div>
    `).join('');
    return `
      <div style="margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:0 4% 10px;">
          <div style="font-size:16px;font-weight:800;border-bottom:2px solid var(--primary);
                      padding-bottom:4px;">💬 ملاحظاتي</div>
          <button onclick="openNotesPage()"
                  style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
                         color:#fff;padding:6px 14px;border-radius:20px;cursor:pointer;
                         font-family:'Tajawal',sans-serif;font-size:12px;">
            عرض الكل ›
          </button>
        </div>
        <div style="display:flex;gap:12px;overflow-x:auto;padding:4px 4% 8px;
                    scrollbar-width:none;">
          ${cards}
        </div>
      </div>
    `;
  }

  const isEmpty = !watchlist.length && !watchLater.length && !notes.length;

  page.innerHTML = `
    <div style="padding-top:24px;padding-bottom:80px;">
      <div style="padding:0 4% 20px;">
        <h2 style="font-size:22px;font-weight:900;">📚 مكتبتي</h2>
      </div>
      ${isEmpty ? `
        <div style="text-align:center;padding:80px 20px;opacity:.5;">
          <div style="font-size:3rem;margin-bottom:16px;">📭</div>
          <div style="font-size:1rem;">مكتبتك فارغة حتى الآن</div>
          <div style="font-size:.85rem;margin-top:8px;">أضف أفلام ومسلسلات من صفحة التفاصيل</div>
        </div>
      ` : ''}
      ${makeRow(watchlist,  '❤️ قائمتي',       'openWatchlistPage()')}
      ${makeRow(watchLater, '⏰ سأشاهده لاحقاً', 'openWatchLaterPage()')}
      ${makeRow(movies,     '🎥 أفلام',         'openWatchlistPage()')}
      ${makeRow(series,     '📺 مسلسلات',       'openWatchlistPage()')}
      ${makeNotesRow()}
    </div>
  `;
}
      grid.appendChild(card);
    });
  } catch(e) {
    page.innerHTML='<div class="loading">❌ خطأ، حاول مرة ثانية</div>';
  }
}
// ===== تحميل الصفحة الرئيسية =====
async function loadHomePage() {
  const lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';

  async function fillRow(id, url, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<div style="padding:20px;opacity:.5;">⏳</div>';
    try {
      const r = await fetch(url).then(r => r.json());
      const items = r.results || r.media || [];
      if (!items.length) { el.innerHTML = ''; return; }
      el.innerHTML = items.slice(0, 15).map(item => {
        const title = type === 'movie' ? (item.title || item.original_title)
                    : type === 'tv'   ? (item.name || item.original_name)
                    : (item.title?.native || item.title?.romaji || '');
        const poster = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                     : item.coverImage?.extraLarge || '';
        const rating = item.vote_average ? item.vote_average.toFixed(1)
                     : item.averageScore ? (item.averageScore/10).toFixed(1) : '';
        return `
          <div onclick="openDetails(${item.id},'${type}')"
               style="flex:0 0 110px;cursor:pointer;">
            <div style="width:110px;height:160px;border-radius:12px;overflow:hidden;
                        background:#1a1a2e;position:relative;">
              <img src="${poster}" alt="${title}" loading="lazy"
                   style="width:100%;height:100%;object-fit:cover;"
                   onerror="this.src='https://via.placeholder.com/110x160/111/555?text=?'">
              ${rating ? `<span style="position:absolute;bottom:6px;right:6px;
                background:rgba(0,0,0,.7);color:#f5a623;font-size:10px;
                padding:2px 6px;border-radius:8px;">⭐${rating}</span>` : ''}
            </div>
            <div style="font-size:11px;color:#ccc;margin-top:6px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                        width:110px;">${title}</div>
          </div>`;
      }).join('');
    } catch(e) { if (el) el.innerHTML = ''; }
  }

  fillRow('homeMoviesTrending',
    `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=${lang}`, 'movie');
  fillRow('homeMoviesPopular',
    `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=${lang}`, 'movie');
  fillRow('homeMoviesTopRated',
    `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=${lang}`, 'movie');
  fillRow('homeSeriesTrending',
    `${TMDB_BASE}/trending/tv/week?api_key=${TMDB_KEY}&language=${lang}`, 'tv');
// المنصات
  const platformsEl = document.getElementById('homePlatforms');
  if (platformsEl) {
    const platforms = [
      { id: 213,  name: 'Netflix',    logo: 'https://image.tmdb.org/t/p/w92/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',  color: '#e50914' },
      { id: 49,   name: 'HBO',        logo: 'https://image.tmdb.org/t/p/w92/tuomPhY2UtuPTqqFnKMVHvSb724.jpg',  color: '#8A2BE2' },
      { id: 2739, name: 'Disney+',    logo: 'https://image.tmdb.org/t/p/w92/uzKjVDmQ1WRMvGBb7UNRE0wTn1H.jpg', color: '#113CCF' },
      { id: 1024, name: 'Amazon',     logo: 'https://image.tmdb.org/t/p/w92/ifhbNuuVnlwYy5oXA5VIb2YR8AZ.jpg', color: '#00A8E1' },
      { id: 2552, name: 'Apple TV+',  logo: 'https://image.tmdb.org/t/p/w92/6mckdnFtOJL1AeRIFITuO2769s4.jpg', color: '#555555' },
      { id: 4330, name: 'Paramount+', logo: 'https://image.tmdb.org/t/p/w92/fi83B1oztoS47xxcemFdPMhIzK.jpg',  color: '#0064FF' },
      { id: 453,  name: 'Hulu',       logo: 'https://image.tmdb.org/t/p/w92/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg', color: '#1CE783' },
    ];
    platformsEl.innerHTML = platforms.map(p => `
      <div onclick="openNetwork(${p.id},'${p.name}','${p.color}')"
           style="flex:0 0 100px;cursor:pointer;text-align:center;">
        <div style="width:100px;height:60px;border-radius:12px;
                    background:${p.color}33;border:2px solid ${p.color}66;
                    display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:13px;font-weight:900;
                       text-align:center;padding:4px;">${p.name}</span>
        </div>
      </div>
    `).join('');
        }
  // الأنمي
  const animeEl = document.getElementById('homeAnime');
  if (animeEl) {
    animeEl.innerHTML = '<div style="padding:20px;opacity:.5;">⏳</div>';
    try {
      const q = `query{Page(perPage:15){media(type:ANIME,sort:POPULARITY_DESC){id title{romaji native}coverImage{extraLarge}averageScore}}}`;
      const res = await fetch('https://graphql.anilist.co', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:q})
      });
      const data = await res.json();
      const animes = data.data.Page.media || [];
      animeEl.innerHTML = animes.map(item => {
        const title = item.title?.native || item.title?.romaji || '';
        const poster = item.coverImage?.extraLarge || '';
        const rating = item.averageScore ? (item.averageScore/10).toFixed(1) : '';
        return `
          <div onclick="openDetails(${item.id},'anime')"
               style="flex:0 0 110px;cursor:pointer;">
            <div style="width:110px;height:160px;border-radius:12px;overflow:hidden;
                        background:#1a1a2e;position:relative;">
              <img src="${poster}" alt="${title}" loading="lazy"
                   style="width:100%;height:100%;object-fit:cover;">
              ${rating ? `<span style="position:absolute;bottom:6px;right:6px;
                background:rgba(0,0,0,.7);color:#f5a623;font-size:10px;
                padding:2px 6px;border-radius:8px;">⭐${rating}</span>` : ''}
            </div>
            <div style="font-size:11px;color:#ccc;margin-top:6px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                        width:110px;">${title}</div>
          </div>`;
      }).join('');
    } catch(e) { animeEl.innerHTML = ''; }
  }
  // ===== أخبار السينما =====
  const newsEl = document.getElementById('homeNews');
  if (newsEl) {
    newsEl.innerHTML = '<div style="padding:20px;opacity:.5;">⏳</div>';
    try {
      const nRes = await fetch(`https://newsapi.org/v2/everything?q=cinema+movies&language=ar&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_KEY}`).then(r=>r.json());
      const articles = (nRes.articles||[]).filter(a=>a.urlToImage&&a.title);
      if (articles.length) {
        newsEl.innerHTML = articles.map(a=>`
          <div onclick="window.open('${a.url}','_blank')" class="news-card">
            <div class="news-img-wrap">
              <img src="${a.urlToImage}" alt="${a.title}" loading="lazy" onerror="this.parentElement.parentElement.style.display='none'">
              <div class="news-gradient"></div>
            </div>
            <div class="news-info">
              <span class="news-source">${a.source?.name||'أخبار'}</span>
              <p class="news-title">${a.title.slice(0,70)}${a.title.length>70?'...':''}</p>
              <span class="news-date">${new Date(a.publishedAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>`).join('');
      } else {
        // fallback: أخبار إنجليزية
        const nRes2 = await fetch(`https://newsapi.org/v2/everything?q=movies+cinema+2025&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_KEY}`).then(r=>r.json());
        const arts2 = (nRes2.articles||[]).filter(a=>a.urlToImage&&a.title);
        newsEl.innerHTML = arts2.map(a=>`
          <div onclick="window.open('${a.url}','_blank')" class="news-card">
            <div class="news-img-wrap">
              <img src="${a.urlToImage}" alt="${a.title}" loading="lazy" onerror="this.parentElement.parentElement.style.display='none'">
              <div class="news-gradient"></div>
            </div>
            <div class="news-info">
              <span class="news-source">${a.source?.name||'News'}</span>
              <p class="news-title">${a.title.slice(0,70)}${a.title.length>70?'...':''}</p>
              <span class="news-date">${new Date(a.publishedAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>`).join('');
      }
    } catch(e) { newsEl.innerHTML = ''; }
                }
      }
function toggleCircle(id, fn) {
  const el = document.getElementById(id);
  if (el) {
    el.style.transform = 'scale(0.88)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
  }
  setTimeout(() => { fn(); }, 200);
}
// ===== صفحة المركز =====
function openCenterPage() {
  pageHistory.push('surprisePage');
  const page = document.getElementById('surprisePage');
  page.classList.add('active');
  window.scrollTo(0, 0);
  page.innerHTML = `
    <div style="padding:50px 4% 100px;text-align:center;">
      <h2 style="font-size:22px;font-weight:900;margin-bottom:40px;">🎬 مركز Cinema ROX</h2>
      <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">

        <div style="text-align:center;cursor:pointer;" onclick="toggleCircle('movieCircle',openMovieOfDayPage)">
          <div id="movieCircle" style="width:90px;height:90px;border-radius:50%;
               background:linear-gradient(135deg,#e50914,#8B0000);
               display:flex;align-items:center;justify-content:center;
               margin:0 auto 10px;font-size:2.2rem;
               box-shadow:0 4px 20px rgba(229,9,20,0.5);
               transition:transform 0.2s;">🎥</div>
          <div style="font-weight:700;font-size:13px;">فيلم اليوم</div>
        </div>

        <div style="text-align:center;cursor:pointer;" onclick="toggleCircle('statsCircle',openStatsPage)">
          <div id="statsCircle" style="width:90px;height:90px;border-radius:50%;
               background:linear-gradient(135deg,#1a6cff,#0a3d8f);
               display:flex;align-items:center;justify-content:center;
               margin:0 auto 10px;font-size:2.2rem;
               box-shadow:0 4px 20px rgba(26,108,255,0.5);
               transition:transform 0.2s;">📊</div>
          <div style="font-weight:700;font-size:13px;">إحصائياتي</div>
        </div>

        <div style="text-align:center;cursor:pointer;" onclick="toggleCircle('surpriseCircle',openSurprisePage)">
          <div id="surpriseCircle" style="width:90px;height:90px;border-radius:50%;
               background:linear-gradient(135deg,#f5a623,#c47d0e);
               display:flex;align-items:center;justify-content:center;
               margin:0 auto 10px;font-size:2.2rem;
               box-shadow:0 4px 20px rgba(245,166,35,0.5);
               transition:transform 0.2s;">🎲</div>
          <div style="font-weight:700;font-size:13px;">فاجئني</div>
        </div>

        <div style="text-align:center;cursor:pointer;" onclick="toggleCircle('aiCircle',openAiPage)">
          <div id="aiCircle" style="width:90px;height:90px;border-radius:50%;
               background:linear-gradient(135deg,#1ce783,#0a8f4a);
               display:flex;align-items:center;justify-content:center;
               margin:0 auto 10px;font-size:2.2rem;
               box-shadow:0 4px 20px rgba(28,231,131,0.5);
               transition:transform 0.2s;">🤖</div>
          <div style="font-weight:700;font-size:13px;">اختياري</div>
        </div>

      </div>
    </div>
  `;
}

function openAiPage() {
  pageHistory.push('surprisePage');
  const page = document.getElementById('surprisePage');
  page.classList.add('active');
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = 'none';
  const list = getWatchlist();
  if (!list.length) {
    page.innerHTML = `
      <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
      <div style="text-align:center;padding:80px 20px;opacity:.6;">
        <div style="font-size:3rem;">🤖</div>
        <div style="margin-top:16px;">أضف أفلام لقائمتك أولاً لأقترح عليك</div>
      </div>`;
    return;
  }
  const rand = list[Math.floor(Math.random() * list.length)];
  fetch(`${TMDB_BASE}/movie/${rand.id}/recommendations?api_key=${TMDB_KEY}&language=${currentLang==='ar'?'ar-SA':'en-US'}`)
    .then(r=>r.json()).then(data=>{
      const items = (data.results||[]).filter(m=>m.poster_path).slice(0,12);
      page.innerHTML = `
        <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
        <div style="padding:60px 4% 100px;">
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:2rem;">🤖</div>
            <h2 style="color:var(--primary);margin:8px 0 4px;">توصيات ذكية لك</h2>
            <p style="opacity:.6;font-size:.85rem;">بناءً على "${rand.title}"</p>
          </div>
          <div class="grid">${items.map(m=>`
            <div class="card" onclick="openDetails(${m.id},'movie')">
              <div class="card-img-wrap">
                <img src="${IMG_BASE}${m.poster_path}" alt="${m.title}" loading="lazy">
                <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
              </div>
              <div class="card-info"><h4>${m.title||m.original_title}</h4></div>
            </div>`).join('')}
          </div>
        </div>`;
    }).catch(()=>{
      page.innerHTML = `<button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
        <div style="text-align:center;padding:80px 20px;opacity:.6;">❌ حاول مرة ثانية</div>`;
    });
}
