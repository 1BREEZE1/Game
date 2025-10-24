class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    createSounds() {
        this.sounds = {
            move: () => this.createTone(200, 0.1, 'sine'),
            merge: () => this.createTone(400, 0.2, 'square'),
            newTile: () => this.createTone(300, 0.1, 'triangle'),
            win: () => this.createMelody([523, 659, 784, 1047], 0.3),
            gameOver: () => this.createTone(150, 0.5, 'sawtooth'),
            achievement: () => this.createMelody([440, 554, 659, 880], 0.2)
        };
    }

    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || !this.enabled) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createMelody(frequencies, noteDuration) {
        if (!this.audioContext || !this.enabled) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, noteDuration, 'sine');
            }, index * noteDuration * 200);
        });
    }

    play(soundName) {
        if (this.sounds[soundName] && this.enabled) {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.sounds[soundName]();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

class AchievementManager {
    constructor() {
        this.achievements = {
            firstWin: { name: "First Victory", description: "Reach 2048 for the first time", unlocked: false },
            speedster: { name: "Speedster", description: "Reach 2048 in under 5 minutes", unlocked: false },
            bigTile: { name: "Big Numbers", description: "Create a 4096 tile", unlocked: false },
            efficient: { name: "Efficient Player", description: "Reach 2048 in under 200 moves", unlocked: false },
            persistent: { name: "Persistent", description: "Play 10 games", unlocked: false },
            master: { name: "Master Player", description: "Reach 8192 tile", unlocked: false },
            gridMaster: { name: "Grid Master", description: "Win on both 4x4 and 5x5 grids", unlocked: false }
        };
        this.loadAchievements();
        this.stats = this.loadStats();
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements2048');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            Object.keys(savedAchievements).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = savedAchievements[key].unlocked;
                }
            });
        }
    }

    loadStats() {
        const saved = localStorage.getItem('gameStats2048');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            totalMoves: 0,
            bestTime: null,
            wins4x4: 0,
            wins5x5: 0,
            highestTile: 0
        };
    }

    saveAchievements() {
        localStorage.setItem('achievements2048', JSON.stringify(this.achievements));
    }

    saveStats() {
        localStorage.setItem('gameStats2048', JSON.stringify(this.stats));
    }

    checkAchievements(gameData) {
        const newUnlocks = [];

        // First Win
        if (gameData.won && !this.achievements.firstWin.unlocked) {
            this.achievements.firstWin.unlocked = true;
            newUnlocks.push('firstWin');
        }

        // Speed achievement
        if (gameData.won && gameData.time < 300000 && !this.achievements.speedster.unlocked) {
            this.achievements.speedster.unlocked = true;
            newUnlocks.push('speedster');
        }

        // Big tile achievements
        if (gameData.highestTile >= 4096 && !this.achievements.bigTile.unlocked) {
            this.achievements.bigTile.unlocked = true;
            newUnlocks.push('bigTile');
        }

        if (gameData.highestTile >= 8192 && !this.achievements.master.unlocked) {
            this.achievements.master.unlocked = true;
            newUnlocks.push('master');
        }

        // Efficient player
        if (gameData.won && gameData.moves < 200 && !this.achievements.efficient.unlocked) {
            this.achievements.efficient.unlocked = true;
            newUnlocks.push('efficient');
        }

        // Update stats
        this.stats.gamesPlayed++;
        this.stats.totalMoves += gameData.moves;
        if (gameData.highestTile > this.stats.highestTile) {
            this.stats.highestTile = gameData.highestTile;
        }
        if (gameData.won) {
            if (gameData.gridSize === 4) this.stats.wins4x4++;
            if (gameData.gridSize === 5) this.stats.wins5x5++;
        }
        if (!this.stats.bestTime || (gameData.won && gameData.time < this.stats.bestTime)) {
            this.stats.bestTime = gameData.time;
        }

        // Persistent player
        if (this.stats.gamesPlayed >= 10 && !this.achievements.persistent.unlocked) {
            this.achievements.persistent.unlocked = true;
            newUnlocks.push('persistent');
        }

        // Grid master
        if (this.stats.wins4x4 > 0 && this.stats.wins5x5 > 0 && !this.achievements.gridMaster.unlocked) {
            this.achievements.gridMaster.unlocked = true;
            newUnlocks.push('gridMaster');
        }

        this.saveAchievements();
        this.saveStats();
        return newUnlocks;
    }

    showAchievement(achievementKey) {
        const achievement = this.achievements[achievementKey];
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 4000);
    }
}

