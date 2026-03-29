const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");
const scoreText = document.getElementById("score");

// Sounds
const crashSound = new Audio("sounds/crash.mp3");
const winSound = new Audio("sounds/win.mp3");

// Responsive canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Game variables
let player, vehicles, lanes;
let gameRunning = false;
let gameOver = false;
let score = 0;

// Init game
function initGame() {
  player = {
    x: 50,
    y: canvas.height - 80,
    size: 30,
    speed: 20
  };

  lanes = [
    canvas.height - 200,
    canvas.height - 300,
    canvas.height - 400
  ];

  vehicles = [];

  lanes.forEach((laneY, i) => {
    for (let j = 0; j < 3; j++) {
      vehicles.push({
        x: Math.random() * canvas.width,
        y: laneY,
        width: 60,
        height: 30,
        speed: (i % 2 === 0 ? 3 : -3) * (1 + Math.random())
      });
    }
  });

  score = 0;
  gameOver = false;
  message.innerText = "";
}

// Draw
function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function drawRoad() {
  ctx.fillStyle = "#444";
  lanes.forEach(y => {
    ctx.fillRect(0, y, canvas.width, 80);
  });

  ctx.fillStyle = "yellow";
  ctx.fillText("GATE", 20, canvas.height - 20);
  ctx.fillText("TEA STALL", 20, 50);
}

function drawVehicles() {
  ctx.fillStyle = "red";
  vehicles.forEach(v => {
    ctx.fillRect(v.x, v.y, v.width, v.height);
  });
}

// Update
function updateVehicles() {
  vehicles.forEach(v => {
    v.x += v.speed;

    if (v.speed > 0 && v.x > canvas.width) v.x = -60;
    if (v.speed < 0 && v.x < -60) v.x = canvas.width;
  });
}

// Collision
function checkCollision() {
  for (let v of vehicles) {
    if (
      player.x < v.x + v.width &&
      player.x + player.size > v.x &&
      player.y < v.y + v.height &&
      player.y + player.size > v.y
    ) {
      crashSound.play();
      message.innerText = "Go to popular hospital emergency 🚑";
      endGame();
    }
  }
}

// Win
function checkWin() {
  if (player.y < 80) {
    winSound.play();
    message.innerText = "Now enjoy cha biri ☕🚬";
    endGame();
  }
}

function endGame() {
  gameOver = true;
  gameRunning = false;
  restartBtn.style.display = "inline-block";
}

// Controls
document.addEventListener("keydown", e => {
  if (!gameRunning) return;

  if (e.key === "ArrowUp") player.y -= player.speed;
  if (e.key === "ArrowDown") player.y += player.speed;
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
});

// Touch
canvas.addEventListener("touchstart", e => {
  if (!gameRunning) return;

  const y = e.touches[0].clientY;
  if (y < canvas.height / 2) player.y -= player.speed;
  else player.y += player.speed;
});

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    score++;
    scoreText.innerText = "Score: " + score;

    drawRoad();
    drawPlayer();
    drawVehicles();

    updateVehicles();
    checkCollision();
    checkWin();
  }

  requestAnimationFrame(gameLoop);
}

// Buttons
startBtn.onclick = () => {
  initGame();
  gameRunning = true;
  startBtn.style.display = "none";
};

restartBtn.onclick = () => {
  initGame();
  gameRunning = true;
  restartBtn.style.display = "none";
};

// Start loop
ctx.fillStyle = "white";
ctx.font = "20px Arial";
gameLoop();