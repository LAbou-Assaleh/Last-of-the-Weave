/**
 * DebugRenderer Class
 * Provides debug visualization tools for game development
 */

class DebugRenderer {
    /**
     * Create a new debug renderer
     * @param {Game} game - Game instance
     */
    constructor(game) {
        this.game = game;
        this.isEnabled = false;
        this.options = {
            showFPS: true,
            showColliders: true,
            showGrid: true,
            showPaths: false,
            showSpawnPoints: true,
            showBounds: true
        };
        this.colors = {
            collider: 'rgba(255, 0, 0, 0.3)',
            colliderStroke: 'rgba(255, 0, 0, 0.7)',
            grid: 'rgba(50, 50, 50, 0.5)',
            path: 'rgba(0, 255, 0, 0.5)',
            spawnPoint: 'rgba(255, 255, 0, 0.7)',
            bounds: 'rgba(0, 0, 255, 0.5)',
            text: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(0, 0, 0, 0.7)'
        };
    }

    /**
     * Toggle debug renderer on/off
     */
    toggle() {
        this.isEnabled = !this.isEnabled;
    }

    /**
     * Toggle specific debug option
     * @param {string} option - Option name
     */
    toggleOption(option) {
        if (option in this.options) {
            this.options[option] = !this.options[option];
        }
    }

    /**
     * Render debug information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {TimeManager} timeManager - Time manager instance
     * @param {Camera} camera - Camera instance
     */
    render(ctx, timeManager, camera) {
        if (!this.isEnabled) return;

        // Save context state
        ctx.save();

        // Draw world-space debug elements
        if (camera) {
            camera.apply(ctx);
            this.renderWorldDebug(ctx, camera);
            camera.restore(ctx);
        }

        // Draw screen-space debug elements
        this.renderScreenDebug(ctx, timeManager);

        // Restore context state
        ctx.restore();
    }

    /**
     * Render world-space debug elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera instance
     */
    renderWorldDebug(ctx, camera) {
        // Draw grid
        if (this.options.showGrid) {
            this.renderGrid(ctx, camera);
        }

        // Draw colliders
        if (this.options.showColliders) {
            this.renderColliders(ctx);
        }

        // Draw spawn points
        if (this.options.showSpawnPoints) {
            this.renderSpawnPoints(ctx);
        }

        // Draw world bounds
        if (this.options.showBounds) {
            this.renderBounds(ctx, camera);
        }

        // Draw paths
        if (this.options.showPaths) {
            this.renderPaths(ctx);
        }
    }

    /**
     * Render screen-space debug elements
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {TimeManager} timeManager - Time manager instance
     */
    renderScreenDebug(ctx, timeManager) {
        // Draw FPS counter
        if (this.options.showFPS && timeManager) {
            this.renderFPS(ctx, timeManager);
        }

        // Draw game state info
        this.renderGameInfo(ctx);

        // Draw controls help
        this.renderControlsHelp(ctx);
    }

    /**
     * Render FPS counter
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {TimeManager} timeManager - Time manager instance
     */
    renderFPS(ctx, timeManager) {
        const fps = timeManager.getFPS();
        const frameTime = Math.round(timeManager.getAverageFrameTime() * 1000);
        
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(10, 10, 150, 60);
        
        ctx.font = '14px monospace';
        ctx.fillStyle = this.colors.text;
        ctx.fillText(`FPS: ${fps}`, 20, 30);
        ctx.fillText(`Frame Time: ${frameTime}ms`, 20, 50);
    }

