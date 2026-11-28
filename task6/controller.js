import { createModel } from './model.js';
import { createView } from './view.js';

/**
 * Настройки игры — единственное место, куда смотрит заказчик.
 * Меняем fruit.growth — змейка растёт быстрее.
 */
const config = {
  cols: 20,
  rows: 20,
  cellSize: 20,

  moveInterval: 300,
  maxFrameDelta: 350,
  initialLength: 3,

  fruit: { score: 1, growth: 1 },

  colors: {
    board: '#11161d',
    grid: '#1b232d',
    snakeHead: '#7ef29d',
    snakeBody: '#3fbf6f',
    fruit: '#ff5c5c',
  },
};

const KEY_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export function createController() {
  const canvasEl = document.querySelector('#game');
  const scoreEl = document.querySelector('#score');
  const overlayEl = document.querySelector('#overlay');
  const finalScoreEl = document.querySelector('#final-score');
  const restartEl = document.querySelector('#restart');

  const model = createModel(config);
  const view = createView(canvasEl, { scoreEl, overlayEl, finalScoreEl }, config);

  let rafId = null;
  let lastFrameTime = 0;
  let timeSinceLastMove = 0;

  function handleKeyDown(event) {
    const directionName = KEY_TO_DIRECTION[event.key];
    if (!directionName) return;
    event.preventDefault();
    model.setDirection(directionName);
  }

  function handleRestartClick() {
    startGame();
  }

  function gameLoop(currentTime) {
    if (lastFrameTime === 0) lastFrameTime = currentTime;

    const deltaTime = Math.min(currentTime - lastFrameTime, config.maxFrameDelta);
    lastFrameTime = currentTime;
    timeSinceLastMove += deltaTime;

    while (timeSinceLastMove >= config.moveInterval) {
      timeSinceLastMove -= config.moveInterval;
      model.step();
      if (model.getState().status !== 'running') break;
    }

    const state = model.getState();
    view.render(state);

    if (state.status === 'over') {
      rafId = null;
      view.showGameOver(state.score);
      return;
    }

    rafId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    model.reset();
    view.hideGameOver();
    view.render(model.getState());
    lastFrameTime = 0;
    timeSinceLastMove = 0;
    rafId = requestAnimationFrame(gameLoop);
  }

  function init() {
    document.addEventListener('keydown', handleKeyDown);
    restartEl.addEventListener('click', handleRestartClick);
    startGame();
  }

  return { init };
}

createController().init();