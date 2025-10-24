// Shared Recommended Games System for Lucy Games
// This file manages the recommended games section in individual game pages

// Games Database - Easy to add new games
const allGames = [
    {
        id: '2048',
        name: '2048 Puzzle',
        description: 'The classic sliding puzzle game with modern features. Combine tiles to reach 2048 and beyond!',
        emoji: '🧩',
        path: '../2048/index.html',
        category: 'puzzle',
        active: true,
        preview: {
            type: 'grid',
            content: `
                <div class="preview-grid">
                    <div class="preview-tile tile-2">2</div>
                    <div class="preview-tile tile-4">4</div>
                    <div class="preview-tile tile-8">8</div>
                    <div class="preview-tile tile-16">16</div>
                </div>
            `
        }
    },
    {
        id: 'snake',
        name: 'Snake Game',
        description: 'The classic arcade game! Control the snake, eat food, and grow longer without hitting walls or yourself.',
        emoji: '🐍',
        path: '../snake/index.html',
        category: 'arcade',
        active: true,
        preview: {
            type: 'snake',
            content: `
                <div class="snake-preview">
                    <div class="snake-head"></div>
                    <div class="snake-body"></div>
                    <div class="snake-body"></div>
                    <div class="snake-food"></div>
                </div>
            `
        }
    },
    {
        id: 'dressing',
        name: 'Princess Dress Up',
        description: 'Create the perfect look! Mix and match outfits, hairstyles, and accessories to dress up your princess.',
        emoji: '👗',
        path: '../dressing/index.html',
        category: 'dress-up',
        active: true,
        preview: {
            type: 'dressing',
            content: `
                <div class="dressing-preview">
                    <div class="princess-mini">👸🏻</div>
                </div>
            `
        }
    },
    {
        id: 'flappy-bird',
        name: 'Flappy Bird',
        description: 'Tap to fly! Navigate through pipes and see how far you can go. Don\'t hit the ground or pipes!',
        emoji: '🐦',
        path: '../flappy-bird/index.html',
        category: 'arcade',
        active: true,
        preview: {
            type: 'flappy',
            content: `
                <div class="flappy-preview">
                    <div class="flappy-bird">🐦</div>
                    <div class="flappy-pipe-top"></div>
                    <div class="flappy-pipe-bottom"></div>
                    <div class="flappy-clouds">☁️</div>
                </div>
            `
        }
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'The classic block-stacking puzzle game! Stack falling blocks to clear lines and score points.',
        emoji: '🎲',
        path: '../tetris/index.html',
        category: 'puzzle',
        active: true,
        preview: {
            type: 'tetris',
            content: `
                <div class="tetris-preview">
                    <div class="t-piece"></div>
                    <div class="l-piece"></div>
                </div>
            `
        }
    },
    {
        id: 'memory-match',
        name: 'Memory Match',
        description: 'Test your memory! Flip cards to find matching pairs. Challenge yourself with different difficulty levels.',
        emoji: '🧠',
        path: '../memory-match/index.html',
        category: 'puzzle',
        active: true,
        preview: {
            type: 'memory',
            content: `
                <div class="memory-preview">
                    <div class="memory-card-mini flipped">🐶</div>
                    <div class="memory-card-mini">?</div>
                    <div class="memory-card-mini flipped">🐱</div>
                    <div class="memory-card-mini">?</div>
                </div>
            `
        }
    },
    {
        id: 'puzzle-match',
        name: 'Puzzle Match',
        description: 'Match colorful tiles in this addictive puzzle game! Clear lines and score points!',
        emoji: '🧩',
        path: '../puzzle-match/index.html',
        category: 'puzzle',
        active: true,
        preview: {
            type: 'puzzle',
            content: `
                <div class="puzzle-preview">
                    <div class="puzzle-tile puzzle-red">🔴</div>
                    <div class="puzzle-tile puzzle-blue">🔵</div>
                    <div class="puzzle-tile puzzle-green">🟢</div>
                    <div class="puzzle-tile puzzle-bomb">💣</div>
                    <div class="puzzle-tile puzzle-star">⭐</div>
                    <div class="puzzle-tile puzzle-red">🔴</div>
                </div>
            `
        }
    },
    {
        id: 'bubble-shooter',
        name: 'Bubble Shooter',
        description: 'Aim and shoot bubbles to match 3 or more of the same color. Clear all bubbles to advance to the next level!',
        emoji: '🫧',
        path: '../bubble-shooter/index.html',
        category: 'puzzle',
        active: true,
        preview: {
            type: 'bubble',
            content: `
                <div class="bubble-preview">
                    <div class="bubble-mini bubble-red"></div>
                    <div class="bubble-mini bubble-blue"></div>
                    <div class="bubble-mini bubble-green"></div>
                    <div class="bubble-mini bubble-yellow"></div>
                    <div class="bubble-shooter-mini"></div>
                </div>
            `
        }
    },
    {
        id: 'cake-decorator',
        name: 'Cake Decorator',
        description: 'Design and decorate beautiful cakes! Choose flavors, frostings, and decorations to create your perfect cake!',
        emoji: '🍰',
        path: '../cake-decorator/index.html',
        category: 'creative',
        active: true,
        preview: {
            type: 'cake',
            content: `
                <div class="cake-preview">
                    <div class="cake-emoji">🍰</div>
                </div>
            `
        }
    }
];

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to get recommended games (excluding current game)
function getRecommendedGames(currentGameId, count = 3) {
    const activeGames = allGames.filter(game => game.active && game.id !== currentGameId);
    const shuffled = shuffleArray(activeGames);
    return shuffled.slice(0, count);
}

