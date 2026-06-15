export default async function handler(req, res) {

  const query = req.query.query;

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Query kosong"
    });
  }

  try {

    const response = await fetch(
      `https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`
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