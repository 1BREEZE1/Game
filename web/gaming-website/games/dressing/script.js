// Enhanced Princess Dress Up Game
class PrincessDressUpGame {
    constructor() {
        this.currentCategory = 'hair';
        this.currentOutfit = {
            hair: 'hair-1',
            dress: 'dress-1',
            shoes: 'shoes-1',
            accessories: 'accessory-1'
        };
        
        this.outfitCount = 0;
        this.savedOutfits = [];
        this.soundEnabled = true;
        
        // Enhanced item collections
        this.items = {
            hair: [
                { id: 'hair-1', name: 'Long Blonde', emoji: '👱‍♀️', color: '#ffd700' },
                { id: 'hair-2', name: 'Curly Brown', emoji: '👩🦱', color: '#8b4513' },
                { id: 'hair-3', name: 'Short Red', emoji: '👩🦰', color: '#ff4500' },
                { id: 'hair-4', name: 'Braided Black', emoji: '👸🏻', color: '#2f4f4f' },
                { id: 'hair-5', name: 'Princess Updo', emoji: '👰‍♀️', color: '#daa520' }
            ],
            dress: [
                { id: 'dress-1', name: 'Pink Ball Gown', emoji: '👗', color: '#ff69b4' },
                { id: 'dress-2', name: 'Blue Princess', emoji: '👗', color: '#4169e1' },
                { id: 'dress-3', name: 'Purple Sparkle', emoji: '👗', color: '#9370db' },
                { id: 'dress-4', name: 'Green Nature', emoji: '👗', color: '#32cd32' },
                { id: 'dress-5', name: 'Golden Royal', emoji: '👗', color: '#ffd700' }
            ],
            shoes: [
                { id: 'shoes-1', name: 'Glass Slippers', emoji: '👠', color: '#e6f3ff' },
                { id: 'shoes-2', name: 'Pink Heels', emoji: '👠', color: '#ff69b4' },
                { id: 'shoes-3', name: 'Golden Flats', emoji: '👠', color: '#ffd700' },
                { id: 'shoes-4', name: 'Silver Boots', emoji: '👢', color: '#c0c0c0' }
            ],
            accessories: [
                { id: 'accessory-1', name: 'Diamond Tiara', emoji: '👑', color: '#ffffff' },
                { id: 'accessory-2', name: 'Pearl Necklace', emoji: '📿', color: '#f5f5dc' },
                { id: 'accessory-3', name: 'Magic Wand', emoji: '🪄', color: '#dda0dd' },
                { id: 'accessory-4', name: 'Flower Crown', emoji: '🌸', color: '#ffb6c1' }
            ]
        };
        
        this.backgrounds = [
            { id: 'castle', name: 'Castle', emoji: '🏰' },
            { id: 'garden', name: 'Garden', emoji: '🌺' },
            { id: 'ballroom', name: 'Ballroom', emoji: '💃' },
            { id: 'beach', name: 'Beach', emoji: '🏖️' }
        ];
        
        this.currentBackground = 'castle';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCharacterDisplay();
        this.updateItemSelection();
        this.addKeyboardSupport();
        this.addAnimationEffects();
        this.updateStats();
        this.loadSavedOutfits();
    }
    
    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = btn.dataset.category;
                if (category) {
                    this.switchCategory(category);
                    this.playClickSound();
                }
            });
        });
        
        // Item selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.item-option')) {
                const itemOption = e.target.closest('.item-option');
                const itemId = itemOption.dataset.item;
                const category = itemOption.closest('.item-category').dataset.category;
                
                if (itemId && category) {
                    this.selectItem(category, itemId);
                    this.playSelectSound();
                    this.addSparkleEffect(itemOption);
                }
            }
        });
        
        // Background selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.bg-btn')) {
                const bgBtn = e.target.closest('.bg-btn');
                const bgId = bgBtn.dataset.bg;
                if (bgId) {
                    this.changeBackground(bgId);
                    this.playClickSound();
                }
            }
        });
        
        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Add hover effects
        document.querySelectorAll('.item-option, .control-btn, .action-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (this.soundEnabled) {
                    this.playHoverSound();
                }
            });
        });
    }
    
    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Update panel title
        const titles = {
            hair: '💇‍♀️ Choose Hairstyle',
            dress: '👗 Choose Dress',
            shoes: '👠 Choose Shoes',
            accessories: '💎 Choose Accessories'
        };
        
        const panelTitle = document.getElementById('panelTitle');
        if (panelTitle) {
            panelTitle.textContent = titles[category] || 'Choose Item';
        }
        
        // Show/hide item categories
        document.querySelectorAll('.item-category').forEach(cat => {
            cat.classList.add('hidden');
        });
        
        const activeCategory = document.querySelector(`[data-category="${category}"]`);
        if (activeCategory && activeCategory.closest('.item-category')) {
            activeCategory.closest('.item-category').classList.remove('hidden');
        } else {
            // Find the category in items grid
            const categoryElement = document.querySelector(`.item-category[data-category="${category}"]`);
            if (categoryElement) {
                categoryElement.classList.remove('hidden');
            }
        }
        
        this.updateItemSelection();
    }
    
    selectItem(category, itemId) {
        this.currentOutfit[category] = itemId;
        this.outfitCount++;
        
        this.updateCharacterDisplay();
        this.updateItemSelection();
        this.updateStats();
        this.celebrateChange();
        
        // Update favorite color based on selected items
        this.updateFavoriteColor();
    }
    
    updateCharacterDisplay() {
        // Update hair
        const hairElement = document.querySelector('.character-hair .hair-style');
        if (hairElement) {
            hairElement.className = `hair-style ${this.currentOutfit.hair}`;
        }
        
        // Update dress
        const dressElement = document.querySelector('.character-dress .dress-style');
        if (dressElement) {
            dressElement.className = `dress-style ${this.currentOutfit.dress}`;
        }
        
        // Update shoes
        const shoesElement = document.querySelector('.character-shoes .shoes-style');
        if (shoesElement) {
            shoesElement.className = `shoes-style ${this.currentOutfit.shoes}`;
        }
        
        // Update accessories
        const accessoryElement = document.querySelector('.character-accessories .accessory-style');
        if (accessoryElement) {
            accessoryElement.className = `accessory-style ${this.currentOutfit.accessories}`;
        }
        
        // Add animation to character
        const character = document.querySelector('.princess-character');
        if (character) {
            character.style.animation = 'none';
            setTimeout(() => {
                character.style.animation = 'gentle-float 4s ease-in-out infinite';
            }, 10);
        }
    }
    
    updateItemSelection() {
        // Update active states for all items
        Object.keys(this.currentOutfit).forEach(category => {
            const currentItem = this.currentOutfit[category];
            
            // Remove all active states in this category
            document.querySelectorAll(`[data-category="${category}"] .item-option`).forEach(option => {
                option.classList.remove('active');
            });
            
            // Add active state to current item
            const activeOption = document.querySelector(`[data-category="${category}"] [data-item="${currentItem}"]`);
            if (activeOption) {
                activeOption.classList.add('active');
            }
        });
    }
    
    changeBackground(bgId) {
        this.currentBackground = bgId;
        
        const stage = document.querySelector('.princess-stage');
        if (stage) {
            // Remove all background classes
            stage.classList.remove('castle', 'garden', 'ballroom', 'beach');
            // Add new background class
            stage.classList.add(bgId);
        }
        
        // Update active background button
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-bg="${bgId}"]`).classList.add('active');
        
        this.addBackgroundEffect(bgId);
    }
    
    addBackgroundEffect(bgId) {
        const effects = {
            castle: '🏰✨',
            garden: '🌺🦋',
            ballroom: '💃✨',
            beach: '🌊🐚'
        };
        
        const effect = effects[bgId] || '✨';
        this.createFloatingEffect(effect);
    }
    
    updateStats() {
        // Update outfit count
        const outfitCountElement = document.getElementById('outfitCount');
        if (outfitCountElement) {
            outfitCountElement.textContent = this.outfitCount;
        }
        
        // Update current style
        const currentStyleElement = document.getElementById('currentStyle');
        if (currentStyleElement) {
            const styles = ['Princess', 'Elegant', 'Magical', 'Royal', 'Charming', 'Graceful'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            currentStyleElement.textContent = randomStyle;
        }
        
        // Update sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
    }
    
    updateFavoriteColor() {
        const favoriteColorElement = document.getElementById('favoriteColor');
        if (!favoriteColorElement) return;
        
        // Determine favorite color based on current outfit
        const dressItem = this.items.dress.find(item => item.id === this.currentOutfit.dress);
        const colors = ['Pink', 'Blue', 'Purple', 'Green', 'Gold', 'Silver'];
        
        if (dressItem) {
            const colorMap = {
                '#ff69b4': 'Pink',
                '#4169e1': 'Blue',
                '#9370db': 'Purple',
                '#32cd32': 'Green',
                '#ffd700': 'Gold'
            };
            favoriteColorElement.textContent = colorMap[dressItem.color] || colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            // Number keys for categories
            const categoryKeys = {
                '1': 'hair',
                '2': 'dress',
                '3': 'shoes',
                '4': 'accessories'
            };
            
            if (categoryKeys[e.key]) {
                this.switchCategory(categoryKeys[e.key]);
                this.playClickSound();
            }
            
            // Arrow keys for item selection
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateItems(e.key === 'ArrowRight' ? 1 : -1);
            }
            
            // R for random outfit
            if (e.key.toLowerCase() === 'r') {
                randomOutfit();
            }
            
            // Space for reset
            if (e.key === ' ') {
                e.preventDefault();
                resetOutfit();
            }
            
            // S for save
            if (e.key.toLowerCase() === 's') {
                saveOutfit();
            }
        });
    }
    
    navigateItems(direction) {
        const currentItems = this.items[this.currentCategory];
        if (!currentItems) return;
        
        const currentItemId = this.currentOutfit[this.currentCategory];
        const currentIndex = currentItems.findIndex(item => item.id === currentItemId);
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = currentItems.length - 1;
        if (newIndex >= currentItems.length) newIndex = 0;
        
        const newItem = currentItems[newIndex];
        this.selectItem(this.currentCategory, newItem.id);
        this.playSelectSound();
    }
    
    addAnimationEffects() {
        // Floating hearts
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createFloatingEffect('💖');
            }
        }, 3000);
        
        // Princess sparkles
        setInterval(() => {
            if (Math.random() < 0.5) {
                this.addPrincessSparkle();
            }
        }, 2000);
    }
    
    createFloatingEffect(emoji) {
        const effect = document.createElement('div');
        effect.textContent = emoji;
        effect.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight + 50}px;
            animation: float-up 4s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 4000);
    }
    
    addPrincessSparkle() {
        const princess = document.querySelector('.princess-character');
        if (!princess) return;
        
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            pointer-events: none;
            left: ${Math.random() * 200}px;
            top: ${Math.random() * 200}px;
            animation: sparkle-fade 2s ease-out forwards;
            z-index: 10;
        `;
        
        princess.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 2000);
    }
    
    addSparkleEffect(element) {
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            pointer-events: none;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            animation: sparkle-burst 1s ease-out forwards;
            z-index: 10;
        `;
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
    
    celebrateChange() {
        const princess = document.querySelector('.princess-character');
        if (princess) {
            princess.style.transform = 'scale(1.05)';
            setTimeout(() => {
                princess.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Random celebration message
        const messages = [
            "✨ Beautiful choice!",
            "💖 Looking fabulous!",
            "🌟 Perfect style!",
            "👑 Royal elegance!",
            "🎀 Gorgeous outfit!"
        ];
        
        if (Math.random() < 0.3) {
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.showMessage(message);
        }
    }
    
    showMessage(text) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(145deg, #ff6b9d, #ff8fb3);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(255, 107, 157, 0.3);
            animation: message-slide 3s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateStats();
        
        if (this.soundEnabled) {
            this.playClickSound();
            this.showMessage("🔊 Sound enabled!");
        } else {
            this.showMessage("🔇 Sound disabled!");
        }
    }
    
    playClickSound() {
        if (!this.soundEnabled) return;
        this.playSound(800, 1000, 0.1, 0.1);
    }
    
    playSelectSound() {
        if (!this.soundEnabled) return;
        this.playSound(600, 1200, 0.15, 0.2);
    }
    
    playHoverSound() {
        if (!this.soundEnabled) return;
        this.playSound(400, 500, 0.05, 0.05);
    }
    
    playSound(startFreq, endFreq, volume, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration);
            
            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback: no sound if audio context fails
        }
    }
    
    loadSavedOutfits() {
        try {
            const saved = localStorage.getItem('princessOutfits');
            if (saved) {
                this.savedOutfits = JSON.parse(saved);
            }
        } catch (e) {
            console.log('Could not load saved outfits');
        }
    }
    
    saveCurrentOutfit() {
        const outfit = {
            ...this.currentOutfit,
            background: this.currentBackground,
            timestamp: new Date().toLocaleString(),
            name: this.generateOutfitName()
        };
        
        this.savedOutfits.push(outfit);
        
        try {
            localStorage.setItem('princessOutfits', JSON.stringify(this.savedOutfits));
        } catch (e) {
            console.log('Could not save to localStorage');
        }
        
        return outfit;
    }
    
    generateOutfitName() {
        const adjectives = ['Elegant', 'Royal', 'Magical', 'Charming', 'Graceful', 'Stunning'];
        const nouns = ['Princess', 'Queen', 'Duchess', 'Lady', 'Maiden'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj} ${noun}`;
    }
}

