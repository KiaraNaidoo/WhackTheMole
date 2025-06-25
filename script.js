const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const levelDisplay = document.getElementById('level');
const finalScreen = document.getElementById('final-screen');
const finalScoreDisplay = document.getElementById('final-score');
const finalScoreEnd = document.getElementById('final-score-end');
const playAgainBtn = document.getElementById('play-again-btn');
const roundOverScreen = document.getElementById('round-over-screen');
const roundNumSpan = document.getElementById('round-num');
const roundScoreSpan = document.getElementById('round-score');
const nextRoundBtn = document.getElementById('next-round-btn');
const nextRoundNumSpan = document.getElementById('next-round-num');
const scoreList = document.getElementById('score-list');
const totalScoreBox = document.getElementById('total-score-box');
const mainTitle = document.getElementById('main-title');
const scoreboard = document.getElementById('scoreboard');
const sidebarTitle = document.getElementById('sidebar-title');
const roundOverTitle = document.getElementById('round-over-title');
const finalTitle = document.getElementById('final-title');
const modeSelectScreen = document.getElementById('mode-select-screen');
const modeButtons = document.querySelectorAll('.mode-btn');

const MODES = {
  easy: { label: "Easy", size: 3, class: "easy" },
  medium: { label: "Medium", size: 5, class: "medium" },
  hard: { label: "Difficult", size: 7, class: "hard" }
};

const LEVELS = [
  {
    color: 'level-1',
    speed: 900,
    duration: 20,
    mole: '🐹', // Brown hamster
    main: '#795548',
    sub: '#fbeec1'
  },
  {
    color: 'level-2',
    speed: 800,
    duration: 20,
    mole: '🐸', // Green frog
    main: '#1976D2',
    sub: '#bbdefb'
  },
  {
    color: 'level-3',
    speed: 750,
    duration: 20,
    mole: '🐢', // Green turtle
    main: '#388E3C',
    sub: '#c8e6c9'
  },
  {
    color: 'level-4',
    speed: 550,
    duration: 20,
    mole: '🐥', // Yellow chick
    main: '#FBC02D',
    sub: '#fff9c4'
  },
  {
    color: 'level-5',
    speed: 450,
    duration: 20,
    mole: '🐙', // Red octopus
    main: '#B71C1C',
    sub: '#ffcdd2'
  }
];

let score = 0;
let totalScore = 0;
let timeLeft = 20;
let moleTimer;
let countdownTimer;
let gameActive = false;
let currentLevel = 0;
let roundScores = [];
let mode = "easy";
let gridSize = 3;
let lastMole = null;

function createHoles() {
  board.innerHTML = '';
  board.className = `game-board ${MODES[mode].class}`;
  const total = gridSize * gridSize;
  for (let i = 0; i < total; i++) {
    const hole = document.createElement('div');
    hole.classList.add('hole');
    hole.dataset.index = i;
    board.appendChild(hole);
  }
}

function randomHole() {
  const holes = document.querySelectorAll('.hole');
  let idx;
  do {
    idx = Math.floor(Math.random() * holes.length);
  } while (idx === lastMole && holes.length > 1);
  lastMole = idx;
  return holes[idx];
}

function getCurrentSpeed() {
  if (mode === "easy") {
    return LEVELS[currentLevel].speed;
  } else if (mode === "medium") {
    // Each level: subtract 50ms from base speed (min 100ms)
    return Math.max(LEVELS[currentLevel].speed - 50 * currentLevel, 100);
  } else if (mode === "hard") {
    // Each level: subtract 100ms from base speed (min 50ms)
    return Math.max(LEVELS[currentLevel].speed - 100 * currentLevel, 50);
  } else {
    return LEVELS[currentLevel].speed;
  }
}

function showMole() {
  const holes = document.querySelectorAll('.hole');
  holes.forEach(hole => hole.innerHTML = '');

  const moleHole = randomHole();
  const mole = document.createElement('div');
  mole.classList.add('mole');
  mole.textContent = LEVELS[currentLevel].mole;
  moleHole.appendChild(mole);

  mole.addEventListener('click', whackMole, { once: true });
}

function whackMole() {
  if (!gameActive) return;
  score++;
  scoreDisplay.textContent = score;
  showMole();
}

function startMole() {
  showMole();
  clearInterval(moleTimer);
  moleTimer = setInterval(showMole, getCurrentSpeed());
}

function startCountdown() {
  timeLeft = LEVELS[currentLevel].duration;
  timeDisplay.textContent = timeLeft;
  countdownTimer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      roundOver();
    }
  }, 1000);
}

