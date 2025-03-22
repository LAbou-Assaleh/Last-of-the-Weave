/**
 * Game Class
 * Main game logic and state management
 */

class Game {
    /**
     * Create a new game instance
     */
    constructor() {
        // Game state
        this.state = GAME_STATES.MENU;
        this.isPaused = false;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.areas = [];
        
        // Game stats
        this.stats = {
            timeSurvived: 0,
            wavesCompleted: 0,
            enemiesDefeated: 0,
            levelReached: 1
        };
        
        // Wave management
        this.currentWave = 0;
        this.waveTimer = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnRate = ENEMY_SPAWN_RATE;
        
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game systems
        this.timeManager = new TimeManager(FPS);
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.resizeHandler = new ResizeHandler(this.canvas, this);
        this.debugRenderer = new DebugRenderer(this);
        this.attackAnimations = new AttackAnimationManager();
        this.enemyAttackEffects = new EnemyAttackEffects(this.attackAnimations);
        this.damageEffects = new DamageEffects(this.attackAnimations);
        
        // UI
        this.ui = new UI(this);
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize game
     */
    init() {
        // Set up event listeners
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Debug controls
            if (e.key === 'F1') {
                this.debugRenderer.toggle();
                e.preventDefault();
            } else if (e.key === 'F2') {
                this.debugRenderer.toggleOption('showColliders');
                e.preventDefault();
            } else if (e.key === 'F3') {
                this.debugRenderer.toggleOption('showGrid');
                e.preventDefault();
            } else if (e.key === 'F4') {
                this.debugRenderer.toggleOption('showSpawnPoints');
                e.preventDefault();
            } else if (e.key === ' ' && this.player) {
                // Space bar for dash
                this.player.dash();
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            // Convert to world coordinates if camera exists
            if (this.camera) {
                const worldCoords = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
                this.mouse.worldX = worldCoords.x;
                this.mouse.worldY = worldCoords.y;
            }
        });
        
        // Set up world bounds
        const worldSize = 2000;
        this.worldBounds = {
            minX: -worldSize / 2,
            minY: -worldSize / 2,
            maxX: worldSize / 2,
            maxY: worldSize / 2
        };
        
        // Set camera bounds
        this.camera.setBounds(
            this.worldBounds.minX,
            this.worldBounds.minY,
            this.worldBounds.maxX,
            this.worldBounds.maxY
        );
        
        // Subscribe to events
        eventEmitter.on('enemy:death', (data) => {
            this.stats.enemiesDefeated++;
            
            if (this.player && this.player.isAlive) {
                this.player.gainExperience(data.xpValue);
            }
        });
        
        eventEmitter.on('player:levelUp', (data) => {
            this.stats.levelReached = data.level;
        });
        
        eventEmitter.on('projectiles:created', (data) => {
            this.projectiles.push(...data.projectiles);
        });
        
        eventEmitter.on('area:created', (data) => {
            this.areas.push(data.area);
        });
        
        eventEmitter.on('canvas:resize', (data) => {
            // Update camera dimensions
            if (this.camera) {
                this.camera.width = data.width;
                this.camera.height = data.height;
            }
        });
        
        // New event listeners for dash
        eventEmitter.on('player:dashStart', (data) => {
            // Visual or audio feedback for dash start
            console.log('Dash started');
        });
        
        eventEmitter.on('player:dashEnd', (data) => {
            // Visual or audio feedback for dash end
            console.log('Dash ended');
        });
    }
    
