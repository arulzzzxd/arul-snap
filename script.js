const API_SEARCH = "/api/search";[cite: 3]
const API_DOWNLOAD = "/api/download";[cite: 3]

const topHits = document.getElementById("topHits");[cite: 3]
const viralHits = document.getElementById("viralHits");[cite: 3]
const newRelease = document.getElementById("newRelease");[cite: 3]
const recentSongs = document.getElementById("recentSongs");[cite: 3]

const audioPlayer = document.getElementById("audioPlayer");[cite: 3]

const playBtn = document.getElementById("playBtn");[cite: 3]
const playerTitle = document.getElementById("playerTitle");[cite: 3]
const playerArtist = document.getElementById("playerArtist");[cite: 3]
const playerThumb = document.getElementById("playerThumb");[cite: 3]
const downloadBtn = document.getElementById("downloadBtn");[cite: 3]

const fullPlayer = document.getElementById("fullPlayer");[cite: 3]
const fpTitle = document.getElementById("fpTitle");[cite: 3]
const fpArtist = document.getElementById("fpArtist");[cite: 3]
const fpThumb = document.getElementById("fpThumb");[cite: 3]

const progress = document.getElementById("progress");[cite: 3]
const currentTimeEl = document.getElementById("currentTime");[cite: 3]
const durationEl = document.getElementById("duration");[cite: 3]
const bigPlay = document.getElementById("bigPlay");[cite: 3]
const nextBtn = document.getElementById("nextBtn");[cite: 3]
const prevBtn = document.getElementById("prevBtn");[cite: 3]

let playlist = [];[cite: 3]
let currentIndex = 0;[cite: 3]
let isPlaying = false;[cite: 3]

/* =========================
   RECENT SONGS (RIWAYAT PUTAR)
========================= */
function saveRecent(song) {
    let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];[cite: 3]
    recent = recent.filter(item => item.url !== song.url);[cite: 3]
    recent.unshift(song);[cite: 3]
    recent = recent.slice(0, 20);[cite: 3]
    localStorage.setItem("recentSongs", JSON.stringify(recent));[cite: 3]
    renderRecentSongs();[cite: 3]
}

function renderRecentSongs() {
    const recent = JSON.parse(localStorage.getItem("recentSongs")) || [];[cite: 3]

    if (!recent.length) {[cite: 3]
        recentSongs.innerHTML = `<div class="loading">Belum ada lagu diputar</div>`;[cite: 3]
        return;[cite: 3]
    }[cite: 3]

    recentSongs.innerHTML = recent.map(createRow).join("");[cite: 3]

    document.querySelectorAll(".recent-item").forEach((item, index) => {
        item.addEventListener("click", () => {
            // FIX: Cek apakah lagu sudah ada di antrean playlist aktif agar tombol next/prev tidak error
            let existingIndex = playlist.findIndex(s => s.url === recent[index].url);
            if (existingIndex === -1) {
                playlist.unshift(recent[index]);
                existingIndex = 0;
            }
            playSong(recent[index], existingIndex);
        });
    });
}

/* =========================
   PLAYER ACTIONS
========================= */
function openPlayer() {
    fullPlayer.classList.add("show");[cite: 3]
    fpTitle.textContent = playerTitle.textContent;[cite: 3]
    fpArtist.textContent = playerArtist.textContent;[cite: 3]
    fpThumb.src = playerThumb.src;[cite: 3]
}

function closePlayer() {
    fullPlayer.classList.remove("show");[cite: 3]
}

document.querySelector(".player").addEventListener("click", openPlayer);[cite: 3]

function togglePlay() {
    if (!audioPlayer.src) return;[cite: 3]

    if (isPlaying) {
        audioPlayer.pause();[cite: 3]
        isPlaying = false;[cite: 3]
        playBtn.innerHTML = '<i class="fas fa-play"></i>';[cite: 3]
        bigPlay.innerHTML = '<i class="fas fa-play"></i>';[cite: 3]
    } else {
        audioPlayer.play();[cite: 3]
        isPlaying = true;[cite: 3]
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';[cite: 3]
        bigPlay.innerHTML = '<i class="fas fa-pause"></i>';[cite: 3]
    }
}

playBtn.addEventListener("click", e => {
    e.stopPropagation();[cite: 3]
    togglePlay();[cite: 3]
});

bigPlay.addEventListener("click", togglePlay);[cite: 3]

