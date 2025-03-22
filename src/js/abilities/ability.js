/**
 * Ability Class
 * Base class for all abilities and passives
 */

class Ability {
    /**
     * Create a new ability
     * @param {string} name - Ability name
     * @param {string} description - Ability description
     * @param {string} type - Ability type from ABILITY_TYPES
     * @param {string} element - Element type from ELEMENT_TYPES
     * @param {number} cooldown - Cooldown in seconds
     * @param {number} level - Ability level
     */
    constructor(name, description, type, element, cooldown = 0, level = 1) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.element = element;
        this.baseCooldown = cooldown;
        this.cooldown = cooldown;
        this.level = level;
        this.lastUsedTime = 0;
        this.icon = null; // Path to icon image
    }
    
    /**
     * Check if ability is ready to use
     * @returns {boolean} - True if ready
     */
    isReady() {
        return performance.now() - this.lastUsedTime >= this.cooldown * 1000;
    }
    
    /**
     * Use the ability
     * @param {Character} character - Character using the ability
     * @param {Array} targets - Potential targets
     */
    use(character, targets) {
        // Base implementation does nothing
        console.log(`${character.type} used ${this.name}`);
        
        // Set last used time
        this.lastUsedTime = performance.now();
        
        // Emit ability used event
        eventEmitter.emit('ability:used', {
            ability: this,
            character: character,
            targets: targets
        });
    }
    
    /**
     * Apply passive effect to character
     * @param {Character} character - Character to apply effect to
     */
    apply(character) {
        // Base implementation does nothing
        console.log(`Applied ${this.name} to ${character.type}`);
        
        // Emit passive applied event
        eventEmitter.emit('passive:applied', {
            ability: this,
            character: character
        });
    }
    
    /**
     * Update ability state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Base implementation does nothing
    }
    
    /**
     * Level up the ability
     */
    levelUp() {
        this.level++;
        
        // Emit ability level up event
        eventEmitter.emit('ability:levelUp', {
            ability: this,
            level: this.level
        });
    }
    
    /**
     * Get ability description with current level stats
     * @returns {string} - Formatted description
     */
    getDescription() {
        return `${this.description} (Level ${this.level})`;
    }
}

// Active ability implementations
class ProjectileAbility extends Ability {
    /**
     * Create a new projectile ability
     * @param {string} name - Ability name
     * @param {string} description - Ability description
     * @param {string} element - Element type from ELEMENT_TYPES
     * @param {number} cooldown - Cooldown in seconds
     * @param {Object} projectileStats - Projectile stats
     */
    constructor(name, description, element, cooldown, projectileStats = {}) {
        super(name, description, ABILITY_TYPES.ACTIVE, element, cooldown);
        
        this.projectileStats = {
            damage: projectileStats.damage || 20,
            speed: projectileStats.speed || 10,
            size: projectileStats.size || 10,
            count: projectileStats.count || 1,
            piercing: projectileStats.piercing || false,
            range: projectileStats.range || 500
        };
    }
    
    /**
     * Use the ability
     * @param {Character} character - Character using the ability
     * @param {Array} targets - Potential targets
     */
    use(character, targets) {
        super.use(character, targets);
        
        // Create projectiles
        const projectiles = [];
        
        if (this.projectileStats.count === 1) {
            // Single projectile in facing direction
            const direction = character.direction;
            
            projectiles.push({
                x: character.x,
                y: character.y,
                directionX: direction.x,
                directionY: direction.y,
                damage: this.projectileStats.damage * (1 + 0.2 * (this.level - 1)),
                speed: this.projectileStats.speed,
                size: this.projectileStats.size,
                piercing: this.projectileStats.piercing,
                range: this.projectileStats.range,
                distanceTraveled: 0
            });
        } else {
            // Multiple projectiles in spread pattern
            const angleStep = (Math.PI * 2) / this.projectileStats.count;
            let startAngle = 0;
            
            if (this.projectileStats.count <= 4) {
                // For fewer projectiles, align with character direction
                startAngle = Math.atan2(character.direction.y, character.direction.x) - (angleStep * (this.projectileStats.count - 1)) / 2;
            }
            
            for (let i = 0; i < this.projectileStats.count; i++) {
                const angle = startAngle + angleStep * i;
                const directionX = Math.cos(angle);
                const directionY = Math.sin(angle);
                
                projectiles.push({
                    x: character.x,
                    y: character.y,
                    directionX: directionX,
                    directionY: directionY,
                    damage: this.projectileStats.damage * (1 + 0.2 * (this.level - 1)),
                    speed: this.projectileStats.speed,
                    size: this.projectileStats.size,
                    piercing: this.projectileStats.piercing,
                    range: this.projectileStats.range,
                    distanceTraveled: 0
                });
            }
        }
        
        // Emit projectiles created event
        eventEmitter.emit('projectiles:created', {
            ability: this,
            character: character,
            projectiles: projectiles
        });
    }
    
