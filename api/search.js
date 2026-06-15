export default async function handler(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        message: "Query required"
      });
    }

    const response = await fetch(
      `https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);

  } catch (err) {

    return res.status(500).json({
      status: false,
      error: err.message
    });

  }
}
