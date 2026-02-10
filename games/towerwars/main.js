const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const goldEl = document.getElementById('gold-value');
const gemsEl = document.getElementById('gems-value');
const livesEl = document.getElementById('lives-value');
const waveEl = document.getElementById('wave-value');
const startWaveBtn = document.getElementById('start-wave');
const upgradeBtn = document.getElementById('upgrade-btn');
const autoWaveToggle = document.getElementById('auto-wave');
const soundToggle = document.getElementById('sound-toggle');
const overlay = document.getElementById('overlay');
const gameOverOverlay = document.getElementById('game-over');
const upgradeOverlay = document.getElementById('upgrade-overlay');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const closeUpgradesBtn = document.getElementById('close-upgrades');
const towerList = document.getElementById('tower-list');
const upgradeList = document.getElementById('upgrade-list');
const selectedInfo = document.getElementById('selected-info');
const upgradeTowerBtn = document.getElementById('upgrade-tower');
const sellTowerBtn = document.getElementById('sell-tower');

const TILE = 48;
const COLS = 14;
const ROWS = 10;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

// Track definitions with difficulty levels
const tracks = {
    // TIER 1 - Unlocked (Waves 1+)
    easy_spiral: {
        name: 'Spiral Maze',
        difficulty: 'Easy',
        description: 'Long winding path',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 4 },
            { x: 6, y: 3 }, { x: 5, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 3 },
            { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }, { x: 3, y: 1 },
            { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 2 },
            { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
            { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 11, y: 5 },
            { x: 12, y: 5 }, { x: 13, y: 5 }
        ]
    },
    canyon_road: {
        name: 'Canyon Road',
        difficulty: 'Medium',
        description: 'Balanced path',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
            { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
            { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 7, y: 4 },
            { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 9, y: 3 }, { x: 9, y: 2 },
            { x: 10, y: 2 }, { x: 11, y: 2 }, { x: 12, y: 2 }, { x: 13, y: 2 }
        ]
    },
    express_lane: {
        name: 'Express Lane',
        difficulty: 'Hard',
        description: 'Short direct path',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 },
            { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 10, y: 5 }, { x: 11, y: 5 },
            { x: 12, y: 5 }, { x: 13, y: 5 }
        ]
    },
    death_run: {
        name: 'Death Run',
        difficulty: 'Insane',
        description: 'Ultra short straight',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }
        ]
    },
    zigzag_valley: {
        name: 'Zigzag Valley',
        difficulty: 'Medium',
        description: 'Sharp turns',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 5 },
            { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 4, y: 5 },
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 6, y: 5 },
            { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 8, y: 5 },
            { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 },
            { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }
        ]
    },
    loop_track: {
        name: 'Loop Track',
        difficulty: 'Medium',
        description: 'Circular path',
        requiredWaves: 0,
        tiles: [
            { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
            { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 9, y: 3 },
            { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 }, { x: 8, y: 6 },
            { x: 7, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 },
            { x: 3, y: 6 }, { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 },
            { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 2 },
            { x: 1, y: 2 }, { x: 2, y: 2 }
        ]
    },
    serpent_path: {
        name: 'Serpent Path',
        difficulty: 'Easy',
        description: 'S-shaped route',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
            { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 },
            { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
            { x: 7, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 },
            { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }, { x: 0, y: 5 },
            { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 },
            { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 },
            { x: 8, y: 6 }, { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 },
            { x: 12, y: 6 }, { x: 13, y: 6 }
        ]
    },
    double_helix: {
        name: 'Double Helix',
        difficulty: 'Hard',
        description: 'Twisted path',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 1, y: 4 }, { x: 1, y: 3 },
            { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 },
            { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
            { x: 8, y: 5 }, { x: 9, y: 5 }, { x: 9, y: 4 }, { x: 9, y: 3 },
            { x: 10, y: 3 }, { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 },
            { x: 12, y: 5 }, { x: 13, y: 5 }
        ]
    },
    maze_expert: {
        name: 'Maze Expert',
        difficulty: 'Hard',
        description: 'Complex maze',
        requiredWaves: 0,
        tiles: [
            { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 4 },
            { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
            { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
            { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 7, y: 4 }, { x: 7, y: 3 },
            { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 },
            { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 11, y: 5 },
            { x: 12, y: 5 }, { x: 13, y: 5 }
        ]
    },
    spiral_descent: {
        name: 'Spiral Descent',
        difficulty: 'Medium',
        description: 'Descending spiral',
        requiredWaves: 0,
        tiles: [
            { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
            { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 2 },
            { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 },
            { x: 7, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 },
            { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 1, y: 5 },
            { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 2, y: 2 },
            { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
            { x: 7, y: 2 }, { x: 11, y: 5 }, { x: 12, y: 5 }, { x: 13, y: 5 }
        ]
    }
};

// Add 50 locked tracks
const lockedTracks = [
    // Waves 5+
    { waves: 5, count: 5, offset: 0 },
    // Waves 10+
    { waves: 10, count: 5, offset: 5 },
    // Waves 15+
    { waves: 15, count: 5, offset: 10 },
    // Waves 20+
    { waves: 20, count: 5, offset: 15 },
    // Waves 25+
    { waves: 25, count: 5, offset: 20 },
    // Waves 30+
    { waves: 30, count: 5, offset: 25 },
    // Waves 35+
    { waves: 35, count: 5, offset: 30 },
    // Waves 40+
    { waves: 40, count: 5, offset: 35 },
    // Waves 45+
    { waves: 45, count: 5, offset: 40 },
    // Waves 50+
    { waves: 50, count: 10, offset: 45 }
];

// Generate locked tracks
let trackId = 10;
lockedTracks.forEach(tier => {
    for (let i = 0; i < tier.count; i++) {
        const id = `locked_${trackId}`;
        const tileCount = 15 + Math.random() * 20;
        const tiles = [];
        let x = 0, y = 5;
        
        for (let j = 0; j < tileCount; j++) {
            tiles.push({ x, y });
            if (Math.random() > 0.7 && y > 2) y--;
            else if (Math.random() > 0.7 && y < 7) y++;
            if (x < 13) x++;
        }
        
        tracks[id] = {
            name: `Challenge ${trackId}`,
            difficulty: tier.waves === 5 ? 'Hard' : tier.waves < 20 ? 'Insane' : 'Expert',
            description: `Unlock at Wave ${tier.waves}`,
            requiredWaves: tier.waves,
            tiles: tiles
        };
        trackId++;
    }
});

let pathTiles = tracks.canyon_road.tiles;
let currentTrack = 'canyon_road';

const towerTypes = {
    rapid: { cost: 50, range: 110, fireRate: 300, damage: 8, color: '#38bdf8', unlockWave: 1 },
    cannon: { cost: 80, range: 140, fireRate: 700, damage: 20, splash: 50, color: '#f97316', unlockWave: 1 },
    slow: { cost: 70, range: 120, fireRate: 600, damage: 5, slow: 0.6, color: '#34d399', unlockWave: 1 },
    sniper: { cost: 120, range: 220, fireRate: 1000, damage: 40, color: '#a855f7', unlockWave: 10 },
    mortar: { cost: 150, range: 170, fireRate: 1200, damage: 35, splash: 80, color: '#f59e0b', unlockWave: 20 }
};

const towerUpgrades = {
    rapid: { level: 0, max: 3, gemCost: 4, damageBonus: 2, rangeBonus: 6, fireRateBonus: -20 },
    cannon: { level: 0, max: 3, gemCost: 5, damageBonus: 6, rangeBonus: 8, fireRateBonus: -30 },
    slow: { level: 0, max: 3, gemCost: 4, damageBonus: 1, rangeBonus: 10, fireRateBonus: -25 },
    sniper: { level: 0, max: 3, gemCost: 6, damageBonus: 8, rangeBonus: 15, fireRateBonus: -40 },
    mortar: { level: 0, max: 3, gemCost: 7, damageBonus: 7, rangeBonus: 10, fireRateBonus: -35 }
};

const state = {
    running: false,
    waveActive: false,
    gold: 100,
    gems: 0,
    gemsEarned: 0,
    lives: 20,
    wave: 1,
    paused: false,
    autoWave: false,
    soundOn: true
};

let selectedTower = 'rapid';
let selectedTowerInstance = null;
let lastTime = 0;
let spawnTimer = 0;
let spawnQueue = [];

const towers = [];
const enemies = [];
const projectiles = [];
const explosions = [];
const tankImage = new Image();
tankImage.src = new URL('./images/tank.png', import.meta.url).href;
let audioCtx = null;

function playShotSound(type) {
    if (!state.soundOn) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    if (type === 'cannon') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else if (type === 'slow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

function playExplosionSound() {
    if (!state.soundOn) return;
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

function gridToPixel(cell) {
    return {
        x: cell.x * TILE + TILE / 2,
        y: cell.y * TILE + TILE / 2
    };
}

let pathPoints = pathTiles.map(gridToPixel);

function setTrack(trackKey) {
    const track = tracks[trackKey];
    if (!track) return;
    currentTrack = trackKey;
    pathTiles = track.tiles;
    pathPoints = pathTiles.map(gridToPixel);
}

function getTowerStats(type) {
    const base = towerTypes[type];
    const upgrade = towerUpgrades[type];
    const level = upgrade ? upgrade.level : 0;
    return {
        range: base.range + level * upgrade.rangeBonus,
        damage: base.damage + level * upgrade.damageBonus,
        fireRate: Math.max(150, base.fireRate + level * upgrade.fireRateBonus),
        splash: base.splash || 0,
        slow: base.slow || 0,
        color: base.color,
        cost: base.cost
    };
}

function renderTowerButtons() {
    towerList.innerHTML = '';
    const types = Object.entries(towerTypes).sort((a, b) => a[1].unlockWave - b[1].unlockWave);
    types.forEach(([key, data], index) => {
        const button = document.createElement('button');
        const unlocked = state.wave >= data.unlockWave;
        button.className = `tower-btn${key === selectedTower ? ' active' : ''}${unlocked ? '' : ' locked'}`;
        button.dataset.tower = key;
        button.textContent = unlocked ? `${index + 1}) ${key[0].toUpperCase() + key.slice(1)} (${data.cost})` : `Unlocks at wave ${data.unlockWave}`;
        if (!unlocked) {
            button.disabled = true;
        }
        button.addEventListener('click', () => {
            if (!unlocked) return;
            selectedTower = key;
            renderTowerButtons();
        });
        towerList.appendChild(button);
    });
}

function getOrderedTowerKeys() {
    return Object.entries(towerTypes)
        .sort((a, b) => a[1].unlockWave - b[1].unlockWave)
        .map(([key]) => key);
}

function selectTowerByIndex(index) {
    const keys = getOrderedTowerKeys();
    const key = keys[index];
    if (!key) return;
    if (state.wave < towerTypes[key].unlockWave) return;
    selectedTower = key;
    renderTowerButtons();
}

function renderUpgradeList() {
    upgradeList.innerHTML = '';
    Object.entries(towerTypes).forEach(([key, data]) => {
        if (state.wave < data.unlockWave) return;
        const upgrade = towerUpgrades[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        const canUpgrade = upgrade.level < upgrade.max;
        const nextCost = upgrade.gemCost * (upgrade.level + 1);
        const affordable = state.gems >= nextCost;
        card.innerHTML = `
            <h4>${key[0].toUpperCase() + key.slice(1)} Lv ${upgrade.level}/${upgrade.max}</h4>
            <p>+${upgrade.damageBonus} dmg, +${upgrade.rangeBonus} range, ${upgrade.fireRateBonus}ms fire rate</p>
            <button class="btn btn-small" ${canUpgrade && affordable ? '' : 'disabled'}>${canUpgrade ? `Upgrade (${nextCost} Gems)` : 'Maxed'}</button>
        `;
        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            if (!canUpgrade) return;
            if (state.gems < nextCost) return;
            state.gems -= nextCost;
            upgrade.level += 1;
            applyGlobalTowerUpgrade(key);
            updateHud();
            renderUpgradeList();
        });
        upgradeList.appendChild(card);
    });
}

function setPaused(paused) {
    state.paused = paused;
    if (paused) {
        upgradeOverlay.classList.remove('hidden');
    } else {
        upgradeOverlay.classList.add('hidden');
    }
}

function updateSelectedPanel() {
    if (!selectedTowerInstance) {
        selectedInfo.textContent = 'None';
        upgradeTowerBtn.disabled = true;
        sellTowerBtn.disabled = true;
        upgradeTowerBtn.textContent = 'Upgrade';
        sellTowerBtn.textContent = 'Sell';
        return;
    }
    selectedInfo.textContent = `${selectedTowerInstance.type.toUpperCase()} L${selectedTowerInstance.level}`;
    upgradeTowerBtn.disabled = false;
    sellTowerBtn.disabled = false;
    if (selectedTowerInstance.level >= 3) {
        upgradeTowerBtn.textContent = 'Max Level';
        upgradeTowerBtn.disabled = true;
    } else {
        const upgradeCost = Math.floor(selectedTowerInstance.baseCost * (0.8 + 0.2 * (selectedTowerInstance.level - 1)));
        upgradeTowerBtn.textContent = `Upgrade (${upgradeCost}g)`;
    }
    const refund = Math.floor(selectedTowerInstance.invested * 0.6);
    sellTowerBtn.textContent = `Sell (+${refund}g)`;
}

function applyGlobalTowerUpgrade(type) {
    const upgrade = towerUpgrades[type];
    if (!upgrade) return;
    towers.forEach(tower => {
        if (tower.type !== type) return;
        tower.range += upgrade.rangeBonus;
        tower.damage += upgrade.damageBonus;
        tower.fireRate = Math.max(150, tower.fireRate + upgrade.fireRateBonus);
    });
}

function createExplosion(x, y) {
    playExplosionSound();
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        const speed = 40 + Math.random() * 40;
        explosions.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 300
        });
    }
}

function resetGame() {
    state.running = true;
    state.waveActive = false;
    state.gold = 100;
    state.gems = 0;
    state.gemsEarned = 0;
    state.lives = 20;
    state.wave = 1;
    state.paused = false;
    state.autoWave = autoWaveToggle.checked;
    state.soundOn = soundToggle.checked;
    spawnQueue = [];
    spawnTimer = 0;
    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    selectedTowerInstance = null;
    Object.values(towerUpgrades).forEach(upgrade => {
        upgrade.level = 0;
    });

    updateHud();
    renderTowerButtons();
    renderUpgradeList();
    updateSelectedPanel();
    overlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    upgradeOverlay.classList.add('hidden');
}

function updateHud() {
    goldEl.textContent = state.gold;
    gemsEl.textContent = state.gems;
    livesEl.textContent = state.lives;
    waveEl.textContent = state.wave;
}

function startWave() {
    if (state.waveActive || !state.running || state.paused) return;

    const enemyCount = 8 + state.wave * 3;
    const baseHp = 40 + state.wave * 15;
    const baseSpeed = 40 + state.wave * 2;
    const baseArmor = Math.floor(state.wave / 2);
    const armoredWave = state.wave % 5 === 0;
    const majorSpike = state.wave % 10 === 0;

    spawnQueue = Array.from({ length: enemyCount }, (_, i) => {
        const isArmored = armoredWave && i % 4 === 0;
        const spikeArmor = majorSpike ? 12 : 0;
        const spikeSpeed = majorSpike ? 1.35 : 1;
        const armor = baseArmor + spikeArmor + (isArmored ? 10 : 0);
        const hp = baseHp + i * 2 + armor * 3;
        return {
            hp,
            maxHp: hp,
            speed: baseSpeed * spikeSpeed,
            reward: 10 + Math.floor(state.wave / 2),
            armor,
            armored: isArmored || majorSpike
        };
    });

    state.waveActive = true;
}

function spawnEnemy(template) {
    const start = pathPoints[0];
    enemies.push({
        x: start.x,
        y: start.y,
        hp: template.hp,
        maxHp: template.maxHp,
        speed: template.speed,
        reward: template.reward,
        armor: template.armor || 0,
        armored: template.armored || false,
        pathIndex: 0,
        angle: 0,
        slowUntil: 0,
        slowFactor: 1,
        pushHits: 0
    });
}

function updateEnemies(delta) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const nextIndex = Math.min(enemy.pathIndex + 1, pathPoints.length - 1);
        const target = pathPoints[nextIndex];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
            enemy.angle = Math.atan2(dy, dx);
        }
        const speedMultiplier = enemy.slowUntil > performance.now() ? enemy.slowFactor : 1;
        const moveDistance = (enemy.speed * speedMultiplier * delta) / 1000;

        if (distance <= moveDistance) {
            enemy.x = target.x;
            enemy.y = target.y;
            enemy.pathIndex = nextIndex;
        } else {
            enemy.x += (dx / distance) * moveDistance;
            enemy.y += (dy / distance) * moveDistance;
        }

        if (enemy.pathIndex === pathPoints.length - 1) {
            enemies.splice(i, 1);
            state.lives -= 1;
            updateHud();
            if (state.lives <= 0) {
                endGame();
            }
        }
    }
}

