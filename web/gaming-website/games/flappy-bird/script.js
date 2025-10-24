// Flappy Bird Game - Lucy Games
class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('flappyBirdBest')) || 0;
        this.gamesPlayed = parseInt(localStorage.getItem('flappyBirdGames')) || 0;
        
        // Game settings
        this.gravity = 0.4;
        this.jumpForce = -8;
        this.pipeSpeed = 1.5;
        this.pipeGap = 180;
        this.pipeWidth = 60;
        
        // Bird properties
        this.bird = {
            x: 100,
            y: 200,
            width: 30,
            height: 25,
            velocity: 0,
            rotation: 0
        };
        
        // Pipes array
        this.pipes = [];
        this.pipeTimer = 0;
        this.pipeInterval = 150; // frames between pipes
        
        // Background elements
        this.clouds = [];
        this.ground = { x: 0, speed: 1 };
        
        // Sound settings
        this.soundEnabled = true;
        
        // Animation frame
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateClouds();
        this.updateUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            } else if (e.code === 'KeyR') {
                this.restart();
            } else if (e.code === 'KeyM') {
                this.toggleSound();
            }
        });
        
        // Mouse/touch controls
        this.canvas.addEventListener('click', () => this.handleInput());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });
        
        // Mobile controls
        const mobileFlap = document.getElementById('mobileFlap');
        if (mobileFlap) {
            mobileFlap.addEventListener('click', () => this.handleInput());
            mobileFlap.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleInput();
            });
        }
        
        // UI buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }
    
    handleInput() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'playing') {
            this.flap();
        } else if (this.gameState === 'gameOver') {
            this.restart();
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.bird.y = 200;
        this.bird.velocity = 0;
        this.pipes = [];
        this.pipeTimer = 0;
        
        // Hide start screen, show instructions
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('instructions').style.display = 'block';
        document.getElementById('scoreHUD').style.display = 'block';
        
        this.updateUI();
        this.playSound('start');
    }
    
    flap() {
        if (this.gameState === 'playing') {
            this.bird.velocity = this.jumpForce;
            this.bird.rotation = -20;
            this.playSound('flap');
            
            // Add flapping animation class
            this.canvas.classList.add('flapping');
            setTimeout(() => this.canvas.classList.remove('flapping'), 300);
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update bird physics
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Update bird rotation based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 2, -30), 90);
        
        // Generate pipes
        this.pipeTimer++;
        if (this.pipeTimer >= this.pipeInterval) {
            this.generatePipe();
            this.pipeTimer = 0;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check for scoring
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                this.updateScore();
                this.playSound('score');
            }
            
            // Remove off-screen pipes
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Update background elements
        this.updateBackground();
        
        // Check collisions
        this.checkCollisions();
        
        // Check boundaries
        if (this.bird.y > this.canvas.height - 50 || this.bird.y < 0) {
            this.gameOver();
        }
    }
    
    generatePipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight - 50;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }
    
    generateClouds() {
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 200 + 50,
                size: Math.random() * 30 + 20,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    updateBackground() {
        // Update ground
        this.ground.x -= this.ground.speed;
        if (this.ground.x <= -50) {
            this.ground.x = 0;
        }
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.canvas.width + cloud.size;
                cloud.y = Math.random() * 200 + 50;
            }
        });
    }
    
    checkCollisions() {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        for (const pipe of this.pipes) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + this.pipeWidth;
            
            // Check if bird is in pipe's x range
            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                // Check collision with top pipe
                if (birdTop < pipe.topHeight) {
                    this.gameOver();
                    return;
                }
                // Check collision with bottom pipe
                if (birdBottom > pipe.bottomY) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.gamesPlayed++;
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('flappyBirdBest', this.bestScore.toString());
        }
        
        localStorage.setItem('flappyBirdGames', this.gamesPlayed.toString());
        
        // Hide instructions, show game over screen
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
        
        this.updateUI();
        this.playSound('gameOver');
    }
    
    restart() {
        this.gameState = 'start';
        this.score = 0;
        this.bird.y = 200;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.pipeTimer = 0;
        
        // Reset UI
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('scoreHUD').style.display = 'none';
        
        this.updateUI();
    }
    
    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
        
        // Add score animation
        const scoreElement = document.getElementById('currentScore');
        scoreElement.classList.add('score-animate');
        setTimeout(() => scoreElement.classList.remove('score-animate'), 300);
    }
    
    updateUI() {
        document.getElementById('statScore').textContent = this.score;
        document.getElementById('statBest').textContent = this.bestScore;
        document.getElementById('gamesPlayed').textContent = this.gamesPlayed;
        document.getElementById('currentScore').textContent = this.score;
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            let frequency, duration;
            
            switch (type) {
                case 'flap':
                    frequency = 400;
                    duration = 0.1;
                    break;
                case 'score':
                    frequency = 800;
                    duration = 0.2;
                    break;
                case 'gameOver':
                    frequency = 200;
                    duration = 0.5;
                    break;
                case 'start':
                    frequency = 600;
                    duration = 0.3;
                    break;
                default:
                    return;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound effect:', type);
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw pipes (only when playing)
        if (this.gameState === 'playing') {
            this.drawPipes();
        }
        
        // Draw ground
        this.drawGround();
        
        // Always draw bird (visible in all states)
        this.drawBird();
        
        // Draw effects
        if (this.gameState === 'playing') {
            this.drawParticles();
        }
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        this.ctx.strokeStyle = '#006400';
        this.ctx.lineWidth = 3;
        
        this.pipes.forEach(pipe => {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Top pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 30, this.pipeWidth + 10, 30);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            
            // Bottom pipe cap
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
            this.ctx.strokeRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 30);
        });
    }
    
    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Ground pattern
        this.ctx.fillStyle = '#A0522D';
        for (let x = this.ground.x; x < this.canvas.width + 20; x += 20) {
            this.ctx.fillRect(x, this.canvas.height - 45, 15, 5);
            this.ctx.fillRect(x + 5, this.canvas.height - 35, 10, 5);
        }
    }
    
    drawBird() {
        this.ctx.save();
        
        // Move to bird center for rotation
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        
        // Only rotate when playing
        if (this.gameState === 'playing') {
            this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        } else {
            // Gentle floating animation when not playing
            const floatOffset = Math.sin(Date.now() * 0.003) * 3;
            this.ctx.translate(0, floatOffset);
        }
        
        // Bird body (yellow circle)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Bird wing
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, -2, 8, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.width / 2 - 5, -2);
        this.ctx.lineTo(this.bird.width / 2 + 5, 0);
        this.ctx.lineTo(this.bird.width / 2 - 5, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(3, -5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(4, -5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawParticles() {
        // Simple particle effect behind bird
        if (this.bird.velocity < 0) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            for (let i = 0; i < 3; i++) {
                const x = this.bird.x - 10 - i * 5;
                const y = this.bird.y + this.bird.height / 2 + (Math.random() - 0.5) * 10;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new FlappyBirdGame();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.gameState === 'playing') {
        // Pause game when tab is not visible
        game.gameState = 'start';
        game.restart();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        // Adjust canvas size for mobile
        const canvas = game.canvas;
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        
        if (window.innerWidth <= 768) {
            canvas.style.width = Math.min(containerWidth, 350) + 'px';
            canvas.style.height = 'auto';
        } else {
            canvas.style.width = '';
            canvas.style.height = '';
        }
    }
});

// Prevent scrolling on mobile when touching the game
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('#gameCanvas')) {
        e.preventDefault();
    }
}, { passive: false });

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'flappy-bird';
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

// Add keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    // Show controls hint on first keypress
    if (e.code === 'Space' && !localStorage.getItem('flappyBirdControlsShown')) {
        localStorage.setItem('flappyBirdControlsShown', 'true');
    }
});
