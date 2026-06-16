const searchInput = document.getElementById("searchInput");[cite: 5]
const searchResults = document.getElementById("searchResults");[cite: 5]
const searchBtn = document.getElementById("searchBtn");

let debounceTimer = null;[cite: 5]

// 1. Event saat mengetik (Debounce)
searchInput.addEventListener("input", (e) => {[cite: 5]
    const query = e.target.value.trim();[cite: 5]
    clearTimeout(debounceTimer);[cite: 5]

    if (query.length === 0) {[cite: 5]
        searchResults.innerHTML = "";[cite: 5]
        return;[cite: 5]
    }

    debounceTimer = setTimeout(() => {[cite: 5]
        searchSongs(query);[cite: 5]
    }, 500);
});

// 2. Event saat tombol "Cari" Berwarna Hijau Diklik
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
        searchSongs(query);
    }
});

// 3. Event saat menekan tombol "Enter" di Keyboard HP / Laptop
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    }
});

// Fungsi Fetch ke Serverless Backend Vercel milikmu
async function searchSongs(query) {
    try {
        searchResults.innerHTML = `<p class="loading">Searching...</p>`;[cite: 5]

        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Network error");[cite: 5]

        const data = await res.json();
        renderResults(data.result || []);
    } catch (err) {
        console.error(err);[cite: 5]
        searchResults.innerHTML = `<p class="error">Gagal mencari lagu.</p>`;[cite: 5]
    }
}

// Render hasil search ke komponen UI
function renderResults(songs) {
    if (!songs.length) {[cite: 5]
        searchResults.innerHTML = `<p class="empty">Lagu tidak ditemukan.</p>`;[cite: 5]
        return;[cite: 5]
    }

    searchResults.innerHTML = songs.map(song => `
        <div class="song-item" onclick="playSong('${song.url}', '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}', '${song.image}')">
            <img src="${song.image}" alt="${song.title}">
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <button class="play-btn"><i class="fas fa-play"></i></button>
        </div>
    `).join("");[cite: 5]
}

// Melempar data ke halaman utama (index.html) menggunakan localStorage
function playSong(url, title, artist, image) {
    const songData = { url, title, artist, image };
    localStorage.setItem("autoplay_song", JSON.stringify(songData));
    window.location.href = "index.html";
}

window.playSong = playSong;[cite: 5]