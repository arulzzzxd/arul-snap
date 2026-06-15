const API_SEARCH = "/api/search";
const API_DOWNLOAD = "/api/download";

const topHits = document.getElementById("topHits");
const viralHits = document.getElementById("viralHits");
const newRelease = document.getElementById("newRelease");
const recentSongs = document.getElementById("recentSongs");

const audioPlayer = document.getElementById("audioPlayer");

const playBtn = document.getElementById("playBtn");
const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerThumb = document.getElementById("playerThumb");
const downloadBtn = document.getElementById("downloadBtn");

const fullPlayer = document.getElementById("fullPlayer");
const fpTitle = document.getElementById("fpTitle");
const fpArtist = document.getElementById("fpArtist");
const fpThumb = document.getElementById("fpThumb");

const progress = document.getElementById("progress");
const bigPlay = document.getElementById("bigPlay");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let playlist = [];
let currentIndex = 0;
let isPlaying = false;

/* =========================
   RECENT SONGS
========================= */

function saveRecent(song) {
    let recent =
        JSON.parse(localStorage.getItem("recentSongs")) || [];

    recent = recent.filter(
        item => item.url !== song.url
    );

    recent.unshift(song);

    recent = recent.slice(0, 20);

    localStorage.setItem(
        "recentSongs",
        JSON.stringify(recent)
    );

    renderRecentSongs();
}

function renderRecentSongs() {
    const recent =
        JSON.parse(localStorage.getItem("recentSongs")) || [];

    if (!recent.length) {
        recentSongs.innerHTML =
            `<div class="loading">
                Belum ada lagu diputar
            </div>`;
        return;
    }

    recentSongs.innerHTML =
        recent.map(createRow).join("");

    document
        .querySelectorAll(".recent-item")
        .forEach((item, index) => {

            item.addEventListener(
                "click",
                () => {
                    playSong(recent[index], index);
                }
            );

        });
}

/* =========================
   PLAYER
========================= */

function openPlayer() {
    fullPlayer.classList.add("show");

    fpTitle.textContent =
        playerTitle.textContent;

    fpArtist.textContent =
        playerArtist.textContent;

    fpThumb.src =
        playerThumb.src;
}

function closePlayer() {
    fullPlayer.classList.remove("show");
}

document
    .querySelector(".player")
    .addEventListener(
        "click",
        openPlayer
    );

function togglePlay() {

    if (!audioPlayer.src) return;

    if (isPlaying) {

        audioPlayer.pause();

        isPlaying = false;

        playBtn.innerHTML =
            '<i class="fas fa-play"></i>';

        bigPlay.innerHTML =
            '<i class="fas fa-play"></i>';

    } else {

        audioPlayer.play();

        isPlaying = true;

        playBtn.innerHTML =
            '<i class="fas fa-pause"></i>';

        bigPlay.innerHTML =
            '<i class="fas fa-pause"></i>';
    }
}

playBtn.addEventListener(
    "click",
    e => {
        e.stopPropagation();
        togglePlay();
    }
);

bigPlay.addEventListener(
    "click",
    togglePlay
);

async function playSong(song, index = 0) {

    try {

        currentIndex = index;

        playerTitle.textContent =
            song.title;

        playerArtist.textContent =
            song.author?.name ||
            song.channel ||
            "Unknown Artist";

        playerThumb.src =
            song.thumbnail;

        fpTitle.textContent =
            playerTitle.textContent;

        fpArtist.textContent =
            playerArtist.textContent;

        fpThumb.src =
            playerThumb.src;

        const res = await fetch(
            `${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`
        );

        const data = await res.json();

        if (!data.status)
            throw new Error("Download gagal");

        audioPlayer.src =
            data.result.download;

        await audioPlayer.play();

        isPlaying = true;

        playBtn.innerHTML =
            '<i class="fas fa-pause"></i>';

        bigPlay.innerHTML =
            '<i class="fas fa-pause"></i>';

        downloadBtn.onclick = () => {
            window.open(
                data.result.download,
                "_blank"
            );
        };

        saveRecent(song);

    } catch (err) {

        console.error(err);

        alert(
            "Gagal memutar lagu"
        );
    }
}

/* =========================
   NEXT PREVIOUS
========================= */

function playNext() {

    if (!playlist.length) return;

    currentIndex++;

    if (currentIndex >= playlist.length) {
        currentIndex = 0;
    }

    playSong(
        playlist[currentIndex],
        currentIndex
    );
}

function playPrev() {

    if (!playlist.length) return;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex =
            playlist.length - 1;
    }

    playSong(
        playlist[currentIndex],
        currentIndex
    );
}

nextBtn.addEventListener(
    "click",
    playNext
);

prevBtn.addEventListener(
    "click",
    playPrev
);

audioPlayer.addEventListener(
    "ended",
    playNext
);

/* =========================
   PROGRESS BAR
========================= */

audioPlayer.addEventListener(
    "timeupdate",
    () => {

        if (!audioPlayer.duration)
            return;

        const percent =
            (audioPlayer.currentTime /
                audioPlayer.duration) * 100;

        progress.style.width =
            percent + "%";
    }
);

/* =========================
   SEARCH API
========================= */

async function searchSongs(query) {

    const res = await fetch(
        `${API_SEARCH}?query=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    if (!data.status)
        return [];

    return data.result || [];
}

/* =========================
   CARD UI
========================= */

function createCard(song) {

    return `
    <div class="song-card" data-url="${song.url}">
        <img src="${song.thumbnail}" alt="">
        <h4>${song.title}</h4>
        <p>
            ${song.author?.name || "Unknown"}
        </p>
    </div>
    `;
}

function createRow(song) {

    return `
    <div class="recent-item">
        <img src="${song.thumbnail}">
        <div>
            <h4>${song.title}</h4>
            <p>
                ${song.author?.name || "Unknown"}
            </p>
        </div>
    </div>
    `;
}

/* =========================
   LOAD SECTION
========================= */

async function loadSection(
    container,
    keyword
) {

    container.innerHTML =
        `<div class="loading">
            Memuat...
        </div>`;

    const songs =
        await searchSongs(keyword);

    playlist.push(...songs);

    container.innerHTML =
        songs
            .slice(0, 12)
            .map(createCard)
            .join("");

    container
        .querySelectorAll(".song-card")
        .forEach((card, index) => {

            card.addEventListener(
                "click",
                () => {
                    playSong(
                        songs[index],
                        index
                    );
                }
            );

        });
}

/* =========================
   INIT
========================= */

async function init() {

    renderRecentSongs();

    await loadSection(
        topHits,
        "top hits indonesia"
    );

    await loadSection(
        viralHits,
        "lagu viral tiktok"
    );

    await loadSection(
        newRelease,
        "musik terbaru 2026"
    );
}

init();