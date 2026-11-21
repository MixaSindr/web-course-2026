export const PHASE = Object.freeze({
  IDLE:'idle',
  SHOWING:'showing',
  INPUT:'input',
  GAMEOVER:'gameover',
});

export const PAD_COUNT = 4;
export const FREQUENCIES = [329.63, 261.63, 220.0, 164.81]; // E4, C4, A3, E3

export const state = {
  sequence: [],   
  playerIndex: 0,    
  level: 0,
  record: 0,
  phase: PHASE.IDLE,
};

export function startSession() {
  state.sequence = [];
  state.playerIndex = 0;
  state.level = 0;
  state.phase = PHASE.SHOWING;
}

export function randomPad() {
  return Math.floor(Math.random() * PAD_COUNT);
}


export function addStep() {
  state.sequence.push(randomPad());
  state.level = state.sequence.length;
  state.playerIndex = 0;
}

export function expectedPad() {
  return state.sequence[state.playerIndex];
}

export function advancePlayer() {
  state.playerIndex += 1;
}

export function isRoundComplete() {
  return state.playerIndex === state.sequence.length;
}

export function markGameOver() {
  state.record = Math.max(state.record, state.level);
  state.phase  = PHASE.GAMEOVER;
}