const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");

let debounceTimer = null;

// Event input search (Debounce)
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(() => {
        searchSongs(query);
    }, 500);
});

// Event click tombol cari
if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    });
}

// Event Enter keyboard
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    }
});

// Fetch ke backend lokal
async function searchSongs(query) {
    try {
        searchResults.innerHTML = `<p class="loading">Sedang mencari...</p>`;
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Gagal menyambung ke server");
        const data = await res.json();
        renderResults(data.result || []);
    } catch (err) {
        searchResults.innerHTML = `<p class="error">Error: ${err.message}</p>`;
    }
}

// Render hasil pencarian ke UI
function renderResults(songs) {
    if (!songs || !songs.length) {
        searchResults.innerHTML = `<p class="empty">Lagu tidak ditemukan.</p>`;
        return;
    }

    searchResults.innerHTML = songs.map(song => {
        const safeTitle = song.title.replace(/'/g, "\\'");
        const safeArtist = song.artist.replace(/'/g, "\\'");
        // Menggunakan properti thumbnail yang valid
        const imgUrl = song.thumbnail || "https://placehold.co/60x60";

        return `
            <div class="song-item" onclick="playSong('${song.url}', '${safeTitle}', '${safeArtist}', '${imgUrl}')">
                <img src="${imgUrl}" alt="${song.title}" onerror="this.src='https://placehold.co/60x60'">
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <button class="play-btn">▶</button>
            </div>
        `;
    }).join("");
}

// Navigasi play lagu ke index.html
function playSong(url, title, artist, thumbnail) {
    const songData = { url, title, artist, thumbnail };
    localStorage.setItem("autoplay_song", JSON.stringify(songData));
    window.location.href = "index.html";
}

window.playSong = playSong;