import React, { useState, useEffect } from 'react';
import './WikiGame.css';

type WikipediaArticle = {
    title: string;
    content: string;
    infobox: string;
    url: string;
    links: string[];
};


const WikiGame: React.FC = () => {
    const [randomArticle, setRandomArticle] = useState<WikipediaArticle | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [steps, setSteps] = useState(0);
    const [points, setPoints] = useState(0);
    const [goalArticle, setGoalArticle] = useState<string | null>(null);
    const [articleContent, setArticleContent] = useState<string>("");
    const [infoboxContent, setInfoboxContent] = useState<string>("");

    // Fetch random article and links
    useEffect(() => {
        if (!gameStarted) return; // Don't fetch if game hasn't started

        const fetchRandomArticle = async () => {
            try {
                const response = await fetch('/api/fetchArticle');
                const data: WikipediaArticle = await response.json();

                if (!data || !data.title) {
                    throw new Error('Invalid API response: Missing random article');
                }

                const parsedContent = await fetchContentFromWikipedia(data.title) || { content: "", infobox: "" };


                console.log("Infobox: " + parsedContent.infobox);
                setRandomArticle({
                    title: data.title,
                    content: parsedContent.content,
                    infobox: parsedContent.infobox,
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
            const response = await fetch(`/api/fetchArticleContent?title=${encodeURIComponent(articleTitle)}`);
            const data = await response.json(); // Get raw HTML response

            console.log("json " + data.content);


            const parser = new DOMParser();
            const doc = parser.parseFromString(data.content, "text/html");

            console.log("doc " + doc.textContent);


            // Wikipedia content is wrapped inside a <div> with class "mw-parser-output"
            const contentDiv = doc.querySelector(".mw-parser-output");
            // Extract infobox seperately
            const infoboxDiv = doc.querySelector(".infobox");


            if (!contentDiv) {
                throw new Error("Failed to extract article content");
            }


            console.log("ibdiv " + infoboxDiv);

            let infoboxHtml = "";
            if (infoboxDiv) {
                infoboxHtml = infoboxDiv.outerHTML; // Store infobox HTML separately
                infoboxDiv.remove(); // Remove infobox from the main content
            }

            // Remove unnecessary elements from the main content
            contentDiv.querySelectorAll(".hatnote, .mw-editsection, .reference, .navbox, .toc, .vertical-navbox").forEach(el => el.remove());

            // Convert relative Wikipedia links to absolute
            contentDiv.querySelectorAll("a").forEach(a => {
                const href = a.getAttribute("href");
                if (href && href.startsWith("/wiki/")) {
                    a.setAttribute("href", `https://en.wikipedia.org${href}`);
                    a.setAttribute("target", "_blank"); // Open in a new tab
                }
            });

            return {
                content: contentDiv.innerHTML,
                infobox: infoboxHtml
            };
        } catch (error) {
            console.error("Error fetching full article content:", error);
            setArticleContent("<p>Error loading content</p>");
            setInfoboxContent("");
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
                                <div className="main-content">
                                    <div
                                        className="article-content"
                                        dangerouslySetInnerHTML={{ __html: randomArticle.content }} // Render parsed HTML
                                    />
                                    {randomArticle.infobox && (
                                        <div className="infobox-container">
                                            <h3 className="text-lg font-semibold">Infobox:</h3>
                                            <div
                                                className="infobox-content"
                                                dangerouslySetInnerHTML={{ __html: randomArticle.infobox }}
                                            />
                                        </div>
                                    )}
                                </div>
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
