// FITLIFY Minigames System with 500 Games
class MinigamesSystem {
    constructor() {
        this.games = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.displayedCount = 0;
        this.pageSize = 24;
        this.dailyProgress = 0;
        this.unlockedGames = [];
        this.highScores = {};
        this.totalPlayed = 0;
        
        this.init();
    }
    
    init() {
        this.generateGames();
        this.loadUserData();
        this.setupEventListeners();
        this.updateDailyProgress();
        this.renderGames();
        this.updateStats();
    }
    
    generateGames() {
        // Generate 500 minigames with variety
        const categories = ['reaction', 'memory', 'puzzle', 'reflex', 'pattern', 'strategy', 'arcade'];
        const gameTypes = [
            { name: 'Speed Click', icon: '👆', desc: 'Click as fast as you can!' },
            { name: 'Memory Match', icon: '🧠', desc: 'Match the pairs from memory' },
            { name: 'Color Match', icon: '🎨', desc: 'Match the colors quickly' },
            { name: 'Number Guess', icon: '🔢', desc: 'Guess the hidden number' },
            { name: 'Reflex Test', icon: '⚡', desc: 'Test your reaction time' },
            { name: 'Pattern Memory', icon: '📊', desc: 'Remember and repeat the pattern' },
            { name: 'Word Scramble', icon: '📝', desc: 'Unscramble the word' },
            { name: 'Shape Sort', icon: '🔷', desc: 'Sort shapes by type' },
            { name: 'Math Quick', icon: '➕', desc: 'Solve math problems fast' },
            { name: 'Target Hit', icon: '🎯', desc: 'Hit the moving targets' },
            { name: 'Sequence', icon: '🔢', desc: 'Continue the sequence' },
            { name: 'Puzzle Slide', icon: '🧩', desc: 'Slide pieces to solve' },
            { name: 'Ball Catch', icon: '⚽', desc: 'Catch the falling balls' },
            { name: 'Maze Run', icon: '🌀', desc: 'Navigate through the maze' },
            { name: 'Jump Over', icon: '🦘', desc: 'Jump over obstacles' },
            { name: 'Dodge', icon: '🏃', desc: 'Dodge the incoming objects' },
            { name: 'Collect', icon: '💎', desc: 'Collect all the gems' },
            { name: 'Balance', icon: '⚖️', desc: 'Keep the balance' },
            { name: 'Stack', icon: '🏗️', desc: 'Stack the blocks' },
            { name: 'Trivia', icon: '❓', desc: 'Answer trivia questions' }
        ];
        
        for (let i = 1; i <= 500; i++) {
            const type = gameTypes[(i - 1) % gameTypes.length];
            const category = categories[(i - 1) % categories.length];
            
            this.games.push({
                id: `game_${i}`,
                number: i,
                name: `${type.name} ${Math.ceil(i / 20)}`,
                icon: type.icon,
                description: type.desc,
                category: category,
                unlocked: false,
                highScore: 0
            });
        }
    }
    
    loadUserData() {
        // Load from localStorage or API
        const saved = localStorage.getItem('fitlify_games_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedGames = data.unlockedGames || [];
            this.highScores = data.highScores || {};
            this.totalPlayed = data.totalPlayed || 0;
            this.dailyProgress = data.dailyProgress || 0;
        }
        
        // Update games with unlock status
        this.games.forEach(game => {
            game.unlocked = this.unlockedGames.includes(game.id);
            game.highScore = this.highScores[game.id] || 0;
        });
    }
    
    saveUserData() {
        const data = {
            unlockedGames: this.unlockedGames,
            highScores: this.highScores,
            totalPlayed: this.totalPlayed,
            dailyProgress: this.dailyProgress,
            lastSave: new Date().toISOString()
        };
        localStorage.setItem('fitlify_games_data', JSON.stringify(data));
    }
    
