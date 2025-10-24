// Color Number Game Implementation
class ColorNumberGame {
    constructor() {
        this.colorGrid = document.getElementById('colorGrid');
        this.numberGrid = document.getElementById('numberGrid');
        this.overlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        
        // Game settings
        this.colors = [
            { name: 'red', class: 'color-red', emoji: '🍎' },
            { name: 'blue', class: 'color-blue', emoji: '🌊' },
            { name: 'green', class: 'color-green', emoji: '🌿' },
            { name: 'yellow', class: 'color-yellow', emoji: '🌟' },
            { name: 'purple', class: 'color-purple', emoji: '🍇' },
            { name: 'orange', class: 'color-orange', emoji: '🧡' },
            { name: 'pink', class: 'color-pink', emoji: '🌸' },
            { name: 'cyan', class: 'color-cyan', emoji: '💎' }
        ];
        
        // Game state
        this.level = 1;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.timeLeft = 30;
        this.baseTime = 30;
        this.colorMapping = {};
        this.selectedColor = null;
        this.selectedNumber = null;
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.gameTimer = null;
        
        // High score from localStorage
        this.highScore = parseInt(localStorage.getItem('colorNumberHighScore')) || 0;
        
        // Audio settings
        this.soundEnabled = localStorage.getItem('colorNumberSoundEnabled') !== 'false';
        this.sounds = {};
        
        this.init();
    }
    
    init() {
        this.initAudio();
        this.updateDisplay();
        this.setupEventListeners();
        this.showOverlay('🧠 Memory Sharp', 'Press SPACE or tap Start to begin!');
    }
    
    initAudio() {
        // Create audio context for Web Audio API sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
            this.audioContext = null;
        }
        
