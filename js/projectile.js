class Projectile extends GameObject3D {
    constructor(x, y) {
        super(x, y, 4, 10, 4, '#FFD700'); // Small yellow projectile
        this.speed = 8;

        // Override default material for a glowing effect
        this.mesh.material = new THREE.MeshPhongMaterial({
            color: '#FFD700',
            emissive: '#FFD700',
            emissiveIntensity: 0.5,
            shininess: 50
        });
    }

    move() {
        this.y -= this.speed; // Move upward
        this.updateMesh();
        return this.y > 0; // Return true if projectile is still on screen
    }
}
