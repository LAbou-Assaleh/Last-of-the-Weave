# TODO.md

## Last of the Weave - Development Tasks

This file tracks prioritized tasks, dependencies, and status for the Last of the Weave game development.

### Status Legend
- [✓] Completed
- [🔄] In Progress
- [ ] Not Started

## Project Setup

- [✓] Initialize Git repository
- [✓] Create basic project structure
- [✓] Set up HTML, CSS, and JavaScript foundation
- [✓] Create documentation files (PROGRESS.md, TODO.md, DECISIONS.md)
- [✓] Create development roadmap
- [✓] Push initial setup to GitHub repository

## Core Game Mechanics

- [✓] Implement canvas rendering system
  - Dependencies: None
  - Priority: High
  - Subtasks:
    - [✓] Fix canvas resizing to properly handle window size changes
    - [✓] Implement proper game loop with consistent frame timing
    - [✓] Create camera/viewport system for game world
    - [✓] Add debug rendering options for development

- [✓] Implement player character movement
  - Dependencies: Canvas rendering system
  - Priority: High
  - Subtasks:
    - [✓] Implement smooth keyboard input handling
    - [✓] Add acceleration and deceleration for natural movement
    - [✓] Implement boundary collision detection
    - [✓] Add visual feedback for player movement direction

- [✓] Implement enemy spawning system
  - Dependencies: Canvas rendering system
  - Priority: High
  - Subtasks:
    - [✓] Create wave-based spawning system with increasing difficulty
    - [✓] Implement spawn points outside visible screen area
    - [✓] Add basic enemy movement AI to follow player
    - [✓] Create different enemy types with varying behaviors

- [ ] Implement collision detection
  - Dependencies: Player movement, Enemy spawning
  - Priority: High

- [ ] Implement combat system (auto-attack)
  - Dependencies: Collision detection
  - Priority: High

- [ ] Implement experience and leveling system
  - Dependencies: Combat system
  - Priority: Medium

## Game Systems

- [ ] Implement wave management
  - Dependencies: Enemy spawning system
  - Priority: Medium

- [ ] Implement ability/upgrade selection
  - Dependencies: Experience and leveling system
  - Priority: Medium

- [ ] Implement projectile system
  - Dependencies: Canvas rendering system
  - Priority: Medium

- [ ] Implement area effect system
  - Dependencies: Canvas rendering system
  - Priority: Medium

- [ ] Implement passive stat boost system
  - Dependencies: Character stats system
  - Priority: Medium

## UI Implementation

- [ ] Implement health and XP bars
  - Dependencies: Combat system, Experience system
  - Priority: Medium

- [ ] Implement wave and time counters
  - Dependencies: Wave management
  - Priority: Low

- [ ] Implement upgrade selection panel
  - Dependencies: Ability/upgrade selection
  - Priority: Medium

- [ ] Implement game over screen
  - Dependencies: Combat system
  - Priority: Low

- [ ] Implement character selection screen
  - Dependencies: None
  - Priority: Low

## Visual and Polish

- [ ] Add basic visual effects for abilities
  - Dependencies: Ability system
  - Priority: Low

- [✓] Add visual feedback for attacks and damage
  - Dependencies: Combat system
  - Priority: High
  - Subtasks:
    - [✓] Implement player attack animations
    - [✓] Implement enemy attack animations
    - [✓] Add impact effects at point of damage
    - [✓] Add floating damage numbers
    - [✓] Create attack cooldown indicators

- [ ] Add basic sound effects
  - Dependencies: None
  - Priority: Low

- [ ] Add background music
  - Dependencies: None
  - Priority: Low

## Deployment

- [ ] Set up GitHub Pages deployment
  - Dependencies: Functional game
  - Priority: Low

- [ ] Create README with instructions
  - Dependencies: None
  - Priority: Medium

- [ ] Test cross-browser compatibility
  - Dependencies: Functional game
  - Priority: Low
