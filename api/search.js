// api/search.js
export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) return res.status(400).json({ status: false, message: "Query kosong" });

  try {
    // GANTI dengan URL API alternatif pilihanmu yang sedang aktif
    const response = await fetch(`https://api.pilihanmu.com/ytsearch?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // Pastikan hasil return dipetakan ulang (mapping) ke format objek yang dikenali script.js kamu:
    // Format wajib: { url, title, artist, image }
    const formattedResults = (data.results || data.result || []).map(song => ({
        url: song.url || song.link,
        title: song.title,
        artist: song.artist || song.author?.name || "Unknown Artist",
        image: song.image || song.thumbnail
    }));

    res.status(200).json({ status: true, result: formattedResults });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}