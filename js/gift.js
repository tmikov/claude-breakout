class Gift extends GameObject3D {
    constructor(x, y, type) {
        const config = CONFIG.gifts.types[type];
        super(x, y, CONFIG.gifts.width, CONFIG.gifts.height, CONFIG.gifts.width, config.color);
        this.type = type;
        this.value = config.value || 0;
        this.speed = CONFIG.gifts.speed;
        this.angle = (Math.random() - 0.5) * Math.PI / 4; // Random angle between -45° and 45°
    }

    move() {
        this.x += Math.sin(this.angle) * this.speed;
        this.y += Math.cos(this.angle) * this.speed;
        this.updateMesh();
        
        // Add a slight rotation for visual interest
        this.mesh.rotation.y += 0.05;
        this.mesh.rotation.x += 0.05;
    }
}