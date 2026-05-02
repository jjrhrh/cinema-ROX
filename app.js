
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
  if (['moviesPage','seriesPage','animePage','searchPage'].includes(pageId)) {
    lastPage = pageId;
  }
  const hero = document.getElementById('heroBanner');
  if (hero) hero.style.display = pageId === 'moviesPage' ? '' : 'none';
  window.scrollTo(0, 0);
}

function goHome() {
  pageHistory = [];
  showPage('moviesPage');
}

function goBack() {
  pageHistory.pop();
  const prev = pageHistory[pageHistory.length - 1];

  if (!prev || prev === 'moviesPage' || prev === 'seriesPage' || prev === 'animePage' || prev === 'searchPage') {
    const target = prev || lastPage || 'moviesPage';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`[data-page="${target}"]`);
    if (btn) btn.classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = target === 'moviesPage' ? '' : 'none';
  } else if (prev === 'networksListPage') {
    pageHistory.pop();
    openNetworksPage(1);
  } else {
    const target = lastPage || 'moviesPage';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
    const hero = document.getElementById('heroBanner');
    if (hero) hero.style.display = target === 'moviesPage' ? '' : 'none';
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
  page.innerHTML = '<div class="loading" style="padding:120px 0">⏳ جاري التحميل...</div>';
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
    fetch(`${TMDB_BASE}/${ep}/${id}/reviews?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
  ]);

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
  const reviewList = (reviews.results||[]).slice(0,5);
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
    <div style="position:relative;width:100%;min-height:340px;background:#000;overflow:hidden;">
      ${backdrop?`<img src="${backdrop}" style="width:100%;height:340px;object-fit:cover;opacity:.5;">`:'' }
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,#0b0c10 100%);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;display:flex;gap:16px;align-items:flex-end;">
        ${poster?`<img src="${poster}" style="width:110px;border-radius:14px;box-shadow:0 8px 24px #000a;flex-shrink:0;">` :''}
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

      <!-- التعليقات -->
      ${reviewList.length?`
      <div style="margin-bottom:24px;">
        <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;color:var(--primary);">💬 تعليقات المشاهدين</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${reviewList.map(r=>`
            <div style="background:#ffffff08;border-radius:14px;padding:14px;">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;">${r.author?.charAt(0).toUpperCase()||'؟'}</div>
                <div>
                  <div style="font-weight:700;font-size:.9rem;">${r.author||'مجهول'}</div>
                  ${r.author_details?.rating?`<div style="font-size:.8rem;opacity:.7;">⭐ ${r.author_details.rating}/10</div>`:''}
                </div>
              </div>
              <p style="font-size:.85rem;line-height:1.7;opacity:.85;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${r.content||''}</p>
            </div>`).join('')}
        </div>
      </div>`:''}

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
                                                                                                                                                                                                                                                 }

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
      grid.appendChild(card);
    });
  } catch(e) {
    page.innerHTML='<div class="loading">❌ خطأ، حاول مرة ثانية</div>';
  }
}
