// ===================================
// DATA DETECTIVE GAME - JAVASCRIPT
// ===================================

// Game State
const gameState = {
    dataPoints: 0,
    totalDataPoints: 12,
    score: 0,
    startTime: null,
    timerInterval: null,
    collectedIds: new Set(),
    achievements: []
};

// Achievement Definitions
const achievements = [
    { id: 'first_find', name: 'First Discovery', desc: 'Found your first data point!', trigger: 1 },
    { id: 'halfway', name: 'Halfway There', desc: 'Collected 6 data points!', trigger: 6 },
    { id: 'speed_demon', name: 'Speed Demon', desc: 'Completed in under 2 minutes!', trigger: 'time' },
    { id: 'puzzle_master', name: 'Puzzle Master', desc: 'Solved the data pipeline!', trigger: 'puzzle' },
    { id: 'completionist', name: 'Data Master', desc: 'Found all data points!', trigger: 12 }
];

// DOM Elements
const elements = {
    gameModal: document.getElementById('gameModal'),
    startGame: document.getElementById('startGame'),
    victoryModal: document.getElementById('victoryModal'),
    playAgain: document.getElementById('playAgain'),
    resetGame: document.getElementById('resetGame'),
    dataPointsDisplay: document.getElementById('dataPoints'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    achievementToast: document.getElementById('achievementToast'),
    achievementTitle: document.getElementById('achievementTitle'),
    achievementDesc: document.getElementById('achievementDesc'),
    puzzleContainer: document.getElementById('puzzleContainer'),
    checkPuzzle: document.getElementById('checkPuzzle'),
    puzzleReward: document.getElementById('puzzleReward')
};

// Initialize Game
function initGame() {
    // Show welcome modal
    elements.gameModal.classList.remove('hidden');
    
    // Add event listeners
    elements.startGame.addEventListener('click', startGame);
    elements.playAgain.addEventListener('click', resetGame);
    elements.resetGame.addEventListener('click', resetGame);
    elements.checkPuzzle.addEventListener('click', checkPuzzle);
    
    // Setup data points
    setupDataPoints();
    
    // Setup puzzle drag and drop
    setupPuzzle();
    
    // Setup scroll animations
    setupScrollAnimations();
}

// Start Game
function startGame() {
    elements.gameModal.classList.add('hidden');
    gameState.startTime = Date.now();
    
    // Start timer
    gameState.timerInterval = setInterval(updateTimer, 100);
    
    // Show all hidden data points with animation
    document.querySelectorAll('.hidden-data-point').forEach((point, index) => {
        setTimeout(() => {
            point.style.animation = 'pulse 2s ease-in-out infinite';
        }, index * 100);
    });
}

// Setup Data Points
function setupDataPoints() {
    const dataPoints = document.querySelectorAll('.hidden-data-point, .floating-data-point');
    
    dataPoints.forEach(point => {
        point.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const value = parseInt(this.getAttribute('data-value'));
            
            if (!gameState.collectedIds.has(id)) {
                collectDataPoint(id, value, this);
            }
        });
    });
}

// Collect Data Point
function collectDataPoint(id, value, element) {
    // Mark as collected
    gameState.collectedIds.add(id);
    gameState.dataPoints++;
    gameState.score += value;
    
    // Update displays
    updateHUD();
    
    // Animate collection
    element.classList.add('collected');
    
    // Play sound effect (visual feedback)
    createParticleExplosion(element);
    
    // Check for achievements
    checkAchievements();
    
    // Remove element after animation
    setTimeout(() => {
        element.style.display = 'none';
    }, 800);
    
    // Check for victory
    if (gameState.dataPoints >= gameState.totalDataPoints) {
        setTimeout(showVictory, 1000);
    }
}

// Create Particle Explosion
function createParticleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.borderRadius = '50%';
        particle.style.background = 'linear-gradient(135deg, #ffd700, #e67e22)';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 150 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        animateParticle(particle, vx, vy);
    }
}

