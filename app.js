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

// ===== عرض صفحة =====
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== جلب الأفلام =====
async function fetchMovies() {
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const pages = [1,2,3,4,5];
    const results = await Promise.all(
      pages.map(p =>
        fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r=>r.json()).then(d=>d.results||[])
      )
    );
    renderGrid(results.flat(), 'moviesGrid', 'movie');
  } catch(err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب المسلسلات =====
async function fetchSeries() {
  const grid = document.getElementById('seriesGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  try {
    const pages = [1,2,3,4,5];
    const results = await Promise.all(
      pages.map(p =>
        fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=ar-SA&page=${p}`)
          .then(r=>r.json()).then(d=>d.results||[])
      )
    );
    renderGrid(results.flat(), 'seriesGrid', 'tv');
  } catch(err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== جلب الأنمي =====
async function fetchAnime() {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const query = `query {
    Page(perPage:50) {
      media(type:ANIME, sort:POPULARITY_DESC) {
        id title { romaji native } coverImage { extraLarge } averageScore
      }
    }
  }`;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({query})
    });
    const data = await res.json();
    renderGrid(data.data.Page.media, 'animeGrid', 'anime');
  } catch(err) {
    grid.innerHTML = '<div class="loading">❌ خطأ في التحميل</div>';
  }
}

// ===== رندر الكروت =====
function renderGrid(items, gridId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach(item => {
    const title = type==='movie'
      ? (item.title||item.original_title)
      : type==='tv'
      ? (item.name||item.original_name)
      : (item.title.native||item.title.romaji);

    const image = type==='anime'
      ? item.coverImage.extraLarge
      : item.poster_path
      ? `${IMG_BASE}${item.poster_path}`
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

// ============================================================
// صفحة التفاصيل
// ============================================================
async function openDetails(id, type) {
  // إخفاء كل الصفحات وإظهار صفحة التفاصيل
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const detailPage = document.getElementById('detailPage');
  detailPage.classList.add('active');
  detailPage.innerHTML = '<div class="loading" style="padding:100px 0">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);

  try {
    if (type === 'anime') {
      await renderAnimeDetails(id);
    } else {
      await renderTMDBDetails(id, type);
    }
  } catch(e) {
    detailPage.innerHTML = '<div class="loading">❌ خطأ في تحميل التفاصيل</div>';
  }
}

// ===== تفاصيل فيلم/مسلسل TMDB =====
async function renderTMDBDetails(id, type) {
  const endpoint = type==='movie' ? 'movie' : 'tv';

  const [detail, credits, similar, videos, watch] = await Promise.all([
    fetch(`${TMDB_BASE}/${endpoint}/${id}?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${endpoint}/${id}/credits?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${endpoint}/${id}/similar?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${endpoint}/${id}/videos?api_key=${TMDB_KEY}&language=ar-SA`).then(r=>r.json()),
    fetch(`${TMDB_BASE}/${endpoint}/${id}/watch/providers?api_key=${TMDB_KEY}`).then(r=>r.json()),
  ]);

  const title   = type==='movie' ? (detail.title||detail.original_title) : (detail.name||detail.original_name);
  const year    = type==='movie'
    ? (detail.release_date||'').slice(0,4)
    : (detail.first_air_date||'').slice(0,4);
  const runtime = type==='movie'
    ? (detail.runtime ? `${detail.runtime} د` : '')
    : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} د/حلقة` : '');
  const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : '';
  const genres  = (detail.genres||[]).map(g=>g.name).join(' · ');
  const overview= detail.overview || 'لا يوجد وصف متاح بالعربي';
  const backdrop= detail.backdrop_path ? `${IMG_ORIG}${detail.backdrop_path}` : '';
  const poster  = detail.poster_path  ? `${IMG_BASE}${detail.poster_path}`   : '';

  // تريلر
  const trailer = (videos.results||[]).find(v=>v.type==='Trailer' && v.site==='YouTube')
               || (videos.results||[])[0];
  const trailerKey = trailer ? trailer.key : null;

  // منصات المشاهدة
  const providers = watch.results?.SA || watch.results?.US || watch.results?.AE || null;
  const streamProviders = providers?.flatrate || [];

  // الممثلون
  const cast = (credits.cast||[]).slice(0, 15);

  // مشابهة
  const similarItems = (similar.results||[]).filter(s=>s.poster_path).slice(0,12);

  // مواسم وحلقات (للمسلسلات فقط)
  let seasonsHTML = '';
  if (type === 'tv' && detail.seasons) {
    seasonsHTML = await buildSeasonsHTML(id, detail.seasons);
  }

  const detailPage = document.getElementById('detailPage');
  detailPage.innerHTML = `
    <!-- زر الرجوع -->
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>

    <!-- الغلاف -->
    <div class="detail-hero" style="background-image:url('${backdrop}')">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        ${poster ? `<img class="detail-poster" src="${poster}" alt="${title}">` : ''}
        <div class="detail-meta">
          <h1 class="detail-title">${title}</h1>
          <div class="detail-badges">
            ${year    ? `<span class="badge">📅 ${year}</span>` : ''}
            ${runtime ? `<span class="badge">⏱ ${runtime}</span>` : ''}
            ${rating  ? `<span class="badge gold">⭐ ${rating}</span>` : ''}
          </div>
          ${genres ? `<div class="detail-genres">${genres}</div>` : ''}
          <div class="detail-btns">
            <button class="btn-watch" onclick="openPlayerFromDetail(${id},'${type}')">▶ مشاهدة</button>
            ${trailerKey ? `<button class="btn-trailer" onclick="openTrailer('${trailerKey}')">🎬 تريلر</button>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="detail-body">

      <!-- القصة -->
      <section class="detail-section">
        <h2 class="detail-section-title">📖 القصة</h2>
        <p class="detail-overview">${overview}</p>
      </section>

      <!-- المنصات -->
      ${streamProviders.length ? `
      <section class="detail-section">
        <h2 class="detail-section-title">📺 أين تشاهده</h2>
        <div class="providers-row">
          ${streamProviders.map(p=>`
            <div class="provider-chip">
              <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}">
              <span>${p.provider_name}</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}

      <!-- الممثلون -->
      ${cast.length ? `
      <section class="detail-section">
        <h2 class="detail-section-title">🎭 الممثلون</h2>
        <div class="cast-row" id="castRow_${id}">
          ${cast.map(a=>`
            <div class="cast-card">
              <img src="${a.profile_path ? IMG_BASE+a.profile_path : 'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}"
                   alt="${a.name}" loading="lazy">
              <span class="cast-name">${a.name}</span>
              <span class="cast-char">${a.character||''}</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}

      <!-- مواسم وحلقات -->
      ${seasonsHTML}

      <!-- مشابهة -->
      ${similarItems.length ? `
      <section class="detail-section">
        <h2 class="detail-section-title">🎬 مشابهة</h2>
        <div class="similar-row" id="similarRow_${id}">
          ${similarItems.map(s=>{
            const st = type==='movie'?(s.title||s.original_title):(s.name||s.original_name);
            const sr = s.vote_average ? s.vote_average.toFixed(1) : '';
            return `
            <div class="similar-card" onclick="openDetails(${s.id},'${type}')">
              <div class="similar-img-wrap">
                <img src="${IMG_BASE}${s.poster_path}" alt="${st}" loading="lazy">
                ${sr ? `<span class="card-rating">⭐ ${sr}</span>` : ''}
                <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
              </div>
              <span class="similar-title">${st}</span>
            </div>`;
          }).join('')}
        </div>
      </section>` : ''}

    </div>
  `;

  // تفعيل السحب على صفوف الأفقية
  initRowDrag('castRow_'+id);
  initRowDrag('similarRow_'+id);
}

// ===== بناء HTML للمواسم والحلقات =====
async function buildSeasonsHTML(seriesId, seasons) {
  const realSeasons = seasons.filter(s => s.season_number > 0);
  if (!realSeasons.length) return '';

  // جلب تفاصيل الموسم الأول افتراضياً
  const firstSeason = realSeasons[0];
  const seasonData = await fetch(
    `${TMDB_BASE}/tv/${seriesId}/season/${firstSeason.season_number}?api_key=${TMDB_KEY}&language=ar-SA`
  ).then(r=>r.json());

  let tabsHTML = realSeasons.map((s,i)=>`
    <button class="season-tab ${i===0?'active':''}"
      onclick="loadSeason(${seriesId}, ${s.season_number}, this)">
      موسم ${s.season_number}
    </button>
  `).join('');

  let epsHTML = buildEpisodesHTML(seasonData.episodes||[]);

  return `
  <section class="detail-section">
    <h2 class="detail-section-title">📋 المواسم والحلقات</h2>
    <div class="season-tabs" id="seasonTabs_${seriesId}">${tabsHTML}</div>
    <div class="episodes-list" id="episodesList_${seriesId}">${epsHTML}</div>
  </section>`;
}

function buildEpisodesHTML(episodes) {
  if (!episodes.length) return '<p style="color:#aaa;padding:10px 0">لا توجد حلقات متاحة</p>';
  return episodes.map(ep=>`
    <div class="episode-row">
      <span class="ep-num">${ep.episode_number}</span>
      <div class="ep-info">
        <span class="ep-name">${ep.name||'حلقة '+ep.episode_number}</span>
        <span class="ep-date">${ep.air_date ? '📅 '+ep.air_date : ''}</span>
      </div>
      <button class="ep-play-btn" onclick="openPlayerEpisode(${ep.show_id||0}, ${ep.season_number}, ${ep.episode_number})">▶</button>
    </div>
  `).join('');
}

async function loadSeason(seriesId, seasonNum, btn) {
  // تحديث الأزرار
  btn.closest('.season-tabs').querySelectorAll('.season-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');

  const list = document.getElementById('episodesList_'+seriesId);
  list.innerHTML = '<div class="loading" style="padding:30px 0">⏳ جاري التحميل...</div>';

  const data = await fetch(
    `${TMDB_BASE}/tv/${seriesId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar-SA`
  ).then(r=>r.json());

  list.innerHTML = buildEpisodesHTML(data.episodes||[]);
}

// ===== تفاصيل أنمي =====
async function renderAnimeDetails(id) {
  const query = `query($id:Int){
    Media(id:$id){
      id title{romaji native english}
      coverImage{extraLarge}
      bannerImage
      averageScore episodes duration
      genres description(asHtml:false)
      status startDate{year}
      characters(sort:ROLE, perPage:15){
        nodes{ name{full} image{medium} }
      }
      recommendations(perPage:10){
        nodes{ mediaRecommendation{
          id title{romaji native} coverImage{extraLarge} averageScore
        }}
      }
      trailer{site id}
    }
  }`;
  const res = await fetch('https://graphql.anilist.co',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({query,variables:{id}})
  });
  const {data} = await res.json();
  const m = data.Media;

  const title    = m.title.native || m.title.romaji;
  const year     = m.startDate?.year || '';
  const score    = m.averageScore ? (m.averageScore/10).toFixed(1) : '';
  const genres   = (m.genres||[]).join(' · ');
  const overview = m.description?.replace(/<[^>]+>/g,'') || 'لا يوجد وصف';
  const cast     = m.characters?.nodes || [];
  const recs     = (m.recommendations?.nodes||[]).filter(n=>n.mediaRecommendation).slice(0,12);
  const trailerKey = m.trailer?.site==='youtube' ? m.trailer.id : null;

  const detailPage = document.getElementById('detailPage');
  detailPage.innerHTML = `
    <button class="back-btn" onclick="goBack()">&#8594; رجوع</button>

    <div class="detail-hero" style="${m.bannerImage?`background-image:url('${m.bannerImage}')`:'background:#12141c'}">
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <img class="detail-poster" src="${m.coverImage.extraLarge}" alt="${title}">
        <div class="detail-meta">
          <h1 class="detail-title">${title}</h1>
          <div class="detail-badges">
            ${year  ? `<span class="badge">📅 ${year}</span>` : ''}
            ${m.episodes ? `<span class="badge">🎞 ${m.episodes} حلقة</span>` : ''}
            ${score ? `<span class="badge gold">⭐ ${score}</span>` : ''}
          </div>
          ${genres ? `<div class="detail-genres">${genres}</div>` : ''}
          <div class="detail-btns">
            <button class="btn-watch" onclick="openAnimePlayer(${id})">▶ مشاهدة</button>
            ${trailerKey ? `<button class="btn-trailer" onclick="openTrailer('${trailerKey}')">🎬 تريلر</button>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <section class="detail-section">
        <h2 class="detail-section-title">📖 القصة</h2>
        <p class="detail-overview">${overview}</p>
      </section>

      ${cast.length ? `
      <section class="detail-section">
        <h2 class="detail-section-title">🎭 الشخصيات</h2>
        <div class="cast-row" id="animeCast_${id}">
          ${cast.map(c=>`
            <div class="cast-card">
              <img src="${c.image?.medium||'https://via.placeholder.com/100x150/1a1a2e/555?text=👤'}" alt="${c.name.full}" loading="lazy">
              <span class="cast-name">${c.name.full}</span>
            </div>
          `).join('')}
        </div>
      </section>` : ''}

      ${recs.length ? `
      <section class="detail-section">
        <h2 class="detail-section-title">✨ أنمي مشابه</h2>
        <div class="similar-row" id="animeRecs_${id}">
          ${recs.map(n=>{
            const rec = n.mediaRecommendation;
            const rt  = rec.title.native||rec.title.romaji;
            const rs  = rec.averageScore ? (rec.averageScore/10).toFixed(1) : '';
            return `
            <div class="similar-card" onclick="openDetails(${rec.id},'anime')">
              <div class="similar-img-wrap">
                <img src="${rec.coverImage.extraLarge}" alt="${rt}" loading="lazy">
                ${rs?`<span class="card-rating">⭐ ${rs}</span>`:''}
                <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
              </div>
              <span class="similar-title">${rt}</span>
            </div>`;
          }).join('')}
        </div>
      </section>` : ''}
    </div>
  `;

  initRowDrag('animeCast_'+id);
  initRowDrag('animeRecs_'+id);
}

// ===== الرجوع =====
function goBack() {
  document.getElementById('detailPage').classList.remove('active');
  // أرجع آخر صفحة كانت نشطة
  const lastPage = sessionStorage.getItem('lastPage') || 'moviesPage';
  showPage(lastPage);
}

// ===== فتح المشغل من صفحة التفاصيل =====
function openPlayerFromDetail(id, type) {
  currentServers = type==='movie' ? MOVIE_SERVERS(id) : TV_SERVERS(id);
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openPlayerEpisode(seriesId, season, episode) {
  currentServers = TV_SERVERS(seriesId, season, episode);
  currentServerIndex = 0;
  loadServer(0);
  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openAnimePlayer(id) {
  currentServers = [
    `https://aniwatch.to/watch/${id}`,
    `https://9anime.to/watch/${id}`,
  ];
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

function loadServer(index) {
  document.getElementById('playerFrame').src = currentServers[index];
  updateServerBtn();
}

function nextServer() {
  if (currentServerIndex < currentServers.length-1) {
    currentServerIndex++;
    loadServer(currentServerIndex);
  } else {
    alert('لا يوجد سيرفر آخر متاح حالياً');
  }
}

function updateServerBtn() {
  const btn = document.getElementById('nextServerBtn');
  if (btn) btn.textContent = `🔄 سيرفر ${currentServerIndex+1}/${currentServers.length}`;
}

function closePlayer() {
  document.getElementById('playerFrame').src = '';
  document.getElementById('playerModal').classList.remove('open');
  document.body.style.overflow = '';
  currentServers = [];
  currentServerIndex = 0;
}

// ===== سحب الصفوف الأفقية =====
function initRowDrag(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  let isDragging=false, startX=0, scrollLeft=0;
  row.addEventListener('mousedown', e=>{
    isDragging=true; startX=e.clientX; scrollLeft=row.scrollLeft;
    row.style.cursor='grabbing';
  });
  window.addEventListener('mousemove', e=>{
    if (!isDragging) return;
    row.scrollLeft = scrollLeft - (e.clientX - startX);
  });
  window.addEventListener('mouseup', ()=>{ isDragging=false; row.style.cursor='grab'; });
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
      ...movData.results.map(r=>({...r,_type:'movie'})),
      ...tvData.results.map(r=>({...r,_type:'tv'}))
    ].filter(r=>r.poster_path);

    grid.innerHTML='';
    if (!all.length) { grid.innerHTML='<div class="loading">لا توجد نتائج</div>'; return; }

    all.forEach(item=>{
      const title = item._type==='movie'
        ? (item.title||item.original_title)
        : (item.name||item.original_name);
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${IMG_BASE}${item.poster_path}" alt="${title}" loading="lazy">
          ${rating?`<span class="card-rating">⭐ ${rating}</span>`:''}
          <div class="card-overlay"><span class="play-btn">▶ تفاصيل</span></div>
        </div>
        <div class="card-info">
          <h4>${title}</h4>
          <span class="type-badge">${item._type==='movie'?'🎬 فيلم':'📺 مسلسل'}</span>
        </div>
      `;
      card.onclick = ()=>openDetails(item.id, item._type);
      grid.appendChild(card);
    });
  } catch(err) {
    grid.innerHTML='<div class="loading">❌ خطأ في البحث</div>';
  }
}

// ============================================
// PLATFORMS CAROUSEL
// ============================================
function initPlatformsCarousel() {
  const track   = document.getElementById('pltTrack');
  const outer   = document.getElementById('pltOuter');
  const btnPrev = document.getElementById('pltPrev');
  const btnNext = document.getElementById('pltNext');
  if (!track||!outer||!btnPrev||!btnNext) return;

  let isDragging=false, startX=0, scrollLeft=0, currentX=0;
  const CARD_WIDTH = 132;

  function clamp(val) {
    const maxScroll = -(track.scrollWidth - outer.clientWidth + 40);
    return Math.min(0, Math.max(maxScroll, val));
  }
  function setX(x) {
    currentX = clamp(x);
    track.style.transform = `translateX(${currentX}px)`;
  }

  track.addEventListener('mousedown', e=>{ isDragging=true; startX=e.clientX; scrollLeft=currentX; track.classList.add('is-dragging'); });
  window.addEventListener('mousemove', e=>{ if(!isDragging) return; setX(scrollLeft+(e.clientX-startX)); });
  window.addEventListener('mouseup', ()=>{ isDragging=false; track.classList.remove('is-dragging'); });
  track.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; scrollLeft=currentX; }, {passive:true});
  track.addEventListener('touchmove',  e=>{ setX(scrollLeft+(e.touches[0].clientX-startX)); }, {passive:true});

  const STEP = CARD_WIDTH * 3;
  btnNext.addEventListener('click', ()=>setX(currentX-STEP));
  btnPrev.addEventListener('click', ()=>setX(currentX+STEP));

  track.querySelectorAll('.plt-card').forEach(card=>{
    card.addEventListener('click', e=>{ if(Math.abs(currentX-scrollLeft)>5) e.preventDefault(); });
  });
}

// ===== تهيئة =====
window.onload = () => {
  fetchMovies();
  fetchSeries();
  fetchAnime();
  initPlatformsCarousel();

  document.getElementById('searchInput').addEventListener('keydown', e=>{
    if (e.key==='Enter') doSearch();
  });

  document.getElementById('playerModal').addEventListener('click', function(e){
    if (e.target===this) closePlayer();
  });

  // حفظ آخر صفحة
  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      sessionStorage.setItem('lastPage', btn.dataset.page);
    });
  });
};

setInterval(()=>{ fetchMovies(); fetchSeries(); fetchAnime(); }, 600000);
