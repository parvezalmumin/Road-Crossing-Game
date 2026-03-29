const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const message = document.getElementById("message");
const scoreText = document.getElementById("score");
const titleContainer = document.getElementById("titleContainer");

// Sounds
const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;
const crashSound = new Audio("sounds/crash.mp3");
const winSound = new Audio("sounds/win.mp3");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let player, vehicles = [], lanes = [];
let gameRunning = false;
let score = 0;

function initGame() {
  const centerY = canvas.height / 2;
  titleContainer.classList.add("corner-title"); // Move title to corner

  // Road lanes (wider roads to allow overtaking)
  lanes = [
    { y: centerY + 140, direction: "left", speed: -7 },
    { y: centerY, direction: "both", speed: 8 },
    { y: centerY - 140, direction: "right", speed: 6 }
  ];

  player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 80,
    width: 25,
    height: 35,
    speed: 25,
    lastLaneIdx: -1
  };

  vehicles = [];
  lanes.forEach((lane, idx) => {
    const count = 4; 
    for (let i = 0; i < count; i++) {
      let vSpeed = lane.speed * (0.8 + Math.random() * 0.5); // Randomized speeds for overtaking
      if (lane.direction === "both") vSpeed = (i % 2 === 0) ? Math.abs(vSpeed) : -Math.abs(vSpeed);
      
      const isBike = Math.random() > 0.6;
      vehicles.push({
        x: Math.random() * canvas.width,
        y: lane.y + (i * 15 % 40), // UNIQUE OFFSET: Keeps them from overlapping
        width: isBike ? 35 : 80,
        height: isBike ? 20 : 35,
        speed: vSpeed,
        type: isBike ? 'bike' : 'car',
        color: isBike ? '#00ffff' : `hsl(${Math.random() * 360}, 70%, 50%)`
      });
    }
  });

  score = 0;
  scoreText.innerText = "Score: 0";
  message.innerText = "";
  gameRunning = true;
}

function drawBike(v) {
  ctx.fillStyle = v.color;
  ctx.fillRect(v.x, v.y + 5, v.width, 8); // Frame
  ctx.fillStyle = "black";
  ctx.beginPath(); // Wheels
  ctx.arc(v.x + 8, v.y + 15, 6, 0, Math.PI * 2); ctx.fill();
  ctx.arc(v.x + v.width - 8, v.y + 15, 6, 0, Math.PI * 2); ctx.fill();
}

function drawCar(v) {
  ctx.fillStyle = v.color;
  ctx.fillRect(v.x, v.y, v.width, v.height);
  ctx.fillStyle = "black"; // Tires
  ctx.fillRect(v.x + 5, v.y - 3, 15, 5); ctx.fillRect(v.x + v.width - 20, v.y - 3, 15, 5);
  ctx.fillRect(v.x + 5, v.y + v.height - 2, 15, 5); ctx.fillRect(v.x + v.width - 20, v.y + v.height - 2, 15, 5);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    // Road logic
    lanes.forEach(lane => {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, lane.y - 10, canvas.width, 70); // Wider road
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.setLineDash([20, 20]);
      ctx.beginPath(); ctx.moveTo(0, lane.y + 25); ctx.lineTo(canvas.width, lane.y + 25); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Gate & Tea Stall
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(canvas.width/2 - 60, canvas.height - 40, 120, 15);
    ctx.fillStyle = "#4a2c2c";
    ctx.fillRect(canvas.width/2 - 50, 20, 100, 60);
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(canvas.width/2 - 55, 15, 110, 12);
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText("GATE", canvas.width/2 - 20, canvas.height - 15);
    ctx.fillText("TEA STALL ☕", canvas.width/2 - 45, 55);

    // Player
    ctx.fillStyle = "#ffdbac"; ctx.fillRect(player.x + 5, player.y, 15, 10);
    ctx.fillStyle = "#3366ff"; ctx.fillRect(player.x, player.y + 10, 25, 20);
    ctx.fillStyle = "#000"; ctx.fillRect(player.x, player.y + 30, 8, 10); ctx.fillRect(player.x + 17, player.y + 30, 8, 10);

    // Vehicles
    vehicles.forEach(v => {
      v.x += v.speed;
      if (v.x > canvas.width + 100) v.x = -100;
      if (v.x < -100) v.x = canvas.width + 100;

      if (v.type === 'bike') drawBike(v);
      else drawCar(v);

      // Collision
      if (player.x < v.x + v.width && player.x + player.width > v.x &&
          player.y < v.y + v.height && player.y + player.height > v.y) {
        gameRunning = false;
        crashSound.play();
        message.innerText = "Go to popular hospital emergency 🚑";
        restartBtn.style.display = "inline-block";
      }
    });

    // Score & Win
    lanes.forEach((lane, idx) => {
      if (player.y < lane.y && player.lastLaneIdx < idx) {
        score += 10; player.lastLaneIdx = idx; scoreText.innerText = "Score: " + score;
      }
    });
    if (player.y < 80) {
      gameRunning = false; winSound.play();
      message.innerText = "Now enjoy cha biri ☕🚬";
      restartBtn.style.display = "inline-block";
    }
  }

  requestAnimationFrame(draw);
}

// Keyboard controls
window.addEventListener("keydown", (e) => {
  if (!gameRunning) return;
  if (e.key === "ArrowUp") player.y -= player.speed;
  if (e.key === "ArrowDown") player.y += player.speed;
  if (e.key === "ArrowLeft") player.x -= player.speed;
  if (e.key === "ArrowRight") player.x += player.speed;
});

startBtn.onclick = () => {
  startBtn.style.display = "none";
  bgMusic.play().catch(() => {});
  initGame();
};

restartBtn.onclick = () => {
  restartBtn.style.display = "none";
  initGame();
};

draw();