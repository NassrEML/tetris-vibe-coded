import { describe, it, expect } from 'vitest';
import {
  GRAVITY_TABLE,
  getGravityForLevel,
  createGravity,
  tick,
  tickMultiple,
  updateLevel,
  resetCounter,
  getCurrentSpeed,
  getFramesUntilFall,
  FPS
} from '../../src/domain/gravity.js';

describe('Gravity Domain (NES)', () => {
  describe('Constants', () => {
    it('should have FPS constant', () => {
      expect(FPS).toBe(60);
    });

    it('should have gravity table with 21 entries (levels 0-20)', () => {
      expect(GRAVITY_TABLE).toHaveLength(21);
    });

    it('should have correct level 0 gravity (48 frames)', () => {
      expect(GRAVITY_TABLE[0]).toBe(48);
    });

    it('should have correct level 20 gravity (2 frames)', () => {
      expect(GRAVITY_TABLE[20]).toBe(2);
    });

    it('gravity table should decrease as level increases', () => {
      // Generally, speed should increase (frames decrease)
      for (let i = 0; i < GRAVITY_TABLE.length - 1; i++) {
        expect(GRAVITY_TABLE[i]).toBeGreaterThanOrEqual(GRAVITY_TABLE[i + 1]);
      }
    });
  });

  describe('getGravityForLevel', () => {
    it('should return correct frames for level 0', () => {
      expect(getGravityForLevel(0)).toBe(48);
    });

    it('should return correct frames for level 9', () => {
      expect(getGravityForLevel(9)).toBe(6);
    });

    it('should return correct frames for level 20', () => {
      expect(getGravityForLevel(20)).toBe(2);
    });

    it('should clamp negative levels to 0', () => {
      expect(getGravityForLevel(-1)).toBe(48);
      expect(getGravityForLevel(-10)).toBe(48);
    });

    it('should clamp levels above 20 to 20', () => {
      expect(getGravityForLevel(21)).toBe(2);
      expect(getGravityForLevel(100)).toBe(2);
    });
  });

  describe('createGravity', () => {
    it('should create gravity with default level 0', () => {
      const gravity = createGravity();

      expect(gravity.level).toBe(0);
      expect(gravity.framesPerDrop).toBe(48);
      expect(gravity.frameCounter).toBe(0);
    });

    it('should create gravity with specified level', () => {
      const gravity = createGravity(10);

      expect(gravity.level).toBe(10);
      expect(gravity.framesPerDrop).toBe(5);
      expect(gravity.frameCounter).toBe(0);
    });

    it('should handle negative level (clamped)', () => {
      const gravity = createGravity(-5);

      expect(gravity.level).toBe(-5); // Level is stored as-is
      expect(gravity.framesPerDrop).toBe(48); // But speed is clamped
    });
  });

  describe('tick', () => {
    it('should increment frame counter', () => {
      const gravity = createGravity(0);

      const result = tick(gravity);

      expect(result.gravity.frameCounter).toBe(1);
      expect(result.shouldFall).toBe(false);
    });

    it('should trigger fall when counter reaches framesPerDrop', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 47; // 48 frames per drop at level 0

      const result = tick(gravity);

      expect(result.shouldFall).toBe(true);
      expect(result.gravity.frameCounter).toBe(0); // Reset after fall
    });

    it('should not trigger fall before reaching framesPerDrop', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 46;

      const result = tick(gravity);

      expect(result.shouldFall).toBe(false);
      expect(result.gravity.frameCounter).toBe(47);
    });

    it('should return new gravity state (immutable)', () => {
      const gravity = createGravity(0);
      const originalCounter = gravity.frameCounter;

      const result = tick(gravity);

      expect(result.gravity).not.toBe(gravity);
      expect(gravity.frameCounter).toBe(originalCounter);
    });

    it('should handle fast levels correctly', () => {
      const gravity = createGravity(20); // 2 frames per drop
      gravity.frameCounter = 1;

      const result = tick(gravity);

      expect(result.shouldFall).toBe(true);
      expect(result.gravity.frameCounter).toBe(0);
    });

    it('should handle level 0 speed correctly', () => {
      const gravity = createGravity(0); // 48 frames per drop

      // Tick 47 times - should not fall
      let result;
      let current = gravity;
      for (let i = 0; i < 47; i++) {
        result = tick(current);
        expect(result.shouldFall).toBe(false);
        current = result.gravity;
      }

      // 48th tick should trigger fall
      result = tick(current);
      expect(result.shouldFall).toBe(true);
    });
  });

  describe('tickMultiple', () => {
    it('should tick multiple times and count falls', () => {
      const gravity = createGravity(0); // 48 frames per drop

      // 96 frames = 2 falls
      const result = tickMultiple(gravity, 96);

      expect(result.fallCount).toBe(2);
      expect(result.gravity.frameCounter).toBe(0);
    });

    it('should handle partial drop', () => {
      const gravity = createGravity(0); // 48 frames per drop

      // 50 frames = 1 full drop + 2 frames
      const result = tickMultiple(gravity, 50);

      expect(result.fallCount).toBe(1);
      expect(result.gravity.frameCounter).toBe(2);
    });

    it('should handle 0 ticks', () => {
      const gravity = createGravity(0);

      const result = tickMultiple(gravity, 0);

      expect(result.fallCount).toBe(0);
      expect(result.gravity.frameCounter).toBe(0);
    });

    it('should return new gravity state (immutable)', () => {
      const gravity = createGravity(0);
      const originalCounter = gravity.frameCounter;

      tickMultiple(gravity, 10);

      expect(gravity.frameCounter).toBe(originalCounter);
    });
  });

  describe('updateLevel', () => {
    it('should update level and framesPerDrop', () => {
      const gravity = createGravity(0);

      const newGravity = updateLevel(gravity, 10);

      expect(newGravity.level).toBe(10);
      expect(newGravity.framesPerDrop).toBe(5);
    });

    it('should reset frame counter', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 25;

      const newGravity = updateLevel(gravity, 5);

      expect(newGravity.frameCounter).toBe(0);
    });

    it('should return new gravity state (immutable)', () => {
      const gravity = createGravity(0);
      const originalLevel = gravity.level;

      updateLevel(gravity, 10);

      expect(gravity.level).toBe(originalLevel);
    });

    it('should handle level 20+ correctly', () => {
      const gravity = createGravity(0);

      const newGravity = updateLevel(gravity, 25);

      expect(newGravity.level).toBe(25);
      expect(newGravity.framesPerDrop).toBe(2); // Clamped to max
    });
  });

  describe('resetCounter', () => {
    it('should reset frame counter to 0', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 30;

      const newGravity = resetCounter(gravity);

      expect(newGravity.frameCounter).toBe(0);
    });

    it('should preserve level and speed', () => {
      const gravity = createGravity(10);
      gravity.frameCounter = 3;

      const newGravity = resetCounter(gravity);

      expect(newGravity.level).toBe(10);
      expect(newGravity.framesPerDrop).toBe(5);
    });

    it('should return new gravity state (immutable)', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 20;
      const originalCounter = gravity.frameCounter;

      resetCounter(gravity);

      expect(gravity.frameCounter).toBe(originalCounter);
    });
  });

  describe('getCurrentSpeed', () => {
    it('should return frames per drop for level 0', () => {
      const gravity = createGravity(0);

      expect(getCurrentSpeed(gravity)).toBe(48);
    });

    it('should return frames per drop for level 10', () => {
      const gravity = createGravity(10);

      expect(getCurrentSpeed(gravity)).toBe(5);
    });

    it('should return frames per drop for level 20', () => {
      const gravity = createGravity(20);

      expect(getCurrentSpeed(gravity)).toBe(2);
    });
  });

  describe('getFramesUntilFall', () => {
    it('should return full frames when counter is 0', () => {
      const gravity = createGravity(0);

      expect(getFramesUntilFall(gravity)).toBe(48);
    });

    it('should return remaining frames', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 20;

      expect(getFramesUntilFall(gravity)).toBe(28);
    });

    it('should return 0 when counter matches speed', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 48;

      expect(getFramesUntilFall(gravity)).toBe(0);
    });
  });

  describe('Level progression timing', () => {
    it('level 0 should be slowest (48 frames)', () => {
      const gravity = createGravity(0);
      expect(gravity.framesPerDrop).toBe(48);
    });

    it('level 1 should be slightly faster (43 frames)', () => {
      const gravity = createGravity(1);
      expect(gravity.framesPerDrop).toBe(43);
    });

    it('level 9 should be much faster (6 frames)', () => {
      const gravity = createGravity(9);
      expect(gravity.framesPerDrop).toBe(6);
    });

    it('level 10-12 should be 5 frames', () => {
      expect(createGravity(10).framesPerDrop).toBe(5);
      expect(createGravity(11).framesPerDrop).toBe(5);
      expect(createGravity(12).framesPerDrop).toBe(5);
    });

    it('level 13-15 should be 4 frames', () => {
      expect(createGravity(13).framesPerDrop).toBe(4);
      expect(createGravity(14).framesPerDrop).toBe(4);
      expect(createGravity(15).framesPerDrop).toBe(4);
    });

    it('level 16-18 should be 3 frames', () => {
      expect(createGravity(16).framesPerDrop).toBe(3);
      expect(createGravity(17).framesPerDrop).toBe(3);
      expect(createGravity(18).framesPerDrop).toBe(3);
    });

    it('level 19+ should be 2 frames', () => {
      expect(createGravity(19).framesPerDrop).toBe(2);
      expect(createGravity(20).framesPerDrop).toBe(2);
      expect(createGravity(99).framesPerDrop).toBe(2);
    });
  });

  describe('Frame-based determinism', () => {
    it('should produce same fall pattern for same number of ticks', () => {
      const gravity1 = createGravity(5); // 23 frames per drop
      const gravity2 = createGravity(5);

      const result1 = tickMultiple(gravity1, 100);
      const result2 = tickMultiple(gravity2, 100);

      expect(result1.fallCount).toBe(result2.fallCount);
      expect(result1.gravity.frameCounter).toBe(result2.gravity.frameCounter);
    });

    it('timing should be independent of performance', () => {
      // This verifies the tick-based approach
      const gravity = createGravity(10); // 5 frames per drop

      // Simulate slow frame rate (variable timing)
      let current = gravity;
      let fallCount = 0;

      // Even with "variable" timing, we tick once per call
      for (let i = 0; i < 60; i++) {
        const result = tick(current);
        if (result.shouldFall) fallCount++;
        current = result.gravity;
      }

      // At 5 frames per drop, 60 frames = 12 drops
      expect(fallCount).toBe(12);
    });
  });

  describe('Immutability', () => {
    it('tick should not mutate input', () => {
      const gravity = createGravity(0);
      const original = { ...gravity };

      tick(gravity);

      expect(gravity.frameCounter).toBe(original.frameCounter);
      expect(gravity.level).toBe(original.level);
      expect(gravity.framesPerDrop).toBe(original.framesPerDrop);
    });

    it('tickMultiple should not mutate input', () => {
      const gravity = createGravity(0);
      const original = { ...gravity };

      tickMultiple(gravity, 50);

      expect(gravity.frameCounter).toBe(original.frameCounter);
      expect(gravity.level).toBe(original.level);
    });

    it('updateLevel should not mutate input', () => {
      const gravity = createGravity(0);
      const original = { ...gravity };

      updateLevel(gravity, 10);

      expect(gravity.level).toBe(original.level);
      expect(gravity.framesPerDrop).toBe(original.framesPerDrop);
    });

    it('resetCounter should not mutate input', () => {
      const gravity = createGravity(0);
      gravity.frameCounter = 20;
      const originalCounter = gravity.frameCounter;

      resetCounter(gravity);

      expect(gravity.frameCounter).toBe(originalCounter);
    });
  });
});
