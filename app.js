const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';

// جلب الأفلام الرائجة
async function fetchMovies() {
    try {
        const res = await fetch(`https://themoviedb.org{TMDB_KEY}&language=ar`);
        const data = await res.json();
        renderGrid(data.results, 'moviesGrid', 'movie');
    } catch (err) { console.error("خطأ في جلب الأفلام:", err); }
}

// جلب الأنمي من AniList (الأقوى)
async function fetchAnime() {
    const query = `query { Page(perPage: 12) { media(type: ANIME, sort: TRENDING_DESC) { id title { english native romaji } coverImage { extraLarge } bannerImage } } }`;
    try {
        const res = await fetch('https://anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        renderGrid(data.data.Page.media, 'animeGrid', 'anime');
    } catch (err) { console.error("خطأ في جلب الأنمي:", err); }
}

function renderGrid(items, gridId, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = ""; // تنظيف الشبكة قبل العرض

    items.forEach(item => {
        const title = item.title || item.name || (item.title && (item.title.english || item.title.native));
        const image = type === 'movie' 
            ? `https://tmdb.org{item.poster_path}` 
            : item.coverImage.extraLarge;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${image}" alt="${title}" onerror="this.src='https://placeholder.com'">
            <div class="card-info"><h4>${title}</h4></div>
        `;
        
        // رابط المشاهدة الذكي
        card.onclick = () => {
            const streamUrl = type === 'movie' 
                ? `https://vidsrc.me{item.id}` 
                : `https://shaka.video{item.id}`; // سيرفر أنمي مباشر
            window.open(streamUrl, '_blank');
        };
        grid.appendChild(card);
    });
}

// تشغيل الدوال
fetchMovies();
fetchAnime();
