// server.js (FINAL DEPLOYMENT FIX: SERVE STATIC FILES)

// --- Imports (Using require() and adding 'path') ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default; // Critical fetch fix
const path = require('path'); // CRITICAL: Module to correctly handle file paths
const app = express();
const port = process.env.PORT || 3000; 

// IMPORTANT: Reads the API key securely from the environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Apply middleware
app.use(cors()); 
app.use(express.json());

// --- Define the API Endpoint ---
app.get('/api/answer', async (req, res) => {
    const question = req.query.question;

    if (!question) {
        return res.status(400).json({ answer: 'Question parameter is required.' });
    }
    
    // 1. Define the AI's spiritual persona and task
    const systemPrompt = `You are a helpful and compassionate spiritual assistant. Answer the user's question with encouraging, single-paragraph guidance. DO NOT mention or reference any scripture within this initial paragraph. After the guidance paragraph, skip a line, and then provide ONLY ONE relevant Bible verse, including the reference, on a new line. Use the following final format: "The Word says: [Verse Text]" – [Reference].`;

    try {
        // 2. Call the Gemini API 
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + " User Question: " + question }] }],
            }),
        });
        
        const data = await geminiResponse.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error.message);
            return res.status(data.error.code || 500).json({ answer: `Gemini API Error: ${data.error.message}. Key not fully active/invalid.` });
        }

        const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: Failed to get answer.";
        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error('Server side error (Connection Fail):', error);
        res.status(500).json({ answer: 'A server error occurred. Ensure your Node server is running.' });
    }
});

// -----------------------------------------------------------------
// --- CRITICAL DEPLOYMENT FIX: Serve Frontend Files ---

// 1. Tell Express where to find static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, ''))); 

// 2. Explicitly serve index.html when a user hits the base URL (/)
app.get('/', (req, res) => {
    // NOTE: If your HTML file is named 'html.html' (as seen in a previous output),
    // you MUST rename it to 'index.html' locally for this line to work correctly.
    res.sendFile(path.join(__dirname, 'html.html')); 
});
// -----------------------------------------------------------------


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});