const supabaseUrl =
"https://exjgejujfxejjlbfizgz.supabase.co";

const supabaseKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4amdlanVqZnhlampsYmZpemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTQzMTQsImV4cCI6MjA5NDA5MDMxNH0.CWUYLk4qJfriIYXWScB7wcHHVTCuz0SGDhWUV3tMR1Y";

console.log(
  "Supabase loaded:",
  window.supabase
);

const supabaseClient =
window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

let currentMovie = null;
let allEpisodes = [];
let currentEpisodeIndex = 0;
/* ---------------------------
   INIT
----------------------------*/
document.addEventListener("DOMContentLoaded", loadMovie);

/* ---------------------------
   LOAD MOVIE
----------------------------*/
async function loadMovie() {

const id =
new URLSearchParams(
window.location.search
).get("id");

console.log("Movie ID:", id);

if(!id){
console.error("No ID");
return;
}

try{
let { data, error } = await supabaseClient
.from("movies")
.select("*")
.eq("id", Number(id))
.maybeSingle();

if (error || !data) {

    const seriesResult =
    await supabaseClient
    .from("series")
    .select("*")
    .eq("id", id)
    .single();

    data = seriesResult.data;
    error = seriesResult.error;
}

console.log("DATA:",data);
console.log("ERROR:",error);

if(error){
throw error;
}

if(!data){
alert("Movie not found");
return;
}

currentMovie=data;

renderMovie();

}catch(err){

console.error("FULL ERROR:", err);

alert(
  err.message || JSON.stringify(err)
);

}

}
/* ---------------------------
   RENDER MOVIE
----------------------------*/
function renderMovie() {

  const movie = currentMovie;
  if (!movie) return;

  document.title = movie.title;

  setText(
"movie-title",
movie.title || "Unknown Movie"
);

setText(
"movie-description",
movie.description ||
"No description"
);
 document.getElementById("movie-category").innerHTML =
  `🎭 ${movie.category || "Entertainment"}`;

 document.getElementById("movie-translator").innerHTML =
  `🎙 ${movie.translator || "KivuStream"}`;

 setAttr(
"movie-poster",
"src",
movie.image || "./logo.png"
);
  const backdrop = document.querySelector(".hero-backdrop");

if (backdrop) {
  backdrop.style.backgroundImage =
    `url(${movie.banner || movie.image})`;
}
  document.body.style.setProperty(
"--movie-bg",
`url(${movie.banner || movie.image})`
);
document.getElementById("movie-type").innerHTML =
  movie.type === "series"
    ? "📺 Series"
    : "🎬 Movie";
  document.getElementById("movie-status").innerHTML =
  movie.status || "🔥 Trending";

  /* PLAY BUTTON */
  const watchBtn = document.getElementById("watch-btn");
  if (watchBtn) {
  watchBtn.onclick = () => {

    const player =
      document.getElementById("player");

    player.src = movie.video;

    player.scrollIntoView({
      behavior: "smooth"
    });

    player.play();

  };
}
  /* DOWNLOAD */
  const downloadBtn = document.getElementById("download-btn");
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      window.open(movie.download, "_blank");
    };
  }

  /* SERIES OR MOVIE */
 if (
   movie.type === "series" ||
   movie.type === "multipart"
){
   document.getElementById(
      "series-section"
   ).style.display = "block";

   loadEpisodes(movie.id);
}else{
   document.getElementById(
      "series-section"
   ).style.display = "none";
}
  
  document.getElementById("comment-btn").onclick = () => {
  postComment(currentMovie.id);
};

