import { describe, it, expect } from 'vitest';
import { BOARD_WIDTH, PIECE_TYPES, FPS } from '../../src/domain/index.js';

describe('Domain Setup', () => {
  it('should export domain modules', () => {
    expect(BOARD_WIDTH).toBe(10);
    expect(PIECE_TYPES.I).toBe(1);
    expect(FPS).toBe(60);
  });
});
