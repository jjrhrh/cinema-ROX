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
      headers: { 'Content-Type': 'application
