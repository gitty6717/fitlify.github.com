/**
 * FITLIFY Minigames Hub
 * Handles game unlocks, leaderboards, and game launching
 */

// Game Definitions with Unlock Requirements
const GAMES = {
    ticTacToe: {
        id: 'ticTacToe',
        name: 'Tic Tac Toe',
        icon: '⭕',
        description: 'Classic X and O strategy game against AI',
        unlockRequirement: { type: 'workouts', value: 1 },
        unlockText: 'Complete your first workout',
        scoring: 'win_ratio',
        hasAI: true,
        url: 'games/tictactoe.html'
    },
    memoryMatch: {
        id: 'memoryMatch',
        name: 'Memory Match',
        icon: '🧠',
        description: 'Test your memory by matching pairs of cards',
        unlockRequirement: { type: 'workouts', value: 5 },
        unlockText: 'Complete 5 workouts',
        scoring: 'time',
        timeBased: true,
        url: 'games/memorymatch.html'
    },
    sudoku: {
        id: 'sudoku',
        name: 'Mini Sudoku',
        icon: '🔢',
        description: 'Fill the 4x4 grid with numbers 1-4',
        unlockRequirement: { type: 'streak', value: 7 },
        unlockText: '7 day workout streak',
        scoring: 'time',
        timeBased: true,
        url: 'games/sudoku.html'
    },
    puzzle2048: {
        id: 'puzzle2048',
        name: '2048 Puzzle',
        icon: '🎯',
        description: 'Merge tiles to reach 2048',
        unlockRequirement: { type: 'weekly', value: 1 },
        unlockText: 'Complete a weekly challenge',
        scoring: 'score',
        url: 'games/2048.html'
    },
    slidingPuzzle: {
        id: 'slidingPuzzle',
        name: 'Sliding Puzzle',
        icon: '🧩',
        description: 'Arrange numbered tiles in order',
        unlockRequirement: { type: 'workouts', value: 10 },
        unlockText: 'Complete 10 workouts',
        scoring: 'time',
        timeBased: true,
        url: 'games/slidingpuzzle.html'
    },
    connectFour: {
        id: 'connectFour',
        name: 'Connect Four',
        icon: '🔴',
        description: 'Get 4 in a row to win against AI',
        unlockRequirement: { type: 'workouts', value: 15 },
        unlockText: 'Complete 15 workouts',
        scoring: 'win_ratio',
        hasAI: true,
        url: 'games/connectfour.html'
    },
    wordScramble: {
        id: 'wordScramble',
        name: 'Word Scramble',
        icon: '📝',
        description: 'Unscramble fitness-related words',
        unlockRequirement: { type: 'streak', value: 14 },
        unlockText: '14 day workout streak',
        scoring: 'score',
        url: 'games/wordscramble.html'
    },
    numberGuess: {
        id: 'numberGuess',
        name: 'Number Guess',
        icon: '❓',
        description: 'Guess the number in as few tries as possible',
        unlockRequirement: { type: 'workouts', value: 20 },
        unlockText: 'Complete 20 workouts',
        scoring: 'attempts',
        lowerIsBetter: true,
        url: 'games/numberguess.html'
    },
    mazeEscape: {
        id: 'mazeEscape',
        name: 'Maze Escape',
        icon: '🌀',
        description: 'Navigate through the maze to the exit',
        unlockRequirement: { type: 'monthly', value: 1 },
        unlockText: 'Complete a monthly challenge',
        scoring: 'time',
        timeBased: true,
        url: 'games/mazeescape.html'
    },
    colorMatch: {
        id: 'colorMatch',
        name: 'Color Match',
        icon: '🎨',
        description: 'Match colors under time pressure',
        unlockRequirement: { type: 'workouts', value: 30 },
        unlockText: 'Complete 30 workouts',
        scoring: 'score',
        url: 'games/colormatch.html'
    }
};

// Achievement Manager
class AchievementManager {
    constructor() {
        this.achievements = this.loadAchievements();
    }

