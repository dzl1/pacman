# Game Hub - Classic Games Reimagined in 3D

A collection of classic games reimagined using Three.js with stunning 3D graphics, smooth animations, and particle effects. This project serves as a game hub platform that can easily accommodate multiple games.

## Features

- 🎮 Multiple game titles in a central hub
- 🌟 3D graphics powered by Three.js
- ✨ Particle effects and animations
- 🔗 Easy integration of new games
- 📦 Git-friendly project structure
- 🎯 Organized game folders for scalability

## Available Games

### Pac-Man 3D
A full 3D remake of the classic Pac-Man game featuring:
- 3D maze environment with glowing walls
- Smooth character movement and controls
- Four AI-controlled colorful ghosts
- Power pellets to turn the tables
- Score tracking and progressive levels
- Particle explosion effects

Play the game: Visit `/games/pacman/`

## Project Structure

```
pacman/
├── index.html           # Landing page / home
├── landing.css          # Landing page styles
├── package.json         # Project dependencies
├── README.md            # This file
├── .gitignore           # Git ignore file
└── games/
    └── pacman/
        ├── index.html   # Game page
        ├── main.js      # Game logic
        ├── style.css    # Game styles
        └── ...
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173/`
4. Click "Play Now" on the Pac-Man card to start playing!

## Game Controls (Pac-Man)

- **Arrow Keys** or **WASD**: Move Pac-Man
- Navigate through the maze, collect all dots while avoiding ghosts
- Collect power pellets (large glowing spheres) to temporarily make ghosts vulnerable

## Gameplay

- Collect all dots to advance to the next level
- Avoid ghosts or you'll lose a life
- Eat power pellets to turn ghosts blue and vulnerable
- Eating vulnerable ghosts gives bonus points
- Game over when all lives are lost

## Adding New Games

To add a new game to the hub:

1. Create a new folder under `games/`:
   ```bash
   mkdir games/your-game-name
   ```

2. Create the game files (index.html, main.js, style.css)

3. Update the landing page index.html to add a card linking to the new game

4. Ensure the game has a back button linking to `/`

## Referencing Other Git Projects

You can reference and integrate code from other Git repositories in several ways:

### 1. As npm dependencies (if published)
```bash
npm install <package-name>
```

### 2. As Git submodules
```bash
git submodule add <repository-url> <destination-folder>
```

### 3. Direct Git URL in package.json
```json
{
  "dependencies": {
    "some-package": "git+https://github.com/user/repo.git"
  }
}
```

### 4. Clone and reference locally
```bash
# Clone the repository
git clone <repository-url> games/external-game

# Import in your code
import something from '../path-to-external-game/src/module.js';
```

## Technologies Used

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: Game logic
- **Git**: Version control and external project management

## Future Enhancements

Ideas for expanding the Game Hub:
- Add more classic games (Snake, Tetris, Space Invaders, etc.)
- Implement leaderboards and score persistence
- Add sound effects and background music
- Create more sophisticated AI for ghosts
- Add different maze layouts and difficulty levels
- Include multiplayer support
- Add a level editor tool

## License

MIT

