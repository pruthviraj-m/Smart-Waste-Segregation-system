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
// ================== ENHANCED RAG AI SYSTEM ==================

// Enhanced waste knowledge base with more context
const wasteKnowledgeBase = [
    {id: "paper", type: "Paper", bin: "Blue Bin", 
     description: "Newspapers, magazines, cardboard, office paper. Must be clean and dry.",
     keywords: ["paper","book","cardboard","newspaper","magazine","notebook","envelope","box"],
     tips: ["Remove plastic wrapping", "Remove staples and clips", "Flatten cardboard boxes"]},
    
    {id: "glass", type: "Glass", bin: "Green Bin", 
     description: "Glass bottles and jars. No window glass, mirrors, or ceramics.",
     keywords: ["glass","jar","bottle","glass bottle","wine bottle","beer bottle","container"],
     tips: ["Rinse clean", "Remove lids (different material)", "No broken glass in recycling"]},
    
    {id: "organic", type: "Organic Waste", bin: "Compost Bin", 
     description: "Food scraps, yard waste, compostable materials.",
     keywords: ["food","fruit","vegetable","peel","compost","leftover","egg shell","coffee","tea"],
     tips: ["No meat or dairy in home compost", "Use compostable bags", "Keep it covered"]},
    
    {id: "plastic", type: "Rigid Plastic", bin: "Yellow Bin", 
     description: "Plastic bottles, containers, tubs. Look for recycling symbols 1, 2, 5.",
     keywords: ["plastic bottle","container","tupperware","yogurt cup","milk jug","detergent bottle"],
     tips: ["Rinse and crush", "Check recycling number", "Remove pumps from bottles"]},
    
    {id: "plastic_bag", type: "Soft Plastic", bin: "Store Drop-off", 
     description: "Plastic bags, wrappers, packaging films. NOT in curbside recycling.",
     keywords: ["plastic bag","shopping bag","carry bag","wrapper","packaging","bubble wrap","ziploc"],
     tips: ["Take to grocery store drop-off", "Reuse when possible", "Avoid single-use bags"]},
    
    {id: "ewaste", type: "Electronic Waste", bin: "E-Waste Facility", 
     description: "Electronics, batteries, cables. Contains hazardous materials.",
     keywords: ["phone","battery","charger","laptop","electronic","tv","remote","wire","cable"],
     tips: ["Find certified e-waste recycler", "Remove batteries if possible", "Wipe data from devices"]},
    
    {id: "metal", type: "Metal", bin: "Metal Bin", 
     description: "Aluminum cans, tin cans, metal containers, clean foil.",
     keywords: ["can","soda can","food can","aluminum","tin","metal","foil","metal lid"],
     tips: ["Rinse cans", "Remove paper labels", "Ball aluminum foil together"]},
    
    {id: "cloth", type: "Textiles", bin: "Donation/Textile Bin", 
     description: "Clothing, fabric, linens. Clean items can be donated.",
     keywords: ["cloth","clothes","shirt","jeans","towel","fabric","garment","linen"],
     tips: ["Clean clothes: donate", "Worn-out: textile recycling", "No wet or moldy items"]},
    
    {id: "hazardous", type: "Hazardous Waste", bin: "Special Facility", 
     description: "Batteries, chemicals, light bulbs, medicines, paint.",
     keywords: ["battery","paint","chemical","solvent","light bulb","cfl","medicine","thermometer"],
     tips: ["⚠️ Special disposal required", "Never in regular trash", "Check local drop-off events"]}
];

// Create embeddings (simplified for browser)
class SimpleRAGSystem {
    constructor() {
        this.knowledgeBase = wasteKnowledgeBase;
        this.useML = false;
        this.init();
    }
    
    async init() {
        // Try to load ML for better matching (optional)
        if (typeof tf !== 'undefined') {
            try {
                this.useML = true;
                console.log("ML features enabled");
            } catch (e) {
                console.log("Using basic matching");
            }
        }
    }
    