    loadAchievements() {
        const saved = localStorage.getItem('fitlify_achievements');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            workoutsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyChallenges: 0,
            monthlyChallenges: 0,
            lastWorkoutDate: null,
            unlockedGames: []
        };
    }

    saveAchievements() {
        localStorage.setItem('fitlify_achievements', JSON.stringify(this.achievements));
    }

    recordWorkout() {
        const today = new Date().toDateString();
        
        if (this.achievements.lastWorkoutDate !== today) {
            this.achievements.workoutsCompleted++;
            
            // Check streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (this.achievements.lastWorkoutDate === yesterday.toDateString()) {
                this.achievements.currentStreak++;
            } else {
                this.achievements.currentStreak = 1;
            }
            
            if (this.achievements.currentStreak > this.achievements.longestStreak) {
                this.achievements.longestStreak = this.achievements.currentStreak;
            }
            
            this.achievements.lastWorkoutDate = today;
            this.saveAchievements();
            this.checkUnlocks();
        }
    }

    recordWeeklyChallenge() {
        this.achievements.weeklyChallenges++;
        this.saveAchievements();
        this.checkUnlocks();
    }

    recordMonthlyChallenge() {
        this.achievements.monthlyChallenges++;
        this.saveAchievements();
        this.checkUnlocks();
    }

    checkUnlocks() {
        const newlyUnlocked = [];
        
        Object.values(GAMES).forEach(game => {
            if (!this.achievements.unlockedGames.includes(game.id)) {
                const req = game.unlockRequirement;
                let unlocked = false;
                
                switch (req.type) {
                    case 'workouts':
                        if (this.achievements.workoutsCompleted >= req.value) unlocked = true;
                        break;
                    case 'streak':
                        if (this.achievements.currentStreak >= req.value) unlocked = true;
                        break;
                    case 'weekly':
                        if (this.achievements.weeklyChallenges >= req.value) unlocked = true;
                        break;
                    case 'monthly':
                        if (this.achievements.monthlyChallenges >= req.value) unlocked = true;
                        break;
                }
                
                if (unlocked) {
                    this.achievements.unlockedGames.push(game.id);
                    newlyUnlocked.push(game);
                }
            }
        });
        
        if (newlyUnlocked.length > 0) {
            this.saveAchievements();
            this.showUnlockNotification(newlyUnlocked);
        }
        
        return newlyUnlocked;
    }

    isGameUnlocked(gameId) {
        return this.achievements.unlockedGames.includes(gameId);
    }

    getProgress() {
        return {
            workouts: this.achievements.workoutsCompleted,
            streak: this.achievements.currentStreak,
            unlocked: this.achievements.unlockedGames.length,
            total: Object.keys(GAMES).length
        };
    }

    showUnlockNotification(games) {
        games.forEach((game, index) => {
            setTimeout(() => {
                showNotification(`🎉 Unlocked: ${game.name}!`, 'success');
            }, index * 500);
        });
    }
}

// Score Manager
class ScoreManager {
    constructor() {
        this.scores = this.loadScores();
        this.userId = this.getUserId();
    }

    getUserId() {
        return localStorage.getItem('fitlify_user_id') || 'guest_' + Math.random().toString(36).substr(2, 9);
    }

    loadScores() {
        const saved = localStorage.getItem('fitlify_minigame_scores');
        return saved ? JSON.parse(saved) : {};
    }

    saveScores() {
        localStorage.setItem('fitlify_minigame_scores', JSON.stringify(this.scores));
    }

    submitScore(gameId, score, duration = null) {
        // Anti-cheat validation
        if (!this.validateScore(gameId, score, duration)) {
            console.warn('Score failed validation:', { gameId, score, duration });
            return false;
        }

        const gameScores = this.scores[gameId] || { best: null, history: [], playCount: 0 };
        
        const entry = {
            score,
            duration,
            timestamp: Date.now(),
            userId: this.userId,
            verified: true
        };

        gameScores.history.push(entry);
        gameScores.playCount++;

        // Update best score
        const game = GAMES[gameId];
        const isBetter = this.isBetterScore(game, score, gameScores.best?.score);
        
        if (isBetter) {
            gameScores.best = entry;
        }

        this.scores[gameId] = gameScores;
        this.saveScores();

        // Update global leaderboard
        this.updateLeaderboard(gameId, entry);

        return true;
    }

    validateScore(gameId, score, duration) {
        const game = GAMES[gameId];
        
        // Check for impossible values
        if (score === null || score === undefined || isNaN(score)) return false;
        
        // Time-based games: check for impossible times (too fast = cheating)
        if (game.timeBased && duration !== null) {
            if (duration < 1000) return false; // Less than 1 second is impossible
        }

        // Check score ranges
        switch (gameId) {
            case 'puzzle2048':
                if (score > 100000) return false;
                break;
            case 'ticTacToe':
            case 'connectFour':
                if (score < 0 || score > 100) return false;
                break;
        }

        // Check for duplicate rapid submissions
        const recentScores = this.getRecentScores(gameId, 60000); // Last minute
        if (recentScores.length > 10) return false;

        return true;
    }

