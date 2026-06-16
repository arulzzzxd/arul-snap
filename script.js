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
    let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
    recent = recent.filter(item => item.url !== song.url);
    recent.unshift(song);
    recent = recent.slice(0, 20);
    localStorage.setItem("recentSongs", JSON.stringify(recent));
    renderRecentSongs();
}

function renderRecentSongs() {
    const recent = JSON.parse(localStorage.getItem("recentSongs")) || [];

    if (!recent.length) {
        recentSongs.innerHTML = `<div class="loading">Belum ada lagu diputar</div>`;
        return;
    }

    recentSongs.innerHTML = recent.map(createRow).join("");

    document.querySelectorAll(".recent-item").forEach((item, index) => {
        item.addEventListener("click", () => {
            playSong(recent[index], index);
        });
    });
}

/* =========================
   PLAYER ACTIONS
========================= */
function openPlayer() {
    fullPlayer.classList.add("show");
    fpTitle.textContent = playerTitle.textContent;
    fpArtist.textContent = playerArtist.textContent;
    fpThumb.src = playerThumb.src;
}

function closePlayer() {
    fullPlayer.classList.remove("show");
}

document.querySelector(".player").addEventListener("click", openPlayer);

function togglePlay() {
    if (!audioPlayer.src) return;

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        bigPlay.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bigPlay.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

playBtn.addEventListener("click", e => {
    e.stopPropagation();
    togglePlay();
});

bigPlay.addEventListener("click", togglePlay);

async function playSong(song, index = 0) {
    try {
        currentIndex = index;

        playerTitle.textContent = song.title;
        playerArtist.textContent = song.artist || "Unknown Artist";
        
        const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";
        playerThumb.src = imgUrl;
        fpThumb.src = imgUrl;

        fpTitle.textContent = playerTitle.textContent;
        fpArtist.textContent = playerArtist.textContent;

        const res = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`);
        const data = await res.json();

        if (!data.status) throw new Error("Download gagal");

        const streamUrl = data.result?.download?.url || data.result?.download;
        if (!streamUrl) throw new Error("Link stream tidak ditemukan");

        audioPlayer.src = streamUrl;
        await audioPlayer.play();

        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bigPlay.innerHTML = '<i class="fas fa-pause"></i>';

        downloadBtn.onclick = () => {
            window.open(streamUrl, "_blank");
        };

        saveRecent(song);
    } catch (err) {
        console.error(err);
        alert("Gagal memutar lagu: " + err.message);
    }
}

/* =========================
   NEXT / PREVIOUS
========================= */
function playNext() {
    if (!playlist.length) return;
    currentIndex++;
    if (currentIndex >= playlist.length) currentIndex = 0;
    playSong(playlist[currentIndex], currentIndex);
}

function playPrev() {
    if (!playlist.length) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = playlist.length - 1;
    playSong(playlist[currentIndex], currentIndex);
}

nextBtn.addEventListener("click", playNext);
prevBtn.addEventListener("click", playPrev);
audioPlayer.addEventListener("ended", playNext);

/* =========================
   PROGRESS BAR
========================= */
audioPlayer.addEventListener("timeupdate", () => {
    if (!audioPlayer.duration) return;
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = percent + "%";
});

/* =========================
   CORE FETCH SEARCH (ANTI-CACHE)
========================= */
async function searchSongs(keyword) {
    try {
        // MENAMBAHKAN TIMESTAMP ACAK (&_t=...) AGAR DATA DI BERANDA SELALU BARU DAN BERUBAH
        const res = await fetch(`${API_SEARCH}?query=${encodeURIComponent(keyword)}&_t=${Date.now()}`);
        const data = await res.json();
        if (!data.status) return [];
        return data.result || [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

/* =========================
   UI CARD CREATION
========================= */
function createCard(song) {
    const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";
    return `
    <div class="song-card" data-url="${song.url}">
        <img src="${imgUrl}" alt="${song.title}" onerror="this.src='https://placehold.co/150x150'">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
    </div>
    `;
}

function createRow(song) {
    const imgUrl = song.thumbnail || song.image || "https://placehold.co/60x60";
    return `
    <div class="recent-item">
        <img src="${imgUrl}" onerror="this.src='https://placehold.co/60x60'">
        <div>
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
    </div>
    `;
}

/* =========================
   LOAD BERANDA SECTIONS
========================= */
async function loadSection(container, keyword) {
    container.innerHTML = `<div class="loading">Memuat musik...</div>`;
    const songs = await searchSongs(keyword);
    
    if(songs.length > 0) {
        playlist.push(...songs);
        container.innerHTML = songs.slice(0, 12).map(createCard).join("");

        container.querySelectorAll(".song-card").forEach((card) => {
            card.addEventListener("click", () => {
                const songUrl = card.getAttribute("data-url");
                const foundSong = playlist.find(s => s.url === songUrl);
                if (foundSong) {
                    playSong(foundSong, playlist.indexOf(foundSong));
                }
            });
        });
    } else {
        container.innerHTML = `<div class="loading">Gagal memuat daftar lagu.</div>`;
    }
}

/* =========================
   INITIALIZATION
========================= */
async function init() {
    renderRecentSongs();
    
    // Memuat konten beranda secara paralel agar cepat
    await Promise.all([
        loadSection(topHits, "top hits indonesia"),
        loadSection(viralHits, "lagu viral tiktok"),
        loadSection(newRelease, "musik terbaru 2026")
    ]);

    // Cek otomatis autoplay jika dialihkan dari search.html
    const autoplay = JSON.parse(localStorage.getItem("autoplay_song"));
    if (autoplay) {
        localStorage.removeItem("autoplay_song");
        playSong(autoplay, 0);
    }
}

init();