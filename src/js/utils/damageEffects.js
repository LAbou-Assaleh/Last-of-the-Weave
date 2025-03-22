/**
 * DamageEffects Class
 * Enhanced visual effects for damage in the game
 */

class DamageEffects {
    /**
     * Initialize damage effects
     * @param {AttackAnimationManager} animationManager - The main animation manager
     */
    constructor(animationManager) {
        this.animationManager = animationManager;
        
        // Register damage event listeners
        eventEmitter.on('player:damage', (data) => {
            this.createEnhancedDamageEffect(data.player, data.damage, true);
        });
        
        eventEmitter.on('enemy:damage', (data) => {
            this.createEnhancedDamageEffect(data.enemy, data.damage, false);
        });
        
        eventEmitter.on('critical:hit', (data) => {
            this.createCriticalHitEffect(data.target, data.damage);
        });
    }
    
    /**
     * Create enhanced damage effect
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {boolean} isPlayer - Whether the target is the player
     */
    createEnhancedDamageEffect(target, damage, isPlayer) {
        // Create screen shake effect for heavy damage or player damage
        if (damage > 15 || isPlayer) {
            const intensity = isPlayer ? Math.min(damage / 10, 1.5) : Math.min(damage / 20, 0.8);
            this.createScreenShakeEffect(intensity);
        }
        
        // Create blood splatter effect
        this.createBloodSplatterEffect(target, damage);
        
        // Create damage number with enhanced styling
        this.createEnhancedDamageNumber(target, damage, isPlayer);
    }
    
    /**
     * Create screen shake effect
     * @param {number} intensity - Shake intensity
     */
    createScreenShakeEffect(intensity) {
        const animation = new ScreenShakeAnimation(intensity);
        this.animationManager.animations.push(animation);
    }
    
    /**
     * Create blood splatter effect
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    createBloodSplatterEffect(target, damage) {
        const animation = new BloodSplatterAnimation(target, damage);
        this.animationManager.animations.push(animation);
    }
    
    /**
     * Create enhanced damage number
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {boolean} isPlayer - Whether the target is the player
     */
    createEnhancedDamageNumber(target, damage, isPlayer) {
        const animation = new EnhancedDamageNumberAnimation(target, damage, isPlayer);
        this.animationManager.animations.push(animation);
    }
    
    /**
     * Create critical hit effect
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    createCriticalHitEffect(target, damage) {
        const animation = new CriticalHitAnimation(target, damage);
        this.animationManager.animations.push(animation);
    }
}

/**
 * Screen Shake Animation
 * Shakes the screen when heavy damage is taken
 */
class ScreenShakeAnimation extends Animation {
    /**
     * Create a new screen shake animation
     * @param {number} intensity - Shake intensity
     */
    constructor(intensity = 1.0) {
        super(0.4);
        this.intensity = intensity;
        this.offsetX = 0;
        this.offsetY = 0;
    }
    
    /**
     * Update animation
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        const progress = this.getProgress();
        const remainingIntensity = this.intensity * (1 - progress);
        
        // Calculate random offset
        this.offsetX = (Math.random() * 2 - 1) * remainingIntensity * 10;
        this.offsetY = (Math.random() * 2 - 1) * remainingIntensity * 10;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Apply screen shake by translating the canvas
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        
        // The actual drawing is done by restoring the context
        // This is a special case where we modify the context itself
        
        // We'll restore in the next frame or when the animation completes
        setTimeout(() => {
            ctx.restore();
        }, 0);
    }
}

/**
 * Blood Splatter Animation
 * Creates blood splatter particles when damage is taken
 */
class BloodSplatterAnimation extends Animation {
    /**
     * Create a new blood splatter animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    constructor(target, damage) {
        super(0.8);
        this.target = target;
        this.damage = damage;
        this.particles = [];
        
        // Create particles
        const particleCount = Math.min(Math.floor(damage / 2) + 5, 20);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 70;
            const size = 2 + Math.random() * (damage / 5);
            const lifetime = 0.3 + Math.random() * 0.5;
            
            this.particles.push({
                x: target.x,
                y: target.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                color: this.getBloodColor(damage),
                lifetime: lifetime,
                age: 0
            });
        }
    }
    
    /**
     * Get blood color based on damage
     * @param {number} damage - Damage amount
     * @returns {string} - Blood color
     */
    getBloodColor(damage) {
        if (damage > 15) {
            return '#990000'; // Dark red for heavy damage
        } else if (damage > 8) {
            return '#cc0000'; // Medium red for medium damage
        } else {
            return '#ff3333'; // Light red for light damage
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
            particle.age += deltaTime;
            
            // Apply gravity and friction
            particle.vy += 50 * deltaTime; // Gravity
            particle.vx *= 0.95; // Friction
            particle.vy *= 0.95; // Friction
            
            // Update position
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Shrink particles over time
            if (particle.age > particle.lifetime * 0.7) {
                const shrinkFactor = 1 - ((particle.age - particle.lifetime * 0.7) / (particle.lifetime * 0.3));
                particle.size *= shrinkFactor;
            }
        });
        
