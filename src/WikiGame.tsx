import React, { useState, useEffect } from 'react';

// Define the types for the API response (article data)
type WikipediaPage = {
    title: string;
    extract: string;
};

type WikipediaArticleData = {
    query: {
        random: { id: number; title: string }[]; 
        pages: Record<string, WikipediaPage>;
    };
};

type WikipediaArticle = {
    title: string;
    extract: string;
    url: string;
    links: string[]; 
};

const WikiGame: React.FC = () => {
    const [randomArticle, setRandomArticle] = useState<WikipediaArticle | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);

    // Fetch random article and links
    useEffect(() => {
        if (!gameStarted) return; // Don't fetch if game hasn't started

        const fetchRandomArticle = async () => {
            console.log("Yo");
            try {
                console.log('Fetching random article...');
                const response = await fetch('/api/fetchArticle'); // Calling the serverless function (assuming dynamic pageId handled in serverless function)
                const data: WikipediaArticleData = await response.json();
                console.log('Article data:', data);

                const pageId = data.query.random[0].id.toString(); // Ensure pageId is a string
                const page = data.query.pages[pageId];

                if (!page) {
                    throw new Error('Page not found');
                }

                const pageTitle = page.title;
                const pageExtract = page.extract;

                const links: string[] = [];

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