async function playSong(song, index = 0) {
    try {
        currentIndex = index;[cite: 3]

        playerTitle.textContent = song.title || "Memuat...";[cite: 3]
        playerArtist.textContent = song.artist || song.author || "Unknown Artist";[cite: 3]
        
        const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";[cite: 3]
        playerThumb.src = imgUrl;[cite: 3]
        fpThumb.src = imgUrl;[cite: 3]

        fpTitle.textContent = playerTitle.textContent;[cite: 3]
        fpArtist.textContent = playerArtist.textContent;[cite: 3]

        // Mengambil data streaming dari API download lokal
        const res = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`);[cite: 3]
        const data = await res.json();[cite: 3]

        if (!data.status) throw new Error("Download gagal");[cite: 3]

        // FIX: Menyesuaikan pembacaan URL sesuai struktur JSON result.download.url kamu
        const streamUrl = data.result?.download?.url;
        if (!streamUrl) throw new Error("Link stream tidak ditemukan");[cite: 3]

        // FIX: Sinkronisasi ulang metadata resmi dari server jika tersedia di dalam properti video
        if (data.result?.video) {
            const videoData = data.result.video;
            playerTitle.textContent = videoData.title;
            playerArtist.textContent = videoData.author || "Unknown Artist";
            playerThumb.src = videoData.thumbnail || imgUrl;
            fpThumb.src = videoData.thumbnail || imgUrl;
            fpTitle.textContent = videoData.title;
            fpArtist.textContent = videoData.author || "Unknown Artist";
            
            song.title = videoData.title;
            song.artist = videoData.author;
            song.thumbnail = videoData.thumbnail;
        }

        audioPlayer.src = streamUrl;[cite: 3]
        await audioPlayer.play();[cite: 3]

        isPlaying = true;[cite: 3]
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';[cite: 3]
        bigPlay.innerHTML = '<i class="fas fa-pause"></i>';[cite: 3]

        // FIX: Unduh lagu menggunakan nama berkas rapi dari server (result.download.filename)
        downloadBtn.onclick = () => {
            const a = document.createElement("a");[cite: 3]
            a.href = streamUrl;[cite: 3]
            a.download = data.result?.download?.filename || `${playerTitle.textContent}.mp3`;
            document.body.appendChild(a);[cite: 3]
            a.click();[cite: 3]
            document.body.removeChild(a);[cite: 3]
        };

        saveRecent(song);[cite: 3]
    } catch (err) {
        console.error(err);[cite: 3]
        alert("Gagal memutar lagu: " + err.message);[cite: 3]
    }
}

/* =========================
   NEXT / PREVIOUS
========================= */
function playNext() {
    if (!playlist.length) return;[cite: 3]
    currentIndex++;[cite: 3]
    if (currentIndex >= playlist.length) currentIndex = 0;[cite: 3]
    playSong(playlist[currentIndex], currentIndex);[cite: 3]
}

function playPrev() {
    if (!playlist.length) return;[cite: 3]
    currentIndex--;[cite: 3]
    if (currentIndex < 0) currentIndex = playlist.length - 1;[cite: 3]
    playSong(playlist[currentIndex], currentIndex);[cite: 3]
}

nextBtn.addEventListener("click", playNext);[cite: 3]
prevBtn.addEventListener("click", playPrev);[cite: 3]
audioPlayer.addEventListener("ended", playNext);[cite: 3]

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";[cite: 3]
    const m = Math.floor(sec / 60);[cite: 3]
    const s = Math.floor(sec % 60);[cite: 3]
    return `${m}:${String(s).padStart(2,"0")}`;[cite: 3]
}

/* =========================
   PROGRESS BAR
========================= */
audioPlayer.addEventListener("timeupdate", () => {
    if (!audioPlayer.duration) return;[cite: 3]
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;[cite: 3]
    progress.style.width = percent + "%";[cite: 3]
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);[cite: 3]
    durationEl.textContent = formatTime(audioPlayer.duration);[cite: 3]
});

/* =========================
   CORE FETCH SEARCH (ANTI-CACHE)
========================= */
async function searchSongs(keyword) {
    try {
        const res = await fetch(`${API_SEARCH}?query=${encodeURIComponent(keyword)}&_t=${Date.now()}`);[cite: 3]
        const data = await res.json();[cite: 3]
        if (!data.status) return [];[cite: 3]
        
        // FIX: Mengembalikan target array yang benar, yaitu data.result.videos
        return data.result?.videos || data.result || [];[cite: 3]
    } catch (e) {
        console.error(e);[cite: 3]
        return [];[cite: 3]
    }
}

/* =========================
   UI CARD CREATION
========================= */
function createCard(song) {
    const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";[cite: 3]
    const songArtist = song.artist || song.author || "Unknown Artist";
    return `
    <div class="song-card" data-url="${song.url}">
        <img src="${imgUrl}" alt="${song.title}" onerror="this.src='https://placehold.co/150x150'">
        <h4>${song.title}</h4>
        <p>${songArtist}</p>
    </div>
    `;[cite: 3]
}

function createRow(song) {
    const imgUrl = song.thumbnail || song.image || "https://placehold.co/60x60";[cite: 3]
    const songArtist = song.artist || song.author || "Unknown Artist";
    return `
    <div class="recent-item">
        <img src="${imgUrl}" onerror="this.src='https://placehold.co/60x60'">
        <div>
            <h4>${song.title}</h4>
            <p>${songArtist}</p>
        </div>
    </div>
    `;[cite: 3]
}

/* =========================
   LOAD BERANDA SECTIONS
========================= */
async function loadSection(container, keyword) {
    container.innerHTML = `<div class="loading">Memuat musik...</div>`;[cite: 3]
    const songs = await searchSongs(keyword);[cite: 3]
    
    if(songs.length > 0) {
        playlist.push(...songs);[cite: 3]
        container.innerHTML = songs.slice(0, 12).map(createCard).join("");[cite: 3]

        container.querySelectorAll(".song-card").forEach((card) => {
            card.addEventListener("click", () => {
                const songUrl = card.getAttribute("data-url");[cite: 3]
                const foundSong = playlist.find(s => s.url === songUrl);[cite: 3]
                if (foundSong) {
                    playSong(foundSong, playlist.indexOf(foundSong));[cite: 3]
                }
            });
        });
    } else {
        container.innerHTML = `<div class="loading">Gagal memuat daftar lagu.</div>`;[cite: 3]
    }
}

/* =========================
   INITIALIZATION
========================= */
async function init() {
    renderRecentSongs();[cite: 3]
    
    await Promise.all([
        loadSection(topHits, "top hits indonesia"),[cite: 3]
        loadSection(viralHits, "lagu viral tiktok"),[cite: 3]
        loadSection(newRelease, "musik terbaru 2026")[cite: 3]
    ]);

    const autoplay = JSON.parse(localStorage.getItem("autoplay_song"));[cite: 3]
    if (autoplay) {
        localStorage.removeItem("autoplay_song");[cite: 3]
        playSong(autoplay, 0);[cite: 3]
    }
}

init();[cite: 3]