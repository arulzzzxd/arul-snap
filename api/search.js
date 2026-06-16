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

    // SESUAI JSON KAMU: Ambil langsung dari data.result.videos
    const rawVideos = data.result?.videos || [];

    // Bersihkan dan samakan format propertinya
    const cleanSongs = rawVideos.map(video => ({
      url: video.url,
      title: video.title,
      artist: video.author || "Unknown Artist",
      image: video.thumbnail
    }));

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