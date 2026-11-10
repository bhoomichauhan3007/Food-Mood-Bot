// ================================
// Advanced Chatbot State Machine 
// ================================

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const quickRepliesContainer = document.getElementById('quick-replies');
const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const startBtn = document.getElementById('start-btn');
const botAvatarSrc = "https://api.dicebear.com/7.x/bottts/svg?seed=ChefBot&backgroundColor=a18cd1";

// Application State
let chatState = 'INIT';
const userProfile = {
    name: '',
    foodType: '',
    mood: '',
    ingredient: ''
};

// Start the conversation on button click
startBtn.addEventListener('click', () => {
    // Transition UI
    welcomeScreen.classList.remove('active-screen');
    welcomeScreen.classList.add('hidden-screen');
    
    chatContainer.classList.remove('hidden-screen');
    chatContainer.classList.add('active-screen');
    chatContainer.classList.remove('pointer-events-none');
    
    // Start bot typing after transition
    setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addBotMessage("Hey there! Welcome to the Chef MoodBot kitchen. 🍳 What's your name?");
            chatState = 'WAITING_FOR_NAME';
        }, 1200);
    }, 600);
});

// Form submission handler
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Clear chips when user types
    clearQuickReplies();
    processUserMessage(message);
});

// Function specifically for Chip clicks
function sendQuickReply(replyText) {
    userInput.value = '';
    clearQuickReplies();
    processUserMessage(replyText);
}

// Conversation Machine Logic
function processUserMessage(message) {
    // 1. Render User Message
    addUserMessage(message);
    userInput.value = '';
    scrollToBottom();

    // 2. Show Typing Indicator
    showTypingIndicator();
    scrollToBottom();

    // 3. Determine next state with a delay
    setTimeout(() => {
        removeTypingIndicator();
        
        switch(chatState) {
            case 'WAITING_FOR_NAME':
                userProfile.name = capitalizeFirstLetter(message);
                addBotMessage(`Awesome to meet you, <span class="text-bot-accent font-bold">${userProfile.name}</span>! 🎉`);
                
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        addBotMessage("Tell me, what kind of food vibe are you usually into? (e.g. Fast Food, Healthy, Comfort, Sweet...)");
                        showQuickReplies(['🍔 Fast Food', '🥗 Healthy Greens', '🧀 Comfort Food', '🍰 Sweet Treats']);
                        chatState = 'WAITING_FOR_FOOD_TYPE';
                    }, 1200);
                }, 600);
                break;

            case 'WAITING_FOR_FOOD_TYPE':
                userProfile.foodType = message.replace(/[^\w\s]/gi, '').trim(); // Remove emojis
                addBotMessage(`Got it! You like <strong>${userProfile.foodType}</strong>. Good choice.`);
                
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        addBotMessage("Now, how are you feeling right now? Your mood dictates the recipe! 🎭");
                        showQuickReplies(['😄 Happy', '😫 Stressed', '😢 Sad', '⚡ Energetic', '🦥 Lazy']);
                        chatState = 'WAITING_FOR_MOOD';
                    }, 1200);
                }, 600);
                break;

            case 'WAITING_FOR_MOOD':
                userProfile.mood = message.replace(/[^\w\s]/gi, '').trim();
                addBotMessage(`Feeling <strong>${userProfile.mood}</strong>, huh? I know exactly how to handle that.`);
                
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        addBotMessage("One last thing! Are there any specific <strong>ingredients</strong> you absolutely want included? (E.g. Cheese, Chicken, Jalapenos, Chocolate...)");
                        showQuickReplies(['🧀 Extra Cheese', '🍗 Chicken', '🍫 Chocolate', '🌶️ Spicy', '🥑 Avocado']);
                        chatState = 'WAITING_FOR_INGREDIENT';
                    }, 1200);
                }, 600);
                break;

            case 'WAITING_FOR_INGREDIENT':
                userProfile.ingredient = message.replace(/[^\w\s]/gi, '').trim();
                addBotMessage("Perfect! Let me put on my chef hat and cook up your custom suggestion... 👨‍🍳🔥");
                chatState = 'DONE';
                
                setTimeout(() => {
                    showTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        presentFinalDish();
                    }, 2500); // longer wait for dramatic effect
                }, 1000);
                break;
                
            case 'DONE':
                const negativeWords = ['no', 'nah', 'not', 'don\'t', 'dont', 'change', 'else', 'another', 'nhi', 'nahi', 'bekar', 'bekkar', 'hate', 'aur', 'kuch', 'dusra', 'bakwas'];
                const isNegative = negativeWords.some(w => message.toLowerCase().includes(w));
                
                if (isNegative) {
                    addBotMessage("Oh! Pasand nahi aayi? No worries, let me check my secret recipes again... 🕵️‍♂️");
                    setTimeout(() => {
                        showTypingIndicator();
                        setTimeout(() => {
                            removeTypingIndicator();
                            presentFinalDish(true);
                        }, 2000); // bot pretends to search real hard
                    }, 1000);
                } else {
                    addBotMessage(`Glad you are here! If you want a completely new experience from start, just refresh the page, ${userProfile.name}!`);
                }
                break;
        }
        
    }, 1000); 
}

