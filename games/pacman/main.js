import * as THREE from 'three';

// Game State
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    gameStarted: false,
    gameOver: false,
    powerUpActive: false,
    powerUpTimer: 0
};

// Maze layout (1 = wall, 0 = path, 2 = dot, 3 = power pellet)
const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(7, 20, 18);
camera.lookAt(7, 0, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const container = document.getElementById('game-container');
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(7, 15, 7);
pointLight.castShadow = true;
scene.add(pointLight);

// Directional lights for better visibility
const dirLight1 = new THREE.DirectionalLight(0x4444ff, 0.5);
dirLight1.position.set(5, 10, 5);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xff4444, 0.5);
dirLight2.position.set(10, 10, 10);
scene.add(dirLight2);

// Game objects
let pacman, dots = [], powerPellets = [], ghosts = [], walls = [];
let pacmanDirection = { x: 0, z: 0 };
let nextDirection = { x: 0, z: 0 };
const CELL_SIZE = 1;
const PACMAN_SPEED = 0.05;
const GHOST_SPEED = 0.03;

// Create Pac-Man
function createPacman() {
    const geometry = new THREE.SphereGeometry(0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 1.5);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.3
    });
    pacman = new THREE.Mesh(geometry, material);
    pacman.position.set(1, 0.4, 1);
    pacman.castShadow = true;
    scene.add(pacman);

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    pacman.add(glow);
}

// Create maze
function createMaze() {
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0066ff,
        emissive: 0x0033ff,
        emissiveIntensity: 0.2
    });
    
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const cell = mazeLayout[row][col];
            
            if (cell === 1) {
                // Wall
                const geometry = new THREE.BoxGeometry(CELL_SIZE, 1, CELL_SIZE);
                const wall = new THREE.Mesh(geometry, wallMaterial);
                wall.position.set(col * CELL_SIZE, 0.5, row * CELL_SIZE);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
                walls.push({ x: col, z: row });
            } else if (cell === 2) {
                // Dot
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5
                });
                const dot = new THREE.Mesh(geometry, material);
                dot.position.set(col * CELL_SIZE, 0.1, row * CELL_SIZE);
                scene.add(dot);
                dots.push({ mesh: dot, x: col, z: row, collected: false });
            } else if (cell === 3) {
                // Power pellet
                const geometry = new THREE.SphereGeometry(0.2, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xff00ff,
                    emissive: 0xff00ff,
                    emissiveIntensity: 0.7
                });
                const pellet = new THREE.Mesh(geometry, material);
                pellet.position.set(col * CELL_SIZE, 0.2, row * CELL_SIZE);
                scene.add(pellet);
                powerPellets.push({ mesh: pellet, x: col, z: row, collected: false });
            }
        }
    }

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(15, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000033,
        side: THREE.DoubleSide 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(7, 0, 7);
    floor.receiveShadow = true;
    scene.add(floor);
}

// Create ghosts
function createGhosts() {
    const ghostColors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb851];
    const startPositions = [
        { x: 7, z: 7 },
        { x: 6, z: 7 },
        { x: 8, z: 7 },
        { x: 7, z: 6 }
    ];

    ghostColors.forEach((color, index) => {
        const geometry = new THREE.SphereGeometry(0.35, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const ghost = new THREE.Mesh(geometry, material);
        ghost.position.set(startPositions[index].x, 0.35, startPositions[index].z);
        ghost.castShadow = true;
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.1, 0.3);
        ghost.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.1, 0.3);
        ghost.add(rightEye);
        
        scene.add(ghost);
        ghosts.push({
            mesh: ghost,
            direction: { x: 0, z: 0 },
            vulnerable: false
        });
    });
}

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        nextDirection = { x: 0, z: -1 };
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        nextDirection = { x: 0, z: 1 };
    } else if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        nextDirection = { x: -1, z: 0 };
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        nextDirection = { x: 1, z: 0 };
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Collision detection
function isWall(x, z) {
    const gridX = Math.round(x / CELL_SIZE);
    const gridZ = Math.round(z / CELL_SIZE);
    
    if (gridZ < 0 || gridZ >= mazeLayout.length || gridX < 0 || gridX >= mazeLayout[0].length) {
        return true;
    }
    
    return mazeLayout[gridZ][gridX] === 1;
}

function canMove(x, z, direction) {
    const nextX = x + direction.x * PACMAN_SPEED;
    const nextZ = z + direction.z * PACMAN_SPEED;
    return !isWall(nextX, nextZ);
}

