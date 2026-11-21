'use strict';

const input = document.querySelector('#attempt-input');
const checkBtn = document.querySelector('#check-btn');
const newGameBtn = document.querySelector('#new-game-btn');
const message = document.querySelector('#message');
const attemptCountEl = document.querySelector('#attempt-count');
const historyList = document.querySelector('#history-list');
const historyEmpty = document.querySelector('#history-empty');

const state = {
  secret: '',
  attempts: [],
  isOver: false,
};

// Отдельная функция генерации загаданного числа: 4 уникальные цифры.
function generateSecret() {
  const digits = [];
  while (digits.length < 4) {
    const digit = Math.floor(Math.random() * 10);
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }
  return digits.join('');
}

// Отдельная функция валидации. Возвращает { valid, error, value }.
function validateGuess(raw) {
  const value = raw.trim();

  if (!/^\d{4}$/.test(value)) {
    return { valid: false, error: 'Нужно ровно 4 цифры, без букв и символов.', value };
  }

  if (new Set(value).size !== 4) {
    return { valid: false, error: 'Цифры не должны повторяться.', value };
  }

  return { valid: true, error: '', value };
}

// Отдельная функция подсчёта быков и коров.
function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < guess.length; i += 1) {
    const digit = guess[i];
    if (digit === secret[i]) {
      bulls += 1;
    } else if (secret.includes(digit)) {
      cows += 1;
    }
  }

  return { bulls, cows };
}

// Формируем строку с эмодзи-подсказками: сначала быки, потом коровы.
function buildHint(bulls, cows) {
  if (bulls === 0 && cows === 0) {
    return '—';
  }
  return '🐂'.repeat(bulls) + '🐄'.repeat(cows);
}

function setMessage(text, type = 'error') {
  if (!text) {
    message.hidden = true;
    message.textContent = '';
    message.classList.remove('is-success');
    return;
  }
  message.textContent = text;
  message.classList.toggle('is-success', type === 'success');
  message.hidden = false;
}

function renderHistory() {
  historyList.replaceChildren(
    ...state.attempts
      .slice()
      .reverse()
      .map(entry => {
        const item = document.createElement('li');
        item.className = 'history__item';

        const number = document.createElement('span');
        number.className = 'history__number';
        number.textContent = entry.guess;

        const hint = document.createElement('span');
        hint.className = 'history__hint';
        hint.textContent = buildHint(entry.bulls, entry.cows);
        if (entry.bulls === 4) {
          hint.classList.add('is-win');
        }
        hint.setAttribute(
          'aria-label',
          `Быков: ${entry.bulls}, коров: ${entry.cows}`
        );

        item.append(number, hint);
        return item;
      })
  );

  historyEmpty.hidden = state.attempts.length > 0;
}

function renderCounter() {
  attemptCountEl.textContent = String(state.attempts.length);
}

function lockGame() {
  state.isOver = true;
  input.disabled = true;
  checkBtn.disabled = true;
}

function unlockGame() {
  state.isOver = false;
  input.disabled = false;
  checkBtn.disabled = false;
}

function startNewGame() {
  state.secret = generateSecret();
  state.attempts = [];
  unlockGame();

  input.value = '';
  setMessage('');
  renderHistory();
  renderCounter();
  input.focus();

  // Для отладки при желании можно снять комментарий:
  // console.log('Secret:', state.secret);
}

function handleAttempt() {
  if (state.isOver) {
    return;
  }

  const { valid, error, value } = validateGuess(input.value);

  if (!valid) {
    setMessage(error);
    input.focus();
    input.select();
    return;
  }

  const { bulls, cows } = countBullsAndCows(state.secret, value);

  state.attempts.push({ guess: value, bulls, cows });

  input.value = '';
  setMessage('');
  renderHistory();
  renderCounter();

  if (bulls === 4) {
    lockGame();
    setMessage(
      `Победа! Угадано за ${state.attempts.length} ${pluralizeAttempts(state.attempts.length)}. Загаданное число: ${state.secret}.`,
      'success'
    );
    return;
  }

  input.focus();
}

function pluralizeAttempts(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'попытку';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'попытки';
  return 'попыток';
}

checkBtn.addEventListener('click', handleAttempt);

input.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleAttempt();
  }
});

newGameBtn.addEventListener('click', startNewGame);

// Автоочистка сообщения об ошибке, как только игрок начал исправлять ввод.
input.addEventListener('input', () => {
  // Разрешаем только цифры, максимум 4 символа — на всякий случай.
  input.value = input.value.replace(/\D/g, '').slice(0, 4);
  if (!message.hidden && !message.classList.contains('is-success')) {
    setMessage('');
  }
});

startNewGame();