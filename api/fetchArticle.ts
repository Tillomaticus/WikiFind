import fetch from 'node-fetch'; // Ensure you have installed `node-fetch`

export default async function handler(req, res) {
  try {
    // Make the request to Wikipedia's API to get a random article (only from the main namespace)
    const wikipediaApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=1&rnnamespace=0`;
    const response = await fetch(wikipediaApiUrl);
    const data = await response.json();

    // If Wikipedia's API responds with an error, handle it
    if (!data.query || !data.query.random || data.query.random.length === 0) {
      return res.status(500).json({ error: "Unexpected Wikipedia API response" });
    }

    // Retrieve the random article's pageId and title
    const randomArticle = data.query.random[0];
    const pageId = randomArticle.id;
    const pageTitle = randomArticle.title;

    // Fetch the full article content using the pageId (including the full article text in HTML format)
    const articleResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageId}&prop=revisions&rvprop=content&origin=*`
    );
    const articleData = await articleResponse.json();

    if (!articleData.query || !articleData.query.pages[pageId]) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = articleData.query.pages[pageId];
    const pageContent = page.revisions[0]['*']; // Full article content in HTML format

    // Return the article details including the full content
    res.status(200).json({
      title: pageTitle,
      content: pageContent, // Full article content in HTML
      url: `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, '_')}`,
    });
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    res.status(500).json({ error: 'Error fetching article from Wikipedia' });
  }
}
