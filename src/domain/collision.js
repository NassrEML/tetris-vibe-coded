/**
 * Collision module - NES Tetris collision detection
 * Simple collision without wall kicks or special handling
 */

import { BOARD_WIDTH, TOTAL_ROWS, getCell } from './board.js';
import { getPieceCells } from './piece.js';

/**
 * Checks if a position is valid for placing a piece
 * Returns false if any cell is out of bounds or occupied
 * @param {Array} board - Game board
 * @param {number} pieceType - Piece type (1-7)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} rotation - Rotation state (0-3)
 * @returns {boolean} True if position is valid, false if collision
 */
export function checkCollision(board, pieceType, x, y, rotation) {
  const cells = getPieceCells(pieceType, x, y, rotation);
  
  if (!cells) {
    return true; // Invalid piece type = collision
  }

  for (const cell of cells) {
    // Check bounds
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y < 0 || cell.y >= TOTAL_ROWS) {
      return true;
    }
    
    // Check if cell is occupied
    const cellValue = getCell(board, cell.x, cell.y);
    if (cellValue === null || cellValue !== 0) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a piece can move to a new position
 * Convenience wrapper around checkCollision
 */
export function canMovePiece(board, piece, deltaX, deltaY) {
  return !checkCollision(
    board,
    piece.type,
    piece.x + deltaX,
    piece.y + deltaY,
    piece.rotation
  );
}

/**
 * Checks if a piece can rotate to a new rotation
 * NES: If collision, rotation is cancelled (no wall kicks)
 */
export function canRotatePiece(board, piece, newRotation) {
  return !checkCollision(
    board,
    piece.type,
    piece.x,
    piece.y,
    newRotation
  );
}

/**
 * Checks if piece is touching the floor (can lock)
 * Returns true if moving down 1 would cause collision
 */
export function isPieceTouchingFloor(board, piece) {
  return checkCollision(
    board,
    piece.type,
    piece.x,
    piece.y + 1,
    piece.rotation
  );
}

/**
 * Checks if spawn position is clear
 * Used for game over detection
 */
export function canSpawnPiece(board, pieceType) {
  // Validate piece type first
  if (!pieceType || pieceType < 1 || pieceType > 7) {
    return false;
  }
  
  // Check spawn position (rotation 0)
  return !checkCollision(board, pieceType, 
    getPieceSpawnX(pieceType),
    getPieceSpawnY(pieceType),
    0
  );
}

/**
 * Helper to get spawn X from piece type
 */
function getPieceSpawnX(pieceType) {
  // Import from piece.js would create circular dependency
  // Hardcoded for now based on piece.js definitions
  const spawnPositions = {
    1: 3, // I
    2: 4, // O
    3: 3, // T
    4: 3, // S
    5: 3, // Z
    6: 3, // J
    7: 3  // L
  };
  return spawnPositions[pieceType];
}

/**
 * Helper to get spawn Y from piece type
 */
function getPieceSpawnY(pieceType) {
  return 0; // All pieces spawn at y=0
}
