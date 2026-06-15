const results = document.getElementById("searchResults");

async function searchMusic() {

  const query =
    document.getElementById("searchInput").value;

  if (!query) return;

  results.innerHTML =
    "<div class='loading'>Mencari...</div>";

  try {

    const res = await fetch(
      `/api/search?query=${encodeURIComponent(query)}`
    );

    const json = await res.json();

    const videos = json.result.videos || [];

    results.innerHTML = videos.map(v => `
      <div class="music-card">
        <img src="${v.thumbnail}">
        <div class="music-info">
          <h4>${v.title}</h4>
          <p>${v.author?.name || "Unknown"}</p>
        </div>
      </div>
    `).join("");

  } catch {

    results.innerHTML =
      "<div class='loading'>Gagal mengambil data</div>";

  }
}