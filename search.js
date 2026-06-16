const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");

let debounceTimer = null;

// 1. Event saat mengetik otomatis (Debounce)
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(() => {
        searchSongs(query);
    }, 600);
});

// 2. Event saat tombol hijau "Cari" diklik
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    });
}

// 3. Event saat menekan Enter di keyboard HP
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    }
});

// Fungsi Tembak API Langsung dari Client
async function searchSongs(query) {
    try {
        // Tampilkan status pencarian ke layar terlebih dahulu
        searchResults.innerHTML = `<p class="loading"><i class="fas fa-spinner fa-spin"></i> Sedang mencari lagu "${query}"...</p>`;

        // Langsung tembak ke API tujuan utama untuk menghindari bottleneck internal Vercel Serverless
        const response = await fetch(`https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error(`Server API merespon dengan status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data API Berhasil Diterima:", data);

        // Validasi struktur JSON sesuai skema murninya
        if (data && data.status && data.result && data.result.videos) {
            renderResults(data.result.videos);
        } else {
            searchResults.innerHTML = `<p class="empty">Format data dari server tidak sesuai atau kosong.</p>`;
        }

    } catch (err) {
        console.error("Detail Error Pencarian:", err);
        // Cetak pesan error asli ke UI agar kamu bisa melihat kendalanya langsung di HP
        searchResults.innerHTML = `<p class="error"><i class="fas fa-exclamation-triangle"></i> Terjadi Kesalahan: ${err.message}</p>`;
    }
}

// Render hasil data video ke struktur HTML komponen
function renderResults(videos) {
    if (!videos || videos.length === 0) {
        searchResults.innerHTML = `<p class="empty">Lagu tidak ditemukan.</p>`;
        return;
    }

    searchResults.innerHTML = videos.map(video => {
        // Amankan string judul & nama channel dari karakter petik (') agar tidak merusak HTML onclick
        const safeTitle = video.title.replace(/'/g, "\\'");
        const safeArtist = (video.author || "Unknown Artist").replace(/'/g, "\\'");
        const cleanThumb = video.thumbnail || "https://placehold.co/80x80";

        return `
            <div class="song-item" onclick="playSong('${video.url}', '${safeTitle}', '${safeArtist}', '${cleanThumb}')">
                <img src="${cleanThumb}" alt="${video.title}">
                <div class="song-info">
                    <h4>${video.title}</h4>
                    <p>${video.author || 'Unknown Artist'}</p>
                </div>
                <button class="play-btn"><i class="fas fa-play"></i></button>
            </div>
        `;
    }).join("");
}

// Lempar data lagu terpilih ke index.html lewat localStorage
function playSong(url, title, artist, image) {
    const songData = { url, title, artist, image };
    localStorage.setItem("autoplay_song", JSON.stringify(songData));
    window.location.href = "index.html";
}

window.playSong = playSong;