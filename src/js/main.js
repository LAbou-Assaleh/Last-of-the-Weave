/**
 * Main JavaScript file
 * Entry point for the game
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Create global event emitter
    window.eventEmitter = new EventEmitter();
    
    // Create game instance
    const game = new Game();
    
    // Add event listeners for UI buttons
    document.getElementById('start-button').addEventListener('click', () => {
        // Get selected character type
        const characterType = document.querySelector('input[name="character-type"]:checked').value;
        
        // Hide menu
        document.getElementById('menu').style.display = 'none';
        
        // Show game UI
        document.getElementById('game-ui').style.display = 'block';
        
        // Start game
        game.startGame(characterType);
    });
    
    // Add event listener for pause button
    document.getElementById('pause-button').addEventListener('click', () => {
        game.togglePause();
        
        // Update button text
        const pauseButton = document.getElementById('pause-button');
        pauseButton.textContent = game.isPaused ? 'Resume' : 'Pause';
    });
    
    // Add event listener for restart button
    document.getElementById('restart-button').addEventListener('click', () => {
        // Hide game over screen
        document.getElementById('game-over').style.display = 'none';
        
        // Show menu
        document.getElementById('menu').style.display = 'flex';
    });
    
    // Add keyboard controls info
    const controlsInfo = document.createElement('div');
    controlsInfo.className = 'controls-info';
    controlsInfo.innerHTML = `
        <h3>Controls:</h3>
        <p>WASD or Arrow Keys: Move</p>
        <p>Space: Dash</p>
        <p>Auto-attack: Automatic</p>
        <p>F1: Toggle Debug Mode</p>
    `;
    document.getElementById('menu').appendChild(controlsInfo);
    
    // Add dash info to game UI
    const dashInfo = document.createElement('div');
    dashInfo.id = 'dash-info';
    dashInfo.className = 'dash-info';
    dashInfo.innerHTML = `<span>DASH: READY</span>`;
    document.getElementById('game-ui').appendChild(dashInfo);
    
    // Listen for dash events to update UI
    eventEmitter.on('player:dashStart', () => {
        dashInfo.innerHTML = `<span class="dash-active">DASHING</span>`;
    });
    
    eventEmitter.on('player:dashEnd', () => {
        dashInfo.innerHTML = `<span class="dash-cooldown">DASH: COOLDOWN</span>`;
        
        // Create a cooldown timer
        const updateDashCooldown = () => {
            if (game.player && game.player.dashCooldown > 0) {
                const cooldownPercent = Math.floor((game.player.dashCooldown / PLAYER_DASH_COOLDOWN) * 100);
                dashInfo.innerHTML = `<span class="dash-cooldown">DASH: ${cooldownPercent}%</span>`;
                requestAnimationFrame(updateDashCooldown);
            } else {
                dashInfo.innerHTML = `<span>DASH: READY</span>`;
            }
        };
        
        requestAnimationFrame(updateDashCooldown);
    });
});
