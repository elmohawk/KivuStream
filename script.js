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

    const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${movieTitle}`
    );

    return await res.json();
}
// ====================================
//       searchTMDB query 
// ====================================

async function searchTMDB(query){

    try{

        const res = await fetch(
            `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${query}`
        );

        const json = await res.json();

        const movies = json.results || [];

        renderTMDBResults(movies);

    }catch(err){
        console.error("TMDB error:", err);
    }

}
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

    const movie = featuredMovies[index];

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
            url('${movie.backdrop}')
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


function prevHero(){

    currentHero--;

    if(currentHero < 0)
        currentHero =
            featuredMovies.length - 1;

    renderHero(currentHero);

}


function startHeroSlider(){

    heroInterval = setInterval(()=>{

        nextHero();

    },10000);

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
async function loadSeries(){

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .eq("type","series")
        .limit(20);

    if(error){
        console.error(error);
        return;
    }

    document.getElementById(
        "latest-series"
    ).innerHTML =
        data
        .map(createMovieCard)
        .join("");

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

    if(window.scrollY > 50){
        header.classList.add("scrolled");
    }else{
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
document.addEventListener("click", e=>{

    const btn =
        e.target.closest(".play-btn");

    if(!btn) return;

    const movieId =
        btn.dataset.id;

    window.location.href =
        `watch.html?id=${movieId}`;

});
// ====================================
// SEARCH OVERLAY
// ====================================

const overlay =
    document.querySelector(
        ".search-overlay"
    );

const searchBtn =
    document.querySelector(
        ".search-toggle"
    );

const closeBtn =
    document.querySelector(
        ".close-search"
    );

const input =
    document.getElementById(
        "search-input"
    );

const results =
    document.getElementById(
        "search-results"
    );


// OPEN

searchBtn.addEventListener(
    "click",
    ()=>{

        overlay.classList.add(
            "active"
        );

        setTimeout(()=>{

            input.focus();

        },300);

    }
);


// CLOSE

closeBtn.addEventListener(
    "click",
    ()=>{

        overlay.classList.remove(
            "active"
        );

    }
);


// ESC KEY

document.addEventListener(
    "keydown",
    e=>{

        if(e.key === "Escape"){

            overlay.classList.remove(
                "active"
            );

        }

    }
);
let debounce;

input.addEventListener(
    "input",
    ()=>{

        clearTimeout(debounce);

        debounce = setTimeout(()=>{

            searchMovies(
                input.value.trim()
            );

        },300);

    }
);
// ====================================
// SEARCH MOVIES
// ====================================

async function searchMovies(query){

    if(query.length < 2){

        results.innerHTML = "";
        return;

    }

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .ilike(
            "title",
            `%${query}%`
        )
        .limit(30);

    if(error){

        console.error(error);
        return;

    }

    renderSearchResults(data);

}
// ====================================
// RENDER SEARCH
// ====================================

function renderSearchResults(movies){

    if(!movies.length){

        results.innerHTML = `
            <div class="no-results">
                No movies found.
            </div>
        `;

        return;
    }

    results.innerHTML =
        movies.map(movie => `

        <div class="movie-card">

            <img
                src="${movie.poster}"
                alt="${movie.title}"
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

    `).join("");

}
results.addEventListener(
    "click",
    e=>{

        const btn =
            e.target.closest(
                ".play-btn"
            );

        if(!btn) return;

        const id =
            btn.dataset.id;

        window.location.href =
            `watch.html?id=${id}`;

    }
);

results.addEventListener("click", e => {

    const btn = e.target.closest(".play-btn");

    if(!btn) return;

    // SUPABASE MOVIE
    if(btn.dataset.id){

        window.location.href =
            `watch.html?id=${btn.dataset.id}`;

        return;
    }

    // TMDB MOVIE
    if(btn.dataset.tmdb){

        window.location.href =
            `watch.html?tmdb=${btn.dataset.tmdb}`;

        return;
    }

});
async function loadHeroSlider(){

    const { data, error } =
        await supabaseClient
        .from("movies")
        .select("*")
        .eq("featured", true);

    if(error || !data.length) return;

    featuredMovies = data;

    createDots();

    renderHero(currentHero);

    startAutoPlay();

}
async function renderHero(index){

    const movie = featuredMovies[index];

    if(!movie) return;

    const heroVideo = document.getElementById("hero-video");

    const trailerKey = await getTrailer(movie.tmdb_id || movie.id);

    // DEFAULT Fallback (no trailer)
    if(!trailerKey){

        heroVideo.src = "";

    }else{

        heroVideo.src =
        `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`;

    }

    // TEXT CONTENT

    document.querySelector(".hero-title").textContent =
        movie.title;

    document.querySelector(".hero-description").textContent =
        movie.description;

    document.querySelector(".hero-meta").innerHTML = `
        <span>${movie.year}</span>
        <span>${movie.category}</span>
        <span>HD</span>
        <span>IMDb ${movie.imdb || "8.0"}</span>
    `;

    // BUTTONS

    document.querySelector(".watch-btn").onclick = () => {
        window.location.href = `watch.html?id=${movie.id}`;
    };

    document.querySelector(".info-btn").onclick = () => {
        window.location.href = `details.html?id=${movie.id}`;
    };

    updateDots();

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
function nextHero(){

    currentHero++;

    if(currentHero >= featuredMovies.length)
        currentHero = 0;

    renderHero(currentHero);

    resetAutoPlay();

}

function prevHero(){

    currentHero--;

    if(currentHero < 0)
        currentHero = featuredMovies.length - 1;

    renderHero(currentHero);

    resetAutoPlay();

}
function createDots(){

    const dotsContainer =
        document.querySelector(".hero-dots");

    dotsContainer.innerHTML = "";

    featuredMovies.forEach((_,i)=>{

        const dot =
            document.createElement("div");

        dot.className = "hero-dot";

        dot.onclick = () => {

            currentHero = i;

            renderHero(currentHero);

            resetAutoPlay();

        };

        dotsContainer.appendChild(dot);

    });

    updateDots();

}

function updateDots(){

    document.querySelectorAll(".hero-dot")
    .forEach((dot,i)=>{

        dot.classList.toggle(
            "active",
            i === currentHero
        );

    });

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
async function renderHero(index){
    const heroVideo =
        document.getElementById("hero-video");
}
document.addEventListener("DOMContentLoaded", () => {

    loadHeroSlider();

    document.querySelector(".next-hero")
        .onclick = nextHero;

    document.querySelector(".prev-hero")
        .onclick = prevHero;

});

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
