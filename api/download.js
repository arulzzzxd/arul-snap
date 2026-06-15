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

    const data = await response.json();

    res.status(200).json(data);

  } catch (err) {

    res.status(500).json({
      status: false,
      error: err.message
    });

  }
}