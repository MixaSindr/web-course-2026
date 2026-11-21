import * as Model from './model.js';
import * as View  from './view.js';

const TIMING = {
  leadIn: 600,
  flashOn: 420,
  flashGap: 180,
  roundGap: 700,
  playerFlash: 240,
};

let sessionToken = 0;

const pendingTimers = new Map();

let audioCtx = null;

function delay(ms, token) {
  return new Promise((resolve) => {
    const id = setTimeout(() => {
      pendingTimers.delete(id);
      resolve(token === sessionToken);
    }, ms);
    pendingTimers.set(id, resolve);
  });
}

function cancelAllTimers() {
  pendingTimers.forEach((resolve, id) => {
    clearTimeout(id);
    resolve(false);
  });
  pendingTimers.clear();
}

function stopSession() {
  sessionToken += 1;
  cancelAllTimers();
  View.clearAllFlashes();
}

function getAudioContext() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function playTone(index) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(Model.FREQUENCIES[index] ?? 440, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch { }
}

function playErrorTone() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now  = ctx.currentTime;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch { /* ignore */ }
}


function syncView() {
  View.renderLevel(Model.state.level);
  View.renderRecord(Model.state.record);

  const locked = Model.state.phase !== Model.PHASE.INPUT;
  View.renderLocked(locked);

  const startLabel =
    (Model.state.phase === Model.PHASE.IDLE ||
     Model.state.phase === Model.PHASE.GAMEOVER) ? 'Старт' : 'Заново';
  View.renderStartLabel(startLabel);
}


async function playSequence(token) {
  Model.state.phase = Model.PHASE.SHOWING;
  syncView();
  View.renderStatus('Смотрите последовательность…');

  if (!(await delay(TIMING.leadIn, token))) return false;

  for (const idx of Model.state.sequence) {
    View.flashPad(idx, TIMING.flashOn);
    playTone(idx);

    if (!(await delay(TIMING.flashOn, token)))  return false;
    if (!(await delay(TIMING.flashGap, token))) return false;
  }
  return true;
}

async function startRound(token) {
  Model.addStep();
  syncView();

  if (!(await playSequence(token))) return;

  Model.state.phase = Model.PHASE.INPUT;
  syncView();
  View.renderStatus('Ваш ход: повторите последовательность');
}

async function afterRoundCompleted(token) {
  if (!(await delay(TIMING.roundGap, token))) return;
  await startRound(token);
}


function handleStart() {
  stopSession();              
  const token = sessionToken;

  Model.startSession();
  syncView();
  startRound(token);
}

function handlePadClick(index) {

  if (Model.state.phase !== Model.PHASE.INPUT) return;

  View.flashPad(index, TIMING.playerFlash);
  playTone(index);

  if (index !== Model.expectedPad()) {
    stopSession();             
    Model.markGameOver();
    syncView();

    View.flashPad(index, 400);
    View.renderStatus(
      `Ошибка! Вы дошли до уровня ${Model.state.level}. Нажмите «Старт», чтобы сыграть снова.`
    );
    playErrorTone();
    return;
  }

  Model.advancePlayer();

  if (Model.isRoundComplete()) {
    Model.state.phase = Model.PHASE.SHOWING;
    syncView();
    afterRoundCompleted(sessionToken);
  }
}


export function init() {
  View.bindPadClick(handlePadClick);
  View.bindStartClick(handleStart);
  syncView();
  View.renderStatus('Нажмите «Старт», чтобы начать');
}