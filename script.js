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

// ================== SIMPLE WORKING RAG SYSTEM ==================

// Enhanced knowledge base with more detailed information
const wasteKnowledge = [
    {
        id: "paper",
        type: "Paper & Cardboard",
        bin: "Blue Recycling Bin",
        keywords: ["paper", "cardboard", "newspaper", "magazine", "book", "envelope", "box"],
        rules: ["Must be clean and dry", "No grease or food stains", "Remove plastic wrapping"],
        why: "Paper can be recycled 5-7 times into new paper products",
        examples: "Newspapers, magazines, office paper, cardboard boxes"
    },
    {
        id: "plastic",
        type: "Plastic Containers",
        bin: "Yellow Recycling Bin",
        keywords: ["plastic bottle", "water bottle", "soda bottle", "container", "jug", "tub"],
        rules: ["Rinse clean", "Check recycling number (1, 2, 5 best)", "Remove caps and pumps"],
        why: "Plastic takes 450+ years to decompose in landfill",
        examples: "Water bottles, milk jugs, detergent bottles, yogurt containers"
    },
    {
        id: "plastic_bag",
        type: "Soft Plastic & Bags",
        bin: "Store Drop-off Bin",
        keywords: ["plastic bag", "shopping bag", "carry bag", "wrapper", "packaging", "bubble wrap"],
        rules: ["NOT in curbside recycling", "Take to grocery store drop-off", "Reuse when possible"],
        why: "Bags clog recycling machinery and cause shutdowns",
        examples: "Grocery bags, bread bags, dry cleaning bags, air pillows"
    },
    {
        id: "glass",
        type: "Glass",
        bin: "Green Glass Bin",
        keywords: ["glass", "bottle", "jar", "glass bottle", "wine bottle"],
        rules: ["Rinse clean", "Remove metal lids", "No broken glass in recycling"],
        why: "Glass can be recycled endlessly without quality loss",
        examples: "Food jars, beverage bottles, condiment containers"
    },
    {
        id: "organic",
        type: "Organic Waste",
        bin: "Compost Bin / Green Bin",
        keywords: ["food", "fruit", "vegetable", "peel", "compost", "leftover", "coffee"],
        rules: ["No meat/dairy in home compost", "Use compostable bags", "Keep bin covered"],
        why: "Food waste produces methane in landfills, a potent greenhouse gas",
        examples: "Fruit peels, vegetable scraps, coffee grounds, eggshells"
    },
    {
        id: "ewaste",
        type: "Electronic Waste",
        bin: "E-Waste Collection Center",
        keywords: ["phone", "battery", "charger", "laptop", "electronic", "tv", "cable"],
        rules: ["Never in regular trash", "Find certified recycler", "Remove batteries if possible"],
        why: "Electronics contain toxic materials and valuable precious metals",
        examples: "Smartphones, laptops, batteries, cables, small appliances"
    },
    {
        id: "metal",
        type: "Metal",
        bin: "Metal Recycling Bin",
        keywords: ["can", "soda can", "food can", "aluminum", "tin", "metal"],
        rules: ["Rinse cans", "Remove paper labels", "Ball aluminum foil together"],
        why: "Recycling aluminum saves 95% energy vs making new",
        examples: "Soda cans, food cans, aluminum foil, metal lids"
    },
    {
        id: "cloth",
        type: "Textiles",
        bin: "Donation Bin / Textile Recycling",
        keywords: ["clothes", "shirt", "jeans", "towel", "fabric", "garment", "linen"],
        rules: ["Clean & dry: donate", "Worn-out: textile recycling", "No wet/moldy items"],
        why: "Textiles in landfill take 200+ years to decompose",
        examples: "Clothing, bedsheets, towels, curtains, shoes"
    },
    {
        id: "hazardous",
        type: "Hazardous Waste",
        bin: "Special Collection Facility",
        keywords: ["battery", "paint", "chemical", "light bulb", "medicine", "aerosol"],
        rules: ["⚠️ Special handling required", "Never pour down drain", "Check local drop-off"],
        why: "These materials can contaminate soil and water",
        examples: "Batteries, paints, cleaners, light bulbs, medications"
    }
];

