// breakout.js

// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Define game variables
const paddle = {
  x: canvas.width / 2 - 75,
  y: canvas.height - 20,
  width: 150,
  height: 10,
  color: "#fff",
  dx: 0, // Paddle movement delta
  speed: 6, // Paddle speed
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  dx: 3, // Ball's horizontal velocity
  dy: -3, // Ball's vertical velocity
  color: "#ff0000",
};

const bricks = {
  rows: 5,
  columns: 8,
  width: 80,
  height: 20,
  padding: 10,
  offsetTop: 50,
  offsetLeft: 35,
  data: [],
};

let gifts = [];
let score = 0;
let level = 1;
const maxLevels = 3;
let gamePaused = true;
let pauseKeyEnabled = false;
let lives = 3; // Player starts with 3 lives

// Initialize bricks data
function initializeBricks() {
  bricks.data = [];
  for (let r = 0; r < bricks.rows; r++) {
    bricks.data[r] = [];
    for (let c = 0; c < bricks.columns; c++) {
      const type = Math.random() < 0.2 ? "unbreakable" : Math.random() < 0.5 ? "multi" : "breakable";
      const hits = type === "multi" ? Math.floor(Math.random() * 3) + 2 : 1; // Multi-hit bricks require 2-4 hits
      const dropsGift = Math.random() < 0.2; // 20% chance of dropping a gift
      bricks.data[r][c] = {
        x: 0,
        y: 0,
        type: type,
        hits: hits,
        visible: true,
        dropsGift: dropsGift,
      };
    }
  }
}

initializeBricks();

// Clear the canvas
function clearCanvas() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw the paddle
function drawPaddle() {
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw the ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

// Draw the bricks
function drawBricks() {
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.columns; c++) {
      const brick = bricks.data[r][c];
      if (brick.visible) {
        const brickX = bricks.offsetLeft + c * (bricks.width + bricks.padding);
        const brickY = bricks.offsetTop + r * (bricks.height + bricks.padding);
        brick.x = brickX;
        brick.y = brickY;

        switch (brick.type) {
          case "unbreakable":
            ctx.fillStyle = "#666"; // Gray for unbreakable bricks
            break;
          case "multi":
            ctx.fillStyle = `rgb(${255 - brick.hits * 50}, ${50 + brick.hits * 50}, 50)`; // Color changes with hits
            break;
          default:
            ctx.fillStyle = "#00ff00"; // Green for regular breakable bricks
            break;
        }
        ctx.fillRect(brickX, brickY, bricks.width, bricks.height);
      }
    }
  }
}

// Draw gifts
function drawGifts() {
  for (let gift of gifts) {
    ctx.beginPath();
    ctx.arc(gift.x, gift.y, gift.radius, 0, Math.PI * 2);
    ctx.fillStyle = gift.type === "points" ? "gold" : "blue";
    ctx.fill();
    ctx.closePath();
  }
}

// Update gifts
function updateGifts() {
  for (let i = gifts.length - 1; i >= 0; i--) {
    const gift = gifts[i];
    gift.y += gift.dy;

    // Check for collision with the paddle
    if (
      gift.y + gift.radius > paddle.y &&
      gift.x > paddle.x &&
      gift.x < paddle.x + paddle.width
    ) {
      // Consume the gift
      if (gift.type === "points") {
        score += 10;
      } else if (gift.type === "life") {
        lives++;
      }
      gifts.splice(i, 1);
    } else if (gift.y > canvas.height) {
      // Remove the gift if it falls off the screen
      gifts.splice(i, 1);
    }
  }
}

// Overlay text on top of the game
function drawOverlayText(text1, text2) {
  ctx.font = "20px Arial";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.textAlign = "center";
  ctx.fillText(text1, canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(text2, canvas.width / 2, canvas.height / 2 + 20);
}

// Draw the level start screen
function drawLevelStart() {
  drawOverlayText(`Prepare for Level ${level}`, "Press SPACE to Start");
}

// Draw the pause screen
function drawPauseScreen() {
  drawOverlayText("Game Paused", "Press P to Resume");
}

// Draw the game over screen
function drawGameOver() {
  drawOverlayText("Game Over", "Press R to Restart");
}

// Update the ball's position and handle collisions
function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle collision
  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    // Calculate the relative position of the ball on the paddle
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const maxBounceAngle = Math.PI / 3; // 60 degrees
    const bounceAngle = hitPosition * maxBounceAngle;

    // Update ball velocity based on bounce angle
    ball.dx = speed * Math.sin(bounceAngle);
    ball.dy = -speed * Math.cos(bounceAngle);
  }

  // Bottom wall (lose a life)
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    if (lives > 0) {
      resetBallAndPaddle();
      gamePaused = true;
    } else {
      gamePaused = true;
    }
  }
}

