class Particle {
    constructor(position, color) {
        // Increase particle size
        const geometry = new THREE.BoxGeometry(4, 4, 4);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            emissive: color,  // Make particles glow
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        // Increase velocity range for more dramatic movement
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 8,  // Doubled velocity
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        
        // Increase rotation speed
        this.rotation = new THREE.Vector3(
            Math.random() * 0.2,
            Math.random() * 0.2,
            Math.random() * 0.2
        );
        
        this.life = 1.0;
        // Decrease decay rate for longer-lasting particles
        this.decay = 0.01 + Math.random() * 0.01;  // Halved decay rate
    }

    update() {
        // Update position
        this.mesh.position.add(this.velocity);
        
        // Reduce gravity effect for more floating particles
        this.velocity.y -= 0.05;  // Halved gravity
        
        // Update rotation
        this.mesh.rotation.x += this.rotation.x;
        this.mesh.rotation.y += this.rotation.y;
        this.mesh.rotation.z += this.rotation.z;
        
        // Reduce slowdown for longer particle travel
        this.velocity.multiplyScalar(0.98);  // Less drag
        
        // Update life and opacity
        this.life -= this.decay;
        this.mesh.material.opacity = this.life;
        
        return this.life > 0;
    }
}

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    createExplosion(position, color, count = 40) {  // Doubled particle count
        const baseColor = new THREE.Color(color);
        
        for (let i = 0; i < count; i++) {
            // Vary the color slightly for each particle
            const particleColor = new THREE.Color().copy(baseColor);
            particleColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
            
            const particle = new Particle(position, particleColor);
            this.particles.push(particle);
            this.scene.add(particle.mesh);
        }
    }

    update() {
        // Update all particles and remove dead ones
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const isAlive = particle.update();
            
            if (!isAlive) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                particle.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }
    }
}