function updateTowers(delta, time) {
    towers.forEach(tower => {
        tower.cooldown -= delta;
        if (tower.cooldown > 0) return;

        let target = tower.target;
        if (!target || target.hp <= 0 || Math.hypot(target.x - tower.x, target.y - tower.y) > tower.range) {
            target = enemies.find(enemy => {
                const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
                return dist <= tower.range;
            });
        }

        if (target) {
            tower.cooldown = tower.fireRate;
            projectiles.push({
                x: tower.x,
                y: tower.y,
                target,
                damage: tower.damage,
                splash: tower.splash,
                slow: tower.slow,
                speed: 260,
                color: tower.color,
                towerType: tower.type,
                towerLevel: tower.level
            });
            playShotSound(tower.type);
        }
    });
}

function updateProjectiles(delta) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        if (!proj.target || proj.target.hp <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        const dx = proj.target.x - proj.x;
        const dy = proj.target.y - proj.y;
        const distance = Math.hypot(dx, dy);
        const travel = (proj.speed * delta) / 1000;

        if (distance <= travel) {
            applyDamage(proj, proj.target);
            projectiles.splice(i, 1);
        } else {
            proj.x += (dx / distance) * travel;
            proj.y += (dy / distance) * travel;
        }
    }
}

function applyDamage(projectile, target) {
    if (projectile.splash) {
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - target.x, enemy.y - target.y);
            if (dist <= projectile.splash) {
                const effective = Math.max(1, projectile.damage - enemy.armor);
                enemy.hp -= effective;
                // Push back for slow tower level 3
                if (projectile.towerType === 'slow' && projectile.towerLevel === 3) {
                    enemy.pushHits++;
                    enemy.pathIndex = Math.max(0, enemy.pathIndex - enemy.pushHits);
                }
            }
        });
    } else {
        const effective = Math.max(1, projectile.damage - target.armor);
        target.hp -= effective;
        // Push back for slow tower level 3
        if (projectile.towerType === 'slow' && projectile.towerLevel === 3) {
            target.pushHits++;
            target.pathIndex = Math.max(0, target.pathIndex - target.pushHits);
        }
    }

    if (projectile.slow) {
        target.slowFactor = projectile.slow;
        target.slowUntil = performance.now() + 1500;
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
            state.gold += enemies[i].reward;
            createExplosion(enemies[i].x, enemies[i].y);
            enemies.splice(i, 1);
            updateHud();
        }
    }
}

