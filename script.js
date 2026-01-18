// ================== SIMPLE RAG SYSTEM ==================

// Enhanced waste knowledge base
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
    
    calculateMatch(userInput, item) {
        const input = userInput.toLowerCase();
        let score = 0;
        
        // Direct keyword matching
        item.keywords.forEach(keyword => {
            if (input.includes(keyword.toLowerCase())) {
                score += 3;
            }
        });
        
        // Check type and examples
        if (input.includes(item.type.toLowerCase().split(" ")[0])) {
            score += 2;
        }
        
        return score;
    }
    
    classify(userInput) {
        console.log("🔍 RAG analyzing:", userInput);
        
        if (!userInput || userInput.length < 2) {
            return { success: false, error: "Please enter a waste item" };
        }
        
        let bestMatch = null;
        let bestScore = 0;
        
        wasteKnowledge.forEach(item => {
            const score = this.calculateMatch(userInput, item);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        });
        
        // Special cases
        if (userInput.includes("plastic") && userInput.includes("bag")) {
            bestMatch = wasteKnowledge.find(item => item.id === "plastic_bag");
            bestScore = 10;
        }
        
        if (bestMatch) {
            const confidence = Math.min(bestScore / 10, 0.95);
            return {
                success: true,
                item: bestMatch,
                confidence: confidence,
                explanation: this.generateExplanation(bestMatch, confidence)
            };
        }
        
        return { success: false, error: "I'm not sure about this item" };
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
    
    // CHAT BOT INTEGRATION - This powers the chat responses
    chatResponse(question) {
        console.log("💬 Chat bot received:", question);
        const lowerQuestion = question.toLowerCase();
        
        // Check if it's asking about disposal
        const disposalPatterns = [
            "where should i",
            "how to dispose",
            "what bin for",
            "where to throw",
            "how do i throw",
            "where do i put",
            "recycle"
        ];
        
        const isDisposalQuestion = disposalPatterns.some(pattern => 
            lowerQuestion.includes(pattern)
        );
        
        if (isDisposalQuestion) {
            console.log("📦 Detected disposal question");
            // Extract the waste item
            let wasteItem = lowerQuestion;
            
            // Remove question words
            const questionWords = ["where", "how", "what", "should", "to", "do", "i", "throw", "dispose", "put", "recycle", "bin", "for"];
            questionWords.forEach(word => {
                wasteItem = wasteItem.replace(word, "").trim();
            });
            
            // Remove punctuation
            wasteItem = wasteItem.replace(/[?.,]/g, '').trim();
            
            console.log("🔍 Extracted waste item:", wasteItem);
            
            if (wasteItem.length > 2) {
                const result = this.classify(wasteItem);
                if (result.success) {
                    console.log("✅ Found answer:", result.item.type);
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
        
        if (lowerQuestion.includes("hi") || lowerQuestion.includes("hello") || lowerQuestion.includes("hey")) {
            return "Hello! I'm your Eco Assistant with RAG AI. Ask me where to dispose any item! 🧠";
        }
        
        if (lowerQuestion.includes("thanks") || lowerQuestion.includes("thank you")) {
            return "You're welcome! Happy to help with waste management! 🌱";
        }
        
        return "I'm here to help with waste disposal questions. Try asking: 'Where should I throw plastic bottles?' or 'How to recycle old electronics?'";
    }
}

// Initialize the RAG system
const rag = new SimpleRAGClassifier();

// ================== LOGIN SYSTEM (KEEP THIS) ==================
function checkLoginStatus() {
    const loginLink = document.getElementById('loginLink');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (!loginLink || !userInfo || !userName) return;
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (isLoggedIn && userEmail) {
        loginLink.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = userEmail.split('@')[0] || 'User';
    } else {
        loginLink.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    checkLoginStatus();
}
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// ================== WASTE ANALYSIS (RAG VERSION) ==================
document.getElementById('analyzeBtn').addEventListener('click', function() {
    const input = document.getElementById('wasteInput').value.trim();
    const status = document.getElementById('aiStatus');
    const resultBox = document.getElementById('resultBox');
    
    if (!input) {
        status.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter waste item';
        return;
    }
    
    status.innerHTML = '<i class="fas fa-brain"></i> RAG AI analyzing...';
    
    setTimeout(() => {
        const result = rag.classify(input);
        
        // Reset bin highlights
        document.querySelectorAll('.bin-card').forEach(card => {
            card.style.borderColor = 'var(--sdg-soft)';
            card.style.boxShadow = 'none';
        });
        
        if (!result.success) {
            resultBox.innerHTML = `
                <div style="background: #FFF3E0; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #FF9800;">
                    <h4 style="color: #EF6C00; margin-bottom: 0.5rem;">
                        <i class="fas fa-question-circle"></i> Need More Info
                    </h4>
                    <p>${result.error}</p>
                    <p><strong>Try:</strong> plastic bottle, food waste, old phone, shopping bags</p>
                </div>
            `;
            status.innerHTML = '<i class="fas fa-info-circle"></i> Try specific description';
            return;
        }
        
        // Highlight matching bin
        const matchedBin = document.querySelector(`[data-id="${result.item.id}"]`);
        if (matchedBin) {
            matchedBin.style.borderColor = '#4CAF50';
            matchedBin.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.4)';
        }
        
        // Display result
        const confidencePercent = (result.confidence * 100).toFixed(0);
        resultBox.innerHTML = `
            <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #2E7D32; margin: 0;">
                        <i class="fas fa-robot"></i> ${result.item.type}
                    </h3>
                    <span style="background: #4CAF50; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.85rem;">
                        ${confidencePercent}% confident
                    </span>
                </div>
                
                <p><strong>🗑️ Bin:</strong> ${result.item.bin}</p>
                
                <div style="background: #F5F5F5; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                    <h5 style="color: #333; margin-bottom: 0.5rem;">
                        <i class="fas fa-clipboard-list"></i> Rules:
                    </h5>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        ${result.item.rules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
                
                <p><strong>🌍 Environmental Impact:</strong> ${result.item.why}</p>
                
                ${result.item.id === 'plastic_bag' ? `
                    <div style="background: #FFEBEE; color: #C62828; padding: 0.75rem; border-radius: 0.5rem; margin: 1rem 0; border-left: 3px solid #F44336;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Warning:</strong> Not accepted in curbside recycling!
                    </div>
                ` : ''}
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #ddd; color: #666; font-size: 0.85rem;">
                    <i class="fas fa-microchip"></i> Powered by RAG AI
                </div>
            </div>
        `;
        
        status.innerHTML = '<i class="fas fa-check-circle"></i> RAG analysis complete';
        
    }, 800);
});

// Enter key support
document.getElementById('wasteInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('analyzeBtn').click();
});

// ================== CHAT BOT WITH RAG INTEGRATION ==================
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatContainer = document.querySelector('.chat-container');
const chatToggle = document.querySelector('.chat-toggle');
const closeChat = document.querySelector('.close-chat');

// Function to add messages to chat
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message handler - THIS USES RAG
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    
    // Get RAG response after delay
    setTimeout(() => {
        const response = rag.chatResponse(message);
        addMessage(response, false);
    }, 600);
}

// Event listeners for chat
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
    addMessage("Hello! I'm your **Enhanced Eco Assistant with RAG AI**! 🧠<br>Ask me: 'Where should I throw plastic bags?' or 'How to recycle old phones?'", false);
}, 1000);

// ================== QUICK TIPS ==================
const quickTips = document.querySelectorAll('.bin-card');
quickTips.forEach(bin => {
    bin.addEventListener('click', () => {
        const wasteType = bin.getAttribute('data-id');
        const category = wasteKnowledge.find(item => item.id === wasteType);
        if (category) {
            document.getElementById('wasteInput').value = category.keywords[0];
            document.getElementById('analyzeBtn').click();
        }
    });
});

// Make rag available globally for testing
window.rag = rag;

console.log("🚀 RAG System Ready! Test with:");
console.log("1. rag.classify('plastic bottle')");
console.log("2. rag.chatResponse('where to throw old phones?')");
console.log("3. Type in chat: 'how to dispose food waste?'");
