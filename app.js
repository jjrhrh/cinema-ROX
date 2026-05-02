const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG  = 'https://image.tmdb.org/t/p/original';

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
  if (bg)    document.documentElement.style.setProperty('--bg', bg);
  if (bg2)   document.documentElement.style.setProperty('--bg2', bg2);
}

// ===== الصفحات =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');
  if (['moviesPage','seriesPage','animePage','searchPage'].includes(pageId)) {
    lastPage = pageId;
  }
  window.scrollTo(0, 0);
}

function goHome() {
  showPage('moviesPage');
}

function goBack() {
  showPage(lastPage);
}

// ===== جلب الأفلام =====
async function fetchMovies() {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const results = await Promise.all(
      [1,2,3,4,5].map(p =>
        fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r=>r.json()).then(d=>d.results||[])
      )
    );
    renderGrid(results.flat(), 'moviesGrid', 'movie');
  } catch(e) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب المسلسلات =====
async function fetchSeries() {
  const grid = document.getElementById('seriesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const results = await Promise.all(
      [1,2,3,4,5].map(p =>
        fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r=>r.json()).then(d=>d.results||[])
      )
    );
    renderGrid(results.flat(), 'seriesGrid', 'tv');
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
                : (item.title.native||item.title.romaji);
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
async function openNetwork(networkId, networkName, color) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('networkPage');
  page.classList.add('active');
  page.innerHTML = `<div class="loading" style="padding:120px 0">⏳ جاري تحميل ${networkName}...</div>`;
  window.scrollTo(0, 0);

  try {
    const [tvRes1,tvRes2,tvRes3,tvRes4,tvRes5,movRes1,movRes2,movRes3,movRes4,movRes5] = await Promise.all([
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=1`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=2`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=3`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=4`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_networks=${networkId}&sort_by=popularity.desc&page=5`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_companies=${networkId}&sort_by=popularity.desc&page=1`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_companies=${networkId}&sort_by=popularity.desc&page=2`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_companies=${networkId}&sort_by=popularity.desc&page=3`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_companies=${networkId}&sort_by=popularity.desc&page=4`).then(r=>r.json()),
fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_companies=${networkId}&sort_by=popularity.desc&page=5`).then(r=>r.json()),
    ]);

    const tvItems  = (tvRes.results||[]).filter(x=>x.poster_path);
