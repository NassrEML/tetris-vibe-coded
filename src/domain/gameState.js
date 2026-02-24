/**
 * Game State module - Manages game state and data
 * Tracks: game mode, pieces, score, level, lines
 */

import { createEmptyBoard } from './board.js';
import { createScoreState } from './scoring.js';
import { createLevelState } from './level.js';
import { createRandomizer, nextPiece } from './randomizer.js';
import { createGravity } from './gravity.js';
import { createDAS } from './das.js';
import { createLockState } from './lock.js';

/**
 * Game states
 */
export const GAME_STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
  PAUSED: 'paused'
};

/**
 * Creates initial game state
 * @param {number} startLevel - Starting level (default 0)
 * @returns {Object} Game state object
 */
export function createGameState(startLevel = 0) {
  return {
    state: GAME_STATES.TITLE,
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    score: createScoreState(),
    level: createLevelState(startLevel),
    randomizer: createRandomizer(),
    gravity: createGravity(startLevel),
    das: createDAS(),
    lock: createLockState(),
    frameCount: 0,
    gameOverAnimation: null
  };
}

/**
 * Starts a new game
 * @param {Object} gameState - Current game state
 * @param {number} startLevel - Starting level
 * @returns {Object} New game state ready to play
 */
export function startGame(gameState, startLevel = 0) {
  const newRandomizer = createRandomizer();
  const firstPieceResult = nextPiece(newRandomizer);
  const secondPieceResult = nextPiece(firstPieceResult.randomizer);

  return {
    ...gameState,
    state: GAME_STATES.PLAYING,
    board: createEmptyBoard(),
    currentPiece: null, // Will be spawned by controller
    nextPiece: secondPieceResult.pieceType,
    score: createScoreState(),
    level: createLevelState(startLevel),
    randomizer: secondPieceResult.randomizer,
    gravity: createGravity(startLevel),
    das: createDAS(),
    lock: createLockState(),
    frameCount: 0,
    gameOverAnimation: null
  };
}

/**
 * Transitions game to game over state
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with game over status
 */
export function setGameOver(gameState) {
  return {
    ...gameState,
    state: GAME_STATES.GAMEOVER,
    gameOverAnimation: {
      active: true,
      currentRow: 21, // Start from bottom (row 21 is visible row 19)
      completed: false
    }
  };
}

/**
 * Pauses the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state paused
 */
export function pauseGame(gameState) {
  if (gameState.state === GAME_STATES.PLAYING) {
    return {
      ...gameState,
      state: GAME_STATES.PAUSED
    };
  }
  return gameState;
}

/**
 * Resumes the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state resumed
 */
export function resumeGame(gameState) {
  if (gameState.state === GAME_STATES.PAUSED) {
    return {
      ...gameState,
      state: GAME_STATES.PLAYING
    };
  }
  return gameState;
}

/**
 * Returns to title screen
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state at title
 */
export function returnToTitle(gameState) {
  return {
    ...gameState,
    state: GAME_STATES.TITLE,
    currentPiece: null,
    nextPiece: null,
    gameOverAnimation: null
  };
}

/**
 * Spawns a new piece
 * @param {Object} gameState - Current game state
 * @param {Object} piece - Piece to spawn
 * @returns {Object} Game state with spawned piece
 */
export function spawnPiece(gameState, piece) {
  return {
    ...gameState,
    currentPiece: piece,
    das: createDAS(), // Reset DAS for new piece
    lock: createLockState() // Reset lock state
  };
}

/**
 * Sets the next piece type
 * @param {Object} gameState - Current game state
 * @param {number} pieceType - Next piece type (1-7)
 * @returns {Object} Game state with updated next piece
 */
export function setNextPiece(gameState, pieceType) {
  return {
    ...gameState,
    nextPiece: pieceType
  };
}

/**
 * Updates the board
 * @param {Object} gameState - Current game state
 * @param {Array} board - New board state
 * @returns {Object} Game state with updated board
 */
export function updateBoard(gameState, board) {
  return {
    ...gameState,
    board
  };
}

/**
 * Updates current piece
 * @param {Object} gameState - Current game state
 * @param {Object} piece - New piece state
 * @returns {Object} Game state with updated piece
 */
export function updateCurrentPiece(gameState, piece) {
  return {
    ...gameState,
    currentPiece: piece
  };
}

/**
 * Updates score state
 * @param {Object} gameState - Current game state
 * @param {Object} score - New score state
 * @returns {Object} Game state with updated score
 */
export function updateScore(gameState, score) {
  return {
    ...gameState,
    score
  };
}

/**
 * Updates level state
 * @param {Object} gameState - Current game state
 * @param {Object} level - New level state
 * @returns {Object} Game state with updated level
 */
export function updateLevel(gameState, level) {
  return {
    ...gameState,
    level
  };
}

/**
 * Updates gravity state
 * @param {Object} gameState - Current game state
 * @param {Object} gravity - New gravity state
 * @returns {Object} Game state with updated gravity
 */
export function updateGravity(gameState, gravity) {
  return {
    ...gameState,
    gravity
  };
}

/**
 * Updates DAS state
 * @param {Object} gameState - Current game state
 * @param {Object} das - New DAS state
 * @returns {Object} Game state with updated DAS
 */
export function updateDAS(gameState, das) {
  return {
    ...gameState,
    das
  };
}

/**
 * Updates lock state
 * @param {Object} gameState - Current game state
 * @param {Object} lock - New lock state
 * @returns {Object} Game state with updated lock
 */
export function updateLock(gameState, lock) {
  return {
    ...gameState,
    lock
  };
}

/**
 * Updates randomizer state
 * @param {Object} gameState - Current game state
 * @param {Object} randomizer - New randomizer state
 * @returns {Object} Game state with updated randomizer
 */
export function updateRandomizer(gameState, randomizer) {
  return {
    ...gameState,
    randomizer
  };
}

/**
 * Increments frame counter
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with incremented frame count
 */
export function incrementFrame(gameState) {
  return {
    ...gameState,
    frameCount: gameState.frameCount + 1
  };
}

/**
 * Checks if game is in playing state
 * @param {Object} gameState - Game state
 * @returns {boolean} True if playing
 */
export function isPlaying(gameState) {
  return gameState.state === GAME_STATES.PLAYING;
}

/**
 * Checks if game is over
 * @param {Object} gameState - Game state
 * @returns {boolean} True if game over
 */
export function isGameOver(gameState) {
  return gameState.state === GAME_STATES.GAMEOVER;
}

/**
 * Checks if game is paused
 * @param {Object} gameState - Game state
 * @returns {boolean} True if paused
 */
export function isPaused(gameState) {
  return gameState.state === GAME_STATES.PAUSED;
}

/**
 * Checks if at title screen
 * @param {Object} gameState - Game state
 * @returns {boolean} True if at title
 */
export function isAtTitle(gameState) {
  return gameState.state === GAME_STATES.TITLE;
}

/**
 * Gets game state info for display
 * @param {Object} gameState - Game state
 * @returns {Object} Display info
 */
export function getGameInfo(gameState) {
  return {
    state: gameState.state,
    score: gameState.score.totalScore,
    highScore: gameState.score.highScore,
    level: gameState.level.currentLevel,
    lines: gameState.score.linesCleared,
    nextPiece: gameState.nextPiece,
    frameCount: gameState.frameCount
  };
}
