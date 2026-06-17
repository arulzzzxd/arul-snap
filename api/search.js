export default async function handler(req, res) {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ status: false, message: "Query tidak boleh kosong" });
    }

    try {
        const targetUrl = `https://api-arulzxd-vvipclouds.vercel.app/api/search/ytsearch?apikey=arulzxd-keys&query=${encodeURIComponent(query)}`;
        const response = await fetch(targetUrl, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const data = await response.json();
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}