function startGame() {
  if (gameActive) return;
  roundScores = [];
  updateScoreList();
  totalScoreBox.classList.add('hidden');
  currentLevel = 0;
  totalScore = 0;
  hideFinalScreen();
  hideRoundOverScreen();
  setupRound();
}

function setupRound() {
  gameActive = true;
  score = 0;
  scoreDisplay.textContent = score;
  levelDisplay.textContent = currentLevel + 1;
  document.body.className = LEVELS[currentLevel].color;

  // Update theme for all major elements
  mainTitle.style.color = LEVELS[currentLevel].main;
  scoreboard.style.color = LEVELS[currentLevel].main;
  sidebarTitle.style.color = LEVELS[currentLevel].main;
  roundOverTitle.style.color = LEVELS[currentLevel].main;
  finalTitle.style.color = LEVELS[currentLevel].main;

  createHoles();
  board.classList.remove('hidden');
  startMole();
  startCountdown();
}

function roundOver() {
  clearInterval(moleTimer);
  clearInterval(countdownTimer);
  gameActive = false;
  document.querySelectorAll('.hole').forEach(hole => hole.innerHTML = '');
  roundScores[currentLevel] = score;
  totalScore = roundScores.reduce((a, b) => a + b, 0);
  updateScoreList();
  showRoundOverScreen();
}

function showRoundOverScreen() {
  board.classList.add('hidden');
  roundOverScreen.classList.remove('hidden');
  roundNumSpan.textContent = currentLevel + 1;
  roundScoreSpan.textContent = score;
  if (currentLevel + 1 < LEVELS.length) {
    nextRoundBtn.classList.remove('hidden');
    nextRoundNumSpan.textContent = currentLevel + 2;
  } else {
    nextRoundBtn.classList.add('hidden');
  }
  startBtn.classList.add('hidden');
  document.querySelector('.scoreboard').classList.add('hidden');
}

function hideRoundOverScreen() {
  roundOverScreen.classList.add('hidden');
  board.classList.remove('hidden');
  document.querySelector('.scoreboard').classList.remove('hidden');
}

function nextRound() {
  hideRoundOverScreen();
  currentLevel++;
  if (currentLevel < LEVELS.length) {
    setupRound();
  } else {
    endGame();
  }
}

function endGame() {
  clearInterval(moleTimer);
  clearInterval(countdownTimer);
  gameActive = false;
  startBtn.disabled = false;
  document.querySelectorAll('.hole').forEach(hole => hole.innerHTML = '');
  document.body.className = '';
  showFinalScreen();
}

function showFinalScreen() {
  // Always sum all rounds for the total score
  totalScore = roundScores.reduce((a, b) => a + b, 0);
  finalScoreEnd.textContent = totalScore;
  finalScoreDisplay.textContent = totalScore;
  finalScreen.classList.remove('hidden');
  board.classList.add('hidden');
  startBtn.classList.add('hidden');
  document.querySelector('.scoreboard').classList.add('hidden');
  totalScoreBox.classList.remove('hidden');
}
function hideFinalScreen() {
  finalScreen.classList.add('hidden');
  board.classList.remove('hidden');
  startBtn.classList.remove('hidden');
  document.querySelector('.scoreboard').classList.remove('hidden');
}

function updateScoreList() {
  scoreList.innerHTML = '';
  for (let i = 0; i < roundScores.length; i++) {
    const li = document.createElement('li');
    li.textContent = `Round ${i + 1}: ${roundScores[i]}`;
    scoreList.appendChild(li);
  }
}

// Mode selector logic
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    gridSize = MODES[mode].size;
    modeSelectScreen.classList.add('hidden');
    board.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    document.querySelector('.scoreboard').classList.remove('hidden');
    createHoles();
  });
});

startBtn.addEventListener('click', () => {
  startBtn.disabled = true;
  startGame();
});
nextRoundBtn.addEventListener('click', () => {
  nextRound();
});
playAgainBtn.addEventListener('click', () => {
  // Return to mode select screen for replay
  finalScreen.classList.add('hidden');
  board.classList.add('hidden');
  modeSelectScreen.classList.remove('hidden');
  startBtn.classList.add('hidden');
  document.querySelector('.scoreboard').classList.remove('hidden');
});

// Initial state: hide board, scoreboard, and start btn until mode is chosen
createHoles();
board.classList.add('hidden');
startBtn.classList.add('hidden');
document.querySelector('.scoreboard').classList.add('hidden');