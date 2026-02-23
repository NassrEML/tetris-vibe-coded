import { describe, it, expect } from 'vitest';
import {
  PIECE_TYPES,
  PIECE_NAMES,
  PIECES,
  createPiece,
  getPieceCells,
  rotatePiece,
  movePiece,
  getAbsoluteCells,
  getAllPieceTypes
} from '../../src/domain/piece.js';

describe('Piece Domain', () => {
  describe('Piece Types Constants', () => {
    it('should have correct type numbers', () => {
      expect(PIECE_TYPES.I).toBe(1);
      expect(PIECE_TYPES.O).toBe(2);
      expect(PIECE_TYPES.T).toBe(3);
      expect(PIECE_TYPES.S).toBe(4);
      expect(PIECE_TYPES.Z).toBe(5);
      expect(PIECE_TYPES.J).toBe(6);
      expect(PIECE_TYPES.L).toBe(7);
    });

    it('should have piece names array', () => {
      expect(PIECE_NAMES[1]).toBe('I');
      expect(PIECE_NAMES[2]).toBe('O');
      expect(PIECE_NAMES[7]).toBe('L');
    });
  });

  describe('Piece Definitions', () => {
    it('should define all 7 pieces', () => {
      expect(Object.keys(PIECES).length).toBe(7);
      expect(PIECES[PIECE_TYPES.I]).toBeDefined();
      expect(PIECES[PIECE_TYPES.O]).toBeDefined();
      expect(PIECES[PIECE_TYPES.T]).toBeDefined();
      expect(PIECES[PIECE_TYPES.S]).toBeDefined();
      expect(PIECES[PIECE_TYPES.Z]).toBeDefined();
      expect(PIECES[PIECE_TYPES.J]).toBeDefined();
      expect(PIECES[PIECE_TYPES.L]).toBeDefined();
    });

    it('should have 4 rotation states for each piece', () => {
      for (let type = 1; type <= 7; type++) {
        expect(PIECES[type].rotations.length).toBe(4);
        // Each rotation should have exactly 4 cells
        for (let rot = 0; rot < 4; rot++) {
          expect(PIECES[type].rotations[rot].length).toBe(4);
        }
      }
    });

    it('should have spawn positions for all pieces', () => {
      for (let type = 1; type <= 7; type++) {
        expect(PIECES[type].spawnX).toBeDefined();
        expect(PIECES[type].spawnY).toBeDefined();
        expect(PIECES[type].type).toBe(type);
      }
    });
  });

  describe('I-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.I);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
      expect(piece.rotation).toBe(0);
    });

    it('should have correct rotation 0 (horizontal)', () => {
      const piece = createPiece(PIECE_TYPES.I);
      expect(piece.cells).toEqual([
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (vertical)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.I), 1);
      expect(piece.cells).toEqual([
        { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }
      ]);
    });

    it('should have correct rotation 2 (horizontal mirrored)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.I), 2);
      expect(piece.cells).toEqual([
        { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }
      ]);
    });

    it('should have correct rotation 3 (vertical mirrored)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.I), 3);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }
      ]);
    });
  });

  describe('O-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.O);
      expect(piece.x).toBe(4);
      expect(piece.y).toBe(0);
    });

    it('should have identical rotations (O does not rotate)', () => {
      const piece = createPiece(PIECE_TYPES.O);
      const rotated1 = rotatePiece(piece, 1);
      const rotated2 = rotatePiece(piece, 2);
      
      expect(piece.cells).toEqual([
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }
      ]);
      expect(rotated1.cells).toEqual(piece.cells);
      expect(rotated2.cells).toEqual(piece.cells);
    });
  });

  describe('T-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.T);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });

    it('should have correct rotation 0 (T pointing down)', () => {
      const piece = createPiece(PIECE_TYPES.T);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (T pointing left)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.T), 1);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }
      ]);
    });

    it('should have correct rotation 2 (T pointing up)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.T), 2);
      expect(piece.cells).toEqual([
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }
      ]);
    });

    it('should have correct rotation 3 (T pointing right)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.T), 3);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }
      ]);
    });
  });

  describe('S-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.S);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });

    it('should have correct rotation 0 (horizontal)', () => {
      const piece = createPiece(PIECE_TYPES.S);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (vertical)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.S), 1);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }
      ]);
    });
  });

  describe('Z-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.Z);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });

    it('should have correct rotation 0 (horizontal)', () => {
      const piece = createPiece(PIECE_TYPES.Z);
      expect(piece.cells).toEqual([
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (vertical)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.Z), 1);
      expect(piece.cells).toEqual([
        { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }
      ]);
    });
  });

  describe('J-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.J);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });

    it('should have correct rotation 0 (J pointing right)', () => {
      const piece = createPiece(PIECE_TYPES.J);
      expect(piece.cells).toEqual([
        { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (J pointing down)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.J), 1);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }
      ]);
    });

    it('should have correct rotation 2 (J pointing left)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.J), 2);
      expect(piece.cells).toEqual([
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }
      ]);
    });

    it('should have correct rotation 3 (J pointing up)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.J), 3);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }
      ]);
    });
  });

  describe('L-Piece Spawn and Rotations', () => {
    it('should spawn at correct position', () => {
      const piece = createPiece(PIECE_TYPES.L);
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });

    it('should have correct rotation 0 (L pointing left)', () => {
      const piece = createPiece(PIECE_TYPES.L);
      expect(piece.cells).toEqual([
        { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }
      ]);
    });

    it('should have correct rotation 1 (L pointing down)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.L), 1);
      expect(piece.cells).toEqual([
        { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }
      ]);
    });

    it('should have correct rotation 2 (L pointing right)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.L), 2);
      expect(piece.cells).toEqual([
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }
      ]);
    });

    it('should have correct rotation 3 (L pointing up)', () => {
      const piece = rotatePiece(createPiece(PIECE_TYPES.L), 3);
      expect(piece.cells).toEqual([
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }
      ]);
    });
  });

  describe('createPiece', () => {
    it('should create piece with correct initial state', () => {
      const piece = createPiece(PIECE_TYPES.T);
      expect(piece.type).toBe(PIECE_TYPES.T);
      expect(piece.rotation).toBe(0);
      expect(piece.cells).toHaveLength(4);
    });

    it('should return null for invalid type', () => {
      expect(createPiece(0)).toBe(null);
      expect(createPiece(8)).toBe(null);
      expect(createPiece(null)).toBe(null);
    });
  });

  describe('getPieceCells', () => {
    it('should return absolute cell positions', () => {
      const cells = getPieceCells(PIECE_TYPES.O, 5, 10, 0);
      expect(cells).toEqual([
        { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 11 }, { x: 6, y: 11 }
      ]);
    });

    it('should handle different rotations', () => {
      const cells0 = getPieceCells(PIECE_TYPES.I, 0, 0, 0);
      const cells1 = getPieceCells(PIECE_TYPES.I, 0, 0, 1);
      
      expect(cells0).toEqual([
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }
      ]);
      expect(cells1).toEqual([
        { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }
      ]);
    });

    it('should return null for invalid type', () => {
      expect(getPieceCells(0, 0, 0, 0)).toBe(null);
    });
  });

  describe('rotatePiece', () => {
    it('should rotate clockwise by default', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const rotated = rotatePiece(piece);
      expect(rotated.rotation).toBe(1);
    });

    it('should rotate counter-clockwise with -1', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 1;
      const rotated = rotatePiece(piece, -1);
      expect(rotated.rotation).toBe(0);
    });

    it('should wrap rotation values', () => {
      const piece = createPiece(PIECE_TYPES.T);
      piece.rotation = 3;
      const rotated = rotatePiece(piece, 1);
      expect(rotated.rotation).toBe(0);
    });

    it('should not mutate original piece', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const rotated = rotatePiece(piece, 1);
      
      expect(piece.rotation).toBe(0);
      expect(rotated.rotation).toBe(1);
    });
  });

  describe('movePiece', () => {
    it('should move piece horizontally', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const moved = movePiece(piece, 2, 0);
      
      expect(moved.x).toBe(5); // 3 + 2
      expect(moved.y).toBe(0);
    });

    it('should move piece vertically', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const moved = movePiece(piece, 0, 5);
      
      expect(moved.x).toBe(3);
      expect(moved.y).toBe(5); // 0 + 5
    });

    it('should move piece diagonally', () => {
      const piece = createPiece(PIECE_TYPES.T);
      const moved = movePiece(piece, -1, 2);
      
      expect(moved.x).toBe(2); // 3 - 1
      expect(moved.y).toBe(2);
    });

    it('should not mutate original piece', () => {
      const piece = createPiece(PIECE_TYPES.T);
      movePiece(piece, 5, 5);
      
      expect(piece.x).toBe(3);
      expect(piece.y).toBe(0);
    });
  });

  describe('getAbsoluteCells', () => {
    it('should return cells with absolute coordinates', () => {
      const piece = createPiece(PIECE_TYPES.O);
      piece.x = 5;
      piece.y = 10;
      
      const absolute = getAbsoluteCells(piece);
      
      expect(absolute).toEqual([
        { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 5, y: 11 }, { x: 6, y: 11 }
      ]);
    });
  });

  describe('getAllPieceTypes', () => {
    it('should return array of all 7 piece types', () => {
      const types = getAllPieceTypes();
      expect(types).toHaveLength(7);
      expect(types).toContain(PIECE_TYPES.I);
      expect(types).toContain(PIECE_TYPES.O);
      expect(types).toContain(PIECE_TYPES.T);
      expect(types).toContain(PIECE_TYPES.S);
      expect(types).toContain(PIECE_TYPES.Z);
      expect(types).toContain(PIECE_TYPES.J);
      expect(types).toContain(PIECE_TYPES.L);
    });
  });

  describe('Immutability', () => {
    it('rotatePiece should not mutate original', () => {
      const original = createPiece(PIECE_TYPES.T);
      const rotated = rotatePiece(original, 1);
      const rotated2 = rotatePiece(rotated, 1);
      
      expect(original.rotation).toBe(0);
      expect(rotated.rotation).toBe(1);
      expect(rotated2.rotation).toBe(2);
    });

    it('movePiece should not mutate original', () => {
      const original = createPiece(PIECE_TYPES.T);
      const moved1 = movePiece(original, 1, 0);
      const moved2 = movePiece(moved1, 1, 0);
      
      expect(original.x).toBe(3);
      expect(moved1.x).toBe(4);
      expect(moved2.x).toBe(5);
    });
  });
});
