class Brick extends GameObject3D {
    constructor(x, y, type, hits = 1) {
        super(x, y, CONFIG.bricks.width, CONFIG.bricks.height, 20, CONFIG.bricks.colors.breakable);
        this.type = type;
        this.hits = hits;
        this.maxHits = hits;
        this.giftType = this.determineGiftType();

        // Glow effect properties
        this.isGlowing = false;
        this.glowIntensity = 0;
        // Different glow intensities based on brick type
        this.maxGlowIntensity = type === 'unbreakable' ? 2.0 : 1.0;
        this.glowDecay = type === 'unbreakable' ? 0.05 : 0.1; // Slower decay for unbreakable

        // Create emissive material for glow
        this.mesh.material = new THREE.MeshPhongMaterial({
            color: CONFIG.bricks.colors.breakable,
            specular: 0x444444,
            shininess: 30,
            emissive: new THREE.Color(1, 1, 1),
            emissiveIntensity: 0
        });

        this.updateColor();
    }

    updateColor() {
        let color, emissiveColor;
        if (this.type === 'unbreakable') {
            color = CONFIG.bricks.colors.unbreakable;
            // Cool blue-white glow for unbreakable bricks
            emissiveColor = new THREE.Color(0.5, 0.8, 1.0);
        } else if (this.type === 'multiHit') {
            const colorIndex = Math.min(this.hits - 1, CONFIG.bricks.colors.multiHit.length - 1);
            color = CONFIG.bricks.colors.multiHit[colorIndex];
            emissiveColor = new THREE.Color(color);
        } else {
            color = CONFIG.bricks.colors.breakable;
            emissiveColor = new THREE.Color(color);
        }

        this.mesh.material.color.setStyle(color);
        this.mesh.material.emissive.copy(emissiveColor);
    }

    hit() {
        // Always trigger glow effect on hit
        this.startGlow();

        if (this.type !== 'unbreakable') {
            this.hits--;
            this.updateColor();
            return this.hits <= 0;
        }
        return false;  // Unbreakable bricks never break
    }

    startGlow() {
        this.isGlowing = true;
        this.glowIntensity = this.maxGlowIntensity;

        // Add a slight scale animation for unbreakable bricks
        if (this.type === 'unbreakable') {
            this.mesh.scale.set(1.1, 1.1, 1.1);
        }
    }

    updateGlow() {
        if (this.isGlowing) {
            // Update glow intensity
            this.glowIntensity = Math.max(0, this.glowIntensity - this.glowDecay);
            this.mesh.material.emissiveIntensity = this.glowIntensity;

            // Update scale animation for unbreakable bricks
            if (this.type === 'unbreakable') {
                const scaleDown = 1 + (0.1 * (this.glowIntensity / this.maxGlowIntensity));
                this.mesh.scale.set(scaleDown, scaleDown, scaleDown);
            }

            // Stop glowing when intensity reaches 0
            if (this.glowIntensity === 0) {
                this.isGlowing = false;
                // Reset scale
                this.mesh.scale.set(1, 1, 1);
            }
        }
    }

    determineGiftType() {
        // First determine if this brick should have a gift at all
        if (Math.random() >= CONFIG.gifts.dropChance) {
            return null;
        }

        // Get all gift types and their probabilities
        const giftTypes = Object.entries(CONFIG.gifts.types);
        let cumulativeProbability = 0;

        // Find which gift type this random number corresponds to
        const rand = Math.random();
        for (const [type, config] of giftTypes) {
            cumulativeProbability += config.probability;
            if (rand < cumulativeProbability) {
                return type;
            }
        }

        return 'points'; // Fallback to points gift
    }

    updateColor() {
        if (this.type === 'unbreakable') {
            this.mesh.material.color.setStyle(CONFIG.bricks.colors.unbreakable);
        } else if (this.type === 'multiHit') {
            const colorIndex = Math.min(this.hits - 1, CONFIG.bricks.colors.multiHit.length - 1);
            this.mesh.material.color.setStyle(CONFIG.bricks.colors.multiHit[colorIndex]);
        } else {
            this.mesh.material.color.setStyle(CONFIG.bricks.colors.breakable);
        }
    }
}
