/**
 * Rotation module - NES Tetris rotation logic
 * Simple rotation without wall kicks - if rotation collides, it's cancelled
 */

import { rotatePiece, getPieceCells } from './piece.js';
import { checkCollision } from './collision.js';

/**
 * Attempts to rotate a piece on the board
 * NES behavior: If rotation collides, it's cancelled (no wall kicks)
 * @param {Object} board - Game board
 * @param {Object} piece - Current piece
 * @param {number} direction - 1 for clockwise, -1 for counter-clockwise
 * @returns {Object} Object with { success: boolean, piece: Object }
 *                   If successful, piece is the rotated piece
 *                   If failed, piece is the original piece
 */
export function tryRotate(board, piece, direction = 1) {
  // Calculate new rotation
  const newRotation = ((piece.rotation + direction) % 4 + 4) % 4;

  // Check if rotation is valid (no collision)
  const wouldCollide = checkCollision(board, piece.type, piece.x, piece.y, newRotation);

  if (wouldCollide) {
    // NES behavior: rotation is cancelled
    return {
      success: false,
      piece: piece
    };
  }

  // Rotation is valid, return rotated piece
  const rotatedPiece = rotatePiece(piece, direction);
  return {
    success: true,
    piece: rotatedPiece
  };
}

/**
 * Rotates piece clockwise (convenience function)
 * @param {Object} board - Game board
 * @param {Object} piece - Current piece
 * @returns {Object} { success: boolean, piece: Object }
 */
export function rotateClockwise(board, piece) {
  return tryRotate(board, piece, 1);
}

/**
 * Rotates piece counter-clockwise (convenience function)
 * @param {Object} board - Game board
 * @param {Object} piece - Current piece
 * @returns {Object} { success: boolean, piece: Object }
 */
export function rotateCounterClockwise(board, piece) {
  return tryRotate(board, piece, -1);
}

/**
 * Gets the cells that a piece would occupy after rotation
 * Useful for previewing rotation result
 * @param {Object} piece - Current piece
 * @param {number} direction - Rotation direction (1 or -1)
 * @returns {Array} Array of {x, y} absolute coordinates
 */
export function getRotatedCells(piece, direction = 1) {
  const newRotation = ((piece.rotation + direction) % 4 + 4) % 4;
  return getPieceCells(piece.type, piece.x, piece.y, newRotation);
}
