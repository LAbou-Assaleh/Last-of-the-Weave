/**
 * Enhanced Character Class
 * Improved player character with smooth movement and collision handling
 */

class Character {
    /**
     * Create a new character
     * @param {string} type - Character type from CHARACTER_TYPES
     * @param {Object} stats - Character stats
     */
    constructor(type, stats = {}) {
        this.type = type;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = PLAYER_XP_TO_LEVEL;
        
        // Set base stats with defaults
        this.stats = {
            health: stats.health || PLAYER_BASE_HEALTH,
            maxHealth: stats.maxHealth || PLAYER_BASE_HEALTH,
            damage: stats.damage || PLAYER_BASE_DAMAGE,
            attackSpeed: stats.attackSpeed || PLAYER_BASE_ATTACK_SPEED,
            attackRange: stats.attackRange || PLAYER_BASE_ATTACK_RANGE,
            pickupRange: stats.pickupRange || PLAYER_BASE_PICKUP_RANGE,
            speed: stats.speed || PLAYER_SPEED,
            size: stats.size || PLAYER_SIZE,
            acceleration: stats.acceleration || 8.0,  // New: acceleration rate
            deceleration: stats.deceleration || 12.0  // New: deceleration rate
        };
        
        // Position
        this.x = GAME_WIDTH / 2;
        this.y = GAME_HEIGHT / 2;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetVelocityX = 0;  // New: target velocity for smooth movement
        this.targetVelocityY = 0;  // New: target velocity for smooth movement
        this.maxSpeed = this.stats.speed;
        
        // Combat
        this.lastAttackTime = 0;
        this.abilities = [];
        this.passives = [];
        
        // State
        this.isAlive = true;
        this.direction = { x: 0, y: 1 }; // Facing down by default
        this.isMoving = false;
        
        // Visual feedback
        this.dashEffect = 0;  // For movement visual effect
        this.hitEffect = 0;   // For damage visual effect
        
        // Animation
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 0.1;
    }
    
    /**
     * Update character state
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Array} enemies - Array of enemies
     * @param {Object} worldBounds - World boundaries
     */
    update(deltaTime, enemies, worldBounds = null) {
        if (!this.isAlive) return;
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Update movement with smooth acceleration/deceleration
        this.updateMovement(deltaTime, worldBounds);
        
        // Update visual effects
        this.updateEffects(deltaTime);
        
        // Auto-attack nearest enemy
        this.autoAttack(enemies, deltaTime);
        
        // Update abilities
        this.abilities.forEach(ability => {
            if (ability.isReady()) {
                ability.use(this, enemies);
            }
            ability.update(deltaTime);
        });
    }
    
    /**
     * Update character animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAnimation(deltaTime) {
        // Only animate if moving
        if (this.isMoving) {
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
     * Update character movement with smooth acceleration/deceleration
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Object} worldBounds - World boundaries
     */
    updateMovement(deltaTime, worldBounds) {
        // Apply acceleration/deceleration to reach target velocity
        const accelRate = this.isMoving ? this.stats.acceleration : this.stats.deceleration;
        
        // X velocity
        const diffX = this.targetVelocityX - this.velocityX;
        this.velocityX += diffX * Math.min(accelRate * deltaTime, 1.0);
        
        // Y velocity
        const diffY = this.targetVelocityY - this.velocityY;
        this.velocityY += diffY * Math.min(accelRate * deltaTime, 1.0);
        
        // Apply velocity
        const prevX = this.x;
        const prevY = this.y;
        
        this.x += this.velocityX * this.maxSpeed * deltaTime;
        this.y += this.velocityY * this.maxSpeed * deltaTime;
        
        // Check if actually moving
        this.isMoving = Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01;
        
        // Update facing direction if moving
        if (this.isMoving) {
            // Only update direction if there's significant movement
            if (Math.abs(this.velocityX) > 0.1 || Math.abs(this.velocityY) > 0.1) {
                this.direction = {
                    x: this.velocityX,
                    y: this.velocityY
                };
                
                // Normalize direction
                const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
                if (length > 0) {
                    this.direction.x /= length;
                    this.direction.y /= length;
                }
            }
            
            // Add dash effect when starting to move
            if (Math.abs(prevX - this.x) > 0.5 || Math.abs(prevY - this.y) > 0.5) {
                this.dashEffect = 0.5;
            }
        }
        
        // Apply world boundaries if provided
        if (worldBounds) {
            const radius = this.stats.size / 2;
            
            if (this.x - radius < worldBounds.minX) {
                this.x = worldBounds.minX + radius;
                this.velocityX = 0;
            } else if (this.x + radius > worldBounds.maxX) {
                this.x = worldBounds.maxX - radius;
                this.velocityX = 0;
            }
            
            if (this.y - radius < worldBounds.minY) {
                this.y = worldBounds.minY + radius;
                this.velocityY = 0;
            } else if (this.y + radius > worldBounds.maxY) {
                this.y = worldBounds.maxY - radius;
                this.velocityY = 0;
            }
        }
    }
    
