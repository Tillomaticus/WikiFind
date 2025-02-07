import React, { useState, useEffect } from 'react';
import './WikiGame.css';

type WikipediaArticle = {
    title: string;
    content: string;
    url: string;
    links: string[];
};

const WikiGame: React.FC = () => {
    const [randomArticle, setRandomArticle] = useState<WikipediaArticle | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [steps, setSteps] = useState(0);  // Track steps
    const [points, setPoints] = useState(0);  // Track points
    const [goalArticle, setGoalArticle] = useState<string | null>(null);  // Goal article

    // Fetch random article and links
    useEffect(() => {
        if (!gameStarted) return; // Don't fetch if game hasn't started

        const fetchRandomArticle = async () => {
            try {
                console.log('Fetching random article...');
                const response = await fetch('/api/fetchArticle');
                const data: WikipediaArticle = await response.json();
                console.log('Article data:', data);

                if (!data || !data.title) {
                    throw new Error('Invalid API response: Missing random article');
                }

            const parsedContent = await fetchContentFromWikipedia(data.title);

                setRandomArticle({
                    title: data.title,
                    content: parsedContent,
                    url: data.url,
                    links: data.links || [],
                });

                // Set a random goal article when the game starts
                setGoalArticle(data.title);
            } catch (error) {
                console.error('Error fetching random article:', error);
            }

        };

        fetchRandomArticle();
    }, [gameStarted]);


    const fetchContentFromWikipedia = async (articleTitle: string) => {
        try {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${articleTitle}&prop=text&format=json`);
            const data = await response.json();

            // Return the HTML content from the 'parse' API response
            return data.parse.text['*'] || '';
        } catch (error) {
            console.error('Error fetching full article content:', error);
            return 'Error loading content';
        }
    };

    // Handle clicking on a link to go to the next article
    const handleLinkClick = (linkTitle: string) => {
        const newUrl = `https://en.wikipedia.org/wiki/${linkTitle.replace(/ /g, '_')}`;
        window.open(newUrl, '_blank'); // Open the link in a new tab

        // Increment steps
        setSteps(steps + 1);

        // Optionally, award points based on proximity to the goal
        if (linkTitle === goalArticle) {
            setPoints(points + 10);  // Example: 10 points for reaching the goal
        }
    };

    // Sidebar component to display game progress
    const Sidebar: React.FC<{ steps: number, points: number, goal: string }> = ({ steps, points, goal }) => (
        <div className="sidebar">
            <h3>Game Progress</h3>
            <p>Goal: {goal}</p>
            <p>Steps: {steps}</p>
            <p>Points: {points}</p>
        </div>
    );

    return (
        <div className="game-container">
            {gameStarted && goalArticle && <Sidebar steps={steps} points={points} goal={goalArticle} />}
            <div className="main-content">
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
                                <div
                                    className="article-content"
                                    dangerouslySetInnerHTML={{ __html: randomArticle.content }} // Render parsed HTML
                                />
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
        </div>
    );
};

export default WikiGame;
