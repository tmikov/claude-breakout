// Initialize the game when the window loads
window.addEventListener('load', () => {
    const game = new Game('gameCanvas');
    game.gameLoop();
});