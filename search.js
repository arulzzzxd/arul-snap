const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");

let debounceTimer = null;

// Fungsi pembantu untuk membersihkan string dari tanda kutip agar tidak merusak HTML atribut onclick
function escapeHtmlString(str) {
    if (!str) return "Unknown";
    return str
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

// Event input search (Debounce 500ms)
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

// Event click tombol cari (Pastikan berjalan konstan)
if (searchBtn) {
    searchBtn.onclick = (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    };
}

// Event Enter keyboard pada input field
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    }
});

// Fetch ke backend lokal Vercel Rewrite
async function searchSongs(query) {
    try {
        searchResults.innerHTML = `<p class="loading">Sedang mencari...</p>`;
        
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&_t=${Date.now()}`);
        if (!res.ok) throw new Error("Gagal menyambung ke server (Status: " + res.status + ")");
        
        const data = await res.json();
        
        // Ekstraksi array dari skema data.result.videos
        const songs = data.result?.videos || data.result || [];
        renderResults(songs);
    } catch (err) {
        console.error("Search error:", err);
        searchResults.innerHTML = `<p class="error" style="text-align:center; padding:20px; color:#ff4a4a;">Error: ${err.message}</p>`;
    }
}

// Render hasil pencarian ke antarmuka (DOM)
function renderResults(songs) {
    try {
        if (!songs || !songs.length) {
            searchResults.innerHTML = `<p class="empty" style="text-align:center; padding:20px; color:#aaa;">Lagu tidak ditemukan.</p>`;
            return;
        }

        searchResults.innerHTML = songs.map(song => {
            // Amankan string judul dan artis dari bug pembatas tanda kutip (') atau (")
            const safeTitle = escapeHtmlString(song.title);
            const songArtist = song.artist || song.author || "Unknown Artist";
            const safeArtist = escapeHtmlString(songArtist);
            const imgUrl = song.thumbnail || "https://placehold.co/60x60";

            return `
                <div class="song-item" onclick="playSong('${song.url}', '${safeTitle}', '${safeArtist}', '${imgUrl}')">
                    <img src="${imgUrl}" alt="${safeTitle}" onerror="this.src='https://placehold.co/60x60'">
                    <div class="song-info">
                        <h4>${song.title}</h4>
                        <p>${songArtist}</p>
                    </div>
                    <button class="play-btn">▶</button>
                </div>
            `;
        }).join("");
    } catch (renderError) {
        console.error("Render error:", renderError);
        searchResults.innerHTML = `<p class="error" style="text-align:center; padding:20px; color:#ff4a4a;">Gagal menampilkan hasil pencarian.</p>`;
    }
}

// Navigasi putar lagu secara otomatis menuju index.html
function playSong(url, title, artist, thumbnail) {
    const songData = { url, title, artist, thumbnail };
    localStorage.setItem("autoplay_song", JSON.stringify(songData));
    window.location.href = "index.html";
}

window.playSong = playSong;