    /**
     * Update visual effects
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateEffects(deltaTime) {
        // Update dash effect
        if (this.dashEffect > 0) {
            this.dashEffect -= deltaTime * 2;
            if (this.dashEffect < 0) this.dashEffect = 0;
        }
        
        // Update hit effect
        if (this.hitEffect > 0) {
            this.hitEffect -= deltaTime * 3;
            if (this.hitEffect < 0) this.hitEffect = 0;
        }
    }
    
    /**
     * Set movement direction
     * @param {number} x - Horizontal direction (-1, 0, 1)
     * @param {number} y - Vertical direction (-1, 0, 1)
     */
    setMovement(x, y) {
        // Normalize if moving diagonally
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        this.targetVelocityX = x;
        this.targetVelocityY = y;
    }
    
    /**
     * Auto-attack the nearest enemy
     * @param {Array} enemies - Array of enemies
     * @param {number} deltaTime - Time since last update in seconds
     */
    autoAttack(enemies, deltaTime) {
        const currentTime = performance.now();
        const attackCooldown = 1000 / this.stats.attackSpeed;
        
        // Check if attack is ready
        if (currentTime - this.lastAttackTime < attackCooldown) {
            return;
        }
        
        // Find nearest enemy within range
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            const dist = distance({ x: this.x, y: this.y }, { x: enemy.x, y: enemy.y });
            if (dist <= this.stats.attackRange && dist < nearestDistance) {
                nearestEnemy = enemy;
                nearestDistance = dist;
            }
        });
        
        // Attack if enemy found
        if (nearestEnemy) {
            this.attack(nearestEnemy);
            this.lastAttackTime = currentTime;
        }
    }
    
    /**
     * Attack an enemy
     * @param {Enemy} enemy - Enemy to attack
     */
    attack(enemy) {
        enemy.takeDamage(this.stats.damage);
        
        // Emit attack event
        eventEmitter.emit('player:attack', {
            player: this,
            target: enemy,
            damage: this.stats.damage
        });
    }
    
    /**
     * Take damage
     * @param {number} amount - Amount of damage
     */
    takeDamage(amount) {
        this.stats.health -= amount;
        
        // Visual feedback
        this.hitEffect = 1.0;
        
        // Emit damage event
        eventEmitter.emit('player:damage', {
            player: this,
            damage: amount,
            remainingHealth: this.stats.health
        });
        
        // Check if dead
        if (this.stats.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Die
     */
    die() {
        this.isAlive = false;
        
        // Emit death event
        eventEmitter.emit('player:death', {
            player: this
        });
    }
    
    /**
     * Gain experience
     * @param {number} amount - Amount of experience
     */
    gainExperience(amount) {
        this.experience += amount;
        
        // Emit experience event
        eventEmitter.emit('player:experience', {
            player: this,
            amount: amount,
            total: this.experience
        });
        
        // Check for level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
        }
    }
    
    /**
     * Level up
     */
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        
        // Increase experience required for next level
        this.experienceToNextLevel = Math.floor(PLAYER_XP_TO_LEVEL * (1 + 0.1 * this.level));
        
        // Increase stats
        this.stats.maxHealth += Math.floor(this.stats.maxHealth * 0.1);
        this.stats.health = this.stats.maxHealth; // Heal to full on level up
        this.stats.damage += Math.floor(this.stats.damage * 0.1);
        
        // Emit level up event
        eventEmitter.emit('player:levelUp', {
            player: this,
            level: this.level
        });
    }
    
    /**
     * Add an ability
     * @param {Ability} ability - Ability to add
     */
    addAbility(ability) {
        if (ability.type === ABILITY_TYPES.ACTIVE) {
            this.abilities.push(ability);
        } else {
            this.passives.push(ability);
            ability.apply(this);
        }
        
        // Emit ability added event
        eventEmitter.emit('player:abilityAdded', {
            player: this,
            ability: ability
        });
    }
    
    /**
     * Draw the character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Save context
        ctx.save();
        
        // Draw dash effect (motion trail)
        if (this.dashEffect > 0) {
            ctx.globalAlpha = this.dashEffect * 0.3;
            ctx.fillStyle = this.getCharacterColor();
            
            // Draw trail in opposite direction of movement
            const trailX = this.x - this.velocityX * this.stats.size;
            const trailY = this.y - this.velocityY * this.stats.size;
            
            ctx.beginPath();
            ctx.arc(trailX, trailY, this.stats.size / 2 * (0.7 + this.dashEffect * 0.3), 0, Math.PI * 2);
            ctx.fill();
            
            // Reset alpha
            ctx.globalAlpha = 1.0;
        }
        
        // Apply hit effect (flash white when taking damage)
        if (this.hitEffect > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitEffect})`;
        } else {
            ctx.fillStyle = this.getCharacterColor();
        }
        
        // Draw character body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        const dirX = this.x + this.direction.x * (this.stats.size / 2);
        const dirY = this.y + this.direction.y * (this.stats.size / 2);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dirX, dirY, this.stats.size / 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        const healthBarWidth = this.stats.size;
        const healthBarHeight = 4;
        const healthBarX = this.x - healthBarWidth / 2;
        const healthBarY = this.y - this.stats.size / 2 - 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        const healthPercentage = this.stats.health / this.stats.maxHealth;
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
        
        // Restore context
        ctx.restore();
    }
    
    /**
     * Get character color based on type
     * @returns {string} - CSS color
     */
    getCharacterColor() {
        switch (this.type) {
            case CHARACTER_TYPES.WARRIOR:
                return '#ff5555';
            case CHARACTER_TYPES.MAGE:
                return '#5555ff';
            case CHARACTER_TYPES.RANGER:
                return '#55ff55';
            default:
                return '#ffffff';
        }
    }
}