class LeaderboardManager {
    constructor() {
        this.scores = this.loadScores();
    }

    loadScores() {
        const saved = localStorage.getItem('leaderboard2048');
        return saved ? JSON.parse(saved) : {
            '4x4': [],
            '5x5': []
        };
    }

    saveScores() {
        localStorage.setItem('leaderboard2048', JSON.stringify(this.scores));
    }

    addScore(gridSize, score, moves, time) {
        const gridKey = `${gridSize}x${gridSize}`;
        const entry = {
            score: score,
            moves: moves,
            time: time,
            date: new Date().toLocaleDateString()
        };

        this.scores[gridKey].push(entry);
        this.scores[gridKey].sort((a, b) => b.score - a.score);
        this.scores[gridKey] = this.scores[gridKey].slice(0, 10); // Keep top 10
        this.saveScores();
    }

    getTopScores(gridSize) {
        const gridKey = `${gridSize}x${gridSize}`;
        return this.scores[gridKey] || [];
    }
}

class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.best = localStorage.getItem('best2048') || 0;
        this.size = 4;
        this.soundManager = new SoundManager();
        this.achievementManager = new AchievementManager();
        this.leaderboardManager = new LeaderboardManager();
        this.init();
        this.setupEventListeners();
        this.setupUI();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.updateScore();
        this.updateBest();
        this.updateMoves();
        this.updateGridSize();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ([37, 38, 39, 40].includes(e.keyCode)) {
                e.preventDefault();
                const direction = [38, 39, 40, 37].indexOf(e.keyCode);
                this.move(direction);
            }
        });

        // Touch events for mobile
        let startX, startY;
        const container = document.querySelector('.game-container');
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        container.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) this.move(3); // Left
                else if (diffX < -30) this.move(1); // Right
            } else {
                if (diffY > 30) this.move(0); // Up
                else if (diffY < -30) this.move(2); // Down
            }
            
            startX = startY = null;
        });
    }

    setupUI() {
        this.setupModeButtons();
        this.updateModeButtons();
        this.updateSoundButton();
    }

    updateSoundButton() {
        const soundButton = document.querySelector('.sound-toggle');
        if (soundButton) {
            soundButton.innerHTML = this.soundManager.isEnabled() ? '🔊' : '🔇';
        }
    }

    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const size = parseInt(btn.dataset.size);
                this.setGridSize(size);
            });
        });
    }

    setGridSize(size) {
        if (this.size !== size) {
            this.size = size;
            this.updateModeButtons();
            this.restart();
        } else {
            // Just update button states if size hasn't changed
            this.updateModeButtons();
        }
    }

    updateModeButtons() {
        const buttons = document.querySelectorAll('.mode-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            const btnSize = parseInt(btn.dataset.size);
            if (btnSize === this.size) {
                btn.classList.add('active');
            }
        });
    }

    updateGridSize() {
        const gridContainer = document.querySelector('.grid-container');
        
        // Clear existing grid
        gridContainer.innerHTML = '';
        
        // Calculate cell size based on grid size
        const cellSize = this.size === 4 ? 70 : 56;
        const gap = 10;
        const padding = 10;
        const containerSize = (cellSize * this.size) + (gap * (this.size - 1)) + (padding * 2);
        
        // Update grid container size
        gridContainer.style.width = `${containerSize}px`;
        gridContainer.style.height = `${containerSize}px`;
        
        // Create grid cells with proper spacing
        for (let i = 0; i < this.size; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            row.style.marginBottom = i === this.size - 1 ? '0' : `${gap}px`;
            
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.marginRight = j === this.size - 1 ? '0' : `${gap}px`;
                row.appendChild(cell);
            }
            gridContainer.appendChild(row);
        }
        
        // Create and add tile container
        const tileContainer = document.createElement('div');
        tileContainer.className = 'tile-container';
        const tileContainerSize = (cellSize * this.size) + (gap * (this.size - 1));
        tileContainer.style.width = `${tileContainerSize}px`;
        tileContainer.style.height = `${tileContainerSize}px`;
        gridContainer.appendChild(tileContainer);
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            this.soundManager.play('newTile');
        }
    }

    move(direction) {
        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;
        let merged = false;

        switch (direction) {
            case 0: // Up
                const upResult = this.moveUp();
                moved = upResult.moved;
                merged = upResult.merged;
                break;
            case 1: // Right
                const rightResult = this.moveRight();
                moved = rightResult.moved;
                merged = rightResult.merged;
                break;
            case 2: // Down
                const downResult = this.moveDown();
                moved = downResult.moved;
                merged = downResult.merged;
                break;
            case 3: // Left
                const leftResult = this.moveLeft();
                moved = leftResult.moved;
                merged = leftResult.merged;
                break;
        }

        if (moved) {
            this.moves++;
            this.updateMoves();

            if (merged) {
                this.soundManager.play('merge');
            } else {
                this.soundManager.play('move');
            }

            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
            
            if (this.isGameWon()) {
                this.soundManager.play('win');
                this.handleGameEnd(true);
            } else if (this.isGameOver()) {
                this.soundManager.play('gameOver');
                this.handleGameEnd(false);
            }
        }
    }

    handleGameEnd(won) {
        const gameTime = Date.now() - this.startTime;
        const highestTile = this.getHighestTile();
        
        const gameData = {
            won: won,
            score: this.score,
            moves: this.moves,
            time: gameTime,
            gridSize: this.size,
            highestTile: highestTile
        };

        // Check achievements
        const newAchievements = this.achievementManager.checkAchievements(gameData);
        
        // Add to leaderboard if score is good enough
        if (this.score > 0) {
            this.leaderboardManager.addScore(this.size, this.score, this.moves, gameTime);
        }

        // Show achievements
        newAchievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.soundManager.play('achievement');
                this.achievementManager.showAchievement(achievement);
            }, index * 1000);
        });

        // Show game end message
        setTimeout(() => {
            this.showMessage(won ? 'You Win!' : 'Game Over!', won ? 'game-won' : 'game-over');
        }, newAchievements.length * 1000);
    }

    getHighestTile() {
        let highest = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] > highest) {
                    highest = this.grid[i][j];
                }
            }
        }
        return highest;
    }

    moveLeft() {
        let moved = false;
        let merged = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    merged = true;
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return { moved, merged };
    }

    moveRight() {
        let moved = false;
        let merged = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                    merged = true;
                }
            }
            while (row.length < this.size) {
                row.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== row[j]) {
                    moved = true;
                }
                this.grid[i][j] = row[j];
            }
        }
        return { moved, merged };
    }

    moveUp() {
        let moved = false;
        let merged = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    merged = true;
                }
            }
            
            while (column.length < this.size) {
                column.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return { moved, merged };
    }

    moveDown() {
        let moved = false;
        let merged = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    i--;
                    merged = true;
                }
            }
            
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        return { moved, merged };
    }

    updateDisplay() {
        const container = document.querySelector('.tile-container');
        container.innerHTML = '';
        
        const cellSize = this.size === 4 ? 70 : 56;
        const gap = 10;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.grid[i][j]}`;
                    tile.textContent = this.grid[i][j];
                    
                    tile.style.left = `${j * (cellSize + gap)}px`;
                    tile.style.top = `${i * (cellSize + gap)}px`;
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.lineHeight = `${cellSize}px`;
                    
                    let fontSize = this.size === 4 ? '35px' : '25px';
                    if (this.grid[i][j] >= 1000) {
                        fontSize = this.size === 4 ? '25px' : '20px';
                    }
                    tile.style.fontSize = fontSize;
                    
                    container.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        // Update both old and new score elements
        const scoreElement = document.getElementById('score');
        const currentScoreElement = document.getElementById('currentScore');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (currentScoreElement) currentScoreElement.textContent = this.score;
        
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', this.best);
            this.updateBest();
        }
    }

    updateBest() {
        // Update both old and new best score elements
        const bestElement = document.getElementById('best');
        const bestScoreElement = document.getElementById('bestScore');
        
        if (bestElement) bestElement.textContent = this.best;
        if (bestScoreElement) bestScoreElement.textContent = this.best;
    }

    updateMoves() {
        // Update both old and new moves elements
        const movesElement = document.getElementById('moves');
        const moveCountElement = document.getElementById('moveCount');
        
        if (movesElement) movesElement.textContent = this.moves;
        if (moveCountElement) moveCountElement.textContent = this.moves;
    }

    isGameWon() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    showMessage(text, className) {
        const messageElement = document.querySelector('.game-message');
        const messageText = messageElement.querySelector('p');
        messageText.textContent = text;
        messageElement.className = `game-message ${className}`;
        messageElement.style.display = 'flex';
    }

    hideMessage() {
        const messageElement = document.querySelector('.game-message');
        messageElement.style.display = 'none';
    }


    restart() {
        this.hideMessage();
        this.init();
    }
}

// Fullscreen functionality
function toggleFullscreen() {
    const gameSection = document.querySelector('.game-section');
    const moreGamesSection = document.querySelector('.more-games-section');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    
    if (gameSection.classList.contains('fullscreen')) {
        // Exit fullscreen
        gameSection.classList.remove('fullscreen');
        moreGamesSection.style.display = 'block';
        fullscreenBtn.innerHTML = '⛶';
        fullscreenBtn.title = 'Enter Fullscreen';
    } else {
        // Enter fullscreen
        gameSection.classList.add('fullscreen');
        moreGamesSection.style.display = 'none';
        fullscreenBtn.innerHTML = '⛷';
        fullscreenBtn.title = 'Exit Fullscreen';
    }
}

// Simple functions for header buttons
function toggleSound() {
    if (game && game.soundManager) {
        const enabled = game.soundManager.toggle();
        game.updateSoundButton();
    }
}

function showAchievements() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🏆 Achievements</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="achievements-list">
                ${Object.entries(game.achievementManager.achievements).map(([key, achievement]) => `
                    <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.unlocked ? '🏆' : '🔒'}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-description">${achievement.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="stats-section">
                <h3>📊 Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${game.achievementManager.stats.gamesPlayed}</div>
                        <div class="stat-label">Games Played</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${game.achievementManager.stats.wins4x4}</div>
                        <div class="stat-label">4x4 Wins</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${game.achievementManager.stats.wins5x5}</div>
                        <div class="stat-label">5x5 Wins</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${game.achievementManager.stats.highestTile}</div>
                        <div class="stat-label">Highest Tile</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

