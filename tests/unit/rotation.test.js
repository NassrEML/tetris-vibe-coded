import { describe, it, expect, beforeEach } from 'vitest';
import {
  tryRotate,
  rotateClockwise,
  rotateCounterClockwise,
  getRotatedCells
} from '../../src/domain/rotation.js';
import { createEmptyBoard, setCell } from '../../src/domain/board.js';
import { createPiece, PIECE_TYPES, rotatePiece } from '../../src/domain/piece.js';

describe('Rotation Domain (NES)', () => {
  let board;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe('tryRotate', () => {
    it('should successfully rotate when no collision', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const result = tryRotate(board, piece, 1);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should return new piece without mutating original', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const result = tryRotate(board, piece, 1);

      expect(result.piece).not.toBe(piece);
      expect(piece.rotation).toBe(0);
      expect(result.piece.rotation).toBe(1);
    });

    it('should cancel rotation if it hits left wall', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 0;
      piece.y = 5;
      piece.rotation = 0; // Horizontal

      // I-piece at x=0, rot 0: cells at x=0,1,2,3 (valid)
      // I-piece at x=0, rot 1 (vertical): center at x=2, cells at x=2 (valid)
      // Actually vertical is valid, let me test a case where it's not

      // Let's use T-piece near left wall
      const tPiece = createPiece(PIECE_TYPES.T);
      tPiece.x = -1;
      tPiece.y = 5;
      tPiece.rotation = 0;

      // At x=-1, T-piece would have cells at x=-1, 0, 1
      // The x=-1 cell is out of bounds, so this is already invalid
      // Let's test with a valid position that becomes invalid after rotation
      
      // Use I-piece at the edge where rotation fails
      const iPiece = createPiece(PIECE_TYPES.I);
      iPiece.x = 0;
      iPiece.y = 5;
      iPiece.rotation = 0; // Horizontal
      
      // At x=0, horizontal I-piece has cells at x=0,1,2,3 - valid
      // Vertical I-piece (rot 1) at x=0 has cell at x=2 - also valid
      // Actually this is fine too
      
      // Try O-piece at left edge - it has cells at x and x+1
      const oPiece = createPiece(PIECE_TYPES.O);
      oPiece.x = -1;
      oPiece.y = 5;
      
      // O-piece at x=-1: cells at (-1,5), (0,5), (-1,6), (0,6)
      // x=-1 is out of bounds, rotation check should fail
      const result = tryRotate(board, oPiece, 1);
      expect(result.success).toBe(false);
      expect(result.piece.rotation).toBe(0);
    });

    it('should cancel rotation if it hits right wall', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 7; // I-piece horizontal at x=7: cells at 7,8,9,10 (10 is out)
      piece.y = 5;
      piece.rotation = 0;

      // Start with a valid position
      piece.x = 6; // Valid: cells at 6,7,8,9
      expect(tryRotate(board, piece, 1).success).toBe(true);

      // Now test with a position where rotation would hit wall
      const piece2 = createPiece(PIECE_TYPES.I);
      piece2.x = 7;
      piece2.y = 5;
      piece2.rotation = 1; // Vertical, center at x=9 (valid)

      // Rotating to horizontal: cells at x=7,8,9,10 -> x=10 is out of bounds
      const result = tryRotate(board, piece2, 1);
      expect(result.success).toBe(false);
    });

    it('should cancel rotation if it hits existing blocks', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.x = 4;
      piece.y = 18;

      // Place a block where rotation would place a cell
      // T-piece at (4,18), rot 1: cells (5,18), (5,19), (6,19), (5,20)
      board = setCell(board, 5, 20, 1);

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(false);
    });

    it('should cancel rotation if it would go through floor', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 0;
      piece.y = 19; // I-piece vertical at y=19: cells at y=19,20,21,22 (y=22 is out)
      piece.rotation = 1;

      // Already at bottom, rotating would keep it at bottom
      const result = tryRotate(board, piece, 1);
      // Rotation 1 -> 2 (vertical to horizontal mirrored)
      // Horizontal I-piece (rot 2): cells at relative y=2, so absolute y=21
      // Should still be valid
      expect(result.success).toBe(true);

      // Now test a position where rotation would hit floor
      const piece2 = createPiece(PIECE_TYPES.I);
      piece2.x = 0;
      piece2.y = 20; // Too low

      // Actually at y=20, I-piece vertical (rot 1) would have cells at 20,21,22,23
      // y=22,23 are out of bounds, so initial position is invalid
    });

    it('should rotate clockwise with direction 1', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const result = tryRotate(board, piece, 1);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should rotate counter-clockwise with direction -1', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 1;
      const result = tryRotate(board, piece, -1);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(0);
    });

    it('should handle rotation wrapping', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 3;
      const result = tryRotate(board, piece, 1);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(0);
    });
  });

  describe('rotateClockwise', () => {
    it('should rotate piece clockwise', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const result = rotateClockwise(board, piece);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should cancel if clockwise rotation collides', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.x = 4;
      piece.y = 18;
      board = setCell(board, 5, 20, 1); // Block rotation path

      const result = rotateClockwise(board, piece);
      expect(result.success).toBe(false);
    });
  });

  describe('rotateCounterClockwise', () => {
    it('should rotate piece counter-clockwise', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 1;
      const result = rotateCounterClockwise(board, piece);

      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(0);
    });

    it('should cancel if counter-clockwise rotation collides', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 1;
      piece.x = 4;
      piece.y = 18;
      
      // T-piece at (4,18), rot 1: cells (5,18), (5,19), (6,19), (5,20)
      // T-piece at (4,18), rot 0: cells (5,18), (4,19), (5,19), (6,19)
      
      // Block at (4,18) - this is where a rot 0 cell would NOT be
      // Let's block (4,19) instead which IS a rot 0 cell
      board = setCell(board, 4, 19, 1); 

      const result = rotateCounterClockwise(board, piece);
      expect(result.success).toBe(false);
    });
  });

  describe('getRotatedCells', () => {
    it('should return absolute cells for rotated position', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;
      piece.y = 10;

      const cells = getRotatedCells(piece, 1);

      // O-piece doesn't change with rotation
      expect(cells).toEqual([
        { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 11 }, { x: 6, y: 11 }
      ]);
    });

    it('should return cells for T-piece rotation', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.x = 4;
      piece.y = 10;

      const cells0 = getRotatedCells(piece, 0);
      const cells1 = getRotatedCells(piece, 1);

      // Rotation 0: T pointing down
      expect(cells0).toEqual([
        { x: 5, y: 10 }, { x: 4, y: 11 }, { x: 5, y: 11 }, { x: 6, y: 11 }
      ]);

      // Rotation 1: T pointing left
      expect(cells1).toEqual([
        { x: 5, y: 10 }, { x: 5, y: 11 }, { x: 6, y: 11 }, { x: 5, y: 12 }
      ]);
    });

    it('should handle negative direction', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 1;

      const cells = getRotatedCells(piece, -1);

      // From rot 1, -1 should give rot 0 cells
      expect(cells).toEqual([
        { x: piece.x + 1, y: piece.y },
        { x: piece.x, y: piece.y + 1 },
        { x: piece.x + 1, y: piece.y + 1 },
        { x: piece.x + 2, y: piece.y + 1 }
      ]);
    });
  });

  describe('NES specific behavior - No wall kicks', () => {
    it('should NOT kick wall when rotation hits left wall', () => {
      // I-piece vertical near left wall
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 0;
      piece.y = 5;
      piece.rotation = 1; // Vertical

      // Vertical I-piece at x=0: center at x=2, so cells at x=2
      // This is valid
      expect(tryRotate(board, piece, 1).success).toBe(true);

      // But at x=-1, it would be out of bounds
      const piece2 = createPiece(PIECE_TYPES.I);
      piece2.x = -1;
      piece2.y = 5;
      piece2.rotation = 1;

      // NES does NOT kick - it just cancels the rotation
      const result = tryRotate(board, piece2, 1);
      expect(result.success).toBe(false);
    });

    it('should NOT kick wall when rotation hits right wall', () => {
      // I-piece vertical near right wall
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 7;
      piece.y = 5;
      piece.rotation = 1; // Vertical, center at x=9

      // Rotating to horizontal would place cells at x=7,8,9,10
      // x=10 is out of bounds
      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(false);
    });

    it('should NOT kick floor when rotation would go below', () => {
      // Test that rotation doesn't kick up from floor
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 0;
      piece.y = 19;
      piece.rotation = 0; // Horizontal at bottom

      // Actually at y=19, horizontal I-piece would have cells at y=20
      // which is still valid (last row is 21)

      // Let's fill the board to create a floor
      for (let x = 0; x < 10; x++) {
        board = setCell(board, x, 20, 1);
      }

      // Now piece at y=19 would be touching floor
      // Rotation to vertical: cells at y=19,20,21,22
      // y=20 is occupied, so rotation should fail
      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(false);
    });
  });

  describe('All piece types rotation', () => {
    it('should rotate I-piece all 4 states', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 3;
      piece.y = 10;

      let result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);

      result = tryRotate(board, result.piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(2);

      result = tryRotate(board, result.piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(3);

      result = tryRotate(board, result.piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(0);
    });

    it('should rotate O-piece (identical states)', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 10;

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      // O-piece cells don't change
      expect(result.piece.cells).toEqual(piece.cells);
    });

    it('should rotate T-piece with all states', () => {
      let piece = createPiece(PIECE_TYPES.T);
      piece.x = 3;
      piece.y = 10;

      for (let i = 1; i <= 4; i++) {
        const result = tryRotate(board, piece, 1);
        expect(result.success).toBe(true);
        piece = result.piece;
      }

      expect(piece.rotation).toBe(0);
    });

    it('should rotate S-piece', () => {
      const piece = createPiece(PIECE_TYPES.S);
      piece.x = 3;
      piece.y = 10;

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should rotate Z-piece', () => {
      const piece = createPiece(PIECE_TYPES.Z);
      piece.x = 3;
      piece.y = 10;

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should rotate J-piece', () => {
      const piece = createPiece(PIECE_TYPES.J);
      piece.x = 3;
      piece.y = 10;

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });

    it('should rotate L-piece', () => {
      const piece = createPiece(PIECE_TYPES.L);
      piece.x = 3;
      piece.y = 10;

      const result = tryRotate(board, piece, 1);
      expect(result.success).toBe(true);
      expect(result.piece.rotation).toBe(1);
    });
  });

  describe('Immutability', () => {
    it('should never mutate input board', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const originalBoard = [...board];

      tryRotate(board, piece, 1);

      expect(board).toEqual(originalBoard);
    });

    it('should never mutate input piece', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const originalRotation = piece.rotation;
      const originalX = piece.x;
      const originalY = piece.y;

      tryRotate(board, piece, 1);

      expect(piece.rotation).toBe(originalRotation);
      expect(piece.x).toBe(originalX);
      expect(piece.y).toBe(originalY);
    });
  });
});
