/**
 * Character Factory Class
 * Creates character instances based on character type
 */

class CharacterFactory {
    /**
     * Create a new character based on character type
     * @param {string} type - Character type from CHARACTER_TYPES
     * @returns {Character} - New character instance
     */
    static createCharacter(type) {
        // Validate character type
        if (!Object.values(CHARACTER_TYPES).includes(type)) {
            console.error(`Invalid character type: ${type}`);
            // Default to warrior if invalid type
            type = CHARACTER_TYPES.WARRIOR;
        }
        
        // Create base stats based on character type
        let stats = {};
        
        switch (type) {
            case CHARACTER_TYPES.WARRIOR:
                stats = {
                    health: PLAYER_BASE_HEALTH * 1.3,
                    maxHealth: PLAYER_BASE_HEALTH * 1.3,
                    damage: PLAYER_BASE_DAMAGE * 1.2,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 0.8,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 0.7,
                    speed: PLAYER_SPEED * 0.9,
                    size: PLAYER_SIZE * 1.1
                };
                break;
                
            case CHARACTER_TYPES.MAGE:
                stats = {
                    health: PLAYER_BASE_HEALTH * 0.8,
                    maxHealth: PLAYER_BASE_HEALTH * 0.8,
                    damage: PLAYER_BASE_DAMAGE * 1.5,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 0.7,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.5,
                    speed: PLAYER_SPEED * 1.0,
                    size: PLAYER_SIZE * 0.9
                };
                break;
                
            case CHARACTER_TYPES.RANGER:
                stats = {
                    health: PLAYER_BASE_HEALTH * 0.9,
                    maxHealth: PLAYER_BASE_HEALTH * 0.9,
                    damage: PLAYER_BASE_DAMAGE * 0.9,
                    attackSpeed: PLAYER_BASE_ATTACK_SPEED * 1.5,
                    attackRange: PLAYER_BASE_ATTACK_RANGE * 1.2,
                    speed: PLAYER_SPEED * 1.2,
                    size: PLAYER_SIZE * 0.95
                };
                break;
        }
        
        // Create and return new character
        return new Character(type, stats);
    }
}
