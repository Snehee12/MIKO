const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configure OpenAI API
const config = new Configuration({
    apiKey: process.env.API_TOKEN
});
const openai = new OpenAIApi(config);

// Serve frontend files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Handle root request (not needed anymore but kept for testing)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle chatbot messages
app.post("/message", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            console.log("❌ No message received in request");
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("✅ User message received:", message);

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message,
            temperature: 0.7,
            max_tokens: 256
        });

        console.log("📩 OpenAI API raw response:", response);

        // Check if OpenAI returned a valid response
        if (!response || !response.data || !response.data.choices || response.data.choices.length === 0) {
            console.log("❌ OpenAI returned an invalid or empty response");
            return res.status(500).json({ error: "OpenAI returned an empty response" });
        }

        const botResponse = response.data.choices[0].text.trim();
        console.log("🤖 Chatbot response:", botResponse);

        res.json({ message: botResponse });
    } catch (err) {
        console.error("❌ Error in OpenAI API request:", err);
        res.status(500).json({ error: "Something went wrong with OpenAI API" });
    }
});

// Catch-all route to serve frontend for unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
