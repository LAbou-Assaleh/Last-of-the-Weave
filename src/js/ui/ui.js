/**
 * UI Class
 * Handles all user interface elements and interactions
 */

class UI {
    /**
     * Create a new UI instance
     * @param {Game} game - Game instance
     */
    constructor(game) {
        this.game = game;
        
        // Get UI elements
        this.healthBar = document.getElementById('health-bar');
        this.xpBar = document.getElementById('xp-bar');
        this.waveCounter = document.getElementById('wave-counter');
        this.timeCounter = document.getElementById('time-counter');
        this.upgradePanel = document.getElementById('upgrade-panel');
        this.upgradeOptions = document.getElementById('upgrade-options');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.scoreSummary = document.getElementById('score-summary');
        this.restartButton = document.getElementById('restart-button');
        this.startScreen = document.getElementById('start-screen');
        this.characterOptions = document.getElementById('character-options');
        this.startButton = document.getElementById('start-button');
        
        // Initialize UI
        this.init();
    }
    
    /**
     * Initialize UI
     */
    init() {
        // Set up event listeners
        this.restartButton.addEventListener('click', () => {
            this.hideGameOverScreen();
            this.showStartScreen();
        });
        
        this.startButton.addEventListener('click', () => {
            const selectedCharacter = document.querySelector('.character-option.selected');
            if (selectedCharacter) {
                const characterType = selectedCharacter.dataset.type;
                this.hideStartScreen();
                this.game.startGame(characterType);
            } else {
                alert('Please select a character');
            }
        });
        
        // Set up character selection
        this.populateCharacterSelection();
        
        // Subscribe to game events
        eventEmitter.on('player:damage', (data) => {
            this.updateHealthBar(data.player);
        });
        
        eventEmitter.on('player:experience', (data) => {
            this.updateXPBar(data.player);
        });
        
        eventEmitter.on('player:levelUp', (data) => {
            this.showUpgradePanel();
        });
        
        eventEmitter.on('player:death', (data) => {
            this.showGameOverScreen();
        });
        
        eventEmitter.on('wave:start', (data) => {
            this.updateWaveCounter(data.wave);
        });
        
        eventEmitter.on('game:timeUpdate', (data) => {
            this.updateTimeCounter(data.time);
        });
    }
    
    /**
     * Populate character selection
     */
    populateCharacterSelection() {
        const characterTypes = [
            { type: CHARACTER_TYPES.WARRIOR, name: 'Warrior', description: 'High health and damage, slow attack speed' },
            { type: CHARACTER_TYPES.MAGE, name: 'Mage', description: 'Low health, high damage and range' },
            { type: CHARACTER_TYPES.RANGER, name: 'Ranger', description: 'Medium health, fast attack speed' }
        ];
        
        this.characterOptions.innerHTML = '';
        
        characterTypes.forEach(character => {
            const element = document.createElement('div');
            element.className = 'character-option';
            element.dataset.type = character.type;
            
            element.innerHTML = `
                <div class="character-icon ${character.type}"></div>
                <h3>${character.name}</h3>
                <p>${character.description}</p>
            `;
            
            element.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('.character-option').forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                element.classList.add('selected');
            });
            
            this.characterOptions.appendChild(element);
        });
        
        // Select first character by default
        this.characterOptions.firstChild.classList.add('selected');
    }
    
    /**
     * Update health bar
     * @param {Character} player - Player character
     */
    updateHealthBar(player) {
        const healthPercentage = player.stats.health / player.stats.maxHealth * 100;
        this.healthBar.style.width = `${healthPercentage}%`;
        
        // Change color based on health
        if (healthPercentage < 25) {
            this.healthBar.style.backgroundColor = '#ff0000';
        } else if (healthPercentage < 50) {
            this.healthBar.style.backgroundColor = '#ffaa00';
        } else {
            this.healthBar.style.backgroundColor = '#ff3333';
        }
    }
    
    /**
     * Update XP bar
     * @param {Character} player - Player character
     */
    updateXPBar(player) {
        const xpPercentage = player.experience / player.experienceToNextLevel * 100;
        this.xpBar.style.width = `${xpPercentage}%`;
    }
    
    /**
     * Update wave counter
     * @param {number} wave - Current wave
     */
    updateWaveCounter(wave) {
        this.waveCounter.textContent = `Wave: ${wave}`;
    }
    
    /**
     * Update time counter
     * @param {number} time - Current time in seconds
     */
    updateTimeCounter(time) {
        this.timeCounter.textContent = `Time: ${formatTime(time)}`;
    }
    
    /**
     * Show upgrade panel
     */
    showUpgradePanel() {
        // Pause game
        this.game.pause();
        
        // Generate upgrade options
        const abilities = AbilityFactory.createRandomAbilities(this.game.player, UPGRADES_PER_LEVEL);
        
        this.upgradeOptions.innerHTML = '';
        
        abilities.forEach(ability => {
            const element = document.createElement('div');
            element.className = 'upgrade-option';
            
            element.innerHTML = `
                <h3>${ability.name}</h3>
                <p>${ability.getDescription()}</p>
            `;
            
            element.addEventListener('click', () => {
                this.game.player.addAbility(ability);
                this.hideUpgradePanel();
                this.game.resume();
            });
            
            this.upgradeOptions.appendChild(element);
        });
        
        // Show panel
        this.upgradePanel.classList.remove('hidden');
    }
    
    /**
     * Hide upgrade panel
     */
    hideUpgradePanel() {
        this.upgradePanel.classList.add('hidden');
    }
    
    /**
     * Show game over screen
     */
    showGameOverScreen() {
        // Generate score summary
        const stats = this.game.getStats();
        
        this.scoreSummary.innerHTML = `
            <p>Time Survived: ${formatTime(stats.timeSurvived)}</p>
            <p>Waves Completed: ${stats.wavesCompleted}</p>
            <p>Enemies Defeated: ${stats.enemiesDefeated}</p>
            <p>Level Reached: ${stats.levelReached}</p>
        `;
        
        // Show screen
        this.gameOverScreen.classList.remove('hidden');
    }
    
    /**
     * Hide game over screen
     */
    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    /**
     * Show start screen
     */
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
    }
    
    /**
     * Hide start screen
     */
    hideStartScreen() {
        this.startScreen.classList.add('hidden');
    }
}
