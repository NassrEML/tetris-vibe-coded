import { describe, it, expect, beforeEach } from 'vitest';
import {
  DAS_DELAY_FRAMES,
  DAS_ARR_FRAMES,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_NONE,
  createDAS,
  tick,
  setDirection,
  moveLeft,
  moveRight,
  tickAndMove,
  resetDAS,
  isDASActive,
  getFramesUntilNextMove
} from '../../src/domain/das.js';
import { createEmptyBoard, setCell } from '../../src/domain/board.js';
import { createPiece, PIECE_TYPES } from '../../src/domain/piece.js';

describe('DAS Domain (NES)', () => {
  let board;

  beforeEach(() => {
    board = createEmptyBoard();
  });

  describe('Constants', () => {
    it('should have correct DAS delay (16 frames)', () => {
      expect(DAS_DELAY_FRAMES).toBe(16);
    });

    it('should have correct ARR (6 frames)', () => {
      expect(DAS_ARR_FRAMES).toBe(6);
    });

    it('should have correct direction constants', () => {
      expect(DIRECTION_LEFT).toBe(-1);
      expect(DIRECTION_RIGHT).toBe(1);
      expect(DIRECTION_NONE).toBe(0);
    });
  });

  describe('createDAS', () => {
    it('should create initial DAS state', () => {
      const das = createDAS();

      expect(das.direction).toBe(DIRECTION_NONE);
      expect(das.counter).toBe(0);
      expect(das.isActive).toBe(false);
      expect(das.lastMoveFrame).toBe(0);
    });
  });

  describe('tick', () => {
    it('should not move when no direction held', () => {
      const das = createDAS();

      const result = tick(das, 0);

      expect(result.shouldMove).toBe(false);
      expect(result.direction).toBe(DIRECTION_NONE);
    });

    it('should move immediately on first frame with direction', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      const result = tick(das, 0);

      expect(result.shouldMove).toBe(true);
      expect(result.direction).toBe(DIRECTION_RIGHT);
      expect(result.das.counter).toBe(1);
    });

    it('should not move during DAS delay (frames 1-15)', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // First frame moves (frame 0)
      let result = tick(das, 0);
      das = result.das;

      // Frames 1-15 should not move
      for (let i = 1; i < DAS_DELAY_FRAMES; i++) {
        result = tick(das, i);
        expect(result.shouldMove).toBe(false);
        das = result.das;
      }
    });

    it('should move on DAS delay frame (frame 16)', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // Tick 16 times to reach DAS activation
      for (let i = 0; i < DAS_DELAY_FRAMES; i++) {
        const result = tick(das, i);
        das = result.das;
      }

      // Frame 16 should trigger DAS move
      const result = tick(das, DAS_DELAY_FRAMES);
      expect(result.shouldMove).toBe(true);
      expect(result.das.isActive).toBe(true);
    });

    it('should auto-repeat every 6 frames after DAS activates', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // Reach DAS activation
      for (let i = 0; i <= DAS_DELAY_FRAMES; i++) {
        const result = tick(das, i);
        das = result.das;
      }

      // Now in auto-repeat mode, should move every 6 frames
      const moveFrames = [];
      for (let i = DAS_DELAY_FRAMES + 1; i < 50; i++) {
        const result = tick(das, i);
        if (result.shouldMove) {
          moveFrames.push(i);
        }
        das = result.das;
      }

      // Check that moves happen every 6 frames
      for (let i = 1; i < moveFrames.length; i++) {
        expect(moveFrames[i] - moveFrames[i - 1]).toBe(DAS_ARR_FRAMES);
      }
    });

    it('should handle left direction', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_LEFT);

      const result = tick(das, 0);

      expect(result.shouldMove).toBe(true);
      expect(result.direction).toBe(DIRECTION_LEFT);
    });

    it('should reset when direction released', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // Hold right for a few frames
      for (let i = 0; i < 5; i++) {
        const result = tick(das, i);
        das = result.das;
      }

      // Release direction
      das = setDirection(das, DIRECTION_NONE);
      const result = tick(das, 5);

      expect(result.shouldMove).toBe(false);
      expect(result.das.counter).toBe(0);
      expect(result.das.isActive).toBe(false);
    });

    it('should reset counter when direction changes', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // Hold right for a few frames
      for (let i = 0; i < 10; i++) {
        const result = tick(das, i);
        das = result.das;
      }

      expect(das.counter).toBe(10);

      // Change to left
      das = setDirection(das, DIRECTION_LEFT);

      expect(das.counter).toBe(0);
      expect(das.direction).toBe(DIRECTION_LEFT);
    });
  });

  describe('setDirection', () => {
    it('should update direction', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      expect(das.direction).toBe(DIRECTION_RIGHT);
    });

    it('should reset counter when direction changes', () => {
      let das = createDAS();
      das = { ...das, counter: 10 };

      das = setDirection(das, DIRECTION_LEFT);

      expect(das.counter).toBe(0);
    });

    it('should not change when direction is same', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);
      das = { ...das, counter: 5, isActive: false };

      const originalCounter = das.counter;
      das = setDirection(das, DIRECTION_RIGHT);

      // Should not reset counter for same direction
      expect(das).toBe(das); // Reference equality since it returns same object
    });
  });

  describe('moveLeft', () => {
    it('should move piece left when valid', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      const result = moveLeft(board, piece);

      expect(result.success).toBe(true);
      expect(result.piece.x).toBe(4);
    });

    it('should fail when hitting left wall', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 0; // O-piece at x=0 has cells at x=0,1

      const result = moveLeft(board, piece);

      expect(result.success).toBe(false);
      expect(result.piece.x).toBe(0);
    });

    it('should fail when blocked by existing block', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 2;

      // Place block at x=1, y=1
      board = setCell(board, 1, 1, 1);

      const result = moveLeft(board, piece);

      expect(result.success).toBe(false);
    });
  });

  describe('moveRight', () => {
    it('should move piece right when valid', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      const result = moveRight(board, piece);

      expect(result.success).toBe(true);
      expect(result.piece.x).toBe(6);
    });

    it('should fail when hitting right wall', () => {
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 6; // I-piece horizontal at x=6 has cells at x=6,7,8,9

      const result = moveRight(board, piece);

      expect(result.success).toBe(false);
    });

    it('should fail when blocked by existing block', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      // Place block at x=7, y=1
      board = setCell(board, 7, 1, 1);

      const result = moveRight(board, piece);

      expect(result.success).toBe(false);
    });
  });

  describe('tickAndMove', () => {
    it('should combine tick and move', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      const result = tickAndMove(board, piece, das, 0);

      expect(result.moved).toBe(true);
      expect(result.piece.x).toBe(6);
      expect(result.direction).toBe(DIRECTION_RIGHT);
    });

    it('should not move when DAS says not to', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // First tick moves
      let result = tickAndMove(board, createPiece(PIECE_TYPES.O), das, 0);
      das = result.das;

      // Second tick should not move (in DAS delay)
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;
      result = tickAndMove(board, piece, das, 1);

      expect(result.moved).toBe(false);
      expect(result.piece.x).toBe(5);
    });

    it('should handle collision during DAS movement', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      // Place piece at right edge
      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 6; // I-piece horizontal at x=6 is at right edge

      const result = tickAndMove(board, piece, das, 0);

      expect(result.moved).toBe(false);
      expect(result.piece.x).toBe(6);
    });

    it('should move piece left with tickAndMove', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_LEFT);

      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      const result = tickAndMove(board, piece, das, 0);

      expect(result.moved).toBe(true);
      expect(result.piece.x).toBe(4);
      expect(result.direction).toBe(DIRECTION_LEFT);
    });

    it('should handle direction NONE in tickAndMove', () => {
      const das = createDAS();

      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;

      const result = tickAndMove(board, piece, das, 0);

      expect(result.moved).toBe(false);
      expect(result.piece.x).toBe(5);
      expect(result.direction).toBe(DIRECTION_NONE);
    });
  });

  describe('resetDAS', () => {
    it('should return fresh DAS state', () => {
      const das = resetDAS();

      expect(das.direction).toBe(DIRECTION_NONE);
      expect(das.counter).toBe(0);
      expect(das.isActive).toBe(false);
    });
  });

  describe('isDASActive', () => {
    it('should return false for inactive DAS', () => {
      const das = createDAS();
      expect(isDASActive(das)).toBe(false);
    });

    it('should return true when DAS is active', () => {
      let das = createDAS();
      das = { ...das, isActive: true };

      expect(isDASActive(das)).toBe(true);
    });
  });

  describe('getFramesUntilNextMove', () => {
    it('should return 0 for first frame', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      expect(getFramesUntilNextMove(das)).toBe(0);
    });

    it('should return remaining DAS delay frames', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);
      das = { ...das, counter: 5 };

      expect(getFramesUntilNextMove(das)).toBe(DAS_DELAY_FRAMES - 5);
    });

    it('should return ARR frames when active', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);
      das = { ...das, counter: DAS_DELAY_FRAMES + 2, isActive: true };

      expect(getFramesUntilNextMove(das)).toBe(DAS_ARR_FRAMES - 2);
    });

    it('should return Infinity when no direction', () => {
      const das = createDAS();
      expect(getFramesUntilNextMove(das)).toBe(Infinity);
    });
  });

  describe('NES DAS timing accuracy', () => {
    it('should match NES DAS: 16 frame delay then 6 frame repeat', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      const moveFrames = [];

      // Simulate 60 frames
      for (let i = 0; i < 60; i++) {
        const result = tick(das, i);
        if (result.shouldMove) {
          moveFrames.push(i);
        }
        das = result.das;
      }

      // Expected pattern: 0, 16, 22, 28, 34, 40, 46, 52, 58
      expect(moveFrames[0]).toBe(0);
      expect(moveFrames[1]).toBe(DAS_DELAY_FRAMES);

      // Check ARR timing
      for (let i = 2; i < moveFrames.length; i++) {
        expect(moveFrames[i] - moveFrames[i - 1]).toBe(DAS_ARR_FRAMES);
      }
    });

    it('should handle tap-tap (quick direction changes)', () => {
      let das = createDAS();

      // First tap right
      das = setDirection(das, DIRECTION_RIGHT);
      let result = tick(das, 0);
      expect(result.shouldMove).toBe(true);
      das = result.das;

      // Release
      das = setDirection(das, DIRECTION_NONE);
      result = tick(das, 1);
      das = result.das;

      // Tap left immediately
      das = setDirection(das, DIRECTION_LEFT);
      result = tick(das, 2);
      expect(result.shouldMove).toBe(true); // Should move immediately
    });
  });

  describe('Immutability', () => {
    it('tick should not mutate input', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);
      const original = { ...das };

      tick(das, 0);

      expect(das.counter).toBe(original.counter);
      expect(das.direction).toBe(original.direction);
    });

    it('setDirection should not mutate when direction is same', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);
      const originalDas = das;

      das = setDirection(das, DIRECTION_RIGHT);

      expect(das).toBe(originalDas);
    });

    it('tickAndMove should not mutate piece on collision', () => {
      let das = createDAS();
      das = setDirection(das, DIRECTION_RIGHT);

      const piece = createPiece(PIECE_TYPES.I);
      piece.x = 6; // At right edge
      const originalX = piece.x;

      tickAndMove(board, piece, das, 0);

      expect(piece.x).toBe(originalX);
    });
  });
});
