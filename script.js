const audio = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playBtn");

const searchModal =
document.getElementById("searchModal");

document
.getElementById("searchBtn")
.onclick = () => {
searchModal.style.display="block";
};

document
.getElementById("openSearch")
.onclick = () => {
searchModal.style.display="block";
};

window.onload = async () => {

loadCategory(
"pop indonesia",
"topHits"
);

loadCategory(
"lagu viral tiktok",
"viralHits"
);

loadCategory(
"musik terbaru indonesia",
"newRelease"
);

loadRecent();

};

async function loadCategory(
keyword,
containerId
){

const res = await fetch(
`/api/search?query=${encodeURIComponent(keyword)}`
);

const json = await res.json();

const songs =
json.result?.videos || [];

const container =
document.getElementById(containerId);

container.innerHTML = "";

songs.forEach(song => {

container.innerHTML += `
<div class="music-card"
onclick="playMusic(
'${encodeURIComponent(song.url)}',
'${song.thumbnail}',
'${song.title.replace(/'/g,'')}',
'${song.author.replace(/'/g,'')}'
)">
<img src="${song.thumbnail}">
<h4>${song.title}</h4>
<span>${song.author}</span>
</div>
`;

});

}

async function loadRecent(){

const res = await fetch(
`/api/search?query=top hits indonesia`
);

const json = await res.json();

const songs =
json.result?.videos || [];

const recent =
document.getElementById("recentList");

recent.innerHTML="";

songs.slice(0,2).forEach(song=>{

recent.innerHTML += `
<div class="song-row"
onclick="playMusic(
'${encodeURIComponent(song.url)}',
'${song.thumbnail}',
'${song.title.replace(/'/g,'')}',
'${song.author.replace(/'/g,'')}'
)">
<img src="${song.thumbnail}">
<div class="song-info">
<h4>${song.title}</h4>
<p>${song.author}</p>
</div>
</div>
`;

});

}

async function searchMusic(){

const query =
document.getElementById("query")
.value.trim();

if(!query) return;

const results =
document.getElementById("searchResults");

results.innerHTML="Loading...";

const res = await fetch(
`/api/search?query=${encodeURIComponent(query)}`
);

const json = await res.json();

const songs =
json.result?.videos || [];

results.innerHTML="";

songs.forEach(song=>{

results.innerHTML += `
<div class="music-card"
onclick="playMusic(
'${encodeURIComponent(song.url)}',
'${song.thumbnail}',
'${song.title.replace(/'/g,'')}',
'${song.author.replace(/'/g,'')}'
)">
<img src="${song.thumbnail}">
<h4>${song.title}</h4>
<span>${song.author}</span>
</div>
`;

});

}

async function playMusic(
url,
thumb,
title,
artist
){

document.getElementById(
"playerThumb"
).src = thumb;

document.getElementById(
"playerTitle"
).innerText = title;

document.getElementById(
"playerArtist"
).innerText = artist;

const res = await fetch(
`/api/download?url=${encodeURIComponent(
decodeURIComponent(url)
)}`
);

const json = await res.json();

const mp3 =
json.result?.download?.url;

audio.src = mp3;

document
.getElementById("downloadBtn")
.href = mp3;

audio.play();

playBtn.innerHTML =
'<i class="fas fa-pause"></i>';

}

playBtn.onclick = () => {

if(audio.paused){

audio.play();

playBtn.innerHTML =
'<i class="fas fa-pause"></i>';

}else{

audio.pause();

playBtn.innerHTML =
'<i class="fas fa-play"></i>';

}

};
