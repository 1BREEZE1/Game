// Memory Match Game Logic
class MemoryMatchGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.movesCount = document.getElementById('moves-count');
        this.timeCount = document.getElementById('time-count');
        this.pairsFound = document.getElementById('pairs-found');
        this.totalPairs = document.getElementById('total-pairs');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.gameTimer = null;
        this.gameStarted = false;
        this.gamePaused = false;
        
        // Card symbols for different difficulties
        this.cardSymbols = {
            easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
            medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
            hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']
        };
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.resetGameState();
        this.createGameBoard();
    }
    
    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.gameStarted = false;
        this.gamePaused = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        this.updateUI();
    }
    
    createGameBoard() {
        const difficulty = this.difficultySelect.value;
        const boardConfig = this.getBoardConfig(difficulty);
        
        // Clear existing board
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${difficulty}`;
        
        // Create card pairs
        const symbols = this.cardSymbols[difficulty].slice(0, boardConfig.pairs);
        const cardData = [...symbols, ...symbols]; // Create pairs
        
        // Shuffle cards
        this.shuffleArray(cardData);
        
        // Create card elements
        cardData.forEach((symbol, index) => {
            const card = this.createCard(symbol, index);
            this.cards.push(card);
            this.gameBoard.appendChild(card.element);
        });
        
        // Update total pairs display
        this.totalPairs.textContent = boardConfig.pairs;
        this.pairsFound.querySelector('span').textContent = '0';
    }
    
    getBoardConfig(difficulty) {
        const configs = {
            easy: { pairs: 6, rows: 3, cols: 4 },
            medium: { pairs: 8, rows: 4, cols: 4 },
            hard: { pairs: 12, rows: 4, cols: 6 }
        };
        return configs[difficulty];
    }
    
    createCard(symbol, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${symbol}</div>
            </div>
        `;
        
        const card = {
            element: cardElement,
            symbol: symbol,
            index: index,
            isFlipped: false,
            isMatched: false
        };
        
        cardElement.addEventListener('click', () => this.handleCardClick(card));
        
        return card;
    }
    
    handleCardClick(card) {
        if (this.gamePaused || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        // Start game timer on first click
        if (!this.gameStarted) {
            this.startGame();
        }
        
        this.flipCard(card);
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    flipCard(card) {
        card.isFlipped = true;
        card.element.classList.add('flipped');
        card.element.classList.add('flip-animation');
        
        setTimeout(() => {
            card.element.classList.remove('flip-animation');
        }, 600);
    }
    
    unflipCard(card) {
        card.isFlipped = false;
        card.element.classList.remove('flipped');
    }
    
    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            this.handleMatch(card1, card2);
        } else {
            // No match
            this.unflipCard(card1);
            this.unflipCard(card2);
        }
        
        this.flippedCards = [];
        
        // Check for game completion
        if (this.matchedPairs === this.getBoardConfig(this.difficultySelect.value).pairs) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        }
    }
    
    handleMatch(card1, card2) {
        card1.isMatched = true;
        card2.isMatched = true;
        
        card1.element.classList.add('matched', 'match-animation');
        card2.element.classList.add('matched', 'match-animation');
        
        setTimeout(() => {
            card1.element.classList.remove('match-animation');
            card2.element.classList.remove('match-animation');
        }, 600);
        
        this.matchedPairs++;
        this.updateUI();
    }
    
    startGame() {
        this.gameStarted = true;
        this.gameTimer = setInterval(() => {
            if (!this.gamePaused) {
                this.gameTime++;
                this.updateUI();
            }
        }, 1000);
    }
    
    pauseGame() {
        this.gamePaused = true;
        document.getElementById('pause-modal').classList.remove('hidden');
    }
    
    resumeGame() {
        this.gamePaused = false;
        document.getElementById('pause-modal').classList.add('hidden');
    }
    
    endGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const score = this.calculateScore();
        
        // Update win modal
        document.getElementById('final-time').textContent = this.formatTime(this.gameTime);
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-score').textContent = score;
        
        // Show win modal
        document.getElementById('win-modal').classList.remove('hidden');
    }
    
    calculateScore() {
        const difficulty = this.difficultySelect.value;
        const baseScore = { easy: 1000, medium: 1500, hard: 2000 }[difficulty];
        const timeBonus = Math.max(0, 300 - this.gameTime);
        const moveBonus = Math.max(0, (this.getBoardConfig(difficulty).pairs * 2 - this.moves) * 10);
        
        return baseScore + timeBonus + moveBonus;
    }
    
    updateUI() {
        this.movesCount.textContent = this.moves;
        this.timeCount.textContent = this.formatTime(this.gameTime);
        this.pairsFound.querySelector('span').textContent = this.matchedPairs;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    setupEventListeners() {
        // New Game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.initializeGame();
        });
        
        // Difficulty change
        this.difficultySelect.addEventListener('change', () => {
            this.initializeGame();
        });
        
        // Pause button
        document.getElementById('pause-btn').addEventListener('click', () => {
            if (this.gameStarted && !this.gamePaused) {
                this.pauseGame();
            }
        });
        
        // Resume button
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        // Quit button
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.resumeGame();
            this.initializeGame();
        });
        
        // Win modal buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            document.getElementById('win-modal').classList.add('hidden');
            this.initializeGame();
        });
        
        document.getElementById('back-to-games-btn').addEventListener('click', () => {
            window.location.href = '../../index.html';
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    if (this.gameStarted && !this.gamePaused) {
                        this.pauseGame();
                    } else if (this.gamePaused) {
                        this.resumeGame();
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    if (this.gameStarted && !this.gamePaused) {
                        this.pauseGame();
                    } else if (this.gamePaused) {
                        this.resumeGame();
                    }
                    break;
                case 'n':
                case 'N':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.initializeGame();
                    }
                    break;
            }
        });
        
        // Close modals when clicking outside
        document.getElementById('win-modal').addEventListener('click', (e) => {
            if (e.target.id === 'win-modal') {
                document.getElementById('win-modal').classList.add('hidden');
                this.initializeGame();
            }
        });
        
        document.getElementById('pause-modal').addEventListener('click', (e) => {
            if (e.target.id === 'pause-modal') {
                this.resumeGame();
            }
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryMatchGame();
});

// Add some fun sound effects (optional - using Web Audio API)
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playFlipSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playMatchSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playWinSound() {
        if (!this.audioContext) return;
        
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.15);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.15 + 0.2);
            
            oscillator.start(this.audioContext.currentTime + index * 0.15);
            oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.2);
        });
    }
}

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'memory-match';
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

// Initialize sound effects
const soundEffects = new SoundEffects();