// Global functions for action buttons
function randomOutfit() {
    const game = window.princessGame;
    if (!game) return;
    
    // Select random items for each category
    Object.keys(game.items).forEach(category => {
        const items = game.items[category];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        game.selectItem(category, randomItem.id);
    });
    
    // Random background
    const randomBg = game.backgrounds[Math.floor(Math.random() * game.backgrounds.length)];
    game.changeBackground(randomBg.id);
    
    game.createFloatingEffect('🎲');
    game.playSelectSound();
    game.showMessage("🎲 Random outfit created!");
}

function resetOutfit() {
    const game = window.princessGame;
    if (!game) return;
    
    // Reset to default outfit
    game.currentOutfit = {
        hair: 'hair-1',
        dress: 'dress-1',
        shoes: 'shoes-1',
        accessories: 'accessory-1'
    };
    
    game.changeBackground('castle');
    game.updateCharacterDisplay();
    game.updateItemSelection();
    game.updateStats();
    
    game.playClickSound();
    game.showMessage("🔄 Back to classic princess look!");
}

function saveOutfit() {
    const game = window.princessGame;
    if (!game) return;
    
    const outfit = game.saveCurrentOutfit();
    
    game.createFloatingEffect('📸');
    game.playSelectSound();
    game.showMessage(`📸 Outfit saved as "${outfit.name}"!`);
}

