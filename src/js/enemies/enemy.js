/**
 * Enemy Class
 * Base class for all enemies
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
        
        // State
        this.isAlive = true;
        this.target = null;
        this.xpValue = 10 + (wave - 1) * 2;
    }
    
    /**
     * Update enemy state
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Character} player - Player character
     */
    update(deltaTime, player) {
        if (!this.isAlive) return;
        
        // Set player as target
        this.target = player;
        
        // Move towards target
        if (this.target && this.target.isAlive) {
            const angle = calculateAngle(
                { x: this.x, y: this.y },
                { x: this.target.x, y: this.target.y }
            );
            
            const direction = getDirectionFromAngle(angle);
            
            this.x += direction.x * this.speed;
            this.y += direction.y * this.speed;
            
            // Check collision with player
            if (checkCollision(this, this.target)) {
                this.attack(this.target);
            }
        }
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
        
        // Draw enemy
        ctx.fillStyle = this.getEnemyColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar
        const healthBarWidth = this.size;
        const healthBarHeight = 3;
        const healthBarX = this.x - healthBarWidth / 2;
        const healthBarY = this.y - this.size / 2 - 8;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
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
                enemy.size *= 0.8;
                break;
            case 'tank':
                enemy.health *= 2;
                enemy.maxHealth *= 2;
                enemy.damage *= 0.7;
                enemy.speed *= 0.7;
                enemy.size *= 1.3;
                break;
            case 'boss':
                enemy.health *= 5;
                enemy.maxHealth *= 5;
                enemy.damage *= 2;
                enemy.speed *= 0.5;
                enemy.size *= 2;
                enemy.xpValue *= 5;
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
}
