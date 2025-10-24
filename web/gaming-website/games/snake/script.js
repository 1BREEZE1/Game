// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        
        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 150;
        this.baseSpeed = 150;
        
        // High score from localStorage
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        
        // Audio settings
        this.soundEnabled = localStorage.getItem('snakeSoundEnabled') !== 'false';
        this.sounds = {};
        
        this.init();
    }
    
    init() {
        this.initAudio();
        this.updateDisplay();
        this.generateFood();
        this.setupEventListeners();
        this.setupMobileControls();
        this.draw();
        this.showOverlay('🐍 Snake Game', 'Press SPACE or tap Start to begin!');
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
            eat: this.createEatSound(),
            gameOver: this.createGameOverSound(),
            move: this.createMoveSound(),
            newHighScore: this.createHighScoreSound()
        };
    }
    
    createEatSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const currentTime = this.audioContext.currentTime;
            
            // Create noise for crunch effect
            const bufferSize = this.audioContext.sampleRate * 0.15;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            
            const noise = this.audioContext.createBufferSource();
            const filter = this.audioContext.createBiquadFilter();
            const gain = this.audioContext.createGain();
            
            noise.buffer = buffer;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, currentTime);
            filter.frequency.exponentialRampToValueAtTime(400, currentTime + 0.1);
            filter.Q.value = 5;
            
            gain.gain.setValueAtTime(0.4, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
            
            noise.start(currentTime);
            noise.stop(currentTime + 0.15);
        };
    }
    
    createGameOverSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    }
    
    createMoveSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const currentTime = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, currentTime); // A4
            
            gain.gain.setValueAtTime(0.15, currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.08);
            
            osc.start(currentTime);
            osc.stop(currentTime + 0.08);
        };
    }
    
    createHighScoreSound() {
        if (!this.audioContext) return null;
        
        return () => {
            if (!this.soundEnabled) return;
            
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            let delay = 0;
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
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
        localStorage.setItem('snakeSoundEnabled', this.soundEnabled.toString());
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
                const isEnabled = this.toggleSound();
                this.updateSoundToggleButton();
            });
            
            // Initialize sound toggle button
            this.updateSoundToggleButton();
        }
        
        // Prevent scrolling with arrow keys
        window.addEventListener('keydown', (e) => {
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }
    
    setupMobileControls() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const mobileControls = document.getElementById('mobileControls');
        
        if (isMobile) {
            mobileControls.style.display = 'block';
        }
        
        // Mobile control buttons
        document.getElementById('upBtn').addEventListener('click', () => this.changeDirection(0, -1));
        document.getElementById('downBtn').addEventListener('click', () => this.changeDirection(0, 1));
        document.getElementById('leftBtn').addEventListener('click', () => this.changeDirection(-1, 0));
        document.getElementById('rightBtn').addEventListener('click', () => this.changeDirection(1, 0));
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Touch controls for canvas
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning) {
                this.startGame();
                return;
            }
            
            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.changeDirection(1, 0); // Right
                    } else {
                        this.changeDirection(-1, 0); // Left
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.changeDirection(0, 1); // Down
                    } else {
                        this.changeDirection(0, -1); // Up
                    }
                }
            }
        });
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        const code = e.code;
        
        switch (key) {
            case 'arrowup':
            case 'w':
                e.preventDefault();
                this.changeDirection(0, -1);
                break;
            case 'arrowdown':
            case 's':
                e.preventDefault();
                this.changeDirection(0, 1);
                break;
            case 'arrowleft':
            case 'a':
                e.preventDefault();
                this.changeDirection(-1, 0);
                break;
            case 'arrowright':
            case 'd':
                e.preventDefault();
                this.changeDirection(1, 0);
                break;
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
        
        // Also handle by keyCode for better compatibility
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                e.preventDefault();
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 'KeyS':
                e.preventDefault();
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'KeyA':
                e.preventDefault();
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                e.preventDefault();
                this.changeDirection(1, 0);
                break;
        }
    }
    
    changeDirection(newDx, newDy) {
        // Prevent reversing into itself
        if (this.dx === -newDx && this.dy === -newDy) {
            return;
        }
        
        // Don't change direction if paused
        if (this.gamePaused) {
            return;
        }
        
        // Play move sound only if direction actually changes
        if (this.dx !== newDx || this.dy !== newDy) {
            this.playSound('move');
        }
        
        this.dx = newDx;
        this.dy = newDy;
    }
    
    startGame() {
        console.log('Starting Snake Game...');
        
        // Reset game state for fresh start
        this.snake = [{ x: 10, y: 10 }];
        this.score = 0;
        this.gameSpeed = this.baseSpeed;
        this.dx = 1; // Start moving right
        this.dy = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Generate new food and update display
        this.generateFood();
        this.updateDisplay();
        
        this.hideOverlay();
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('⏸️ Game Paused', 'Press SPACE to resume');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = this.baseSpeed;
        this.generateFood();
        this.updateDisplay();
        this.draw();
        this.showOverlay('🐍 Snake Game', 'Press SPACE or tap Start to begin!');
    }
    
    generateFood() {
        let foodPosition;
        
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }
    
    update() {
        if (this.gamePaused || !this.gameRunning) return;
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.playSound('eat');
            this.generateFood();
            this.updateSpeed();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }
    
    updateSpeed() {
        // Increase speed every 50 points
        const speedIncrease = Math.floor(this.score / 50) * 10;
        this.gameSpeed = Math.max(80, this.baseSpeed - speedIncrease);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#16213e';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Body
                this.ctx.fillStyle = '#66BB6A';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Add eyes to head
            if (index === 0) {
                this.ctx.fillStyle = '#1a1a2e';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                // Determine eye position based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                if (this.dx === 1) { // Moving right
                    eyeX1 = segment.x * this.gridSize + this.gridSize - eyeOffset;
                    eyeY1 = segment.y * this.gridSize + eyeOffset;
                    eyeX2 = segment.x * this.gridSize + this.gridSize - eyeOffset;
                    eyeY2 = segment.y * this.gridSize + this.gridSize - eyeOffset;
                } else if (this.dx === -1) { // Moving left
                    eyeX1 = segment.x * this.gridSize + eyeOffset - eyeSize;
                    eyeY1 = segment.y * this.gridSize + eyeOffset;
                    eyeX2 = segment.x * this.gridSize + eyeOffset - eyeSize;
                    eyeY2 = segment.y * this.gridSize + this.gridSize - eyeOffset;
                } else if (this.dy === -1) { // Moving up
                    eyeX1 = segment.x * this.gridSize + eyeOffset;
                    eyeY1 = segment.y * this.gridSize + eyeOffset - eyeSize;
                    eyeX2 = segment.x * this.gridSize + this.gridSize - eyeOffset;
                    eyeY2 = segment.y * this.gridSize + eyeOffset - eyeSize;
                } else { // Moving down or stationary
                    eyeX1 = segment.x * this.gridSize + eyeOffset;
                    eyeY1 = segment.y * this.gridSize + this.gridSize - eyeOffset;
                    eyeX2 = segment.x * this.gridSize + this.gridSize - eyeOffset;
                    eyeY2 = segment.y * this.gridSize + this.gridSize - eyeOffset;
                }
                
                this.ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
                this.ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
            }
        });
        
        // Draw food
        this.ctx.fillStyle = '#F44336';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Add shine to food
        this.ctx.fillStyle = '#FF8A80';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 4,
            this.food.y * this.gridSize + 4,
            this.gridSize - 12,
            this.gridSize - 12
        );
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => {
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
            this.playSound('newHighScore');
            this.showOverlay('🏆 New High Score!', `Score: ${this.score} | Press SPACE or click Start to play again`);
        } else {
            this.playSound('gameOver');
            this.showOverlay('💀 Game Over!', `Score: ${this.score} | Press SPACE or click Start to play again`);
        }
        
        this.updateDisplay();
        
        // Reset game state for restart
        this.dx = 0;
        this.dy = 0;
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('length').textContent = this.snake.length;
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
    const game = new SnakeGame();
    
    // Make game globally accessible for debugging
    window.snakeGame = game;
});

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'snake';
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

// Prevent context menu on canvas
document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