loadComments(currentMovie.id);

  loadRecommended();
}
/* ---------------------------
   LOAD EPISODES
----------------------------*/
async function loadEpisodes(movieId){

const { data, error } =
await supabaseClient
.from("episodes")
.select("*")
.eq("series_id", movieId)
.order("season")
.order("episode");

if(error){
console.error(error);
return;
}

allEpisodes = data || [];

const seasons =
[...new Set(
allEpisodes.map(e=>e.season)
)];

const buttons =
document.getElementById(
"season-buttons"
);

buttons.innerHTML = "";

seasons.forEach(season=>{

const btn =
document.createElement("button");

btn.innerText =
season === 0
? "🎞 Parts"
: `Season ${season}`;

btn.onclick = () =>
showSeason(season);

buttons.appendChild(btn);

});

showSeason(seasons[0]);
}
/* ---------------------------
   SHOW SEASON
----------------------------*/
function showSeason(season){

const container =
document.getElementById(
"episodes-container"
);

container.innerHTML = "";

const items =
allEpisodes.filter(
ep => ep.season == season
);

items.forEach(item=>{

const card =
document.createElement("div");

card.className =
"episode-card";

card.innerHTML = `

<div class="episode-left">

<span class="episode-number">

${
item.type==="movie_part"
?
`🎞 Part ${item.part}`
:
`EP ${item.episode}`
}

</span>

<div>

<h3>${item.title}</h3>

<small>

${
season===0
?
"Movie Parts"
:
`Season ${season}`
}

</small>

</div>

</div>

<div class="episode-actions">

<button class="watch-ep">
▶ Watch
</button>

<button class="download-ep">
⬇ Download
</button>

</div>
`;

card.querySelector(
".watch-ep"
).onclick = () =>
playEpisode(item.video_url);

card.querySelector(
".download-ep"
).onclick = () =>
window.open(
item.download_url
);

container.appendChild(card);

});
}
/* ---------------------------
   PLAY EPISODE
----------------------------*/
function playEpisode(video){

const player =
document.getElementById("player");

player.src = video;

player.play();

player.scrollIntoView({
behavior:"smooth"
});

currentEpisodeIndex =
allEpisodes.findIndex(
ep=>ep.video_url===video
);

}
document
.getElementById("player")
.addEventListener(
"ended",
()=>{

const next =
allEpisodes[
currentEpisodeIndex + 1
];

if(next){

playEpisode(next.video_url);

}

});
/* ---------------------------
   RECOMMENDED MOVIES
----------------------------*/
async function loadRecommended() {

  if (!currentMovie) return;

  const { data, error } = await supabaseClient
    .from("movies")
    .select("*")
    .eq("category", currentMovie.category) // same category
    .neq("id", currentMovie.id)            // don't show current movie
    .limit(12);

  if (error) {
    console.error("Recommendation error:", error);
    return;
  }

  const container = document.getElementById("recommended-container");

  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No recommendations available.</p>";
    return;
  }

  data.forEach(movie => {

    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img src="${movie.image}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.category || ""}</p>
    `;

    card.onclick = () => {
      window.location.href = `watch.html?id=${movie.id}`;
    };

    container.appendChild(card);
  });

}
/* ---------------------------
   NAVIGATION
----------------------------*/
function openMovie(id) {
  window.location.href = `watch.html?id=${id}`;
}

/* ---------------------------
   HELPERS
----------------------------*/
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value || "";
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value) el.setAttribute(attr, value);
}

async function loadComments(movieId){

  const { data } = await supabaseClient
    .from("comments")
    .select("*")
    .eq("movie_id", movieId)
    .order("created_at", { ascending:false });

  const container = document.getElementById("comments-container");
  if(!container) return;

  container.innerHTML = "";

  data.forEach(c => {

    container.innerHTML += `
      <div class="comment">
        <strong>${c.username || "User"}</strong>
        <p>${c.text}</p>
        <small>${new Date(c.created_at).toLocaleString()}</small>
      </div>
    `;
  });
}

/* ---------------------------
   POST COMMENT (PRO VERSION)
----------------------------*/
async function postComment(movieId) {

  const commentInput =
    document.getElementById("comment-input");

  const usernameInput =
    document.getElementById("username-input");

  const username =
    usernameInput?.value.trim() || "Guest";

  const comment =
    commentInput?.value.trim();

  if (!comment) {
    alert("Please write a comment.");
    return;
  }

  const btn =
    document.getElementById("comment-btn");

  btn.disabled = true;
  btn.innerHTML = "⏳ Posting...";

  try {

    const { error } = await supabaseClient
      .from("comments")
      .insert([
        {
          movie_id: movieId,
          username: username,
          text: comment
        }
      ]);

    if (error) throw error;

    commentInput.value = "";

    loadComments(movieId);

  } catch (err) {

    console.error(err);

    alert(
      "Failed to post comment."
    );

  } finally {

    btn.disabled = false;
    btn.innerHTML = "🚀 Post";

  }
}

 window.addEventListener("load",()=>{

const loader =
document.getElementById("loading-screen");

if(loader){
loader.remove();
}

});
const loader =
document.getElementById("loading-screen");

if(loader){

loader.style.opacity="0";

setTimeout(()=>{

loader.remove();

},300);

}
