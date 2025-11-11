// java.js

// List of background images (adjust paths if needed)
const backgrounds = [
    'christian-7922776.jpg',
    'ai-generated-7922803.jpg',
    ' ai-generated-7922873.jpg',
    ' ai-generated-8403989.jpg',
    ' ai-generated-8403992.jpg',
    'ai-generated-8404003.jpg',
    'ai-generated-8404007.jpg',
    'ai-generated-8404009.jpg',
    'ai-generated-8404027.png',
    'christian-1119744.jpg',
    'christian-7897446.jpg',
    'christian-7897447.jpg',
    'jesus-7897338.jpg',
    'jesus-7897344.jpg',
    'jesus-7897349 (1).jpg', 
    'jesus-7897352 (1).jpg',
    'sunset-8029338.png',
    'church-windows-2217785.jpg',
];

// Wait for the page to load before applying background
window.addEventListener('DOMContentLoaded', () => {
    // Select a random image
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const selectedBackground = backgrounds[randomIndex];

    // Apply background image to body
    document.body.style.backgroundImage = `url('${selectedBackground}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center';
});

document.addEventListener("DOMContentLoaded", function () {
    const supportButton = document.querySelector(".support-btn");
    const searchBox = document.getElementById("search-box"); // Uses the new ID
    const searchForm = document.getElementById("search-form"); // Gets the new Form element
    const verseContainer = document.getElementById("verse");

    // --- INITIAL VERSE LOADING LOGIC (Kept as is) ---

    // List of Bible verses to choose from
    const verses = [
        "Jeremiah 29:11", "John 3:16", "Psalm 23:1", "Romans 8:28", 
        "Proverbs 3:5-6", "Isaiah 41:10", "Philippians 4:13"
    ];

    // Get a random verse from the list
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];

    // Fetch the verse from bible-api.com
    fetch(`https://bible-api.com/${encodeURIComponent(randomVerse)}`)
        .then(response => response.json())
        .then(data => {
            if (data.text && data.reference) {
                // Initial content is set
                verseContainer.innerHTML = `
                    “${data.text.trim()}”<br>– ${data.reference}
                `;
            } else {
                verseContainer.textContent = "Unable to load verse.";
            }
        })
        .catch(error => {
            console.error("Error fetching verse:", error);
            verseContainer.textContent = "Error loading verse.";
        });
    
    // --- NEW SEARCH LOGIC: Handles form submission (Enter key) without page reload ---
    searchForm.addEventListener("submit", async function (event) {
        // 1. PREVENT PAGE RELOAD (Crucial for SPA design)
        event.preventDefault(); 
        
        const query = searchBox.value.trim();
        if (!query) {
            alert('Please enter your question.');
            return;
        }

        // 2. SHOW LOADING MESSAGE
        verseContainer.innerHTML = `
            <div style="font-style: normal; font-size: 20px;">
                **Question:** *${query}*
            </div>
            <br>
            <div style="font-size: 16px;">
                Loading answer...
                <br>
                <div class="loader"></div> 
            </div>
        `;
        // Optionally, add a simple CSS loader animation to your css.css file:
        // .loader { border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; width: 20px; height: 20px; animation: spin 2s linear infinite; margin: 10px auto; }
        // @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        try {
            // Fetch the answer from your local backend server
            const response = await fetch(`http://localhost:3000/api/answer?question=${encodeURIComponent(query)}`);
            
            // Handle HTTP errors (like 400 or 500 status codes) gracefully
            if (!response.ok) {
                 throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.answer) {
                // 3. SUCCESS: Display the answer in the same container
                // Use innerHTML and replace \n with <br> to respect paragraph breaks
                verseContainer.innerHTML = `
                    <div style="font-style: normal; font-size: 20px; font-weight: bold; margin-bottom: 12px;">
                        Your Answer:
                    </div>
                    <div style="font-size: 18px; line-height: 1.6; text-align: left; padding: 0 10px;">
                        ${data.answer.replace(/\n/g, '<br>')}
                    </div>
                `;
                // Clear the search box after a successful search
                searchBox.value = '';

            } else {
                // Server returned a structural error (e.g., no 'answer' property)
                verseContainer.innerHTML = "Error: Invalid response structure from server.";
            }
            
        } catch (error) {
            // Network/Connection/Server Crash Error
            console.error("Fetch error:", error);
            verseContainer.innerHTML = `
                <div style="color: #ffcccc; font-size: 16px; font-style: normal;">
                    <br>
                    **Sorry, an error occurred.** Please check your Command Prompt (server log) for details.
                    <br><br>
                    (Hint: Server is not running or the API key is invalid.)
                </div>
            `;
        }
    });

    // --- OTHER EVENT LISTENERS (Kept for Support Button) ---
    supportButton.addEventListener("click", function () {
        window.location.href = 'support.html';
    });

    // Log user input (optional, for debugging)
    searchBox.addEventListener("input", function () {
        console.log("User typed:", searchBox.value);
    });
});