// Add required CSS animations
function addRequiredStyles() {
    if (document.getElementById('game-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'game-animations';
    style.textContent = `
        @keyframes float-up {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes sparkle-fade {
            0% {
                transform: scale(0) rotate(0deg);
                opacity: 1;
            }
            50% {
                transform: scale(1.2) rotate(180deg);
                opacity: 1;
            }
            100% {
                transform: scale(0) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes sparkle-burst {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.5);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes message-slide {
            0% {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
            10%, 90% {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            100% {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    addRequiredStyles();
    window.princessGame = new PrincessDressUpGame();
    
    // Show welcome message
    setTimeout(() => {
        window.princessGame.showMessage("👸 Welcome to Princess Dress Up! Start creating your perfect look!");
    }, 1000);
});

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'dressing';
    if (window.RecommendedGames) {
        window.RecommendedGames.render(currentGameId);
        
        // Add visual feedback
        const shuffleButton = document.querySelector('.shuffle-button');
        if (shuffleButton) {
            shuffleButton.style.opacity = '0.7';
            setTimeout(() => {
                shuffleButton.style.opacity = '1';
            }, 300);
        }
    }
}

// Add background selector if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const gameControls = document.querySelector('.game-controls');
        if (gameControls && !document.querySelector('.background-selector')) {
            const bgSelector = document.createElement('div');
            bgSelector.className = 'background-selector';
            bgSelector.innerHTML = `
                <h4>🎭 Choose Background</h4>
                <div class="background-options">
                    <button class="bg-btn active" data-bg="castle" title="Castle">🏰</button>
                    <button class="bg-btn" data-bg="garden" title="Garden">🌺</button>
                    <button class="bg-btn" data-bg="ballroom" title="Ballroom">💃</button>
                    <button class="bg-btn" data-bg="beach" title="Beach">🏖️</button>
                </div>
            `;
            gameControls.appendChild(bgSelector);
        }
    }, 100);
});
