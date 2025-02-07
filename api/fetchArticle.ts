import fetch from 'node-fetch'; // Ensure you have installed `node-fetch`

export default async function handler(req, res) {
  try {
    // Make the request to Wikipedia's API to get a random article
    const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=1&origin=*`;
    const response = await fetch(wikipediaApiUrl);
    const data = await response.json();

    // If Wikipedia's API responds with an error, handle it
    if (!data.query || !data.query.random || data.query.random.length === 0) {
      return res.status(500).json({ error: "Unexpected Wikipedia API response" });
    }

    // Parse and return the necessary data from Wikipedia API response
    const pageId = data.query.random[0].id;

    // Fetch details of the article using the retrieved pageId
    const articleResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=extracts|info|links&exintro=true&explaintext=true&inprop=url&pllimit=max&origin=*`
    );
    const articleData = await articleResponse.json();
    console.log("Wikipedia API Response:", articleData); // Debugging

    if (!articleData.query || !articleData.query.pages[pageId]) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = articleData.query.pages[pageId];

    const pageTitle = page.title;
    const pageExtract = page.extract;

    // Extract links (if available)
    const links = page.links ? page.links.map((link: { title: string }) => link.title) : [];

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
