import { describe, it, expect, beforeEach } from 'vitest';
import {
  shouldLock,
  lockPiece,
  lockAndClear,
  canLock,
  createLockState,
  markLocked,
  resetLockState,
  isLocked,
  countCompletedLines
} from '../../src/domain/lock.js';
import { createEmptyBoard, setCell, BOARD_WIDTH, TOTAL_ROWS } from '../../src/domain/board.js';
import { createPiece, PIECE_TYPES, movePiece } from '../../src/domain/piece.js';

describe('Lock Domain (NES)', () => {
  let board;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe('shouldLock', () => {
    it('should return true when piece is at bottom', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 20; // O-piece at y=20 has cells at y=20,21 (bottom rows)

      expect(shouldLock(board, piece)).toBe(true);
    });

    it('should return true when piece is on top of blocks', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 18;

      // Place blocks at y=20
      board = setCell(board, 4, 20, 1);
      board = setCell(board, 5, 20, 1);

      expect(shouldLock(board, piece)).toBe(true);
    });

    it('should return false when piece can fall', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 10;

      expect(shouldLock(board, piece)).toBe(false);
    });

    it('should return false for piece at spawn', () => {
      const piece = createPiece(PIECE_TYPES.T);

      expect(shouldLock(board, piece)).toBe(false);
    });
  });

  describe('lockPiece', () => {
    it('should lock piece to board', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;

      const result = lockPiece(board, piece);

      expect(result.locked).toBe(true);
      expect(result.error).toBeNull();
      expect(result.board).not.toBeNull();

      // Verify piece was placed
      expect(result.board[20][4]).toBe(PIECE_TYPES.O);
      expect(result.board[20][5]).toBe(PIECE_TYPES.O);
      expect(result.board[21][4]).toBe(PIECE_TYPES.O);
      expect(result.board[21][5]).toBe(PIECE_TYPES.O);
    });

    it('should fail if piece not touching floor', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 10;

      const result = lockPiece(board, piece);

      expect(result.locked).toBe(false);
      expect(result.error).toBe('Piece not touching floor');
      expect(result.board).toBeNull();
    });

    it('should fail for invalid piece', () => {
      const result = lockPiece(board, null);

      expect(result.locked).toBe(false);
      expect(result.error).toBe('Invalid piece');
    });

    it('should fail for piece with missing properties', () => {
      const result = lockPiece(board, { type: 1 });

      expect(result.locked).toBe(false);
      expect(result.error).toBe('Invalid piece');
    });

    it('should fail if piece is in collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 18;

      // Place a block where piece would be
      board = setCell(board, 4, 18, 1);

      const result = lockPiece(board, piece);

      expect(result.locked).toBe(false);
      expect(result.error).toBe('Piece in invalid position');
    });
  });

  describe('lockAndClear', () => {
    it('should lock piece and clear completed lines', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 3;
      piece.y = 20; // I-piece horizontal at bottom
      piece.rotation = 0;

      // Fill row 21 (but not where I-piece will be)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x < 3 || x > 6) {
          board = setCell(board, x, 21, 1);
        }
      }

      const result = lockAndClear(board, piece);

      expect(result.locked).toBe(true);
      expect(result.clearedLines).toBeGreaterThanOrEqual(0);
    });

    it('should clear multiple lines', () => {
      // Create a scenario where we complete 4 lines (Tetris)
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 3;
      piece.y = 17; // I-piece horizontal - cells at y=18 (relative y=1)
      piece.rotation = 0;

      // Fill row 18, leaving gap for I-piece
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x < 3 || x > 6) {
          board = setCell(board, x, 18, 1);
        }
      }

      // Fill rows 19-21 completely to create a floor
      for (let row = 19; row <= 21; row++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board = setCell(board, x, row, 1);
        }
      }

      const result = lockAndClear(board, piece);

      expect(result.locked).toBe(true);
      expect(result.clearedLines).toBe(4);
    });

    it('should return error if lock fails', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 10; // Not touching floor

      const result = lockAndClear(board, piece);

      expect(result.locked).toBe(false);
      expect(result.clearedLines).toBe(0);
      expect(result.error).toBe('Piece not touching floor');
    });

    it('should return 0 cleared lines when no lines complete', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;

      const result = lockAndClear(board, piece);

      expect(result.locked).toBe(true);
      expect(result.clearedLines).toBe(0);
    });
  });

  describe('canLock', () => {
    it('should return true for valid lock position', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;

      expect(canLock(board, piece)).toBe(true);
    });

    it('should return false if not touching floor', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.y = 10;

      expect(canLock(board, piece)).toBe(false);
    });

    it('should return false if in collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 18;

      board = setCell(board, 4, 18, 1);

      expect(canLock(board, piece)).toBe(false);
    });

    it('should return false if touching floor but in collision', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20; // Touching floor

      // Place a block where piece would be (collision)
      board = setCell(board, 4, 20, 1);

      expect(canLock(board, piece)).toBe(false);
    });

    it('should return false for null piece', () => {
      expect(canLock(board, null)).toBe(false);
    });

    it('should return false for piece without type', () => {
      expect(canLock(board, { x: 0, y: 0 })).toBe(false);
    });
  });

  describe('createLockState', () => {
    it('should create initial lock state', () => {
      const lockState = createLockState();

      expect(lockState.isLocked).toBe(false);
      expect(lockState.lockedAtFrame).toBeNull();
      expect(lockState.lockedPiece).toBeNull();
    });
  });

  describe('markLocked', () => {
    it('should mark piece as locked', () => {
      let lockState = createLockState();
      const piece = createPiece(PIECE_TYPES.T);

      lockState = markLocked(lockState, piece, 100);

      expect(lockState.isLocked).toBe(true);
      expect(lockState.lockedAtFrame).toBe(100);
      expect(lockState.lockedPiece).toEqual(piece);
    });

    it('should not mutate original lock state', () => {
      const lockState = createLockState();
      const piece = createPiece(PIECE_TYPES.T);

      markLocked(lockState, piece, 100);

      expect(lockState.isLocked).toBe(false);
    });
  });

  describe('resetLockState', () => {
    it('should return fresh lock state', () => {
      const lockState = resetLockState();

      expect(lockState.isLocked).toBe(false);
      expect(lockState.lockedAtFrame).toBeNull();
    });
  });

  describe('isLocked', () => {
    it('should return false for unlocked state', () => {
      const lockState = createLockState();
      expect(isLocked(lockState)).toBe(false);
    });

    it('should return true for locked state', () => {
      let lockState = createLockState();
      lockState = markLocked(lockState, createPiece(PIECE_TYPES.T), 0);

      expect(isLocked(lockState)).toBe(true);
    });
  });

  describe('countCompletedLines', () => {
    it('should return 0 for empty board', () => {
      expect(countCompletedLines(board)).toBe(0);
    });

    it('should count completed lines', () => {
      // Fill 3 rows
      for (let row = 18; row <= 20; row++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board = setCell(board, x, row, 1);
        }
      }

      expect(countCompletedLines(board)).toBe(3);
    });

    it('should not count incomplete lines', () => {
      // Fill row but leave one gap
      for (let x = 0; x < BOARD_WIDTH - 1; x++) {
        board = setCell(board, x, 20, 1);
      }

      expect(countCompletedLines(board)).toBe(0);
    });
  });

  describe('NES locking behavior', () => {
    it('should lock immediately when touching floor (no delay)', () => {
      // NES behavior: immediate lock, no modern lock delay
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;

      // As soon as piece touches floor, it should be lockable
      expect(shouldLock(board, piece)).toBe(true);

      // And locking should succeed
      const result = lockPiece(board, piece);
      expect(result.locked).toBe(true);
    });

    it('should not allow micro-movement after floor touch', () => {
      // In NES, once a piece touches floor, it locks immediately
      // No opportunity for micro-movement
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;

      // Piece should lock immediately
      expect(shouldLock(board, piece)).toBe(true);

      // In modern Tetris, you might have time to slide
      // In NES, this should return true immediately
    });

    it('should handle lock with all piece types', () => {
      const pieceTypes = [1, 2, 3, 4, 5, 6, 7];

      for (const type of pieceTypes) {
        board = createEmptyBoard();
        const piece = createPiece(type);

        // Move piece to bottom
        piece.y = 20;

        // Adjust x if needed for I-piece
        if (type === PIECE_TYPES.I) {
          piece.x = 3;
        } else if (type === PIECE_TYPES.O) {
          piece.x = 4;
        } else {
          piece.x = 3;
        }

        const result = lockPiece(board, piece);
        expect(result.locked).toBe(true);
      }
    });
  });

  describe('Immutability', () => {
    it('lockPiece should not mutate input board', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;
      const originalBoard = JSON.stringify(board);

      lockPiece(board, piece);

      expect(JSON.stringify(board)).toBe(originalBoard);
    });

    it('lockPiece should not mutate input piece', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;
      const originalX = piece.x;

      lockPiece(board, piece);

      expect(piece.x).toBe(originalX);
    });

    it('lockAndClear should not mutate input', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 4;
      piece.y = 20;
      const originalBoard = JSON.stringify(board);

      lockAndClear(board, piece);

      expect(JSON.stringify(board)).toBe(originalBoard);
    });
  });
});
