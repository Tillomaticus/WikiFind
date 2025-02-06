import fetch from 'node-fetch'; // Ensure you have installed `node-fetch`

export default async function handler(req, res) {
  const { pageId } = req.query; // Get the pageId from the query string

  if (!pageId) {
    return res.status(400).json({ error: 'Missing pageId parameter' });
  }

  try {
    // Make the request to Wikipedia's API to get the article by pageId
    const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}`;
    const response = await fetch(wikipediaApiUrl);

    // If Wikipedia's API responds with an error, handle it
    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.info });
    }

    // Parse and return the necessary data from Wikipedia API response
    const page = data.query.pages[pageId];

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const pageTitle = page.title;
    const pageExtract = page.extract;

    const links = page.links || [];

    // Send the extracted data to the client
    res.status(200).json({
      title: pageTitle,
      extract: pageExtract,
      url: `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, '_')}`,
      links: links,
    });
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    res.status(500).json({ error: 'Error fetching article from Wikipedia' });
  }
}