    isBetterScore(game, newScore, oldScore) {
        if (!oldScore) return true;
        
        if (game.lowerIsBetter) {
            return newScore < oldScore;
        }
        return newScore > oldScore;
    }

    getRecentScores(gameId, timeWindow) {
        const gameScores = this.scores[gameId];
        if (!gameScores) return [];
        
        const cutoff = Date.now() - timeWindow;
        return gameScores.history.filter(s => s.timestamp > cutoff);
    }

    getBestScore(gameId) {
        return this.scores[gameId]?.best || null;
    }

    getPlayCount(gameId) {
        return this.scores[gameId]?.playCount || 0;
    }

    updateLeaderboard(gameId, entry) {
        const key = `leaderboard_${gameId}_alltime`;
        let leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Add or update entry
        const existingIndex = leaderboard.findIndex(e => e.userId === entry.userId);
        
        if (existingIndex >= 0) {
            const game = GAMES[gameId];
            const currentBest = leaderboard[existingIndex].score;
            
            if (this.isBetterScore(game, entry.score, currentBest)) {
                leaderboard[existingIndex] = {
                    userId: entry.userId,
                    score: entry.score,
                    duration: entry.duration,
                    timestamp: entry.timestamp,
                    username: this.getUsername()
                };
            }
        } else {
            leaderboard.push({
                userId: entry.userId,
                score: entry.score,
                duration: entry.duration,
                timestamp: entry.timestamp,
                username: this.getUsername()
            });
        }

        // Sort and save
        const game = GAMES[gameId];
        leaderboard.sort((a, b) => {
            if (game.lowerIsBetter) return a.score - b.score;
            return b.score - a.score;
        });

        localStorage.setItem(key, JSON.stringify(leaderboard.slice(0, 100)));
    }

    getUsername() {
        const user = JSON.parse(localStorage.getItem('fitlify_user') || '{}');
        return user.name || user.username || 'Player';
    }

    getLeaderboard(gameId, timeRange = 'alltime') {
        const key = `leaderboard_${gameId}_${timeRange}`;
        let leaderboard = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Filter by time range if needed
        if (timeRange !== 'alltime') {
            const now = Date.now();
            const ranges = {
                daily: 24 * 60 * 60 * 1000,
                weekly: 7 * 24 * 60 * 60 * 1000,
                monthly: 30 * 24 * 60 * 60 * 1000
            };
            
            const cutoff = now - (ranges[timeRange] || 0);
            leaderboard = leaderboard.filter(e => e.timestamp > cutoff);
        }

        // Add ranks
        return leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            isCurrentUser: entry.userId === this.userId
        }));
    }

    getUserRank(gameId, timeRange = 'alltime') {
        const leaderboard = this.getLeaderboard(gameId, timeRange);
        const userEntry = leaderboard.find(e => e.userId === this.userId);
        
        if (userEntry) {
            return userEntry.rank;
        }
        
        // Find rank even if not in top 100
        const key = `leaderboard_${gameId}_${timeRange}`;
        const allEntries = JSON.parse(localStorage.getItem(key) || '[]');
        const allSorted = this.sortLeaderboard(allEntries, gameId);
        
        for (let i = 0; i < allSorted.length; i++) {
            if (allSorted[i].userId === this.userId) {
                return i + 1;
            }
        }
        
        return null;
    }

    sortLeaderboard(entries, gameId) {
        const game = GAMES[gameId];
        return entries.sort((a, b) => {
            if (game.lowerIsBetter) return a.score - b.score;
            return b.score - a.score;
        });
    }
}

// Global instances
const achievementManager = new AchievementManager();
const scoreManager = new ScoreManager();

