/**
 * Lock module - NES Tetris piece locking
 * Immediate lock when piece touches floor
 * No modern lock delay or extended placement
 */

import { isPieceTouchingFloor, checkCollision } from './collision.js';
import { placePiece, isRowComplete, clearLines, createEmptyBoard } from './board.js';

/**
 * Checks if piece should lock (NES: immediate lock on floor touch)
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @returns {boolean} True if piece should lock immediately
 */
export function shouldLock(board, piece) {
  return isPieceTouchingFloor(board, piece);
}

/**
 * Locks piece to board immediately
 * NES behavior: No lock delay, locks instantly on floor contact
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Piece to lock
 * @returns {Object} { 
 *                     board: Array|null, 
 *                     locked: boolean,
 *                     error: string|null 
 *                   }
 *                   board: new board with piece locked, or null if error
 *                   locked: true if successful
 *                   error: error message if failed
 */
export function lockPiece(board, piece) {
  // Validate piece can be placed
  if (!piece || !piece.type || !piece.cells) {
    return {
      board: null,
      locked: false,
      error: 'Invalid piece'
    };
  }

  // Check for collision at current position first
  if (checkCollision(board, piece.type, piece.x, piece.y, piece.rotation)) {
    return {
      board: null,
      locked: false,
      error: 'Piece in invalid position'
    };
  }

  // Check if piece is actually touching floor
  if (!isPieceTouchingFloor(board, piece)) {
    return {
      board: null,
      locked: false,
      error: 'Piece not touching floor'
    };
  }

  // Place piece on board
  const newBoard = placePiece(board, piece);

  if (newBoard === null) {
    return {
      board: null,
      locked: false,
      error: 'Failed to place piece'
    };
  }

  return {
    board: newBoard,
    locked: true,
    error: null
  };
}

/**
 * Executes lock and clear in one operation
 * NES behavior: Lock piece, then clear completed lines
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Piece to lock
 * @returns {Object} {
 *                     board: Array|null,
 *                     locked: boolean,
 *                     clearedLines: number,
 *                     error: string|null
 *                   }
 */
export function lockAndClear(board, piece) {
  const lockResult = lockPiece(board, piece);

  if (!lockResult.locked) {
    return {
      board: null,
      locked: false,
      clearedLines: 0,
      error: lockResult.error
    };
  }

  // Clear completed lines
  const clearResult = clearLines(lockResult.board);

  return {
    board: clearResult.board,
    locked: true,
    clearedLines: clearResult.clearedLines,
    error: null
  };
}

/**
 * Checks if piece can lock at current position
 * Validates that locking won't cause errors
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @returns {boolean} True if piece can be safely locked
 */
export function canLock(board, piece) {
  if (!piece || !piece.type) {
    return false;
  }

  // Must be touching floor
  if (!isPieceTouchingFloor(board, piece)) {
    return false;
  }

  // Must not be in collision
  if (checkCollision(board, piece.type, piece.x, piece.y, piece.rotation)) {
    return false;
  }

  return true;
}

/**
 * Creates lock state for tracking lock-related data
 * NES has no lock delay, but we track state for completeness
 * @returns {Object} Lock state object
 */
export function createLockState() {
  return {
    isLocked: false,
    lockedAtFrame: null,
    lockedPiece: null
  };
}

/**
 * Marks a piece as locked in state
 * @param {Object} lockState - Current lock state
 * @param {Object} piece - Piece that was locked
 * @param {number} frame - Frame number when locked
 * @returns {Object} New lock state
 */
export function markLocked(lockState, piece, frame) {
  return {
    ...lockState,
    isLocked: true,
    lockedAtFrame: frame,
    lockedPiece: { ...piece }
  };
}

/**
 * Resets lock state for new piece
 * @returns {Object} Fresh lock state
 */
export function resetLockState() {
  return createLockState();
}

/**
 * Checks if lock state indicates a locked piece
 * @param {Object} lockState - Lock state
 * @returns {boolean} True if piece is locked
 */
export function isLocked(lockState) {
  return lockState.isLocked;
}

/**
 * Counts completed lines on a board without clearing them
 * Useful for previewing line clears
 * @param {Array} board - Game board
 * @returns {number} Count of completed lines
 */
export function countCompletedLines(board) {
  let count = 0;
  for (let i = 0; i < board.length; i++) {
    if (isRowComplete(board, i)) {
      count++;
    }
  }
  return count;
}
