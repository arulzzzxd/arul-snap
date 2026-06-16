export default async function handler(req, res) {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Query pencarian kosong"
    });
  }

  try {
    const response = await fetch(
      `https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) throw new Error("Gagal mengambil data dari API pusat");
    
    const data = await response.json();
    const rawVideos = data.result?.videos || [];

    // Mapping data agar aman dibaca oleh properti thumbnail maupun image
    const cleanSongs = rawVideos.map(video => ({
      url: video.url,
      title: video.title,
      artist: video.author || "Unknown Artist",
      thumbnail: video.thumbnail,
      image: video.thumbnail
    }));

    // === KUNCI UTAMA ANTI-CACHE (AGAR LAGU SELALU REFRESH/BARU) ===
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.status(200).json({
      status: true,
      result: cleanSongs
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
}