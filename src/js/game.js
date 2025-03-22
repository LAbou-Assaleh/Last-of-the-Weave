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
            this.player.update(deltaTime, this.enemies);
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
        
        // Check if wave is complete
        if (this.waveTimer <= 0) {
            this.completeWave();
        }
    }
    
    /**
     * Spawn a new enemy
     */
    spawnEnemy() {
        const enemy = EnemyFactory.createRandomEnemy(this.currentWave);
        this.enemies.push(enemy);
    }
    
    /**
     * Complete current wave and start next
     */
    completeWave() {
        this.stats.wavesCompleted++;
        this.startWave(this.currentWave + 1);
    }
    
    /**
     * Update enemies
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.player);
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.isAlive);
    }
    
    /**
     * Update projectiles
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateProjectiles(deltaTime) {
        this.projectiles.forEach(projectile => {
            // Move projectile
            projectile.x += projectile.directionX * projectile.speed;
            projectile.y += projectile.directionY * projectile.speed;
            
            // Update distance traveled
            const distanceMoved = projectile.speed * deltaTime;
            projectile.distanceTraveled += distanceMoved;
            
            // Check for collisions with enemies
            this.enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
                
                const dist = distance(
                    { x: projectile.x, y: projectile.y },
                    { x: enemy.x, y: enemy.y }
                );
                
                if (dist <= (projectile.size + enemy.size) / 2) {
                    enemy.takeDamage(projectile.damage);
                    
                    // Remove projectile if not piercing
                    if (!projectile.piercing) {
                        projectile.distanceTraveled = projectile.range + 1; // Mark for removal
                    }
                }
            });
        });
        
        // Remove projectiles that have traveled their range
        this.projectiles = this.projectiles.filter(projectile => {
            return projectile.distanceTraveled < projectile.range;
        });
    }
    
    /**
     * Update area effects
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAreas(deltaTime) {
        this.areas.forEach(area => {
            // Check if area is still active
            const elapsedTime = (performance.now() - area.startTime) / 1000;
            if (elapsedTime >= area.duration) {
                area.active = false;
            }
        });
        
        // Remove inactive areas
        this.areas = this.areas.filter(area => area.active);
    }
    
    /**
     * Draw game
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transformation
        if (this.camera) {
            this.camera.apply(this.ctx);
        }
        
        // Draw background
        this.drawBackground();
        
        // Draw areas
        this.drawAreas();
        
        // Draw projectiles
        this.drawProjectiles();
        
        // Draw enemies
        this.drawEnemies();
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx);
        }
        
        // Draw attack animations
        if (this.attackAnimations) {
            this.attackAnimations.draw(this.ctx);
        }
        
        // Restore camera transformation
        if (this.camera) {
            this.camera.restore(this.ctx);
        }
        
        // Draw debug information
        if (this.debugRenderer) {
            this.debugRenderer.render(this.ctx, this.timeManager, this.camera);
        }
    }
    
    /**
     * Draw background
     */
    drawBackground() {
        // Draw world background
        this.ctx.fillStyle = '#1a1a1a';
        
        if (this.camera) {
            // Draw only the visible area
            this.ctx.fillRect(
                this.camera.x,
                this.camera.y,
                this.camera.width / this.camera.scale,
                this.camera.height / this.camera.scale
            );
            
            // Draw grid if not handled by debug renderer
            if (!this.debugRenderer || !this.debugRenderer.isEnabled || !this.debugRenderer.options.showGrid) {
                this.drawGrid();
            }
        } else {
            // Draw full canvas
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.drawGrid();
        }
    }
    
    /**
     * Draw grid
     */
    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        // Calculate grid boundaries based on camera position
        let startX, startY, endX, endY;
        
        if (this.camera) {
            startX = Math.floor(this.camera.x / gridSize) * gridSize;
            startY = Math.floor(this.camera.y / gridSize) * gridSize;
            endX = this.camera.x + (this.camera.width / this.camera.scale) + gridSize;
            endY = this.camera.y + (this.camera.height / this.camera.scale) + gridSize;
        } else {
            startX = 0;
            startY = 0;
            endX = this.canvas.width;
            endY = this.canvas.height;
        }
        
        // Draw vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw enemies
     */
    drawEnemies() {
        this.enemies.forEach(enemy => {
            // Only draw if visible in camera
            if (!this.camera || this.camera.isVisible(enemy)) {
                enemy.draw(this.ctx);
            }
        });
    }
    
    /**
     * Draw projectiles
     */
    drawProjectiles() {
        this.projectiles.forEach(projectile => {
            // Only draw if visible in camera
            if (!this.camera || this.camera.isVisible(projectile)) {
                this.ctx.fillStyle = this.getElementColor(projectile.element || ELEMENT_TYPES.PHYSICAL);
                this.ctx.beginPath();
                this.ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    /**
     * Draw area effects
     */
    drawAreas() {
        this.areas.forEach(area => {
            // Only draw if visible in camera
            if (!this.camera || this.camera.isVisible({
                x: area.x,
                y: area.y,
                size: area.radius * 2
            })) {
                const elapsedTime = (performance.now() - area.startTime) / 1000;
                const progress = elapsedTime / area.duration;
                const alpha = 1 - progress;
                
                this.ctx.fillStyle = this.getElementColor(area.element || ELEMENT_TYPES.PHYSICAL, alpha * 0.3);
                this.ctx.beginPath();
                this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = this.getElementColor(area.element || ELEMENT_TYPES.PHYSICAL, alpha);
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(area.x, area.y, area.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    /**
     * Get color for element type
     * @param {string} element - Element type
     * @param {number} alpha - Alpha value (0-1)
     * @returns {string} - CSS color
     */
    getElementColor(element, alpha = 1) {
        let color;
        
        switch (element) {
            case ELEMENT_TYPES.FIRE:
                color = `rgba(255, 100, 0, ${alpha})`;
                break;
            case ELEMENT_TYPES.ICE:
                color = `rgba(0, 200, 255, ${alpha})`;
                break;
            case ELEMENT_TYPES.LIGHTNING:
                color = `rgba(255, 255, 0, ${alpha})`;
                break;
            case ELEMENT_TYPES.ARCANE:
                color = `rgba(200, 0, 255, ${alpha})`;
                break;
            case ELEMENT_TYPES.PHYSICAL:
            default:
                color = `rgba(200, 200, 200, ${alpha})`;
                break;
        }
        
        return color;
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
        this.timeManager.reset();
    }
    
    /**
     * Get game stats
     * @returns {Object} - Game stats
     */
    getStats() {
        return this.stats;
    }
}
