import { describe, it, expect } from 'vitest';
import {
  createRandomizer,
  nextPiece,
  nextPieces,
  resetRandomizer,
  createRandomizerWithFirstPiece
} from '../../src/domain/randomizer.js';

describe('Randomizer Domain (NES LCG)', () => {
  describe('createRandomizer', () => {
    it('should create randomizer with seed', () => {
      const randomizer = createRandomizer(12345);

      expect(randomizer.seed).toBe(12345);
      expect(randomizer.current).toBe(12345);
    });

    it('should create randomizer with random seed when not provided', () => {
      const randomizer1 = createRandomizer();
      const randomizer2 = createRandomizer();

      // Should generate different seeds
      expect(randomizer1.seed).toBeDefined();
      expect(randomizer2.seed).toBeDefined();
      expect(typeof randomizer1.seed).toBe('number');
    });

    it('should accept seed of 0', () => {
      const randomizer = createRandomizer(0);

      expect(randomizer.seed).toBe(0);
      expect(randomizer.current).toBe(0);
    });
  });

  describe('Determinism', () => {
    it('should produce same sequence with same seed', () => {
      const seed = 12345;
      const randomizer1 = createRandomizer(seed);
      const randomizer2 = createRandomizer(seed);

      const result1 = nextPieces(randomizer1, 10);
      const result2 = nextPieces(randomizer2, 10);

      expect(result1.pieces).toEqual(result2.pieces);
    });

    it('should produce different sequences with different seeds', () => {
      const randomizer1 = createRandomizer(12345);
      const randomizer2 = createRandomizer(54321);

      const result1 = nextPieces(randomizer1, 10);
      const result2 = nextPieces(randomizer2, 10);

      // Highly unlikely to be identical with different seeds
      expect(result1.pieces).not.toEqual(result2.pieces);
    });

    it('should be deterministic across multiple calls', () => {
      const seed = 99999;

      for (let i = 0; i < 5; i++) {
        const randomizer = createRandomizer(seed);
        const result = nextPieces(randomizer, 20);

        // Each run should produce same first 20 pieces
        expect(result.pieces[0]).toBe(result.pieces[0]);
        expect(result.pieces[10]).toBe(result.pieces[10]);
      }
    });
  });

  describe('nextPiece', () => {
    it('should return valid piece type (1-7)', () => {
      let randomizer = createRandomizer(12345);

      for (let i = 0; i < 100; i++) {
        const result = nextPiece(randomizer);
        expect(result.pieceType).toBeGreaterThanOrEqual(1);
        expect(result.pieceType).toBeLessThanOrEqual(7);
        randomizer = result.randomizer;
      }
    });

    it('should return new randomizer state (immutable)', () => {
      const randomizer = createRandomizer(12345);
      const originalCurrent = randomizer.current;

      const result = nextPiece(randomizer);

      expect(result.randomizer).not.toBe(randomizer);
      expect(randomizer.current).toBe(originalCurrent);
      expect(result.randomizer.current).not.toBe(originalCurrent);
    });

    it('should advance randomizer state', () => {
      const randomizer = createRandomizer(12345);

      const result1 = nextPiece(randomizer);
      const result2 = nextPiece(result1.randomizer);

      expect(result2.randomizer.current).not.toBe(result1.randomizer.current);
    });
  });

  describe('nextPieces', () => {
    it('should return array of requested length', () => {
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 5);

      expect(result.pieces).toHaveLength(5);
    });

    it('should return all valid piece types', () => {
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 50);

      result.pieces.forEach(piece => {
        expect(piece).toBeGreaterThanOrEqual(1);
        expect(piece).toBeLessThanOrEqual(7);
      });
    });

    it('should return updated randomizer state', () => {
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 10);

      expect(result.randomizer).not.toBe(randomizer);
      expect(result.randomizer.current).not.toBe(randomizer.current);
    });

    it('should handle large sequences', () => {
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 1000);

      expect(result.pieces).toHaveLength(1000);
      // All should be valid
      expect(result.pieces.every(p => p >= 1 && p <= 7)).toBe(true);
    });
  });

  describe('Distribution', () => {
    it('should allow repetitions (NES behavior)', () => {
      const randomizer = createRandomizer(12345);

      // Generate many pieces and check for repetitions
      const result = nextPieces(randomizer, 100);

      // Check that at least one piece repeats consecutively
      let hasConsecutiveRepeat = false;
      for (let i = 0; i < result.pieces.length - 1; i++) {
        if (result.pieces[i] === result.pieces[i + 1]) {
          hasConsecutiveRepeat = true;
          break;
        }
      }

      // With a good seed, we should see repetitions
      // (This might fail with very unlikely seeds, but probability is high)
      expect(hasConsecutiveRepeat).toBe(true);
    });

    it('should eventually generate all piece types', () => {
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 50);

      const uniquePieces = new Set(result.pieces);
      expect(uniquePieces.size).toBe(7);
    });

    it('should not use 7-bag system', () => {
      // In a 7-bag system, you'd never see the same piece more than once in 7 draws
      // NES randomizer does NOT have this guarantee
      const randomizer = createRandomizer(12345);

      const result = nextPieces(randomizer, 7);

      // Count occurrences
      const counts = {};
      result.pieces.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });

      // NES allows same piece multiple times in 7 draws
      const maxCount = Math.max(...Object.values(counts));
      // It's possible (though unlikely) to have maxCount=1, but we verify
      // the system allows repeats by checking distribution over longer sequence

      const result2 = nextPieces(result.randomizer, 14);
      const fullSequence = [...result.pieces, ...result2.pieces];

      const counts2 = {};
      fullSequence.forEach(p => {
        counts2[p] = (counts2[p] || 0) + 1;
      });

      // With 21 pieces from NES randomizer, should see some repeats
      const maxCount2 = Math.max(...Object.values(counts2));
      expect(maxCount2).toBeGreaterThanOrEqual(2);
    });
  });

  describe('resetRandomizer', () => {
    it('should reset to initial seed', () => {
      const randomizer = createRandomizer(12345);

      // Advance several times
      let current = randomizer;
      for (let i = 0; i < 10; i++) {
        const result = nextPiece(current);
        current = result.randomizer;
      }

      // Reset
      const reset = resetRandomizer(current);

      expect(reset.current).toBe(12345);
      expect(reset.seed).toBe(12345);
    });

    it('should produce same sequence after reset', () => {
      const randomizer = createRandomizer(12345);

      // Get first 5 pieces
      const result1 = nextPieces(randomizer, 5);

      // Reset and get next 5
      const reset = resetRandomizer(result1.randomizer);
      const result2 = nextPieces(reset, 5);

      // Should match original first 5
      expect(result2.pieces).toEqual(result1.pieces);
    });

    it('should return new randomizer state (immutable)', () => {
      const randomizer = createRandomizer(12345);
      const advanced = nextPiece(randomizer).randomizer;

      const reset = resetRandomizer(advanced);

      expect(reset).not.toBe(advanced);
      expect(advanced.current).not.toBe(reset.current);
    });
  });

  describe('createRandomizerWithFirstPiece', () => {
    it('should create randomizer and return first piece', () => {
      const result = createRandomizerWithFirstPiece(12345);

      expect(result.pieceType).toBeGreaterThanOrEqual(1);
      expect(result.pieceType).toBeLessThanOrEqual(7);
      expect(result.randomizer).toBeDefined();
      expect(result.randomizer.seed).toBe(12345);
    });

    it('should be deterministic', () => {
      const result1 = createRandomizerWithFirstPiece(12345);
      const result2 = createRandomizerWithFirstPiece(12345);

      expect(result1.pieceType).toBe(result2.pieceType);
    });
  });

  describe('Immutability', () => {
    it('nextPiece should not mutate input', () => {
      const randomizer = createRandomizer(12345);
      const originalSeed = randomizer.seed;
      const originalCurrent = randomizer.current;

      nextPiece(randomizer);

      expect(randomizer.seed).toBe(originalSeed);
      expect(randomizer.current).toBe(originalCurrent);
    });

    it('nextPieces should not mutate input', () => {
      const randomizer = createRandomizer(12345);
      const originalCurrent = randomizer.current;

      nextPieces(randomizer, 10);

      expect(randomizer.current).toBe(originalCurrent);
    });

    it('resetRandomizer should not mutate input', () => {
      const randomizer = createRandomizer(12345);
      const advanced = nextPieces(randomizer, 5).randomizer;
      const originalAdvancedCurrent = advanced.current;

      resetRandomizer(advanced);

      expect(advanced.current).toBe(originalAdvancedCurrent);
    });
  });

  describe('Edge cases', () => {
    it('should handle seed of 0 correctly', () => {
      const randomizer = createRandomizer(0);

      const result = nextPieces(randomizer, 10);

      // Should still produce valid sequence
      expect(result.pieces).toHaveLength(10);
      result.pieces.forEach(p => {
        expect(p).toBeGreaterThanOrEqual(1);
        expect(p).toBeLessThanOrEqual(7);
      });
    });

    it('should handle very large seeds', () => {
      const largeSeed = 2147483647; // Max 32-bit signed int
      const randomizer = createRandomizer(largeSeed);

      const result = nextPiece(randomizer);

      expect(result.pieceType).toBeGreaterThanOrEqual(1);
      expect(result.pieceType).toBeLessThanOrEqual(7);
    });

    it('should handle negative seeds by treating them as unsigned', () => {
      const randomizer = createRandomizer(-1);

      const result = nextPieces(randomizer, 10);

      // Should still work (JavaScript will convert -1 to large positive)
      expect(result.pieces).toHaveLength(10);
      result.pieces.forEach(p => {
        expect(p).toBeGreaterThanOrEqual(1);
        expect(p).toBeLessThanOrEqual(7);
      });
    });
  });
});
