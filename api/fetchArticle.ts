// api/fetchArticle.ts

export default async function handler(req, res) {
    try {
      const { pageId } = req.query;
  
      const extractResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageId}`);
      const extractData = await extractResponse.json();
      const pageExtract = extractData.query.pages[pageId].extract;
  
      const linksResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=links&pageids=${pageId}`);
      const linksData = await linksResponse.json();
      const links = linksData.parse.links.map((link: { title: string }) => link.title);
  
      res.status(200).json({ extract: pageExtract, links });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch article data' });
    }
  }
  