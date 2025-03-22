/**
 * TimeManager Class
 * Handles game timing, frame rate, and delta time calculations
 */

class TimeManager {
    /**
     * Create a new time manager
     * @param {number} targetFPS - Target frames per second
     */
    constructor(targetFPS = 60) {
        this.targetFPS = targetFPS;
        this.targetFrameTime = 1000 / targetFPS;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // ms
        this.lastFpsUpdate = 0;
        this.currentFPS = 0;
        this.frameTimeHistory = [];
        this.historySize = 60; // Store last 60 frame times for analysis
        this.maxDeltaTime = 0.1; // Cap delta time to prevent physics issues on slow frames
        this.timeScale = 1.0; // For slow-motion or speed-up effects
        this.accumulatedTime = 0;
        this.fixedTimeStep = 1 / 60; // For fixed update steps
    }

    /**
     * Update time calculations
     * @param {number} timestamp - Current timestamp
     * @returns {number} - Delta time in seconds
     */
    update(timestamp) {
        // Calculate raw delta time
        if (this.lastFrameTime === 0) {
            this.deltaTime = this.targetFrameTime / 1000;
        } else {
            this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
        }

        // Cap delta time to prevent physics issues on slow frames
        this.deltaTime = Math.min(this.deltaTime, this.maxDeltaTime);
        
        // Apply time scale
        this.deltaTime *= this.timeScale;
        
        // Update frame time history
        this.frameTimeHistory.push(this.deltaTime);
        if (this.frameTimeHistory.length > this.historySize) {
            this.frameTimeHistory.shift();
        }
        
        // Update FPS counter
        this.frameCount++;
        if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }
        
        // Update last frame time
        this.lastFrameTime = timestamp;
        
        // Update accumulated time for fixed time step
        this.accumulatedTime += this.deltaTime;
        
        return this.deltaTime;
    }

    /**
     * Check if a fixed update step should be performed
     * @returns {boolean} - True if a fixed update should be performed
     */
    shouldFixedUpdate() {
        if (this.accumulatedTime >= this.fixedTimeStep) {
            this.accumulatedTime -= this.fixedTimeStep;
            return true;
        }
        return false;
    }

    /**
     * Get the current FPS
     * @returns {number} - Current FPS
     */
    getFPS() {
        return this.currentFPS;
    }

    /**
     * Get the average frame time over recent history
     * @returns {number} - Average frame time in seconds
     */
    getAverageFrameTime() {
        if (this.frameTimeHistory.length === 0) return 0;
        
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }

    /**
     * Set the time scale
     * @param {number} scale - New time scale (1.0 is normal speed)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(scale, 3.0)); // Clamp between 0.1 and 3.0
    }

    /**
     * Reset the time manager
     */
    reset() {
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.currentFPS = 0;
        this.frameTimeHistory = [];
        this.accumulatedTime = 0;
        this.timeScale = 1.0;
    }
}