// Update Pac-Man
function updatePacman() {
    if (!gameState.gameStarted || gameState.gameOver) return;

    // Try to change direction
    if (canMove(pacman.position.x, pacman.position.z, nextDirection)) {
        pacmanDirection = { ...nextDirection };
    }

    // Move in current direction
    if (canMove(pacman.position.x, pacman.position.z, pacmanDirection)) {
        pacman.position.x += pacmanDirection.x * PACMAN_SPEED;
        pacman.position.z += pacmanDirection.z * PACMAN_SPEED;
        
        // Rotate Pac-Man
        if (pacmanDirection.x !== 0 || pacmanDirection.z !== 0) {
            const angle = Math.atan2(pacmanDirection.x, pacmanDirection.z);
            pacman.rotation.y = -angle;
        }
    }

    // Check dot collection
    dots.forEach(dot => {
        if (!dot.collected) {
            const distance = Math.sqrt(
                Math.pow(pacman.position.x - dot.x * CELL_SIZE, 2) +
                Math.pow(pacman.position.z - dot.z * CELL_SIZE, 2)
            );
            if (distance < 0.5) {
                dot.collected = true;
                scene.remove(dot.mesh);
                gameState.score += 10;
                updateHUD();
                
                // Celebration effect
                createParticleExplosion(dot.x * CELL_SIZE, 0.1, dot.z * CELL_SIZE, 0xffffff);
            }
        }
    });

    // Check power pellet collection
    powerPellets.forEach(pellet => {
        if (!pellet.collected) {
            const distance = Math.sqrt(
                Math.pow(pacman.position.x - pellet.x * CELL_SIZE, 2) +
                Math.pow(pacman.position.z - pellet.z * CELL_SIZE, 2)
            );
            if (distance < 0.5) {
                pellet.collected = true;
                scene.remove(pellet.mesh);
                gameState.score += 50;
                gameState.powerUpActive = true;
                gameState.powerUpTimer = 300; // 5 seconds at 60fps
                updateHUD();
                
                // Power-up effect
                ghosts.forEach(ghost => {
                    ghost.vulnerable = true;
                    ghost.mesh.material.color.setHex(0x0000ff);
                });
                createParticleExplosion(pellet.x * CELL_SIZE, 0.2, pellet.z * CELL_SIZE, 0xff00ff);
            }
        }
    });

    // Check if level complete
    const allDotsCollected = dots.every(dot => dot.collected) && 
                            powerPellets.every(pellet => pellet.collected);
    if (allDotsCollected) {
        nextLevel();
    }
}

// Update ghosts
function updateGhosts() {
    if (!gameState.gameStarted || gameState.gameOver) return;

    ghosts.forEach(ghost => {
        // Simple AI: random direction changes
        if (Math.random() < 0.02) {
            const directions = [
                { x: 1, z: 0 },
                { x: -1, z: 0 },
                { x: 0, z: 1 },
                { x: 0, z: -1 }
            ];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        // Move ghost
        const nextX = ghost.mesh.position.x + ghost.direction.x * GHOST_SPEED;
        const nextZ = ghost.mesh.position.z + ghost.direction.z * GHOST_SPEED;
        
        if (!isWall(nextX, nextZ)) {
            ghost.mesh.position.x = nextX;
            ghost.mesh.position.z = nextZ;
        } else {
            // Change direction if hitting wall
            const directions = [
                { x: 1, z: 0 },
                { x: -1, z: 0 },
                { x: 0, z: 1 },
                { x: 0, z: -1 }
            ];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }

        // Check collision with Pac-Man
        const distance = Math.sqrt(
            Math.pow(pacman.position.x - ghost.mesh.position.x, 2) +
            Math.pow(pacman.position.z - ghost.mesh.position.z, 2)
        );
        
        if (distance < 0.6) {
            if (ghost.vulnerable) {
                // Eat ghost
                ghost.mesh.position.set(7, 0.35, 7);
                ghost.vulnerable = false;
                gameState.score += 200;
                updateHUD();
                createParticleExplosion(ghost.mesh.position.x, 0.35, ghost.mesh.position.z, 0x0000ff);
            } else {
                // Lose life
                loseLife();
            }
        }
    });

    // Power-up timer
    if (gameState.powerUpActive) {
        gameState.powerUpTimer--;
        if (gameState.powerUpTimer <= 0) {
            gameState.powerUpActive = false;
            ghosts.forEach((ghost, index) => {
                ghost.vulnerable = false;
                const ghostColors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb851];
                ghost.mesh.material.color.setHex(ghostColors[index]);
            });
        }
    }
}

// Particle explosion effect
function createParticleExplosion(x, y, z, color) {
    const particleCount = 20;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const particle = new THREE.Mesh(geometry, material);
        
        particle.position.set(x, y, z);
        particle.velocity = {
            x: (Math.random() - 0.5) * 0.2,
            y: Math.random() * 0.2,
            z: (Math.random() - 0.5) * 0.2
        };
        particle.life = 30;
        
        scene.add(particle);
        particles.push(particle);
    }
    
    // Animate particles
    const animateParticles = () => {
        particles.forEach((particle, index) => {
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;
            particle.velocity.y -= 0.01; // Gravity
            particle.life--;
            particle.material.opacity = particle.life / 30;
            particle.material.transparent = true;
            
            if (particle.life <= 0) {
                scene.remove(particle);
                particles.splice(index, 1);
            }
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(animateParticles);
        }
    };
    
    animateParticles();
}

// Game functions
function updateHUD() {
    document.getElementById('score-value').textContent = gameState.score;
    document.getElementById('lives-value').textContent = gameState.lives;
    document.getElementById('level-value').textContent = gameState.level;
}

