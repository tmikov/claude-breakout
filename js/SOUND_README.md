# Breakout Game Sound Effects

This directory contains the sound system for the breakout game.

## Sound Manager

The `soundManager.js` file implements a Web Audio API-based sound system that generates programmatic sound effects:

### Sound Effects

- **Bounce Sound**: Played when the ball bounces off walls, paddle, or unbreakable bricks
- **Destroy Sound**: Played when blocks are destroyed by ball or projectiles  
- **Shoot Sound**: Played when the paddle fires projectiles

### Usage

The sound manager is automatically initialized in the game constructor and triggered at appropriate collision points:

```javascript
// Initialize sound manager
this.soundManager = new SoundManager();

// Play sounds during gameplay
this.soundManager.playBounce();   // Ball bounces
this.soundManager.playDestroy();  // Block destroyed
this.soundManager.playShoot();    // Projectile fired
```

### Browser Compatibility

The sound system uses the Web Audio API and gracefully degrades if not supported. Audio context is automatically resumed on first user interaction to comply with browser autoplay policies.

**GitHub Pages Compatibility**: The sound manager includes robust handling for strict browser autoplay policies encountered on HTTPS hosting (like GitHub Pages). It automatically detects and handles suspended audio contexts through multiple user interaction types (click, keydown, touchstart, pointerdown).

### Configuration

Sound settings can be configured in `config.js`:

```javascript
sound: {
    enabled: true,
    volume: 0.5
}
```