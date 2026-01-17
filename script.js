// ================= USER LOGIN SYSTEM =================
// Check login status on page load
function checkLoginStatus() {
    const loginLink = document.getElementById('loginLink');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (!loginLink || !userInfo || !userName) return;
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (isLoggedIn && userEmail) {
        // Show user info
        loginLink.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = userEmail.split('@')[0] || 'User';
    } else {
        // Show login button
        loginLink.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    checkLoginStatus();
    
    // Optional: Show logout message in chat
    setTimeout(() => {
        if (typeof addMessage === 'function') {
            addMessage("You've been logged out. Thanks for using Eco-AI!", false);
        }
    }, 300);
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Updated Waste Classification Data with Cloth and Better Categories
const wasteData = [
    {id: "paper", type: "Paper", bin: "Blue Bin", 
     words: ["paper","book","cardboard","newspaper","magazine","notebook","envelope"],
     tip: "Remove plastic wrapping, staples, and binder clips"},
    
    {id: "glass", type: "Glass", bin: "Green Bin", 
     words: ["glass","jar","bottle","window","mirror","glassware","drinking glass"],
     tip: "Remove lids and rinse clean. Broken glass wrap in paper before disposal"},
    
    {id: "organic", type: "Organic", bin: "Compost Bin", 
     words: ["banana","food","peel","vegetable","fruit","compost","leftover","egg shell","coffee ground"],
     tip: "No meat or dairy in home compost. Use compostable bags if available"},
    
    {id: "plastic", type: "Plastic", bin: "Yellow Bin", 
     words: ["plastic","bottle","container","tupperware","plastic cup","yogurt cup"],
     tip: "Rinse and crush containers. Check recycling number (1,2,5 best)"},
    
    {id: "plastic_bag", type: "Soft Plastic", bin: "Store Drop-off", 
     words: ["plastic bag","polythene","shopping bag","carry bag","wrapper","packaging","bubble wrap"],
     tip: "Not in curbside recycling! Take to grocery store drop-off bins"},
    
    {id: "ewaste", type: "E-Waste", bin: "E-Waste Collection", 
     words: ["phone","battery","charger","laptop","electronic","device","tv","remote","wire","cable"],
     tip: "Never in regular bins! Find certified e-waste recyclers"},
    
    {id: "metal", type: "Metal", bin: "Metal Bin", 
     words: ["can","tin","steel","metal","aluminum","foil","soda can","food can","metal lid"],
     tip: "Rinse cans. Aluminum foil must be clean and balled up"},
    
    {id: "cloth", type: "Cloth/Textile", bin: "Donation/Textile Bin", 
     words: ["cloth","clothes","fabric","textile","shirt","jeans","towel","wool","cotton","garment"],
     tip: "Clean clothes: donate. Worn-out: textile recycling (not regular bins)"},
    
    {id: "hazardous", type: "Hazardous Waste", bin: "Special Facility", 
     words: ["battery","paint","chemical","solvent","light bulb","cfl","thermometer","medicine"],
     tip: "⚠️ Special disposal needed! Contact local hazardous waste service"}
];

// AI Classification Function (Improved)
function classifyWaste(text) {
    const tokens = text.toLowerCase().split(/\s+/);
    let bestMatch = null;
    let highestScore = 0;
    
    wasteData.forEach(category => {
        let score = 0;
        tokens.forEach(token => {
            // Check for exact matches
            if (category.words.includes(token)) score += 2;
            // Check for partial matches
            category.words.forEach(word => {
                if (word.includes(token) || token.includes(word)) score += 1;
            });
        });
        if (score > highestScore) {
            highestScore = score;
            bestMatch = category;
        }
    });
    
    return {
        category: bestMatch,
        confidence: highestScore > 0 ? Math.min(highestScore / 10, 1) : 0
    };
}

// Waste Analysis Handler
document.getElementById('analyzeBtn').addEventListener('click', analyzeWaste);

function analyzeWaste() {
    const input = document.getElementById('wasteInput').value.trim();
    const status = document.getElementById('aiStatus');
    const resultBox = document.getElementById('resultBox');
    
    if (!input) {
        status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter waste description';
        return;
    }
    
    status.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    setTimeout(() => {
        const result = classifyWaste(input);
        
        // Reset all bin highlights
        document.querySelectorAll('.bin-card').forEach(card => {
            card.style.borderColor = 'var(--sdg-soft)';
            card.style.boxShadow = 'none';
        });
        
        if (!result.category || result.confidence < 0.2) {
            resultBox.innerHTML = `
                <p>🤔 Not sure about "${input}"</p>
                <p>Try being more specific: "plastic bottle", "food waste", "old phone"</p>
                <p class="tip">Or ask the chat bot for guidance!</p>
            `;
            status.innerHTML = '<i class="fas fa-question-circle"></i> Uncertain classification';
            return;
        }
        
        // Highlight the correct bin
        const matchedBin = document.querySelector(`[data-id="${result.category.id}"]`);
        if (matchedBin) {
            matchedBin.style.borderColor = 'var(--sdg)';
            matchedBin.style.boxShadow = '0 0 15px rgba(200, 154, 45, 0.4)';
        }
        
        // Display result
        const confidence = (result.confidence * 100).toFixed(0);
        resultBox.innerHTML = `
            <h3>${result.category.type}</h3>
            <p><strong>Disposal:</strong> ${result.category.bin}</p>
            <p><strong>Confidence:</strong> ${confidence}%</p>
            <p class="tip">💡 ${result.category.tip}</p>
            ${result.category.id === 'plastic_bag' ? '<p class="warning">⚠️ Not accepted in curbside recycling</p>' : ''}
        `;
        
        status.innerHTML = '<i class="fas fa-check-circle"></i> Classification complete';
    }, 600);
}

// Enter key support for waste input
document.getElementById('wasteInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') analyzeWaste();
});

