class Ball {
    constructor() {
        this.radius = CONFIG.ball.radius;
        this.color = CONFIG.ball.color;
        this.reset();
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: 0x777777,
            shininess: 40
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.updateMeshPosition();
    }

    reset() {
        this.x = CONFIG.canvas.width / 2;
        this.y = CONFIG.canvas.height - 30;
        this.dx = CONFIG.ball.speed.x;
        this.dy = CONFIG.ball.speed.y;
        if (this.mesh) {
            this.updateMeshPosition();
        }
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // Wall collisions
        if (this.x + this.radius > CONFIG.canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.updateMeshPosition();

        // Add rotation for visual effect
        this.mesh.rotation.x += 0.1;
        this.mesh.rotation.z += 0.1;

        // In the Ball class's move method, after updating the mesh position:
        if (this.game && this.game.ballTrailSystem) {  // Add game reference to ball
            this.game.ballTrailSystem.update(this.mesh.position);
        }
    }

    updateMeshPosition() {
        this.mesh.position.x = this.x - CONFIG.canvas.width/2;
        this.mesh.position.y = -this.y + CONFIG.canvas.height/2;
        this.mesh.position.z = 0;
    }
}
