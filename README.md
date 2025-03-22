# Last of the Weave

A browser-based 2D top-down action roguelite where players must survive endless waves of enemies by weaving together powerful abilities and passives.

## Game Overview

In Last of the Weave, you play as one of the last remaining "Weavers" who channel ancient threads of power to hold off the unraveling forces of chaos. The game features:

- Auto-attacking gameplay with strategic movement
- Randomized ability and passive upgrades as you level up
- Multiple playable characters with different starting stats
- Endless waves of increasingly difficult enemies
- Meta-progression system to unlock permanent bonuses

## Play the Game

You can play the game directly in your browser at: https://labou-assaleh.github.io/Last-of-the-Weave/

## Development

### Project Structure

```
Last-of-the-Weave/
├── assets/
│   ├── images/
│   └── audio/
├── src/
│   ├── js/
│   │   ├── abilities/
│   │   ├── characters/
│   │   ├── enemies/
│   │   ├── ui/
│   │   └── utils/
│   └── css/
├── docs/
├── index.html
├── README.md
├── PROGRESS.md
├── TODO.md
├── DECISIONS.md
└── ROADMAP.md
```

### Running Locally

To run the game locally:

1. Clone the repository:
   ```
   git clone https://github.com/LAbou-Assaleh/Last-of-the-Weave.git
   ```

2. Navigate to the project directory:
   ```
   cd Last-of-the-Weave
   ```

3. Open `index.html` in your browser, or use a local server:
   ```
   # Using Python 3
   python -m http.server
   
   # Using Node.js
   npx serve
   ```

4. Access the game at `http://localhost:8000` (or the port shown in your terminal)

### Development Roadmap

See [ROADMAP.md](ROADMAP.md) for the detailed development plan.

### Task Tracking

See [TODO.md](TODO.md) for the current task list and priorities.

### Design Decisions

See [DECISIONS.md](DECISIONS.md) for documentation on architectural choices and design patterns.

### Progress Log

See [PROGRESS.md](PROGRESS.md) for development progress updates.

## Deployment

The game is deployed using GitHub Pages from the main branch. Any changes pushed to the main branch will automatically be deployed to the live site.

To deploy your own version:

1. Fork this repository
2. Go to your repository settings
3. Navigate to the "Pages" section
4. Set the source to "Deploy from a branch"
5. Select the "main" branch and "/ (root)" folder
6. Click "Save"

Your game will be available at `https://[your-username].github.io/Last-of-the-Weave/`

## License

This project uses placeholder assets and is intended for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
