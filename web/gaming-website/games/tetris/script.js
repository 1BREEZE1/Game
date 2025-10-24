// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Game dimensions
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // milliseconds
        this.lastTime = 0;
        
        // Sound settings
        this.soundEnabled = true;
        
        // Initialize game
        this.initializeBoard();
        this.setupEventListeners();
        this.loadHighScore();
        this.updateDisplay();
        
        // Tetris pieces (tetrominoes)
        this.pieces = {
            'I': {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00f0f0'
            },
            'O': {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#f0f000'
            },
            'T': {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#a000f0'
            },
            'S': {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00f000'
            },
            'Z': {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#f00000'
            },
            'J': {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000f0'
            },
            'L': {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#f0a000'
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
    }
    
    initializeBoard() {
        this.board = [];
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                this.board[row][col] = 0;
            }
        }
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Button controls
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
        
        // Mobile controls
        document.getElementById('leftBtn').addEventListener('click', () => this.movePiece(-1, 0));
        document.getElementById('rightBtn').addEventListener('click', () => this.movePiece(1, 0));
        document.getElementById('downBtn').addEventListener('click', () => this.movePiece(0, 1));
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotatePiece());
        document.getElementById('hardDropBtn').addEventListener('click', () => this.hardDrop());
        document.getElementById('pauseMobileBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartMobileBtn').addEventListener('click', () => this.restartGame());
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) {
            if (e.code === 'Space' && !this.gameRunning) {
                this.startGame();
            } else if (e.key.toLowerCase() === 'p') {
                this.togglePause();
            } else if (e.key.toLowerCase() === 'r') {
                this.restartGame();
            }
            return;
        }
        
        switch (e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
            case 'KeyZ':
                this.rotatePiece();
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                this.restartGame();
                break;
            case 'KeyM':
                this.toggleSound();
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        
        this.initializeBoard();
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        
        this.hideOverlay();
        this.updateDisplay();
        this.gameLoop();
        
        this.playSound('start');
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.showOverlay('🎲 Tetris', 'Press SPACE or tap to start!');
        this.updateDisplay();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showOverlay('⏸️ Paused', 'Press P or tap to resume');
            document.getElementById('pauseButton').textContent = 'Resume';
        } else {
            this.hideOverlay();
            document.getElementById('pauseButton').textContent = 'Pause';
            this.gameLoop();
        }
    }
    
    createPiece() {
        const type = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
        const piece = {
            type: type,
            shape: JSON.parse(JSON.stringify(this.pieces[type].shape)), // Deep copy
            color: this.pieces[type].color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.pieces[type].shape[0].length / 2),
            y: 0
        };
        return piece;
    }
    
    movePiece(dx, dy) {
        if (!this.gameRunning || this.gamePaused || !this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.draw();
            return true;
        }
        return false;
    }
    
    rotatePiece() {
        if (!this.gameRunning || this.gamePaused || !this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
            this.draw();
            this.playSound('rotate');
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        if (!this.gameRunning || this.gamePaused || !this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            this.score += dropDistance * 2; // Bonus points for hard drop
            this.placePiece();
            this.playSound('drop');
        }
    }
    
    isValidPosition(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Check boundaries
                    if (newX < 0 || newX >= this.BOARD_WIDTH || newY >= this.BOARD_HEIGHT) {
                        return false;
                    }
                    
                    // Check collision with placed pieces
                    if (newY >= 0 && this.board[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        // Place the piece on the board
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Check for completed lines
        const linesCleared = this.clearLines();
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.playSound('line');
        }
        
        // Get next piece
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Check game over
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
            return;
        }
        
        this.playSound('place');
        this.updateDisplay();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.BOARD_HEIGHT - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                // Line is complete
                this.board.splice(row, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        return linesCleared;
    }
    
    updateScore(linesCleared) {
        const linePoints = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
        this.score += linePoints[linesCleared] * this.level;
        this.lines += linesCleared;
        
        // Level up every 10 lines
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.playSound('levelup');
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Save high score
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            this.saveHighScore(this.score);
            this.showOverlay('🏆 New High Score!', `Score: ${this.score.toLocaleString()}<br>Press SPACE to play again`);
            this.playSound('highscore');
        } else {
            this.showOverlay('💀 Game Over', `Score: ${this.score.toLocaleString()}<br>Press SPACE to play again`);
            this.playSound('gameover');
        }
        
        this.updateDisplay();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = 0;
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
        
        // Draw ghost piece (preview)
        if (this.currentPiece && this.gameRunning && !this.gamePaused) {
            this.drawGhostPiece();
        }
        
        // Draw next piece
        this.drawNextPiece();
    }
    
    drawBoard() {
        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        col * this.BLOCK_SIZE,
                        row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                    
                    // Draw border
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(
                        col * this.BLOCK_SIZE,
                        row * this.BLOCK_SIZE,
                        this.BLOCK_SIZE,
                        this.BLOCK_SIZE
                    );
                }
            }
        }
        
        // Draw grid lines
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.BOARD_WIDTH; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(i * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.BOARD_HEIGHT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, i * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawPiece(piece, context) {
        context.fillStyle = piece.color;
        
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const x = (piece.x + col) * this.BLOCK_SIZE;
                    const y = (piece.y + row) * this.BLOCK_SIZE;
                    
                    context.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    
                    // Draw border
                    context.strokeStyle = '#333';
                    context.lineWidth = 1;
                    context.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawGhostPiece() {
        if (!this.currentPiece) return;
        
        // Find the lowest valid position
        let ghostY = this.currentPiece.y;
        while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        
        // Draw ghost piece
        this.ctx.fillStyle = this.currentPiece.color + '40'; // Semi-transparent
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = (this.currentPiece.x + col) * this.BLOCK_SIZE;
                    const y = (ghostY + row) * this.BLOCK_SIZE;
                    
                    this.ctx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    
                    // Draw border
                    this.ctx.strokeStyle = this.currentPiece.color + '80';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawNextPiece() {
        // Clear next canvas
        this.nextCtx.fillStyle = '#fff';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = this.nextPiece.color;
        
        for (let row = 0; row < this.nextPiece.shape.length; row++) {
            for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                if (this.nextPiece.shape[row][col]) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    
                    this.nextCtx.fillRect(x, y, blockSize, blockSize);
                    
                    // Draw border
                    this.nextCtx.strokeStyle = '#333';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('highScore').textContent = this.getHighScore().toLocaleString();
    }
    
    showOverlay(title, message) {
        const overlay = document.getElementById('gameOverlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayMessage = document.getElementById('overlayMessage');
        
        overlayTitle.textContent = title;
        overlayMessage.innerHTML = message;
        overlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !this.soundEnabled);
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
            
            let frequency, duration;
            
            switch (type) {
                case 'move':
                    frequency = 200;
                    duration = 0.1;
                    break;
                case 'rotate':
                    frequency = 300;
                    duration = 0.1;
                    break;
                case 'drop':
                    frequency = 150;
                    duration = 0.2;
                    break;
                case 'place':
                    frequency = 250;
                    duration = 0.15;
                    break;
                case 'line':
                    frequency = 500;
                    duration = 0.3;
                    break;
                case 'levelup':
                    frequency = 600;
                    duration = 0.5;
                    break;
                case 'gameover':
                    frequency = 100;
                    duration = 1;
                    break;
                case 'highscore':
                    frequency = 800;
                    duration = 0.8;
                    break;
                case 'start':
                    frequency = 400;
                    duration = 0.3;
                    break;
            }
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound effect:', type);
        }
    }
    
    getHighScore() {
        return parseInt(localStorage.getItem('tetris-highscore') || '0');
    }
    
    saveHighScore(score) {
        localStorage.setItem('tetris-highscore', score.toString());
    }
    
    loadHighScore() {
        const highScore = this.getHighScore();
        document.getElementById('highScore').textContent = highScore.toLocaleString();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
    
    // Make game globally accessible for debugging
    window.tetrisGame = game;
    
    // Initial draw
    game.draw();
    
    // Show mobile controls on touch devices
    if ('ontouchstart' in window) {
        document.getElementById('mobileControls').style.display = 'block';
    }
});

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'tetris';
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

// Prevent scrolling on mobile when using arrow keys
document.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('mobile-btn')) {
        e.preventDefault();
    }
});

document.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('mobile-btn')) {
        e.preventDefault();
    }
});
