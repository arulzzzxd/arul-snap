export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ status: false, message: "URL tidak boleh kosong" });
    }

    try {
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/api/download/ytmp3?apikey=arulzxd-keys&url=${encodeURIComponent(url)}`;
        const response = await fetch(targetUrl);
        const data = await response.json();

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}