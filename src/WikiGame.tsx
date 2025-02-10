import React, { useState, useEffect } from 'react';
import './WikiGame.css';
import { FaQuestionCircle } from 'react-icons/fa';  // Import the Font Awesome question circle icon


type WikipediaArticle = {
    title: string;
    content: string;
    infobox: string;
    url: string;
    links: string[];
};


const WikiGame: React.FC = () => {
    const [displayArticle, setArticle] = useState<WikipediaArticle | null>(null);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [steps, setSteps] = useState(0);
    const [points, setPoints] = useState(0);
    const [goalArticle, setGoalArticle] = useState<string | null>(null);
    const [goalUrl, setGoalUrl] = useState<string | null>(null);

    // Fetch random article and links
    useEffect(() => {
        if (!gameStarted) return; // Don't fetch if game hasn't started

        const fetchRandomArticle = async () => {
            try {

                //Goal Article
                let response = await fetch('/api/fetchRandomArticle');
                let data: WikipediaArticle = await response.json();

                // Set a random goal article when the game starts 
                setGoalArticle(data.title);
                setGoalUrl(data.url);


                response = await fetch('/api/fetchRandomArticle');
                data = await response.json();

                if (!data || !data.title) {
                    throw new Error('Invalid API response: Missing random article');
                }

                const parsedContent = await fetchContentFromWikipedia(data.title) || { content: "", infobox: "" };



                setArticle({
                    title: data.title,
                    content: parsedContent.content,
                    infobox: parsedContent.infobox,
                    url: data.url,
                    links: data.links || [],
                });


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

            // Since the backend already parses the content, no need to parse it again
            const contentDiv = data.content; // Use the content directly from the response
            const infoboxHtml = data.infobox || ""; // Get the infobox HTML (it is already extracted in the backend)

            return {
                content: contentDiv,
                infobox: infoboxHtml
            };
        } catch (error) {
            console.error("Error fetching full article content:", error);
        }
    };


    // Handle clicking on a link to go to the next article
    const handleLinkClick = async (event: React.MouseEvent, linkTitle?: string) => {
        event.preventDefault(); // Stop navigation

        // If manually provided linkTitle (from sidebar), use that
        if (linkTitle) {
            await loadNewArticle(linkTitle);
            return;
        }

        // If clicked inside article content, check if it's a valid Wikipedia link
        const target = event.target as HTMLAnchorElement;
        if (target.tagName === "A" && target.href.includes("/wiki/")) {
            const articleTitle = decodeURIComponent(target.href.split("/wiki/")[1]); // Extract title
            await loadNewArticle(articleTitle);
        }
    };

    const loadNewArticle = async (articleTitle: string) => {
        try {

            setArticle({
                title: "Loading link",
                content: "<p>Loading...</p>", // Show loading text
                infobox: "",
                url: "",
                links: [],
            });


            const response = await fetch(`/api/fetchArticleContent?title=${encodeURIComponent(articleTitle)}`);
            const data = await response.json();


            // Fetch new content
            const parsedContent = await fetchContentFromWikipedia(articleTitle) || { content: "", infobox: "" };

            setArticle({
                title: articleTitle,
                content: parsedContent.content,
                infobox: parsedContent.infobox,
                url: data.url,
                links: data.links || [],
            });

            if (goalArticle) {
                const normalizedArticleTitle = articleTitle.replace(/_/g, ' ');
                const normalizedGoalTitle = goalArticle.replace(/_/g, ' ');
                if (normalizedArticleTitle === normalizedGoalTitle) {
                    setPoints((prevPoints) => prevPoints + 10);
                    setArticle({
                        title: "Congratulations",
                        content: "<p>You made it!</p>", // Show loading text
                        infobox: "",
                        url: "",
                        links: [],
                    });
                }
            }
            // Update state
            setSteps((prevSteps) => prevSteps + 1);

        } catch (error) {
            console.error("Failed to load article:", error);
        }
    };

    const handleRestart = async () => {
        setSteps(0);
        setPoints(0);

        window.location.reload();

    };

    interface SidebarProps {
        steps: number;
        points: number;
        goal: string;
        goalUrl: string;
        onRestart: () => void; // Add restart function as a prop
    }

    const Sidebar: React.FC<SidebarProps> = ({ steps, points, goal, goalUrl, onRestart }) => {
        const helpUrl = `https://en.wikipedia.org/wiki/Special:WhatLinksHere/${goal.replace(/ /g, '_')}`;

        return (
            <div className="sidebar">
                <h3>Game Progress</h3>
                <p>
                    Goal:
                    <a href={goalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {goal}
                    </a>
                </p>
                <p>
                    {/* Help Icon */}
                    <a href={helpUrl} target="_blank" rel="noopener noreferrer">
                        <FaQuestionCircle className="inline-block ml-80 text-blue-500 cursor-pointer" />
                    </a>
                </p>
                <p>Steps: {steps}</p>
                <p>Points: {points}</p>

                {/* Restart Button */}
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                    onClick={onRestart}
                >
                    Restart Game
                </button>
            </div>
        );
    };

    return (
        <div className="game-container">
            {gameStarted && goalArticle && (
                <Sidebar
                    steps={steps}
                    points={points}
                    goal={goalArticle}
                    goalUrl={goalUrl ?? ""}
                    onRestart={handleRestart} // ✅ Pass the restart function
                />
            )}
            <div className="main-content">
                {!gameStarted ? (
                    <div>
                        <p className="mt-4 text-gray-700 text-sm">
                        <strong>How to play:</strong> Your goal is to navigate from the a random Wikipedia article to another randomly selected article by clicking on links. Each time you click a link, your steps increase. Reach the goal article to earn points!
                        </p>
                        <p>
                        <strong>Hint:</strong> Click the question mark next to the goal article to see a hint which articles lead to your goal
                        </p>

                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => setGameStarted(true)}
                        >
                            Start Game
                        </button>
                    </div>
                ) : (
                    <div>
                        {displayArticle ? (
                            <div>
                                <h2 className="text-xl font-bold">{displayArticle.title}</h2>
                                <div className="main-content">
                                    {/* Handle clicks inside dynamically rendered content */}
                                    <div
                                        className="article-content"
                                        dangerouslySetInnerHTML={{ __html: displayArticle.content }}
                                        onClick={handleLinkClick} // Unified click handler
                                    />

                                    {displayArticle.infobox && (
                                        <div
                                            className="infobox-container"
                                            dangerouslySetInnerHTML={{ __html: displayArticle.infobox }}
                                            onClick={handleLinkClick} // Unified click handler
                                        />
                                    )}
                                </div>
                                {/* Manually extracted links */}
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold">Links:</h3>
                                    <ul>
                                        {displayArticle.links.slice(0, 5).map((link, index) => (
                                            <li
                                                key={index}
                                                className="text-blue-500 cursor-pointer"
                                                onClick={(e) => handleLinkClick(e, link)}
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
