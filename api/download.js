export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      message: "URL kosong"
    });
  }

  try {
    const response = await fetch(
      `https://simple-api-lagi.vercel.app/api/download/ytmp3?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) throw new Error("Gagal mengunduh audio dari API pusat");

    const data = await response.json();

    // Sesuai JSON kamu: link audio di data.result.download.url
    const downloadLink = data.result?.download?.url;

    if (!downloadLink) {
      return res.status(400).json({
        status: false,
        message: "Link download tidak ditemukan dari API pusat"
      });
    }

    res.status(200).json({
      status: true,
      result: {
        download: downloadLink
      }
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message
    });
  }
}