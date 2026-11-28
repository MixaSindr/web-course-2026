/**
 * Направления движения. Ключи используются контроллером для клавиатуры.
 */
export const DIRECTIONS = {
  up:    { x: 0,  y: -1 },
  down:  { x: 0,  y: 1  },
  left:  { x: -1, y: 0  },
  right: { x: 1,  y: 0  },
};

/**
 * Модель игры: состояние + правила.
 * Ничего не знает ни о DOM, ни о Canvas, ни о клавиатуре.
 * Все настройки приходят через config (см. controller.js).
 */
export function createModel(config) {
  const state = {
    snake: [],                        // snake[0] — голова
    direction: { ...DIRECTIONS.right },
    pendingDirection: null,           // нажатие, которое применится на следующем шаге
    fruit: null,
    score: 0,
    growthLeft: 0,                    // сколько сегментов ещё «должна» змейка
    status: 'running',                // 'running' | 'over'
  };

  function isInsideBoard(x, y) {
    return x >= 0 && x < config.cols && y >= 0 && y < config.rows;
  }

  function isOnSnake(x, y, segments) {
    return segments.some((segment) => segment.x === x && segment.y === y);
  }

  /** Ставит фрукт в случайную свободную клетку (не на тело змейки). */
  function spawnFruit() {
    const free = [];
    for (let y = 0; y < config.rows; y += 1) {
      for (let x = 0; x < config.cols; x += 1) {
        if (!isOnSnake(x, y, state.snake)) {
          free.push({ x, y });
        }
      }
    }

    if (free.length === 0) {
      state.fruit = null;              // поле заполнено целиком
      return;
    }

    state.fruit = free[Math.floor(Math.random() * free.length)];
  }

  function reset() {
    const startX = Math.floor(config.cols / 2);
    const startY = Math.floor(config.rows / 2);

    state.snake = [];
    for (let i = 0; i < config.initialLength; i += 1) {
      state.snake.push({ x: startX - i, y: startY });
    }

    state.direction = { ...DIRECTIONS.right };
    state.pendingDirection = null;
    state.fruit = null;
    state.score = 0;
    state.growthLeft = 0;
    state.status = 'running';

    spawnFruit();
  }

  /**
   * Принимает нажатие.
   *
   * ВАЖНО: разворот на 180° проверяется относительно ФАКТИЧЕСКОГО
   * направления движения (state.direction), а не относительно
   * pendingDirection. Иначе два быстрых нажатия за один такт
   * («вверх», затем «влево» при движении вправо) проходят проверку
   * и разворачивают змейку в собственное тело.
   *
   * Второе нажатие в том же такте просто перезаписывает pendingDirection,
   * если оно допустимо относительно state.direction. Последнее слово
   * всегда остаётся валидным ходом.
   */
  function setDirection(directionName) {
    const next = DIRECTIONS[directionName];
    if (!next) return;

    const current = state.direction;

    const isReverse = next.x === -current.x && next.y === -current.y;
    const isSame = next.x === current.x && next.y === current.y;
    if (isReverse || isSame) return;

    state.pendingDirection = next;
  }

  /** Один такт игры: сдвиг на одну клетку. */
  function step() {
    if (state.status !== 'running') return;

    if (state.pendingDirection) {
      state.direction = state.pendingDirection;
      state.pendingDirection = null;
    }

    const head = state.snake[0];
    const nextHead = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y,
    };

    if (!isInsideBoard(nextHead.x, nextHead.y)) {
      state.status = 'over';           // столкновение со стеной
      return;
    }

    // Хвост освободится на этом же шаге, если змейка сейчас не растёт.
    const bodyToCheck = state.growthLeft > 0 ? state.snake : state.snake.slice(0, -1);
    if (isOnSnake(nextHead.x, nextHead.y, bodyToCheck)) {
      state.status = 'over';           // столкновение с хвостом
      return;
    }

    state.snake.unshift(nextHead);

    const ateFruit = state.fruit !== null
      && nextHead.x === state.fruit.x
      && nextHead.y === state.fruit.y;

    if (ateFruit) {
      state.score += config.fruit.score;
      state.growthLeft += config.fruit.growth;
      state.fruit = null;
    }

    if (state.growthLeft > 0) {
      state.growthLeft -= 1;           // хвост не убираем — змейка растёт
    } else {
      state.snake.pop();
    }

    if (ateFruit) {
      spawnFruit();
    }
  }

  function getState() {
    return state;
  }

  return { reset, setDirection, step, getState };
}