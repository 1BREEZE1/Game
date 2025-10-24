class CakeDecorator {
    constructor() {
        this.currentCake = {
            flavor: 'vanilla',
            frosting: 'vanilla',
            decorations: [],
            toppings: []
        };
        
        this.savedCakes = [];
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateCakeDisplay();
        this.loadSavedCakes();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
                this.playClickSound();
            });
        });
        
        // Flavor selection
        document.querySelectorAll('[data-flavor]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectFlavor(e.target.closest('.option-item').dataset.flavor);
                this.playSelectSound();
            });
        });
        
        // Frosting selection
        document.querySelectorAll('[data-frosting]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectFrosting(e.target.closest('.option-item').dataset.frosting);
                this.playSelectSound();
            });
        });
        
        // Decoration selection
        document.querySelectorAll('[data-decoration]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.toggleDecoration(e.target.closest('.option-item').dataset.decoration);
                this.playDecorationSound();
            });
        });
        
        // Topping selection
        document.querySelectorAll('[data-topping]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.toggleTopping(e.target.closest('.option-item').dataset.topping);
                this.playDecorationSound();
            });
        });
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }
    
    selectFlavor(flavor) {
        this.currentCake.flavor = flavor;
        
        // Update active state
        document.querySelectorAll('[data-flavor]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-flavor="${flavor}"]`).classList.add('active');
        
        this.updateCakeDisplay();
        this.addSparkleEffect();
    }
    
    selectFrosting(frosting) {
        this.currentCake.frosting = frosting;
        
        // Update active state
        document.querySelectorAll('[data-frosting]').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-frosting="${frosting}"]`).classList.add('active');
        
        this.updateCakeDisplay();
        this.addSparkleEffect();
    }
    
    toggleDecoration(decoration) {
        const index = this.currentCake.decorations.indexOf(decoration);
        if (index > -1) {
            this.currentCake.decorations.splice(index, 1);
        } else {
            this.currentCake.decorations.push(decoration);
        }
        
        this.updateCakeDisplay();
        this.addSparkleEffect();
    }
    
    toggleTopping(topping) {
        const index = this.currentCake.toppings.indexOf(topping);
        if (index > -1) {
            this.currentCake.toppings.splice(index, 1);
        } else {
            this.currentCake.toppings.push(topping);
        }
        
        this.updateCakeDisplay();
        this.addSparkleEffect();
    }
    
    updateCakeDisplay() {
        const cake = document.getElementById('cake');
        const decorationsContainer = document.getElementById('decorations');
        
        // Update cake flavor
        cake.className = `cake ${this.currentCake.flavor} ${this.currentCake.frosting}-frosting`;
        
        // Clear existing decorations
        decorationsContainer.innerHTML = '';
        
        // Add decorations
        this.currentCake.decorations.forEach(decoration => {
            const decorationElement = document.createElement('span');
            decorationElement.className = 'decoration-item decoration-sparkle';
            decorationElement.textContent = this.getDecorationEmoji(decoration);
            decorationsContainer.appendChild(decorationElement);
        });
        
        // Add toppings
        this.currentCake.toppings.forEach(topping => {
            const toppingElement = document.createElement('span');
            toppingElement.className = 'topping-item decoration-sparkle';
            toppingElement.textContent = this.getToppingEmoji(topping);
            decorationsContainer.appendChild(toppingElement);
        });
    }
    
    getDecorationEmoji(decoration) {
        const decorations = {
            candles: '🕯️',
            flowers: '🌸',
            hearts: '💖',
            stars: '⭐'
        };
        return decorations[decoration] || '✨';
    }
    
    getToppingEmoji(topping) {
        const toppings = {
            strawberries: '🍓',
            cherries: '🍒',
            sprinkles: '🌈',
            'chocolate-chips': '🍫'
        };
        return toppings[topping] || '🍓';
    }
    
    addSparkleEffect() {
        const cake = document.getElementById('cake');
        
        // Create sparkle effect
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.textContent = '✨';
            sparkle.style.cssText = `
                position: absolute;
                font-size: 1.5rem;
                pointer-events: none;
                left: ${Math.random() * 300}px;
                top: ${Math.random() * 200}px;
                animation: sparkleFloat 2s ease-out forwards;
                z-index: 20;
            `;
            
            cake.parentElement.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 2000);
        }
    }
    
    randomCake() {
        const flavors = ['vanilla', 'chocolate', 'strawberry', 'red-velvet'];
        const frostings = ['vanilla', 'chocolate', 'strawberry', 'cream'];
        const decorations = ['candles', 'flowers', 'hearts', 'stars'];
        const toppings = ['strawberries', 'cherries', 'sprinkles', 'chocolate-chips'];
        
        // Random selections
        this.selectFlavor(flavors[Math.floor(Math.random() * flavors.length)]);
        this.selectFrosting(frostings[Math.floor(Math.random() * frostings.length)]);
        
        // Random decorations (0-2)
        this.currentCake.decorations = [];
        const numDecorations = Math.floor(Math.random() * 3);
        for (let i = 0; i < numDecorations; i++) {
            const decoration = decorations[Math.floor(Math.random() * decorations.length)];
            if (!this.currentCake.decorations.includes(decoration)) {
                this.currentCake.decorations.push(decoration);
            }
        }
        
        // Random toppings (0-2)
        this.currentCake.toppings = [];
        const numToppings = Math.floor(Math.random() * 3);
        for (let i = 0; i < numToppings; i++) {
            const topping = toppings[Math.floor(Math.random() * toppings.length)];
            if (!this.currentCake.toppings.includes(topping)) {
                this.currentCake.toppings.push(topping);
            }
        }
        
        this.updateCakeDisplay();
        this.addSparkleEffect();
        this.playRandomSound();
        this.showMessage('🎲 Random cake created!');
    }
    
    resetCake() {
        this.currentCake = {
            flavor: 'vanilla',
            frosting: 'vanilla',
            decorations: [],
            toppings: []
        };
        
        // Reset UI
        document.querySelectorAll('.option-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector('[data-flavor="vanilla"]').classList.add('active');
        document.querySelector('[data-frosting="vanilla"]').classList.add('active');
        
        this.updateCakeDisplay();
        this.playResetSound();
        this.showMessage('🔄 Cake reset to vanilla!');
    }
    
    saveCake() {
        const cakeData = {
            ...this.currentCake,
            timestamp: new Date().toLocaleString(),
            name: this.generateCakeName()
        };
        
        this.savedCakes.push(cakeData);
        this.saveCakesToStorage();
        
        this.addSparkleEffect();
        this.playSaveSound();
        this.showMessage(`📸 Cake saved as "${cakeData.name}"!`);
    }
    
    generateCakeName() {
        const adjectives = ['Delicious', 'Sweet', 'Beautiful', 'Amazing', 'Perfect', 'Lovely'];
        const nouns = ['Delight', 'Dream', 'Creation', 'Masterpiece', 'Treat', 'Wonder'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj} ${noun}`;
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
            animation: messageSlide 3s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }
    
    loadSavedCakes() {
        try {
            const saved = localStorage.getItem('cakeDecoratorSaves');
            if (saved) {
                this.savedCakes = JSON.parse(saved);
            }
        } catch (e) {
            console.log('Could not load saved cakes');
        }
    }
    
    saveCakesToStorage() {
        try {
            localStorage.setItem('cakeDecoratorSaves', JSON.stringify(this.savedCakes));
        } catch (e) {
            console.log('Could not save to localStorage');
        }
    }
    
    // Sound Effects
    playClickSound() {
        if (!this.soundEnabled) return;
        this.playTone(600, 0.1, 0.1, 'sine');
    }
    
    playSelectSound() {
        if (!this.soundEnabled) return;
        this.playTone(800, 0.12, 0.2, 'sine');
    }
    
    playDecorationSound() {
        if (!this.soundEnabled) return;
        this.playChord([523, 659, 784], 0.08, 0.3, 'sine');
    }
    
    playRandomSound() {
        if (!this.soundEnabled) return;
        this.playChord([523, 659, 784, 988], 0.1, 0.5, 'sine');
    }
    
    playResetSound() {
        if (!this.soundEnabled) return;
        this.playTone(400, 0.1, 0.3, 'triangle');
    }
    
    playSaveSound() {
        if (!this.soundEnabled) return;
        this.playChord([659, 784, 988, 1175], 0.1, 0.6, 'sine');
    }
    
    playTone(frequency, volume, duration, waveType = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback: no sound if audio context fails
        }
    }
    
    playChord(frequencies, volume, duration, waveType = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            frequencies.forEach(freq => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = waveType;
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume / frequencies.length, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            });
        } catch (e) {
            // Fallback: no sound if audio context fails
        }
    }
}

// Global functions
function randomCake() {
    window.cakeDecorator.randomCake();
}

function resetCake() {
    window.cakeDecorator.resetCake();
}

function saveCake() {
    window.cakeDecorator.saveCake();
}

// Add required CSS animations
function addRequiredStyles() {
    if (document.getElementById('cake-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'cake-animations';
    style.textContent = `
        @keyframes sparkleFloat {
            0% {
                transform: translateY(0) scale(0);
                opacity: 1;
            }
            50% {
                transform: translateY(-30px) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(-60px) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes messageSlide {
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
    window.cakeDecorator = new CakeDecorator();
    
    // Show welcome message
    setTimeout(() => {
        window.cakeDecorator.showMessage('🍰 Welcome to Cake Decorator! Start creating your perfect cake!');
    }, 1000);
});