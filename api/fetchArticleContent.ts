import fetch from 'node-fetch'; 


export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`;
        console.log("Combined URL");
        console.log(wikipediaApiUrl);
        const response = await fetch(wikipediaApiUrl);
        const data = await response.json();

        if (!data.parse || !data.parse.text) {
            return res.status(404).json({ error: "Article not found" });
        }

        const pageHtml = data.parse.text['*']; // Raw HTML content

        // Send raw HTML as response
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(pageHtml);
    } catch (error) {
        console.error("Error fetching full article content:", error);
        res.status(500).send("<p>Error fetching article content from Wikipedia</p>");
    }
}
  