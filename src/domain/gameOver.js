/**
 * Game Over module - NES Tetris game over detection and animation
 * Handles spawn collision detection and game over stack animation
 */

import { canSpawnPiece } from './collision.js';
import { setCell, createEmptyBoard, BOARD_WIDTH, TOTAL_ROWS, HIDDEN_ROWS } from './board.js';
import { setGameOver, GAME_STATES } from './gameState.js';

/**
 * Checks if game over should trigger (spawn collision)
 * @param {Array} board - Game board
 * @param {number} pieceType - Piece type trying to spawn
 * @returns {boolean} True if game over (spawn blocked)
 */
export function checkGameOver(board, pieceType) {
  return !canSpawnPiece(board, pieceType);
}

/**
 * Triggers game over state
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with game over triggered
 */
export function triggerGameOver(gameState) {
  return setGameOver(gameState);
}

/**
 * Advances the game over stack animation
 * Fills board from bottom up, one row per frame/call
 * @param {Object} gameState - Current game state
 * @returns {Object} { gameState: Object, completed: boolean }
 */
export function advanceGameOverAnimation(gameState) {
  if (!gameState.gameOverAnimation || !gameState.gameOverAnimation.active) {
    return { gameState, completed: true };
  }

  const { currentRow } = gameState.gameOverAnimation;
  let newBoard = gameState.board;

  // Fill current row with random piece colors (1-7)
  if (currentRow >= 0 && currentRow < TOTAL_ROWS) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // Fill with a mix of colors for visual effect
      const color = ((x + currentRow) % 7) + 1;
      const result = setCell(newBoard, x, currentRow, color);
      if (result) {
        newBoard = result;
      }
    }
  }

  // Check if animation is complete (reached top)
  const completed = currentRow <= 0;

  const newGameState = {
    ...gameState,
    board: newBoard,
    gameOverAnimation: {
      ...gameState.gameOverAnimation,
      currentRow: currentRow - 1,
      completed
    }
  };

  return { gameState: newGameState, completed };
}

/**
 * Checks if game over animation is active
 * @param {Object} gameState - Game state
 * @returns {boolean} True if animation is active
 */
export function isGameOverAnimationActive(gameState) {
  return !!(gameState.gameOverAnimation && 
         gameState.gameOverAnimation.active && 
         !gameState.gameOverAnimation.completed);
}

/**
 * Checks if game over animation is complete
 * @param {Object} gameState - Game state
 * @returns {boolean} True if animation completed
 */
export function isGameOverAnimationComplete(gameState) {
  return gameState.gameOverAnimation && gameState.gameOverAnimation.completed;
}

/**
 * Resets game over animation
 * @param {Object} gameState - Game state
 * @returns {Object} Game state with animation reset
 */
export function resetGameOverAnimation(gameState) {
  return {
    ...gameState,
    gameOverAnimation: null
  };
}

/**
 * Creates a completely filled board (for game over state)
 * @returns {Array} Filled board
 */
export function createFilledBoard() {
  const board = createEmptyBoard();
  
  for (let y = 0; y < TOTAL_ROWS; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      // Fill with varied colors for visual effect
      board[y][x] = ((x + y) % 7) + 1;
    }
  }
  
  return board;
}

/**
 * Gets the current animation row
 * @param {Object} gameState - Game state
 * @returns {number} Current row being filled, or -1 if not animating
 */
export function getAnimationRow(gameState) {
  if (!gameState.gameOverAnimation || !gameState.gameOverAnimation.active) {
    return -1;
  }
  return gameState.gameOverAnimation.currentRow;
}

/**
 * Calculates animation progress percentage
 * @param {Object} gameState - Game state
 * @returns {number} Progress from 0 to 100
 */
export function getAnimationProgress(gameState) {
  if (!gameState.gameOverAnimation || !gameState.gameOverAnimation.active) {
    return 100;
  }
  
  const totalRows = TOTAL_ROWS;
  const currentRow = gameState.gameOverAnimation.currentRow;
  const rowsFilled = totalRows - currentRow - 1;
  
  return Math.min(100, Math.max(0, (rowsFilled / totalRows) * 100));
}
