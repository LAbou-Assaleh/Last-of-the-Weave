/**
 * ResizeHandler Class
 * Handles canvas resizing and responsive layout adjustments
 */

class ResizeHandler {
    /**
     * Create a new resize handler
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {Game} game - Game instance
     */
    constructor(canvas, game) {
        this.canvas = canvas;
        this.game = game;
        this.resizeTimeout = null;
        this.aspectRatio = 16 / 9; // Default aspect ratio
        this.minWidth = 800;
        this.minHeight = 600;
        this.maxWidth = 1920;
        this.maxHeight = 1080;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.isFullscreen = false;
        
        // Initialize
        this.setupEventListeners();
        this.resize();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
        
        // Fullscreen change events for different browsers
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
    }
    
    /**
     * Handle resize event with debounce
     */
    handleResize() {
        // Clear previous timeout
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Set new timeout to avoid excessive resizing
        this.resizeTimeout = setTimeout(() => {
            this.resize();
        }, 100);
    }
    
    /**
     * Handle fullscreen change
     */
    handleFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        this.resize();
    }
    
    /**
     * Resize canvas and adjust game elements
     */
    resize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        let canvasWidth, canvasHeight;
        
        if (this.isFullscreen) {
            // In fullscreen mode, use the screen dimensions
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
        } else {
            // In windowed mode, fit to container while maintaining aspect ratio
            if (containerWidth / containerHeight > this.aspectRatio) {
                // Container is wider than needed
                canvasHeight = containerHeight;
                canvasWidth = containerHeight * this.aspectRatio;
            } else {
                // Container is taller than needed
                canvasWidth = containerWidth;
                canvasHeight = containerWidth / this.aspectRatio;
            }
            
            // Apply min/max constraints
            canvasWidth = Math.max(this.minWidth, Math.min(canvasWidth, this.maxWidth));
            canvasHeight = Math.max(this.minHeight, Math.min(canvasHeight, this.maxHeight));
        }
        
        // Apply pixel ratio for high-DPI displays
        this.canvas.width = canvasWidth * this.pixelRatio;
        this.canvas.height = canvasHeight * this.pixelRatio;
        
        // Set display size
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        // Update game constants
        if (this.game) {
            // Update game width and height constants
            window.GAME_WIDTH = canvasWidth;
            window.GAME_HEIGHT = canvasHeight;
            
            // If the game has a camera, update its dimensions
            if (this.game.camera) {
                this.game.camera.width = canvasWidth;
                this.game.camera.height = canvasHeight;
            }
        }
        
        // Apply scaling for high-DPI displays
        const ctx = this.canvas.getContext('2d');
        ctx.scale(this.pixelRatio, this.pixelRatio);
        
        // Emit resize event
        if (window.eventEmitter) {
            window.eventEmitter.emit('canvas:resize', {
                width: canvasWidth,
                height: canvasHeight,
                pixelRatio: this.pixelRatio
            });
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        const container = this.canvas.parentElement;
        
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    }
    
    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}