// Simple RAG Classifier
class SimpleRAGClassifier {
    constructor() {
        console.log("✅ RAG System Initialized");
    }
    
    // Simple similarity calculation
    calculateMatch(userInput, item) {
        const input = userInput.toLowerCase();
        let score = 0;
        let matchedKeywords = [];
        
        // Direct keyword matching
        item.keywords.forEach(keyword => {
            if (input.includes(keyword.toLowerCase())) {
                score += 3;
                matchedKeywords.push(keyword);
            }
        });
        
        // Check in description and rules
        const allText = item.type.toLowerCase() + " " + 
                       item.bin.toLowerCase() + " " + 
                       item.rules.join(" ").toLowerCase() + " " +
                       item.examples.toLowerCase();
        
        if (allText.includes(input.split(" ")[0])) {
            score += 2;
        }
        
        // Bonus for exact matches
        if (input === item.type.toLowerCase() || input === item.id) {
            score += 5;
        }
        
        return { score, matchedKeywords };
    }
    
    // Classify with RAG-style response
    classify(userInput) {
        console.log("🔍 RAG analyzing:", userInput);
        
        if (!userInput || userInput.length < 2) {
            return this.createResponse(null, "Please enter a waste item to analyze", 0);
        }
        
        let bestMatch = null;
        let bestScore = 0;
        let allMatches = [];
        
        // Find all matches
        wasteKnowledge.forEach(item => {
            const match = this.calculateMatch(userInput, item);
            
            if (match.score > 0) {
                allMatches.push({
                    item: item,
                    score: match.score,
                    keywords: match.matchedKeywords
                });
                
                if (match.score > bestScore) {
                    bestScore = match.score;
                    bestMatch = item;
                }
            }
        });
        
        // Sort matches by score
        allMatches.sort((a, b) => b.score - a.score);
        
        // Special case handling
        if (userInput.includes("plastic") && userInput.includes("bag")) {
            bestMatch = wasteKnowledge.find(item => item.id === "plastic_bag");
            bestScore = 10;
        }
        
        if (userInput.includes("phone") || userInput.includes("laptop")) {
            bestMatch = wasteKnowledge.find(item => item.id === "ewaste");
            bestScore = 8;
        }
        
        if (bestMatch) {
            return this.createResponse(bestMatch, null, bestScore / 15, allMatches.slice(0, 3));
        }
        
        return this.createResponse(null, "I'm not sure about this item. Try being more specific.", 0);
    }
    
    createResponse(item, error, confidence, alternatives = []) {
        if (error) {
            return {
                success: false,
                error: error,
                confidence: 0
            };
        }
        
        return {
            success: true,
            item: item,
            confidence: Math.min(confidence, 0.95).toFixed(2),
            alternatives: alternatives.map(a => a.item),
            explanation: this.generateExplanation(item, confidence)
        };
    }
    
    generateExplanation(item, confidence) {
        const confidenceText = confidence > 0.7 ? "highly confident" : 
                              confidence > 0.4 ? "moderately confident" : "somewhat uncertain";
        
        return `I am ${confidenceText} this is **${item.type}**.\n\n` +
               `**📍 Where to dispose:** ${item.bin}\n` +
               `**📋 Important rules:** ${item.rules.join(" • ")}\n` +
               `**🌍 Why recycle:** ${item.why}\n` +
               `**📦 Examples:** ${item.examples}`;
    }
    
    // Chat response with RAG
    chatResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Check if it's asking about disposal
        const disposalKeywords = ["where", "how to", "dispose", "throw", "recycle", "bin"];
        const isDisposalQuestion = disposalKeywords.some(keyword => lowerQuestion.includes(keyword));
        
        if (isDisposalQuestion) {
            // Extract the item from question
            let wasteItem = lowerQuestion;
            disposalKeywords.forEach(keyword => {
                if (wasteItem.includes(keyword)) {
                    wasteItem = wasteItem.split(keyword)[1] || wasteItem;
                }
            });
            
            wasteItem = wasteItem.replace(/[?.,]/g, '').trim();
            
            if (wasteItem.length > 2) {
                const result = this.classify(wasteItem);
                if (result.success) {
                    return result.explanation;
                }
            }
        }
        
