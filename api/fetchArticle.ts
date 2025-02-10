import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    // Retrieve the random article's pageId and title

    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: 'Missing article title' });
    }
    // Fetch Wikipedia article using the title
    const wikipediaResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&prop=text|headhtml&origin=*`
    );

    const wikipediaData = await wikipediaResponse.json();


    if (!wikipediaData.parse) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Extract full article content in HTML
    const pageContent = wikipediaData.parse.text['*']; // This is the raw HTML of the article
    const pageTitle = wikipediaData.parse.title;

    // Return the article data
    res.status(200).json({
      title: pageTitle,
      content: pageContent,
      url: `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, '_')}`
    });
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    res.status(500).json({ error: 'Error fetching article from Wikipedia' });
  }
}