function placeOrUpgrade(cellX, cellY) {
    if (pathTiles.some(tile => tile.x === cellX && tile.y === cellY)) return;

    selectedTowerInstance = null;
    updateSelectedPanel();

    const existing = towers.find(tower => tower.cellX === cellX && tower.cellY === cellY);
    if (existing) {
        selectedTowerInstance = existing;
        updateSelectedPanel();
        return;
    }

    const type = towerTypes[selectedTower];
    if (!type || state.wave < type.unlockWave) return;
    if (state.gold < type.cost) return;

    const stats = getTowerStats(selectedTower);

    const position = gridToPixel({ x: cellX, y: cellY });
    towers.push({
        cellX,
        cellY,
        x: position.x,
        y: position.y,
        type: selectedTower,
        range: stats.range,
        damage: stats.damage,
        fireRate: stats.fireRate,
        splash: stats.splash,
        slow: stats.slow,
        color: stats.color,
        cooldown: 0,
        level: 1,
        baseCost: type.cost,
        invested: type.cost,
        target: null
    });

    state.gold -= type.cost;
    selectedTowerInstance = null;
    updateHud();
    updateSelectedPanel();
}

function upgradeSelectedTower() {
    if (!selectedTowerInstance) return;
    if (selectedTowerInstance.level >= 3) return;
    const upgradeCost = Math.floor(selectedTowerInstance.baseCost * (0.8 + 0.2 * (selectedTowerInstance.level - 1)));
    if (state.gold < upgradeCost) return;
    state.gold -= upgradeCost;
    selectedTowerInstance.invested += upgradeCost;
    selectedTowerInstance.level += 1;
    selectedTowerInstance.range += 20;
    selectedTowerInstance.damage += 5;
    selectedTowerInstance.fireRate = Math.max(150, selectedTowerInstance.fireRate - 60);
    updateHud();
    updateSelectedPanel();
}