const movItems = (movRes.results||[]).filter(x=>x.poster_path);

    page.innerHTML = `
      <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>
      <div class="network-header" style="border-color:${color||'var(--primary)'}">
        <div class="network-logo-big" style="color:${color||'var(--primary)'}">${networkName}</div>
      </div>
      <div class="network-tabs">
        <button class="ntab active" onclick="switchNetworkTab(this,'ntv')">📺 المسلسلات</button>
        <button class="ntab" onclick="switchNetworkTab(this,'nmov')">🎬 الأفلام</button>
      </div>
      <div class="container" style="padding-top:10px">
        <div class="grid" id="ntv">
          ${tvItems.length ? '' : '<div class="loading">لا توجد مسلسلات متاحة</div>'}
        </div>
        <div class="grid" id="nmov" style="display:none">
          ${movItems.length ? '' : '<div class="loading">لا توجد أفلام متاحة</div>'}
        </div>
      </div>
    `;

    tvItems.forEach(item => {
      const title = item.name||item.original_name;
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">
          ${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}
          <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
        </div>
        <div class="card-info"><h4>${title}</h4></div>
      `;
      card.onclick = () => openDetails(item.id, 'tv');
      document.getElementById('ntv').appendChild(card);
    });

    movItems.forEach(item => {
      const title = item.title||item.original_title;
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">
          ${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}
          <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
        </div>
        <div class="card-info"><h4>${title}</h4></div>
      `;
      card.onclick = () => openDetails(item.id, 'movie');
      document.getElementById('nmov').appendChild(card);
    });

  } catch(e) {
    page.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

function switchNetworkTab(btn, targetId) {
  document.querySelectorAll('.ntab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('ntv').style.display = 'none';
  document.getElementById('nmov').style.display = 'none';
  document.getElementById(targetId).style.display = 'grid';
}

// ===== صفحة التفاصيل =====
async function openDetails(id, type) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('detailPage');
  page.classList.add('active');
  page.innerHTML = '<div class="loading" style="padding:120px 0">⏳ جاري التحميل...</div>';
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
  const [detail, credits, similar, videos, watch] = await Promise.all([
    fetch(`${TMDB_BASE}/${ep}/${id}?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/credits?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/similar?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/videos?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${ep}/${id}/watch/providers?api_key=${TMDB_KEY}`).then(r=>r.json()),
  ]);

  const title    = type==='movie' ? (detail.title||detail.original_title) : (detail.name||detail.original_name);
  const year     = type==='movie' ? (detail.release_date||'').slice(0,4) : (detail.first_air_date||'').slice(0,4);
  const runtime  = type==='movie' ? (detail.runtime?`${detail.runtime} د`:'') : (detail.episode_run_time?.[0]?`${detail.episode_run_time[0]} د/حلقة`:'');
  const rating   = detail.vote_average ? detail.vote_average.toFixed(1) : '';
  const genres   = (detail.genres||[]).map(g=>g.name).join(' · ');
  const overview = detail.overview || 'لا يوجد وصف متاح بالعربي';
  const backdrop = detail.backdrop_path ? `${IMG_ORIG}${detail.backdrop_path}` : '';
  const poster   = detail.poster_path  ? `${IMG_BASE}${detail.poster_path}`   : '';

  const trailer    = (videos.results||[]).find(v=>v.type==='Trailer'&&v.site==='YouTube') || (videos.results||[])[0];
  const trailerKey = trailer ? trailer.key : null;
  const providers  = watch.results?.SA || watch.results?.US || watch.results?.AE || null;
  const streams    = providers?.flatrate || [];
  const cast       = (credits.cast||[]).slice(0,15);
  const similar2   = (similar.results||[]).filter(s=>s.poster_path).slice(0,12);

  let seasonsHTML = '';
  if (type==='tv' && detail.seasons) {
    seasonsHTML = await buildSeasonsHTML(id, detail.seasons);
  }

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
          </div>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <section class="detail-section">
        <h2 class="detail-section-title">📖 القصة</h2>
        <p class="detail-overview">${overview}</p>
      </section>
      ${streams.length?`
      <section class="detail-section">
        <h2 class="detail-section-title">📺 أين تشاهده</h2>
        <div class="providers-row">
          ${streams.map(p=>`<div class="provider-chip"><img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}"><span>${p.provider_name}</span></div>`).join('')}
        </div>
      </section>`:''}
      ${cast.length?`
      <section class="detail-section">
        <h2 class="detail-section-title">🎭 الممثلون</h2>
        <div class="cast-row" id="castRow${id}">
          ${cast.map(a=>`<div class="cast-card"><img src="${a.profile_path?IMG_BASE+a.profile_path:'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}" alt="${a.name}" loading="lazy"><span class="cast-name">${a.name}</span><span class="cast-char">${a.character||''}</span></div>`).join('')}
        </div>
      </section>`:''}
      ${seasonsHTML}
      ${similar2.length?`
      <section class="detail-section">
        <h2 class="detail-section-title">🎬 مشابهة</h2>
        <div class="similar-row" id="simRow${id}">
          ${similar2.map(s=>{
            const st=type==='movie'?(s.title||s.original_title):(s.name||s.original_name);
            const sr=s.vote_average?s.vote_average.toFixed(1):'';
            return `<div class="similar-card" onclick="openDetails(${s.id},'${type}')"><div class="similar-img-wrap"><img src="${IMG_BASE}${s.poster_path}" alt="${st}" loading="lazy">${sr?`<span class="card-rating">⭐ ${sr}</span>`:''}<div class="card-overlay"><span class="play-btn">▶</span></div></div><span class="similar-title">${st}</span></div>`;
          }).join('')}
        </div>
      </section>`:''}
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

// ===== شريط المنصات =====
function initPlatformsCarousel() {
  const track=document.getElementById('pltTrack');
  const outer=document.getElementById('pltOuter');
  const btnP=document.getElementById('pltPrev');
  const btnN=document.getElementById('pltNext');
  if (!track||!outer||!btnP||!btnN) return;
  let drag=false,sx=0,sl=0,cx=0;
  const CW=132;
  function clamp(v){ return Math.min(0,Math.max(-(track.scrollWidth-outer.clientWidth+40),v)); }
  function setX(x){ cx=clamp(x); track.style.transform=`translateX(${cx}px)`; }
  track.addEventListener('mousedown',e=>{ drag=true;sx=e.clientX;sl=cx;track.classList.add('is-dragging'); });
  window.addEventListener('mousemove',e=>{ if(!drag) return; setX(sl+(e.clientX-sx)); });
  window.addEventListener('mouseup',()=>{ drag=false;track.classList.remove('is-dragging'); });
  track.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX;sl=cx; },{passive:true});
  track.addEventListener('touchmove',e=>{ setX(sl+(e.touches[0].clientX-sx)); },{passive:true});
  btnN.addEventListener('click',()=>setX(cx-CW*3));
  btnP.addEventListener('click',()=>setX(cx+CW*3));
}

// ===== تهيئة =====
window.onload = () => {
  loadSettings();
  initHero();
  // ===== إخفاء السبلاش =====
  setTimeout(function() {
    var s = document.getElementById('splash-screen');
    if (s) { s.style.opacity='0'; s.style.visibility='hidden'; }
    setTimeout(function() {
      var s2 = document.getElementById('splash-screen');
      if (s2) s2.remove();
    }, 700);
  }, 2500);
  // ===========================
  fetchMovies();
  fetchSeries();
  fetchAnime();
  initPlatformsCarousel();
  document.getElementById('searchInput').addEventListener('keydown',e=>{ if(e.key==='Enter') doSearch(); });
  document.getElementById('playerModal').addEventListener('click',function(e){ if(e.target===this) closePlayer(); });
  document.getElementById('settingsModal').addEventListener('click',function(e){ if(e.target===this) closeSettings(); });
};
// ===== HERO BANNER =====
let heroMovies = [];
let heroIndex = 0;
let heroTimer = null;

async function initHero() {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=1`);
    const data = await res.json();
    heroMovies = (data.results || []).filter(m => m.backdrop_path && m.overview).slice(0, 8);
    if (!heroMovies.length) return;
    buildHeroDots();
    showHero(0);
    heroTimer = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroMovies.length;
      showHero(heroIndex);
    }, 5000);
  } catch(e) {}
}

