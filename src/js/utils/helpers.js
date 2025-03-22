/**
 * Helper Functions
 * Utility functions used throughout the game
 */

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point with x and y properties
 * @param {Object} point2 - Second point with x and y properties
 * @returns {number} - Distance between points
 */
function distance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get angle between two points in radians
 * @param {Object} point1 - First point with x and y properties
 * @param {Object} point2 - Second point with x and y properties
 * @returns {number} - Angle in radians
 */
function angle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} - Interpolated value
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if two circles are colliding
 * @param {Object} circle1 - First circle with x, y, and radius properties
 * @param {Object} circle2 - Second circle with x, y, and radius properties
 * @returns {boolean} - True if colliding
 */
function circleCollision(circle1, circle2) {
    const dist = distance(circle1, circle2);
    return dist < circle1.radius + circle2.radius;
}

/**
 * Check if a point is inside a circle
 * @param {Object} point - Point with x and y properties
 * @param {Object} circle - Circle with x, y, and radius properties
 * @returns {boolean} - True if point is inside circle
 */
function pointInCircle(point, circle) {
    const dist = distance(point, circle);
    return dist < circle.radius;
}

/**
 * Check if two game entities are colliding
 * @param {Object} entity1 - First entity with x, y, and size properties
 * @param {Object} entity2 - Second entity with x, y, and size properties
 * @returns {boolean} - True if entities are colliding
 */
function checkCollision(entity1, entity2) {
    // Convert entity size to radius (assuming size is diameter)
    const radius1 = entity1.stats.size / 2;
    const radius2 = entity2.stats.size / 2;
    
    // Create circle objects for collision check
    const circle1 = {
        x: entity1.x,
        y: entity1.y,
        radius: radius1
    };
    
    const circle2 = {
        x: entity2.x,
        y: entity2.y,
        radius: radius2
    };
    
    // Use existing circleCollision function
    return circleCollision(circle1, circle2);
}

/**
 * Get a color with random RGB values
 * @returns {string} - CSS color string
 */
function randomColor() {
    const r = randomInt(0, 255);
    const g = randomInt(0, 255);
    const b = randomInt(0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a vector object
 * @param {number} x - X component
 * @param {number} y - Y component
 * @returns {Object} - Vector object
 */
function createVector(x, y) {
    return {
        x,
        y,
        add(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },
        subtract(v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },
        multiply(scalar) {
            this.x *= scalar;
            this.y *= scalar;
            return this;
        },
        divide(scalar) {
            if (scalar !== 0) {
                this.x /= scalar;
                this.y /= scalar;
            }
            return this;
        },
        magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        normalize() {
            const mag = this.magnitude();
            if (mag > 0) {
                this.x /= mag;
                this.y /= mag;
            }
            return this;
        },
        limit(max) {
            const mag = this.magnitude();
            if (mag > max) {
                this.normalize();
                this.multiply(max);
            }
            return this;
        },
        copy() {
            return createVector(this.x, this.y);
        }
    };
}