function sellSelectedTower() {
    if (!selectedTowerInstance) return;
    const refund = Math.floor(selectedTowerInstance.invested * 0.6);
    state.gold += refund;
    const index = towers.indexOf(selectedTowerInstance);
    if (index !== -1) {
        towers.splice(index, 1);
    }
    selectedTowerInstance = null;
    updateHud();
    updateSelectedPanel();
}

function update(delta, time) {
    if (!state.running || state.paused) return;

    if (!state.waveActive && state.autoWave) {
        startWave();
    }

    if (state.waveActive) {
        spawnTimer += delta;
        if (spawnQueue.length && spawnTimer > 800) {
            spawnEnemy(spawnQueue.shift());
            spawnTimer = 0;
        }

        if (!spawnQueue.length && !enemies.length) {
            state.waveActive = false;
            state.wave += 1;
            state.gold += 30;
            const gemBonus = 3 + Math.floor(state.wave / 2);
            state.gems += gemBonus;
            state.gemsEarned += gemBonus;
            updateHud();
            renderTowerButtons();
            renderUpgradeList();
        }
    }

    updateEnemies(delta);
    updateTowers(delta, time);
    updateProjectiles(delta);

    for (let i = explosions.length - 1; i >= 0; i--) {
        const particle = explosions[i];
        particle.x += (particle.vx * delta) / 1000;
        particle.y += (particle.vy * delta) / 1000;
        particle.life -= delta;
        if (particle.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE, 0);
        ctx.lineTo(x * TILE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE);
        ctx.lineTo(canvas.width, y * TILE);
        ctx.stroke();
    }

    pathTiles.forEach(tile => {
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(tile.x * TILE, tile.y * TILE, TILE, TILE);
    });

    towers.forEach(tower => {
        const towerWidth = 32;
        const towerHeight = 24;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(tower.x, tower.y + 8, towerWidth * 0.45, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw tank with filter based on tower type
        if (tankImage.complete && tankImage.naturalWidth > 0) {
            ctx.save();
            ctx.translate(tower.x, tower.y);
            
            // Apply color filter based on tower type
            switch(tower.type) {
                case 'rapid':
                    ctx.filter = 'hue-rotate(180deg) saturate(1.2)';
                    break;
                case 'cannon':
                    ctx.filter = 'hue-rotate(0deg) saturate(1.3) brightness(1.1)';
                    break;
                case 'slow':
                    ctx.filter = 'hue-rotate(90deg) saturate(1.2)';
                    break;
                case 'sniper':
                    ctx.filter = 'hue-rotate(270deg) saturate(1.4)';
                    break;
                case 'mortar':
                    ctx.filter = 'hue-rotate(30deg) saturate(1.3)';
                    break;
            }
            
            ctx.drawImage(tankImage, -towerWidth / 2, -towerHeight / 2, towerWidth, towerHeight);
            ctx.restore();
        } else {
            ctx.fillStyle = tower.color;
            ctx.fillRect(tower.x - towerWidth / 2, tower.y - towerHeight / 2, towerWidth, towerHeight);
        }

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`L${tower.level}`, tower.x, tower.y + 12);
    });

    enemies.forEach(enemy => {
        const fontSize = enemy.armored ? 28 : 24;
        const topY = enemy.y - 14;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + 8, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw space invader emoji with color based on armor level
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        
        // Color variation based on armor strength
        let armorColor = '#a1e3a1'; // weak - light green
        if (enemy.armor >= 6) armorColor = '#fbbf24'; // medium - yellow
        if (enemy.armor >= 12) armorColor = '#f87171'; // strong - red
        if (enemy.armor >= 18) armorColor = '#e879f9'; // very strong - purple
        
        // Apply shadow/glow effect based on armor
        ctx.shadowColor = armorColor;
        ctx.shadowBlur = enemy.armored ? 8 : 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.filter = `drop-shadow(0 0 ${enemy.armored ? 6 : 3}px ${armorColor})`;
        
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = armorColor;
        ctx.fillText('👾', 0, 0);
        
        ctx.restore();

        const barWidth = 28;
        const barHeight = 4;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(enemy.x - barWidth / 2, topY - 10, barWidth, barHeight);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - barWidth / 2, topY - 10, barWidth * (enemy.hp / enemy.maxHp), barHeight);

        if (enemy.armor > 0) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
            ctx.fillRect(enemy.x - barWidth / 2, topY - 4, barWidth, 3);
            ctx.fillStyle = '#38bdf8';
            const armorRatio = Math.min(1, enemy.armor / 20);
            ctx.fillRect(enemy.x - barWidth / 2, topY - 4, barWidth * armorRatio, 3);
        }
    });

    projectiles.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    explosions.forEach(particle => {
        const alpha = Math.max(0, particle.life / 300);
        ctx.fillStyle = `rgba(251, 146, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    if (state.waveActive) {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
        ctx.font = '16px sans-serif';
        ctx.fillText('Wave in progress', 16, 24);
    }

    // Board bevel for 3D feel
    const bevel = 16;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(canvas.width - bevel, 0, bevel, canvas.height);
    ctx.fillRect(0, canvas.height - bevel, canvas.width, bevel);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, canvas.width - bevel - 4, canvas.height - bevel - 4);
}

function gameLoop(time) {
    if (!state.running) return;

    const delta = time - lastTime;
    lastTime = time;

    if (!state.paused) {
        update(delta, time);
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    state.running = false;
    state.paused = false;
    upgradeOverlay.classList.add('hidden');
    gameOverOverlay.classList.remove('hidden');
    finalScoreEl.textContent = state.wave - 1;
}


canvas.addEventListener('click', event => {
    if (!state.running || state.paused) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const cellX = Math.floor(x / TILE);
    const cellY = Math.floor(y / TILE);

    // Check if clicking on an enemy for targeting
    if (selectedTowerInstance) {
        const clickedEnemy = enemies.find(enemy => {
            const dist = Math.hypot(enemy.x - x, enemy.y - y);
            return dist <= 24; // enemy size
        });
        if (clickedEnemy) {
            selectedTowerInstance.target = clickedEnemy;
            return;
        }
    }

    placeOrUpgrade(cellX, cellY);
});


startWaveBtn.addEventListener('click', startWave);

// Helper function to draw track mini-graphic
function createTrackSVG(trackKey) {
    const track = tracks[trackKey];
    const width = 128, height = 80;
    const scale = 8;
    
    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="rgba(0,0,0,0.2)" rx="4"/>`;
    
    if (track.tiles && track.tiles.length > 0) {
        // Draw path
        svg += `<g stroke="#a5b4fc" stroke-width="2" fill="none" stroke-linecap="round">`;
        for (let i = 0; i < track.tiles.length - 1; i++) {
            const from = track.tiles[i];
            const to = track.tiles[i + 1];
            const x1 = (from.x / 14) * width;
            const y1 = (from.y / 10) * height;
            const x2 = (to.x / 14) * width;
            const y2 = (to.y / 10) * height;
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
        }
        svg += `</g>`;
        
        // Draw start
        const start = track.tiles[0];
        const sx = (start.x / 14) * width;
        const sy = (start.y / 10) * height;
        svg += `<circle cx="${sx}" cy="${sy}" r="4" fill="#22c55e"/>`;
        
        // Draw end
        const end = track.tiles[track.tiles.length - 1];
        const ex = (end.x / 14) * width;
        const ey = (end.y / 10) * height;
        svg += `<circle cx="${ex}" cy="${ey}" r="4" fill="#ef4444"/>`;
    }
    
    svg += `</svg>`;
    return svg;
}

// Track selection
const trackSelection = document.getElementById('track-selection');
let highestWaveAchieved = 0; // Will be updated from state

function renderTrackSelection() {
    trackSelection.innerHTML = '';
    const trackKeys = Object.keys(tracks);
    
    trackKeys.forEach(trackKey => {
        const track = tracks[trackKey];
        const isLocked = track.requiredWaves > highestWaveAchieved;
        
        const card = document.createElement('div');
        card.className = `track-card ${isLocked ? 'locked' : ''}`;
        card.dataset.track = trackKey;
        
        const svg = createTrackSVG(trackKey);
        card.innerHTML = `
            ${svg}
            <h3>${track.name}</h3>
            <p class="difficulty">${track.difficulty}</p>
            <p class="description">${isLocked ? `🔒 Wave ${track.requiredWaves}+` : `${track.tiles.length} tiles`}</p>
        `;
        
        if (!isLocked) {
            card.addEventListener('click', () => {
                setTrack(trackKey);
                
                document.querySelectorAll('.track-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                document.getElementById('start-btn').disabled = false;
            });
        }
        
        trackSelection.appendChild(card);
    });
}

startBtn.addEventListener('click', () => {
    if (!currentTrack) {
        setTrack('canyon_road');
    }
    resetGame();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

restartBtn.addEventListener('click', () => {
    highestWaveAchieved = Math.max(highestWaveAchieved, state.wave - 1);
    overlay.classList.remove('hidden');
    renderTrackSelection();
    
    // Reselect previous track if still unlocked
    const track = document.querySelector(`[data-track="${currentTrack}"]`);
    if (track && !track.classList.contains('locked')) {
        track.click();
    }
});

upgradeBtn.addEventListener('click', () => {
    if (!state.running) return;
    setPaused(true);
    renderUpgradeList();
});

closeUpgradesBtn.addEventListener('click', () => {
    setPaused(false);
});

autoWaveToggle.addEventListener('change', () => {
    state.autoWave = autoWaveToggle.checked;
});

soundToggle.addEventListener('change', () => {
    state.soundOn = soundToggle.checked;
});

upgradeTowerBtn.addEventListener('click', upgradeSelectedTower);
sellTowerBtn.addEventListener('click', sellSelectedTower);

window.addEventListener('keydown', event => {
    if (event.key === '1') selectTowerByIndex(0);
    if (event.key === '2') selectTowerByIndex(1);
    if (event.key === '3') selectTowerByIndex(2);
    if (event.key === '4') selectTowerByIndex(3);
    if (event.key === '5') selectTowerByIndex(4);
});

updateHud();
renderTowerButtons();
renderUpgradeList();
updateSelectedPanel();

// Initialize track selection
renderTrackSelection();

draw();

// Mobile orientation helper
const orientationOverlay = document.getElementById('orientation-overlay');
const rotateBtn = document.getElementById('rotate-btn');

function updateOrientationOverlay() {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isPortrait && isCoarsePointer) {
        orientationOverlay.classList.remove('hidden');
    } else {
        orientationOverlay.classList.add('hidden');
    }
}

async function requestLandscape() {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
        }
    } catch (err) {
        // Ignore if not supported
    }
}

rotateBtn?.addEventListener('click', requestLandscape);
window.addEventListener('resize', updateOrientationOverlay);
window.addEventListener('orientationchange', updateOrientationOverlay);
updateOrientationOverlay();
