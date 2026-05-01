const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

async function fetchMovies() {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=ar-SA&page=1`
    );
    const data = await res.json();
    renderGrid(data.results, 'moviesGrid', 'movie');
  } catch (err) {
    console.error('خطأ في الأفلام:', err);
  }
}

async function fetchAnime() {
  const query = `query {
    Page(perPage: 12) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title { romaji native }
        coverImage { extraLarge }
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
    console.error('خطأ في الأنمي:', err);
  }
}

function renderGrid(items, gridId, type) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach(item => {
    const title = type === 'movie'
      ? (item.title || item.original_title)
      : (item.title.native || item.title.romaji);

    const image = type === 'movie'
      ? `${IMG_BASE}${item.poster_path}`
      : item.coverImage.extraLarge;

    const watchUrl = type === 'movie'
      ? `https://vidsrc.to/embed/movie/${item.id}`
      : `https://shaka.video/${item.id}`;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${image}" alt="${title}"
           onerror="this.src='https://via.placeholder.com/300x450/111/fff?text=No+Image'">
      <div class="card-info"><h4>${title}</h4></div>
    `;
    card.onclick = () => window.open(watchUrl, '_blank');
    grid.appendChild(card);
  });
}

fetchMovies();
fetchAnime();

// تحديث كل 10 دقائق
setInterval(() => {
  fetchMovies();
  fetchAnime();
}, 600000);
