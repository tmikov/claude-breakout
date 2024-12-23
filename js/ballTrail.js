class TrailParticle {
    constructor(position, color) {
        const geometry = new THREE.SphereGeometry(3, 8, 8);  // Smaller than the ball
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        // Trail particles don't move, they just fade out
        this.life = 1.0;
        this.decay = 0.03;  // Adjust for longer/shorter trails
        
        // Gradually shrink the particle
        this.initialScale = 1;
        this.mesh.scale.set(this.initialScale, this.initialScale, this.initialScale);
    }

    update() {
        // Update life and opacity
        this.life -= this.decay;
        this.mesh.material.opacity = this.life * 0.6;  // Keep maximum opacity at 0.6
        
        // Shrink the particle as it fades
        const scale = this.initialScale * (0.3 + this.life * 0.7);
        this.mesh.scale.set(scale, scale, scale);
        
        return this.life > 0;
    }
}

class BallTrailSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.spawnCounter = 0;
        this.spawnRate = 2;  // Spawn a particle every N frames
    }

    update(ballPosition) {
        // Create new trail particles
        this.spawnCounter++;
        if (this.spawnCounter >= this.spawnRate) {
            const position = new THREE.Vector3(
                ballPosition.x,
                ballPosition.y,
                ballPosition.z
            );
            
            // Create particle with a slightly randomized color
            const baseColor = new THREE.Color(CONFIG.ball.color);
            const particleColor = new THREE.Color().copy(baseColor);
            particleColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
            
            const particle = new TrailParticle(position, particleColor);
            this.particles.push(particle);
            this.scene.add(particle.mesh);
            
            this.spawnCounter = 0;
        }

        // Update existing particles and remove dead ones
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

    clear() {
        // Remove all particles (useful when resetting the game)
        this.particles.forEach(particle => {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        });
        this.particles = [];
    }
}