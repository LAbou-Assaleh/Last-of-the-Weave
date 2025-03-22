# DECISIONS.md

## Last of the Weave - Design Decisions

This file documents key architectural choices, technology selections, design patterns, and rationales for important decisions made during the development of Last of the Weave.

## Technology Stack

### HTML5, CSS3, and Vanilla JavaScript
- **Decision**: Use vanilla JavaScript without additional frameworks for the initial implementation
- **Rationale**: 
  - Simplifies the initial development process
  - Reduces dependencies and potential compatibility issues
  - Provides a solid foundation that can be extended with frameworks later if needed
  - Better learning experience for understanding core game development concepts

### Canvas API
- **Decision**: Use HTML5 Canvas for rendering the game
- **Rationale**:
  - Provides efficient 2D rendering capabilities
  - Well-supported across modern browsers
  - Allows for pixel-level control of graphics
  - Suitable for the top-down 2D style of the game

## Architecture

### Object-Oriented Design
- **Decision**: Structure the game using object-oriented programming principles
- **Rationale**:
  - Encapsulates game entities (characters, enemies, abilities) as classes
  - Provides clear inheritance hierarchies for game objects
  - Makes the codebase more maintainable and extensible
  - Facilitates the creation of new game elements

### Event-Driven Communication
- **Decision**: Implement an event emitter system for game-wide communication
- **Rationale**:
  - Decouples game components, reducing direct dependencies
  - Allows for flexible communication between systems
  - Makes it easier to add new features without modifying existing code
  - Simplifies debugging by centralizing event handling

### Component-Based File Structure
- **Decision**: Organize code by component type rather than by feature
- **Rationale**:
  - Provides clear separation of concerns
  - Makes it easier to locate specific code
  - Aligns with the object-oriented design approach
  - Facilitates collaboration and maintenance

## Game Design Patterns

### Factory Pattern
- **Decision**: Use factory classes for creating game entities
- **Rationale**:
  - Centralizes object creation logic
  - Simplifies the creation of complex objects
  - Makes it easier to add new entity types
  - Provides a consistent interface for object creation

#### CharacterFactory Implementation
- **Decision**: Create a dedicated CharacterFactory class for character instantiation
- **Rationale**:
  - Separates character creation logic from game flow
  - Enables different character types with unique stats and attributes
  - Provides a single point of modification for character creation
  - Implements validation and fallback mechanisms for error handling
  - Facilitates future addition of new character types

### Observer Pattern (via Event Emitter)
- **Decision**: Implement observer pattern through the event emitter
- **Rationale**:
  - Allows systems to react to game events without tight coupling
  - Facilitates communication between unrelated components
  - Makes the system more modular and extensible

### State Pattern
- **Decision**: Use state pattern for game state management
- **Rationale**:
  - Clearly separates different game states (menu, playing, upgrade, game over)
  - Makes state transitions explicit and manageable
  - Simplifies the handling of state-specific behavior

## Game Mechanics

### Character Type System
- **Decision**: Implement three distinct character types (Warrior, Mage, Ranger) with unique attributes
- **Rationale**:
  - Provides gameplay variety and replayability
  - Allows players to choose a playstyle that suits their preferences
  - Creates strategic depth through different character strengths and weaknesses
  - Establishes a foundation for future character-specific abilities and upgrades

### Auto-Attack System
- **Decision**: Implement auto-attacking for the player character
- **Rationale**:
  - Aligns with the roguelite genre conventions
  - Allows players to focus on movement and ability management
  - Simplifies the control scheme for better accessibility

### Wave-Based Progression
- **Decision**: Structure enemy spawning around timed waves
- **Rationale**:
  - Creates a clear sense of progression
  - Provides natural pacing for the game
  - Makes difficulty scaling more predictable and manageable

### Ability and Passive System
- **Decision**: Separate abilities into active and passive categories
- **Rationale**:
  - Provides diverse gameplay options
  - Creates interesting synergies between different abilities
  - Allows for strategic depth in character building

## Future Considerations

### Potential Framework Integration
- **Decision**: Design the codebase to potentially integrate with a framework like Phaser.js or React in the future
- **Rationale**:
  - Maintains flexibility for future development
  - Allows for scaling the project as it grows in complexity
  - Provides a path for adding more advanced features

### Asset Pipeline
- **Decision**: Use placeholder assets initially with a clear path to replace them
- **Rationale**:
  - Allows for faster initial development
  - Separates art production from game mechanics implementation
  - Makes it easier to update visuals without affecting functionality