        // General questions
        if (lowerQuestion.includes("what can i recycle")) {
            return "You can recycle: plastic bottles/containers, paper/cardboard, glass jars, metal cans, and electronics at special facilities. ♻️";
        }
        
        if (lowerQuestion.includes("why recycle")) {
            return "Recycling saves energy, reduces landfill waste, conserves natural resources, and helps fight climate change! 🌍";
        }
        
        if (lowerQuestion.includes("plastic bag")) {
            return "⚠️ Plastic bags should NOT go in curbside recycling! Take them to grocery store drop-off bins. They clog machinery.";
        }
        
        if (lowerQuestion.includes("hi") || lowerQuestion.includes("hello")) {
            return "Hello! I'm your Eco Assistant with enhanced RAG AI. Ask me where to dispose any item! 🧠";
        }
        
        return "I'm here to help with waste disposal questions. Try asking: 'Where should I throw plastic bottles?' or 'How to recycle old electronics?'";
    }
}

// Initialize the RAG system
const rag = new SimpleRAGClassifier();

// ================== UPDATE YOUR EXISTING ANALYZE FUNCTION ==================
document.getElementById('analyzeBtn').addEventListener('click', function() {
    const input = document.getElementById('wasteInput').value.trim();
    const status = document.getElementById('aiStatus');
    const resultBox = document.getElementById('resultBox');
    
    if (!input) {
        status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter waste item';
        return;
    }
    
    status.innerHTML = '<i class="fas fa-brain"></i> RAG AI analyzing...';
    
    // Simple delay to show processing
    setTimeout(() => {
        const result = rag.classify(input);
        
        // Reset bin highlights
        document.querySelectorAll('.bin-card').forEach(card => {
            card.style.borderColor = 'var(--sdg-soft)';
            card.style.boxShadow = 'none';
            card.style.transform = 'none';
        });
        
        if (!result.success) {
            resultBox.innerHTML = `
                <div class="simple-rag-result">
                    <h3><i class="fas fa-question-circle"></i> Need More Info</h3>
                    <p>${result.error}</p>
                    <div class="suggestions">
                        <p><strong>Try examples:</strong></p>
                        <ul>
                            <li>Plastic water bottle</li>
                            <li>Food waste / banana peel</li>
                            <li>Old phone or battery</li>
                            <li>Shopping bags</li>
                        </ul>
                    </div>
                </div>
            `;
            status.innerHTML = '<i class="fas fa-info-circle"></i> Try specific description';
            return;
        }
        
        // Highlight the matching bin
        const matchedBin = document.querySelector(`[data-id="${result.item.id}"]`);
        if (matchedBin) {
            matchedBin.style.borderColor = '#4CAF50';
            matchedBin.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.3)';
            matchedBin.style.transform = 'scale(1.05)';
        }
        
        // Display RAG result
        const confidencePercent = (result.confidence * 100).toFixed(0);
        const confidenceColor = result.confidence > 0.7 ? '#4CAF50' : 
                               result.confidence > 0.4 ? '#FF9800' : '#F44336';
        
        resultBox.innerHTML = `
            <div class="simple-rag-result">
                <div class="rag-header">
                    <h3><i class="fas fa-robot"></i> RAG AI Result</h3>
                    <span class="confidence" style="background: ${confidenceColor}">
                        ${confidencePercent}% confident
                    </span>
                </div>
                
                <div class="rag-content">
                    <h4>${result.item.type}</h4>
                    
                    <div class="rag-section">
                        <h5><i class="fas fa-trash-alt"></i> Disposal</h5>
                        <p class="bin-highlight">${result.item.bin}</p>
                    </div>
                    
                    <div class="rag-section">
                        <h5><i class="fas fa-clipboard-list"></i> Rules</h5>
                        <ul>
                            ${result.item.rules.map(rule => `<li>${rule}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="rag-section">
                        <h5><i class="fas fa-leaf"></i> Environmental Impact</h5>
                        <p>${result.item.why}</p>
                    </div>
                    
                    <div class="rag-section">
                        <h5><i class="fas fa-box"></i> Common Examples</h5>
                        <p>${result.item.examples}</p>
                    </div>
                    
                    ${result.item.id === 'plastic_bag' ? `
                        <div class="warning-rag">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Important:</strong> Not accepted in curbside recycling bins
                        </div>
                    ` : ''}
                    
                    ${result.alternatives.length > 0 ? `
                        <div class="alternatives">
                            <h5><i class="fas fa-exchange-alt"></i> Also could be:</h5>
                            <p>${result.alternatives.map(a => a.type).join(', ')}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="rag-footer">
                    <small><i class="fas fa-microchip"></i> Powered by RAG AI • Retrieval-Augmented Generation</small>
                </div>
            </div>
        `;
        
        status.innerHTML = `<i class="fas fa-check-circle"></i> RAG analysis complete`;
        
    }, 800);
});

