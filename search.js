const searchInput = document.getElementById("searchInput");[cite: 5]
const searchResults = document.getElementById("searchResults");[cite: 5]
const searchBtn = document.getElementById("searchBtn");[cite: 5]

let debounceTimer = null;[cite: 5]

// Event input search (Debounce)
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();[cite: 5]
    clearTimeout(debounceTimer);[cite: 5]

    if (query.length === 0) {
        searchResults.innerHTML = "";[cite: 5]
        return;[cite: 5]
    }

    debounceTimer = setTimeout(() => {
        searchSongs(query);[cite: 5]
    }, 500);
});

// Event click tombol cari
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();[cite: 5]
        if (query.length > 0) {
            searchSongs(query);[cite: 5]
        }
    });
}

// Event Enter keyboard
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();[cite: 5]
        if (query.length > 0) {
            searchSongs(query);[cite: 5]
        }
    }
});

// Fetch ke backend lokal
async function searchSongs(query) {
    try {
        searchResults.innerHTML = `<p class="loading">Sedang mencari...</p>`;[cite: 5]
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);[cite: 5]
        if (!res.ok) throw new Error("Gagal menyambung ke server");[cite: 5]
        const data = await res.json();[cite: 5]
        
        // FIX: Ekstraksi array video dari skema data.result.videos
        const songs = data.result?.videos || data.result || [];
        renderResults(songs);[cite: 5]
    } catch (err) {
        searchResults.innerHTML = `<p class="error">Error: ${err.message}</p>`;[cite: 5]
    }
}

// Render hasil pencarian ke UI
function renderResults(songs) {
    if (!songs || !songs.length) {
        searchResults.innerHTML = `<p class="empty">Lagu tidak ditemukan.</p>`;[cite: 5]
        return;[cite: 5]
    }

    searchResults.innerHTML = songs.map(song => {
        const safeTitle = song.title.replace(/'/g, "\\'");[cite: 5]
        
        // FIX: Antisipasi penamaan nama artis dari properti 'artist' atau 'author'
        const songArtist = song.artist || song.author || "Unknown Artist";
        const safeArtist = songArtist.replace(/'/g, "\\'");[cite: 5]
        
        const imgUrl = song.thumbnail || "https://placehold.co/60x60";[cite: 5]

        return `
            <div class="song-item" onclick="playSong('${song.url}', '${safeTitle}', '${safeArtist}', '${imgUrl}')">
                <img src="${imgUrl}" alt="${song.title}" onerror="this.src='https://placehold.co/60x60'">
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <p>${songArtist}</p>
                </div>
                <button class="play-btn">▶</button>
            </div>
        `;[cite: 5]
    }).join("");[cite: 5]
}

// Navigasi play lagu ke index.html
function playSong(url, title, artist, thumbnail) {
    const songData = { url, title, artist, thumbnail };[cite: 5]
    localStorage.setItem("autoplay_song", JSON.stringify(songData));[cite: 5]
    window.location.href = "index.html";[cite: 5]
}

window.playSong = playSong;[cite: 5]