    /**
     * Level up the ability
     */
    levelUp() {
        super.levelUp();
        
        // Increase projectile count every few levels
        if (this.level % 3 === 0) {
            this.projectileStats.count++;
        }
        
        // Increase damage
        this.projectileStats.damage *= 1.2;
        
        // Increase size slightly
        this.projectileStats.size *= 1.05;
        
        // Add piercing at high levels
        if (this.level >= 5 && !this.projectileStats.piercing) {
            this.projectileStats.piercing = true;
        }
    }
    
    /**
     * Get ability description with current level stats
     * @returns {string} - Formatted description
     */
    getDescription() {
        return `${this.description} (Level ${this.level})\nDamage: ${Math.floor(this.projectileStats.damage)}\nProjectiles: ${this.projectileStats.count}\nPiercing: ${this.projectileStats.piercing ? 'Yes' : 'No'}`;
    }
}

class AreaAbility extends Ability {
    /**
     * Create a new area ability
     * @param {string} name - Ability name
     * @param {string} description - Ability description
     * @param {string} element - Element type from ELEMENT_TYPES
     * @param {number} cooldown - Cooldown in seconds
     * @param {Object} areaStats - Area stats
     */
    constructor(name, description, element, cooldown, areaStats = {}) {
        super(name, description, ABILITY_TYPES.ACTIVE, element, cooldown);
        
        this.areaStats = {
            damage: areaStats.damage || 30,
            radius: areaStats.radius || 100,
            duration: areaStats.duration || 0.5, // seconds
            knockback: areaStats.knockback || false,
            centered: areaStats.centered || true // if true, centered on player, otherwise at cursor position
        };
    }
    
    /**
     * Use the ability
     * @param {Character} character - Character using the ability
     * @param {Array} targets - Potential targets
     */
    use(character, targets) {
        super.use(character, targets);
        
        // Create area effect
        const area = {
            x: character.x,
            y: character.y,
            damage: this.areaStats.damage * (1 + 0.2 * (this.level - 1)),
            radius: this.areaStats.radius,
            duration: this.areaStats.duration,
            knockback: this.areaStats.knockback,
            element: this.element,
            startTime: performance.now(),
            active: true
        };
        
        // Apply damage to enemies in range
        const hitEnemies = targets.filter(enemy => {
            if (!enemy.isAlive) return false;
            
            const dist = distance(
                { x: area.x, y: area.y },
                { x: enemy.x, y: enemy.y }
            );
            
            return dist <= area.radius;
        });
        
        hitEnemies.forEach(enemy => {
            enemy.takeDamage(area.damage);
            
            // Apply knockback
            if (area.knockback) {
                const angle = calculateAngle(
                    { x: area.x, y: area.y },
                    { x: enemy.x, y: enemy.y }
                );
                
                const knockbackDistance = area.radius / 2;
                const direction = getDirectionFromAngle(angle);
                
                enemy.x += direction.x * knockbackDistance;
                enemy.y += direction.y * knockbackDistance;
            }
        });
        
        // Emit area effect created event
        eventEmitter.emit('area:created', {
            ability: this,
            character: character,
            area: area,
            hitEnemies: hitEnemies
        });
    }
    
    /**
     * Level up the ability
     */
    levelUp() {
        super.levelUp();
        
        // Increase damage
        this.areaStats.damage *= 1.2;
        
        // Increase radius
        this.areaStats.radius *= 1.1;
        
        // Add knockback at high levels
        if (this.level >= 3 && !this.areaStats.knockback) {
            this.areaStats.knockback = true;
        }
        
        // Increase duration slightly
        this.areaStats.duration *= 1.1;
    }
    
    /**
     * Get ability description with current level stats
     * @returns {string} - Formatted description
     */
    getDescription() {
        return `${this.description} (Level ${this.level})\nDamage: ${Math.floor(this.areaStats.damage)}\nRadius: ${Math.floor(this.areaStats.radius)}\nKnockback: ${this.areaStats.knockback ? 'Yes' : 'No'}`;
    }
}

// Passive ability implementations
class StatBoostPassive extends Ability {
    /**
     * Create a new stat boost passive
     * @param {string} name - Ability name
     * @param {string} description - Ability description
     * @param {string} statType - Stat to boost
     * @param {number} boostValue - Amount to boost
     * @param {boolean} isPercentage - Whether boost is percentage or flat
     */
    constructor(name, description, statType, boostValue, isPercentage = true) {
        super(name, description, ABILITY_TYPES.PASSIVE, ELEMENT_TYPES.PHYSICAL, 0);
        
        this.statType = statType;
        this.boostValue = boostValue;
        this.isPercentage = isPercentage;
    }
    
    /**
     * Apply passive effect to character
     * @param {Character} character - Character to apply effect to
     */
    apply(character) {
        super.apply(character);
        
        // Apply stat boost
        if (this.statType in character.stats) {
            if (this.isPercentage) {
                character.stats[this.statType] *= (1 + this.boostValue * this.level);
            } else {
                character.stats[this.statType] += this.boostValue * this.level;
            }
        }
    }
    
