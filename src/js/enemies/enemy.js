/**
 * Enhanced Enemy Class
 * Improved enemy with better AI and movement patterns
 */

class Enemy {
    /**
     * Create a new enemy
     * @param {string} type - Enemy type
     * @param {number} wave - Current wave number
     * @param {Object} position - Spawn position {x, y}
     */
    constructor(type, wave = 1, position = null) {
        this.type = type;
        this.wave = wave;
        
        // Calculate stats based on wave
        const healthMultiplier = 1 + (wave - 1) * ENEMY_HEALTH_INCREASE_RATE;
        const damageMultiplier = 1 + (wave - 1) * ENEMY_DAMAGE_INCREASE_RATE;
        
        // Set base stats
        this.health = ENEMY_BASE_HEALTH * healthMultiplier;
        this.maxHealth = ENEMY_BASE_HEALTH * healthMultiplier;
        this.damage = ENEMY_BASE_DAMAGE * damageMultiplier;
        this.speed = ENEMY_BASE_SPEED;
        this.size = ENEMY_SIZE;
        
        // Set position (random outside screen if not provided)
        if (position) {
            this.x = position.x;
            this.y = position.y;
        } else {
            const pos = randomPositionOutsideScreen();
            this.x = pos.x;
            this.y = pos.y;
        }
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.acceleration = 5.0;
        this.maxSpeed = this.speed;
        this.pathUpdateTime = 0;
        this.pathUpdateInterval = 0.5; // Update path every 0.5 seconds
        
        // AI behavior
        this.behavior = this.getDefaultBehavior();
        this.targetPosition = null;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderRadius = 100;
        this.wanderDistance = 50;
        this.wanderJitter = 5.0;
        
        // State
        this.isAlive = true;
        this.target = null;
        this.xpValue = 10 + (wave - 1) * 2;
        
        // Visual effects
        this.hitEffect = 0;
        this.spawnEffect = 1.0;
        
        // Animation
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 0.15;
    }
    