        // Initialize sound effects
        this.sounds = {
            match: this.createMatchSound(),
            wrong: this.createWrongSound(),
            levelUp: this.createLevelUpSound(),
            gameOver: this.createGameOverSound(),
            tick: this.createTickSound(),
            newHighScore: this.createHighScoreSound()
        };
    }
    
    createMatchSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const currentTime = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, currentTime); // C5
            osc.frequency.setValueAtTime(659.25, currentTime + 0.1); // E5
            
            gain.gain.setValueAtTime(0.3, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
            
            osc.start(currentTime);
            osc.stop(currentTime + 0.3);
        };
    }
    
    createWrongSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const currentTime = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.2, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
            
            osc.start(currentTime);
            osc.stop(currentTime + 0.3);
        };
    }
    
    createLevelUpSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            let delay = 0;
            
            notes.forEach((freq) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'sine';
                    
                    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    
                    osc.start(this.audioContext.currentTime);
                    osc.stop(this.audioContext.currentTime + 0.4);
                }, delay);
                
                delay += 100;
            });
        };
    }
    
    createGameOverSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createTickSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.1);
        };
    }
    
    createHighScoreSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            let delay = 0;
            
            notes.forEach((freq) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    osc.type = 'sine';
                    
                    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    osc.start(this.audioContext.currentTime);
                    osc.stop(this.audioContext.currentTime + 0.3);
                }, delay);
                
                delay += 150;
            });
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName] && typeof this.sounds[soundName] === 'function') {
            try {
                this.sounds[soundName]();
            } catch (e) {
                console.log('Error playing sound:', e);
            }
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('colorNumberSoundEnabled', this.soundEnabled.toString());
        return this.soundEnabled;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && (e.code === 'Space' || e.key === ' ')) {
                e.preventDefault();
                this.startGame();
                return;
            }
            
            if (this.gameRunning) {
                this.handleKeyPress(e);
            }
        });
        
        // Start button
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Sound toggle button
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
                this.updateSoundToggleButton();
            });
            
            // Initialize sound toggle button
            this.updateSoundToggleButton();
        }
        
        // Prevent scrolling with space key
        window.addEventListener('keydown', (e) => {
            if(e.code === 'Space') {
                e.preventDefault();
            }
        }, false);
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        switch (key) {
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
                e.preventDefault();
                this.resetGame();
                break;
            case 'm':
                e.preventDefault();
                this.toggleSound();
                this.updateSoundToggleButton();
                break;
        }
    }
    
    startGame() {
        console.log('Starting Memory Sharp...');
        
        // Reset game state
        this.level = 1;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.timeLeft = this.baseTime;
        this.matchedPairs = 0;
        
        this.updateDisplay();
        this.generateLevel();
        this.hideOverlay();
        this.startTimer();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.stopTimer();
            this.showOverlay('⏸️ Game Paused', 'Press SPACE to resume');
        } else {
            this.hideOverlay();
            this.startTimer();
        }
    }
    
    resetGame() {
        this.level = 1;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.timeLeft = this.baseTime;
        this.matchedPairs = 0;
        this.stopTimer();
        this.clearGrids();
        this.updateDisplay();
        this.showOverlay('🧠 Memory Sharp', 'Press SPACE or tap Start to begin!');
    }
    
    generateLevel() {
        const pairsCount = Math.min(3 + this.level, 8); // Start with 4 pairs, max 8
        this.totalPairs = pairsCount;
        this.matchedPairs = 0;
        
        // Clear previous selections
        this.selectedColor = null;
        this.selectedNumber = null;
        
        // Generate random color-number mapping
        this.colorMapping = {};
        const availableColors = [...this.colors].slice(0, pairsCount);
        const numbers = Array.from({length: pairsCount}, (_, i) => i + 1);
        
        // Shuffle numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        // Create mapping
        availableColors.forEach((color, index) => {
            this.colorMapping[color.name] = numbers[index];
        });
        
        this.renderGrids(availableColors, numbers);
    }
    
    renderGrids(colors, numbers) {
        // Clear grids
        this.clearGrids();
        
        // Render color grid with numbers inside
        colors.forEach(color => {
            const colorTile = document.createElement('div');
            colorTile.className = `color-tile ${color.class}`;
            colorTile.dataset.color = color.name;
            
            const number = this.colorMapping[color.name];
            colorTile.innerHTML = `
                <div class="tile-emoji">${color.emoji}</div>
                <div class="tile-number">${number}</div>
            `;
            
            colorTile.addEventListener('click', () => this.selectTile(color.name, number, colorTile));
            this.colorGrid.appendChild(colorTile);
        });
        
        // Show pattern for 3 seconds, then hide numbers
        setTimeout(() => {
            this.hideNumbers();
        }, 3000);
    }
    
    clearGrids() {
        this.colorGrid.innerHTML = '';
        this.numberGrid.innerHTML = '';
    }
    
    hideNumbers() {
        document.querySelectorAll('.tile-number').forEach(numberEl => {
            numberEl.style.display = 'none';
        });
        
        // Now render the number selection grid
        this.renderNumberGrid();
    }
    
    renderNumberGrid() {
        const numbers = Object.values(this.colorMapping);
        const shuffledNumbers = [...numbers];
        
        // Shuffle numbers
        for (let i = shuffledNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]];
        }
        
        shuffledNumbers.forEach(number => {
            const numberTile = document.createElement('div');
            numberTile.className = 'number-tile';
            numberTile.innerHTML = `<div class="tile-number">${number}</div>`;
            numberTile.dataset.number = number;
            numberTile.addEventListener('click', () => this.selectNumber(number, numberTile));
            this.numberGrid.appendChild(numberTile);
        });
    }
    
    selectTile(colorName, number, tile) {
        if (this.gamePaused || !this.gameRunning) return;
        if (tile.classList.contains('matched')) return;
        
        // Clear previous selections
        document.querySelectorAll('.color-tile.selected, .number-tile.selected').forEach(t => {
            t.classList.remove('selected');
        });
        
        this.selectedColor = colorName;
        this.selectedNumber = null;
        tile.classList.add('selected');
    }
    
    selectNumber(number, tile) {
        if (this.gamePaused || !this.gameRunning) return;
        if (tile.classList.contains('matched')) return;
        if (!this.selectedColor) return;
        
        this.selectedNumber = number;
        tile.classList.add('selected');
        
        this.checkMatch();
    }
    
    checkMatch() {
        const correctNumber = this.colorMapping[this.selectedColor];
        
        if (correctNumber === this.selectedNumber) {
            this.handleCorrectMatch();
        } else {
            this.handleWrongMatch();
        }
    }
    
    handleCorrectMatch() {
        this.playSound('match');
        this.score += 10 * this.level;
        this.matchedPairs++;
        
        // Mark tiles as matched
        const colorTile = document.querySelector(`[data-color="${this.selectedColor}"].selected`);
        const numberTile = document.querySelector(`[data-number="${this.selectedNumber}"].selected`);
        
        if (colorTile && numberTile) {
            colorTile.classList.remove('selected');
            colorTile.classList.add('matched');
            numberTile.classList.remove('selected');
            numberTile.classList.add('matched');
            
            // Show the number in the color tile
            const numberEl = colorTile.querySelector('.tile-number');
            if (numberEl) {
                numberEl.style.display = 'block';
            }
        }
        
        // Clear selections
        this.selectedColor = null;
        this.selectedNumber = null;
        
        // Check if level is complete
        if (this.matchedPairs >= this.totalPairs) {
            this.completeLevel();
        }
        
        this.updateDisplay();
    }
    
    handleWrongMatch() {
        this.playSound('wrong');
        
        // Show wrong animation
        const colorTile = document.querySelector(`[data-color="${this.selectedColor}"].selected`);
        const numberTile = document.querySelector(`[data-number="${this.selectedNumber}"].selected`);
        
        if (colorTile && numberTile) {
            colorTile.classList.add('wrong');
            numberTile.classList.add('wrong');
            
            setTimeout(() => {
                colorTile.classList.remove('wrong', 'selected');
                numberTile.classList.remove('wrong', 'selected');
            }, 500);
        }
        
        // Clear selections
        this.selectedColor = null;
        this.selectedNumber = null;
        
        // Penalty: lose some time
        this.timeLeft = Math.max(0, this.timeLeft - 2);
        this.updateDisplay();
    }
    
    completeLevel() {
        this.playSound('levelUp');
        this.level++;
        this.timeLeft += 10; // Bonus time for completing level
        
        setTimeout(() => {
            this.generateLevel();
        }, 1000);
        
        this.updateDisplay();
    }
    
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.gameTimer = setInterval(() => {
            if (this.gamePaused || !this.gameRunning) return;
            
            this.timeLeft--;
            
            if (this.timeLeft <= 5 && this.timeLeft > 0) {
                this.playSound('tick');
            }
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
            
            this.updateDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.stopTimer();
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('colorNumberHighScore', this.highScore.toString());
            this.playSound('newHighScore');
            this.showOverlay('🏆 New High Score!', `Score: ${this.score} | Level: ${this.level} | Press SPACE to play again`);
        } else {
            this.playSound('gameOver');
            this.showOverlay('⏰ Time\'s Up!', `Score: ${this.score} | Level: ${this.level} | Press SPACE to play again`);
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('level').textContent = this.level;
        document.getElementById('timer').textContent = this.timeLeft;
    }
    
    updateSoundToggleButton() {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !this.soundEnabled);
            soundToggle.title = this.soundEnabled ? 'Click to mute sound' : 'Click to enable sound';
        }
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        this.overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new ColorNumberGame();
    
    // Make game globally accessible for debugging
    window.colorNumberGame = game;
});

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'memory-sharp';
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