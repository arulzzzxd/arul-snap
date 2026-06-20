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
    if (!recentSongs) return; // Penjagaan jika elemen tidak ada di HTML halaman saat ini
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
    if (!fullPlayer) return;
    fullPlayer.classList.add("show");
    fpTitle.textContent = playerTitle.textContent;
    fpArtist.textContent = playerArtist.textContent;
    fpThumb.src = playerThumb.src;
}

function closePlayer() {
    if (!fullPlayer) return;
    fullPlayer.classList.remove("show");
}

// Opsional: Pastikan elemen .player ada sebelum memasang event listener
const playerBar = document.querySelector(".player");
if (playerBar) {
    playerBar.addEventListener("click", openPlayer);
}

function togglePlay() {
    if (!audioPlayer.src) return;

    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play().catch(err => console.error("Gagal memutar audio:", err));
    }
}

// Sinkronisasi status UI menggunakan event bawaan Audio element (Lebih Terjamin)
audioPlayer.addEventListener("play", () => {
    isPlaying = true;
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    if (bigPlay) bigPlay.innerHTML = '<i class="fas fa-pause"></i>';
});

audioPlayer.addEventListener("pause", () => {
    isPlaying = false;
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
    if (bigPlay) bigPlay.innerHTML = '<i class="fas fa-play"></i>';
});

if (playBtn) {
    playBtn.addEventListener("click", e => {
        e.stopPropagation();
        togglePlay();
    });
}

if (bigPlay) {
    bigPlay.addEventListener("click", togglePlay);
}

async function playSong(song, index = 0) {
    try {
        if (!song) return;
        currentIndex = index;

        // Set UI awal dari manifes lagu lokal sebelum server merespons
        const localTitle = song.title || "Memuat...";
        const localArtist = song.artist || song.author || "Unknown Artist";
        const imgUrl = song.thumbnail || song.image || "https://placehold.co/150x150";

        if (playerTitle) playerTitle.textContent = localTitle;
        if (playerArtist) playerArtist.textContent = localArtist;
        if (playerThumb) playerThumb.src = imgUrl;
        if (fpThumb) fpThumb.src = imgUrl;
        if (fpTitle) fpTitle.textContent = localTitle;
        if (fpArtist) fpArtist.textContent = localArtist;

        // Memanggil API download internal
        const res = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`);
        const data = await res.json();

        if (!data.status) throw new Error("Download gagal");

        // Parsing link streaming berdasarkan target 'result.download.url'
        const streamUrl = data.result?.download?.url;
        if (!streamUrl) throw new Error("Link stream tidak ditemukan");

        // Perbarui metadata secara realtime menggunakan data server 'result.video'
        let finalTitle = localTitle;
        let finalArtist = localArtist;

        if (data.result?.video) {
            const videoData = data.result.video;
            finalTitle = videoData.title || localTitle;
            finalArtist = videoData.author || localArtist;
            const finalThumb = videoData.thumbnail || imgUrl;

            if (playerTitle) playerTitle.textContent = finalTitle;
            if (playerArtist) playerArtist.textContent = finalArtist;
            if (playerThumb) playerThumb.src = finalThumb;
            if (fpThumb) fpThumb.src = finalThumb;
            if (fpTitle) fpTitle.textContent = finalTitle;
            if (fpArtist) fpArtist.textContent = finalArtist;
            
            // Perbarui data referensi agar riwayat tersimpan rapi
            song.title = finalTitle;
            song.artist = finalArtist;
            song.thumbnail = finalThumb;
        }

        audioPlayer.src = streamUrl;
        await audioPlayer.play();

        // Inject callback download agar nama file rapi mengikuti properti 'result.download.filename'
        if (downloadBtn) {
            downloadBtn.onclick = (e) => {
                e.stopPropagation(); // Mencegah full player terbuka saat tombol download diklik
                const a = document.createElement("a");
                a.href = streamUrl;
                a.download = data.result?.download?.filename || `${finalTitle}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
        }

        // Panggil lirik secara dinamis setelah metadata final siap
        loadLyrics(finalTitle, finalArtist);

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

if (nextBtn) nextBtn.addEventListener("click", playNext);
if (prevBtn) prevBtn.addEventListener("click", playPrev);
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
    if (progress) progress.style.width = percent + "%";
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    if (durationEl) durationEl.textContent = formatTime(audioPlayer.duration);
});

/* =========================
   CORE FETCH SEARCH (ANTI-CACHE)
========================= */
async function searchSongs(keyword) {
    try {
        const res = await fetch(`${API_SEARCH}?query=${encodeURIComponent(keyword)}&_t=${Date.now()}`);
        const data = await res.json();
        if (!data.status) return [];
        
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
    if (!container) return; // Cegah error jika section tidak ada di HTML
    container.innerHTML = `<div class="loading">Memuat musik...</div>`;
    const songs = await searchSongs(keyword);
    
    if (songs.length > 0) {
        playlist.push(...songs);
        container.innerHTML = songs.slice(0, 12).map(createCard).join("");

        container.querySelectorAll(".song-card").forEach((card) => {
            card.addEventListener("click", () => {
                const songUrl = card.getAttribute("data-url");
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
   LYRICS EXTENSION
========================= */
const lyricsText = document.getElementById("lyricsText");

async function loadLyrics(title, artist) {
    try {
        if (!lyricsText) return;
        if (!title || title === "Memuat...") return;

        lyricsText.textContent = "Memuat lirik...";

        // Bersihkan teks judul dari embel-embel (misal: "Official Video", "Lirik Video") agar pencarian API lirik akurat
        const cleanTitle = title.replace(/\s*[\(\[][^)]*[\)\]]\s*/g, ""); 

        const res = await fetch(
            `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(cleanTitle)}`
        );
        const data = await res.json();

        lyricsText.innerHTML = data.lyrics ? data.lyrics.replace(/\n/g, "<br>") : "Lirik tidak tersedia.";
    } catch {
        if (lyricsText) lyricsText.textContent = "Gagal memuat lirik.";
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