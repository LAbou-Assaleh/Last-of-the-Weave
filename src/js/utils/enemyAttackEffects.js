/**
 * Enemy-specific attack animations
 * Additional animations for enemy attacks
 */

// Extend the AttackAnimationManager with more enemy-specific animations
class EnemyAttackEffects {
    /**
     * Initialize enemy attack effects
     * @param {AttackAnimationManager} animationManager - The main animation manager
     */
    constructor(animationManager) {
        this.animationManager = animationManager;
        
        // Register additional enemy attack event listeners
        eventEmitter.on('enemy:spawn', (data) => {
            this.createSpawnAnimation(data.enemy);
        });
        
        eventEmitter.on('enemy:prepare', (data) => {
            this.createPrepareAnimation(data.enemy, data.target);
        });
    }
    
    /**
     * Create a spawn animation for an enemy
     * @param {Enemy} enemy - The enemy that spawned
     */
    createSpawnAnimation(enemy) {
        const animation = new EnemySpawnAnimation(enemy);
        this.animationManager.animations.push(animation);
    }
    
    /**
     * Create a preparation animation for an enemy attack
     * @param {Enemy} enemy - The enemy preparing to attack
     * @param {Character} target - The target of the attack
     */
    createPrepareAnimation(enemy, target) {
        // Different preparation animations based on enemy type
        switch (enemy.type) {
            case 'tank':
                const animation = new EnemyPrepareAnimation(enemy, target, 0.8, '#3333aa');
                this.animationManager.animations.push(animation);
                break;
            case 'boss':
                const bossAnimation = new BossPrepareAnimation(enemy, target, 1.2, '#aa33aa');
                this.animationManager.animations.push(bossAnimation);
                break;
        }
    }
}

/**
 * Enemy Spawn Animation
 * Visual effect when an enemy spawns
 */
class EnemySpawnAnimation extends Animation {
    /**
     * Create a new enemy spawn animation
     * @param {Enemy} enemy - The enemy that spawned
     */
    constructor(enemy) {
        super(0.5);
        this.enemy = enemy;
        this.color = this.getColorForEnemyType(enemy.type);
        this.rings = [];
        
        // Create rings
        const ringCount = 2;
        for (let i = 0; i < ringCount; i++) {
            this.rings.push({
                radius: enemy.size * (1.5 + i * 0.5),
                thickness: 3 - i
            });
        }
    }
    
    /**
     * Get color based on enemy type
     * @param {string} type - Enemy type
     * @returns {string} - Color for the enemy type
     */
    getColorForEnemyType(type) {
        switch (type) {
            case 'basic': return '#aa3333';
            case 'fast': return '#33aa33';
            case 'tank': return '#3333aa';
            case 'boss': return '#aa33aa';
            default: return '#aa3333';
        }
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getEasedProgress();
        
        // Draw contracting rings
        this.rings.forEach((ring, index) => {
            const ringProgress = Math.max(0, Math.min(1, progress * 2 - index * 0.5));
            const currentRadius = ring.radius * (1 - ringProgress);
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = ring.thickness;
            ctx.globalAlpha = 1 - ringProgress;
            
            ctx.beginPath();
            ctx.arc(
                this.enemy.x,
                this.enemy.y,
                currentRadius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        });
        
        // Draw enemy glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3 * (1 - progress);
        
        ctx.beginPath();
        ctx.arc(
            this.enemy.x,
            this.enemy.y,
            this.enemy.size * 1.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Enemy Prepare Animation
 * Visual effect when an enemy is preparing to attack
 */
class EnemyPrepareAnimation extends Animation {
    /**
     * Create a new enemy prepare animation
     * @param {Enemy} enemy - The enemy preparing to attack
     * @param {Character} target - The target of the attack
     * @param {number} duration - Animation duration
     * @param {string} color - Animation color
     */
    constructor(enemy, target, duration = 0.8, color = '#3333aa') {
        super(duration);
        this.enemy = enemy;
        this.target = target;
        this.color = color;
        this.pulseCount = 3;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Calculate pulse effect
        const pulsePhase = (progress * this.pulseCount) % 1;
        const pulseSize = 0.2 + 0.8 * Math.sin(pulsePhase * Math.PI);
        
        // Draw warning indicator
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7 * (1 - progress);
        
        // Draw pulsing circle around enemy
        ctx.beginPath();
        ctx.arc(
            this.enemy.x,
            this.enemy.y,
            this.enemy.size * (1 + pulseSize * 0.5),
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Draw direction indicator
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            const startX = this.enemy.x + dirX * this.enemy.size;
            const startY = this.enemy.y + dirY * this.enemy.size;
            const endX = this.enemy.x + dirX * this.enemy.size * (1 + pulseSize);
            const endY = this.enemy.y + dirY * this.enemy.size * (1 + pulseSize);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Boss Prepare Animation
 * Special visual effect when a boss enemy is preparing to attack
 */
class BossPrepareAnimation extends Animation {
    /**
     * Create a new boss prepare animation
     * @param {Enemy} enemy - The boss enemy preparing to attack
     * @param {Character} target - The target of the attack
     * @param {number} duration - Animation duration
     * @param {string} color - Animation color
     */
    constructor(enemy, target, duration = 1.2, color = '#aa33aa') {
        super(duration);
        this.enemy = enemy;
        this.target = target;
        this.color = color;
        this.warningRadius = 100;
        this.particles = [];
        
        // Create particles
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                speed: 50 + Math.random() * 30,
                size: 3 + Math.random() * 2
            });
        }
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update particles
        this.particles.forEach(particle => {
            particle.angle += deltaTime * particle.speed / 100;
        });
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Draw warning area
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.1 + 0.1 * Math.sin(progress * Math.PI * 10);
        
        ctx.beginPath();
        ctx.arc(
            this.enemy.x,
            this.enemy.y,
            this.warningRadius * progress,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw warning border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        
        ctx.beginPath();
        ctx.arc(
            this.enemy.x,
            this.enemy.y,
            this.warningRadius * progress,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Draw orbiting particles
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.8;
        
        this.particles.forEach(particle => {
            const distance = this.enemy.size + (this.warningRadius - this.enemy.size) * progress * 0.7;
            const x = this.enemy.x + Math.cos(particle.angle) * distance;
            const y = this.enemy.y + Math.sin(particle.angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw target indicator
        if (this.target && progress > 0.5) {
            const targetProgress = (progress - 0.5) * 2;
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = targetProgress;
            
            // Draw target crosshair
            const crosshairSize = 15;
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(this.target.x - crosshairSize, this.target.y);
            ctx.lineTo(this.target.x + crosshairSize, this.target.y);
            ctx.stroke();
            
            // Vertical line
            ctx.beginPath();
            ctx.moveTo(this.target.x, this.target.y - crosshairSize);
            ctx.lineTo(this.target.x, this.target.y + crosshairSize);
            ctx.stroke();
            
            // Circle
            ctx.beginPath();
            ctx.arc(
                this.target.x,
                this.target.y,
                crosshairSize * 1.5,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}