    /**
     * Render game information
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderGameInfo(ctx) {
        const canvas = ctx.canvas;
        const info = [
            `State: ${this.game.state}`,
            `Wave: ${this.game.currentWave}`,
            `Enemies: ${this.game.enemies.length}`,
            `Projectiles: ${this.game.projectiles.length}`
        ];
        
        if (this.game.player) {
            info.push(`Player Health: ${Math.floor(this.game.player.stats.health)}/${Math.floor(this.game.player.stats.maxHealth)}`);
            info.push(`Player Level: ${this.game.player.level}`);
            info.push(`XP: ${this.game.player.experience}/${this.game.player.experienceToNextLevel}`);
        }
        
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(10, 80, 200, 30 + info.length * 20);
        
        ctx.font = '14px monospace';
        ctx.fillStyle = this.colors.text;
        ctx.fillText('Game Info:', 20, 100);
        
        info.forEach((text, index) => {
            ctx.fillText(text, 20, 120 + index * 20);
        });
    }

    /**
     * Render controls help
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderControlsHelp(ctx) {
        const canvas = ctx.canvas;
        const controls = [
            'WASD/Arrows: Move',
            'F1: Toggle Debug',
            'F2: Toggle Colliders',
            'F3: Toggle Grid',
            'F4: Toggle Spawn Points'
        ];
        
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(canvas.width - 210, 10, 200, 30 + controls.length * 20);
        
        ctx.font = '14px monospace';
        ctx.fillStyle = this.colors.text;
        ctx.fillText('Controls:', canvas.width - 200, 30);
        
        controls.forEach((text, index) => {
            ctx.fillText(text, canvas.width - 200, 50 + index * 20);
        });
    }

    /**
     * Render grid
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera instance
     */
    renderGrid(ctx, camera) {
        const gridSize = 100;
        const viewportWidth = ctx.canvas.width / camera.scale;
        const viewportHeight = ctx.canvas.height / camera.scale;
        
        // Calculate grid boundaries based on camera position
        const startX = Math.floor(camera.x / gridSize) * gridSize;
        const startY = Math.floor(camera.y / gridSize) * gridSize;
        const endX = camera.x + viewportWidth + gridSize;
        const endY = camera.y + viewportHeight + gridSize;
        
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }

    /**
     * Render colliders
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderColliders(ctx) {
        // Draw player collider
        if (this.game.player && this.game.player.isAlive) {
            ctx.fillStyle = this.colors.collider;
            ctx.strokeStyle = this.colors.colliderStroke;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(this.game.player.x, this.game.player.y, this.game.player.stats.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw attack range
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(this.game.player.x, this.game.player.y, this.game.player.stats.attackRange, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw enemy colliders
        this.game.enemies.forEach(enemy => {
            if (!enemy.isAlive) return;
            
            ctx.fillStyle = this.colors.collider;
            ctx.strokeStyle = this.colors.colliderStroke;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        
        // Draw projectile colliders
        this.game.projectiles.forEach(projectile => {
            ctx.fillStyle = this.colors.collider;
            ctx.strokeStyle = this.colors.colliderStroke;
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    /**
     * Render spawn points
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderSpawnPoints(ctx) {
        // This is a simplified version - in a real game, you'd have actual spawn points
        const spawnDistance = 100;
        const viewportWidth = ctx.canvas.width;
        const viewportHeight = ctx.canvas.height;
        
        ctx.fillStyle = this.colors.spawnPoint;
        ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
        ctx.lineWidth = 2;
        
        // Top edge
        for (let x = 0; x < viewportWidth; x += 200) {
            ctx.beginPath();
            ctx.arc(x, -spawnDistance, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Right edge
        for (let y = 0; y < viewportHeight; y += 200) {
            ctx.beginPath();
            ctx.arc(viewportWidth + spawnDistance, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Bottom edge
        for (let x = 0; x < viewportWidth; x += 200) {
            ctx.beginPath();
            ctx.arc(x, viewportHeight + spawnDistance, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        
        // Left edge
        for (let y = 0; y < viewportHeight; y += 200) {
            ctx.beginPath();
            ctx.arc(-spawnDistance, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }

    /**
     * Render world bounds
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Camera} camera - Camera instance
     */
    renderBounds(ctx, camera) {
        if (!camera.bounds) return;
        
        const { minX, minY, maxX, maxY } = camera.bounds;
        
        ctx.strokeStyle = this.colors.bounds;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.rect(minX, minY, maxX - minX, maxY - minY);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }

    /**
     * Render paths
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderPaths(ctx) {
        // Draw paths from enemies to player
        if (this.game.player && this.game.player.isAlive) {
            ctx.strokeStyle = this.colors.path;
            ctx.lineWidth = 1;
            
            this.game.enemies.forEach(enemy => {
                if (!enemy.isAlive) return;
                
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(this.game.player.x, this.game.player.y);
                ctx.stroke();
            });
        }
    }
}
