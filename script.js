// ======================================
// KIVUSTREAM SUPABASE
// ======================================

const SUPABASE_URL =
    "https://exjgejujfxejjlbfizgz.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4amdlanVqZnhlampsYmZpemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTQzMTQsImV4cCI6MjA5NDA5MDMxNH0.CWUYLk4qJfriIYXWScB7wcHHVTCuz0SGDhWUV3tMR1Y";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// ====================================
//         KIVUSTREAM TMDB
// ====================================

const TMDB_KEY = "8b8937bf3e114fa3502358a4f090c0df";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w300";
async function getTMDB(movieTitle){
// ====================================
//      renderTMDBResults
// ====================================
function renderTMDBResults(movies){

    if(!movies.length){
        results.innerHTML = `
            <div class="no-results">
                No results found
            </div>
        `;
        return;
    }

    results.innerHTML = movies.map(movie => `

        <div class="movie-card tmdb-card">

            <img
                src="${movie.poster_path
                    ? TMDB_IMG + movie.poster_path
                    : 'https://via.placeholder.com/300x450?text=No+Image'}"
                alt="${movie.title}"
            >

            <div class="movie-overlay">

                <button class="play-btn tmdb-play"
                    data-tmdb="${movie.id}">

                    <i class="fas fa-play"></i>

                </button>

            </div>

            <div class="movie-info">

                <h3>${movie.title}</h3>

                <span>
                    ${movie.release_date
                        ? movie.release_date.split("-")[0]
                        : "N/A"}
                </span>

            </div>

        </div>

    `).join("");

}
// ======================================
// HERO SLIDER
// ======================================

let featuredMovies = [];
let currentHero = 0;
let heroInterval;
function renderHero(index){

   const movie = featuredMovies?.[index];

if(!movie) return;

    const hero =
        document.getElementById("hero");

    hero.classList.add("fade");

    setTimeout(()=>{

        hero.style.backgroundImage = `
            linear-gradient(
                90deg,
                rgba(5,8,22,.96) 10%,
                rgba(5,8,22,.75) 40%,
                rgba(5,8,22,.2) 100%
            ),
            url('${movie.banner || movie.image || movie.backdrop || ""}')
        `;

        hero.querySelector(".hero-title")
        .textContent = movie.title;

        hero.querySelector(".hero-description")
        .textContent =
            movie.description;

        hero.querySelector(".hero-meta")
        .innerHTML = `
            <span>${movie.year}</span>
            <span>${movie.category}</span>
            <span>${movie.duration || "2h"}</span>
            <span>IMDb ${movie.imdb || "8.0"}</span>
            <span>HD</span>
        `;

        hero.querySelector(".watch-btn")
        .onclick = () => {

            window.location.href =
                `watch.html?id=${movie.id}`;

        };

        hero.querySelector(".info-btn")
        .onclick = () => {

            window.location.href =
                `details.html?id=${movie.id}`;

        };

        updateDots();

        hero.classList.remove("fade");

    },300);

}
function createDots(){

    const dotsContainer =
        document.querySelector(".hero-dots");

    dotsContainer.innerHTML = "";

    featuredMovies.forEach((_,i)=>{

        const dot =
            document.createElement("div");

        dot.className = "hero-dot";

        dot.onclick = ()=>{

            currentHero = i;

            renderHero(currentHero);

            restartSlider();
        };

        dotsContainer.appendChild(dot);

    });

    updateDots();

}


function updateDots(){

    document
    .querySelectorAll(".hero-dot")
    .forEach((dot,i)=>{

        dot.classList.toggle(
            "active",
            i === currentHero
        );

    });

}
function nextHero(){

    currentHero++;

    if(currentHero >= featuredMovies.length)
        currentHero = 0;

    renderHero(currentHero);

}
function restartSlider(){

    clearInterval(heroInterval);

    startHeroSlider();

}
document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        loadHeroSlider();

        document
        .querySelector(".next-hero")
        .onclick = ()=>{

            nextHero();
            restartSlider();

        };

        document
        .querySelector(".prev-hero")
        .onclick = ()=>{

            prevHero();
            restartSlider();

        };

    }
);
// =====================================
// CREATE MOVIE CARD
// =====================================

function createMovieCard(movie){

    return `
    <div class="movie-card">

        <img
            src="${movie.poster}"
            alt="${movie.title}"
            loading="lazy"
        >

        <div class="movie-overlay">

            <button
                class="play-btn"
                data-id="${movie.id}">

                <i class="fas fa-play"></i>

            </button>

        </div>

        <div class="movie-info">

            <h3>${movie.title}</h3>

            <span>
                ${movie.category}
                •
                ${movie.year}
            </span>

        </div>

    </div>
    `;
}
// ======================================
// LOAD RECENTLY ADDED
// ======================================