    // Semantic similarity using simple techniques
    calculateSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        
        // Jaccard similarity
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }
    
    // Enhanced classification with RAG principles
    async classifyWithRAG(userInput) {
        console.log("🧠 RAG AI analyzing:", userInput);
        
        // Step 1: Direct keyword matching (fast)
        const keywordResults = this.keywordMatch(userInput);
        
        // Step 2: Semantic matching (contextual)
        const semanticResults = this.semanticMatch(userInput);
        
        // Step 3: Combine results
        const combinedResults = this.combineResults(keywordResults, semanticResults, userInput);
        
        // Step 4: Generate explanation
        const explanation = this.generateExplanation(combinedResults, userInput);
        
        return {
            classification: combinedResults.bestMatch,
            confidence: combinedResults.confidence,
            explanation: explanation,
            alternatives: combinedResults.alternatives,
            source: "RAG AI System"
        };
    }
    
    keywordMatch(text) {
        const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
        let results = [];
        
        this.knowledgeBase.forEach(item => {
            let score = 0;
            let matchedKeywords = [];
            
            tokens.forEach(token => {
                item.keywords.forEach(keyword => {
                    if (keyword.includes(token) || token.includes(keyword)) {
                        score += 1;
                        if (!matchedKeywords.includes(keyword)) {
                            matchedKeywords.push(keyword);
                        }
                    }
                });
            });
            
            if (score > 0) {
                results.push({
                    item: item,
                    score: score,
                    matchedKeywords: matchedKeywords,
                    type: 'keyword'
                });
            }
        });
        
        return results.sort((a, b) => b.score - a.score);
    }
    
    semanticMatch(text) {
        const results = [];
        
        this.knowledgeBase.forEach(item => {
            // Check description similarity
            const descSimilarity = this.calculateSimilarity(text, item.description);
            
            // Check against common phrases in description
            const typeSimilarity = this.calculateSimilarity(text, item.type);
            
            const similarity = Math.max(descSimilarity, typeSimilarity);
            
            if (similarity > 0.1) {
                results.push({
                    item: item,
                    score: similarity,
                    type: 'semantic'
                });
            }
        });
        
        return results.sort((a, b) => b.score - a.score);
    }
    
    combineResults(keywordResults, semanticResults, userInput) {
        // Prioritize keyword matches
        if (keywordResults.length > 0 && keywordResults[0].score >= 2) {
            const bestMatch = keywordResults[0];
            return {
                bestMatch: bestMatch.item,
                confidence: Math.min(0.9, bestMatch.score / 5),
                alternatives: keywordResults.slice(1, 3).map(r => r.item),
                method: 'keyword'
            };
        }
        
        // Check for specific patterns
        if (userInput.includes("plastic") && userInput.includes("bag")) {
            const plasticBag = this.knowledgeBase.find(item => item.id === "plastic_bag");
            return {
                bestMatch: plasticBag,
                confidence: 0.95,
                alternatives: [],
                method: 'pattern'
            };
        }
        
        // Use semantic if no strong keyword match
        if (semanticResults.length > 0) {
            const bestMatch = semanticResults[0];
            return {
                bestMatch: bestMatch.item,
                confidence: bestMatch.score * 0.8,
                alternatives: semanticResults.slice(1, 3).map(r => r.item),
                method: 'semantic'
            };
        }
        
        // Fallback: find closest match
        const allItems = [...keywordResults, ...semanticResults]
            .sort((a, b) => b.score - a.score);
            
        if (allItems.length > 0) {
            return {
                bestMatch: allItems[0].item,
                confidence: allItems[0].score * 0.5,
                alternatives: allItems.slice(1, 3).map(r => r.item),
                method: 'fallback'
            };
        }
        
        return {
            bestMatch: null,
            confidence: 0,
            alternatives: [],
            method: 'none'
        };
    }
    
    generateExplanation(result, userInput) {
        if (!result.bestMatch) {
            return `I'm not sure where "${userInput}" should go. Try being more specific or ask about common items.`;
        }
        
        const confidenceText = result.confidence > 0.7 ? "high confidence" : 
                              result.confidence > 0.4 ? "moderate confidence" : "low confidence";
        
        return `Based on my knowledge: "${userInput}" appears to be ${result.bestMatch.type}.\n\n` +
               `✅ **Disposal**: ${result.bestMatch.bin}\n` +
               `📝 **Description**: ${result.bestMatch.description}\n` +
               `💡 **Tips**: ${result.bestMatch.tips.join(". ")}\n` +
               `🎯 **Confidence**: ${(result.confidence * 100).toFixed(0)}% (${confidenceText})`;
    }
    
    // Enhanced chat response with RAG
    async chatWithRAG(question) {
        // Check if it's a classification question
        const classificationPatterns = [
            "where should i throw",
            "how do i dispose",
            "what bin for",
            "recycle",
            "dispose of",
            "throw away"
        ];
        
        const isClassificationQuestion = classificationPatterns.some(pattern => 
            question.toLowerCase().includes(pattern)
        );
        
        if (isClassificationQuestion) {
            // Extract the waste item from question
            let wasteItem = question;
            classificationPatterns.forEach(pattern => {
                if (question.toLowerCase().includes(pattern)) {
                    wasteItem = question.toLowerCase().split(pattern)[1]?.trim() || wasteItem;
                }
            });
            
            const result = await this.classifyWithRAG(wasteItem);
            return result.explanation;
        }
        
        // General waste knowledge questions
        const generalResponses = {
            "what can i recycle": "Common recyclables: plastic bottles (#1,2,5), paper, cardboard, glass jars, metal cans. Check local rules!",
            "why recycle": "Recycling saves energy, reduces landfill waste, conserves resources, and helps fight climate change! 🌍",
            "compost": "Composting turns organic waste into nutrient-rich soil. Great for gardens and reduces methane from landfills.",
            "plastic bags": "⚠️ Most curbside recycling doesn't accept plastic bags. Take them to store drop-off bins.",
            "e waste": "Electronics contain valuable materials AND toxic substances. Always recycle properly at certified facilities."
        };
        
        for (const [key, response] of Object.entries(generalResponses)) {
            if (question.toLowerCase().includes(key)) {
                return response;
            }
        }
        
        return "I'm here to help with waste disposal questions! Try asking about specific items like 'plastic bottle' or 'food waste'.";
    }
}