// Final Recommendation Logic
function presentFinalDish(isRetry = false) {
    const dish = generateCreativeDish(userProfile, isRetry);
    
    const html = `
        <div class="mt-2 w-full fade-in-up">
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-purple-100 shadow-xl relative overflow-hidden group hover:border-bot-accent transition-colors">
                <div class="absolute -right-4 -top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform duration-500">✨</div>
                
                <h3 class="text-sm uppercase tracking-wider text-bot-accent font-bold mb-1">${isRetry ? 'Alternative Recommendation:' : 'Your Custom Order:'}</h3>
                <h2 class="text-2xl font-extrabold text-gray-800 mb-3 leading-tight">${dish.title}</h2>
                <p class="text-gray-600 font-medium mb-4 italic">"A ${userProfile.mood.toLowerCase()} remedy featuring ${userProfile.ingredient.toLowerCase()}"</p>
                
                <div class="bg-purple-50 rounded-xl p-3 border border-purple-100 mt-2">
                    <p class="text-sm text-gray-700"><strong>Why this fits you, ${userProfile.name}:</strong> ${dish.description}</p>
                </div>
            </div>
        </div>
    `;
    
    addBotMessage(html, false); // false = no avatar next to the big card
    
    setTimeout(() => {
        if (!isRetry) showQuickReplies(['Nah, give me something else', 'Looks delicious!']);
        addBotMessage("Bon Appétit! 🍽️ Agar yeh dish pasand na aaye, toh aap directly bol sakte ho 'kuch aur batao' ya 'nahi khani'.");
    }, 1500);
}