// Character factory
class CharacterFactory {
    /**
     * Create a character of the specified type
     * @param {string} type - Character type from CHARACTER_TYPES
     * @returns {Character} - New character instance
     */
    static createCharacter(type) {
        switch (type) {
            case CHARACTER_TYPES.WARRIOR:
                return new Character(type, {
                    health: PLAYER_BASE_HEALTH * 1.2,
                    maxHealth: PLAYER_BASE_HEALTH * 1.2,
                    damage: PLAYER_BASE_DAMAGE * 1.2,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 0.8,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 0.8,
                    acceleration: 10.0,  // Faster acceleration for warrior
                    deceleration: 8.0    // Slower deceleration for warrior
                });
            case CHARACTER_TYPES.MAGE:
                return new Character(type, {
                    health: PLAYER_BASE_HEALTH * 0.8,
                    maxHealth: PLAYER_BASE_HEALTH * 0.8,
                    damage: PLAYER_BASE_DAMAGE * 1.5,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 0.7,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.5,
                    acceleration: 7.0,   // Slower acceleration for mage
                    deceleration: 14.0   // Faster deceleration for mage
                });
            case CHARACTER_TYPES.RANGER:
                return new Character(type, {
                    health: PLAYER_BASE_HEALTH * 0.9,
                    maxHealth: PLAYER_BASE_HEALTH * 0.9,
                    damage: PLAYER_BASE_DAMAGE * 0.9,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 1.5,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.2,
                    acceleration: 12.0,  // Fastest acceleration for ranger
                    deceleration: 12.0   // Balanced deceleration for ranger
                });
            default:
                return new Character(CHARACTER_TYPES.WARRIOR);
        }
    }
}
