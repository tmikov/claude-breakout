class Game {
    constructor(canvasId) {
        this.floor = null;
        this.projectiles = [];
        this.setupThreeJs(canvasId);
        this.setupScene();
        this.particleSystem = new ParticleSystem(this.scene);
        this.ballTrailSystem = new BallTrailSystem(this.scene);
        this.setupUI();
        this.reset();
        this.setupEventListeners();
    }

    setupThreeJs(canvasId) {
        this.canvas = document.getElementById(canvasId);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(CONFIG.canvas.width, CONFIG.canvas.height);
        this.renderer.setClearColor(0x1a1a1a);
    }

    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();

        // Setup camera (Orthographic for 2D-style view)
        const aspectRatio = CONFIG.canvas.width / CONFIG.canvas.height;
        const viewSize = CONFIG.canvas.height;
        this.camera = new THREE.OrthographicCamera(
            -viewSize * aspectRatio / 2,
            viewSize * aspectRatio / 2,
            viewSize / 2,
            -viewSize / 2,
            1,
            1000
        );
        this.camera.position.z = 500;
        this.camera.lookAt(0, 0, 0);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(0, 0, 200);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.set(0, 0, 100);
        this.scene.add(pointLight);
    }
    setupUI() {
        // Get UI elements
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.ballsElement = document.getElementById('balls');
    }

    reset(levelReset) {
        if (this.floor) {
            this.scene.remove(this.floor);
            this.floor = null;
        }

        this.ballTrailSystem.clear();

        // Clear existing meshes from scene (except lights)
        this.scene.children
            .filter(child => child.type === 'Mesh')
            .forEach(mesh => this.scene.remove(mesh));

        this.paddle = new Paddle();
        this.balls = [new Ball()];
        this.bricks = [];
        this.gifts = [];
        this.projectiles = [];
        if (!levelReset) {
            this.score = 0;
            this.lives = 3;
            this.level = 1;
        }
        this.gameState = 'prepare';
        this.floorActive = false;
        this.floorEndTime = 0;

        // Add initial meshes to scene
        this.scene.add(this.paddle.mesh);
        this.balls.forEach(ball => this.scene.add(ball.mesh));

        this.createBricks();
        this.createWalls();
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.paddle.moving.left = true;
                break;
            case 'ArrowRight':
                this.paddle.moving.right = true;
                break;
            case ' ':
                if (this.gameState === 'prepare') {
                    this.gameState = 'playing';
                } else if (this.gameState === 'playing' && this.paddle.canShootNow()) {
                    // Add new projectiles when space is pressed
                    const newProjectiles = this.paddle.shoot(this);
                    this.projectiles.push(...newProjectiles);
                }
                break;
            case 'p':
                if (this.gameState === 'playing') {
                    this.gameState = 'paused';
                } else if (this.gameState === 'paused') {
                    this.gameState = 'playing';
                }
                break;
            case 'r':
                if (this.gameState === 'gameOver') {
                    this.reset();
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
                this.paddle.moving.left = false;
                break;
            case 'ArrowRight':
                this.paddle.moving.right = false;
                break;
        }
    }

    createWalls() {
        // Add walls
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            specular: 0x222222,
            shininess: 10
        });
        const wallThickness = 20;
        const wallHeight = 30;  // Make walls more visible

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, CONFIG.canvas.height, wallHeight),
            wallMaterial
        );
        leftWall.position.set(-CONFIG.canvas.width/2, 0, 0);
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, CONFIG.canvas.height, wallHeight),
            wallMaterial
        );
        rightWall.position.set(CONFIG.canvas.width/2, 0, 0);
        this.scene.add(rightWall);

        // Top wall
        const topWall = new THREE.Mesh(
            new THREE.BoxGeometry(CONFIG.canvas.width, wallThickness, wallHeight),
            wallMaterial
        );
        topWall.position.set(0, CONFIG.canvas.height/2, 0);
        this.scene.add(topWall);

        // const testWall = new THREE.Mesh(
        //     new THREE.BoxGeometry(CONFIG.canvas.width, 20, 30),
        //     wallMaterial
        // );
        // testWall.position.set(0, CONFIG.canvas.height/2, 0);
        // // testWall.position.set(0, CONFIG.canvas.height/2 - CONFIG.canvas.height, 0);
        // this.scene.add(testWall);
    }

    createBricks() {
        console.log('Starting createBricks');
        this.bricks = [];
        const brickConfig = CONFIG.bricks;
        const totalWidth = brickConfig.cols * (brickConfig.width + brickConfig.padding);
        const startX = (CONFIG.canvas.width - totalWidth) / 2;

        for (let row = 0; row < brickConfig.rows; row++) {
            for (let col = 0; col < brickConfig.cols; col++) {
                const x = startX + col * (brickConfig.width + brickConfig.padding);
                const y = row * (brickConfig.height + brickConfig.padding) + 50;

                let type = 'breakable';
                let hits = 1;

                if (Math.random() < 0.1) {
                    type = 'unbreakable';
                } else if (Math.random() < 0.2) {
                    type = 'multiHit';
                    hits = Math.floor(Math.random() * 3) + 2;
                }

                const brick = new Brick(x, y, type, hits);
                console.log('Created brick:', brick);
                console.log('Brick mesh:', brick.mesh);
                if (brick.mesh) {
                    this.scene.add(brick.mesh);
                    console.log('Added brick mesh to scene');
                }
                this.bricks.push(brick);
            }
        }
        console.log(`Created ${this.bricks.length} bricks`);
        console.log('Scene children:', this.scene.children);
    }

    splitBall(originalBall) {
        const angles = [-Math.PI/6, Math.PI/6];
        const speed = Math.sqrt(originalBall.dx * originalBall.dx + originalBall.dy * originalBall.dy);

        angles.forEach(angle => {
            const newBall = new Ball();
            newBall.x = originalBall.x;
            newBall.y = originalBall.y;
            newBall.dx = speed * Math.sin(angle);
            newBall.dy = -speed * Math.cos(angle);
            this.balls.push(newBall);
            this.scene.add(newBall.mesh);
        });
    }

    checkProjectileBrickCollision() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];

            for (let j = this.bricks.length - 1; j >= 0; j--) {
                const brick = this.bricks[j];

                if (projectile.x >= brick.x &&
                    projectile.x <= brick.x + brick.width &&
                    projectile.y >= brick.y &&
                    projectile.y <= brick.y + brick.height) {

                    // Remove projectile
                    this.scene.remove(projectile.mesh);
                    this.projectiles.splice(i, 1);

                    // Handle brick hit
                    if (brick.type !== 'unbreakable') {
                        if (brick.hit()) {
                            // Create explosion
                            const position = new THREE.Vector3(
                                brick.mesh.position.x,
                                brick.mesh.position.y,
                                brick.mesh.position.z
                            );
                            const color = brick.mesh.material.color;
                            this.particleSystem.createExplosion(position, color);

                            if (brick.type === 'multiHit') {
                                this.score += 5;
                            } else {
                                this.score++;
                            }

                            if (brick.giftType) {
                                const gift = new Gift(brick.x, brick.y, brick.giftType);
                                this.gifts.push(gift);
                                this.scene.add(gift.mesh);
                            }

                            this.scene.remove(brick.mesh);
                            this.bricks.splice(j, 1);
                        }
                    }
                    break;
                }
            }
        }
    }

    checkCollisions() {
        this.balls.forEach(ball => {
            this.checkBallPaddleCollision(ball);
            this.checkBallBrickCollision(ball);
        });
        this.checkGiftPaddleCollision();
        this.checkProjectileBrickCollision();
    }

    checkBallPaddleCollision(ball) {
        if (ball.y + ball.radius > this.paddle.y &&
            ball.y - ball.radius < this.paddle.y + this.paddle.height &&
            ball.x > this.paddle.x &&
            ball.x < this.paddle.x + this.paddle.width) {

            const hitPos = (ball.x - this.paddle.x) / this.paddle.width;
            const maxAngle = Math.PI / 3;
            const angle = (hitPos - 0.5) * maxAngle;
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

            ball.dx = speed * Math.sin(angle);
            ball.dy = -speed * Math.cos(angle);
        }
    }

    checkBallBrickCollision(ball) {
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (ball.x > brick.x &&
                ball.x < brick.x + brick.width &&
                ball.y > brick.y &&
                ball.y < brick.y + brick.height) {

                if (brick.type !== 'unbreakable') {
                    ball.dy = -ball.dy;

                    if (brick.hit()) {
                        // Create explosion at brick position
                        const position = new THREE.Vector3(
                            brick.mesh.position.x,
                            brick.mesh.position.y,
                            brick.mesh.position.z
                        );
                        const color = brick.mesh.material.color;
                        this.particleSystem.createExplosion(position, color);

                        if (brick.type === 'multiHit') {
                            this.score += 5;
                        } else {
                            this.score++;
                        }

                        if (brick.giftType) {
                            const gift = new Gift(brick.x, brick.y, brick.giftType);
                            this.gifts.push(gift);
                            this.scene.add(gift.mesh);
                        }

                        this.scene.remove(brick.mesh);
                        this.bricks.splice(i, 1);
                    }
                } else {
                    ball.dy = -ball.dy;
                }
            }
        }
    }

    checkGiftPaddleCollision() {
        for (let i = this.gifts.length - 1; i >= 0; i--) {
            const gift = this.gifts[i];
            if (gift.y + gift.height > this.paddle.y &&
                gift.x + gift.width > this.paddle.x &&
                gift.x < this.paddle.x + this.paddle.width) {

                if (gift.type === 'points') {
                    this.score += gift.value;
                } else if (gift.type === 'life') {
                    this.lives += gift.value;
                } else if (gift.type === 'floor') {
                    this.floorActive = true;
                    this.floorEndTime = Date.now() + CONFIG.gifts.types.floor.duration;
                } else if (gift.type === 'split' && this.balls.length > 0) {
                    const ballToSplit = this.balls[Math.floor(Math.random() * this.balls.length)];
                    this.splitBall(ballToSplit);
                } else if (gift.type === 'guns') {
                    this.paddle.activateGuns(CONFIG.gifts.types.guns.duration);
                }

                this.scene.remove(gift.mesh);
                this.gifts.splice(i, 1);
            } else if (gift.y > CONFIG.canvas.height) {
                this.scene.remove(gift.mesh);
                this.gifts.splice(i, 1);
            }
        }
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
        this.ballsElement.textContent = this.balls.length;
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.paddle.move();

        // Update and filter out lost balls
        this.balls = this.balls.filter(ball => {
            ball.move();

            if (ball.y + ball.radius > CONFIG.canvas.height) {
                if (this.floorActive) {
                    ball.dy = -Math.abs(ball.dy);
                    return true;
                }
                this.scene.remove(ball.mesh);
                return false;
            }
            return true;
        });

        // Check if all balls are lost
        if (this.balls.length === 0) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameState = 'gameOver';
            } else {
                const newBall = new Ball();
                this.balls = [newBall];
                this.scene.add(newBall.mesh);
                this.gameState = 'prepare';
            }
        }

        // Update bricks
        this.bricks.forEach(brick => brick.updateMesh());
        this.bricks.forEach(brick => {
            brick.updateGlow();
        });

        // Update gifts
        this.gifts.forEach(gift => gift.move());

        // Check level completion
        const remainingBreakableBricks = this.bricks.filter(brick => brick.type !== 'unbreakable').length;
        if (remainingBreakableBricks === 0) {
            this.level++;
            this.lives++;
            this.reset(true);
            this.gameState = 'prepare';
        }

        // Update floor status
        if (this.floorActive && Date.now() > this.floorEndTime) {
            this.floorActive = false;
        }
        // Update floor visualization if active
        if (this.floorActive) {
            if (!this.floor) {
                const floorMaterial = new THREE.MeshPhongMaterial({
                    color: CONFIG.gifts.types.floor.color,
                    specular: 0x222222,
                    shininess: 10
                });
                this.floor = new THREE.Mesh(
                    new THREE.BoxGeometry(CONFIG.canvas.width, 20, 30),
                    floorMaterial
                );
                this.floor.position.set(0, CONFIG.canvas.height/2 - CONFIG.canvas.height, 0);
                this.scene.add(this.floor);
            }
        } else if (this.floor) {
            this.scene.remove(this.floor);
            this.floor = null;
        }

        this.balls.forEach(ball => {
            if (!ball.game) {
                ball.game = this;  // Ensure each ball has a reference to the game
            }
        });

        this.projectiles = this.projectiles.filter(projectile => {
            const stillActive = projectile.move();
            if (!stillActive) {
                this.scene.remove(projectile.mesh);
                return false;
            }
            return true;
        });

        this.checkCollisions();
        this.updateUI();
        this.particleSystem.update();
    }

    showGameState() {
        // Remove any existing overlay messages
        this.scene.children
            .filter(child => child.userData.isOverlay)
            .forEach(overlay => this.scene.remove(overlay));

        if (this.gameState !== 'playing') {
            let messages = [];

            if (this.gameState === 'prepare') {
                messages.push(
                    [`Prepare for Level ${this.level}`, 50],
                    ['Press SPACE to start', -50]
                );
            } else if (this.gameState === 'paused') {
                messages.push(['PAUSED', 0]);
            } else if (this.gameState === 'gameOver') {
                messages.push(
                    ['GAME OVER', 50],
                    [`Final Score: ${this.score}`, 0],
                    ['Press R to restart', -50]
                );
            }

            messages.forEach(([text, y]) => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 128;
                const context = canvas.getContext('2d');

                context.fillStyle = '#000000';
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.font = '40px Arial';
                context.fillStyle = '#ffffff';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(text, canvas.width/2, canvas.height/2);

                const texture = new THREE.CanvasTexture(canvas);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.8
                });
                const geometry = new THREE.PlaneGeometry(400, 100);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.z = 100;
                mesh.position.y = y;
                mesh.userData.isOverlay = true;
                this.scene.add(mesh);
            });
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        this.update();
        this.showGameState();
        this.render();
    }
}
