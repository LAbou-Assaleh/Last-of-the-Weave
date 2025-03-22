/**
 * Camera Class
 * Handles viewport and camera movement for the game
 */

class Camera {
    /**
     * Create a new camera
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     */
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.scale = 1;
        this.target = null;
        this.bounds = {
            minX: 0,
            minY: 0,
            maxX: Number.MAX_SAFE_INTEGER,
            maxY: Number.MAX_SAFE_INTEGER
        };
        this.lerp = 0.1; // Smoothing factor for camera movement
    }

    /**
     * Set camera target to follow
     * @param {Object} target - Target object with x and y properties
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Set camera bounds
     * @param {number} minX - Minimum X coordinate
     * @param {number} minY - Minimum Y coordinate
     * @param {number} maxX - Maximum X coordinate
     * @param {number} maxY - Maximum Y coordinate
     */
    setBounds(minX, minY, maxX, maxY) {
        this.bounds = { minX, minY, maxX, maxY };
    }

    /**
     * Update camera position
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (this.target) {
            // Calculate target position (center of viewport)
            const targetX = this.target.x - this.width / (2 * this.scale);
            const targetY = this.target.y - this.height / (2 * this.scale);
            
            // Smooth camera movement with lerp
            this.x += (targetX - this.x) * this.lerp;
            this.y += (targetY - this.y) * this.lerp;
            
            // Enforce bounds
            this.x = Math.max(this.bounds.minX, Math.min(this.x, this.bounds.maxX - this.width / this.scale));
            this.y = Math.max(this.bounds.minY, Math.min(this.y, this.bounds.maxY - this.height / this.scale));
        }
    }

    /**
     * Apply camera transformation to context
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    apply(ctx) {
        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.translate(-this.x, -this.y);
    }

    /**
     * Restore context to normal
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    restore(ctx) {
        ctx.restore();
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} - Screen coordinates {x, y}
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.scale,
            y: (worldY - this.y) * this.scale
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} - World coordinates {x, y}
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX / this.scale + this.x,
            y: screenY / this.scale + this.y
        };
    }

    /**
     * Check if an object is visible in the camera view
     * @param {Object} obj - Object with x, y, and size properties
     * @returns {boolean} - True if visible
     */
    isVisible(obj) {
        const buffer = obj.size || 0;
        return (
            obj.x + buffer > this.x &&
            obj.x - buffer < this.x + this.width / this.scale &&
            obj.y + buffer > this.y &&
            obj.y - buffer < this.y + this.height / this.scale
        );
    }

    /**
     * Zoom the camera
     * @param {number} factor - Zoom factor (> 1 to zoom in, < 1 to zoom out)
     * @param {number} centerX - Center X coordinate for zoom
     * @param {number} centerY - Center Y coordinate for zoom
     */
    zoom(factor, centerX, centerY) {
        const oldScale = this.scale;
        this.scale *= factor;
        
        // Clamp scale to reasonable values
        this.scale = Math.max(0.5, Math.min(this.scale, 2));
        
        // Adjust position to zoom toward mouse position
        if (centerX !== undefined && centerY !== undefined) {
            const worldCenterX = centerX / oldScale + this.x;
            const worldCenterY = centerY / oldScale + this.y;
            
            this.x = worldCenterX - centerX / this.scale;
            this.y = worldCenterY - centerY / this.scale;
        }
    }
}