// Function to create recommended game card HTML
function createRecommendedCard(game) {
    return `
        <a href="${game.path}" class="recommended-card">
            <div class="recommended-image">
                <div class="game-preview ${game.preview.type}-preview">
                    ${game.preview.content}
                </div>
                <div class="game-overlay">
                    <div class="play-icon">▶</div>
                </div>
            </div>
            <div class="recommended-info">
                <h4>${game.emoji} ${game.name}</h4>
                <p>${game.description}</p>
                <div class="game-category">${game.category}</div>
                <span class="play-link">Play Now →</span>
            </div>
        </a>
    `;
}

// Function to render recommended games
function renderRecommendedGames(currentGameId) {
    const recommendedContainer = document.querySelector('.recommended-grid');
    if (!recommendedContainer) return;
    
    const recommendedGames = getRecommendedGames(currentGameId, 3);
    const recommendedHTML = recommendedGames.map(game => createRecommendedCard(game)).join('');
    
    recommendedContainer.innerHTML = recommendedHTML;
    
    // Add enhanced styling if not already added
    addRecommendedGamesStyles();
}

// Function to add enhanced CSS styles for recommended games
function addRecommendedGamesStyles() {
    // Check if styles already added
    if (document.getElementById('recommended-games-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'recommended-games-styles';
    style.textContent = `
        /* Enhanced Recommended Games Styles */
        .recommended-games {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .recommended-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .recommended-games h3 {
            color: #667eea;
            font-size: 2rem;
            margin: 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        
        .shuffle-button {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
        }
        
        .shuffle-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .recommended-games p {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .recommended-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .recommended-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            text-decoration: none;
            color: inherit;
            display: block;
            position: relative;
        }
        
        .recommended-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .recommended-image {
            height: 180px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .game-overlay {
            display: none;
        }
        
        .play-icon {
            display: none;
        }
        
        .recommended-info {
            padding: 1.5rem;
        }
        
        .recommended-info h4 {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: bold;
        }
        
        .recommended-info p {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1rem;
            text-align: left;
        }
        
        .game-category {
            display: inline-block;
            background: #f8f9fa;
            color: #667eea;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: capitalize;
            margin-bottom: 1rem;
        }
        
        .play-link {
            color: #667eea;
            font-weight: bold;
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
        }
        
        .recommended-card:hover .play-link {
            color: #764ba2;
            transform: translateX(5px);
        }
        
        .back-to-home {
            text-align: center;
            margin-top: 2rem;
        }
        
        .home-button {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
        }
        
        .home-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        /* Enhanced Game Previews */
        .game-preview {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1rem;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        /* 2048 Game Preview */
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
            width: 100px;
            height: 100px;
        }

        .preview-tile {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.9rem;
        }

        .tile-2 { background: #eee4da; color: #776e65; }
        .tile-4 { background: #ede0c8; color: #776e65; }
        .tile-8 { background: #f2b179; color: #f9f6f2; }
        .tile-16 { background: #f59563; color: #f9f6f2; }

        /* Snake Game Preview */
        .snake-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: #1a1a2e;
            border-radius: 8px;
            overflow: hidden;
        }

        .snake-head {
            position: absolute;
            width: 15px;
            height: 15px;
            background: #4CAF50;
            border-radius: 2px;
            top: 30px;
            left: 30px;
        }

        .snake-body {
            position: absolute;
            width: 15px;
            height: 15px;
            background: #66BB6A;
            border-radius: 2px;
        }

        .snake-body:nth-child(2) {
            top: 30px;
            left: 15px;
        }

        .snake-body:nth-child(3) {
            top: 30px;
            left: 0px;
        }

        .snake-food {
            position: absolute;
            width: 12px;
            height: 12px;
            background: #F44336;
            border-radius: 2px;
            top: 60px;
            right: 20px;
            animation: snakeFoodPulse 2s infinite;
        }

        @keyframes snakeFoodPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }

        /* Princess Dress Up Game Preview */
        .dressing-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff69b4, #ffc0cb);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .princess-mini {
            font-size: 3rem;
            animation: princessSparkle 2s ease-in-out infinite;
        }

        @keyframes princessSparkle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        /* Tetris Game Preview */
        .tetris-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 2px;
        }

        .tetris-preview::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 20px;
            width: 8px;
            height: 32px;
            background: #00f0f0;
            border-radius: 1px;
            border: 0.5px solid #333;
        }

        .tetris-preview::after {
            content: '';
            position: absolute;
            top: 25px;
            right: 15px;
            width: 16px;
            height: 16px;
            background: #f0f000;
            border-radius: 1px;
            border: 0.5px solid #333;
        }

        .tetris-preview .t-piece {
            position: absolute;
            top: 50px;
            left: 25px;
        }

        .tetris-preview .t-piece::before {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: #a000f0;
            border-radius: 1px;
            border: 0.5px solid #333;
            top: 0;
            left: 8px;
        }

        .tetris-preview .t-piece::after {
            content: '';
            position: absolute;
            width: 24px;
            height: 8px;
            background: #a000f0;
            border-radius: 1px;
            border: 0.5px solid #333;
            top: 8px;
            left: 0;
        }

        .tetris-preview .l-piece {
            position: absolute;
            top: 55px;
            right: 25px;
        }

        .tetris-preview .l-piece::before {
            content: '';
            position: absolute;
            width: 8px;
            height: 24px;
            background: #f0a000;
            border-radius: 1px;
            border: 0.5px solid #333;
            top: 0;
            left: 0;
        }

        .tetris-preview .l-piece::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 8px;
            background: #f0a000;
            border-radius: 1px;
            border: 0.5px solid #333;
            top: 16px;
            left: 8px;
        }

        /* Memory Match Game Preview */
        .memory-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            padding: 10px;
        }

        .memory-card-mini {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            color: white;
            font-weight: bold;
            transition: all 0.3s ease;
            animation: memoryCardFloat 3s ease-in-out infinite;
        }

        .memory-card-mini.flipped {
            background: linear-gradient(135deg, #ffeaa7, #fab1a0);
            color: #333;
            animation: memoryCardFlip 2s ease-in-out infinite;
        }

        .memory-card-mini:nth-child(1) {
            animation-delay: 0s;
        }

        .memory-card-mini:nth-child(2) {
            animation-delay: 0.5s;
        }

        .memory-card-mini:nth-child(3) {
            animation-delay: 1s;
        }

        .memory-card-mini:nth-child(4) {
            animation-delay: 1.5s;
        }

        @keyframes memoryCardFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-2px) scale(1.05); }
        }

        @keyframes memoryCardFlip {
            0%, 100% { transform: rotateY(0deg); }
            25% { transform: rotateY(90deg); }
            75% { transform: rotateY(90deg); }
        }

        /* Bubble Shooter Game Preview */
        .bubble-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 5px;
            overflow: hidden;
        }

        .bubble-mini {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.8);
            position: relative;
            animation: bubbleFloat 3s ease-in-out infinite;
        }

        .bubble-mini::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 6px;
            height: 6px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
        }

        .bubble-red {
            background: #FF3030;
            animation-delay: 0s;
        }

        .bubble-blue {
            background: #00E6CC;
            animation-delay: 0.5s;
        }

        .bubble-green {
            background: #00FF66;
            animation-delay: 1s;
        }

        .bubble-yellow {
            background: #FFD700;
            animation-delay: 1.5s;
        }

        .bubble-shooter-mini {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 20px;
            height: 8px;
            background: #333;
            border-radius: 4px;
        }

        .bubble-shooter-mini::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 12px;
            background: #FF3030;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.8);
        }

        @keyframes bubbleFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-3px) scale(1.1); }
        }

        /* Flappy Bird Game Preview */
        .flappy-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: linear-gradient(180deg, #87CEEB 0%, #98FB98 70%, #90EE90 100%);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .flappy-bird {
            position: absolute;
            font-size: 1.8rem;
            left: 25px;
            top: 40px;
            animation: flappyBirdFloat 2s ease-in-out infinite;
            z-index: 3;
        }

        .flappy-pipe-top {
            position: absolute;
            top: 0;
            right: 15px;
            width: 20px;
            height: 35px;
            background: #228B22;
            border: 2px solid #006400;
            border-radius: 0 0 3px 3px;
        }

        .flappy-pipe-top::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: -3px;
            width: 26px;
            height: 8px;
            background: #228B22;
            border: 2px solid #006400;
            border-radius: 2px;
        }

        .flappy-pipe-bottom {
            position: absolute;
            bottom: 0;
            right: 15px;
            width: 20px;
            height: 35px;
            background: #228B22;
            border: 2px solid #006400;
            border-radius: 3px 3px 0 0;
        }

        .flappy-pipe-bottom::before {
            content: '';
            position: absolute;
            top: -8px;
            left: -3px;
            width: 26px;
            height: 8px;
            background: #228B22;
            border: 2px solid #006400;
            border-radius: 2px;
        }

        .flappy-clouds {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 0.8rem;
            opacity: 0.7;
            animation: flappyCloudsMove 4s linear infinite;
        }

        @keyframes flappyBirdFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-3px) rotate(-5deg); }
            75% { transform: translateY(3px) rotate(5deg); }
        }

        @keyframes flappyCloudsMove {
            0% { transform: translateX(0px); }
            100% { transform: translateX(-20px); }
        }

        /* Puzzle Match Game Preview */
        .puzzle-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 8px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 3px;
            padding: 8px;
            overflow: hidden;
        }

        .puzzle-tile {
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            font-weight: bold;
            border: 1px solid rgba(255, 255, 255, 0.3);
            animation: puzzleTileFloat 3s ease-in-out infinite;
        }

        .puzzle-red {
            background: linear-gradient(145deg, #ff6b6b, #ee5a52);
            animation-delay: 0s;
        }

        .puzzle-blue {
            background: linear-gradient(145deg, #4ecdc4, #45b7b8);
            animation-delay: 0.3s;
        }

        .puzzle-green {
            background: linear-gradient(145deg, #55a3ff, #4285f4);
            animation-delay: 0.6s;
        }

        .puzzle-bomb {
            background: linear-gradient(145deg, #2d3436, #636e72);
            animation: puzzleBombPulse 1.5s ease-in-out infinite;
        }

        .puzzle-star {
            background: linear-gradient(145deg, #fdcb6e, #e17055);
            animation: puzzleStarGlow 2s ease-in-out infinite;
        }

        @keyframes puzzleTileFloat {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.05) rotate(2deg); }
        }

        @keyframes puzzleBombPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 5px rgba(45, 52, 54, 0.5); }
            50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(45, 52, 54, 0.8); }
        }

        @keyframes puzzleStarGlow {
            0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(253, 203, 110, 0.6); }
            50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(253, 203, 110, 1); }
        }

        /* Cake Decorator Game Preview */
        .cake-preview {
            position: relative;
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff9a9e, #fecfef);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .cake-emoji {
            font-size: 4rem;
            animation: cakeEmojiFloat 3s ease-in-out infinite;
        }

        @keyframes cakeEmojiFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-5px) scale(1.1); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .recommended-grid {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .recommended-header {
                flex-direction: column;
                text-align: center;
            }
            
            .recommended-games h3 {
                font-size: 1.8rem;
            }
        }
        
        @media (max-width: 480px) {
            .recommended-games {
                padding: 1.5rem;
                margin: 1rem 0;
            }
            
            .recommended-image {
                height: 150px;
            }
            
            .recommended-info {
                padding: 1rem;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Function to add shuffle button and functionality
function addShuffleButton(currentGameId) {
    const recommendedSection = document.querySelector('.recommended-games');
    if (!recommendedSection) return;
    
    // Check if shuffle button already exists
    if (recommendedSection.querySelector('.shuffle-button')) return;
    
    // Create shuffle button
    const shuffleButton = document.createElement('button');
    shuffleButton.className = 'shuffle-button';
    shuffleButton.innerHTML = '🎲 Shuffle Games';
    shuffleButton.onclick = () => {
        renderRecommendedGames(currentGameId);
        
        // Add visual feedback
        shuffleButton.style.opacity = '0.7';
        setTimeout(() => {
            shuffleButton.style.opacity = '1';
        }, 300);
    };
    
    // Insert shuffle button after the description
    const description = recommendedSection.querySelector('p');
    if (description) {
        description.insertAdjacentElement('afterend', shuffleButton);
    }
}

// Function to initialize recommended games system
function initializeRecommendedGames(currentGameId) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            renderRecommendedGames(currentGameId);
            addShuffleButton(currentGameId);
        });
    } else {
        renderRecommendedGames(currentGameId);
        addShuffleButton(currentGameId);
    }
}

// Function to get current game ID from URL
function getCurrentGameId() {
    const path = window.location.pathname;
    const gameMatch = path.match(/\/games\/([^\/]+)\//);
    return gameMatch ? gameMatch[1] : null;
}

// Auto-initialize if current game ID can be detected
document.addEventListener('DOMContentLoaded', function() {
    const currentGameId = getCurrentGameId();
    if (currentGameId) {
        initializeRecommendedGames(currentGameId);
    }
});

// Global function to shuffle recommended games
function shuffleRecommendedGames() {
    const currentGameId = getCurrentGameId();
    if (currentGameId) {
        renderRecommendedGames(currentGameId);
        
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

// Export functions for manual initialization
window.RecommendedGames = {
    initialize: initializeRecommendedGames,
    render: renderRecommendedGames,
    getCurrentGameId: getCurrentGameId,
    addGame: function(gameData) {
        allGames.push(gameData);
    },
    setGameActive: function(gameId, active) {
        const game = allGames.find(g => g.id === gameId);
        if (game) {
            game.active = active;
        }
    }
};

// Make shuffleRecommendedGames globally available
window.shuffleRecommendedGames = shuffleRecommendedGames;
