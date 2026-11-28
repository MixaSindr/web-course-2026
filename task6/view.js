/**
 * Представление: только отрисовка состояния на Canvas и в HTML.
 * Никаких правил игры и обработки ввода.
 * Все настройки приходят через config (см. controller.js).
 */
export function createView(canvasEl, elements, config) {
  const ctx = canvasEl.getContext('2d');
  const { scoreEl, overlayEl, finalScoreEl } = elements;

  canvasEl.width = config.cols * config.cellSize;
  canvasEl.height = config.rows * config.cellSize;

  function drawBoard() {
    ctx.fillStyle = config.colors.board;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    ctx.strokeStyle = config.colors.grid;
    ctx.lineWidth = 1;

    for (let x = 1; x < config.cols; x += 1) {
      const px = x * config.cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, canvasEl.height);
      ctx.stroke();
    }

    for (let y = 1; y < config.rows; y += 1) {
      const py = y * config.cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(canvasEl.width, py);
      ctx.stroke();
    }
  }

  function drawFruit(fruit) {
    const size = config.cellSize;
    const centerX = fruit.x * size + size / 2;
    const centerY = fruit.y * size + size / 2;

    ctx.beginPath();
    ctx.fillStyle = config.colors.fruit;
    ctx.arc(centerX, centerY, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnake(snake) {
    const size = config.cellSize;

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0
        ? config.colors.snakeHead
        : config.colors.snakeBody;

      ctx.fillRect(
        segment.x * size + 1,
        segment.y * size + 1,
        size - 2,
        size - 2,
      );
    });
  }

  function render(state) {
    drawBoard();
    if (state.fruit) drawFruit(state.fruit);
    drawSnake(state.snake);
    scoreEl.textContent = String(state.score);
  }

  function showGameOver(score) {
    finalScoreEl.textContent = String(score);
    overlayEl.hidden = false;
  }

  function hideGameOver() {
    overlayEl.hidden = true;
  }

  return { render, showGameOver, hideGameOver };
}