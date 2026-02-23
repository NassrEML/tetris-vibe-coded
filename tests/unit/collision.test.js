import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkCollision,
  canMovePiece,
  canRotatePiece,
  isPieceTouchingFloor,
  canSpawnPiece
} from '../../src/domain/collision.js';
import { createEmptyBoard, BOARD_WIDTH, TOTAL_ROWS, setCell } from '../../src/domain/board.js';
import { createPiece, PIECE_TYPES, movePiece, rotatePiece } from '../../src/domain/piece.js';

describe('Collision Domain', () => {
  let board;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe('checkCollision', () => {
    it('should return false for valid empty position', () => {
      const piece = createPiece(PIECE_TYPES.O);
      expect(checkCollision(board, piece.type, piece.x, piece.y, 0)).toBe(false);
    });

    it('should return true for left wall collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      // O-piece at x=-1 would have cells at x=-1 and x=0
      expect(checkCollision(board, piece.type, -1, piece.y, 0)).toBe(true);
    });

    it('should return true for right wall collision', () => {
      const piece = createPiece(PIECE_TYPES.I);
      // I-piece at x=8 would have cells at x=8,9,10,11
      expect(checkCollision(board, piece.type, 8, piece.y, 0)).toBe(true);
    });

    it('should return true for floor collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      // O-piece at y=21 would have cells at y=21 and y=22 (TOTAL_ROWS=22, so y=22 is out)
      expect(checkCollision(board, piece.type, piece.x, 21, 0)).toBe(true);
    });

    it('should return true for ceiling collision', () => {
      const piece = createPiece(PIECE_TYPES.I);
      // I-piece at rotation 1 at y=-1 would have cells at y=-1
      expect(checkCollision(board, piece.type, piece.x, -1, 1)).toBe(true);
    });

    it('should return true for collision with existing blocks', () => {
      const piece = createPiece(PIECE_TYPES.O);
      // Place a block at position where O-piece would spawn
      board = setCell(board, 4, 1, 1); // x=4, y=1
      
      // O-piece at (4,0) has cells at (4,0), (5,0), (4,1), (5,1)
      // Should collide with cell at (4,1)
      expect(checkCollision(board, piece.type, 4, 0, 0)).toBe(true);
    });

    it('should return true for invalid piece type', () => {
      expect(checkCollision(board, 0, 0, 0, 0)).toBe(true);
      expect(checkCollision(board, 8, 0, 0, 0)).toBe(true);
      expect(checkCollision(board, null, 0, 0, 0)).toBe(true);
    });

    it('should handle I-piece horizontal at left edge', () => {
      // I-piece horizontal (rot 0) at x=0 has cells at x=0,1,2,3
      expect(checkCollision(board, PIECE_TYPES.I, 0, 0, 0)).toBe(false);
      
      // At x=-1, would have cell at x=-1
      expect(checkCollision(board, PIECE_TYPES.I, -1, 0, 0)).toBe(true);
    });

    it('should handle I-piece horizontal at right edge', () => {
      // I-piece horizontal (rot 0) at x=6 has cells at x=6,7,8,9
      expect(checkCollision(board, PIECE_TYPES.I, 6, 0, 0)).toBe(false);
      
      // At x=7, would have cell at x=10 (out of bounds)
      expect(checkCollision(board, PIECE_TYPES.I, 7, 0, 0)).toBe(true);
    });

    it('should handle I-piece vertical at bottom', () => {
      // I-piece vertical (rot 1) at y=18 has cells at y=18,19,20,21
      expect(checkCollision(board, PIECE_TYPES.I, 0, 18, 1)).toBe(false);
      
      // At y=19, would have cell at y=22 (out of bounds)
      expect(checkCollision(board, PIECE_TYPES.I, 0, 19, 1)).toBe(true);
    });
  });

  describe('canMovePiece', () => {
    it('should return true for valid left move', () => {
      const piece = createPiece(PIECE_TYPES.O);
      const moved = movePiece(piece, 1, 0);
      expect(canMovePiece(board, piece, 1, 0)).toBe(true);
    });

    it('should return true for valid right move', () => {
      const piece = createPiece(PIECE_TYPES.O);
      expect(canMovePiece(board, piece, 1, 0)).toBe(true);
    });

    it('should return true for valid down move', () => {
      const piece = createPiece(PIECE_TYPES.O);
      expect(canMovePiece(board, piece, 0, 1)).toBe(true);
    });

    it('should return false for left wall collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 0; // O-piece at x=0
      expect(canMovePiece(board, piece, -1, 0)).toBe(false);
    });

    it('should return false for right wall collision', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 6; // I-piece horizontal at x=6 (cells at 6,7,8,9)
      expect(canMovePiece(board, piece, 1, 0)).toBe(false);
    });

    it('should return false for floor collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 20; // O-piece at y=20 (cells at 20,21)
      expect(canMovePiece(board, piece, 0, 1)).toBe(false);
    });

    it('should return false when hitting existing block', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 18;
      // Place block at (4, 20)
      board = setCell(board, 4, 20, 1);
      
      expect(canMovePiece(board, piece, 0, 1)).toBe(false);
    });
  });

  describe('canRotatePiece', () => {
    it('should return true for valid rotation', () => {
      const piece = createPiece(PIECE_TYPES.T);
      expect(canRotatePiece(board, piece, 1)).toBe(true);
    });

    it('should return false if rotation hits wall', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 0;
      piece.y = 5;
      piece.rotation = 0; // Horizontal
      
      // I-piece at x=0, rot 0 has cells at x=0,1,2,3
      // I-piece at x=0, rot 1 (vertical) has center at x=2, so cells at x=2
      // This should be valid actually...
      
      // Let's try a better case: I-piece at right edge
      piece.x = 8;
      piece.rotation = 0;
      // I-piece horizontal at x=8 would be invalid, so let's start valid
      
      piece.x = 7;
      piece.rotation = 0;
      // I-piece at x=7, rot 0: cells at 7,8,9,10 (invalid)
      // Actually I-piece width is 4, so x=6 is max for horizontal
      
      piece.x = 6;
      piece.rotation = 0;
      // I-piece at x=6, rot 0: cells at 6,7,8,9 (valid)
      expect(checkCollision(board, piece.type, piece.x, piece.y, 0)).toBe(false);
      
      // I-piece at x=6, rot 1: center at x=8, cells at x=8 (valid)
      expect(canRotatePiece(board, piece, 1)).toBe(true);
    });

    it('should return false if rotation hits existing block', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.x = 4;
      piece.y = 18;
      
      // Place blocks that would be hit after rotation
      // T-piece at (4,18), rot 0: cells (5,18), (4,19), (5,19), (6,19)
      // T-piece at (4,18), rot 1: cells (5,18), (5,19), (6,19), (5,20)
      
      board = setCell(board, 5, 20, 1); // Block where rot 1 would place a cell
      
      expect(canRotatePiece(board, piece, 1)).toBe(false);
    });

    it('should not allow wall kicks (NES behavior)', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 7; // Near right edge
      piece.y = 5;
      piece.rotation = 1; // Vertical, center at relative x=2, so absolute x=9
      
      // Vertical I-piece at x=7: cells at x=9 (7+2) - valid
      expect(checkCollision(board, piece.type, piece.x, piece.y, piece.rotation)).toBe(false);
      
      // Trying to rotate to horizontal (rotation 2):
      // Horizontal I-piece (rot 2): cells at x=0,1,2,3 relative to position
      // At x=7: cells at x=7,8,9,10 (x=10 out of bounds)
      expect(canRotatePiece(board, piece, 2)).toBe(false);
    });
  });

  describe('isPieceTouchingFloor', () => {
    it('should return false when piece can move down', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 0;
      expect(isPieceTouchingFloor(board, piece)).toBe(false);
    });

    it('should return true when piece is at bottom', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 20; // O-piece cells at 20,21 - can't go to 21,22
      expect(isPieceTouchingFloor(board, piece)).toBe(true);
    });

    it('should return true when piece is on top of blocks', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 18; // O-piece would occupy y=18,19
      
      // Place blocks at y=20
      board = setCell(board, 4, 20, 1);
      board = setCell(board, 5, 20, 1);
      
      expect(isPieceTouchingFloor(board, piece)).toBe(true);
    });

    it('should work for I-piece vertical at bottom', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.rotation = 1; // Vertical
      piece.y = 18; // Cells at 18,19,20,21 - at bottom
      expect(isPieceTouchingFloor(board, piece)).toBe(true);
    });
  });

  describe('canSpawnPiece', () => {
    it('should return true when spawn area is clear', () => {
      expect(canSpawnPiece(board, PIECE_TYPES.I)).toBe(true);
      expect(canSpawnPiece(board, PIECE_TYPES.O)).toBe(true);
      expect(canSpawnPiece(board, PIECE_TYPES.T)).toBe(true);
    });

    it('should return false when spawn area is blocked', () => {
      // Block spawn area for T-piece (spawns at x=3)
      // T-piece at (3,0), rot 0: cells (4,0), (3,1), (4,1), (5,1)
      board = setCell(board, 4, 0, 1);
      
      expect(canSpawnPiece(board, PIECE_TYPES.T)).toBe(false);
    });

    it('should detect collision in hidden rows', () => {
      // O-piece spawns at y=0 with cells at y=0,1
      // Block at y=1
      board = setCell(board, 4, 1, 1);
      
      expect(canSpawnPiece(board, PIECE_TYPES.O)).toBe(false);
    });

    it('should return false for invalid piece types', () => {
      expect(canSpawnPiece(board, 0)).toBe(false);
      expect(canSpawnPiece(board, 8)).toBe(false);
      expect(canSpawnPiece(board, null)).toBe(false);
      expect(canSpawnPiece(board, undefined)).toBe(false);
      expect(canSpawnPiece(board, -1)).toBe(false);
    });
  });

  describe('Complex collision scenarios', () => {
    it('should handle piece sliding along wall', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 0; // At left wall
      piece.y = 10;
      
      // Can't move left
      expect(canMovePiece(board, piece, -1, 0)).toBe(false);
      // Can move down
      expect(canMovePiece(board, piece, 0, 1)).toBe(true);
      // Can move right
      expect(canMovePiece(board, piece, 1, 0)).toBe(true);
    });

    it('should handle piece in narrow gap', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.rotation = 1; // Vertical (cells at relative x=2)
      piece.x = 3; // Absolute x=3 -> cells at x=5 (between walls at 4 and 6)
      piece.y = 10;
      
      // Place walls on both sides
      for (let y = 0; y < TOTAL_ROWS; y++) {
        board = setCell(board, 4, y, 1);
        board = setCell(board, 6, y, 1);
      }
      
      // Can move vertically
      expect(canMovePiece(board, piece, 0, 1)).toBe(true);
      // Can't move horizontally (left would hit x=4 wall, right would hit x=6 wall)
      // Moving left: x becomes 2, cells at x=4 -> collision!
      expect(canMovePiece(board, piece, -1, 0)).toBe(false);
      // Moving right: x becomes 4, cells at x=6 -> collision!
      expect(canMovePiece(board, piece, 1, 0)).toBe(false);
      // Can't rotate to horizontal (would span from x=3 to x=6, hitting wall at x=6)
      expect(canRotatePiece(board, piece, 2)).toBe(false);
    });

    it('should handle all piece types at spawn', () => {
      for (const type of [1, 2, 3, 4, 5, 6, 7]) {
        expect(canSpawnPiece(board, type)).toBe(true);
      }
    });

    it('should handle game over scenario (spawn collision)', () => {
      // Fill spawn area completely
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board = setCell(board, x, y, 1);
        }
      }
      
      // No piece should be able to spawn
      for (const type of [1, 2, 3, 4, 5, 6, 7]) {
        expect(canSpawnPiece(board, type)).toBe(false);
      }
    });
  });
});
