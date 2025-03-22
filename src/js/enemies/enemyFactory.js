/**
 * Enemy Factory Class
 * Creates different types of enemies based on wave number
 */

class EnemyFactory {
    /**
     * Create a new enemy
     * @param {number} wave - Current wave number
     * @param {number} x - Spawn position x
     * @param {number} y - Spawn position y
     * @returns {Enemy} - New enemy instance
     */
    static createEnemy(wave, x = null, y = null) {
        // Determine if this should be a boss wave
        const isBossWave = wave % 10 === 0 && wave > 0;
        
        // Position object for spawn location
        const position = x !== null && y !== null ? { x, y } : null;
        
        // Create boss enemy on boss waves
        if (isBossWave) {
            return EnemyFactory.createBossEnemy(wave, position);
        }
        
        // Otherwise create a regular enemy with random type
        return EnemyFactory.createRegularEnemy(wave, position);
    }
    
    /**
     * Create a boss enemy
     * @param {number} wave - Current wave number
     * @param {Object} position - Spawn position {x, y}
     * @returns {Enemy} - New boss enemy instance
     */
    static createBossEnemy(wave, position) {
        const enemy = new Enemy('boss', wave, position);
        
        // Boss stats - much stronger than regular enemies
        const bossMultiplier = 5.0;
        enemy.health *= bossMultiplier;
        enemy.maxHealth *= bossMultiplier;
        enemy.damage *= 1.5;
        enemy.size *= 2.0;
        enemy.speed *= 0.7; // Slower but stronger
        
        // Higher XP value
        enemy.xpValue = ENEMY_XP_VALUE * 10;
        
        // Special boss behavior
        enemy.behavior = {
            wanderWeight: 0.1,
            followWeight: 0.9,
            attackWeight: 1.0
        };
        
        return enemy;
    }
    
    /**
     * Create a regular enemy with random type
     * @param {number} wave - Current wave number
     * @param {Object} position - Spawn position {x, y}
     * @returns {Enemy} - New regular enemy instance
     */
    static createRegularEnemy(wave, position) {
        // Determine enemy type based on wave and randomness
        let enemyType;
        const rand = Math.random();
        
        if (wave < 3) {
            // Early waves: mostly basic enemies
            enemyType = rand < 0.8 ? 'basic' : 'fast';
        } else if (wave < 7) {
            // Mid waves: mix of basic and fast, introduce tanks
            if (rand < 0.5) {
                enemyType = 'basic';
            } else if (rand < 0.8) {
                enemyType = 'fast';
            } else {
                enemyType = 'tank';
            }
        } else {
            // Later waves: balanced mix of all types
            if (rand < 0.4) {
                enemyType = 'basic';
            } else if (rand < 0.7) {
                enemyType = 'fast';
            } else {
                enemyType = 'tank';
            }
        }
        
        // Create the enemy
        const enemy = new Enemy(enemyType, wave, position);
        
        // Adjust stats based on type
        switch (enemyType) {
            case 'fast':
                enemy.speed *= 1.5;
                enemy.health *= 0.7;
                enemy.damage *= 0.8;
                enemy.size *= 0.8;
                break;
                
            case 'tank':
                enemy.speed *= 0.7;
                enemy.health *= 2.0;
                enemy.damage *= 1.2;
                enemy.size *= 1.3;
                break;
                
            case 'basic':
            default:
                // Basic enemy has default stats
                break;
        }
        
        return enemy;
    }
}
