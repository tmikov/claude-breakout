class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.createSounds();
    }

    createSounds() {
        // Create simple programmatic sound effects using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
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

    playSound(soundName) {
        if (!this.enabled || !this.sounds[soundName]) {
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

    playBounce() {
        this.playSound('bounce');
    }

    playDestroy() {
        this.playSound('destroy');
    }

    playShoot() {
        this.playSound('shoot');
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Resume audio context if it's suspended (needed for user interaction)
    resumeAudioContext() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}