class Paddle extends GameObject3D {
    constructor() {
        const x = (CONFIG.canvas.width - CONFIG.paddle.width) / 2;
        const y = CONFIG.canvas.height - CONFIG.paddle.height - 10;
        super(x, y, CONFIG.paddle.width, CONFIG.paddle.height, 15, CONFIG.paddle.color);
        this.speed = CONFIG.paddle.speed;
        this.moving = {
            left: false,
            right: false
        };

        // Shooting properties
        this.canShoot = false;
        this.shootEndTime = 0;
        this.lastShotTime = 0;

        // Create gun meshes
        this.leftGun = this.createGun(-this.width/4);
        this.rightGun = this.createGun(this.width/4);
        this.updateGuns();
    }

    createGun(xOffset) {
        const gunGeometry = new THREE.BoxGeometry(6, 12, 6);
        const gunMaterial = new THREE.MeshPhongMaterial({
            color: '#FFD700',
            emissive: '#FFD700',
            emissiveIntensity: 0.3
        });
        const gun = new THREE.Mesh(gunGeometry, gunMaterial);
        gun.visible = false;
        this.mesh.add(gun);
        gun.position.set(xOffset, this.height/2, 0);
        return gun;
    }

    activateGuns(duration) {
        this.canShoot = true;
        this.shootEndTime = Date.now() + duration;
        this.leftGun.visible = true;
        this.rightGun.visible = true;
    }

    updateGuns() {
        // Check if shooting power-up has expired
        if (this.shootEndTime > 0 && Date.now() > this.shootEndTime) {
            this.canShoot = false;
            this.shootEndTime = 0;
            this.leftGun.visible = false;
            this.rightGun.visible = false;
        }
    }

    canShootNow() {
        return this.canShoot &&
            Date.now() - this.lastShotTime >= CONFIG.gifts.types.guns.shootDelay;
    }

    shoot(game) {
        if (!this.canShootNow()) return [];

        this.lastShotTime = Date.now();

        // Create two projectiles, one from each gun
        const leftProjectile = new Projectile(
            this.x + this.width/4,
            this.y
        );
        const rightProjectile = new Projectile(
            this.x + this.width*3/4,
            this.y
        );

        game.scene.add(leftProjectile.mesh);
        game.scene.add(rightProjectile.mesh);

        return [leftProjectile, rightProjectile];
    }

    move() {
        if (this.moving.left && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.moving.right && this.x < CONFIG.canvas.width - this.width) {
            this.x += this.speed;
        }
        this.updateMesh();
        this.updateGuns();
    }
}
