/**
 * AttackAnimationManager Class
 * Handles visual animations for attacks in the game
 */

class AttackAnimationManager {
    /**
     * Create a new attack animation manager
     */
    constructor() {
        this.animations = [];
        
        // Register event listeners
        eventEmitter.on('player:attack', (data) => {
            this.createPlayerAttackAnimation(data.player, data.target, data.damage);
        });
        
        eventEmitter.on('enemy:attack', (data) => {
            this.createEnemyAttackAnimation(data.enemy, data.target, data.damage);
        });
        
        eventEmitter.on('player:damage', (data) => {
            this.createDamageAnimation(data.player, data.damage);
        });
        
        eventEmitter.on('enemy:damage', (data) => {
            this.createDamageAnimation(data.enemy, data.damage);
        });
    }
    
    /**
     * Update all active animations
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update all animations and remove completed ones
        this.animations = this.animations.filter(animation => {
            animation.update(deltaTime);
            return !animation.isComplete;
        });
    }
    
    /**
     * Draw all active animations
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw all animations
        this.animations.forEach(animation => {
            animation.draw(ctx);
        });
    }
    
    /**
     * Create a player attack animation
     * @param {Character} player - Player character
     * @param {Enemy} target - Target enemy
     * @param {number} damage - Damage amount
     */
    createPlayerAttackAnimation(player, target, damage) {
        // Create different animations based on character type
        switch (player.type) {
            case CHARACTER_TYPES.WARRIOR:
                this.createMeleeSlashAnimation(player, target, damage, '#ff5555');
                break;
            case CHARACTER_TYPES.MAGE:
                this.createMagicBurstAnimation(player, target, damage, '#5555ff');
                break;
            case CHARACTER_TYPES.RANGER:
                this.createRangedShotAnimation(player, target, damage, '#55ff55');
                break;
            default:
                this.createBasicAttackAnimation(player, target, damage, '#ffffff');
        }
        
        // Create damage number animation
        this.createDamageNumberAnimation(target, damage);
    }
    
    /**
     * Create an enemy attack animation
     * @param {Enemy} enemy - Enemy character
     * @param {Character} target - Target player
     * @param {number} damage - Damage amount
     */
    createEnemyAttackAnimation(enemy, target, damage) {
        // Create different animations based on enemy type
        switch (enemy.type) {
            case 'basic':
                this.createBasicAttackAnimation(enemy, target, damage, '#aa3333');
                break;
            case 'fast':
                this.createQuickStrikeAnimation(enemy, target, damage, '#33aa33');
                break;
            case 'tank':
                this.createHeavyAttackAnimation(enemy, target, damage, '#3333aa');
                break;
            case 'boss':
                this.createBossAttackAnimation(enemy, target, damage, '#aa33aa');
                break;
            default:
                this.createBasicAttackAnimation(enemy, target, damage, '#aa3333');
        }
        
        // Create damage number animation
        this.createDamageNumberAnimation(target, damage);
    }
    
    /**
     * Create a damage visual effect
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    createDamageAnimation(target, damage) {
        // Create impact effect
        this.createImpactAnimation(target, damage);
    }
    
    /**
     * Create a basic attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createBasicAttackAnimation(source, target, damage, color) {
        const animation = new BasicAttackAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a melee slash animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createMeleeSlashAnimation(source, target, damage, color) {
        const animation = new MeleeSlashAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a magic burst animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createMagicBurstAnimation(source, target, damage, color) {
        const animation = new MagicBurstAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a ranged shot animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createRangedShotAnimation(source, target, damage, color) {
        const animation = new RangedShotAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a quick strike animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createQuickStrikeAnimation(source, target, damage, color) {
        const animation = new QuickStrikeAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a heavy attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createHeavyAttackAnimation(source, target, damage, color) {
        const animation = new HeavyAttackAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create a boss attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    createBossAttackAnimation(source, target, damage, color) {
        const animation = new BossAttackAnimation(source, target, damage, color);
        this.animations.push(animation);
    }
    
    /**
     * Create an impact animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    createImpactAnimation(target, damage) {
        const animation = new ImpactAnimation(target, damage);
        this.animations.push(animation);
    }
    
    /**
     * Create a damage number animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    createDamageNumberAnimation(target, damage) {
        const animation = new DamageNumberAnimation(target, damage);
        this.animations.push(animation);
    }
}

/**
 * Base Animation Class
 * Base class for all animations
 */
class Animation {
    /**
     * Create a new animation
     * @param {number} duration - Animation duration in seconds
     */
    constructor(duration = 0.3) {
        this.duration = duration;
        this.elapsed = 0;
        this.isComplete = false;
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        if (this.elapsed >= this.duration) {
            this.isComplete = true;
        }
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Base class doesn't draw anything
    }
    
