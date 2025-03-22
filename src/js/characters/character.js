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
        this.momentum = { x: 0, y: 0 }; // New: momentum for physics-based movement
        
        // Dash ability
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashCooldown = 0;
        this.dashDirection = { x: 0, y: 0 };
        
        // Movement trail
        this.movementTrail = new MovementTrail(15, 0.6);
        
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
        
        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
            if (this.dashCooldown < 0) this.dashCooldown = 0;
        }
        
        // Update dash state
        if (this.isDashing) {
            this.updateDash(deltaTime);
        }
        
        // Update movement with smooth acceleration/deceleration
        this.updateMovement(deltaTime, worldBounds);
        
        // Update movement trail
        this.updateMovementTrail(deltaTime);
        
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
     * Update dash state
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateDash(deltaTime) {
        this.dashDuration -= deltaTime;
        
        if (this.dashDuration <= 0) {
            // End dash
            this.isDashing = false;
            this.maxSpeed = this.stats.speed;
            
            // Apply momentum after dash
            this.momentum.x = this.dashDirection.x * PLAYER_MOMENTUM_FACTOR;
            this.momentum.y = this.dashDirection.y * PLAYER_MOMENTUM_FACTOR;
            
            // Emit dash end event
            eventEmitter.emit('player:dashEnd', {
                player: this
            });
        }
    }
    
    /**
     * Update movement trail
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateMovementTrail(deltaTime) {
        // Update existing trail points
        this.movementTrail.update(deltaTime);
        
        // Add new trail point if moving fast enough or dashing
        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        if (speed > 0.5 || this.isDashing) {
            const trailSize = this.isDashing ? this.stats.size * 0.7 : this.stats.size * 0.4;
            const trailColor = this.isDashing ? '#88ccff' : '#ffffff';
            const trailAlpha = this.isDashing ? 0.8 : 0.5;
            
            this.movementTrail.addTrailPoint(
                this.x, 
                this.y, 
                trailSize, 
                trailColor, 
                trailAlpha
            );
        }
    }
    
    /**
     * Update character movement with smooth acceleration/deceleration
     * @param {number} deltaTime - Time since last update in seconds
     * @param {Object} worldBounds - World boundaries
     */
    updateMovement(deltaTime, worldBounds) {
        // If dashing, use dash direction instead of input
        if (this.isDashing) {
            this.velocityX = this.dashDirection.x;
            this.velocityY = this.dashDirection.y;
        } else {
            // Apply acceleration/deceleration to reach target velocity
            const accelRate = this.isMoving ? this.stats.acceleration : this.stats.deceleration;
            
            // Apply momentum to target velocity
            let targetX = this.targetVelocityX + this.momentum.x;
            let targetY = this.targetVelocityY + this.momentum.y;
            
            // X velocity
            const diffX = targetX - this.velocityX;
            this.velocityX += diffX * Math.min(accelRate * deltaTime, 1.0);
            
            // Y velocity
            const diffY = targetY - this.velocityY;
            this.velocityY += diffY * Math.min(accelRate * deltaTime, 1.0);
            
            // Apply friction to momentum
            this.momentum.x *= (1 - PLAYER_FRICTION);
            this.momentum.y *= (1 - PLAYER_FRICTION);
            
            // Reset momentum if very small
            if (Math.abs(this.momentum.x) < 0.01) this.momentum.x = 0;
            if (Math.abs(this.momentum.y) < 0.01) this.momentum.y = 0;
        }
        
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
                this.momentum.x = 0;
            } else if (this.x + radius > worldBounds.maxX) {
                this.x = worldBounds.maxX - radius;
                this.velocityX = 0;
                this.momentum.x = 0;
            }
            
            if (this.y - radius < worldBounds.minY) {
                this.y = worldBounds.minY + radius;
                this.velocityY = 0;
                this.momentum.y = 0;
            } else if (this.y + radius > worldBounds.maxY) {
                this.y = worldBounds.maxY - radius;
                this.velocityY = 0;
                this.momentum.y = 0;
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
     * Perform a dash in the current movement direction
     * @returns {boolean} - Whether the dash was successful
     */
    dash() {
        // Check if dash is on cooldown
        if (this.dashCooldown > 0 || this.isDashing) {
            return false;
        }
        
        // Need a direction to dash in
        if (!this.isMoving && (this.targetVelocityX === 0 && this.targetVelocityY === 0)) {
            // Use facing direction if not moving
            if (this.direction.x === 0 && this.direction.y === 0) {
                return false;
            }
            
            this.dashDirection = {
                x: this.direction.x,
                y: this.direction.y
            };
        } else {
            // Use current movement direction
            const length = Math.sqrt(
                this.targetVelocityX * this.targetVelocityX + 
                this.targetVelocityY * this.targetVelocityY
            );
            
            if (length === 0) return false;
            
            this.dashDirection = {
                x: this.targetVelocityX / length,
                y: this.targetVelocityY / length
            };
        }
        
        // Start dash
        this.isDashing = true;
        this.dashDuration = PLAYER_DASH_DURATION;
        this.dashCooldown = PLAYER_DASH_COOLDOWN;
        this.maxSpeed = this.stats.speed * PLAYER_DASH_SPEED;
        this.dashEffect = 1.0;
        
        // Emit dash start event
        eventEmitter.emit('player:dashStart', {
            player: this,
            direction: this.dashDirection
        });
        
        return true;
    }
    
    /**
     * Draw the character's movement trail
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    drawMovementTrail(ctx) {
        this.movementTrail.draw(ctx);
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
        
        // Emit experience gain event
        eventEmitter.emit('player:experienceGain', {
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
        this.experienceToNextLevel = Math.floor(PLAYER_XP_TO_LEVEL * (1 + this.level * 0.5));
        
        // Heal on level up
        this.stats.health = this.stats.maxHealth;
        
        // Emit level up event
        eventEmitter.emit('player:levelUp', {
            player: this,
            level: this.level
        });
    }
    
    /**
     * Draw the character
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw movement trail first (behind character)
        this.drawMovementTrail(ctx);
        
        ctx.save();
        
        // Apply hit effect (red flash)
        if (this.hitEffect > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.hitEffect * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.size * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Apply dash effect (blue trail)
        if (this.dashEffect > 0 || this.isDashing) {
            const dashAlpha = this.isDashing ? 0.7 : this.dashEffect * 0.7;
            const dashSize = this.isDashing ? this.stats.size * 1.5 : this.stats.size * (1 + this.dashEffect * 0.5);
            
            ctx.fillStyle = `rgba(100, 200, 255, ${dashAlpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, dashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw character
        ctx.fillStyle = this.type === CHARACTER_TYPES.WARRIOR ? '#ff5555' : 
                        this.type === CHARACTER_TYPES.MAGE ? '#5555ff' : 
                        this.type === CHARACTER_TYPES.RANGER ? '#55ff55' : '#ffffff';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw direction indicator
        ctx.fillStyle = '#ffffff';
        const indicatorX = this.x + this.direction.x * (this.stats.size / 2);
        const indicatorY = this.y + this.direction.y * (this.stats.size / 2);
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, this.stats.size / 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw dash cooldown indicator if on cooldown
        if (this.dashCooldown > 0) {
            const cooldownRatio = this.dashCooldown / PLAYER_DASH_COOLDOWN;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * (1 - cooldownRatio));
            
            ctx.strokeStyle = '#88ccff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.size / 2 + 5, startAngle, endAngle);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}