// Chat Bot Functionality
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.querySelector('.chat-container');
const chatToggle = document.querySelector('.chat-toggle');
const closeChat = document.querySelector('.close-chat');

// Updated Eco Chat Responses (Accurate)
const ecoResponses = [
    // Plastic categories
    {keywords: ["plastic bag", "polythene", "shopping bag", "carry bag", "ziploc"], 
     response: "⚠️ Plastic bags clog machines! Take to store drop-off bins. Best to reuse or avoid."},
     
    {keywords: ["plastic bottle", "water bottle", "soda bottle", "shampoo bottle"], 
     response: "✅ Plastic bottles: Yellow bin. Rinse, crush, replace cap."},
     
    {keywords: ["wrapper", "chip bag", "candy wrapper", "plastic wrap"], 
     response: "❌ Most wrappers aren't recyclable. Try to reduce or find specialty recyclers."},
    
    // Paper
    {keywords: ["paper", "cardboard", "newspaper", "magazine", "envelope"], 
     response: "📄 Paper/cardboard: Blue bin. Remove plastic windows from envelopes."},
    
    // Glass
    {keywords: ["glass", "bottle", "jar", "glass container"], 
     response: "🧪 Glass: Green bin. Remove lids (different material). No broken glass!"},
    
    // Organic
    {keywords: ["food", "fruit", "vegetable", "peel", "leftover", "compost"], 
     response: "🍎 Food waste: Compost bin! Makes great fertilizer for plants."},
    
    // E-waste
    {keywords: ["battery", "phone", "electronic", "charger", "laptop", "tv"], 
     response: "🔋 E-waste: Special handling! Find certified e-waste recyclers."},
    
    // Metal
    {keywords: ["can", "aluminum", "tin can", "soda can", "metal"], 
     response: "🥫 Metal cans: Metal bin. Rinse clean."},
    
    // Cloth
    {keywords: ["cloth", "clothes", "shirt", "jeans", "towel", "fabric"], 
     response: "👕 Clean clothes: Donate! Worn-out: Textile recycling bins."},
    
    // Hazardous
    {keywords: ["light bulb", "cfl", "led bulb", "tube light"], 
     response: "💡 Bulbs: Hazardous! Special recycling. Don't throw in regular trash."},
     
    {keywords: ["medicine", "pill", "drug", "expired"], 
     response: "💊 Medicines: Return to pharmacy. Never flush down toilet!"},
    
    // General
    {keywords: ["styrofoam", "thermocol", "foam"], 
     response: "❌ Styrofoam rarely recyclable. Avoid if possible."},
     
    {keywords: ["tetrapak", "juice box", "milk carton"], 
     response: "✅ Tetra packs recyclable at special facilities. Check locally."},
    
    // Questions
    {keywords: ["why recycle", "important", "benefit"], 
     response: "🌍 Recycling saves energy, reduces pollution, conserves resources!"},
     
    {keywords: ["what can i recycle", "what goes where"], 
     response: "Common: plastic bottles (1,2,5), paper, glass, metal cans. Check local rules!"},
    
    // Greetings
    {keywords: ["hi", "hello", "hey"], 
     response: "Hello! I'm Eco Assistant. Ask me about waste disposal! 🌱"},
     
    {keywords: ["thanks", "thank you", "thank"], 
     response: "You're welcome! Thanks for caring about our planet! ♻️"},
     
    {keywords: ["help", "how to use"], 
     response: "Type items like 'plastic bottle' or ask 'where to throw phone?'"}
];

// Default response
const defaultResponse = "I'm not sure about that item. Try: plastic bottle, food waste, old phone, or ask 'what can I recycle?'";

function findResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Sort by keyword length (longest first) for better matching
    const sortedResponses = [...ecoResponses].sort((a, b) => 
        Math.max(...b.keywords.map(k => k.length)) - Math.max(...a.keywords.map(k => k.length))
    );
    
    for (const item of sortedResponses) {
        for (const keyword of item.keywords) {
            if (lowerMessage.includes(keyword)) {
                return item.response;
            }
        }
    }
    
    return defaultResponse;
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message handler
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    
    // Bot response with delay
    setTimeout(() => {
        const response = findResponse(message);
        addMessage(response, false);
    }, 400);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Toggle chat visibility
chatToggle.addEventListener('click', () => {
    chatContainer.classList.add('active');
    chatToggle.style.display = 'none';
    chatInput.focus();
});

closeChat.addEventListener('click', () => {
    chatContainer.classList.remove('active');
    chatToggle.style.display = 'flex';
});

// Initialize chat with welcome
setTimeout(() => {
    addMessage("Hi! I'm your Eco Assistant. Ask me where to dispose items like plastic bags, bottles, electronics, etc. 🌍", false);
}, 800);

// Quick tips for common items
const quickTips = document.querySelectorAll('.bin-card');
quickTips.forEach(bin => {
    bin.addEventListener('click', () => {
        const wasteType = bin.getAttribute('data-id');
        const category = wasteData.find(item => item.id === wasteType);
        if (category) {
            document.getElementById('wasteInput').value = category.words[1] || category.words[0];
            analyzeWaste();
        }
    });
});

// Add warning style
const style = document.createElement('style');
style.textContent = `
    .warning {
        color: #d32f2f;
        background: #ffebee;
        padding: 0.5rem;
        border-radius: 0.25rem;
        margin-top: 0.5rem;
        border-left: 3px solid #d32f2f;
    }
`;
document.head.appendChild(style);