// Initialize RAG system
const ragAI = new SimpleRAGSystem();

// ================== UPDATED WASTE ANALYSIS HANDLER ==================
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const input = document.getElementById('wasteInput').value.trim();
    const status = document.getElementById('aiStatus');
    const resultBox = document.getElementById('resultBox');
    
    if (!input) {
        status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please describe waste item';
        return;
    }
    
    status.innerHTML = '<i class="fas fa-brain"></i> RAG AI analyzing...';
    
    try {
        const result = await ragAI.classifyWithRAG(input);
        
        // Reset highlights
        document.querySelectorAll('.bin-card').forEach(card => {
            card.style.borderColor = 'var(--sdg-soft)';
            card.style.boxShadow = 'none';
        });
        
        if (!result.classification) {
            resultBox.innerHTML = `
                <div class="ai-result">
                    <h3>🤔 Uncertain Classification</h3>
                    <p>I'm not sure about "<strong>${input}</strong>"</p>
                    <p class="tip">Try: "plastic bottle", "food waste", "old phone", "shopping bag"</p>
                    <p>Or ask the chat bot for more specific guidance!</p>
                </div>
            `;
            status.innerHTML = '<i class="fas fa-question-circle"></i> RAG AI uncertain';
            return;
        }
        
        // Highlight matching bin
        const matchedBin = document.querySelector(`[data-id="${result.classification.id}"]`);
        if (matchedBin) {
            matchedBin.style.borderColor = 'var(--sdg)';
            matchedBin.style.boxShadow = '0 0 20px rgba(200, 154, 45, 0.5)';
            matchedBin.style.transform = 'translateY(-5px)';
        }
        
        // Display enhanced result
        const confidenceColor = result.confidence > 0.7 ? '#4CAF50' : 
                               result.confidence > 0.4 ? '#FF9800' : '#F44336';
        
        resultBox.innerHTML = `
            <div class="ai-result">
                <div class="ai-header">
                    <i class="fas fa-robot"></i>
                    <h3>RAG AI Result</h3>
                    <span class="confidence-badge" style="background: ${confidenceColor}">
                        ${(result.confidence * 100).toFixed(0)}% confident
                    </span>
                </div>
                
                <div class="result-main">
                    <h4>${result.classification.type}</h4>
                    <p><strong>🏷️ Category:</strong> ${result.classification.type}</p>
                    <p><strong>🗑️ Bin:</strong> ${result.classification.bin}</p>
                    <p><strong>📋 Description:</strong> ${result.classification.description}</p>
                    
                    <div class="tips-section">
                        <h5><i class="fas fa-lightbulb"></i> Tips:</h5>
                        <ul>
                            ${result.classification.tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${result.classification.id === 'plastic_bag' ? 
                        '<div class="warning"><i class="fas fa-exclamation-triangle"></i> Not accepted in curbside recycling!</div>' : ''}
                    
                    <div class="ai-meta">
                        <small><i class="fas fa-cogs"></i> Powered by RAG AI • ${result.method} matching</small>
                    </div>
                </div>
            </div>
        `;
        
        status.innerHTML = `<i class="fas fa-check-circle"></i> RAG AI complete (${result.method})`;
        
    } catch (error) {
        console.error("RAG AI error:", error);
        resultBox.innerHTML = `
            <div class="ai-result error">
                <h3>⚠️ AI System Error</h3>
                <p>Please try again or use simple description.</p>
            </div>
        `;
        status.innerHTML = '<i class="fas fa-times-circle"></i> System error';
    }
});

