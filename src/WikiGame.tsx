import React, { useState, useEffect } from 'react';

// Define the type for the API response (article data)
type WikipediaArticle = {
    title: string;
    extract: string;
    url: string;
    links: string[]; // Add an array to hold the links from the article
};

const WikiGame: React.FC = () => {
    const [randomArticle, setRandomArticle] = useState<WikipediaArticle | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    // Fetch random article and links
    useEffect(() => {
        if (!gameStarted) return; // Don't fetch if game hasn't started

        const fetchRandomArticle = async () => {
            try {
                console.log('Fetching random article...');
                const response = await fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=random&rnlimit=1&rnnamespace=0');
                const data = await response.json();
                console.log('Random article data:', data);

                const pageId = data.query.random[0].id;
                const pageTitle = data.query.random[0].title;

                // Fetch detailed info about the random article
                const detailsResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageId}`);
                const detailsData = await detailsResponse.json();
                console.log('Article details data:', detailsData);

                const pageExtract = detailsData.query.pages[pageId].extract;

                // Fetch links from the random article
                const linksResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=links&page=${pageTitle}`);
                const linksData = await linksResponse.json();
                console.log('Links data:', linksData);

                const links = linksData.parse.links.map((link: { title: string }) => link.title);

                setRandomArticle({
                    title: pageTitle,
                    extract: pageExtract,
                    url: `https://en.wikipedia.org/wiki/${pageTitle.replace(/ /g, '_')}`,
                    links: links,
                });
            } catch (error) {
                console.error('Error fetching random article:', error);
            }
        };

        fetchRandomArticle();
    }, [gameStarted]);


    // Handle clicking on a link to go to the next article
    const handleLinkClick = (linkTitle: string) => {
        const newUrl = `https://en.wikipedia.org/wiki/${linkTitle.replace(/ /g, '_')}`;
        window.open(newUrl, '_blank'); // Open the link in a new tab
    };

    return (
        <div className="p-6">
            {!gameStarted ? (
                <div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setGameStarted(true)}
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <div>
                    {randomArticle ? (
                        <div>
                            <h2 className="text-xl font-bold">{randomArticle.title}</h2>
                            <p>{randomArticle.extract}</p>
                            <a
                                href={randomArticle.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                            >
                                Read more on Wikipedia
                            </a>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Links:</h3>
                                <ul>
                                    {randomArticle.links.slice(0, 5).map((link, index) => (
                                        <li
                                            key={index}
                                            className="text-blue-500 cursor-pointer"
                                            onClick={() => handleLinkClick(link)}
                                        >
                                            {link}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p>Loading random article...</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default WikiGame;
