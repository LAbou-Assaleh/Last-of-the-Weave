/**
 * Movement Trail Class
 * Creates visual trail effects for character movement
 */

class MovementTrail {
    /**
     * Create a new movement trail manager
     * @param {number} maxTrailPoints - Maximum number of trail points to store
     * @param {number} trailDuration - Duration of trail in seconds
     */
    constructor(maxTrailPoints = 10, trailDuration = 0.5) {
        this.maxTrailPoints = maxTrailPoints;
        this.trailDuration = trailDuration;
        this.trailPoints = [];
    }

    /**
     * Add a new trail point
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the trail point
     * @param {string} color - Color of the trail point
     * @param {number} alpha - Initial alpha value
     */
    addTrailPoint(x, y, size, color = '#ffffff', alpha = 0.7) {
        // Only add trail point if moving fast enough
        if (this.trailPoints.length > 0) {
            const lastPoint = this.trailPoints[this.trailPoints.length - 1];
            const distance = Math.sqrt(
                Math.pow(x - lastPoint.x, 2) + 
                Math.pow(y - lastPoint.y, 2)
            );
            
            // Don't add points too close together
            if (distance < size / 4) {
                return;
            }
        }
        
        this.trailPoints.push({
            x,
            y,
            size,
            color,
            alpha,
            createdAt: performance.now()
        });
        
        // Remove oldest points if exceeding max
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
    }

    /**
     * Update trail points
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        const currentTime = performance.now();
        const fadeRate = deltaTime / this.trailDuration;
        
        // Update alpha values and remove expired points
        this.trailPoints = this.trailPoints.filter(point => {
            point.alpha -= fadeRate;
            return point.alpha > 0;
        });
    }

    /**
     * Draw trail
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.save();
        
        // Draw trail points from oldest to newest
        this.trailPoints.forEach(point => {
            ctx.globalAlpha = point.alpha;
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.size * point.alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
}
