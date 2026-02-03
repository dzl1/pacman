# 3D Pac-Man Game with Three.js

A modern 3D remake of the classic Pac-Man game built with Three.js, featuring smooth animations, particle effects, and immersive 3D graphics.

## Features

- 🎮 Full 3D maze environment
- 🌟 Particle explosion effects for celebrations
- 👻 Four colorful ghosts with AI
- ⚡ Power pellets to turn the tables on ghosts
- 🎯 Score tracking and lives system
- 📈 Progressive difficulty with levels
- 🎨 Glowing effects and dynamic lighting
- 🎹 Arrow keys or WASD controls

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the local server URL (typically `http://localhost:5173`)

## Controls

- **Arrow Keys** or **WASD**: Move Pac-Man
- Navigate through the maze, collect all dots while avoiding ghosts
- Collect power pellets (large glowing spheres) to temporarily make ghosts vulnerable

## Gameplay

- Collect all dots to advance to the next level
- Avoid ghosts or you'll lose a life
- Eat power pellets to turn ghosts blue and vulnerable
- Eating vulnerable ghosts gives bonus points
- Game over when all lives are lost

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
git clone <repository-url> libs/external-project

# Import in your code
import something from '../libs/external-project/src/module.js';
```

## Project Structure

```
pacman/
├── index.html          # Main HTML file
├── main.js            # Game logic and Three.js code
├── style.css          # Styling
├── package.json       # Dependencies
└── README.md          # This file
```

## Technologies Used

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: Game logic

## Future Enhancements

Ideas for extending this project:
- Add sound effects and music
- Implement more sophisticated ghost AI
- Add different maze layouts
- Include power-ups and bonuses
- Add multiplayer support
- Create a level editor

## License

MIT