    /**
     * Get default behavior based on enemy type
     * @returns {string} - Behavior type
     */
    getDefaultBehavior() {
        switch (this.type) {
            case 'basic':
                return 'seek'; // Direct path to player
            case 'fast':
                return 'intercept'; // Try to intercept player's movement
            case 'tank':
                return 'approach'; // Slow approach with pauses
            case 'boss':
                return 'complex'; // Mix of behaviors
            default:
                return 'seek';
        }
    }
    
    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Character} player - Player character
     */
    update(deltaTime, player) {
        if (!this.isAlive) return;
        
        // Update spawn effect
        if (this.spawnEffect > 0) {
            this.spawnEffect -= deltaTime * 2;
            if (this.spawnEffect < 0) this.spawnEffect = 0;
        }
        
        // Update hit effect
        if (this.hitEffect > 0) {
            this.hitEffect -= deltaTime * 3;
            if (this.hitEffect < 0) this.hitEffect = 0;
        }
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Set player as target
        this.target = player;
        
        // Update path to target
        this.pathUpdateTime += deltaTime;
        if (this.pathUpdateTime >= this.pathUpdateInterval) {
            this.updatePath(deltaTime);
            this.pathUpdateTime = 0;
        }
        
        // Move towards target
        if (this.target && this.target.isAlive) {
            this.moveTowardsTarget(deltaTime);
            
            // Check collision with player
            if (checkCollision(this, this.target)) {
                this.attack(this.target);
            }
        }
    }
    
    /**
     * Update enemy animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAnimation(deltaTime) {
        // Only animate if moving
        if (Math.abs(this.velocityX) > 0.1 || Math.abs(this.velocityY) > 0.1) {
            this.animationTime += deltaTime;
            if (this.animationTime >= this.animationSpeed) {
                this.animationTime = 0;
                this.animationFrame = (this.animationFrame + 1) % 4; // 4 frames of animation
            }
        } else {
            this.animationFrame = 0;
            this.animationTime = 0;
        }
    }
    
    /**
     * Update path to target based on behavior
     * @param {number} deltaTime - Time since last update in seconds
     */
    updatePath(deltaTime) {
        if (!this.target || !this.target.isAlive) return;
        
        switch (this.behavior) {
            case 'seek':
                // Direct path to player
                this.targetPosition = {
                    x: this.target.x,
                    y: this.target.y
                };
                break;
                
            case 'intercept':
                // Try to intercept player's movement
                const distToTarget = distance(
                    { x: this.x, y: this.y },
                    { x: this.target.x, y: this.target.y }
                );
                
                const interceptTime = distToTarget / this.maxSpeed;
                
                this.targetPosition = {
                    x: this.target.x + this.target.velocityX * this.target.maxSpeed * interceptTime,
                    y: this.target.y + this.target.velocityY * this.target.maxSpeed * interceptTime
                };
                break;
                
            case 'approach':
                // Approach with pauses
                const dist = distance(
                    { x: this.x, y: this.y },
                    { x: this.target.x, y: this.target.y }
                );
                
                if (dist < 200 && Math.random() < 0.3) {
                    // Occasionally pause when close
                    this.targetPosition = {
                        x: this.x,
                        y: this.y
                    };
                } else {
                    this.targetPosition = {
                        x: this.target.x,
                        y: this.target.y
                    };
                }
                break;
                
            case 'wander':
                // Random wandering behavior
                this.wanderAngle += (Math.random() * 2 - 1) * this.wanderJitter;
                
                const wanderX = Math.cos(this.wanderAngle) * this.wanderRadius;
                const wanderY = Math.sin(this.wanderAngle) * this.wanderRadius;
                
                this.targetPosition = {
                    x: this.x + this.velocityX * this.wanderDistance + wanderX,
                    y: this.y + this.velocityY * this.wanderDistance + wanderY
                };
                break;
                
            case 'complex':
                // Mix of behaviors based on distance
                const distToPlayer = distance(
                    { x: this.x, y: this.y },
                    { x: this.target.x, y: this.target.y }
                );
                
                if (distToPlayer > 300) {
                    // Far away - intercept
                    const interceptTime = distToPlayer / this.maxSpeed;
                    
                    this.targetPosition = {
                        x: this.target.x + this.target.velocityX * this.target.maxSpeed * interceptTime,
                        y: this.target.y + this.target.velocityY * this.target.maxSpeed * interceptTime
                    };
                } else if (distToPlayer > 100) {
                    // Medium distance - direct approach
                    this.targetPosition = {
                        x: this.target.x,
                        y: this.target.y
                    };
                } else {
                    // Close - circle around player
                    const circleAngle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
                    const newAngle = circleAngle + Math.PI / 8; // Rotate around player
                    
                    this.targetPosition = {
                        x: this.target.x + Math.cos(newAngle) * 100,
                        y: this.target.y + Math.sin(newAngle) * 100
                    };
                }
                break;
                
            default:
                // Default to direct path
                this.targetPosition = {
                    x: this.target.x,
                    y: this.target.y
                };
        }
    }
    
    /**
     * Move towards target position
     * @param {number} deltaTime - Time since last update in seconds
     */
    moveTowardsTarget(deltaTime) {
        if (!this.targetPosition) return;
        
        // Calculate direction to target
        const dx = this.targetPosition.x - this.x;
        const dy = this.targetPosition.y - this.y;
        
        // Calculate distance to target
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        
        if (distToTarget > 5) { // Only move if not very close to target
            // Normalize direction
            const dirX = dx / distToTarget;
            const dirY = dy / distToTarget;
            
            // Apply acceleration
            this.velocityX += dirX * this.acceleration * deltaTime;
            this.velocityY += dirY * this.acceleration * deltaTime;
            
            // Limit speed
            const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            if (currentSpeed > this.maxSpeed) {
                this.velocityX = (this.velocityX / currentSpeed) * this.maxSpeed;
                this.velocityY = (this.velocityY / currentSpeed) * this.maxSpeed;
            }
        } else {
            // Slow down when reaching target
            this.velocityX *= 0.9;
            this.velocityY *= 0.9;
        }
        
        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    /**
     * Attack the target
     * @param {Character} target - Target to attack
     */
    attack(target) {
        target.takeDamage(this.damage);
        
        // Emit attack event
        eventEmitter.emit('enemy:attack', {
            enemy: this,
            target: target,
            damage: this.damage
        });
    }
    
    /**
     * Take damage
     * @param {number} amount - Amount of damage
     */
    takeDamage(amount) {
        this.health -= amount;
        
        // Visual feedback
        this.hitEffect = 1.0;
        
        // Emit damage event
        eventEmitter.emit('enemy:damage', {
            enemy: this,
            damage: amount,
            remainingHealth: this.health
        });
        
        // Check if dead
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Die
     */
    die() {
        this.isAlive = false;
        
        // Emit death event
        eventEmitter.emit('enemy:death', {
            enemy: this,
            xpValue: this.xpValue
        });
    }
    
    /**
     * Draw the enemy
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Save context
        ctx.save();
        
        // Apply spawn effect (grow from nothing)
        let scale = 1;
        if (this.spawnEffect > 0) {
            scale = 1 - this.spawnEffect;
            ctx.globalAlpha = 1 - this.spawnEffect * 0.5;
        }
        
        // Apply hit effect (flash white when taking damage)
        if (this.hitEffect > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitEffect})`;
        } else {
            ctx.fillStyle = this.getEnemyColor();
        }
        
        // Draw enemy with scale
        ctx.beginPath();
        ctx.arc(this.x, this.y, (this.size / 2) * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator if moving
        if (Math.abs(this.velocityX) > 0.1 || Math.abs(this.velocityY) > 0.1) {
            const length = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const dirX = this.velocityX / length;
            const dirY = this.velocityY / length;
            
            const indicatorX = this.x + dirX * (this.size / 2) * scale;
            const indicatorY = this.y + dirY * (this.size / 2) * scale;
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(indicatorX, indicatorY, (this.size / 6) * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw health bar
        const healthBarWidth = this.size * scale;
        const healthBarHeight = 3 * scale;
        const healthBarX = this.x - (healthBarWidth / 2);
        const healthBarY = this.y - (this.size / 2) * scale - 8 * scale;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Restore context
        ctx.restore();
    }
    
    /**
     * Get enemy color based on type
     * @returns {string} - CSS color
     */
    getEnemyColor() {
        switch (this.type) {
            case 'basic':
                return '#aa3333';
            case 'fast':
                return '#33aa33';
            case 'tank':
                return '#3333aa';
            case 'boss':
                return '#aa33aa';
            default:
                return '#aa3333';
        }
    }
}

// Enemy factory
class EnemyFactory {
    /**
     * Create an enemy of the specified type
     * @param {string} type - Enemy type
     * @param {number} wave - Current wave number
     * @param {Object} position - Spawn position {x, y}
     * @returns {Enemy} - New enemy instance
     */
    static createEnemy(type, wave = 1, position = null) {
        const enemy = new Enemy(type, wave, position);
        
        // Modify stats based on type
        switch (type) {
            case 'fast':
                enemy.health *= 0.7;
                enemy.maxHealth *= 0.7;
                enemy.damage *= 0.8;
                enemy.speed *= 1.5;
                enemy.maxSpeed *= 1.5;
                enemy.size *= 0.8;
                enemy.acceleration *= 1.5;
                break;
            case 'tank':
                enemy.health *= 2;
                enemy.maxHealth *= 2;
                enemy.damage *= 0.7;
                enemy.speed *= 0.7;
                enemy.maxSpeed *= 0.7;
                enemy.size *= 1.3;
                enemy.acceleration *= 0.7;
                break;
            case 'boss':
                enemy.health *= 5;
                enemy.maxHealth *= 5;
                enemy.damage *= 2;
                enemy.speed *= 0.5;
                enemy.maxSpeed *= 0.5;
                enemy.size *= 2;
                enemy.xpValue *= 5;
                enemy.acceleration *= 0.5;
                break;
        }
        
        return enemy;
    }
    
    /**
     * Create a random enemy
     * @param {number} wave - Current wave number
     * @returns {Enemy} - New enemy instance
     */
    static createRandomEnemy(wave) {
        let types = ['basic'];
        
        // Unlock more enemy types as waves progress
        if (wave >= 3) types.push('fast');
        if (wave >= 5) types.push('tank');
        if (wave >= 10 && wave % 5 === 0) return this.createEnemy('boss', wave);
        
        const randomType = types[Math.floor(Math.random() * types.length)];
        return this.createEnemy(randomType, wave);
    }
    
    /**
     * Create multiple enemies in a wave
     * @param {number} count - Number of enemies to create
     * @param {number} wave - Current wave number
     * @returns {Array} - Array of new enemy instances
     */
    static createEnemyWave(count, wave) {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            // Create enemies at different spawn points around the screen
            const spawnPoint = this.getSpawnPoint(i, count);
            enemies.push(this.createRandomEnemy(wave, spawnPoint));
        }
        
        return enemies;
    }
    
    /**
     * Get a spawn point around the screen
     * @param {number} index - Spawn point index
     * @param {number} total - Total number of spawn points
     * @returns {Object} - Spawn position {x, y}
     */
    static getSpawnPoint(index, total) {
        // Distribute spawn points evenly around the screen
        const angle = (index / total) * Math.PI * 2;
        const distance = 100 + Math.random() * 200; // Random distance from screen edge
        
        // Calculate position relative to screen center
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        const maxDist = Math.max(GAME_WIDTH, GAME_HEIGHT) / 2 + distance;
        
        return {
            x: centerX + Math.cos(angle) * maxDist,
            y: centerY + Math.sin(angle) * maxDist
        };
    }
}