async function loadRecentlyAdded(){

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .order("created_at", {
            ascending:false
        })
        .limit(20);

    if(error){
        console.error(error);
        return;
    }

    const container =
        document.getElementById(
            "recently-added"
        );

    container.innerHTML =
        data
        .map(createMovieCard)
        .join("");

}
// ======================================
// LOAD CATEGORY
// ======================================
async function loadCategory(
    category,
    containerId
){

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .eq("category", category)
        .limit(20);

    if(error){
        console.error(error);
        return;
    }

    const container =
        document.getElementById(
            containerId
        );

    container.innerHTML =
        data
        .map(createMovieCard)
        .join("");

}
// ======================================
// LOAD SERIES
// ======================================

async function loadSeries() {

    const container = document.getElementById("latest-series");

    try {

        const { data, error } = await supabaseClient
            .from("movies")
            .select("*")
            .eq("category", "Series")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="empty-message">
                    No series available.
                </div>
            `;
            return;
        }

        container.innerHTML = data
            .map(createMovieCard)
            .join("");

    } catch (err) {

        console.error("Error loading series:", err);

        container.innerHTML = `
            <div class="empty-message">
                Failed to load series.
            </div>
        `;
    }

}
// ======================================
// INIT HOME PAGE
// ======================================
async function initHomePage(){

    await loadRecentlyAdded();

    await loadSeries();

    await loadCategory(
        "Action",
        "action-movies"
    );

    await loadCategory(
        "Horror",
        "horror-movies"
    );

    await loadCategory(
        "Comedy",
        "comedy-movies"
    );

    await loadCategory(
        "Romance",
        "romance-movies"
    );

    await loadCategory(
        "Drama",
        "drama-movies"
    );

    await loadCategory(
        "Crime",
        "crime-movies"
    );

    await loadCategory(
        "Sci-Fi",
        "scifi-movies"
    );

    await loadCategory(
        "Animation",
        "animation-movies"
    );

    await loadCategory(
        "High School",
        "highschool-movies"
    );

}

document.addEventListener(
    "DOMContentLoaded",
    initHomePage
);
// ======================================
// KIVUSTREAM APP JS
// ======================================

console.log("KIVUSTREAM Loaded Successfully");

// ======================================
// STICKY HEADER EFFECT
// ======================================
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if(!header) return;

    if(window.scrollY > 50){
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});

// ======================================
// MOVIE CARD ANIMATION
// ======================================

const cards = document.querySelectorAll(".movie-card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {
        card.style.zIndex = "10";
    });

    card.addEventListener("mouseleave", () => {
        card.style.zIndex = "1";
    });

});
// ======================================
// HORIZONTAL SCROLL WITH MOUSE WHEEL
// ======================================

const rows = document.querySelectorAll(".movie-row");

rows.forEach(row => {

    row.addEventListener("wheel", e => {

        e.preventDefault();

        row.scrollLeft += e.deltaY;

    });

});


// ======================================
// SCROLL TO TOP BUTTON
// ======================================

const topBtn = document.createElement("button");

topBtn.className = "top-btn";

topBtn.innerHTML = `
    <i class="fas fa-chevron-up"></i>
`;

document.body.appendChild(topBtn);


window.addEventListener("scroll", () => {

    if(window.scrollY > 600){
        topBtn.classList.add("show");
    }else{
        topBtn.classList.remove("show");
    }

});


topBtn.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});


// ======================================
// MOVIE PLAY BUTTONS
// ======================================

document.addEventListener("click", e => {

    const playBtn = e.target.closest(".movie-overlay button");

    if(!playBtn) return;

    const card = playBtn.closest(".movie-card");

    const title =
        card.querySelector("h3").textContent;

    alert(`Opening ${title}`);

});


// ======================================
// HELP BUTTON EFFECT
// ======================================

document.querySelectorAll(".help-btn")
.forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transform =
            "translateY(-4px) scale(1.03)";

    });

});
async function loadHeroSlider(){

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .eq("featured", true);

    if(error || !data?.length) return;

    featuredMovies = data;

    createDots();
    renderHero(currentHero);

    startAutoPlay();
}

function startHeroSlider(){

    heroInterval = setInterval(() => {

        currentHero++;

        if(currentHero >= featuredMovies.length){
            currentHero = 0;
        }

        renderHero(currentHero);

    }, 18000); // 18s for trailers

}
function prevHero(){

    currentHero--;

    if(currentHero < 0)
        currentHero = featuredMovies.length - 1;

    renderHero(currentHero);

    resetAutoPlay();

}
function startAutoPlay(){

    heroInterval = setInterval(()=>{

        nextHero();

    },15000);

}

function resetAutoPlay(){

    clearInterval(heroInterval);

    startAutoPlay();

}
async function getTrailer(movieId){

    try{

        const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_KEY}`
        );

        const data = await res.json();

        const trailer = data.results.find(
            v => v.type === "Trailer" &&
                 v.site === "YouTube"
        );

        return trailer ? trailer.key : null;

    }catch(err){
        console.error(err);
        return null;
    }

}
window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.classList.add("hide");

        setTimeout(() => {
            loader.remove();
        }, 500);

    }

});
document.getElementById("year")
.textContent =
new Date().getFullYear();
async function unifiedSearch(query){

    if(query.length < 2){
        results.innerHTML = "";
        return;
    }

    try {

        const { data: local } = await supabaseClient
            .from("movies")
            .select("*")
            .ilike("title", `%${query}%`)
            .limit(8);

        const res = await fetch(
            `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`
        );

        const tmdbJson = await res.json();

        const tmdb = (tmdbJson.results || [])
            .filter(i => i.media_type !== "person")
            .slice(0, 8);

        renderUnifiedSearch(local || [], tmdb);

    } catch(err){
        console.error(err);
    }
}
    function renderUnifiedSearch(local, tmdb){

    let html = "";

    html += local.map(movie => `
        <div class="movie-card">
            <img src="${movie.poster}" />
            <div class="movie-overlay">
                <button class="play-btn" data-id="${movie.id}">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span>${movie.category} • ${movie.year || ""}</span>
            </div>
        </div>
    `).join("");

    html += tmdb.map(movie => `
        <div class="movie-card tmdb-card">
            <img src="${movie.poster_path
                ? TMDB_IMG + movie.poster_path
                : 'https://via.placeholder.com/300'}"/>

            <div class="movie-overlay">
                <button class="play-btn" data-tmdb="${movie.id}">
                    <i class="fas fa-play"></i>
                </button>
            </div>

            <div class="movie-info">
                <h3>${movie.title || movie.name}</h3>
                <span>TMDB • ${movie.release_date || "N/A"}</span>
            </div>
        </div>
    `).join("");

    results.innerHTML = html || `<div class="no-results">No results found</div>`;
}
async function loadMovie(){

    try {

        // 1. LOCAL MOVIE (SUPABASE)
        if(movieId){

            const { data, error } = await supabaseClient
                .from("movies")
                .select("*")
                .eq("id", movieId)
                .single();

            if(error) throw error;

            currentMovie = data;
            renderMovie(data);
            loadEpisodes(movieId);
            loadComments(movieId);

            return;
        }

        // 2. TMDB MOVIE (FALLBACK)
        if(tmdbId){

            const res = await fetch(
                `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=videos`
            );

            const data = await res.json();

            currentMovie = data;
            renderTMDBMovie(data);

        }

    } catch(err){
        console.error("Load error:", err);
    }
}
    function renderMovie(movie){

    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("movie-description").textContent = movie.description;
    document.getElementById("movie-category").textContent = movie.category;
    document.getElementById("movie-year").textContent = movie.year;

    document.getElementById("movie-poster").src = movie.poster;
    document.getElementById("movie-banner").style.backgroundImage =
        `url('${movie.banner || movie.poster}')`;

    // VIDEO / STREAM URL
    const player = document.getElementById("player");

    if(movie.worker_url){
        player.src = movie.worker_url;
    }

    // DOWNLOAD BUTTON
    const downloadBtn = document.getElementById("download-btn");

    downloadBtn.onclick = () => {

        if(movie.download_links){
            const links = JSON.parse(movie.download_links);
            window.open(links[0]?.url || "#", "_blank");
        }

    };
}
    function renderTMDBMovie(movie){

    document.getElementById("movie-title").textContent = movie.title || movie.name;
    document.getElementById("movie-description").textContent = movie.overview;
    document.getElementById("movie-year").textContent = movie.release_date?.split("-")[0];

    document.getElementById("movie-poster").src =
        movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "";

    document.getElementById("movie-banner").style.backgroundImage =
        `url('https://image.tmdb.org/t/p/original${movie.backdrop_path}')`;

    const player = document.getElementById("player");

    const trailer = movie.videos?.results?.find(v =>
        v.type === "Trailer" && v.site === "YouTube"
    );

    if(trailer){
        player.src = `https://www.youtube.com/embed/${trailer.key}`;
    }
}
    async function loadEpisodes(movieId){

    const { data, error } = await supabaseClient
        .from("episodes")
        .select("*")
        .eq("series_id", movieId)
        .order("season", { ascending: true });

    if(error) return;

    const container = document.getElementById("episodes-container");

    container.innerHTML = data.map(ep => `
        <div class="episode-card" data-url="${ep.download_link}">
            <h4>Season ${ep.season} - Episode ${ep.episode}</h4>
            <button class="play-episode">▶ Play</button>
        </div>
    `).join("");

    document.querySelectorAll(".play-episode").forEach(btn => {
        btn.onclick = () => {
            document.getElementById("player").src =
                btn.closest(".episode-card").dataset.url;
        };
    });
}
    async function loadComments(movieId){

    const { data } = await supabaseClient
        .from("movie_comments")
        .select("*")
        .eq("movie_id", movieId)
        .order("created_at", { ascending: false });

    const container = document.getElementById("comments-container");

    container.innerHTML = data.map(c => `
        <div class="comment">
            <strong>${c.username}</strong>
            <p>${c.comment}</p>
        </div>
    `).join("");
}
    document.getElementById("comment-btn").onclick = async () => {

    const username = document.getElementById("username-input").value;
    const comment = document.getElementById("comment-input").value;

    await supabaseClient
        .from("movie_comments")
        .insert([{
            movie_id: movieId,
            username,
            comment
        }]);

    loadComments(movieId);
};
    document.addEventListener("DOMContentLoaded", loadMovie);
}