// ================== UPDATE CHAT BOT ==================
// Replace your existing sendMessage function
const originalSendMessage = window.sendMessage;
window.sendMessage = function() {
    const message = document.getElementById('chatInput').value.trim();
    if (!message) return;
    
    // Add user message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `<p>${message}</p>`;
    document.getElementById('chatMessages').appendChild(messageDiv);
    
    // Clear input
    document.getElementById('chatInput').value = '';
    
    // Scroll to bottom
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Get RAG response after delay
    setTimeout(() => {
        const response = rag.chatResponse(message);
        
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot rag-enhanced';
        botMessage.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
        document.getElementById('chatMessages').appendChild(botMessage);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
};

// Update chat toggle to use new function
document.getElementById('sendBtn').onclick = window.sendMessage;
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') window.sendMessage();
});

// ================== ADD SIMPLE RAG CSS ==================
const style = document.createElement('style');
style.textContent = `
    .simple-rag-result {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        border-left: 4px solid #4CAF50;
    }
    
    .rag-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f0f0f0;
    }
    
    .rag-header h3 {
        color: #2E7D32;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .confidence {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        color: white;
        font-size: 0.85rem;
        font-weight: bold;
    }
    
    .rag-content h4 {
        color: #333;
        margin-bottom: 1.5rem;
        font-size: 1.4rem;
    }
    
    .rag-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 0.5rem;
    }
    
    .rag-section h5 {
        color: #2E7D32;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .bin-highlight {
        background: #E8F5E9;
        padding: 0.75rem;
        border-radius: 0.5rem;
        font-weight: bold;
        color: #2E7D32;
        border-left: 3px solid #4CAF50;
    }
    
    .rag-section ul {
        padding-left: 1.5rem;
        margin: 0;
    }
    
    .rag-section li {
        margin-bottom: 0.5rem;
    }
    
    .warning-rag {
        background: #FFF3E0;
        padding: 1rem;
        border-radius: 0.5rem;
        color: #EF6C00;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-left: 3px solid #FF9800;
    }
    
    .alternatives {
        background: #E3F2FD;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    .alternatives h5 {
        color: #1565C0;
        margin-bottom: 0.5rem;
    }
    
    .rag-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px dashed #ddd;
        color: #666;
        font-size: 0.85rem;
        text-align: center;
    }
    
    .suggestions {
        background: #F5F5F5;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 1rem;
    }
    
    .suggestions ul {
        padding-left: 1.5rem;
        margin: 0.5rem 0;
    }
    
    .suggestions li {
        margin-bottom: 0.25rem;
    }
    
    .message.bot.rag-enhanced {
        background: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%);
        border-left: 4px solid #4CAF50;
    }
    
    #aiStatus i.fa-brain {
        color: #4CAF50;
    }
`;
document.head.appendChild(style);

// Test the RAG system
console.log("🚀 Simple RAG System Ready!");
console.log("Test commands:");
console.log("- rag.classify('plastic bottle')");
console.log("- rag.chatResponse('where to throw plastic bags?')");

// Update initial chat message
setTimeout(() => {
    if (document.getElementById('chatMessages')) {
        const chatDiv = document.getElementById('chatMessages');
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'message bot rag-enhanced';
        welcomeMsg.innerHTML = '<p>Hello! I\'m your <strong>Enhanced Eco Assistant with RAG AI</strong>! 🧠<br>Ask me: "Where should I throw plastic bags?" or "How to recycle old phones?"</p>';
        chatDiv.appendChild(welcomeMsg);
    }
}, 1000);

// Make rag available globally for testing
window.rag = rag;

console.log("🚀 RAG AI System Loaded!");

