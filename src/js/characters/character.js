/**
 * Character Class
 * Base class for all player characters (Weavers)
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
            size: stats.size || PLAYER_SIZE
        };
        
        // Position
        this.x = GAME_WIDTH / 2;
        this.y = GAME_HEIGHT / 2;
        
        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        
        // Combat
        this.lastAttackTime = 0;
        this.abilities = [];
        this.passives = [];
        
        // State
        this.isAlive = true;
        this.direction = { x: 0, y: 1 }; // Facing down by default
    }
    
    /**
     * Update character state
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Array} enemies - Array of enemies
     */
    update(deltaTime, enemies) {
        if (!this.isAlive) return;
        
        // Move character
        this.x += this.velocityX * this.stats.speed;
        this.y += this.velocityY * this.stats.speed;
        
        // Keep character within bounds
        this.x = clamp(this.x, 0, GAME_WIDTH);
        this.y = clamp(this.y, 0, GAME_HEIGHT);
        
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
        
        this.velocityX = x;
        this.velocityY = y;
        
        // Update facing direction if moving
        if (x !== 0 || y !== 0) {
            this.direction = { x, y };
        }
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
        
        // Draw character
        ctx.fillStyle = this.getCharacterColor();
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
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 0.8
                });
            case CHARACTER_TYPES.MAGE:
                return new Character(type, {
                    health: PLAYER_BASE_HEALTH * 0.8,
                    maxHealth: PLAYER_BASE_HEALTH * 0.8,
                    damage: PLAYER_BASE_DAMAGE * 1.5,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 0.7,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.5
                });
            case CHARACTER_TYPES.RANGER:
                return new Character(type, {
                    health: PLAYER_BASE_HEALTH * 0.9,
                    maxHealth: PLAYER_BASE_HEALTH * 0.9,
                    damage: PLAYER_BASE_DAMAGE * 0.9,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 1.5,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.2
                });
            default:
                return new Character(CHARACTER_TYPES.WARRIOR);
        }
    }
}