function showLeaderboard() {
    const scores4x4 = game.leaderboardManager.getTopScores(4);
    const scores5x5 = game.leaderboardManager.getTopScores(5);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📊 Leaderboard</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="leaderboard-tabs">
                <button class="tab-btn active" data-tab="4x4">4x4 Grid</button>
                <button class="tab-btn" data-tab="5x5">5x5 Grid</button>
            </div>
            <div class="leaderboard-content">
                <div class="tab-content active" id="tab-4x4">
                    ${renderScoreTable(scores4x4)}
                </div>
                <div class="tab-content" id="tab-5x5">
                    ${renderScoreTable(scores5x5)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tab switching
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        };
    });
    
    modal.querySelector('.close-modal').onclick = () => {
        document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

function renderScoreTable(scores) {
    if (scores.length === 0) {
        return '<div class="no-scores">No scores yet! Play some games to see your best scores here.</div>';
    }
    
    return `
        <table class="scores-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Score</th>
                    <th>Moves</th>
                    <th>Time</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${scores.map((score, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${score.score.toLocaleString()}</td>
                        <td>${score.moves}</td>
                        <td>${formatTime(score.time)}</td>
                        <td>${score.date}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Shuffle function for recommended games
function shuffleRecommendedGames() {
    const currentGameId = window.RecommendedGames ? window.RecommendedGames.getCurrentGameId() : '2048';
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

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game2048();
});
