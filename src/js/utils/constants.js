/**
 * Game Constants
 * This file contains all the constant values used throughout the game
 */

// Game Settings
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// Player Settings
const PLAYER_SPEED = 5;
const PLAYER_SIZE = 32;
const PLAYER_BASE_HEALTH = 100;
const PLAYER_BASE_DAMAGE = 10;
const PLAYER_BASE_ATTACK_SPEED = 1; // attacks per second
const PLAYER_BASE_ATTACK_RANGE = 200;
const PLAYER_BASE_PICKUP_RANGE = 100;
const PLAYER_XP_TO_LEVEL = 100; // Base XP needed for first level

// Movement Settings
const PLAYER_DASH_SPEED = 15; // Speed multiplier during dash
const PLAYER_DASH_DURATION = 0.2; // Seconds
const PLAYER_DASH_COOLDOWN = 1.5; // Seconds
const PLAYER_MOMENTUM_FACTOR = 0.8; // How much momentum is preserved (0-1)
const PLAYER_FRICTION = 0.05; // Friction applied when not actively moving

// Enemy Settings
const ENEMY_BASE_HEALTH = 50;
const ENEMY_BASE_DAMAGE = 5;
const ENEMY_BASE_SPEED = 2;
const ENEMY_SIZE = 28;
const ENEMY_SPAWN_RATE = 1; // enemies per second
const ENEMY_SPAWN_INCREASE_RATE = 0.1; // increase per wave
const ENEMY_HEALTH_INCREASE_RATE = 0.1; // increase per wave
const ENEMY_DAMAGE_INCREASE_RATE = 0.1; // increase per wave

// Wave Settings
const WAVE_DURATION = 30; // seconds
const WAVE_BREAK_DURATION = 5; // seconds

// Upgrade Settings
const UPGRADES_PER_LEVEL = 3; // Number of upgrade options to show

// Character Types
const CHARACTER_TYPES = {
    WARRIOR: 'warrior',
    MAGE: 'mage',
    RANGER: 'ranger'
};

// Ability Types
const ABILITY_TYPES = {
    ACTIVE: 'active',
    PASSIVE: 'passive'
};

// Element Types
const ELEMENT_TYPES = {
    PHYSICAL: 'physical',
    FIRE: 'fire',
    ICE: 'ice',
    LIGHTNING: 'lightning',
    ARCANE: 'arcane'
};

// Game States
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    UPGRADE: 'upgrade',
    GAME_OVER: 'gameOver'
};
