class GameObject3D {
    constructor(x, y, width, height, depth, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.depth = depth || 10; // Default depth for 2.5D look
        this.color = color;
        this.mesh = this.createMesh();
        this.updatePosition();
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: this.color,
            specular: 0x444444,
            shininess: 30
        });
        return new THREE.Mesh(geometry, material);
    }

    updatePosition() {
        // Convert from 2D canvas coordinates to Three.js coordinates
        // In Three.js, (0,0) is the center, +Y is up
        this.mesh.position.x = this.x - CONFIG.canvas.width/2 + this.width/2;
        this.mesh.position.y = -this.y + CONFIG.canvas.height/2 - this.height/2;
        this.mesh.position.z = 0;
    }

    // This replaces the Canvas draw method
    updateMesh() {
        this.updatePosition();
    }
}