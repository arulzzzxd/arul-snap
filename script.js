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
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const bigPlay = document.getElementById("bigPlay");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let playlist = [];
let currentIndex = 0;
let isPlaying = false;

/* =========================
   RECENT SONGS (RIWAYAT PUTAR)
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
            let existingIndex = playlist.findIndex(s => s.url === recent[index].url);
            if (existingIndex === -1) {
                playlist.unshift(recent[index]);
                existingIndex = 0;
            }
            playSong(playlist[existingIndex], existingIndex);
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
        if (!song) return;
        currentIndex = index;

        // Set UI awal dari manifes lagu lokal sebelum server merespons
        playerTitle.textContent = song.title || "Memuat...";
        playerArtist.textContent = song.artist || song.author || "Unknown Artist";
        
        const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";
        playerThumb.src = imgUrl;
        fpThumb.src = imgUrl;

        fpTitle.textContent = playerTitle.textContent;
        fpArtist.textContent = playerArtist.textContent;

        // Memanggil API download internal
        const res = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`);
        const data = await res.json();

        if (!data.status) throw new Error("Download gagal");

        // FIX: Parsing link streaming berdasarkan target 'result.download.url' dari objek respon baru Anda
        const streamUrl = data.result?.download?.url;
        if (!streamUrl) throw new Error("Link stream tidak ditemukan");

        // FIX: Perbarui metadata secara realtime menggunakan kembalian valid dari data server 'result.video'
        if (data.result?.video) {
            const videoData = data.result.video;
            playerTitle.textContent = videoData.title;
            playerArtist.textContent = videoData.author || "Unknown Artist";
            playerThumb.src = videoData.thumbnail || imgUrl;
            fpThumb.src = videoData.thumbnail || imgUrl;
            fpTitle.textContent = videoData.title;
            fpArtist.textContent = videoData.author || "Unknown Artist";
            
            // Perbarui data referensi agar riwayat tersimpan rapi
            song.title = videoData.title;
            song.artist = videoData.author;
            song.thumbnail = videoData.thumbnail;
        }

        audioPlayer.src = streamUrl;
        await audioPlayer.play();

        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bigPlay.innerHTML = '<i class="fas fa-pause"></i>';

        // FIX: Inject callback download agar nama file rapi mengikuti properti 'result.download.filename'
        downloadBtn.onclick = () => {
            const a = document.createElement("a");
            a.href = streamUrl;
            a.download = data.result?.download?.filename || `${playerTitle.textContent}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
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

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

/* =========================
   PROGRESS BAR
========================= */
audioPlayer.addEventListener("timeupdate", () => {
    if (!audioPlayer.duration) return;
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = percent + "%";
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationEl.textContent = formatTime(audioPlayer.duration);
});

/* =========================
   CORE FETCH SEARCH (ANTI-CACHE)
========================= */
async function searchSongs(keyword) {
    try {
        const res = await fetch(`${API_SEARCH}?query=${encodeURIComponent(keyword)}&_t=${Date.now()}`);
        const data = await res.json();
        if (!data.status) return [];
        
        // FIX: Target dibongkar langsung dari susunan 'data.result.videos'
        return data.result?.videos || data.result || [];
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
    const songArtist = song.artist || song.author || "Unknown Artist";
    return `
    <div class="song-card" data-url="${song.url}">
        <img src="${imgUrl}" alt="${song.title}" onerror="this.src='https://placehold.co/150x150'">
        <h4>${song.title}</h4>
        <p>${songArtist}</p>
    </div>
    `;
}

function createRow(song) {
    const imgUrl = song.thumbnail || song.image || "https://placehold.co/60x60";
    const songArtist = song.artist || song.author || "Unknown Artist";
    return `
    <div class="recent-item">
        <img src="${imgUrl}" onerror="this.src='https://placehold.co/60x60'">
        <div>
            <h4>${song.title}</h4>
            <p>${songArtist}</p>
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
    
    if (songs.length > 0) {
        playlist.push(...songs);
        container.innerHTML = songs.slice(0, 12).map(createCard).join("");

        container.querySelectorAll(".song-card").forEach((card) => {
            card.addEventListener("click", () => {
                const songUrl = card.getAttribute("data-url");
                // FIX: Menemukan indeks dinamis real-time dari global playlist array agar navigasi prev/next konstan
                const currentSongIdx = playlist.findIndex(s => s.url === songUrl);
                if (currentSongIdx !== -1) {
                    playSong(playlist[currentSongIdx], currentSongIdx);
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
    
    await Promise.all([
        loadSection(topHits, "top hits indonesia"),
        loadSection(viralHits, "lagu viral tiktok"),
        loadSection(newRelease, "musik terbaru 2026")
    ]);

    const autoplay = JSON.parse(localStorage.getItem("autoplay_song"));
    if (autoplay) {
        localStorage.removeItem("autoplay_song");
        let existingIndex = playlist.findIndex(s => s.url === autoplay.url);
        if (existingIndex === -1) {
            playlist.unshift(autoplay);
            existingIndex = 0;
        }
        playSong(playlist[existingIndex], existingIndex);
    }
}

init();