// ================== UPDATED CHAT BOT WITH RAG ==================
async function enhancedChatResponse(userMessage) {
    // Use RAG for waste-related questions
    if (userMessage.length > 3 && 
        (userMessage.includes('?') || 
         userMessage.includes('where') ||
         userMessage.includes('how') ||
         userMessage.includes('what'))) {
        
        return await ragAI.chatWithRAG(userMessage);
    }
    
    // Keep existing responses for greetings
    const existingResponses = {
        "hi": "Hello! I'm your enhanced Eco Assistant with RAG AI. Ask me detailed waste questions! 🧠",
        "hello": "Hi there! I now use Retrieval-Augmented Generation for better answers. Try me!",
        "thanks": "You're welcome! Happy to help with smarter AI! 🌱",
        "help": "I can now provide more accurate waste info using RAG technology. Ask about specific items!"
    };
    
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(existingResponses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return "I'm your enhanced Eco Assistant with RAG capabilities. Ask me detailed questions about waste disposal!";
}

// Update the sendMessage function
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    
    setTimeout(async () => {
        const response = await enhancedChatResponse(message);
        addMessage(response, false);
    }, 600);
}

// Update initial chat message
setTimeout(() => {
    addMessage("Hi! I'm your enhanced Eco Assistant with RAG AI. Ask detailed questions like 'Where should I dispose old batteries?' or 'How to recycle plastic bags?' 🧠", false);
}, 800);

// ================== ADDITIONAL CSS FOR RAG UI ==================
const ragStyles = document.createElement('style');
ragStyles.textContent = `
    .ai-result {
        background: linear-gradient(135deg, #ffffff 0%, #FFF9E6 100%);
        border-radius: 1rem;
        padding: 1.5rem;
        border-left: 5px solid var(--sdg);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .ai-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--sdg-soft);
    }
    
    .ai-header h3 {
        color: var(--sdg-dark);
        margin: 0;
    }
    
    .confidence-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        color: white;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: auto;
    }
    
    .result-main h4 {
        color: var(--sdg-dark);
        margin-bottom: 1rem;
        font-size: 1.3rem;
    }
    
    .tips-section {
        background: var(--sdg-light);
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    .tips-section h5 {
        color: var(--sdg-dark);
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .tips-section ul {
        padding-left: 1.5rem;
        margin: 0;
    }
    
    .tips-section li {
        margin-bottom: 0.25rem;
    }
    
    .warning {
        background: #FFEBEE;
        color: #C62828;
        padding: 0.75rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        border-left: 4px solid #C62828;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .ai-meta {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px dashed var(--sdg-soft);
        color: #666;
        font-size: 0.85rem;
    }
    
    .ai-result.error {
        background: #FFEBEE;
        border-left-color: #F44336;
    }
    
    /* RAG indicator in chat */
    .message.bot.rag {
        background: linear-gradient(135deg, var(--sdg-light) 0%, #E8F5E9 100%);
        border-left: 4px solid #4CAF50;
    }
`;
document.head.appendChild(ragStyles);

// Update addMessage function to show RAG indicator
const originalAddMessage = addMessage;
addMessage = function(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    // Add RAG indicator for bot responses
    if (!isUser && (text.includes("RAG") || text.includes("Based on my knowledge"))) {
        messageDiv.classList.add('rag');
    }
    
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

console.log("🚀 RAG AI System Loaded!");