// Animate Particle
function animateParticle(particle, vx, vy) {
    let x = 0, y = 0;
    let opacity = 1;
    const gravity = 500;
    let startTime = Date.now();
    
    function update() {
        const elapsed = (Date.now() - startTime) / 1000;
        
        x = vx * elapsed;
        y = vy * elapsed + 0.5 * gravity * elapsed * elapsed;
        opacity = Math.max(0, 1 - elapsed * 2);
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(update);
        } else {
            particle.remove();
        }
    }
    
    requestAnimationFrame(update);
}

// Update HUD
function updateHUD() {
    elements.dataPointsDisplay.textContent = `${gameState.dataPoints} / ${gameState.totalDataPoints}`;
    elements.scoreDisplay.textContent = gameState.score;
}

// Update Timer
function updateTimer() {
    if (!gameState.startTime) return;
    
    const elapsed = Date.now() - gameState.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    elements.timerDisplay.textContent = 
        `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Check Achievements
function checkAchievements() {
    achievements.forEach(achievement => {
        if (gameState.achievements.includes(achievement.id)) return;
        
        let unlocked = false;
        
        if (typeof achievement.trigger === 'number' && 
            gameState.dataPoints === achievement.trigger) {
            unlocked = true;
        }
        
        if (unlocked) {
            gameState.achievements.push(achievement.id);
            showAchievement(achievement);
            gameState.score += 50; // Bonus points
            updateHUD();
        }
    });
}

// Show Achievement
function showAchievement(achievement) {
    elements.achievementTitle.textContent = achievement.name;
    elements.achievementDesc.textContent = achievement.desc;
    elements.achievementToast.classList.add('show');
    
    setTimeout(() => {
        elements.achievementToast.classList.remove('show');
    }, 3000);
}

// Setup Puzzle
function setupPuzzle() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    let draggedElement = null;
    
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', function(e) {
            draggedElement = this;
            setTimeout(() => this.style.opacity = '0.5', 0);
        });
        
        piece.addEventListener('dragend', function() {
            setTimeout(() => this.style.opacity = '1', 0);
            draggedElement = null;
        });
        
        piece.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        piece.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedElement !== this) {
                // Swap elements
                const parent = this.parentNode;
                const nextSibling = this.nextSibling;
                
                if (nextSibling === draggedElement) {
                    parent.insertBefore(draggedElement, this);
                } else {
                    parent.insertBefore(draggedElement, this);
                    parent.insertBefore(this, nextSibling);
                }
            }
        });
    });
}

// Check Puzzle
function checkPuzzle() {
    const pieces = Array.from(document.querySelectorAll('.puzzle-piece'));
    const currentOrder = pieces.map(piece => parseInt(piece.getAttribute('data-order')));
    const correctOrder = [1, 2, 3, 4];
    
    const isCorrect = currentOrder.every((val, index) => val === correctOrder[index]);
    
    if (isCorrect) {
        // Puzzle solved!
        pieces.forEach(piece => piece.classList.add('correct'));
        
        // Show reward
        const reward = elements.puzzleReward;
        reward.style.display = 'flex';
        reward.style.animation = 'bounceIn 1s ease-out';
        
        // Unlock achievement
        const achievement = achievements.find(a => a.id === 'puzzle_master');
        if (achievement && !gameState.achievements.includes(achievement.id)) {
            gameState.achievements.push(achievement.id);
            showAchievement(achievement);
            gameState.score += 50;
        }
        
        // Collect puzzle reward
        setTimeout(() => {
            if (!gameState.collectedIds.has('10')) {
                collectDataPoint('10', 250, reward);
            }
        }, 1000);
        
        elements.checkPuzzle.disabled = true;
        elements.checkPuzzle.textContent = '✅ Solved!';
        elements.checkPuzzle.style.background = '#27ae60';
    } else {
        // Wrong order - shake animation
        elements.puzzleContainer.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            elements.puzzleContainer.style.animation = '';
        }, 500);
        
        // Show hint
        alert('❌ Not quite right! Hint: Think about the data analysis workflow from start to finish.');
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Show Victory
function showVictory() {
    clearInterval(gameState.timerInterval);
    
    // Calculate final time
    const elapsed = Date.now() - gameState.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Check speed achievement
    if (seconds < 120) {
        const achievement = achievements.find(a => a.id === 'speed_demon');
        if (achievement && !gameState.achievements.includes(achievement.id)) {
            gameState.achievements.push(achievement.id);
            gameState.score += 100;
        }
    }
    
    // Check completionist achievement
    const achievement = achievements.find(a => a.id === 'completionist');
    if (achievement && !gameState.achievements.includes(achievement.id)) {
        gameState.achievements.push(achievement.id);
        gameState.score += 200;
    }
    
    // Update victory modal
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalTime').textContent = timeString;
    document.getElementById('achievements').textContent = gameState.achievements.length;
    
    // Victory message based on performance
    let message = '';
    if (seconds < 60) {
        message = '🏆 LEGENDARY! Lightning-fast detective work!';
    } else if (seconds < 120) {
        message = '⭐ EXCELLENT! Outstanding speed and precision!';
    } else if (seconds < 180) {
        message = '👏 GREAT JOB! Well done, detective!';
    } else {
        message = '✅ MISSION COMPLETE! Nice work finding all the data!';
    }
    
    document.getElementById('victoryMessage').textContent = message;
    
    // Show victory modal
    elements.victoryModal.classList.remove('hidden');
}

// Reset Game
function resetGame() {
    // Reset state
    gameState.dataPoints = 0;
    gameState.score = 0;
    gameState.startTime = null;
    gameState.collectedIds.clear();
    gameState.achievements = [];
    
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Reset displays
    updateHUD();
    elements.timerDisplay.textContent = '0:00';
    
    // Reset all data points
    document.querySelectorAll('.hidden-data-point, .floating-data-point').forEach(point => {
        point.style.display = 'flex';
        point.classList.remove('collected');
        point.style.animation = '';
    });
    
    // Reset puzzle
    const pieces = Array.from(document.querySelectorAll('.puzzle-piece'));
    pieces.forEach(piece => {
        piece.classList.remove('correct');
    });
    elements.checkPuzzle.disabled = false;
    elements.checkPuzzle.textContent = 'Check Answer';
    elements.checkPuzzle.style.background = '';
    elements.puzzleReward.style.display = 'none';
    
    // Hide victory modal and show start modal
    elements.victoryModal.classList.add('hidden');
    elements.gameModal.classList.remove('hidden');
}

// Setup Scroll Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Skill Tag Interactions
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    
    // Add hover effects to skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Make project card interactive
    const projectCard = document.getElementById('projectCard');
    if (projectCard) {
        projectCard.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    }
    
    // Hero name interaction
    const heroName = document.getElementById('heroName');
    if (heroName) {
        heroName.addEventListener('click', function() {
            this.style.animation = 'glow 0.5s ease-out';
            setTimeout(() => {
                this.style.animation = 'glow 2s ease-in-out infinite alternate';
            }, 500);
        });
    }
    
    // Add ripple effect to contact links
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.querySelector('.hidden-data-point')) {
                e.preventDefault();
            }
        });
    });
});

// Easter Egg: Konami Code
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-8);
    
    if (konamiCode.join(',') === konamiPattern.join(',')) {
        gameState.score += 500;
        updateHUD();
        showAchievement({
            id: 'konami',
            name: '🎮 Konami Master!',
            desc: 'You found the secret code!'
        });
    }
});

// Console Easter Egg
console.log('%c🎮 DATA DETECTIVE GAME', 'color: #ffd700; font-size: 24px; font-weight: bold;');
console.log('%cLooking at the console? You\'re a true detective! 🔍', 'color: #e67e22; font-size: 14px;');
console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → for a secret bonus! 🎯', 'color: #1a3a2e; font-size: 12px;');