// Generator for realistic restaurant-style dish names
function generateCreativeDish(p, isRetry = false) {
    const mood = p.mood.toLowerCase();
    const rawType = p.foodType.toLowerCase();
    const rawIng = p.ingredient.toLowerCase();
    
    // Normalize types to broad categories
    let category = 'default';
    if (rawType.includes('fast') || rawType.includes('junk') || rawType.includes('burger')) category = 'fast_food';
    else if (rawType.includes('health') || rawType.includes('salad') || rawType.includes('vegan') || rawType.includes('green')) category = 'healthy';
    else if (rawType.includes('comfort') || rawType.includes('warm') || rawType.includes('soup') || rawType.includes('pasta')) category = 'comfort';
    else if (rawType.includes('sweet') || rawType.includes('dessert') || rawType.includes('cake') || rawType.includes('chocolate')) category = 'sweet';

    // Real world bases
    const bases = {
        'fast_food': ["Cheeseburger", "Crispy Tacos", "Loaded Nachos", "Crunchy Fried Chicken", "Wood-Fired Pizza", "Wrap"],
        'healthy': ["Caesar Salad", "Quinoa Buddha Bowl", "Avocado Toast", "Spring Roll", "Protein Smoothie"],
        'comfort': ["Macaroni & Cheese", "Creamy Risotto", "Ramen Bowl", "Lasagna", "Homestyle Stew"],
        'sweet': ["Lava Cake", "Cheesecake", "Ice Cream Sundae", "Belgian Waffles", "Fudge Brownie"],
        'default': ["Pasta", "Stir Fry", "Burrito Bowl", "Sandwich", "Curry"]
    };

    const selectedBases = bases[category].sort(() => 0.5 - Math.random());
    const baseDish = isRetry ? selectedBases[1] || selectedBases[0] : selectedBases[0];

    const ing = capitalizeFirstLetter(rawIng);
    let realName = '';

    // Smartly combine ingredient with base dish to sound like a restaurant item
    if (baseDish.includes("Pizza")) realName = `Gourmet ${ing} Pizza`;
    else if (baseDish.includes("Burger")) realName = `Double Smash ${ing} Burger`;
    else if (baseDish.includes("Salad")) realName = `Fresh Tossed ${ing} Salad`;
    else if (baseDish.includes("Macaroni") || baseDish.includes("Mac")) realName = `Signature ${ing} Mac & Cheese`;
    else if (baseDish.includes("Cake") || baseDish.includes("Brownie") || baseDish.includes("Sundae")) realName = `Decadent ${ing} ${baseDish}`;
    else if (baseDish.includes("Bowl")) realName = `Signature ${ing} ${baseDish}`;
    else realName = `Chef's Special ${ing} ${baseDish}`;

    // Clean up redundancies (e.g., "Cheese CheeseBurger" -> "Cheese Burger")
    const cleanName = realName.replace(/(cheese)\s+(cheese)/gi, 'Cheese ').replace(/(chicken)\s+(chicken)/gi, 'Chicken ').replace(/(chocolate)\s+(chocolate)/gi, 'Chocolate ').replace(/(pizza)\s+(pizza)/gi, 'Pizza');

    let description = `A perfectly crafted restaurant-style favorite just for you! It combines fresh ${rawIng} with our authentic ${baseDish} recipe. This will instantly satisfy your craving and fix your '${mood}' mood!`;
    
    if (isRetry) {
        description = `Chef's special alternative! 🤫 Since you didn't like the first option, we dug deeper into the menu. This premium ${baseDish} uses ${rawIng} in a completely different, mouth-watering way specially to match your '${mood}' mood.`;
    }
    
    return {
        title: cleanName,
        description: description
    };
}

// Utilities for UI Injection
function addUserMessage(msg) {
    const html = `
        <div class="user-message flex justify-end fade-in-up">
            <div class="max-w-[85%]">
                <div class="message-bubble sent rounded-2xl rounded-tr-sm p-3.5 px-5 inline-block text-sm font-medium">
                    ${msg}
                </div>
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', html);
}

function addBotMessage(msg, withAvatar = true) {
    const avatarHtml = withAvatar 
        ? `<img src="${botAvatarSrc}" alt="Bot" class="w-9 h-9 rounded-full bg-white shadow py-1 self-end mb-1">`
        : `<div class="w-9"></div>`; // spacer

    const html = `
        <div class="bot-message flex gap-3 fade-in-up">
            ${avatarHtml}
            <div class="max-w-[85%]">
                <div class="message-bubble received rounded-2xl ${withAvatar ? 'rounded-bl-sm' : ''} p-3.5 px-5 inline-block text-sm font-medium">
                    ${msg}
                </div>
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', html);
    scrollToBottom();
}

function showTypingIndicator() {
    const html = `
        <div id="typing-indicator" class="bot-message flex gap-3 fade-in-up">
            <img src="${botAvatarSrc}" alt="Bot" class="w-9 h-9 rounded-full bg-white shadow py-1 self-end mb-1">
            <div class="max-w-[80%]">
                <div class="message-bubble received rounded-2xl rounded-bl-sm p-3 px-5 inline-block">
                    <div class="typing-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatBox.insertAdjacentHTML('beforeend', html);
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function showQuickReplies(options) {
    clearQuickReplies();
    quickRepliesContainer.classList.remove('hidden');
    
    options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.innerHTML = opt;
        btn.className = 'quick-reply-btn px-4 py-2 bg-white/40 hover:bg-white/80 backdrop-blur-md text-gray-800 rounded-full text-sm font-semibold shadow-sm border border-white/50 transition-all hover:-translate-y-1 hover:shadow-md active:scale-95';
        btn.style.animationDelay = `${index * 0.1}s`;
        btn.onclick = () => sendQuickReply(opt);
        quickRepliesContainer.appendChild(btn);
    });
}

function clearQuickReplies() {
    quickRepliesContainer.innerHTML = '';
}

function scrollToBottom() {
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