    /**
     * Level up the ability
     */
    levelUp() {
        super.levelUp();
        
        // Reapply with new level
        if (this.lastAppliedTo) {
            this.apply(this.lastAppliedTo);
        }
    }
    
    /**
     * Get ability description with current level stats
     * @returns {string} - Formatted description
     */
    getDescription() {
        const valueText = this.isPercentage 
            ? `${Math.floor(this.boostValue * this.level * 100)}%` 
            : Math.floor(this.boostValue * this.level);
            
        return `${this.description} (Level ${this.level})\n${this.statType}: +${valueText}`;
    }
}

// Ability factory
class AbilityFactory {
    /**
     * Create a basic projectile ability
     * @param {string} element - Element type
     * @returns {Ability} - New ability instance
     */
    static createBasicProjectile(element = ELEMENT_TYPES.PHYSICAL) {
        const name = `${element.charAt(0).toUpperCase() + element.slice(1)} Bolt`;
        const description = `Fire a ${element} bolt that damages enemies`;
        
        return new ProjectileAbility(name, description, element, 3, {
            damage: 20,
            speed: 10,
            size: 10,
            count: 1,
            piercing: false,
            range: 500
        });
    }
    
    /**
     * Create a multi-projectile ability
     * @param {string} element - Element type
     * @returns {Ability} - New ability instance
     */
    static createMultiProjectile(element = ELEMENT_TYPES.PHYSICAL) {
        const name = `${element.charAt(0).toUpperCase() + element.slice(1)} Burst`;
        const description = `Fire multiple ${element} projectiles in a spread pattern`;
        
        return new ProjectileAbility(name, description, element, 5, {
            damage: 15,
            speed: 8,
            size: 8,
            count: 3,
            piercing: false,
            range: 400
        });
    }
    
    /**
     * Create a basic area ability
     * @param {string} element - Element type
     * @returns {Ability} - New ability instance
     */
    static createBasicArea(element = ELEMENT_TYPES.PHYSICAL) {
        const name = `${element.charAt(0).toUpperCase() + element.slice(1)} Nova`;
        const description = `Release a ${element} explosion around you`;
        
        return new AreaAbility(name, description, element, 8, {
            damage: 40,
            radius: 150,
            duration: 0.5,
            knockback: false,
            centered: true
        });
    }
    
    /**
     * Create a stat boost passive
     * @param {string} statType - Stat to boost
     * @returns {Ability} - New ability instance
     */
    static createStatBoost(statType) {
        let name, description, value, isPercentage;
        
        switch (statType) {
            case 'maxHealth':
                name = 'Vitality';
                description = 'Increase maximum health';
                value = 0.1; // 10% per level
                isPercentage = true;
                break;
            case 'damage':
                name = 'Strength';
                description = 'Increase damage';
                value = 0.15; // 15% per level
                isPercentage = true;
                break;
            case 'attackSpeed':
                name = 'Swiftness';
                description = 'Increase attack speed';
                value = 0.1; // 10% per level
                isPercentage = true;
                break;
            case 'attackRange':
                name = 'Reach';
                description = 'Increase attack range';
                value = 0.2; // 20% per level
                isPercentage = true;
                break;
            case 'speed':
                name = 'Agility';
                description = 'Increase movement speed';
                value = 0.1; // 10% per level
                isPercentage = true;
                break;
            default:
                name = 'Enhancement';
                description = `Increase ${statType}`;
                value = 0.1;
                isPercentage = true;
        }
        
        return new StatBoostPassive(name, description, statType, value, isPercentage);
    }
    
    /**
     * Create a random ability
     * @param {Character} character - Character to create ability for
     * @returns {Ability} - New ability instance
     */
    static createRandomAbility(character) {
        const abilityType = Math.random() < 0.7 ? ABILITY_TYPES.ACTIVE : ABILITY_TYPES.PASSIVE;
        
        if (abilityType === ABILITY_TYPES.ACTIVE) {
            const elements = Object.values(ELEMENT_TYPES);
            const element = elements[Math.floor(Math.random() * elements.length)];
            
            const abilitySubtype = Math.random() < 0.7 ? 'projectile' : 'area';
            
            if (abilitySubtype === 'projectile') {
                return Math.random() < 0.7 
                    ? this.createBasicProjectile(element)
                    : this.createMultiProjectile(element);
            } else {
                return this.createBasicArea(element);
            }
        } else {
            const statTypes = ['maxHealth', 'damage', 'attackSpeed', 'attackRange', 'speed'];
            const statType = statTypes[Math.floor(Math.random() * statTypes.length)];
            
            return this.createStatBoost(statType);
        }
    }
    
    /**
     * Create multiple random abilities
     * @param {Character} character - Character to create abilities for
     * @param {number} count - Number of abilities to create
     * @returns {Array} - Array of new ability instances
     */
    static createRandomAbilities(character, count) {
        const abilities = [];
        
        for (let i = 0; i < count; i++) {
            abilities.push(this.createRandomAbility(character));
        }
        
        return abilities;
    }
}