// Reset ball and paddle position
function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 3;
  ball.dy = -3;
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

// Update the paddle position
function updatePaddle() {
  paddle.x += paddle.dx;

  // Prevent the paddle from going out of bounds
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

// Handle brick collisions
function handleBrickCollisions() {
  for (let r = 0; r < bricks.rows; r++) {
    for (let c = 0; c < bricks.columns; c++) {
      const brick = bricks.data[r][c];
      if (brick.visible) {
        if (
          ball.x > brick.x &&
          ball.x < brick.x + bricks.width &&
          ball.y > brick.y &&
          ball.y < brick.y + bricks.height
        ) {
          ball.dy *= -1;
          if (brick.type === "unbreakable") {
            // Do nothing for unbreakable bricks
            return;
          } else if (brick.type === "multi") {
            brick.hits -= 1;
            if (brick.hits <= 0) {
              brick.visible = false;
              score += 5; // Multi-hit bricks give extra points

              // Drop gift if applicable
              if (brick.dropsGift) {
                const giftType = Math.random() < 0.5 ? "points" : "life";
                gifts.push({
                  x: brick.x + bricks.width / 2,
                  y: brick.y,
                  radius: 10,
                  dy: 2,
                  type: giftType,
                });
              }
            }
          } else {
            brick.visible = false;
            score += 1; // Regular bricks give 1 point

            // Drop gift if applicable
            if (brick.dropsGift) {
              const giftType = Math.random() < 0.5 ? "points" : "life";
              gifts.push({
                x: brick.x + bricks.width / 2,
                y: brick.y,
                radius: 10,
                dy: 2,
                type: giftType,
              });
            }
          }

          // Check if all bricks are destroyed
          if (
            bricks.data.flat().filter((b) => b.type !== "unbreakable" && b.visible).length === 0
          ) {
            if (level < maxLevels) {
              level++;
              lives++; // Gain a life for progressing to the next level
              resetBallAndPaddle();
              initializeBricks();
              gamePaused = true;
            } else {
              console.log("You win! Congratulations!");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

// Draw score, level, and lives
function drawScoreAndLevel() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Score: ${score}`, 8, 20);
  ctx.fillText(`Level: ${level}`, canvas.width - 100, 20);
  ctx.fillText(`Lives: ${lives}`, canvas.width / 2 - 30, 20);
}

// Draw the game elements and update their positions
function draw() {
  clearCanvas();
  drawPaddle();
  drawBall();
  drawBricks();
  drawGifts();
  drawScoreAndLevel();

  if (gamePaused) {
    if (lives <= 0) {
      drawGameOver();
    } else if (pauseKeyEnabled) {
      drawPauseScreen();
    } else {
      drawLevelStart();
    }
  }
}

function update() {
  if (!gamePaused) {
    updateBall();
    updatePaddle();
    updateGifts();
    handleBrickCollisions();
  }
}

// Main game loop
function gameLoop() {
  draw();
  update();
  requestAnimationFrame(gameLoop);
}

// Keyboard event listeners
function keyDownHandler(e) {
  if (e.key === "ArrowRight") paddle.dx = paddle.speed;
  if (e.key === "ArrowLeft") paddle.dx = -paddle.speed;
  if (e.key === " " && gamePaused && !pauseKeyEnabled) {
    gamePaused = false;
  } else if (e.key === "p" || e.key === "P") {
    gamePaused = !gamePaused;
    pauseKeyEnabled = gamePaused;
  } else if (e.key === "r" || e.key === "R") {
    if (lives <= 0) {
      resetGame();
    }
  }
}

function keyUpHandler(e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") paddle.dx = 0;
}

// Reset the game
function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  initializeBricks();
  resetBallAndPaddle();
  gifts = []; // Clear any active gifts
  gamePaused = true;
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Start the game
gameLoop();