function buildHeroDots() {
  const dots = document.getElementById('heroDots');
  if (!dots) return;
  dots.innerHTML = '';
  heroMovies.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => { clearInterval(heroTimer); showHero(i); heroIndex = i; heroTimer = setInterval(() => { heroIndex = (heroIndex+1)%heroMovies.length; showHero(heroIndex); }, 5000); };
    dots.appendChild(d);
  });
}

function showHero(i) {
  const m = heroMovies[i];
  if (!m) return;
  const banner = document.getElementById('heroBanner');
  const title  = document.getElementById('heroTitle');
  const desc   = document.getElementById('heroDesc');
  const meta   = document.getElementById('heroMeta');
  const watchBtn = document.getElementById('heroWatchBtn');
  const infoBtn  = document.getElementById('heroInfoBtn');
  if (!banner) return;

  banner.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${m.backdrop_path}')`;
  title.textContent = m.title || m.original_title;
  desc.textContent  = m.overview;
  const rating = m.vote_average ? m.vote_average.toFixed(1) : '';
  const year   = (m.release_date || '').slice(0, 4);
  meta.innerHTML = `
    ${rating ? `<span class="hero-rating">⭐ ${rating}</span>` : ''}
    ${year    ? `<span>📅 ${year}</span>` : ''}
    <span>🎬 فيلم</span>
  `;
  watchBtn.onclick = () => openPlayerFromDetail(m.id, 'movie');
  infoBtn.onclick  = () => openDetails(m.id, 'movie');

  document.querySelectorAll('.hero-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
  });

  if (title) {
    title.style.animation = 'none';
    title.offsetHeight;
    title.style.animation = 'heroFadeIn 0.8s ease';
  }
}
// ===== END HERO =====
setInterval(()=>{ fetchMovies(); fetchSeries(); fetchAnime(); }, 600000);
