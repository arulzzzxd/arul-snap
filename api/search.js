export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) return res.status(400).json({ status: false, message: "Query kosong" });

  try {
    const response = await fetch(`https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    const videos = data.result?.videos || [];
    
    // Sesuaikan mapping data dengan struktur JSON asli milikmu
    const cleanSongs = videos.map(v => ({
        url: v.url,
        title: v.title,
        artist: v.author || "Unknown Artist",
        thumbnail: v.thumbnail // Ini mengambil link gambar asli Youtube (.jpg)
    }));

    res.status(200).json({ status: true, result: cleanSongs });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}