    /**
     * Start a new game
     * @param {string} characterType - Character type from CHARACTER_TYPES
     */
    startGame(characterType) {
        // Reset game state
        this.state = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.enemies = [];
        this.projectiles = [];
        this.areas = [];
        this.gameTime = 0;
        
        // Reset stats
        this.stats = {
            timeSurvived: 0,
            wavesCompleted: 0,
            enemiesDefeated: 0,
            levelReached: 1
        };
        
        // Reset time manager
        this.timeManager.reset();
        
        // Create player
        this.player = CharacterFactory.createCharacter(characterType);
        
        // Set camera target to player
        this.camera.setTarget(this.player);
        
        // Start first wave
        this.startWave(1);
        
        // Start game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    /**
     * Start a new wave
     * @param {number} waveNumber - Wave number
     */
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveTimer = WAVE_DURATION;
        this.enemySpawnRate = ENEMY_SPAWN_RATE * (1 + (waveNumber - 1) * ENEMY_SPAWN_INCREASE_RATE);
        
        // Emit wave start event
        eventEmitter.emit('wave:start', {
            wave: waveNumber
        });
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp
     */
    gameLoop(timestamp) {
        // Update time manager
        const deltaTime = this.timeManager.update(timestamp);
        
        // Update game if not paused
        if (this.state === GAME_STATES.PLAYING && !this.isPaused) {
            this.update(deltaTime);
        }
        
        // Draw game
        this.draw();
        
        // Continue loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update game time
        this.gameTime += deltaTime;
        this.stats.timeSurvived = this.gameTime;
        
        // Emit time update event
        eventEmitter.emit('game:timeUpdate', {
            time: this.gameTime
        });
        
        // Update player
        if (this.player && this.player.isAlive) {
            // Handle player movement
            this.handlePlayerInput();
            
            // Update player
            this.player.update(deltaTime, this.enemies, this.worldBounds);
        }
        
        // Update camera
        if (this.camera && this.player && this.player.isAlive) {
            this.camera.update(deltaTime);
        }
        
        // Update wave
        this.updateWave(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update projectiles
        this.updateProjectiles(deltaTime);
        
        // Update areas
        this.updateAreas(deltaTime);
        
        // Update attack animations
        this.attackAnimations.update(deltaTime);
        
        // Check for game over
        if (this.player && !this.player.isAlive && this.state !== GAME_STATES.GAME_OVER) {
            this.state = GAME_STATES.GAME_OVER;
        }
    }
    
    /**
     * Handle player input
     */
    handlePlayerInput() {
        // Movement
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys['w'] || this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['s'] || this.keys['ArrowDown']) moveY += 1;
        if (this.keys['a'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['d'] || this.keys['ArrowRight']) moveX += 1;
        
        this.player.setMovement(moveX, moveY);
    }
    
    /**
     * Update wave state
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateWave(deltaTime) {
        // Update wave timer
        this.waveTimer -= deltaTime;
        
        // Spawn enemies
        this.enemySpawnTimer -= deltaTime;
        if (this.enemySpawnTimer <= 0) {
            this.spawnEnemy();
            this.enemySpawnTimer = 1 / this.enemySpawnRate;
        }
        
        // Check if wave is over
        if (this.waveTimer <= 0) {
            this.waveTimer = 0;
            this.startWave(this.currentWave + 1);
            this.stats.wavesCompleted++;
        }
    }
    
    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        // Calculate spawn position outside of camera view
        const spawnDistance = 100; // Distance outside of camera view
        const angle = Math.random() * Math.PI * 2;
        
        const spawnX = this.player.x + Math.cos(angle) * (this.camera.width / this.camera.scale / 2 + spawnDistance);
        const spawnY = this.player.y + Math.sin(angle) * (this.camera.height / this.camera.scale / 2 + spawnDistance);
        
        // Create enemy
        const enemy = EnemyFactory.createEnemy(this.currentWave, spawnX, spawnY);
        this.enemies.push(enemy);
    }
    
    /**
     * Update enemies
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.update(deltaTime, this.player, this.worldBounds);
            }
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive && enemy.deathTimer <= 0) {
                return false;
            }
            return true;
        });
    }
    
    /**
     * Update projectiles
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateProjectiles(deltaTime) {
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
        });
        
        // Remove expired projectiles
        this.projectiles = this.projectiles.filter(projectile => !projectile.isExpired);
    }
    
    /**
     * Update areas
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAreas(deltaTime) {
        this.areas.forEach(area => {
            area.update(deltaTime);
        });
        
        // Remove expired areas
        this.areas = this.areas.filter(area => !area.isExpired);
    }
    
    /**
     * Draw game
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transformation
        this.camera.apply(this.ctx);
        
        // Draw game world
        this.drawWorld();
        
        // Draw game objects
        this.drawGameObjects();
        
        // Restore camera transformation
        this.camera.restore(this.ctx);
        
        // Draw UI
        this.ui.draw(this.ctx);
        
        // Draw debug info
        this.debugRenderer.draw(this.ctx);
    }
    
    /**
     * Draw game world
     */
    drawWorld() {
        // Draw grid
        const gridSize = 100;
        const gridExtent = 1000;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Only draw grid if debug renderer is showing grid
        if (this.debugRenderer.options.showGrid) {
            for (let x = -gridExtent; x <= gridExtent; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, -gridExtent);
                this.ctx.lineTo(x, gridExtent);
                this.ctx.stroke();
            }
            
            for (let y = -gridExtent; y <= gridExtent; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(-gridExtent, y);
                this.ctx.lineTo(gridExtent, y);
                this.ctx.stroke();
            }
        }
        
        // Draw world bounds
        if (this.debugRenderer.options.showColliders) {
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.worldBounds.minX,
                this.worldBounds.minY,
                this.worldBounds.maxX - this.worldBounds.minX,
                this.worldBounds.maxY - this.worldBounds.minY
            );
        }
    }
    
    /**
     * Draw game objects
     */
    drawGameObjects() {
        // Draw areas
        this.areas.forEach(area => {
            area.draw(this.ctx);
        });
        
        // Draw projectiles
        this.projectiles.forEach(projectile => {
            projectile.draw(this.ctx);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            if (this.camera.isVisible(enemy)) {
                enemy.draw(this.ctx);
            }
        });
        
        // Draw player
        if (this.player && this.player.isAlive) {
            this.player.draw(this.ctx);
        }
        
        // Draw attack animations
        this.attackAnimations.draw(this.ctx);
    }
    
    /**
     * Pause game
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * Resume game
     */
    resume() {
        this.isPaused = false;
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }
}
