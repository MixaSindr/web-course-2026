// View: только работа с DOM. Никакой игровой логики и таймеров,
// кроме собственных таймеров подсветки, которые сами за собой убирают.

const boardEl = document.getElementById('board');
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');
const levelEl = document.getElementById('level');
const recordEl = document.getElementById('record');


const pads = Array.from(boardEl.querySelectorAll('.pad'))
  .sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));


const flashTimers = new Map();

export function bindPadClick(handler) {
  pads.forEach((pad) => {
    pad.addEventListener('click', (event) => {
      const index = Number(event.currentTarget.dataset.index);
      handler(index);
    });
  });
}

export function bindStartClick(handler) {
  startBtn.addEventListener('click', handler);
}

export function renderLevel(value)  { levelEl.textContent  = String(value); }
export function renderRecord(value) { recordEl.textContent = String(value); }
export function renderStatus(text)  { statusEl.textContent = text; }
export function renderStartLabel(label) { startBtn.textContent = label; }

export function renderLocked(locked) {
  boardEl.classList.toggle('board--locked', locked);
  pads.forEach((pad) => pad.setAttribute('aria-disabled', String(locked)));
}

export function flashPad(index, ms) {
  const pad = pads[index];
  if (!pad) return;

  const previous = flashTimers.get(index);
  if (previous) clearTimeout(previous);

  pad.classList.add('is-active');
  const id = setTimeout(() => {
    pad.classList.remove('is-active');
    flashTimers.delete(index);
  }, ms);
  flashTimers.set(index, id);
}

export function clearAllFlashes() {
  flashTimers.forEach((id) => clearTimeout(id));
  flashTimers.clear();
  pads.forEach((pad) => pad.classList.remove('is-active'));
}