    setupEventListeners() {
        // Hamburger menu
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const sidebarClose = document.getElementById('sidebar-close');
        
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        const closeSidebar = () => {
            hamburger.classList.remove('active');
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        };
        
        sidebarClose.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.displayedCount = 0;
                this.renderGames();
            });
        });
        
        // Category filter
        const categorySelect = document.getElementById('category-filter');
        categorySelect.addEventListener('change', () => {
            this.currentCategory = categorySelect.value;
            this.displayedCount = 0;
            this.renderGames();
        });
        
        // Search
        const searchInput = document.getElementById('game-search');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.displayedCount = 0;
            this.renderGames();
        });
        
        // Load more
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            this.loadMoreGames();
        });
        
        // Modal close buttons
        const gameModalClose = document.getElementById('modal-close');
        const lockedModalClose = document.getElementById('locked-modal-close');
        const closeLockedBtn = document.getElementById('close-locked-btn');
        
        gameModalClose.addEventListener('click', () => this.closeGameModal());
        lockedModalClose.addEventListener('click', () => this.closeLockedModal());
        closeLockedBtn.addEventListener('click', () => this.closeLockedModal());
        
        // Game buttons
        const startGameBtn = document.getElementById('start-game-btn');
        const resetGameBtn = document.getElementById('reset-game-btn');
        
        startGameBtn.addEventListener('click', () => this.startCurrentGame());
        resetGameBtn.addEventListener('click', () => this.resetCurrentGame());
    }
    
    updateDailyProgress() {
        // Check if workout is completed (simulated)
        const workoutCompleted = this.dailyProgress >= 100;
        
        const progressStatus = document.getElementById('progress-status');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const workoutInfo = document.getElementById('workout-info');
        
        progressFill.style.width = `${this.dailyProgress}%`;
        progressText.textContent = `${this.dailyProgress}% Complete`;
        
        if (workoutCompleted) {
            progressStatus.textContent = '🔓 Workout Complete! Games Unlocked!';
            progressStatus.classList.add('unlocked');
            workoutInfo.innerHTML = '<p style="color: var(--success);">Great job! All minigames are now unlocked for today!</p>';
            this.unlockAllGames();
        } else {
            progressStatus.textContent = '🔒 Complete workout to unlock';
            progressStatus.classList.remove('unlocked');
            workoutInfo.innerHTML = `<p>Complete ${100 - this.dailyProgress}% more of your workout to unlock minigames!</p>`;
        }
    }
    
    unlockAllGames() {
        let newUnlocks = 0;
        this.games.forEach(game => {
            if (!game.unlocked) {
                game.unlocked = true;
                this.unlockedGames.push(game.id);
                newUnlocks++;
            }
        });
        
        if (newUnlocks > 0) {
            this.saveUserData();
            this.showNotification(`🎉 ${newUnlocks} minigames unlocked!`);
            this.renderGames();
            this.updateStats();
        }
    }
    
    renderGames() {
        const grid = document.getElementById('games-grid');
        
        // Filter games
        let filtered = this.games.filter(game => {
            // Filter by lock status
            if (this.currentFilter === 'unlocked' && !game.unlocked) return false;
            if (this.currentFilter === 'locked' && game.unlocked) return false;
            
            // Filter by category
            if (this.currentCategory !== 'all' && game.category !== this.currentCategory) return false;
            
            // Filter by search
            if (this.searchTerm && !game.name.toLowerCase().includes(this.searchTerm)) return false;
            
            return true;
        });
        
        // Get games to display
        const gamesToShow = filtered.slice(0, this.displayedCount + this.pageSize);
        
        if (gamesToShow.length === 0) {
            grid.innerHTML = `
                <div class="loading-state">
                    <p>No games found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = gamesToShow.map(game => this.createGameCard(game)).join('');
        
        // Attach click listeners
        gamesToShow.forEach(game => {
            const card = document.getElementById(`game-card-${game.id}`);
            if (card) {
                card.addEventListener('click', () => this.handleGameClick(game));
            }
        });
        
        this.displayedCount = gamesToShow.length;
        
        // Update load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (this.displayedCount >= filtered.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `Load More (${filtered.length - this.displayedCount} remaining)`;
        }
    }
    
    createGameCard(game) {
        const status = game.unlocked ? '🔓' : '🔒';
        const statusClass = game.unlocked ? 'unlocked' : 'locked';
        
        return `
            <div class="game-card ${statusClass}" id="game-card-${game.id}">
                <span class="game-lock-icon">${status}</span>
                <div class="game-number">#${game.number}</div>
                <span class="game-icon">${game.icon}</span>
                <h3 class="game-title">${game.name}</h3>
                <span class="game-category ${game.category}">${game.category}</span>
                <div class="game-status">
                    ${game.unlocked ? `High Score: ${game.highScore}` : 'Complete workout to unlock'}
                </div>
            </div>
        `;
    }
    
    handleGameClick(game) {
        if (game.unlocked) {
            this.openGameModal(game);
        } else {
            this.openLockedModal();
        }
    }
    
    openGameModal(game) {
        this.currentGame = game;
        const modal = document.getElementById('game-modal');
        
        document.getElementById('game-title').textContent = game.name;
        document.getElementById('game-description').textContent = game.description;
        document.getElementById('high-score-display').textContent = game.highScore;
        document.getElementById('current-score').textContent = '0';
        
        modal.classList.add('active');
        
        // Render the game
        this.renderGameInContainer(game);
    }
    
    closeGameModal() {
        const modal = document.getElementById('game-modal');
        modal.classList.remove('active');
        this.stopCurrentGame();
    }
    
    openLockedModal() {
        const modal = document.getElementById('locked-modal');
        modal.classList.add('active');
    }
    
    closeLockedModal() {
        const modal = document.getElementById('locked-modal');
        modal.classList.remove('active');
    }
    
    renderGameInContainer(game) {
        const container = document.getElementById('game-container');
        
        // Simple game implementations
        switch(game.category) {
            case 'reaction':
                container.innerHTML = this.createReactionGame();
                break;
            case 'memory':
                container.innerHTML = this.createMemoryGame();
                break;
            case 'puzzle':
                container.innerHTML = this.createPuzzleGame();
                break;
            case 'reflex':
                container.innerHTML = this.createReflexGame();
                break;
            case 'pattern':
                container.innerHTML = this.createPatternGame();
                break;
            case 'strategy':
                container.innerHTML = this.createStrategyGame();
                break;
            case 'arcade':
                container.innerHTML = this.createArcadeGame();
                break;
            default:
                container.innerHTML = this.createReactionGame();
        }
    }
    
    createReactionGame() {
        return `
            <div class="reaction-game">
                <div class="game-area" id="game-area" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; background: var(--bg-tertiary); border-radius: 8px;">
                    <p id="reaction-text" style="font-size: 1.5rem; font-weight: 600;">Click when GREEN!</p>
                </div>
            </div>
        `;
    }
    
    createMemoryGame() {
        return `
            <div class="memory-game">
                <div class="memory-grid" id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 300px; margin: 0 auto;">
                    ${Array(16).fill(0).map((_, i) => `
                        <div class="memory-card" data-index="${i}" style="aspect-ratio: 1; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 2px solid var(--border-color);">
                            ?
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    createPuzzleGame() {
        return `
            <div class="puzzle-game">
                <div id="puzzle-container" style="text-align: center;">
                    <p style="margin-bottom: 1rem;">Unscramble: <strong>RAETC</strong></p>
                    <input type="text" id="puzzle-input" placeholder="Your answer..." style="padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); text-align: center; font-size: 1.25rem; text-transform: uppercase;">
                    <button id="puzzle-submit" style="margin-left: 0.5rem; padding: 0.75rem 1.5rem; background: var(--primary-green); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Submit</button>
                </div>
            </div>
        `;
    }
    
    createReflexGame() {
        return `
            <div class="reflex-game">
                <div id="reflex-area" style="width: 100%; height: 100%; position: relative; background: var(--bg-tertiary); border-radius: 8px; overflow: hidden;">
                    <div id="target" style="position: absolute; width: 50px; height: 50px; background: var(--primary-green); border-radius: 50%; cursor: pointer; display: none;"></div>
                    <p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.25rem; color: var(--text-muted);">Click the green circles!</p>
                </div>
            </div>
        `;
    }
    
    createPatternGame() {
        return `
            <div class="pattern-game">
                <div id="pattern-display" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 1rem;">
                    ${Array(4).fill(0).map(() => `
                        <div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 8px; border: 2px solid var(--border-color);"></div>
                    `).join('')}
                </div>
                <p style="text-align: center; color: var(--text-muted);">Watch the pattern and repeat it!</p>
                <button id="pattern-start" style="display: block; margin: 1rem auto; padding: 0.75rem 2rem; background: var(--primary-green); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Start Pattern</button>
            </div>
        `;
    }
    
    createStrategyGame() {
        return `
            <div class="strategy-game">
                <div id="strategy-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; max-width: 200px; margin: 0 auto;">
                    ${Array(9).fill(0).map((_, i) => `
                        <div class="strategy-cell" data-index="${i}" style="aspect-ratio: 1; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 2px solid var(--border-color);">
                        </div>
                    `).join('')}
                </div>
                <p style="text-align: center; margin-top: 1rem; color: var(--text-muted);">Get 3 in a row!</p>
            </div>
        `;
    }
    
    createArcadeGame() {
        return `
            <div class="arcade-game">
                <div id="arcade-canvas" style="width: 100%; height: 200px; background: var(--bg-tertiary); border-radius: 8px; position: relative; overflow: hidden;">
                    <div id="player" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: var(--primary-green); border-radius: 4px;"></div>
                    <div id="obstacle" style="position: absolute; top: -30px; left: 50%; width: 30px; height: 30px; background: var(--error); border-radius: 4px;"></div>
                </div>
                <p style="text-align: center; margin-top: 0.5rem; color: var(--text-muted);">Use arrow keys to dodge!</p>
            </div>
        `;
    }
    
    startCurrentGame() {
        if (!this.currentGame) return;
        
        this.gameActive = true;
        this.currentScore = 0;
        
        // Start game based on category
        switch(this.currentGame.category) {
            case 'reaction':
                this.startReactionGame();
                break;
            case 'reflex':
                this.startReflexGame();
                break;
            case 'arcade':
                this.startArcadeGame();
                break;
            case 'strategy':
                this.startStrategyGame();
                break;
            default:
                // Simple click game for others
                this.startDefaultGame();
        }
    }
    
    startReactionGame() {
        const gameArea = document.getElementById('game-area');
        const text = document.getElementById('reaction-text');
        
        let waiting = true;
        let startTime;
        
        const startRound = () => {
            gameArea.style.background = '#ef4444';
            text.textContent = 'Wait for GREEN...';
            text.style.color = 'white';
            waiting = true;
            
            const delay = 1000 + Math.random() * 3000;
            
            setTimeout(() => {
                if (!this.gameActive) return;
                gameArea.style.background = '#22c55e';
                text.textContent = 'CLICK NOW!';
                startTime = Date.now();
                waiting = false;
            }, delay);
        };
        
        gameArea.addEventListener('click', () => {
            if (!this.gameActive) return;
            
            if (waiting) {
                text.textContent = 'Too early! Try again.';
                gameArea.style.background = '#ef4444';
                setTimeout(startRound, 1000);
            } else {
                const reactionTime = Date.now() - startTime;
                const score = Math.max(0, 1000 - reactionTime);
                this.currentScore += Math.floor(score / 10);
                this.updateScore();
                text.textContent = `${reactionTime}ms! Score: ${Math.floor(score / 10)}`;
                setTimeout(startRound, 1000);
            }
        });
        
        startRound();
    }
    
    startReflexGame() {
        const area = document.getElementById('reflex-area');
        const target = document.getElementById('target');
        
        const spawnTarget = () => {
            if (!this.gameActive) return;
            
            const x = Math.random() * (area.offsetWidth - 50);
            const y = Math.random() * (area.offsetHeight - 50);
            
            target.style.left = x + 'px';
            target.style.top = y + 'px';
            target.style.display = 'block';
            
            setTimeout(() => {
                target.style.display = 'none';
                if (this.gameActive) spawnTarget();
            }, 1500);
        };
        
        target.addEventListener('click', () => {
            this.currentScore += 10;
            this.updateScore();
            target.style.display = 'none';
        });
        
        spawnTarget();
    }
    
    startStrategyGame() {
        const cells = document.querySelectorAll('.strategy-cell');
        let currentPlayer = 'X';
        
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (!this.gameActive || cell.textContent) return;
                
                cell.textContent = currentPlayer;
                
                if (this.checkWin(cells, currentPlayer)) {
                    this.currentScore += currentPlayer === 'X' ? 100 : 0;
                    this.updateScore();
                    alert(currentPlayer === 'X' ? 'You win!' : 'Computer wins!');
                    this.stopCurrentGame();
                }
                
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                
                if (currentPlayer === 'O' && this.gameActive) {
                    setTimeout(() => this.computerMove(cells), 500);
                }
            });
        });
    }
    
    checkWin(cells, player) {
        const wins = [
            [0,1,2], [3,4,5], [6,7,8], // rows
            [0,3,6], [1,4,7], [2,5,8], // cols
            [0,4,8], [2,4,6] // diagonals
        ];
        
        return wins.some(combo => 
            combo.every(i => cells[i].textContent === player)
        );
    }
    
    computerMove(cells) {
        const empty = Array.from(cells).filter(c => !c.textContent);
        if (empty.length > 0) {
            const random = empty[Math.floor(Math.random() * empty.length)];
            random.click();
        }
    }
    
    startArcadeGame() {
        const canvas = document.getElementById('arcade-canvas');
        const player = document.getElementById('player');
        const obstacle = document.getElementById('obstacle');
        
        let playerX = 50;
        let obstacleY = -30;
        let obstacleX = 50;
        let speed = 3;
        
        const gameLoop = () => {
            if (!this.gameActive) return;
            
            obstacleY += speed;
            if (obstacleY > canvas.offsetHeight) {
                obstacleY = -30;
                obstacleX = Math.random() * (canvas.offsetWidth - 30);
                this.currentScore += 10;
                this.updateScore();
                speed += 0.2;
            }
            
            obstacle.style.top = obstacleY + 'px';
            obstacle.style.left = obstacleX + 'px';
            
            // Collision detection
            const pRect = player.getBoundingClientRect();
            const oRect = obstacle.getBoundingClientRect();
            
            if (pRect.left < oRect.right &&
                pRect.right > oRect.left &&
                pRect.top < oRect.bottom &&
                pRect.bottom > oRect.top) {
                this.stopCurrentGame();
                alert('Game Over! Score: ' + this.currentScore);
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            if (e.key === 'ArrowLeft') playerX = Math.max(0, playerX - 10);
            if (e.key === 'ArrowRight') playerX = Math.min(100, playerX + 10);
            player.style.left = playerX + '%';
        });
        
        gameLoop();
    }
    
    startDefaultGame() {
        const container = document.getElementById('game-container');
        
        container.innerHTML += `
            <button id="click-btn" style="padding: 2rem 4rem; font-size: 1.5rem; background: var(--gradient-primary); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
                CLICK ME! 🎯
            </button>
        `;
        
        const clickBtn = document.getElementById('click-btn');
        
        const moveButton = () => {
            if (!this.gameActive) return;
            
            const x = Math.random() * (container.offsetWidth - 200);
            const y = Math.random() * (container.offsetHeight - 100);
            
            clickBtn.style.position = 'absolute';
            clickBtn.style.left = x + 'px';
            clickBtn.style.top = y + 'px';
        };
        
        clickBtn.addEventListener('click', () => {
            this.currentScore += 10;
            this.updateScore();
            moveButton();
        });
        
        setInterval(moveButton, 1500);
    }
    
    resetCurrentGame() {
        this.stopCurrentGame();
        this.renderGameInContainer(this.currentGame);
        this.startCurrentGame();
    }
    
    stopCurrentGame() {
        this.gameActive = false;
        
        // Save high score if better
        if (this.currentScore > this.currentGame.highScore) {
            this.currentGame.highScore = this.currentScore;
            this.highScores[this.currentGame.id] = this.currentScore;
            this.showNotification(`New High Score: ${this.currentScore}!`);
        }
        
        this.totalPlayed++;
        this.saveUserData();
        this.updateStats();
    }
    
    updateScore() {
        document.getElementById('current-score').textContent = this.currentScore;
    }
    
    loadMoreGames() {
        this.renderGames();
    }
    
    updateStats() {
        const unlocked = this.games.filter(g => g.unlocked).length;
        const locked = this.games.length - unlocked;
        const bestScore = Math.max(...this.games.map(g => g.highScore), 0);
        
        document.getElementById('unlocked-count').textContent = unlocked;
        document.getElementById('locked-count').textContent = locked;
        document.getElementById('high-score').textContent = bestScore;
        document.getElementById('total-played').textContent = this.totalPlayed;
    }
    
    showNotification(message) {
        const notification = document.getElementById('notification');
        const messageEl = notification.querySelector('.notification-message');
        
        messageEl.textContent = message;
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MinigamesSystem();
});
