import fetch from 'node-fetch';
import * as cheerio from 'cheerio';


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

        const response = await fetch(wikipediaApiUrl);
        const data = await response.json();


        console.log("in handler");
        if (!data.parse || !data.parse.text) {
            return res.status(404).json({ error: "Article not found" });
        }

        const pageHtml = data.parse.text['*']; // Raw HTML content

        // Parse HTML with cheerio
        const $ = cheerio.load(pageHtml);

        // Extract infobox
        const infoboxHtml = $('.infobox').html() || '';
        // Remove the infobox from the main content (so it doesn’t show twice)
        $('.infobox').remove();

        // Get the remaining article content
        const articleHtml = $('body').html();

        console.log("fetching ib " + infoboxHtml);

        // Return structured data
        res.status(200).json({
            content: articleHtml, 
            infobox: infoboxHtml
        });
    } catch (error) {
        console.error("Error fetching full article content:", error);
        res.status(500).json({ error: "Error fetching article content from Wikipedia" });
    }
}
