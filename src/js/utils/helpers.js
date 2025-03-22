/**
 * Helper Functions
 * Utility functions used throughout the game
 */

/**
 * Calculate distance between two points
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {number} - Distance between points
 */
function distance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random number
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random position within the game boundaries
 * @param {number} padding - Padding from the edges
 * @returns {Object} - {x, y} coordinates
 */
function randomPosition(padding = 50) {
    return {
        x: randomRange(padding, GAME_WIDTH - padding),
        y: randomRange(padding, GAME_HEIGHT - padding)
    };
}

/**
 * Generate a random position outside the game boundaries
 * @param {number} padding - Distance outside the boundaries
 * @returns {Object} - {x, y} coordinates
 */
function randomPositionOutsideScreen(padding = 100) {
    // Decide which side to spawn from (0: top, 1: right, 2: bottom, 3: left)
    const side = Math.floor(Math.random() * 4);
    
    let x, y;
    
    switch (side) {
        case 0: // Top
            x = randomRange(-padding, GAME_WIDTH + padding);
            y = -padding;
            break;
        case 1: // Right
            x = GAME_WIDTH + padding;
            y = randomRange(-padding, GAME_HEIGHT + padding);
            break;
        case 2: // Bottom
            x = randomRange(-padding, GAME_WIDTH + padding);
            y = GAME_HEIGHT + padding;
            break;
        case 3: // Left
            x = -padding;
            y = randomRange(-padding, GAME_HEIGHT + padding);
            break;
    }
    
    return { x, y };
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Check if two objects are colliding (simple circle collision)
 * @param {Object} obj1 - First object with x, y, and size properties
 * @param {Object} obj2 - Second object with x, y, and size properties
 * @returns {boolean} - True if colliding, false otherwise
 */
function checkCollision(obj1, obj2) {
    const combinedRadius = (obj1.size + obj2.size) / 2;
    return distance({x: obj1.x, y: obj1.y}, {x: obj2.x, y: obj2.y}) < combinedRadius;
}

/**
 * Calculate angle between two points
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {number} - Angle in radians
 */
function calculateAngle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

/**
 * Get direction vector from angle
 * @param {number} angle - Angle in radians
 * @returns {Object} - {x, y} direction vector
 */
function getDirectionFromAngle(angle) {
    return {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}
