import React, { useState } from "react";

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
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                backgroundColor: bgColor,
                transition: "0.4s ease"
            }}
        >
            <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
                🎲 Random Generator Page
            </h1>

            <p style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
                {quote || "Click the button to generate something!"}
            </p>

            <button
                onClick={generateRandom}
                style={{
                    padding: "12px 24px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "#000",
                    color: "#fff"
                }}
            >
                Generate Random
            </button>
        </div>
    );
}

export default Index;