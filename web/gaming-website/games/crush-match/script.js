class CrushMatchGame {
    constructor() {
        this.board = [];
        this.boardSize = 8;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.colorEmojis = {
            red: '🔴',
            blue: '🔵', 
            green: '🟢',
            yellow: '🟡',
            purple: '🟣',
            orange: '🟠',
            bomb: '💣',
            colorClear: '⭐'
        };
        
        this.score = 0;
        this.matches = 0;
        this.level = 1;
        this.soundEnabled = true;
        this.gameRunning = false;
        this.levelThresholds = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 26000, 36000, 50000];
        
        this.selectedTile = null;
        this.bestScore = parseInt(localStorage.getItem('crushMatchBest')) || 0;
        this.highestLevel = parseInt(localStorage.getItem('crushMatchHighestLevel')) || 1;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateStats();
    }
    
    setupEventListeners() {
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.pauseGame();
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.matches = 0;
        this.level = 1;
        this.selectedTile = null;
        
        document.getElementById('startScreen').classList.add('hidden');
        
        this.createBoard();
        this.updateStats();
        this.playStartSound();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        this.board = [];
        
        // Initialize board with random colors
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                let color;
                do {
                    color = this.colors[Math.floor(Math.random() * this.colors.length)];
                } while (this.wouldCreateMatch(row, col, color));
                
                this.board[row][col] = color;
                
                const tile = document.createElement('div');
                tile.className = `tile ${color}`;
                tile.textContent = this.colorEmojis[color];
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                if (this.isPowerUp(color)) {
                    tile.addEventListener('click', () => this.activatePowerUp(row, col));
                } else {
                    tile.addEventListener('click', () => this.handleTileClick(row, col));
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    wouldCreateMatch(row, col, color) {
        // Check horizontal
        let horizontalCount = 1;
        if (col > 0 && this.board[row][col-1] === color) horizontalCount++;
        if (col > 1 && this.board[row][col-2] === color) horizontalCount++;
        
        // Check vertical
        let verticalCount = 1;
        if (row > 0 && this.board[row-1][col] === color) verticalCount++;
        if (row > 1 && this.board[row-2][col] === color) verticalCount++;
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }
    
    handleTileClick(row, col) {
        if (!this.gameRunning) return;
        
        const clickedTile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (this.selectedTile === null) {
            // Select first tile
            this.selectedTile = { row, col };
            clickedTile.classList.add('selected');
            this.playClickSound();
        } else if (this.selectedTile.row === row && this.selectedTile.col === col) {
            // Deselect same tile
            clickedTile.classList.remove('selected');
            this.selectedTile = null;
            this.playClickSound();
        } else if (this.isAdjacent(this.selectedTile, { row, col })) {
            // Swap adjacent tiles
            this.swapTiles(this.selectedTile, { row, col });
        } else {
            // Select different tile
            document.querySelector('.tile.selected').classList.remove('selected');
            this.selectedTile = { row, col };
            clickedTile.classList.add('selected');
            this.playClickSound();
        }
    }
    
    isAdjacent(tile1, tile2) {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    swapTiles(tile1, tile2) {
        // Swap in board array
        const temp = this.board[tile1.row][tile1.col];
        this.board[tile1.row][tile1.col] = this.board[tile2.row][tile2.col];
        this.board[tile2.row][tile2.col] = temp;
        
        // Update visual
        this.updateBoardDisplay();
        
        // Check for matches
        const matchResult = this.findMatches();
        if (matchResult.matches.length > 0) {
            this.processMatches(matchResult.matches, matchResult.matchGroups);
            this.playMatchSound();
        } else {
            // No matches, swap back
            setTimeout(() => {
                const temp = this.board[tile1.row][tile1.col];
                this.board[tile1.row][tile1.col] = this.board[tile2.row][tile2.col];
                this.board[tile2.row][tile2.col] = temp;
                this.updateBoardDisplay();
            }, 300);
        }
        
        // Clear selection
        document.querySelectorAll('.tile.selected').forEach(tile => {
            tile.classList.remove('selected');
        });
        this.selectedTile = null;
    }
    
    findMatches() {
        const matches = [];
        const matchGroups = [];
        
        // Check horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            let count = 1;
            let currentColor = this.board[row][0];
            
            for (let col = 1; col < this.boardSize; col++) {
                if (this.board[row][col] === currentColor && !this.isPowerUp(currentColor)) {
                    count++;
                } else {
                    if (count >= 3 && !this.isPowerUp(currentColor)) {
                        const group = [];
                        for (let i = col - count; i < col; i++) {
                            matches.push({ row, col: i });
                            group.push({ row, col: i });
                        }
                        matchGroups.push({ tiles: group, count, color: currentColor });
                    }
                    count = 1;
                    currentColor = this.board[row][col];
                }
            }
            
            if (count >= 3 && !this.isPowerUp(currentColor)) {
                const group = [];
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    matches.push({ row, col: i });
                    group.push({ row, col: i });
                }
                matchGroups.push({ tiles: group, count, color: currentColor });
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < this.boardSize; col++) {
            let count = 1;
            let currentColor = this.board[0][col];
            
            for (let row = 1; row < this.boardSize; row++) {
                if (this.board[row][col] === currentColor && !this.isPowerUp(currentColor)) {
                    count++;
                } else {
                    if (count >= 3 && !this.isPowerUp(currentColor)) {
                        const group = [];
                        for (let i = row - count; i < row; i++) {
                            if (!matches.find(m => m.row === i && m.col === col)) {
                                matches.push({ row: i, col });
                                group.push({ row: i, col });
                            }
                        }
                        if (group.length > 0) {
                            matchGroups.push({ tiles: group, count, color: currentColor });
                        }
                    }
                    count = 1;
                    currentColor = this.board[row][col];
                }
            }
            
            if (count >= 3 && !this.isPowerUp(currentColor)) {
                const group = [];
                for (let i = this.boardSize - count; i < this.boardSize; i++) {
                    if (!matches.find(m => m.row === i && m.col === col)) {
                        matches.push({ row: i, col });
                        group.push({ row: i, col });
                    }
                }
                if (group.length > 0) {
                    matchGroups.push({ tiles: group, count, color: currentColor });
                }
            }
        }
        
        return { matches, matchGroups };
    }
    
    isPowerUp(color) {
        return color === 'bomb' || color === 'colorClear';
    }
    
    activatePowerUp(row, col) {
        if (!this.gameRunning) return;
        
        const powerType = this.board[row][col];
        
        if (powerType === 'bomb') {
            this.activateBomb(row, col);
        } else if (powerType === 'colorClear') {
            this.activateColorClear(row, col);
        }
    }
    
    activateBomb(row, col) {
        // Prevent infinite loops by checking if bomb still exists
        if (this.board[row][col] !== 'bomb') return;
        
        const bombMatches = [];
        const chainBombs = [];
        
        // Immediately clear the bomb to prevent re-triggering
        this.board[row][col] = null;
        
        // Clear 3x3 area around bomb
        for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize - 1, col + 1); c++) {
                // Check for chain reaction bombs before clearing
                if (this.board[r][c] === 'bomb' && !(r === row && c === col)) {
                    chainBombs.push({ row: r, col: c });
                }
                
                bombMatches.push({ row: r, col: c });
            }
        }
        
        // Clear the explosion area
        bombMatches.forEach(match => {
            this.board[match.row][match.col] = null;
        });
        
        // Update visual immediately
        this.dropTiles();
        this.fillGaps();
        this.updateBoardDisplay();
        this.updateStats();
        
        // Update score
        this.score += bombMatches.length * 5;
        this.checkLevelUp();
        
        this.playMatchSound();
        
        // Trigger chain reactions after a delay
        if (chainBombs.length > 0) {
            setTimeout(() => {
                chainBombs.forEach(bomb => {
                    this.activateBomb(bomb.row, bomb.col);
                });
            }, 400);
        } else {
            // Check for new matches after explosion
            setTimeout(() => {
                const matchResult = this.findMatches();
                if (matchResult.matches.length > 0) {
                    this.playMatchSound();
                    this.processMatches(matchResult.matches, matchResult.matchGroups);
                } else {
                    this.checkGameOver();
                }
            }, 300);
        }
    }
    
    activateColorClear(row, col) {
        // Prevent infinite loops by checking if star still exists
        if (this.board[row][col] !== 'colorClear') return;
        
        const colorMatches = [];
        const targetColor = this.lastColorClear || 'red';
        
        // Immediately clear the star to prevent re-triggering
        this.board[row][col] = null;
        
        // Clear all tiles of the target color
        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                if (this.board[r][c] === targetColor) {
                    colorMatches.push({ row: r, col: c });
                    this.board[r][c] = null;
                }
            }
        }
        
        // Also add the star position to matches for scoring
        colorMatches.push({ row, col });
        
        // Update visual immediately
        this.dropTiles();
        this.fillGaps();
        this.updateBoardDisplay();
        this.updateStats();
        
        // Update score (higher points for color clear)
        this.score += colorMatches.length * 15;
        this.checkLevelUp();
        
        this.playMatchSound();
        
        // Check for new matches after color clear
        setTimeout(() => {
            const matchResult = this.findMatches();
            if (matchResult.matches.length > 0) {
                this.playMatchSound();
                this.processMatches(matchResult.matches, matchResult.matchGroups);
            } else {
                this.checkGameOver();
            }
        }, 300);
    }
    
    processMatches(matches, matchGroups = []) {
        // Add visual effect
        matches.forEach(match => {
            const tile = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            tile.classList.add('matching');
        });
        
        setTimeout(() => {
            // Remove matched tiles
            matches.forEach(match => {
                const tile = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
                tile.classList.add('removing');
            });
            
            setTimeout(() => {
                // Create power-ups for 4+ matches
                matchGroups.forEach(group => {
                    if (group.count >= 5) {
                        // 5+ match: Color clear star
                        const centerTile = group.tiles[Math.floor(group.tiles.length / 2)];
                        this.board[centerTile.row][centerTile.col] = 'colorClear';
                        this.lastColorClear = group.color;
                    } else if (group.count >= 4) {
                        // 4 match: Bomb
                        const centerTile = group.tiles[Math.floor(group.tiles.length / 2)];
                        this.board[centerTile.row][centerTile.col] = 'bomb';
                    }
                });
                
                // Clear matched positions (except power-ups)
                matches.forEach(match => {
                    if (this.board[match.row][match.col] !== 'bomb' && this.board[match.row][match.col] !== 'colorClear') {
                        this.board[match.row][match.col] = null;
                    }
                });
                
                // Update score
                this.score += matches.length * 10 * this.level;
                this.matches++;
                this.checkLevelUp();
                
                // Drop tiles and fill gaps
                this.dropTiles();
                this.fillGaps();
                this.updateBoardDisplay();
                this.updateStats();
                
                // Check for more matches
                setTimeout(() => {
                    const matchResult = this.findMatches();
                    if (matchResult.matches.length > 0) {
                        this.playMatchSound();
                        this.processMatches(matchResult.matches, matchResult.matchGroups);
                    } else {
                        this.checkGameOver();
                    }
                }, 300);
                
            }, 300);
        }, 500);
    }
    
    dropTiles() {
        for (let col = 0; col < this.boardSize; col++) {
            let writePos = this.boardSize - 1;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    this.board[writePos][col] = this.board[row][col];
                    if (writePos !== row) {
                        this.board[row][col] = null;
                    }
                    writePos--;
                }
            }
        }
    }
    
    fillGaps() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = this.colors[Math.floor(Math.random() * this.colors.length)];
                }
            }
        }
    }
    
    updateBoardDisplay() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const color = this.board[row][col];
                
                tile.className = `tile ${color}`;
                tile.textContent = this.colorEmojis[color];
                
                // Update event listeners
                const newTile = tile.cloneNode(true);
                if (this.isPowerUp(color)) {
                    newTile.addEventListener('click', () => this.activatePowerUp(row, col));
                } else {
                    newTile.addEventListener('click', () => this.handleTileClick(row, col));
                }
                tile.parentNode.replaceChild(newTile, tile);
            }
        }
    }
    
    checkGameOver() {
        // Check if any power-ups exist (always playable)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isPowerUp(this.board[row][col])) {
                    return; // Power-up available, game continues
                }
            }
        }
        
        // Check if any moves are possible
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Skip power-ups in simulation
                if (this.isPowerUp(this.board[row][col])) continue;
                
                // Check right swap
                if (col < this.boardSize - 1 && !this.isPowerUp(this.board[row][col + 1])) {
                    this.simulateSwap(row, col, row, col + 1);
                    const matchResult = this.findMatches();
                    if (matchResult.matches.length > 0) {
                        this.undoSimulateSwap(row, col, row, col + 1);
                        return; // Move possible
                    }
                    this.undoSimulateSwap(row, col, row, col + 1);
                }
                
                // Check down swap
                if (row < this.boardSize - 1 && !this.isPowerUp(this.board[row + 1][col])) {
                    this.simulateSwap(row, col, row + 1, col);
                    const matchResult = this.findMatches();
                    if (matchResult.matches.length > 0) {
                        this.undoSimulateSwap(row, col, row + 1, col);
                        return; // Move possible
                    }
                    this.undoSimulateSwap(row, col, row + 1, col);
                }
            }
        }
        
        // No moves possible
        this.gameOver();
    }
    
    simulateSwap(row1, col1, row2, col2) {
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
    }
    
    undoSimulateSwap(row1, col1, row2, col2) {
        this.simulateSwap(row1, col1, row2, col2); // Same operation undoes it
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('crushMatchBest', this.bestScore);
        }
        
        if (this.level > this.highestLevel) {
            this.highestLevel = this.level;
            localStorage.setItem('crushMatchHighestLevel', this.highestLevel);
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('bestScore').textContent = this.bestScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        this.playGameOverSound();
    }
    
    updateStats() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('levelDisplay').textContent = this.level;
        document.getElementById('soundToggle').textContent = this.soundEnabled ? '🔊' : '🔇';
        
        // Update next level progress
        const nextLevel = this.level + 1;
        const nextThreshold = this.levelThresholds[nextLevel - 1];
        if (nextThreshold) {
            const needed = nextThreshold - this.score;
            document.getElementById('nextLevelProgress').textContent = needed > 0 ? needed : 'MAX';
        } else {
            document.getElementById('nextLevelProgress').textContent = 'MAX';
        }
        
        // Update highest stats
        document.getElementById('highestLevel').textContent = Math.max(this.level, this.highestLevel);
        document.getElementById('highestScore').textContent = Math.max(this.score, this.bestScore);
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateStats();
        if (this.soundEnabled) {
            this.playClickSound();
        }
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        this.gameRunning = !this.gameRunning;
    }
    
    checkLevelUp() {
        const newLevel = this.calculateLevel();
        if (newLevel > this.level) {
            this.level = newLevel;
            if (this.level > this.highestLevel) {
                this.highestLevel = this.level;
                localStorage.setItem('crushMatchHighestLevel', this.highestLevel);
            }
            this.showLevelUpMessage();
            this.playLevelUpSound();
        }
    }
    
    calculateLevel() {
        for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
            if (this.score >= this.levelThresholds[i]) {
                return i + 1;
            }
        }
        return 1;
    }
    
    showLevelUpMessage() {
        const message = document.createElement('div');
        message.textContent = `🎉 Level ${this.level}! 🎉`;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #667eea, #764ba2);
            color: white;
            padding: 20px 40px;
            border-radius: 25px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            animation: levelUp 2s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
    
    playLevelUpSound() {
        if (!this.soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            [523, 659, 784, 988, 1175].forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                
                gainNode.gain.setValueAtTime(0.06, audioContext.currentTime + i * 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.5);
                
                oscillator.start(audioContext.currentTime + i * 0.1);
                oscillator.stop(audioContext.currentTime + i * 0.1 + 0.5);
            });
        } catch (e) {}
    }
    
    playClickSound() {
        this.playBubbleSound();
    }
    
    playMatchSound() {
        this.playBellSound();
    }
    
    playGameOverSound() {
        this.playWooshSound();
    }
    
    playStartSound() {
        this.playChimeSound();
    }
    
    playBubbleSound() {
        if (!this.soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.02);
            
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.06);
        } catch (e) {}
    }
    
    playBellSound() {
        if (!this.soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            [1000, 1200, 1500].forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime + i * 0.05);
                oscillator.stop(audioContext.currentTime + i * 0.05 + 0.3);
            });
        } catch (e) {}
    }
    
    playWooshSound() {
        if (!this.soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {}
    }
    
    playChimeSound() {
        if (!this.soundEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            [523, 659, 784].forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
                
                gainNode.gain.setValueAtTime(0.04, audioContext.currentTime + i * 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.1 + 0.4);
                
                oscillator.start(audioContext.currentTime + i * 0.1);
                oscillator.stop(audioContext.currentTime + i * 0.1 + 0.4);
            });
        } catch (e) {}
    }
}

// Global functions
function startGame() {
    window.crushGame.startGame();
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    window.crushGame.startGame();
}

function goToMenu() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    window.crushGame.gameRunning = false;
}

// Shuffle recommended games function
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : 'puzzle-match';
    
    if (window.RecommendedGames) {
        window.RecommendedGames.render(currentGameId);
        
        // Add visual feedback to shuffle button
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
    window.crushGame = new CrushMatchGame();
});