    /**
     * Get animation progress (0 to 1)
     * @returns {number} - Animation progress
     */
    getProgress() {
        return Math.min(this.elapsed / this.duration, 1);
    }
    
    /**
     * Get eased animation progress
     * @returns {number} - Eased animation progress
     */
    getEasedProgress() {
        const t = this.getProgress();
        // Ease in-out quad
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}

/**
 * Basic Attack Animation
 * Simple line from source to target
 */
class BasicAttackAnimation extends Animation {
    /**
     * Create a new basic attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#ffffff') {
        super(0.2); // Short duration
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getEasedProgress();
        
        // Calculate line endpoints
        const startX = this.source.x;
        const startY = this.source.y;
        const endX = this.target.x;
        const endY = this.target.y;
        
        // Draw line from source to target
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - progress; // Fade out
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Calculate current endpoint based on progress
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Melee Slash Animation
 * Arc slash effect for melee attacks
 */
class MeleeSlashAnimation extends Animation {
    /**
     * Create a new melee slash animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#ff5555') {
        super(0.3);
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
        
        // Calculate direction from source to target
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.direction = {
            x: dx / distance,
            y: dy / distance
        };
        
        // Calculate perpendicular direction for arc
        this.perpendicular = {
            x: -this.direction.y,
            y: this.direction.x
        };
        
        // Calculate arc radius
        this.radius = Math.min(distance * 0.5, 50);
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getEasedProgress();
        
        // Calculate arc center
        const midX = this.source.x + this.direction.x * this.radius * 2;
        const midY = this.source.y + this.direction.y * this.radius * 2;
        
        // Draw arc
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1 - progress; // Fade out
        
        // Calculate arc angles
        const startAngle = Math.atan2(-this.perpendicular.y, -this.perpendicular.x);
        const endAngle = Math.atan2(this.perpendicular.y, this.perpendicular.x);
        
        // Draw arc with progress
        ctx.beginPath();
        ctx.arc(
            midX,
            midY,
            this.radius,
            startAngle,
            startAngle + (endAngle - startAngle) * progress,
            false
        );
        ctx.stroke();
        
        // Reset
        ctx.lineCap = 'butt';
        ctx.globalAlpha = 1;
    }
}

/**
 * Magic Burst Animation
 * Expanding circle effect for magic attacks
 */
class MagicBurstAnimation extends Animation {
    /**
     * Create a new magic burst animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#5555ff') {
        super(0.4);
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.maxRadius = Math.min(source.stats.attackRange, 100);
        this.particles = [];
        
        // Create particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                distance: 0,
                size: 3 + Math.random() * 3
            });
        }
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getEasedProgress();
        
        // Draw expanding circle
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7 - progress * 0.7; // Fade out
        
        // Draw main circle
        ctx.beginPath();
        ctx.arc(
            this.source.x,
            this.source.y,
            this.maxRadius * progress,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Draw particles
        this.particles.forEach(particle => {
            const distance = this.maxRadius * progress;
            const x = this.source.x + Math.cos(particle.angle) * distance;
            const y = this.source.y + Math.sin(particle.angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, particle.size * (1 - progress), 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Ranged Shot Animation
 * Projectile effect for ranged attacks
 */
class RangedShotAnimation extends Animation {
    /**
     * Create a new ranged shot animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#55ff55') {
        super(0.3);
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.trailPoints = [];
        
        // Calculate direction
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.direction = {
            x: dx / distance,
            y: dy / distance
        };
        
        this.distance = distance;
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Add trail points
        const progress = this.getProgress();
        const x = this.source.x + this.direction.x * this.distance * progress;
        const y = this.source.y + this.direction.y * this.distance * progress;
        
        this.trailPoints.push({ x, y, age: 0 });
        
        // Update trail points
        this.trailPoints.forEach(point => {
            point.age += deltaTime;
        });
        
        // Remove old trail points
        this.trailPoints = this.trailPoints.filter(point => point.age < 0.2);
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Calculate current position
        const x = this.source.x + this.direction.x * this.distance * progress;
        const y = this.source.y + this.direction.y * this.distance * progress;
        
        // Draw trail
        if (this.trailPoints.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            
            ctx.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            
            for (let i = 1; i < this.trailPoints.length; i++) {
                const point = this.trailPoints[i];
                const alpha = 1 - point.age / 0.2;
                
                ctx.globalAlpha = alpha;
                ctx.lineTo(point.x, point.y);
            }
            
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // Draw projectile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Quick Strike Animation
 * Fast, thin line for quick enemies
 */
class QuickStrikeAnimation extends Animation {
    /**
     * Create a new quick strike animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#33aa33') {
        super(0.15); // Very short duration
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getEasedProgress();
        
        // Draw zigzag line
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1 - progress; // Fade out
        
        const segments = 3;
        const segmentLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.source.x, this.source.y);
        
        // Calculate direction
        const dx = this.target.x - this.source.x;
        const dy = this.target.y - this.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Calculate perpendicular direction
        const perpX = -dirY;
        const perpY = dirX;
        
        // Draw zigzag path
        let currentX = this.source.x;
        let currentY = this.source.y;
        
        for (let i = 0; i < segments; i++) {
            const t = (i + 1) / segments;
            const targetX = this.source.x + dx * t * progress;
            const targetY = this.source.y + dy * t * progress;
            
            // Add zigzag effect
            const offset = (i % 2 === 0 ? 1 : -1) * segmentLength;
            const controlX = (currentX + targetX) / 2 + perpX * offset;
            const controlY = (currentY + targetY) / 2 + perpY * offset;
            
            ctx.quadraticCurveTo(controlX, controlY, targetX, targetY);
            
            currentX = targetX;
            currentY = targetY;
        }
        
        ctx.stroke();
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Heavy Attack Animation
 * Slow, thick line for tank enemies
 */
class HeavyAttackAnimation extends Animation {
    /**
     * Create a new heavy attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#3333aa') {
        super(0.5); // Longer duration
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.windupDuration = 0.3; // Time before actual attack
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Wind-up phase
        if (progress < this.windupDuration / this.duration) {
            const windupProgress = progress / (this.windupDuration / this.duration);
            
            // Draw charging effect
            ctx.fillStyle = this.color;
            ctx.globalAlpha = windupProgress;
            
            ctx.beginPath();
            ctx.arc(this.source.x, this.source.y, this.source.size / 2 + 5 * windupProgress, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1;
            return;
        }
        
        // Attack phase
        const attackProgress = (progress - this.windupDuration / this.duration) / (1 - this.windupDuration / this.duration);
        
        // Draw heavy line
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 1 - attackProgress; // Fade out
        
        // Calculate line endpoints
        const startX = this.source.x;
        const startY = this.source.y;
        const endX = this.target.x;
        const endY = this.target.y;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Calculate current endpoint based on progress
        const currentX = startX + (endX - startX) * attackProgress;
        const currentY = startY + (endY - startY) * attackProgress;
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        // Reset
        ctx.lineCap = 'butt';
        ctx.globalAlpha = 1;
    }
}

/**
 * Boss Attack Animation
 * Complex effect for boss enemies
 */
class BossAttackAnimation extends Animation {
    /**
     * Create a new boss attack animation
     * @param {Object} source - Source object
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {string} color - Animation color
     */
    constructor(source, target, damage, color = '#aa33aa') {
        super(0.6);
        this.source = source;
        this.target = target;
        this.damage = damage;
        this.color = color;
        this.rings = [];
        
        // Create rings
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
            this.rings.push({
                delay: i * 0.1,
                maxRadius: 30 + i * 20
            });
        }
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Draw shockwave rings
        this.rings.forEach(ring => {
            // Calculate ring progress
            let ringProgress = (progress - ring.delay) / (1 - ring.delay);
            if (ringProgress < 0 || ringProgress > 1) return;
            
            // Draw ring
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1 - ringProgress;
            
            ctx.beginPath();
            ctx.arc(
                this.target.x,
                this.target.y,
                ring.maxRadius * ringProgress,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        });
        
        // Draw lightning effect
        if (progress < 0.5) {
            const lightningProgress = progress / 0.5;
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 1 - lightningProgress;
            
            // Draw multiple lightning bolts
            const boltCount = 3;
            for (let i = 0; i < boltCount; i++) {
                const angle = (i / boltCount) * Math.PI * 2 + progress * Math.PI;
                this.drawLightningBolt(
                    ctx,
                    this.source.x,
                    this.source.y,
                    this.target.x + Math.cos(angle) * 10,
                    this.target.y + Math.sin(angle) * 10,
                    lightningProgress
                );
            }
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
    
    /**
     * Draw a lightning bolt
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {number} progress - Animation progress
     */
    drawLightningBolt(ctx, x1, y1, x2, y2, progress) {
        const segments = 5;
        const maxOffset = 20;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        // Calculate direction
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Draw jagged line
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            
            // Calculate base point
            const baseX = x1 + dx * t;
            const baseY = y1 + dy * t;
            
            // Add random offset perpendicular to line
            const perpX = -dy;
            const perpY = dx;
            const length = Math.sqrt(perpX * perpX + perpY * perpY);
            
            // Skip last point to ensure it connects to target
            if (i < segments) {
                const offset = (Math.random() * 2 - 1) * maxOffset * (1 - t);
                const offsetX = (perpX / length) * offset;
                const offsetY = (perpY / length) * offset;
                
                ctx.lineTo(baseX + offsetX, baseY + offsetY);
            } else {
                ctx.lineTo(baseX, baseY);
            }
        }
        
        ctx.stroke();
    }
}

/**
 * Impact Animation
 * Visual effect at point of impact
 */
class ImpactAnimation extends Animation {
    /**
     * Create a new impact animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    constructor(target, damage) {
        super(0.3);
        this.target = target;
        this.damage = damage;
        this.color = damage > 10 ? '#ff3333' : '#ffaa33';
        this.particles = [];
        
        // Create particles
        const particleCount = Math.min(Math.floor(damage / 2), 12);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            
            this.particles.push({
                x: target.x,
                y: target.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: this.color
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
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.size *= 0.95;
        });
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Draw impact circle
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5 * (1 - progress);
        
        ctx.beginPath();
        ctx.arc(
            this.target.x,
            this.target.y,
            this.target.size / 2 * (1 + progress),
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw particles
        ctx.globalAlpha = 1 - progress;
        
        this.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Damage Number Animation
 * Floating number showing damage amount
 */
class DamageNumberAnimation extends Animation {
    /**
     * Create a new damage number animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    constructor(target, damage) {
        super(1.0);
        this.target = target;
        this.damage = Math.floor(damage);
        this.x = target.x;
        this.y = target.y - target.size / 2;
        this.color = damage > 10 ? '#ff3333' : '#ffaa33';
        this.offsetX = (Math.random() * 2 - 1) * 10;
        this.offsetY = -20 - Math.random() * 10;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Calculate position with upward movement
        const x = this.x + this.offsetX;
        const y = this.y + this.offsetY * progress;
        
        // Draw text
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - progress;
        ctx.strokeText(this.damage.toString(), x, y);
        
        // Draw text
        ctx.fillStyle = this.color;
        ctx.fillText(this.damage.toString(), x, y);
        
        // Reset
        ctx.globalAlpha = 1;
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
    }
}
