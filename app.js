const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';

// جلب الأفلام من TMDB
async function fetchMovies() {
    const res = await fetch(`https://themoviedb.org{TMDB_KEY}&language=ar`);
    const data = await res.json();
    displayItems(data.results, 'moviesGrid', 'movie');
}

// جلب الأنمي من AniList (القوي جداً)
async function fetchAnime() {
    const query = `query { Page(perPage: 10) { media(type: ANIME, sort: TRENDING_DESC) { id title { english native } coverImage { extraLarge } } } }`;
    const res = await fetch('https://anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const data = await res.json();
    displayAnime(data.data.Page.media);
}

function displayItems(items, gridId, type) {
    const grid = document.getElementById(gridId);
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="https://tmdb.org{item.poster_path}">
            <div class="card-info"><h4>${item.title || item.name}</h4></div>
        `;
        card.onclick = () => window.open(`https://vidsrc.me{item.id}`, '_blank');
        grid.appendChild(card);
    });
}

function displayAnime(items) {
    const grid = document.getElementById('animeGrid');
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${item.coverImage.extraLarge}">
            <div class="card-info"><h4>${item.title.english || item.title.native}</h4></div>
        `;
        // رابط مشاهدة أنمي (مثال)
        card.onclick = () => alert('جاري تحويلك لسيرفر مشاهدة الأنمي...');
        grid.appendChild(card);
    });
}

fetchMovies();
fetchAnime();
