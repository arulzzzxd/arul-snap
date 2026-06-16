// search.js
// Arulzxd Music Player - Search Feature

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const audioPlayer = document.getElementById("audioPlayer");

let debounceTimer = null;

// Event input search
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);

    if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
    }

    debounceTimer = setTimeout(() => {
        searchSongs(query);
    }, 400);
});

// Fetch search API
async function searchSongs(query) {
    try {
        searchResults.innerHTML = `<p class="loading">Searching...</p>`;

        // Ganti URL ini sesuai backend/API kamu
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        
        if (!res.ok) throw new Error("Network error");

        const data = await res.json();

        renderResults(data.results || []);
    } catch (err) {
        console.error(err);
        searchResults.innerHTML = `<p class="error">Gagal mencari lagu.</p>`;
    }
}

// Render hasil search
function renderResults(songs) {
    if (!songs.length) {
        searchResults.innerHTML = `<p class="empty">Lagu tidak ditemukan.</p>`;
        return;
    }

    searchResults.innerHTML = songs.map(song => `
        <div class="song-item" onclick="playSong('${song.url}', '${song.title}', '${song.artist}', '${song.image}')">
            <img src="${song.image}" alt="${song.title}">
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <button class="play-btn">▶</button>
        </div>
    `).join("");
}

// Play lagu
function playSong(url, title, artist, image) {
    const songData = { url, title, artist, image };
    localStorage.setItem("autoplay_song", JSON.stringify(songData));
    window.location.href = "index.html"; // Balik ke home untuk mutar lagu
}

// Optional: expose global
window.playSong = playSong;