// UI Functions
function renderGames() {
    const grid = document.getElementById('games-grid');
    const progress = achievementManager.getProgress();
    
    // Update progress display
    document.getElementById('workout-count').textContent = progress.workouts;
    document.getElementById('streak-count').textContent = progress.streak;
    document.getElementById('unlocked-count').textContent = `${progress.unlocked}/${progress.total}`;

    grid.innerHTML = Object.values(GAMES).map((game, index) => {
        const isUnlocked = achievementManager.isGameUnlocked(game.id);
        const bestScore = scoreManager.getBestScore(game.id);
        const playCount = scoreManager.getPlayCount(game.id);
        const globalRank = isUnlocked ? scoreManager.getUserRank(game.id) : null;
        
        return `
            <div class="game-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 style="animation-delay: ${index * 0.1}s"
                 data-game-id="${game.id}">
                <div class="game-card-header">
                    <div class="game-icon">${game.icon}</div>
                    <h3 class="game-title">${game.name}</h3>
                    <p class="game-description">${game.description}</p>
                </div>
                <div class="game-card-body">
                    ${isUnlocked ? `
                        <div class="game-stats-row">
                            <div class="game-stat">
                                <span class="game-stat-value">${bestScore ? formatScore(game, bestScore.score) : '-'}</span>
                                <span class="game-stat-label">Best</span>
                            </div>
                            <div class="game-stat">
                                <span class="game-stat-value">${playCount}</span>
                                <span class="game-stat-label">Played</span>
                            </div>
                            <div class="game-stat">
                                <span class="game-stat-value">${globalRank ? '#' + globalRank : '-'}</span>
                                <span class="game-stat-label">Rank</span>
                            </div>
                        </div>
                        <button class="play-btn primary" onclick="openGame('${game.id}')">
                            ▶ Play Now
                        </button>
                    ` : `
                        <div class="unlock-requirement">
                            <strong>🔒 Locked</strong>
                            ${game.unlockText}
                        </div>
                        <button class="play-btn" disabled>
                            🔒 Locked
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function formatScore(game, score) {
    if (game.timeBased && score) {
        const minutes = Math.floor(score / 60000);
        const seconds = Math.floor((score % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return score.toString();
}

function openGame(gameId) {
    const game = GAMES[gameId];
    if (!game || !achievementManager.isGameUnlocked(gameId)) return;

    document.getElementById('modal-game-title').textContent = game.name;
    document.getElementById('game-container').innerHTML = `
        <iframe src="${game.url}?gameId=${gameId}" 
                style="width: 100%; height: 100%; border: none; border-radius: 12px;"
                id="game-frame"></iframe>
    `;
    
    // Update stats sidebar
    const bestScore = scoreManager.getBestScore(gameId);
    const playCount = scoreManager.getPlayCount(gameId);
    const globalRank = scoreManager.getUserRank(gameId);
    
    document.getElementById('personal-best').textContent = bestScore ? formatScore(game, bestScore.score) : '-';
    document.getElementById('games-played').textContent = playCount;
    document.getElementById('global-rank').textContent = globalRank ? `#${globalRank}` : '-';
    
    document.getElementById('game-instructions').innerHTML = `
        <h4>How to Play</h4>
        <p>${game.description}</p>
        <p style="margin-top: 0.5rem;">
            <strong>Scoring:</strong> ${getScoringDescription(game)}
        </p>
    `;

    document.getElementById('game-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function getScoringDescription(game) {
    switch (game.scoring) {
        case 'win_ratio': return 'Win percentage against AI';
        case 'time': return 'Fastest completion time';
        case 'score': return 'Highest score achieved';
        case 'attempts': return 'Fewest attempts to solve';
        default: return 'Best performance';
    }
}

function closeGameModal() {
    document.getElementById('game-modal').classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('game-container').innerHTML = '';
}

function openLeaderboard(gameId = null) {
    const currentGameId = gameId || document.querySelector('.game-modal.active')?.dataset?.gameId;
    if (!currentGameId) return;

    const game = GAMES[currentGameId];
    document.getElementById('leaderboard-game-title').textContent = `${game.name} Leaderboard`;
    
    renderLeaderboard(currentGameId, 'alltime');
    
    document.getElementById('leaderboard-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function renderLeaderboard(gameId, timeRange) {
    const leaderboard = scoreManager.getLeaderboard(gameId, timeRange);
    const tbody = document.getElementById('leaderboard-tbody');
    
    if (leaderboard.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No scores yet. Be the first to play!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = leaderboard.slice(0, 20).map(entry => `
        <tr class="${entry.isCurrentUser ? 'current-user' : ''}">
            <td class="rank-cell rank-${entry.rank <= 3 ? entry.rank : ''}">#${entry.rank}</td>
            <td class="player-cell">
                <div class="player-avatar">${entry.username.charAt(0).toUpperCase()}</div>
                <span class="player-name">${entry.username} ${entry.isCurrentUser ? '(You)' : ''}</span>
            </td>
            <td class="score-cell">${formatScore(GAMES[gameId], entry.score)}</td>
            <td>${new Date(entry.timestamp).toLocaleDateString()}</td>
        </tr>
    `).join('');

    // Show user rank if not in top 20
    const userEntry = leaderboard.find(e => e.isCurrentUser);
    const userRankSection = document.getElementById('user-rank-section');
    
    if (!userEntry && leaderboard.length > 0) {
        const userRank = scoreManager.getUserRank(gameId, timeRange);
        if (userRank) {
            userRankSection.innerHTML = `
                <div class="leaderboard-preview-item" style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; margin-top: 1rem;">
                    <div class="leaderboard-rank">#${userRank}</div>
                    <div class="leaderboard-player">
                        <div class="player-avatar">${scoreManager.getUsername().charAt(0).toUpperCase()}</div>
                        <span class="player-name">${scoreManager.getUsername()} (You)</span>
                    </div>
                </div>
            `;
        } else {
            userRankSection.innerHTML = '';
        }
    } else {
        userRankSection.innerHTML = '';
    }
}

function closeLeaderboard() {
    document.getElementById('leaderboard-modal').classList.remove('active');
}

function renderLeaderboardPreview() {
    const preview = document.getElementById('leaderboard-preview');
    const topPlayers = [];
    
    // Aggregate scores across all games
    Object.keys(GAMES).forEach(gameId => {
        const lb = scoreManager.getLeaderboard(gameId, 'alltime');
        if (lb.length > 0) {
            topPlayers.push({
                game: GAMES[gameId].name,
                topPlayer: lb[0]
            });
        }
    });

    if (topPlayers.length === 0) {
        preview.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No leaderboard data yet. Start playing to set records!</p>';
        return;
    }

    preview.innerHTML = topPlayers.slice(0, 5).map((item, index) => `
        <div class="leaderboard-preview-item">
            <div class="leaderboard-rank ${index < 3 ? ['gold', 'silver', 'bronze'][index] : ''}">#${index + 1}</div>
            <div class="leaderboard-player">
                <div class="player-avatar">${item.topPlayer.username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="player-name">${item.topPlayer.username}</div>
                    <small style="color: var(--text-muted);">${item.game}</small>
                </div>
            </div>
            <div class="leaderboard-score">${formatScore(GAMES[Object.keys(GAMES).find(k => GAMES[k].name === item.game)], item.topPlayer.score)}</div>
        </div>
    `).join('');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span style="margin-right: 8px;">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    `;

    document.body.appendChild(notification);
    requestAnimationFrame(() => notification.style.transform = 'translateX(0)');
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial render
    renderGames();
    renderLeaderboardPreview();
    
    // Check for demo unlocks
    achievementManager.checkUnlocks();

    // View toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            const grid = document.getElementById('games-grid');
            grid.classList.toggle('list-view', view === 'list');
        });
    });

    // Modal controls
    document.getElementById('close-game-modal').addEventListener('click', closeGameModal);
    document.getElementById('close-leaderboard').addEventListener('click', closeLeaderboard);
    document.getElementById('view-leaderboard-btn').addEventListener('click', () => openLeaderboard());
    document.getElementById('modal-overlay').addEventListener('click', () => {
        closeGameModal();
        closeLeaderboard();
    });

    // Time filter
    document.getElementById('time-filter').addEventListener('change', (e) => {
        const currentGame = document.querySelector('.game-modal.active')?.dataset?.gameId;
        if (currentGame) {
            renderLeaderboard(currentGame, e.target.value);
        }
    });

    // Listen for score submissions from games
    window.addEventListener('message', (e) => {
        if (e.data.type === 'gameScore') {
            const { gameId, score, duration } = e.data;
            scoreManager.submitScore(gameId, score, duration);
            renderGames();
            renderLeaderboardPreview();
            showNotification('Score saved!', 'success');
        }
    });

    // Demo: Add a test workout button (remove in production)
    if (location.search.includes('demo')) {
        const demoBtn = document.createElement('button');
        demoBtn.textContent = 'Demo: +1 Workout';
        demoBtn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; z-index: 9999; padding: 10px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;';
        demoBtn.onclick = () => {
            achievementManager.recordWorkout();
            renderGames();
            showNotification('Demo workout recorded!', 'success');
        };
        document.body.appendChild(demoBtn);
    }
});

// Export for game iframes
window.minigameAPI = {
    submitScore: (gameId, score, duration) => scoreManager.submitScore(gameId, score, duration),
    getBestScore: (gameId) => scoreManager.getBestScore(gameId),
    isUnlocked: (gameId) => achievementManager.isGameUnlocked(gameId)
};
