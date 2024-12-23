const CONFIG = {
    canvas: {
        width: 800,
        height: 600
    },
    paddle: {
        width: 150,
        height: 10,
        speed: 6,
        color: '#4CAF50'
    },
    ball: {
        radius: 8,
        speed: {
            x: 3,
            y: -3
        },
        color: '#fff'
    },
    bricks: {
        rows: 5,
        cols: 8,
        padding: 10,
        width: 80,
        height: 20,
        colors: {
            breakable: '#ff4444',
            unbreakable: '#666666',
            multiHit: ['#ff0000', '#ff6600', '#ffcc00', '#ffff00']
        }
    },
    gifts: {
        width: 20,
        height: 20,
        speed: 2,
        dropChance: 0.2, // 20% chance for a brick to have a gift
        types: {
            points: {
                color: '#FFD700',
                value: 10,
                probability: 0.3  // 50% chance when a gift spawns
            },
            life: {
                color: '#FF69B4',
                value: 1,
                probability: 0.1  // 20% chance when a gift spawns
            },
            floor: {
                color: '#4169E1',
                duration: 10000,  // 10 seconds in milliseconds
                probability: 0.2  // 15% chance when a gift spawns
            },
            split: {
                color: '#32CD32',  // Lime green
                probability: 0.2  // 15% chance when a gift spawns
            },
            guns : {
                color: '#FFD700',
                duration: 10000, // 10 seconds
                probability: 0.2,
                shootDelay: 100 // Minimum time between shots in milliseconds
            }
        }
    }
};
