/**
 * SoundManager - Handles all sound effects for the breakout game
 * Uses Web Audio API to generate programmatic sound effects
 */
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.createSounds();
    }

    /**
     * Initialize Web Audio Context and create sound buffers
     */
    createSounds() {
        // Create simple programmatic sound effects using Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported, sounds will be disabled:', error);
            this.enabled = false;
            return;
        }
        
        // Pre-generate sound buffers for better performance
        this.sounds = {
            bounce: this.createBounceSound(),
            destroy: this.createDestroySound(),
            shoot: this.createShootSound()
        };
    }

    createBounceSound() {
        // Create a short "ping" sound for bounces
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const frequency = 800 + Math.sin(time * 20) * 200; // Frequency modulation
            const amplitude = Math.exp(-time * 15); // Exponential decay
            channelData[i] = Math.sin(frequency * 2 * Math.PI * time) * amplitude * 0.3;
        }
        
        return buffer;
    }

    createDestroySound() {
        // Create an explosion-like sound for block destruction
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const noise = (Math.random() - 0.5) * 2; // White noise
            const frequency = 300 - time * 200; // Falling frequency
            const tone = Math.sin(frequency * 2 * Math.PI * time);
            const amplitude = Math.exp(-time * 5); // Exponential decay
            channelData[i] = (noise * 0.3 + tone * 0.7) * amplitude * 0.4;
        }
        
        return buffer;
    }

    createShootSound() {
        // Create a laser-like sound for shooting
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
            const time = i / sampleRate;
            const frequency = 400 + time * 600; // Rising frequency
            const amplitude = Math.exp(-time * 8); // Exponential decay
            channelData[i] = Math.sin(frequency * 2 * Math.PI * time) * amplitude * 0.3;
        }
        
        return buffer;
    }

    /**
     * Play a specific sound effect
     * @param {string} soundName - Name of the sound to play ('bounce', 'destroy', 'shoot')
     */
    playSound(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) {
            return;
        }

        try {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.sounds[soundName];
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start();
        } catch (error) {
            console.warn('Could not play sound:', soundName, error);
        }
    }

    /**
     * Play bounce sound effect (for ball hitting walls, paddle, or unbreakable bricks)
     */
    playBounce() {
        this.playSound('bounce');
    }

    /**
     * Play destruction sound effect (for breaking blocks)
     */
    playDestroy() {
        this.playSound('destroy');
    }

    /**
     * Play shooting sound effect (for firing projectiles)
     */
    playShoot() {
        this.playSound('shoot');
    }

    /**
     * Set the volume level for all sounds
     * @param {number} volume - Volume level between 0.0 and 1.0
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Enable or disable sound effects
     * @param {boolean} enabled - Whether sounds should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Resume audio context if it's suspended (needed for user interaction)
     * Must be called after user interaction due to browser autoplay policies
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}