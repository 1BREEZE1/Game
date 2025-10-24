// Bubble Shooter Game
class BubbleShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.score = 0;
        this.level = 1;
        this.soundEnabled = true;
        
        // Game settings
        this.bubbleRadius = 15;
        this.bubbleColors = ['#FF3030', '#4900e6ff', '#0099FF', '#00FF66', '#FFD700', '#FF69B4', '#00FFFF'];
        this.rows = 8;
        this.cols = 15;
        this.shooterY = this.canvas.height - 50;
        
        // Progressive difficulty settings
        this.dropSpeed = 0.1; // Speed at which bubbles move down
        this.dropTimer = 0;
        this.dropInterval = 300; // Frames between drops (5 seconds at 60fps)
        this.gameOverLine = this.canvas.height - 120; // Game over boundary
        
        // Game objects
        this.bubbles = [];
        this.shooter = {
            x: this.canvas.width / 2,
            y: this.shooterY,
            angle: 0,
            currentBubble: null,
            nextBubble: null
        };
        this.projectile = null;
        this.particles = [];
        
        // Input handling
        this.mouseX = 0;
        this.mouseY = 0;
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadHighScore();
        this.updateUI();
        this.generateBubbles();
        this.shooter.currentBubble = this.createRandomBubble();
        this.shooter.nextBubble = this.createRandomBubble();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Start button
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touch events
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // UI buttons
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restartGame());
    }
    
    generateBubbles() {
        this.bubbles = [];
        const startRows = Math.min(5 + this.level, this.rows);
        
        for (let row = 0; row < startRows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Skip some bubbles randomly to create gaps
                if (Math.random() < 0.15) continue;
                
                const x = col * (this.bubbleRadius * 2) + (row % 2) * this.bubbleRadius + this.bubbleRadius;
                const y = row * (this.bubbleRadius * 1.7) + this.bubbleRadius;
                
                if (x < this.canvas.width - this.bubbleRadius) {
                    this.bubbles.push({
                        x: x,
                        y: y,
                        color: this.bubbleColors[Math.floor(Math.random() * this.bubbleColors.length)],
                        row: row,
                        col: col
                    });
                }
            }
        }
    }
    
    createRandomBubble() {
        // Get colors that exist in the current bubble field
        const existingColors = [...new Set(this.bubbles.map(b => b.color))];
        const availableColors = existingColors.length > 0 ? existingColors : this.bubbleColors;
        
        return {
            color: availableColors[Math.floor(Math.random() * availableColors.length)],
            x: this.shooter.x,
            y: this.shooter.y
        };
    }
    
    startGame() {
        // If coming from game over, restart the game first
        if (this.gameState === 'gameOver') {
            this.restartGame();
            return;
        }
        
        this.gameState = 'playing';
        this.overlay.style.display = 'none';
        this.canvas.style.cursor = 'crosshair';
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.updateShooterAngle();
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mouseX = touch.clientX - rect.left;
        this.mouseY = touch.clientY - rect.top;
        this.updateShooterAngle();
    }
    
    handleClick(e) {
        if (this.gameState === 'playing' && !this.projectile) {
            this.shoot();
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (this.gameState === 'playing' && !this.projectile) {
            this.shoot();
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (this.gameState === 'menu') {
                    this.startGame();
                } else {
                    this.togglePause();
                }
                break;
            case 'KeyR':
                this.restartGame();
                break;
            case 'KeyM':
                this.toggleSound();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    updateShooterAngle() {
        if (this.gameState !== 'playing') return;
        
        const dx = this.mouseX - this.shooter.x;
        const dy = this.mouseY - this.shooter.y;
        this.shooter.angle = Math.atan2(dy, dx);
        
        // Limit angle to prevent shooting backwards
        const minAngle = -Math.PI * 0.8;
        const maxAngle = -Math.PI * 0.2;
        this.shooter.angle = Math.max(minAngle, Math.min(maxAngle, this.shooter.angle));
    }
    
    shoot() {
        if (!this.shooter.currentBubble) return;
        
        const speed = 8;
        this.projectile = {
            x: this.shooter.x,
            y: this.shooter.y,
            vx: Math.cos(this.shooter.angle) * speed,
            vy: Math.sin(this.shooter.angle) * speed,
            color: this.shooter.currentBubble.color,
            radius: this.bubbleRadius
        };
        
        // Move to next bubble
        this.shooter.currentBubble = this.shooter.nextBubble;
        this.shooter.nextBubble = this.createRandomBubble();
        
        this.playSound('shoot');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updateProjectile();
        this.updateParticles();
        this.updateBubbleMovement();
        this.checkLoseCondition();
    }
    
    updateProjectile() {
        if (!this.projectile) return;
        
        // Move projectile
        this.projectile.x += this.projectile.vx;
        this.projectile.y += this.projectile.vy;
        
        // Wall bouncing
        if (this.projectile.x <= this.projectile.radius || 
            this.projectile.x >= this.canvas.width - this.projectile.radius) {
            this.projectile.vx *= -1;
            this.projectile.x = Math.max(this.projectile.radius, 
                Math.min(this.canvas.width - this.projectile.radius, this.projectile.x));
        }
        
        // Check collision with top of canvas
        if (this.projectile.y <= this.projectile.radius) {
            this.handleTopCollision();
            return;
        }
        
        // Check collision with bubbles
        for (let bubble of this.bubbles) {
            if (this.checkCollision(this.projectile, bubble)) {
                this.handleBubbleCollision(bubble);
                return;
            }
        }
        
        // Remove projectile if it goes off screen
        if (this.projectile.y < -this.projectile.radius) {
            this.projectile = null;
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateBubbleMovement() {
        this.dropTimer++;
        
        // Move bubbles down gradually
        if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0;
            
            // Move all bubbles down
            for (let bubble of this.bubbles) {
                bubble.y += this.bubbleRadius * 1.7; // Move down by one row height
            }
            
            // Increase drop speed slightly each time (progressive difficulty)
            this.dropInterval = Math.max(180, this.dropInterval - 2); // Minimum 3 seconds
        }
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.bubbleRadius * 2;
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    findSnapPosition(projectile, hitBubble) {
        // Calculate direction from hit bubble to projectile
        const dx = projectile.x - hitBubble.x;
        const dy = projectile.y - hitBubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        // Place new bubble exactly 2 radii away from hit bubble (touching)
        const snapDistance = this.bubbleRadius * 2;
        let snapX = hitBubble.x + normalizedDx * snapDistance;
        let snapY = hitBubble.y + normalizedDy * snapDistance;
        
        // Ensure within bounds
        snapX = Math.max(this.bubbleRadius, Math.min(this.canvas.width - this.bubbleRadius, snapX));
        snapY = Math.max(this.bubbleRadius, snapY);
        
        return { x: snapX, y: snapY };
    }
    
    handleBubbleCollision(hitBubble) {
        // Find the best position to snap the bubble to the grid
        const snapPosition = this.findSnapPosition(this.projectile, hitBubble);
        
        const newBubble = {
            x: snapPosition.x,
            y: snapPosition.y,
            color: this.projectile.color
        };
        
        this.bubbles.push(newBubble);
        
        // Check for matches
        const matches = this.findMatches(newBubble);
        if (matches.length >= 3) {
            this.removeBubbles(matches);
            this.dropFloatingBubbles();
            this.addScore(matches.length * 10);
            this.playSound('pop');
        } else {
            this.playSound('stick');
        }
        
        this.projectile = null;
        this.updateUI();
        this.checkWinCondition();
    }
    
    handleTopCollision() {
        // Snap to grid position at the top
        const gridX = Math.round(this.projectile.x / (this.bubbleRadius * 2)) * (this.bubbleRadius * 2) + this.bubbleRadius;
        
        const newBubble = {
            x: Math.max(this.bubbleRadius, Math.min(this.canvas.width - this.bubbleRadius, gridX)),
            y: this.bubbleRadius,
            color: this.projectile.color
        };
        
        this.bubbles.push(newBubble);
        
        // Check for matches
        const matches = this.findMatches(newBubble);
        if (matches.length >= 3) {
            this.removeBubbles(matches);
            this.dropFloatingBubbles();
            this.addScore(matches.length * 10);
            this.playSound('pop');
        } else {
            this.playSound('stick');
        }
        
        this.projectile = null;
        this.updateUI();
        this.checkWinCondition();
    }
    
    findMatches(targetBubble) {
        const matches = [];
        const visited = new Set();
        const queue = [targetBubble];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (visited.has(current)) continue;
            visited.add(current);
            matches.push(current);
            
            // Find adjacent bubbles of the same color - bubbles are touching when distance = 2 * radius
            for (let bubble of this.bubbles) {
                if (!visited.has(bubble) && 
                    bubble.color === targetBubble.color && 
                    this.getDistance(current, bubble) <= this.bubbleRadius * 2.1) {
                    queue.push(bubble);
                }
            }
        }
        
        return matches;
    }
    
    removeBubbles(bubblesToRemove) {
        for (let bubble of bubblesToRemove) {
            const index = this.bubbles.indexOf(bubble);
            if (index > -1) {
                this.bubbles.splice(index, 1);
                this.createParticles(bubble.x, bubble.y, bubble.color);
            }
        }
    }
    
    dropFloatingBubbles() {
        if (this.bubbles.length === 0) return; // Don't process if no bubbles left
        
        const connected = new Set();
        const queue = [];
        
        // Find the topmost bubbles (those closest to the ceiling)
        let minY = Math.min(...this.bubbles.map(b => b.y));
        
        // Find all bubbles in the topmost row(s) - these are connected to the ceiling
        for (let bubble of this.bubbles) {
            if (bubble.y <= minY + this.bubbleRadius * 0.5) { // Allow small tolerance for floating point precision
                queue.push(bubble);
                connected.add(bubble);
            }
        }
        
        // Use breadth-first search to find all connected bubbles
        while (queue.length > 0) {
            const current = queue.shift();
            
            for (let bubble of this.bubbles) {
                if (!connected.has(bubble) && 
                    this.getDistance(current, bubble) <= this.bubbleRadius * 2.1) {
                    connected.add(bubble);
                    queue.push(bubble);
                }
            }
        }
        
        // Remove floating bubbles
        const floating = this.bubbles.filter(bubble => !connected.has(bubble));
        if (floating.length > 0) {
            for (let bubble of floating) {
                this.createParticles(bubble.x, bubble.y, bubble.color);
                this.addScore(5); // Bonus points for floating bubbles
            }
            
            // Remove floating bubbles from the array
            this.bubbles = this.bubbles.filter(bubble => connected.has(bubble));
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: color,
                life: 30
            });
        }
    }
    
    checkWinCondition() {
        // Only check win condition if we're in playing state and have no projectile
        if (this.gameState !== 'playing' || this.projectile) {
            return;
        }
        
        // Check if there are any bubbles left in the game
        if (this.bubbles.length === 0) {
            this.levelComplete();
        }
    }
    
    checkLoseCondition() {
        // Check if any bubble has crossed the game over line
        for (let bubble of this.bubbles) {
            if (bubble.y + this.bubbleRadius >= this.gameOverLine) {
                this.gameOver();
                return;
            }
        }
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        this.level++;
        this.addScore(100 * this.level);
        this.showOverlay('Level Complete!', `Level ${this.level - 1} completed! Starting level ${this.level}...`);
        
        setTimeout(() => {
            this.generateBubbles();
            this.startGame();
        }, 2000);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.saveHighScore();
        this.showOverlay('Game Over!', `Final Score: ${this.score}`);
        this.canvas.style.cursor = 'default';
    }
    
    showOverlay(title, message) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        this.overlay.style.display = 'flex';
        
        if (this.gameState === 'gameOver') {
            this.startButton.textContent = 'Play Again';
            this.startButton.style.display = 'block';
            this.startButton.disabled = false;
        }
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.gameState = 'playing';
        this.projectile = null;
        this.particles = [];
        
        // Reset progressive difficulty
        this.dropSpeed = 0.1;
        this.dropTimer = 0;
        this.dropInterval = 300;
        
        this.generateBubbles();
        this.shooter.currentBubble = this.createRandomBubble();
        this.shooter.nextBubble = this.createRandomBubble();
        this.updateUI();
        
        // Hide overlay and start playing immediately
        this.overlay.style.display = 'none';
        this.canvas.style.cursor = 'crosshair';
        this.startButton.textContent = 'Start Game';
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('Paused', 'Press SPACE to resume');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.overlay.style.display = 'none';
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !this.soundEnabled);
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('bubblesLeft').textContent = this.bubbles.length;
        document.getElementById('highScore').textContent = this.getHighScore();
    }
    
    saveHighScore() {
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            localStorage.setItem('bubbleShooterHighScore', this.score.toString());
        }
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('bubbleShooterHighScore');
        return saved ? parseInt(saved) : 0;
    }
    
    getHighScore() {
        return this.loadHighScore();
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'shoot':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                    break;
                case 'pop':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
                    break;
                case 'stick':
                    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.3, '#7BB3F0');
        gradient.addColorStop(0.7, '#A8D8FF');
        gradient.addColorStop(1, '#E8F4FD');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add cute background elements
        this.drawCuteBackground();
        
        // Draw bubbles
        for (let bubble of this.bubbles) {
            this.drawBubble(bubble.x, bubble.y, bubble.color);
        }
        
        // Draw aiming line
        if (this.gameState === 'playing' && !this.projectile) {
            this.drawAimingLine();
        }
        
        // Draw projectile
        if (this.projectile) {
            this.drawBubble(this.projectile.x, this.projectile.y, this.projectile.color);
        }
        
        // Draw shooter
        this.drawShooter();
        
        // Draw particles
        for (let particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        }
        this.ctx.globalAlpha = 1;
        
        // Draw game over line
        this.drawGameOverLine();
        
        // Draw next bubble preview
        this.drawNextBubble();
    }
    
    drawBubble(x, y, color) {
        // Bubble shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(x + 2, y + 2, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Main bubble
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bubble highlight
        const gradient = this.ctx.createRadialGradient(x - 5, y - 5, 0, x, y, this.bubbleRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bubble border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bubbleRadius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawAimingLine() {
        const length = 100;
        const endX = this.shooter.x + Math.cos(this.shooter.angle) * length;
        const endY = this.shooter.y + Math.sin(this.shooter.angle) * length;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.shooter.x, this.shooter.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawShooter() {
        // Shooter base
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.shooter.x - 20, this.shooter.y + 10, 40, 20);
        
        // Current bubble
        if (this.shooter.currentBubble) {
            this.drawBubble(this.shooter.x, this.shooter.y, this.shooter.currentBubble.color);
        }
    }
    
    drawGameOverLine() {
        // Draw dotted line to show game over boundary
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 8]);
        this.ctx.globalAlpha = 0.6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.gameOverLine);
        this.ctx.lineTo(this.canvas.width, this.gameOverLine);
        this.ctx.stroke();
        
        // Reset line dash and alpha
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }
    
    drawNextBubble() {
        if (this.shooter.nextBubble) {
            const x = this.canvas.width - 40;
            const y = this.canvas.height - 40;
            
            // Background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(x - 25, y - 25, 50, 50);
            
            // Next bubble
            this.drawBubble(x, y, this.shooter.nextBubble.color);
            
            // Label
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Next', x, y + 35);
        }
    }
    
    drawCuteBackground() {
        // Draw floating bubbles in background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 8; i++) {
            const x = (i * 60) + 30;
            const y = 100 + Math.sin(Date.now() * 0.001 + i) * 20;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw cute fish
        this.drawCuteFish(80, 200 + Math.sin(Date.now() * 0.002) * 15, '🐠');
        this.drawCuteFish(320, 150 + Math.sin(Date.now() * 0.0015 + 1) * 10, '🐟');
        this.drawCuteFish(200, 300 + Math.sin(Date.now() * 0.0018 + 2) * 12, '🐡');
        
        // Draw seaweed
        this.drawSeaweed(50, this.canvas.height - 100);
        this.drawSeaweed(350, this.canvas.height - 80);
        
        // Draw cute octopus
        this.drawCuteOctopus(300, 400 + Math.sin(Date.now() * 0.001) * 8);
        
        // Draw starfish
        this.drawStarfish(100, this.canvas.height - 50);
        this.drawStarfish(280, this.canvas.height - 60);
        
        // Draw floating hearts occasionally
        if (Math.random() < 0.01) {
            this.drawFloatingHeart(Math.random() * this.canvas.width, this.canvas.height);
        }
    }
    
    drawCuteFish(x, y, emoji) {
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        
        // Add a subtle glow effect
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        
        this.ctx.fillText(emoji, x, y);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawSeaweed(x, y) {
        this.ctx.strokeStyle = '#2E8B57';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        const sway = Math.sin(Date.now() * 0.003) * 10;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.quadraticCurveTo(x + sway, y - 30, x + sway * 0.5, y - 60);
        this.ctx.quadraticCurveTo(x - sway, y - 90, x + sway, y - 120);
        this.ctx.stroke();
        
        // Add small leaves
        this.ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 3; i++) {
            const leafY = y - 40 - (i * 30);
            const leafX = x + Math.sin(Date.now() * 0.003 + i) * 8;
            this.ctx.beginPath();
            this.ctx.ellipse(leafX, leafY, 8, 4, Math.PI / 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawCuteOctopus(x, y) {
        // Octopus head
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 5, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 8, y - 5, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x - 8, y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 8, y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tentacles
        this.ctx.strokeStyle = '#FF69B4';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) - Math.PI / 4;
            const tentacleX = x + Math.cos(angle) * 15;
            const tentacleY = y + Math.sin(angle) * 10 + 15;
            const wave = Math.sin(Date.now() * 0.005 + i) * 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(tentacleX, tentacleY);
            this.ctx.quadraticCurveTo(tentacleX + wave, tentacleY + 20, tentacleX + wave * 0.5, tentacleY + 35);
            this.ctx.stroke();
        }
    }
    
    drawStarfish(x, y) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const outerRadius = 15;
            const innerRadius = 7;
            
            const outerX = x + Math.cos(angle) * outerRadius;
            const outerY = y + Math.sin(angle) * outerRadius;
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = x + Math.cos(innerAngle) * innerRadius;
            const innerY = y + Math.sin(innerAngle) * innerRadius;
            
            if (i === 0) {
                this.ctx.moveTo(outerX, outerY);
            } else {
                this.ctx.lineTo(outerX, outerY);
            }
            this.ctx.lineTo(innerX, innerY);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawFloatingHeart(x, y) {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💖', x, y - 50);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'bubble-shooter';
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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BubbleShooter();
});