function loseLife() {
    gameState.lives--;
    updateHUD();
    
    if (gameState.lives <= 0) {
        endGame();
    } else {
        // Reset positions
        pacman.position.set(1, 0.4, 1);
        pacmanDirection = { x: 0, z: 0 };
        nextDirection = { x: 0, z: 0 };
        
        ghosts.forEach((ghost, index) => {
            const startPositions = [
                { x: 7, z: 7 },
                { x: 6, z: 7 },
                { x: 8, z: 7 },
                { x: 7, z: 6 }
            ];
            ghost.mesh.position.set(startPositions[index].x, 0.35, startPositions[index].z);
        });
    }
}

function nextLevel() {
    gameState.level++;
    gameState.score += 500;
    updateHUD();
    
    // Reset maze
    dots.forEach(dot => {
        if (!dot.collected) {
            scene.remove(dot.mesh);
        }
    });
    powerPellets.forEach(pellet => {
        if (!pellet.collected) {
            scene.remove(pellet.mesh);
        }
    });
    
    dots = [];
    powerPellets = [];
    
    // Recreate dots and pellets
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const cell = mazeLayout[row][col];
            
            if (cell === 2) {
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5
                });
                const dot = new THREE.Mesh(geometry, material);
                dot.position.set(col * CELL_SIZE, 0.1, row * CELL_SIZE);
                scene.add(dot);
                dots.push({ mesh: dot, x: col, z: row, collected: false });
            } else if (cell === 3) {
                const geometry = new THREE.SphereGeometry(0.2, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xff00ff,
                    emissive: 0xff00ff,
                    emissiveIntensity: 0.7
                });
                const pellet = new THREE.Mesh(geometry, material);
                pellet.position.set(col * CELL_SIZE, 0.2, row * CELL_SIZE);
                scene.add(pellet);
                powerPellets.push({ mesh: pellet, x: col, z: row, collected: false });
            }
        }
    }
    
    // Reset positions
    pacman.position.set(1, 0.4, 1);
    pacmanDirection = { x: 0, z: 0 };
    nextDirection = { x: 0, z: 0 };
}

function endGame() {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').classList.remove('hidden');
}

function startGame() {
    gameState.gameStarted = true;
    gameState.gameOver = false;
    document.getElementById('instructions').classList.add('hidden');
}

function restartGame() {
    // Reset game state
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    
    // Reset positions
    pacman.position.set(1, 0.4, 1);
    pacmanDirection = { x: 0, z: 0 };
    nextDirection = { x: 0, z: 0 };
    
    // Reset dots and pellets
    dots.forEach(dot => scene.remove(dot.mesh));
    powerPellets.forEach(pellet => scene.remove(pellet.mesh));
    dots = [];
    powerPellets = [];
    
    // Recreate maze items
    for (let row = 0; row < mazeLayout.length; row++) {
        for (let col = 0; col < mazeLayout[row].length; col++) {
            const cell = mazeLayout[row][col];
            
            if (cell === 2) {
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.5
                });
                const dot = new THREE.Mesh(geometry, material);
                dot.position.set(col * CELL_SIZE, 0.1, row * CELL_SIZE);
                scene.add(dot);
                dots.push({ mesh: dot, x: col, z: row, collected: false });
            } else if (cell === 3) {
                const geometry = new THREE.SphereGeometry(0.2, 16, 16);
                const material = new THREE.MeshStandardMaterial({ 
                    color: 0xff00ff,
                    emissive: 0xff00ff,
                    emissiveIntensity: 0.7
                });
                const pellet = new THREE.Mesh(geometry, material);
                pellet.position.set(col * CELL_SIZE, 0.2, row * CELL_SIZE);
                scene.add(pellet);
                powerPellets.push({ mesh: pellet, x: col, z: row, collected: false });
            }
        }
    }
    
    updateHUD();
    document.getElementById('game-over').classList.add('hidden');
    startGame();
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);

// Initialize game
createMaze();
createPacman();
createGhosts();
updateHUD();

// Show instructions at start
document.getElementById('instructions').classList.remove('hidden');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    updatePacman();
    updateGhosts();
    
    // Animate dots (pulsing effect)
    dots.forEach(dot => {
        if (!dot.collected) {
            dot.mesh.scale.set(
                1 + Math.sin(Date.now() * 0.005) * 0.2,
                1 + Math.sin(Date.now() * 0.005) * 0.2,
                1 + Math.sin(Date.now() * 0.005) * 0.2
            );
        }
    });
    
    // Animate power pellets (rotating)
    powerPellets.forEach(pellet => {
        if (!pellet.collected) {
            pellet.mesh.rotation.y += 0.05;
            pellet.mesh.scale.set(
                1 + Math.sin(Date.now() * 0.01) * 0.3,
                1 + Math.sin(Date.now() * 0.01) * 0.3,
                1 + Math.sin(Date.now() * 0.01) * 0.3
            );
        }
    });
    
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