        // Remove dead particles
        this.particles = this.particles.filter(particle => particle.age < particle.lifetime);
        
        // Complete animation when all particles are gone
        if (this.particles.length === 0) {
            this.isComplete = true;
        }
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw particles
        this.particles.forEach(particle => {
            const alpha = 1 - (particle.age / particle.lifetime);
            
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
}

/**
 * Enhanced Damage Number Animation
 * Improved floating numbers showing damage amount
 */
class EnhancedDamageNumberAnimation extends Animation {
    /**
     * Create a new enhanced damage number animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     * @param {boolean} isPlayer - Whether the target is the player
     */
    constructor(target, damage, isPlayer = false) {
        super(1.2);
        this.target = target;
        this.damage = Math.floor(damage);
        this.isPlayer = isPlayer;
        this.x = target.x;
        this.y = target.y - target.size / 2;
        this.color = this.getDamageColor(damage, isPlayer);
        this.scale = this.getDamageScale(damage);
        this.offsetX = (Math.random() * 2 - 1) * 15;
        this.offsetY = -20 - Math.random() * 15;
        this.rotation = (Math.random() * 2 - 1) * 0.2;
    }
    
    /**
     * Get damage color based on amount and target
     * @param {number} damage - Damage amount
     * @param {boolean} isPlayer - Whether the target is the player
     * @returns {string} - Damage color
     */
    getDamageColor(damage, isPlayer) {
        if (isPlayer) {
            return '#ff3333'; // Red for player damage
        } else if (damage > 15) {
            return '#ffcc00'; // Gold for heavy damage
        } else if (damage > 8) {
            return '#ff9900'; // Orange for medium damage
        } else {
            return '#ffffff'; // White for light damage
        }
    }
    
    /**
     * Get damage scale based on amount
     * @param {number} damage - Damage amount
     * @returns {number} - Damage scale
     */
    getDamageScale(damage) {
        return 1 + Math.min(damage / 20, 0.8);
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Calculate position with arc movement
        const x = this.x + this.offsetX;
        const y = this.y + this.offsetY * progress - 10 * Math.sin(progress * Math.PI);
        
        // Calculate scale with bounce effect
        let scale = this.scale;
        if (progress < 0.2) {
            // Initial pop-in
            scale *= progress / 0.2;
        } else if (progress > 0.8) {
            // Final fade-out
            scale *= 1 - ((progress - 0.8) / 0.2);
        }
        
        // Calculate alpha
        let alpha = 1;
        if (progress > 0.7) {
            alpha = 1 - ((progress - 0.7) / 0.3);
        }
        
        // Draw text with rotation and scale
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);
        
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        ctx.strokeText(this.damage.toString(), 0, 0);
        
        // Draw text
        ctx.fillStyle = this.color;
        ctx.fillText(this.damage.toString(), 0, 0);
        
        // Reset
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

/**
 * Critical Hit Animation
 * Special effect for critical hits
 */
class CriticalHitAnimation extends Animation {
    /**
     * Create a new critical hit animation
     * @param {Object} target - Target object
     * @param {number} damage - Damage amount
     */
    constructor(target, damage) {
        super(0.8);
        this.target = target;
        this.damage = damage;
        this.x = target.x;
        this.y = target.y;
        this.color = '#ffff00'; // Bright yellow for crits
        this.flashIntensity = 1.0;
        this.slashCount = 3;
    }
    
    /**
     * Draw animation
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        const progress = this.getProgress();
        
        // Draw flash effect
        if (progress < 0.3) {
            const flashProgress = progress / 0.3;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = (1 - flashProgress) * this.flashIntensity;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.target.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw slash effects
        for (let i = 0; i < this.slashCount; i++) {
            const slashProgress = Math.max(0, Math.min(1, (progress * 3 - i * 0.2) / 0.6));
            if (slashProgress <= 0 || slashProgress >= 1) continue;
            
            const angle = (i / this.slashCount) * Math.PI;
            const length = this.target.size * 3;
            
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 4;
            ctx.globalAlpha = (1 - Math.abs(slashProgress - 0.5) * 2) * 0.8;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(
                this.x - Math.cos(angle) * length * slashProgress,
                this.y - Math.sin(angle) * length * slashProgress
            );
            ctx.lineTo(
                this.x + Math.cos(angle) * length * slashProgress,
                this.y + Math.sin(angle) * length * slashProgress
            );
            ctx.stroke();
        }
        
        // Draw "CRITICAL" text
        if (progress > 0.2 && progress < 0.8) {
            const textProgress = (progress - 0.2) / 0.6;
            const textAlpha = 1 - Math.abs(textProgress - 0.5) * 2;
            const textScale = 1 + 0.5 * Math.sin(textProgress * Math.PI);
            
            ctx.save();
            ctx.translate(this.x, this.y - this.target.size * 2);
            ctx.scale(textScale, textScale);
            
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.globalAlpha = textAlpha;
            ctx.strokeText('CRITICAL!', 0, 0);
            
            // Draw text
            ctx.fillStyle = this.color;
            ctx.fillText('CRITICAL!', 0, 0);
            
            ctx.restore();
        }
        
        // Reset
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';
    }
}
