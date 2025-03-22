/**
 * Main.js
 * Entry point for the game application
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    const game = new Game();
    
    console.log('Last of the Weave initialized');
    
    // Log game constants for debugging
    console.log('Game constants:', {
        GAME_WIDTH,
        GAME_HEIGHT,
        FPS,
        PLAYER_BASE_HEALTH,
        PLAYER_BASE_DAMAGE,
        ENEMY_BASE_HEALTH,
        WAVE_DURATION
    });
});
