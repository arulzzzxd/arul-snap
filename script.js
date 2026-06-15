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

let isPlaying = false;

playBtn.addEventListener("click", () => {
  if (!audioPlayer.src) return;

  if (isPlaying) {
    audioPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
  } else {
    audioPlayer.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;
  }
});

audioPlayer.addEventListener("ended", () => {
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  isPlaying = false;
});

async function searchSongs(keyword) {
  try {
    const res = await fetch(
      `${API_SEARCH}?query=${encodeURIComponent(keyword)}`
    );

    const json = await res.json();

    return json.result.videos || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

function createCard(song) {
  return `
    <div class="music-card" onclick='playSong(${JSON.stringify(song)})'>
      <img src="${song.thumbnail}">
      <div class="music-info">
        <h4>${song.title}</h4>
        <p>${song.author?.name || "Unknown"}</p>
      </div>
    </div>
  `;
}

function createRow(song) {
  return `
    <div class="song-row" onclick='playSong(${JSON.stringify(song)})'>
      <img src="${song.thumbnail}">
      <div>
        <h4>${song.title}</h4>
        <p>${song.author?.name || "Unknown"}</p>
      </div>
    </div>
  `;
}

async function loadSection(keyword, container, type = "grid") {
  const songs = await searchSongs(keyword);

  if (!songs.length) {
    container.innerHTML = `
      <div class="loading">
        Tidak ada lagu ditemukan
      </div>
    `;
    return;
  }

  if (type === "row") {
    container.innerHTML = songs
      .slice(0, 8)
      .map(createRow)
      .join("");
  } else {
    container.innerHTML = songs
      .slice(0, 12)
      .map(createCard)
      .join("");
  }
}

window.playSong = async function(song) {
  try {

    playerTitle.textContent = song.title;
    playerArtist.textContent =
      song.author?.name || "Unknown";

    playerThumb.src = song.thumbnail;

    playBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i>';

    const res = await fetch(
      `${API_DOWNLOAD}?url=${encodeURIComponent(song.url)}`
    );

    const json = await res.json();

    const musicUrl = json.result.download.url;

    audioPlayer.src = musicUrl;

    downloadBtn.href = musicUrl;

    await audioPlayer.play();

    isPlaying = true;

    playBtn.innerHTML =
      '<i class="fas fa-pause"></i>';

  } catch (err) {
    console.error(err);

    alert("Gagal memutar lagu");
  }
};

async function init() {

  loadSection(
    "top hits indonesia",
    topHits
  );

  loadSection(
    "lagu viral tiktok",
    viralHits
  );

  loadSection(
    "musik terbaru 2026",
    newRelease
  );

  loadSection(
    "top music indonesia",
    recentSongs,
    "row"
  );
}

init();