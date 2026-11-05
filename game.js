// ============================================
// CS:3D — Counter-Strike 3D FPS Web Game
// Team Deathmatch (1–5 vs 1–5) on "Dust Zone" map
// Botlarga qarshi yoki do'stlar bilan onlayn (net.js)
// Built with Three.js
// ============================================

(() => {
    'use strict';

    // === CONSTANTS ===
    const TILE = 6;
    const WALL_HEIGHT = 4;
    const MAP_COLS = 32;
    const MAP_ROWS = 24;
    const PLAYER_HEIGHT = 3.2;
    const EYE_HEIGHT = 2.8;
    const PLAYER_RADIUS = 0.6;
    const MOVE_SPEED = 0.12;
    const SLOW_SPEED = 0.06;
    const SPRINT_SPEED = 0.16;
    const JUMP_FORCE = 0.18;
    const GRAVITY = 0.008;
    const FIRE_RATE = 130;
    const MAX_AMMO = 30;
    const MAX_RESERVE = 90;
    const RELOAD_TIME = 2000;
    const BULLET_DAMAGE = 22;
    const HEADSHOT_CHANCE = 0.15;
    const HEADSHOT_MULT = 2.5;
    const ROUND_TIME = 105;
    const ROUNDS_TO_WIN = 5;
    const RESPAWN_TIME = 3000;
    const MOUSE_SENSITIVITY = 0.002;
    const FOV_NORMAL = 75;
    const FOV_ZOOM = 30;
    const MAX_TEAM_SIZE = 5;
    const NET_VERSION = 1;
    const NET_TICK_MS = 50;
    const BOT_ID_START = 100;
    const MAX_NAME_LENGTH = 14;
    const SMOOTHING_RATE = 15;
    const TELEPORT_DISTANCE = 12;

    // === MAP ===
    // 0=floor, 1=wall, 2=box(half-height), 3=barrel
    const MAP = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
        [1,0,0,2,2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2,2,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,2,2,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,2,2,0,0,0,1],
        [1,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    // Spawn positions (col, row)
    // Har jamoada MAX_TEAM_SIZE tagacha joy
    const CT_SPAWNS = [
        { col: 2, row: 2 },
        { col: 4, row: 1 },
        { col: 6, row: 2 },
        { col: 1, row: 4 },
        { col: 6, row: 4 },
    ];
    const T_SPAWNS = [
        { col: 29, row: 21 },
        { col: 27, row: 22 },
        { col: 25, row: 21 },
        { col: 30, row: 19 },
        { col: 25, row: 19 },
    ];

    function tileToWorld(col, row) {
        return { x: col * TILE + TILE / 2, z: row * TILE + TILE / 2 };
    }

    // === THREE.JS SETUP ===
    let scene, camera, renderer, clock;
    let gunGroup; // first-person weapon model

    // === GAME STATE ===
    let gameState = 'menu';
    let keys = {};
    let mouseDown = false;
    let aimDown = false; // o'ng tugma bosilgan — nishonga yaqinlashtirish
    let zoomT = 0; // 0 = oddiy, 1 = to'liq yaqinlashgan
    let pointerLocked = false;
    let teamSizes = loadTeamSizes();
    let audioCtx = null;
    let noiseBuffer = null;
    let players = [];
    let me = null; // shu kompyuterdagi o'yinchi
    let online = null; // null = yakka o'yin
    let roundChangeTimer = null;
    let playerMeshes = {};
    let wallBoxes = []; // for collision
    let ctScore = 0, tScore = 0;
    let currentRound = 1;
    let roundTimer = ROUND_TIME;
    let roundTimerInterval = null;
    let playerStats = { kills: 0, deaths: 0 };
    let playerVelocityY = 0;
    let playerOnGround = true;
    let muzzleFlashLight = null;
    let muzzleFlashTimer = 0;
    let tracerLines = [];
    let impactParticles = [];

    // === DOM ===
    const canvas = document.getElementById('game-canvas');
    const screens = {
        menu: document.getElementById('menu-screen'),
        controls: document.getElementById('controls-screen'),
        online: document.getElementById('online-screen'),
        lobby: document.getElementById('lobby-screen'),
        game: document.getElementById('game-screen'),
        gameover: document.getElementById('gameover-screen'),
    };
    const hud = {
        ctScore: document.getElementById('ct-score'),
        tScore: document.getElementById('t-score'),
        roundTimer: document.getElementById('round-timer'),
        roundNumber: document.getElementById('round-number'),
        healthBar: document.getElementById('health-bar'),
        healthText: document.getElementById('health-text'),
        ammoCurrent: document.getElementById('ammo-current'),
        ammoReserve: document.getElementById('ammo-reserve'),
        killFeed: document.getElementById('kill-feed'),
        hitMarker: document.getElementById('hit-marker'),
        announcement: document.getElementById('round-announcement'),
        announcementText: document.getElementById('announcement-text'),
        reloadIndicator: document.getElementById('reload-indicator'),
        damageVignette: document.getElementById('damage-vignette'),
        clickToPlay: document.getElementById('click-to-play'),
        root: document.getElementById('hud'),
    };

    // === PLAYER DATA ===
    class PlayerData {
        constructor(id, name, team, col, row, isBot) {
            this.id = id;
            this.name = name;
            this.team = team;
            this.isBot = isBot;
            this.spawn = { col, row };
            const pos = tileToWorld(col, row);
            this.x = pos.x;
            this.y = EYE_HEIGHT;
            this.z = pos.z;
            this.yaw = team === 'ct' ? 0 : Math.PI;
            this.pitch = 0;
            this.health = 100;
            this.alive = true;
            this.ammo = MAX_AMMO;
            this.reserve = MAX_RESERVE;
            this.reloading = false;
            this.lastShot = 0;
            // Tarmoqdan kelgan oxirgi holat: o'yinchi shu nuqtaga silliq yetib boradi
            this.netX = this.x;
            this.netY = this.y;
            this.netZ = this.z;
            this.netYaw = this.yaw;
            this.respawnTimer = 0;
            // Bot AI state
            this.botTarget = null;
            this.botPatrolTarget = null;
            this.botPatrolTimer = 0;
            this.canSeeTarget = false;
            this.strafeDir = 1;
            this.strafeTimer = 0;
            this.botReactionTimer = 300 + Math.random() * 400;
        }
        reset(col, row) {
            const pos = tileToWorld(col, row);
            this.x = pos.x;
            this.y = EYE_HEIGHT;
            this.z = pos.z;
            this.health = 100;
            this.alive = true;
            this.ammo = MAX_AMMO;
            this.reserve = MAX_RESERVE;
            this.reloading = false;
            this.respawnTimer = 0;
            this.yaw = this.team === 'ct' ? 0 : Math.PI;
            this.netX = this.x;
            this.netY = this.y;
            this.netZ = this.z;
            this.netYaw = this.yaw;
        }
    }

    // === INIT ===
    function initThree() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcfe6f7);
        scene.fog = new THREE.Fog(0xcfe6f7, 60, 220);

        camera = new THREE.PerspectiveCamera(FOV_NORMAL, window.innerWidth / window.innerHeight, 0.1, 300);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        clock = new THREE.Clock();

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(ambient);

        const sunLight = new THREE.DirectionalLight(0xfff4e0, 0.7);
        sunLight.position.set(50, 80, 30);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 250;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        scene.add(sunLight);

        // Subtle fill light
        const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.35);
        fillLight.position.set(-30, 40, -20);
        scene.add(fillLight);

        // Muzzle flash point light
        muzzleFlashLight = new THREE.PointLight(0xffaa33, 0, 15);
        scene.add(muzzleFlashLight);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // === BUILD MAP ===
    function buildMap() {
        wallBoxes = [];

        // Floor
        const floorGeo = new THREE.PlaneGeometry(MAP_COLS * TILE, MAP_ROWS * TILE);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0xc9b68c,
            roughness: 0.9,
            metalness: 0.1,
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(MAP_COLS * TILE / 2, 0, MAP_ROWS * TILE / 2);
        floor.receiveShadow = true;
        scene.add(floor);

        // Floor grid lines for detail
        const gridHelper = new THREE.GridHelper(MAP_COLS * TILE, MAP_COLS * 2, 0xa8936a, 0xa8936a);
        gridHelper.position.set(MAP_COLS * TILE / 2, 0.01, MAP_ROWS * TILE / 2);
        gridHelper.material.opacity = 0.15;
        gridHelper.material.transparent = true;
        scene.add(gridHelper);

        // Shift (och rang)
        const ceilGeo = new THREE.PlaneGeometry(MAP_COLS * TILE, MAP_ROWS * TILE);
        const ceilMat = new THREE.MeshBasicMaterial({ color: 0xe8f1fa, side: THREE.BackSide });
        const ceil = new THREE.Mesh(ceilGeo, ceilMat);
        ceil.rotation.x = -Math.PI / 2;
        ceil.position.set(MAP_COLS * TILE / 2, WALL_HEIGHT, MAP_ROWS * TILE / 2);
        scene.add(ceil);

        // Materials
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xe6dcc4, roughness: 0.8, metalness: 0.05 });
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xb08a55, roughness: 0.8 });
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x7f9a7f, roughness: 0.6, metalness: 0.3 });

        for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
                const tile = MAP[row][col];
                if (tile === 0) continue;

                const cx = col * TILE + TILE / 2;
                const cz = row * TILE + TILE / 2;

                if (tile === 1) {
                    // Wall
                    const geo = new THREE.BoxGeometry(TILE, WALL_HEIGHT, TILE);
                    const mesh = new THREE.Mesh(geo, wallMat);
                    mesh.position.set(cx, WALL_HEIGHT / 2, cz);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);
                    wallBoxes.push({
                        minX: col * TILE, maxX: (col + 1) * TILE,
                        minZ: row * TILE, maxZ: (row + 1) * TILE,
                        minY: 0, maxY: WALL_HEIGHT,
                        type: 'wall'
                    });
                } else if (tile === 2) {
                    // Box/crate (half height)
                    const h = WALL_HEIGHT * 0.5;
                    const s = TILE * 0.75;
                    const geo = new THREE.BoxGeometry(s, h, s);
                    const mesh = new THREE.Mesh(geo, boxMat);
                    mesh.position.set(cx, h / 2, cz);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);

                    // Cross detail on top
                    const edgeGeo = new THREE.EdgesGeometry(geo);
                    const edgeMat = new THREE.LineBasicMaterial({ color: 0x4a3f28 });
                    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
                    edges.position.copy(mesh.position);
                    scene.add(edges);

                    wallBoxes.push({
                        minX: cx - s / 2, maxX: cx + s / 2,
                        minZ: cz - s / 2, maxZ: cz + s / 2,
                        minY: 0, maxY: h,
                        type: 'box'
                    });
                } else if (tile === 3) {
                    // Barrel
                    const r = TILE * 0.3;
                    const h = TILE * 0.5;
                    const geo = new THREE.CylinderGeometry(r, r, h, 12);
                    const mesh = new THREE.Mesh(geo, barrelMat);
                    mesh.position.set(cx, h / 2, cz);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh);

                    // Barrel ring detail
                    const ringGeo = new THREE.TorusGeometry(r + 0.05, 0.08, 4, 12);
                    const ringMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.8 });
                    const ring = new THREE.Mesh(ringGeo, ringMat);
                    ring.position.set(cx, h * 0.3, cz);
                    ring.rotation.x = Math.PI / 2;
                    scene.add(ring);

                    wallBoxes.push({
                        minX: cx - r, maxX: cx + r,
                        minZ: cz - r, maxZ: cz + r,
                        minY: 0, maxY: h,
                        type: 'barrel'
                    });
                }
            }
        }

        // Osmon — uzoqdagi katta och quti
        const skyGeo = new THREE.BoxGeometry(500, 100, 500);
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0xcfe6f7,
            side: THREE.BackSide
        });
        const skyBox = new THREE.Mesh(skyGeo, skyMat);
        skyBox.position.set(MAP_COLS * TILE / 2, 40, MAP_ROWS * TILE / 2);
        scene.add(skyBox);
    }

    // === GUN MODEL (First Person) ===
    function createGunModel() {
        gunGroup = new THREE.Group();

        // Gun body
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.9);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0, -0.3);
        gunGroup.add(body);

        // Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.5, 8);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.9 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.04, -0.9);
        gunGroup.add(barrel);

        // Magazine
        const magGeo = new THREE.BoxGeometry(0.08, 0.25, 0.1);
        const magMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.6 });
        const mag = new THREE.Mesh(magGeo, magMat);
        mag.position.set(0, -0.15, -0.25);
        mag.rotation.z = 0.05;
        gunGroup.add(mag);

        // Stock
        const stockGeo = new THREE.BoxGeometry(0.1, 0.1, 0.3);
        const stockMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.8 });
        const stock = new THREE.Mesh(stockGeo, stockMat);
        stock.position.set(0, 0.02, 0.25);
        gunGroup.add(stock);

        // Grip
        const gripGeo = new THREE.BoxGeometry(0.08, 0.14, 0.08);
        const grip = new THREE.Mesh(gripGeo, stockMat);
        grip.position.set(0, -0.1, -0.05);
        grip.rotation.x = 0.2;
        gunGroup.add(grip);

        // Position gun
        gunGroup.position.set(0.35, -0.35, -0.5);
        gunGroup.rotation.set(0, 0, 0);

        camera.add(gunGroup);
        scene.add(camera);
    }

    // === PLAYER 3D MODELS (for bots/enemies) ===
    function createPlayerMesh(playerData) {
        const group = new THREE.Group();
        const color = playerData.team === 'ct' ? 0x4fa8d5 : 0xd4a843;
        const darkColor = playerData.team === 'ct' ? 0x2a7ab5 : 0xb8862e;

        // Body (capsule-like)
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 2.0, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.35, 8, 8);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xddb89a, roughness: 0.7 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 2.5;
        head.castShadow = true;
        group.add(head);

        // Helmet/hat
        const helmetGeo = new THREE.SphereGeometry(0.38, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const helmetMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.5 });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 2.6;
        group.add(helmet);

        // Gun in hand
        const gunGeo = new THREE.BoxGeometry(0.1, 0.1, 0.7);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.8 });
        const gun = new THREE.Mesh(gunGeo, gunMat);
        gun.position.set(0.45, 1.6, -0.3);
        group.add(gun);

        // Name label (using sprite)
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        const lctx = labelCanvas.getContext('2d');
        lctx.fillStyle = playerData.team === 'ct' ? '#4fa8d5' : '#d4a843';
        lctx.font = 'bold 28px Rajdhani';
        lctx.textAlign = 'center';
        lctx.fillText(playerData.name, 128, 36);
        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
        const label = new THREE.Sprite(labelMat);
        label.position.y = 3.3;
        label.scale.set(2.5, 0.6, 1);
        group.add(label);

        // Health bar
        const hbGroup = new THREE.Group();
        const hbBg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 0.12),
            new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.7 })
        );
        hbGroup.add(hbBg);

        const hbFill = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 0.1),
            new THREE.MeshBasicMaterial({ color: 0x2ecc71 })
        );
        hbFill.name = 'healthFill';
        hbGroup.add(hbFill);

        hbGroup.position.y = 3.0;
        hbGroup.name = 'healthBar';
        group.add(hbGroup);

        scene.add(group);
        playerMeshes[playerData.id] = group;
        return group;
    }

    // === COLLISION ===
    function checkCollision(x, z, radius) {
        for (const box of wallBoxes) {
            const closestX = Math.max(box.minX, Math.min(x, box.maxX));
            const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
            const dx = x - closestX;
            const dz = z - closestZ;
            if (dx * dx + dz * dz < radius * radius) {
                return true;
            }
        }
        return false;
    }

    function moveWithCollision(x, z, dx, dz, radius) {
        let newX = x + dx;
        let newZ = z + dz;

        // Try full move
        if (!checkCollision(newX, newZ, radius)) {
            return { x: newX, z: newZ };
        }

        // Try X only
        if (!checkCollision(newX, z, radius)) {
            return { x: newX, z };
        }

        // Try Z only
        if (!checkCollision(x, newZ, radius)) {
            return { x, z: newZ };
        }

        return { x, z };
    }

    // === RAYCASTING (for bullets) ===
    function raycast(shooterId, originX, originY, originZ, dirX, dirY, dirZ, maxDist = 200) {
        const origin = new THREE.Vector3(originX, originY, originZ);
        const direction = new THREE.Vector3(dirX, dirY, dirZ).normalize();

        // Check against players
        let closestHit = null;
        let closestDist = maxDist;

        for (const p of players) {
            if (!p.alive || p.id === shooterId) continue; // otuvchining o'zi emas

            // Simple sphere check for each player
            const playerPos = new THREE.Vector3(p.x, p.y - EYE_HEIGHT + PLAYER_HEIGHT / 2 + 0.5, p.z);
            const toPlayer = new THREE.Vector3().subVectors(playerPos, origin);
            const projDist = toPlayer.dot(direction);

            if (projDist < 0 || projDist > closestDist) continue;

            const closestPoint = new THREE.Vector3().copy(origin).addScaledVector(direction, projDist);
            const distToCenter = closestPoint.distanceTo(playerPos);

            if (distToCenter < PLAYER_RADIUS + 0.3) {
                closestDist = projDist;
                closestHit = { type: 'player', player: p, distance: projDist, point: closestPoint.clone() };
            }
        }

        // Check against walls (simplified: step along ray)
        const step = 0.5;
        for (let t = 0; t < Math.min(closestDist, maxDist); t += step) {
            const px = originX + dirX * t;
            const py = originY + dirY * t;
            const pz = originZ + dirZ * t;

            if (py < 0 || py > WALL_HEIGHT) continue;

            const col = Math.floor(px / TILE);
            const row = Math.floor(pz / TILE);
            if (col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS && MAP[row][col] !== 0) {
                const hitPoint = new THREE.Vector3(px, py, pz);
                if (t < closestDist) {
                    closestHit = { type: 'wall', distance: t, point: hitPoint };
                    closestDist = t;
                }
                break;
            }
        }

        return closestHit;
    }

    // === SHOOTING ===
    function rollDamage(headshotChance) {
        const isHeadshot = Math.random() < headshotChance;
        return Math.round(isHeadshot ? BULLET_DAMAGE * HEADSHOT_MULT : BULLET_DAMAGE);
    }

    function playerShoot() {
        const p = me;
        if (!p || !p.alive || p.reloading) return;
        if (p.ammo <= 0) {
            if (p.reserve > 0) startReload(p);
            return;
        }

        const now = performance.now();
        if (now - p.lastShot < FIRE_RATE) return;
        p.lastShot = now;
        p.ammo--;
        playGunshot(0.55, 0);

        // Recoil (yaqinlashganda aniqroq)
        const spread = 0.02 * (1 - zoomT * 0.8);
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(camera.quaternion);
        dir.x += (Math.random() - 0.5) * spread;
        dir.y += (Math.random() - 0.5) * spread;
        dir.z += (Math.random() - 0.5) * spread;
        dir.normalize();

        // Muzzle flash
        showMuzzleFlash();

        // Gun recoil animation
        if (gunGroup) {
            gunGroup.position.z = -0.4;
            gunGroup.rotation.x = -0.08;
        }

        // Raycast
        const hit = raycast(p.id, p.x, p.y, p.z, dir.x, dir.y, dir.z);
        const end = hit
            ? hit.point
            : { x: p.x + dir.x * 100, y: p.y + dir.y * 100, z: p.z + dir.z * 100 };
        const target = hit && hit.type === 'player' ? hit.player : null;
        const wallHit = Boolean(hit) && !target;

        createTracer(p.x, p.y, p.z, end.x, end.y, end.z);
        if (wallHit) createImpactSpark(end.x, end.y, end.z);

        if (online) {
            sendOwnShot(p, end, wallHit, target);
        } else if (target) {
            damagePlayer(target, rollDamage(HEADSHOT_CHANCE), p.id);
            showHitMarker();
        }

        // Auto reload
        if (p.ammo <= 0 && p.reserve > 0) startReload(p);

        updateHUD();
    }

    function botShoot(bot) {
        if (!bot.alive || bot.reloading || bot.ammo <= 0) return;

        const now = performance.now();
        if (now - bot.lastShot < FIRE_RATE + 50) return;
        bot.lastShot = now;
        bot.ammo--;
        playBotGunshot(bot);

        if (bot.botTarget && bot.botTarget.alive) {
            const target = bot.botTarget;
            const dx = target.x - bot.x;
            const dy = (target.y || EYE_HEIGHT) - bot.y;
            const dz = target.z - bot.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const aimError = 0.08 + (dist / 400) * 0.15;

            const dirX = dx / dist + (Math.random() - 0.5) * aimError;
            const dirY = dy / dist + (Math.random() - 0.5) * aimError * 0.5;
            const dirZ = dz / dist + (Math.random() - 0.5) * aimError;

            const hit = raycast(bot.id, bot.x, bot.y, bot.z, dirX, dirY, dirZ);

            if (hit) {
                createTracer(bot.x, bot.y, bot.z, hit.point.x, hit.point.y, hit.point.z);

                const hitEnemy = hit.type === 'player' && hit.player.team !== bot.team;
                broadcastShot(bot, hit.point, !hitEnemy);

                if (hitEnemy) {
                    damagePlayer(hit.player, rollDamage(HEADSHOT_CHANCE * 0.7), bot.id);
                } else {
                    createImpactSpark(hit.point.x, hit.point.y, hit.point.z);
                }
            } else {
                const end = { x: bot.x + dirX * 80, y: bot.y + dirY * 80, z: bot.z + dirZ * 80 };
                createTracer(bot.x, bot.y, bot.z, end.x, end.y, end.z);
                broadcastShot(bot, end, false);
            }
        }

        if (bot.ammo <= 0 && bot.reserve > 0) startReload(bot);
    }

    function startReload(p) {
        p.reloading = true;
        if (p === me) {
            hud.reloadIndicator.classList.remove('hidden');
            const progress = document.getElementById('reload-progress');
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = '';
        }
        setTimeout(() => {
            if (p.alive) {
                const needed = MAX_AMMO - p.ammo;
                const avail = Math.min(needed, p.reserve);
                p.ammo += avail;
                p.reserve -= avail;
            }
            p.reloading = false;
            if (p === me) {
                hud.reloadIndicator.classList.add('hidden');
                updateHUD();
            }
        }, RELOAD_TIME);
    }

    // === OVOZ ===
    // Fayl kerak emas: o'q ovozi Web Audio bilan yasaladi
    function initAudio() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return;
        }
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        // Bir marta yaratilgan oq shovqin har otishda qayta ishlatiladi
        const len = Math.floor(audioCtx.sampleRate * 0.3);
        noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }

    function playGunshot(volume, pan) {
        if (!audioCtx || volume < 0.01) return;
        const t = audioCtx.currentTime;

        const out = audioCtx.createGain();
        out.gain.value = volume;
        if (audioCtx.createStereoPanner) {
            const panner = audioCtx.createStereoPanner();
            panner.pan.value = pan;
            out.connect(panner);
            panner.connect(audioCtx.destination);
        } else {
            out.connect(audioCtx.destination);
        }

        // Portlash: tez so'nadigan shovqin
        const noise = audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.playbackRate.value = 0.9 + Math.random() * 0.2;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(7000, t);
        filter.frequency.exponentialRampToValueAtTime(500, t + 0.15);
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(1, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(out);
        noise.start(t);
        noise.stop(t + 0.22);

        // Zarba: past chastota
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.9, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(oscGain);
        oscGain.connect(out);
        osc.start(t);
        osc.stop(t + 0.16);
    }

    // Bot o'qi: uzoqlashgan sari pasayadi, chap/o'ng tomondan eshitiladi
    function playBotGunshot(bot) {
        if (!me) return;
        const dx = bot.x - me.x;
        const dz = bot.z - me.z;
        const dist = Math.hypot(dx, dz);
        const volume = 0.4 * Math.max(0, 1 - dist / 140);
        const rightDot = dist > 0.01 ? (dx * Math.cos(me.yaw) - dz * Math.sin(me.yaw)) / dist : 0;
        playGunshot(volume, Math.max(-1, Math.min(1, rightDot)) * 0.8);
    }

    // === EFFECTS ===
    function showMuzzleFlash() {
        muzzleFlashTimer = 3;
        muzzleFlashLight.intensity = 3;
    }

    function createTracer(x1, y1, z1, x2, y2, z2) {
        const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.8 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        tracerLines.push({ mesh: line, life: 5 });
    }

    function createImpactSpark(x, y, z) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.05, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: 0xffcc66 });
            const spark = new THREE.Mesh(geo, mat);
            spark.position.set(x, y, z);
            scene.add(spark);
            impactParticles.push({
                mesh: spark,
                vx: (Math.random() - 0.5) * 0.3,
                vy: Math.random() * 0.2,
                vz: (Math.random() - 0.5) * 0.3,
                life: 15 + Math.random() * 10,
            });
        }
    }

    function createBloodEffect(x, y, z) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.06, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });
            const p = new THREE.Mesh(geo, mat);
            p.position.set(x, y, z);
            scene.add(p);
            impactParticles.push({
                mesh: p,
                vx: (Math.random() - 0.5) * 0.25,
                vy: Math.random() * 0.15,
                vz: (Math.random() - 0.5) * 0.25,
                life: 20 + Math.random() * 15,
            });
        }
    }

    // === DAMAGE ===
    // Yakka o'yinda va xona egasida ishlaydi: zararni aynan shu yerda hal qilamiz
    function damagePlayer(target, damage, attackerId) {
        if (!target.alive) return;
        const health = Math.max(0, target.health - damage);
        const headshot = damage >= BULLET_DAMAGE * HEADSHOT_MULT * 0.9;

        applyDamage(target, health, attackerId, headshot);
        if (isHost()) {
            online.room.broadcast({ t: 'damage', id: target.id, health, by: attackerId, headshot });
        }
        if (health === 0) checkRoundEnd();
    }

    // Barcha kompyuterlarda ishlaydi: holat va ko'rinishni yangilaydi
    function applyDamage(target, health, attackerId, headshot) {
        target.health = health;
        createBloodEffect(target.x, EYE_HEIGHT, target.z);

        if (target === me) {
            showDamageVignette();
        }

        if (health === 0) {
            target.alive = false;
            target.respawnTimer = RESPAWN_TIME;

            // Hide mesh
            if (playerMeshes[target.id]) {
                playerMeshes[target.id].visible = false;
            }

            const attacker = players.find(p => p.id === attackerId);
            if (attacker) {
                addKillFeed(attacker, target, headshot);
                if (attacker === me) playerStats.kills++;
            }
            if (target === me) playerStats.deaths++;
        }
        updateHUD();
    }

    function revivePlayer(p) {
        p.reset(p.spawn.col, p.spawn.row);
        if (playerMeshes[p.id]) playerMeshes[p.id].visible = true;
        if (p === me) {
            playerVelocityY = 0;
            playerOnGround = true;
            camera.position.set(p.x, p.y, p.z);
            updateHUD();
        }
    }

    function showDamageVignette() {
        hud.damageVignette.classList.add('flash');
        setTimeout(() => hud.damageVignette.classList.remove('flash'), 200);
    }

    // === LINE OF SIGHT ===
    function hasLOS(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const steps = Math.ceil(dist / 2);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const pz = z1 + dz * t;
            const col = Math.floor(px / TILE);
            const row = Math.floor(pz / TILE);
            if (col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS) {
                if (MAP[row][col] === 1) return false;
            }
        }
        return true;
    }

    // === BOT AI ===
    function updateBot(bot, dt) {
        if (!bot.alive) {
            tickRespawn(bot, dt);
            return;
        }

        const frames = dt * 60; // tezlik monitor chastotasiga bog'liq bo'lmasin

        // Find closest enemy
        let closest = null;
        let closestDist = Infinity;
        for (const other of players) {
            if (!other.alive || other.team === bot.team) continue;
            const dx = other.x - bot.x;
            const dz = other.z - bot.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < closestDist) {
                closestDist = dist;
                closest = other;
            }
        }

        bot.botTarget = closest;
        bot.canSeeTarget = closest ? hasLOS(bot.x, bot.z, closest.x, closest.z) : false;

        bot.strafeTimer -= dt * 1000;
        bot.botPatrolTimer -= dt * 1000;

        if (bot.canSeeTarget && closest) {
            // Face enemy
            bot.yaw = Math.atan2(closest.x - bot.x, closest.z - bot.z);

            // Shoot
            bot.botReactionTimer -= dt * 1000;
            if (bot.botReactionTimer <= 0) {
                botShoot(bot);
                bot.botReactionTimer = 80 + Math.random() * 120;
            }

            // Strafe
            if (bot.strafeTimer <= 0) {
                bot.strafeDir = Math.random() > 0.5 ? 1 : -1;
                bot.strafeTimer = 600 + Math.random() * 1200;
            }

            const strafeAngle = bot.yaw + (Math.PI / 2) * bot.strafeDir;
            let moveAngle;
            if (closestDist < 20) moveAngle = bot.yaw + Math.PI;
            else if (closestDist > 50) moveAngle = bot.yaw;
            else moveAngle = strafeAngle;

            const spd = MOVE_SPEED * 0.8 * frames;
            const result = moveWithCollision(
                bot.x, bot.z,
                Math.sin(moveAngle) * spd,
                Math.cos(moveAngle) * spd,
                PLAYER_RADIUS
            );
            bot.x = result.x;
            bot.z = result.z;
        } else {
            // Patrol
            if (bot.botPatrolTimer <= 0 || !bot.botPatrolTarget) {
                for (let i = 0; i < 30; i++) {
                    const col = 2 + Math.floor(Math.random() * (MAP_COLS - 4));
                    const row = 2 + Math.floor(Math.random() * (MAP_ROWS - 4));
                    if (MAP[row][col] === 0) {
                        bot.botPatrolTarget = tileToWorld(col, row);
                        break;
                    }
                }
                bot.botPatrolTimer = 3000 + Math.random() * 3000;
            }

            if (bot.botPatrolTarget) {
                const dx = bot.botPatrolTarget.x - bot.x;
                const dz = bot.botPatrolTarget.z - bot.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 2) {
                    bot.yaw = Math.atan2(dx, dz);
                    const result = moveWithCollision(
                        bot.x, bot.z,
                        Math.sin(bot.yaw) * MOVE_SPEED * frames,
                        Math.cos(bot.yaw) * MOVE_SPEED * frames,
                        PLAYER_RADIUS
                    );
                    bot.x = result.x;
                    bot.z = result.z;
                } else {
                    bot.botPatrolTarget = null;
                }
            }

            if (!bot.reloading && bot.ammo < 10 && bot.reserve > 0) {
                startReload(bot);
            }
        }
    }

    function tickRespawn(p, dt) {
        p.respawnTimer -= dt * 1000;
        if (p.respawnTimer <= 0) revivePlayer(p);
    }

    // Botlar va qayta tug'ilish: mehmon kompyuterida ishlamaydi
    function simulate(dt) {
        for (const p of players) {
            if (p.isBot) updateBot(p, dt);
            else if (!p.alive) tickRespawn(p, dt);
        }
    }

    function updatePlayerMesh(p) {
        const mesh = playerMeshes[p.id];
        if (!mesh) return;

        mesh.position.set(p.x, p.y - EYE_HEIGHT, p.z);
        mesh.rotation.y = p.yaw;

        // Health bar
        const hb = mesh.getObjectByName('healthBar');
        if (hb) {
            hb.lookAt(camera.position);
            const fill = mesh.getObjectByName('healthFill');
            if (fill) {
                const pct = p.health / 100;
                fill.scale.x = Math.max(0.01, pct);
                fill.position.x = -(1 - pct) * 0.6;
                fill.material.color.setHex(pct > 0.5 ? 0x2ecc71 : pct > 0.25 ? 0xf39c12 : 0xe74c3c);
            }
        }
    }

    // === ROUND MANAGEMENT ===
    function checkRoundEnd() {
        if (gameState !== 'playing') return;
        const ctAlive = players.filter(p => p.team === 'ct' && p.alive).length;
        const tAlive = players.filter(p => p.team === 't' && p.alive).length;
        if (ctAlive === 0) endRound('t');
        else if (tAlive === 0) endRound('ct');
    }

    function endRound(winner) {
        clearInterval(roundTimerInterval);

        if (winner === 'ct') ctScore++;
        else tScore++;
        showRoundResult(winner);
        if (isHost()) online.room.broadcast({ t: 'roundEnd', winner, ct: ctScore, ts: tScore });

        if (ctScore >= ROUNDS_TO_WIN || tScore >= ROUNDS_TO_WIN) {
            roundChangeTimer = setTimeout(endGame, 2500);
        } else {
            roundChangeTimer = setTimeout(() => {
                currentRound++;
                gameState = 'playing';
                startRound(online ? online.roster : buildSoloRoster());
            }, 3000);
        }
    }

    function showRoundResult(winner) {
        gameState = 'roundEnd';
        showAnnouncement(winner === 'ct' ? "CT G'ALABA!" : "TERRORISTLAR G'ALABA!");
        updateHUD();
    }

    function endGame() {
        gameState = 'gameOver';
        clearInterval(roundTimerInterval);
        if (online) {
            online.inMatch = false;
            if (isHost()) online.room.broadcast({ t: 'gameOver' });
        }
        document.getElementById('restart-label').textContent = online ? "XONAGA QAYTISH" : "QAYTA O'YNASH";
        document.getElementById('restart-btn').classList.toggle('hidden', isClient());
        document.getElementById('gameover-wait').classList.toggle('hidden', !isClient());
        document.exitPointerLock?.();

        const winner = ctScore >= ROUNDS_TO_WIN ? 'CT' : 'TERRORISTLAR';
        document.getElementById('winner-text').textContent = `${winner} G'ALABA!`;
        document.getElementById('final-ct').textContent = ctScore;
        document.getElementById('final-t').textContent = tScore;
        document.getElementById('stat-kills').textContent = playerStats.kills;
        document.getElementById('stat-deaths').textContent = playerStats.deaths;
        document.getElementById('stat-kd').textContent =
            playerStats.deaths > 0 ? (playerStats.kills / playerStats.deaths).toFixed(1) : playerStats.kills.toFixed(1);
        showScreen('gameover');
    }

    // === HUD ===
    function updateHUD() {
        const p = me;
        if (!p) return;
        hud.ctScore.textContent = ctScore;
        hud.tScore.textContent = tScore;
        hud.roundNumber.textContent = `RAUND ${currentRound}`;
        const mins = Math.floor(roundTimer / 60);
        const secs = roundTimer % 60;
        hud.roundTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        hud.roundTimer.classList.toggle('warning', roundTimer <= 10);
        hud.healthBar.style.width = `${Math.max(0, p.health)}%`;
        hud.healthBar.classList.toggle('low', p.health <= 30);
        hud.healthText.textContent = Math.max(0, p.health);
        hud.ammoCurrent.textContent = p.ammo;
        hud.ammoReserve.textContent = p.reserve;
    }

    function addKillFeed(killer, victim, headshot) {
        const entry = document.createElement('div');
        entry.className = 'kill-entry';
        // Ismlarni boshqa o'yinchilar yozadi: faqat matn sifatida qo'yamiz
        const addPart = (className, text) => {
            const part = document.createElement('span');
            part.className = className;
            part.textContent = text;
            entry.appendChild(part);
        };
        addPart(killer.team === 't' ? 'killer t-team' : 'killer', killer.name);
        addPart('weapon-icon', headshot ? '🎯 AK-47' : 'AK-47');
        addPart('victim', victim.name);
        hud.killFeed.appendChild(entry);
        setTimeout(() => { entry.style.opacity = '0'; setTimeout(() => entry.remove(), 400); }, 4000);
        while (hud.killFeed.children.length > 5) hud.killFeed.removeChild(hud.killFeed.firstChild);
    }

    function showHitMarker() {
        hud.hitMarker.classList.remove('hidden', 'show');
        void hud.hitMarker.offsetWidth;
        hud.hitMarker.classList.add('show');
        setTimeout(() => hud.hitMarker.classList.add('hidden'), 200);
    }

    function showAnnouncement(text) {
        hud.announcementText.textContent = text;
        hud.announcement.classList.remove('hidden');
        setTimeout(() => hud.announcement.classList.add('hidden'), 2500);
    }

    // === SCREEN MANAGEMENT ===
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // === INPUT ===
    function setupInput() {
        window.addEventListener('keydown', e => {
            keys[e.code] = true;
            if (e.code === 'Escape' && gameState === 'playing' && !online) {
                document.exitPointerLock?.();
                gameState = 'menu';
                showScreen('menu');
                clearInterval(roundTimerInterval);
            }
            if (e.code === 'KeyR' && gameState === 'playing') {
                const p = me;
                if (p && p.alive && !p.reloading && p.ammo < MAX_AMMO && p.reserve > 0) startReload(p);
            }
        });
        window.addEventListener('keyup', e => { keys[e.code] = false; });

        document.addEventListener('pointerlockchange', () => {
            pointerLocked = document.pointerLockElement === canvas;
            if (!pointerLocked) {
                mouseDown = false;
                aimDown = false;
            }
            if (!pointerLocked && gameState === 'playing') {
                hud.clickToPlay.classList.add('show');
            } else {
                hud.clickToPlay.classList.remove('show');
            }
        });

        canvas.addEventListener('click', () => {
            if (gameState === 'playing' && !pointerLocked) {
                lockPointer();
            }
        });

        hud.clickToPlay.addEventListener('click', lockPointer);

        document.addEventListener('mousemove', e => {
            if (!pointerLocked || gameState !== 'playing') return;
            const p = me;
            if (!p || !p.alive) return;

            // Yaqinlashganda sichqoncha ham sekinlashadi
            const sens = MOUSE_SENSITIVITY * (camera.fov / FOV_NORMAL);
            p.yaw -= e.movementX * sens;
            p.pitch -= e.movementY * sens;
            p.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, p.pitch));
        });

        document.addEventListener('mousedown', e => {
            if (e.button === 0) mouseDown = true;
            if (e.button === 2) aimDown = true;
        });
        document.addEventListener('mouseup', e => {
            if (e.button === 0) mouseDown = false;
            if (e.button === 2) aimDown = false;
        });

        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    function lockPointer() {
        initAudio();
        const request = canvas.requestPointerLock();
        // Ba'zi brauzerlar rad etganda Promise qaytaradi: foydalanuvchi qayta bosadi
        if (request && request.catch) request.catch(() => {});
    }

    // === JAMOA HAJMI ===
    function loadTeamSizes() {
        const sizes = { ct: 2, t: 2 };
        try {
            const saved = JSON.parse(localStorage.getItem('cs3d-teams'));
            if (saved) {
                sizes.ct = clampTeamSize(saved.ct, sizes.ct);
                sizes.t = clampTeamSize(saved.t, sizes.t);
            }
        } catch (e) { /* saqlanmagan bo'lsa standart 2 vs 2 */ }
        return sizes;
    }

    function clampTeamSize(n, fallback) {
        n = Number(n);
        if (!Number.isInteger(n)) return fallback;
        return Math.max(1, Math.min(MAX_TEAM_SIZE, n));
    }

    function setupTeamPickers() {
        for (const team of ['ct', 't']) {
            const box = document.getElementById(`${team}-count`);
            for (let n = 1; n <= MAX_TEAM_SIZE; n++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'picker-btn';
                btn.textContent = n;
                btn.addEventListener('click', () => {
                    teamSizes[team] = n;
                    try { localStorage.setItem('cs3d-teams', JSON.stringify(teamSizes)); } catch (e) { /* e'tiborsiz */ }
                    renderTeamPickers();
                });
                box.appendChild(btn);
            }
        }
        renderTeamPickers();
    }

    function renderTeamPickers() {
        for (const team of ['ct', 't']) {
            const btns = document.querySelectorAll(`#${team}-count .picker-btn`);
            btns.forEach((btn, i) => btn.classList.toggle('active', i + 1 === teamSizes[team]));
        }
        document.getElementById('mode-text').textContent = `${teamSizes.ct} vs ${teamSizes.t} DEATHMATCH`;
    }

    // === GAME START ===
    function prepareMatch() {
        gameState = 'playing';
        ctScore = 0;
        tScore = 0;
        currentRound = 1;
        playerStats = { kills: 0, deaths: 0 };

        initAudio();

        if (!scene) {
            initThree();
            buildMap();
            createGunModel();
        }

        document.getElementById('leave-match-btn').classList.toggle('hidden', !online);
        showScreen('game');
    }

    function startGame() {
        prepareMatch();
        startRound(buildSoloRoster());
        lockPointer();
    }

    function buildSoloRoster() {
        const roster = [];
        let nextId = 0;
        for (let i = 0; i < teamSizes.ct; i++) {
            roster.push({ id: nextId++, name: i === 0 ? 'Siz' : `Sherik_${i}`, team: 'ct', bot: i !== 0, slot: i });
        }
        for (let i = 0; i < teamSizes.t; i++) {
            roster.push({ id: nextId++, name: `Dushman_${i + 1}`, team: 't', bot: true, slot: i });
        }
        return roster;
    }

    function startRound(roster) {
        tracerLines.forEach(t => scene.remove(t.mesh));
        tracerLines = [];
        impactParticles.forEach(p => scene.remove(p.mesh));
        impactParticles = [];
        hud.killFeed.innerHTML = '';

        // Remove old player meshes
        Object.values(playerMeshes).forEach(m => scene.remove(m));
        playerMeshes = {};

        // Create players
        players = roster.map(r => {
            const spawn = (r.team === 'ct' ? CT_SPAWNS : T_SPAWNS)[r.slot];
            return new PlayerData(r.id, r.name, r.team, spawn.col, spawn.row, r.bot);
        });
        me = players.find(p => p.id === (online ? online.myId : 0));

        // O'zimizdan boshqa hammaning modeli ko'rinadi
        for (const p of players) {
            if (p !== me) createPlayerMesh(p);
        }

        hud.reloadIndicator.classList.add('hidden');

        // Position camera
        const p = me;
        camera.position.set(p.x, p.y, p.z);
        camera.rotation.set(0, 0, 0);
        aimDown = false;
        zoomT = 0;
        updateZoom(false);
        playerVelocityY = 0;
        playerOnGround = true;

        roundTimer = ROUND_TIME;
        clearInterval(roundTimerInterval);
        // Mehmon vaqtni xona egasidan oladi
        if (!isClient()) {
            roundTimerInterval = setInterval(() => {
                if (gameState === 'playing') {
                    roundTimer--;
                    updateHUD();
                    if (roundTimer <= 0) endRound('ct');
                }
            }, 1000);
        }

        if (isHost()) {
            online.room.broadcast({ t: 'round', round: currentRound, ct: ctScore, ts: tScore, roster });
        }

        updateHUD();
        showAnnouncement(online
            ? `RAUND ${currentRound} — SIZ ${me.team.toUpperCase()} JAMOASIDA`
            : `RAUND ${currentRound}`);
    }

    // === ONLAYN O'YIN ===
    // Xona egasi raund, vaqt, jon va botlarni boshqaradi.
    // Har bir o'yinchi o'z harakatini o'zi hisoblaydi va o'z ekranida ko'rgan nishonni xabar qiladi.
    const onlineUI = {
        name: document.getElementById('name-input'),
        code: document.getElementById('code-input'),
        status: document.getElementById('online-status'),
        createBtn: document.getElementById('create-room-btn'),
        joinBtn: document.getElementById('join-room-btn'),
        roomCode: document.getElementById('room-code'),
        lobbyStatus: document.getElementById('lobby-status'),
        fillRow: document.getElementById('fill-bots-row'),
        fillBots: document.getElementById('fill-bots'),
        startBtn: document.getElementById('start-match-btn'),
    };

    function isHost() { return Boolean(online) && online.role === 'host'; }
    function isClient() { return Boolean(online) && online.role === 'client'; }

    function setStatus(el, text, isError) {
        el.textContent = text;
        el.classList.toggle('error', Boolean(isError));
    }

    function cleanName(raw) {
        return String(raw || '').trim().slice(0, MAX_NAME_LENGTH);
    }

    function validVector(v) {
        return Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
    }

    function roundCoord(n) {
        return Math.round(n * 100) / 100;
    }

    function coords(p) {
        return [roundCoord(p.x), roundCoord(p.y), roundCoord(p.z)];
    }

    function setOnlineBusy(busy) {
        onlineUI.createBtn.disabled = busy;
        onlineUI.joinBtn.disabled = busy;
    }

    function readPlayerName() {
        const name = cleanName(onlineUI.name.value);
        if (!name) {
            setStatus(onlineUI.status, "Avval ismingizni yozing.", true);
            onlineUI.name.focus();
            return null;
        }
        try { localStorage.setItem('cs3d-name', name); } catch (e) { /* e'tiborsiz */ }
        return name;
    }

    // Xonadan chiqish: sabab berilsa, onlayn ekranda ko'rsatiladi
    function leaveOnline(reason) {
        if (!online) return;
        const room = online.room;
        online = null;
        if (room) room.close();

        clearInterval(roundTimerInterval);
        clearTimeout(roundChangeTimer);
        setOnlineBusy(false);
        if (gameState !== 'menu') {
            gameState = 'menu';
            document.exitPointerLock?.();
        }
        if (reason) {
            setStatus(onlineUI.status, reason, true);
            showScreen('online');
        }
    }

    function createRoom() {
        const name = readPlayerName();
        if (!name) return;
        initAudio();
        setOnlineBusy(true);
        setStatus(onlineUI.status, "Xona ochilmoqda...");

        online = {
            role: 'host',
            myId: 0,
            nextId: 1,
            code: '',
            inMatch: false,
            fillBots: true,
            roster: [],
            members: [{ id: 0, name, team: 'ct', peer: null }],
        };
        online.room = Net.host({
            onOpen(code) {
                online.code = code;
                setOnlineBusy(false);
                setStatus(onlineUI.status, '');
                showLobby();
            },
            onGuestMessage: handleGuestMessage,
            onGuestLeave: handleGuestLeave,
            onError: text => leaveOnline(text),
        });
    }

    function joinRoom() {
        const name = readPlayerName();
        if (!name) return;
        const code = Net.normalizeCode(onlineUI.code.value);
        if (code.length !== 5) {
            setStatus(onlineUI.status, "Xona kodi 5 ta belgidan iborat.", true);
            onlineUI.code.focus();
            return;
        }
        initAudio();
        setOnlineBusy(true);
        setStatus(onlineUI.status, "Xonaga ulanilmoqda...");

        online = { role: 'client', myId: null, code, inMatch: false, fillBots: true, roster: [], members: [] };
        online.room = Net.join(code, {
            onOpen() {
                online.room.send({ t: 'hello', name, version: NET_VERSION });
            },
            onMessage: handleHostMessage,
            onClose: text => leaveOnline(text),
            onError: text => leaveOnline(text),
        });
    }

    // === XONA (LOBBY) ===
    function showLobby() {
        const host = isHost();
        onlineUI.roomCode.textContent = online.code;
        onlineUI.fillRow.classList.toggle('hidden', !host);
        onlineUI.startBtn.classList.toggle('hidden', !host);
        setStatus(onlineUI.lobbyStatus, host ? "Do'stlaringizga kodni yuboring" : "Xona egasi boshlashini kuting");
        renderLobby();
        showScreen('lobby');
    }

    function renderLobby() {
        for (const team of ['ct', 't']) {
            const list = document.getElementById(`lobby-${team}`);
            list.textContent = '';
            for (const member of online.members) {
                if (member.team !== team) continue;
                const item = document.createElement('li');
                item.textContent = member.id === 0 ? `${member.name} ★` : member.name;
                item.classList.toggle('is-me', member.id === online.myId);
                list.appendChild(item);
            }
        }
        onlineUI.fillBots.checked = online.fillBots;
    }

    function syncLobby() {
        const members = online.members.map(({ id, name, team }) => ({ id, name, team }));
        online.room.broadcast({ t: 'lobby', members, fillBots: online.fillBots });
        renderLobby();
    }

    function teamCount(team) {
        return online.members.filter(m => m.team === team).length;
    }

    function changeTeam(member, team) {
        if ((team !== 'ct' && team !== 't') || member.team === team) return;
        if (teamCount(team) >= MAX_TEAM_SIZE || online.inMatch) return;
        member.team = team;
        syncLobby();
    }

    function requestTeamSwitch() {
        if (isHost()) {
            const member = online.members[0];
            changeTeam(member, member.team === 'ct' ? 't' : 'ct');
            return;
        }
        const member = online.members.find(m => m.id === online.myId);
        if (member) online.room.send({ t: 'team', team: member.team === 'ct' ? 't' : 'ct' });
    }

    function copyInviteLink() {
        const link = `${location.origin}${location.pathname}?xona=${online.code}`;
        const done = () => setStatus(onlineUI.lobbyStatus, "Havola nusxalandi");
        const failed = () => setStatus(onlineUI.lobbyStatus, link);
        if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, failed);
        else failed();
    }

    function buildOnlineRoster() {
        const roster = [];
        const humans = { ct: 0, t: 0 };
        for (const member of online.members) {
            roster.push({ id: member.id, name: member.name, team: member.team, bot: false, slot: humans[member.team]++ });
        }
        if (online.fillBots) {
            const target = Math.max(humans.ct, humans.t, 1);
            let botId = BOT_ID_START;
            for (const team of ['ct', 't']) {
                for (let slot = humans[team]; slot < target; slot++) {
                    roster.push({ id: botId, name: `Bot_${botId - BOT_ID_START + 1}`, team, bot: true, slot });
                    botId++;
                }
            }
        }
        return roster;
    }

    function hostStartMatch() {
        const roster = buildOnlineRoster();
        if (!roster.some(r => r.team === 'ct') || !roster.some(r => r.team === 't')) {
            setStatus(onlineUI.lobbyStatus, "Ikkala jamoada ham kamida bitta o'yinchi bo'lsin.", true);
            return;
        }
        online.roster = roster;
        online.inMatch = true;
        prepareMatch();
        startRound(roster);
        lockPointer();
    }

    function hostReturnToLobby() {
        gameState = 'menu';
        online.room.broadcast({ t: 'toLobby' });
        syncLobby();
        showLobby();
    }

    // === XONA EGASI: mehmondan kelgan xabarlar ===
    function rejectGuest(peerId, reason) {
        online.room.send(peerId, { t: 'reject', reason });
        setTimeout(() => { if (isHost()) online.room.kick(peerId); }, 500);
    }

    function handleGuestHello(peerId, msg) {
        if (msg.version !== NET_VERSION) {
            rejectGuest(peerId, "O'yin versiyasi boshqacha. Sahifani yangilang.");
        } else if (online.inMatch) {
            rejectGuest(peerId, "Bu xonada o'yin allaqachon boshlangan.");
        } else if (online.members.length >= MAX_TEAM_SIZE * 2) {
            rejectGuest(peerId, "Xona to'lgan.");
        } else {
            const member = {
                id: online.nextId++,
                name: cleanName(msg.name) || "O'yinchi",
                team: teamCount('ct') <= teamCount('t') ? 'ct' : 't',
                peer: peerId,
            };
            online.members.push(member);
            online.room.send(peerId, { t: 'welcome', id: member.id, code: online.code });
            syncLobby();
        }
    }

    function handleGuestState(member, msg) {
        const p = players.find(pl => pl.id === member.id);
        if (!p || !p.alive || !validVector(msg.pos) || !Number.isFinite(msg.yaw)) return;
        [p.netX, p.netY, p.netZ] = msg.pos;
        p.netYaw = msg.yaw;
    }

    function handleGuestShot(member, msg, peerId) {
        const shooter = players.find(pl => pl.id === member.id);
        const now = performance.now();
        if (!shooter || !shooter.alive || gameState !== 'playing' || msg.round !== currentRound) return;
        if (!validVector(msg.from) || !validVector(msg.to)) return;
        // Tarmoq kechikishi xabarlarni yaqinlashtirib yuborishi mumkin
        if (now - shooter.lastShot < FIRE_RATE * 0.5) return;
        shooter.lastShot = now;

        showRemoteShot(shooter, msg.from, msg.to, msg.wall);
        online.room.broadcast({ t: 'shot', by: shooter.id, from: msg.from, to: msg.to, wall: msg.wall }, peerId);

        const target = players.find(pl => pl.id === msg.hit);
        if (target && target.alive && target.team !== shooter.team) {
            damagePlayer(target, rollDamage(HEADSHOT_CHANCE), shooter.id);
        }
    }

    function handleGuestMessage(peerId, msg) {
        if (!online) return;
        if (msg.t === 'hello') {
            handleGuestHello(peerId, msg);
            return;
        }
        const member = online.members.find(m => m.peer === peerId);
        if (!member) return;
        if (msg.t === 'team') changeTeam(member, msg.team);
        else if (msg.t === 'state') handleGuestState(member, msg);
        else if (msg.t === 'shot') handleGuestShot(member, msg, peerId);
    }

    function handleGuestLeave(peerId) {
        if (!online) return;
        const member = online.members.find(m => m.peer === peerId);
        if (!member) return;
        online.members = online.members.filter(m => m !== member);

        if (online.inMatch) {
            // O'rnini bot egallaydi: jamoa bo'sh qolmaydi
            const entry = online.roster.find(r => r.id === member.id);
            if (entry) entry.bot = true;
            const p = players.find(pl => pl.id === member.id);
            if (p) p.isBot = true;
            const text = `${member.name.toUpperCase()} CHIQIB KETDI`;
            showAnnouncement(text);
            online.room.broadcast({ t: 'notice', text });
        }
        syncLobby();
    }

    // === MEHMON: xona egasidan kelgan xabarlar ===
    function applySnapshot(msg) {
        if (roundTimer !== msg.timer) {
            roundTimer = msg.timer;
            updateHUD();
        }
        for (const [id, x, y, z, yaw, health, alive] of msg.players) {
            const p = players.find(pl => pl.id === id);
            if (!p) continue;
            if (alive && !p.alive) revivePlayer(p);
            if (p !== me) {
                p.netX = x;
                p.netY = y;
                p.netZ = z;
                p.netYaw = yaw;
            }
            if (p.health !== health) {
                p.health = health;
                if (p === me) updateHUD();
            }
        }
    }

    function enterRound(msg) {
        if (!online.inMatch) {
            online.inMatch = true;
            prepareMatch();
        }
        gameState = 'playing';
        currentRound = msg.round;
        ctScore = msg.ct;
        tScore = msg.ts;
        startRound(msg.roster);
        // Sichqonchani faqat foydalanuvchi bosganda egallash mumkin
        if (!pointerLocked) hud.clickToPlay.classList.add('show');
    }

    function handleHostMessage(msg) {
        if (!online) return;
        // Xona egasi qabul qilmaguncha faqat javobini kutamiz
        if (online.myId === null && msg.t !== 'welcome' && msg.t !== 'reject') return;
        switch (msg.t) {
            case 'welcome':
                online.myId = msg.id;
                online.code = msg.code;
                setOnlineBusy(false);
                setStatus(onlineUI.status, '');
                break;
            case 'reject':
                leaveOnline(msg.reason);
                break;
            case 'lobby':
                online.members = msg.members;
                online.fillBots = msg.fillBots;
                if (!online.inMatch && gameState !== 'gameOver') showLobby();
                break;
            case 'round':
                enterRound(msg);
                break;
            case 'snapshot':
                if (online.inMatch) applySnapshot(msg);
                break;
            case 'shot': {
                const shooter = players.find(p => p.id === msg.by);
                if (shooter) showRemoteShot(shooter, msg.from, msg.to, msg.wall);
                break;
            }
            case 'damage': {
                const target = players.find(p => p.id === msg.id);
                if (target && target.alive) applyDamage(target, msg.health, msg.by, msg.headshot);
                break;
            }
            case 'roundEnd':
                ctScore = msg.ct;
                tScore = msg.ts;
                showRoundResult(msg.winner);
                break;
            case 'gameOver':
                endGame();
                break;
            case 'toLobby':
                gameState = 'menu';
                showLobby();
                break;
            case 'notice':
                showAnnouncement(msg.text);
                break;
        }
    }

    // === OTISHLAR ===
    function showRemoteShot(shooter, from, to, wall) {
        createTracer(from[0], from[1], from[2], to[0], to[1], to[2]);
        if (wall) createImpactSpark(to[0], to[1], to[2]);
        playBotGunshot(shooter);
    }

    // O'zimiz otganimizda: nishonni o'z ekranimizdagi holat bo'yicha aniqlaymiz,
    // shunda kechikish bo'lsa ham ko'rgan odamga tegamiz
    function sendOwnShot(shooter, end, wall, target) {
        const enemy = target && target.team !== shooter.team ? target : null;
        if (enemy) showHitMarker();

        const from = coords(shooter);
        const to = coords(end);
        if (isHost()) {
            online.room.broadcast({ t: 'shot', by: shooter.id, from, to, wall });
            if (enemy) damagePlayer(enemy, rollDamage(HEADSHOT_CHANCE), shooter.id);
        } else {
            online.room.send({ t: 'shot', round: currentRound, from, to, wall, hit: enemy ? enemy.id : null });
        }
    }

    function broadcastShot(shooter, end, wall) {
        if (!isHost()) return;
        online.room.broadcast({ t: 'shot', by: shooter.id, from: coords(shooter), to: coords(end), wall });
    }

    // === HOLATNI YUBORISH ===
    function smoothRemotePlayer(p, dt) {
        if (Math.hypot(p.netX - p.x, p.netZ - p.z) > TELEPORT_DISTANCE) {
            p.x = p.netX;
            p.y = p.netY;
            p.z = p.netZ;
            p.yaw = p.netYaw;
            return;
        }
        const blend = 1 - Math.exp(-dt * SMOOTHING_RATE);
        p.x += (p.netX - p.x) * blend;
        p.y += (p.netY - p.y) * blend;
        p.z += (p.netZ - p.z) * blend;
        const turn = Math.atan2(Math.sin(p.netYaw - p.yaw), Math.cos(p.netYaw - p.yaw));
        p.yaw += turn * blend;
    }

    function netTick() {
        if (!online || !online.inMatch || !me) return;
        if (gameState !== 'playing' && gameState !== 'roundEnd') return;

        if (isHost()) {
            if (document.hidden) simulate(NET_TICK_MS / 1000);
            online.room.broadcast({
                t: 'snapshot',
                timer: roundTimer,
                players: players.map(p => {
                    const [x, y, z] = coords(p);
                    return [p.id, x, y, z, roundCoord(p.yaw), p.health, p.alive];
                }),
            });
        } else if (me.alive) {
            online.room.send({ t: 'state', pos: coords(me), yaw: roundCoord(me.yaw) });
        }
    }

    // Brauzer yashirin tabdagi taymerlarni sekinlatadi, Worker ichidagisini esa yo'q
    function startNetTicker() {
        try {
            const source = `setInterval(() => postMessage(0), ${NET_TICK_MS});`;
            const worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
            worker.onmessage = netTick;
        } catch (e) {
            setInterval(netTick, NET_TICK_MS);
        }
    }

    function setupOnline() {
        try { onlineUI.name.value = localStorage.getItem('cs3d-name') || ''; } catch (e) { /* e'tiborsiz */ }

        document.getElementById('online-btn').addEventListener('click', () => {
            setStatus(onlineUI.status, '');
            showScreen('online');
        });
        document.getElementById('online-back-btn').addEventListener('click', () => {
            leaveOnline();
            showScreen('menu');
        });
        onlineUI.createBtn.addEventListener('click', createRoom);
        onlineUI.joinBtn.addEventListener('click', joinRoom);
        onlineUI.code.addEventListener('keydown', e => {
            if (e.key === 'Enter') joinRoom();
        });
        document.getElementById('copy-link-btn').addEventListener('click', copyInviteLink);
        document.getElementById('switch-team-btn').addEventListener('click', requestTeamSwitch);
        onlineUI.fillBots.addEventListener('change', () => {
            online.fillBots = onlineUI.fillBots.checked;
            syncLobby();
        });
        onlineUI.startBtn.addEventListener('click', hostStartMatch);
        document.getElementById('lobby-leave-btn').addEventListener('click', () => {
            leaveOnline();
            showScreen('online');
        });
        document.getElementById('leave-match-btn').addEventListener('click', e => {
            e.stopPropagation();
            leaveOnline();
            showScreen('menu');
        });
        window.addEventListener('pagehide', () => leaveOnline());

        startNetTicker();

        // Taklif havolasi: ?xona=KOD
        const invited = Net.normalizeCode(new URLSearchParams(location.search).get('xona'));
        if (invited) {
            onlineUI.code.value = invited;
            showScreen('online');
            (onlineUI.name.value ? onlineUI.joinBtn : onlineUI.name).focus();
        }
    }

    // === ZOOM (o'ng tugma) ===
    function updateZoom(active) {
        const target = active ? 1 : 0;
        zoomT += (target - zoomT) * 0.25;
        if (Math.abs(target - zoomT) < 0.001) zoomT = target;
        const fov = FOV_NORMAL + (FOV_ZOOM - FOV_NORMAL) * zoomT;
        if (camera.fov !== fov) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
        hud.root.classList.toggle('zoomed', zoomT > 0.5);
    }

    // === GAME LOOP ===
    function gameLoop() {
        requestAnimationFrame(gameLoop);
        // O'yin boshlanmaguncha sahna yo'q
        if (!scene) return;

        const dt = Math.min(clock.getDelta(), 0.05);

        if (gameState !== 'playing' && gameState !== 'roundEnd') {
            renderer.render(scene, camera);
            return;
        }

        const p = me;
        const frames = dt * 60; // tezlik monitor chastotasiga bog'liq bo'lmasin

        // === Player movement ===
        if (p && p.alive) {
            const isSlow = keys['ShiftLeft'] || keys['ShiftRight'];
            const spd = (isSlow ? SLOW_SPEED : MOVE_SPEED) * frames;
            let moveX = 0, moveZ = 0;

            // Kamera -Z tomonga qaraydi: oldinga = (-sin, -cos), o'ngga = (cos, -sin)
            const fwdX = -Math.sin(p.yaw), fwdZ = -Math.cos(p.yaw);
            const rightX = Math.cos(p.yaw), rightZ = -Math.sin(p.yaw);
            if (keys['KeyW']) { moveX += fwdX * spd; moveZ += fwdZ * spd; }
            if (keys['KeyS']) { moveX -= fwdX * spd; moveZ -= fwdZ * spd; }
            if (keys['KeyD']) { moveX += rightX * spd; moveZ += rightZ * spd; }
            if (keys['KeyA']) { moveX -= rightX * spd; moveZ -= rightZ * spd; }

            // Diagonal yurishda tezlik oshib ketmasin
            const moveLen = Math.hypot(moveX, moveZ);
            if (moveLen > spd) {
                moveX = moveX / moveLen * spd;
                moveZ = moveZ / moveLen * spd;
            }

            const result = moveWithCollision(p.x, p.z, moveX, moveZ, PLAYER_RADIUS);
            p.x = result.x;
            p.z = result.z;

            // Jump
            if (keys['Space'] && playerOnGround) {
                playerVelocityY = JUMP_FORCE;
                playerOnGround = false;
            }
            playerVelocityY -= GRAVITY * frames;
            p.y += playerVelocityY * frames;
            if (p.y <= EYE_HEIGHT) {
                p.y = EYE_HEIGHT;
                playerVelocityY = 0;
                playerOnGround = true;
            }

            // Camera
            camera.position.set(p.x, p.y, p.z);
            camera.rotation.order = 'YXZ';
            camera.rotation.y = p.yaw;
            camera.rotation.x = p.pitch;

            // Muzzle flash light position
            const flashDir = new THREE.Vector3(0, 0, -2);
            flashDir.applyQuaternion(camera.quaternion);
            muzzleFlashLight.position.set(p.x + flashDir.x, p.y + flashDir.y, p.z + flashDir.z);

            // Shooting
            if (mouseDown && pointerLocked) {
                playerShoot();
            }

            // Gun sway — yaqinlashganda qurol pastga tushib, ko'rinmay qoladi
            if (gunGroup) {
                const baseX = 0.35;
                const baseY = -0.35 - 0.4 * zoomT;
                gunGroup.visible = zoomT < 0.85;
                gunGroup.position.z += (-0.5 - gunGroup.position.z) * 0.15;
                gunGroup.rotation.x += (0 - gunGroup.rotation.x) * 0.15;

                // Walk bob
                if (moveX !== 0 || moveZ !== 0) {
                    const bobSpeed = isSlow ? 3 : 6;
                    const bobAmount = (isSlow ? 0.005 : 0.01) * (1 - zoomT * 0.7);
                    const time = performance.now() / 1000;
                    gunGroup.position.y = baseY + Math.sin(time * bobSpeed) * bobAmount;
                    gunGroup.position.x = baseX + Math.cos(time * bobSpeed * 0.5) * bobAmount * 0.5;
                } else {
                    gunGroup.position.y += (baseY - gunGroup.position.y) * 0.25;
                    gunGroup.position.x += (baseX - gunGroup.position.x) * 0.25;
                }
            }
        }

        updateZoom(p && p.alive && aimDown && pointerLocked);

        // Yashirin tabda bu sikl to'xtaydi: xona egasi uchun netTick davom ettiradi
        if (!isClient() && !(isHost() && document.hidden)) simulate(dt);

        for (const other of players) {
            if (other === me) continue;
            if (online && !(isHost() && other.isBot)) smoothRemotePlayer(other, dt);
            updatePlayerMesh(other);
        }

        // Update effects
        // Muzzle flash
        if (muzzleFlashTimer > 0) {
            muzzleFlashTimer--;
            muzzleFlashLight.intensity *= 0.6;
        } else {
            muzzleFlashLight.intensity = 0;
        }

        // Tracers
        for (let i = tracerLines.length - 1; i >= 0; i--) {
            tracerLines[i].life--;
            tracerLines[i].mesh.material.opacity -= 0.15;
            if (tracerLines[i].life <= 0) {
                scene.remove(tracerLines[i].mesh);
                tracerLines[i].mesh.geometry.dispose();
                tracerLines[i].mesh.material.dispose();
                tracerLines.splice(i, 1);
            }
        }

        // Particles
        for (let i = impactParticles.length - 1; i >= 0; i--) {
            const ip = impactParticles[i];
            ip.mesh.position.x += ip.vx;
            ip.mesh.position.y += ip.vy;
            ip.mesh.position.z += ip.vz;
            ip.vy -= 0.008;
            ip.life--;
            if (ip.life <= 0) {
                scene.remove(ip.mesh);
                ip.mesh.geometry.dispose();
                ip.mesh.material.dispose();
                impactParticles.splice(i, 1);
            }
        }

        renderer.render(scene, camera);
    }

    // === INIT ===
    function init() {
        setupInput();
        setupTeamPickers();
        setupOnline();

        document.getElementById('play-btn').addEventListener('click', startGame);
        document.getElementById('controls-btn').addEventListener('click', () => showScreen('controls'));
        document.getElementById('back-btn').addEventListener('click', () => showScreen('menu'));
        document.getElementById('restart-btn').addEventListener('click', () => {
            if (isHost()) hostReturnToLobby();
            else startGame();
        });
        document.getElementById('menu-btn').addEventListener('click', () => {
            if (online) {
                leaveOnline();
                showScreen('menu');
                return;
            }
            gameState = 'menu';
            document.exitPointerLock?.();
            clearInterval(roundTimerInterval);
            showScreen('menu');
        });

        // Start render loop (renders even in menu)
        gameLoop();
    }

    init();
})();
