import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pageId } = req.query; // Get the pageId from the query parameters
  
  if (!pageId) {
    return res.status(400).json({ error: "Missing pageId parameter" });
  }

  try {
    // Fetch article data using Wikipedia API
    const articleResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageId}`
    );
    const articleData = await articleResponse.json();

    if (!articleData.query.pages[pageId]) {
      return res.status(404).json({ error: "Article not found" });
    }

    const pageExtract = articleData.query.pages[pageId].extract;

    // Fetch links from the article
    const linksResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=links&pageid=${pageId}`
    );
    const linksData = await linksResponse.json();

    const links = linksData.parse.links.map((link: { title: string }) => link.title);

    // Send response back to client with article data
    res.status(200).json({
      extract: pageExtract,
      links: links,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
