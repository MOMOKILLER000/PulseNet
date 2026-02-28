import React, { useState } from "react";
import Navbar from "../components/Navbar";
import styles from "../styles/index.module.css";

const quotes = [
    "Success is built one step at a time.",
    "Consistency beats motivation.",
    "Great things take time.",
    "Code. Debug. Improve. Repeat.",
    "Dream big. Start small.",
    "Stay focused and never quit."
];

function Index() {
    const [quote, setQuote] = useState("");
    const [bgColor, setBgColor] = useState("#f4f4f4");

    const generateRandom = () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const randomColor =
            "#" + Math.floor(Math.random() * 16777215).toString(16);

        setQuote(randomQuote);
        setBgColor(randomColor);
    };

    return (
        <div className={styles.body}>
        <div
            className={styles.MainContainer}
        >
            <Navbar />
            <h1 className={styles.title}>
                🎲 Random Generator Page
            </h1>

            <p className={styles.quote}>
                {quote || "Click the button to generate something!"}
            </p>

            <button
                onClick={generateRandom}
                className={styles.button}
            >
                Generate Random
            </button>
        </div>
        </div>
    );
}

export default Index;