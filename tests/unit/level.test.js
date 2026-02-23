import { describe, it, expect, beforeEach } from 'vitest';
import {
  LINES_PER_LEVEL,
  DEFAULT_START_LEVEL,
  MAX_LEVEL,
  calculateLevel,
  getLinesUntilNextLevel,
  didLevelIncrease,
  createLevelState,
  updateAfterClear,
  getCurrentSpeed,
  getGravityState,
  setLevel,
  resetLevel,
  getLevelInfo,
  validateStartLevel,
  getLevelProgress
} from '../../src/domain/level.js';
import { GRAVITY_TABLE } from '../../src/domain/gravity.js';

describe('Level Domain (NES)', () => {
  describe('Constants', () => {
    it('should have correct lines per level (10)', () => {
      expect(LINES_PER_LEVEL).toBe(10);
    });

    it('should have default start level of 0', () => {
      expect(DEFAULT_START_LEVEL).toBe(0);
    });

    it('should have max level of 99', () => {
      expect(MAX_LEVEL).toBe(99);
    });
  });

  describe('calculateLevel', () => {
    it('should calculate level 0 at start', () => {
      expect(calculateLevel(0, 0)).toBe(0);
      expect(calculateLevel(5, 0)).toBe(0);
      expect(calculateLevel(9, 0)).toBe(0);
    });

    it('should advance to level 1 at 10 lines', () => {
      expect(calculateLevel(10, 0)).toBe(1);
    });

    it('should advance to level 2 at 20 lines', () => {
      expect(calculateLevel(20, 0)).toBe(2);
    });

    it('should calculate correct level for various line counts', () => {
      expect(calculateLevel(0, 0)).toBe(0);
      expect(calculateLevel(9, 0)).toBe(0);
      expect(calculateLevel(10, 0)).toBe(1);
      expect(calculateLevel(19, 0)).toBe(1);
      expect(calculateLevel(20, 0)).toBe(2);
      expect(calculateLevel(29, 0)).toBe(2);
      expect(calculateLevel(30, 0)).toBe(3);
      expect(calculateLevel(99, 0)).toBe(9);
      expect(calculateLevel(100, 0)).toBe(10);
    });

    it('should handle custom start level', () => {
      expect(calculateLevel(0, 5)).toBe(5);
      expect(calculateLevel(5, 5)).toBe(5);
      expect(calculateLevel(10, 5)).toBe(6);
      expect(calculateLevel(20, 5)).toBe(7);
    });

    it('should cap at MAX_LEVEL', () => {
      expect(calculateLevel(1000, 0)).toBe(MAX_LEVEL);
      expect(calculateLevel(2000, 50)).toBe(MAX_LEVEL);
    });

    it('should handle negative lines (treat as 0)', () => {
      expect(calculateLevel(-1, 0)).toBe(0);
      expect(calculateLevel(-10, 0)).toBe(0);
    });

    it('should handle negative start level (treat as 0)', () => {
      expect(calculateLevel(10, -1)).toBe(1);
      expect(calculateLevel(0, -5)).toBe(0);
    });

    it('should handle high start levels correctly', () => {
      expect(calculateLevel(0, 9)).toBe(9);
      expect(calculateLevel(10, 9)).toBe(10);
      expect(calculateLevel(90, 9)).toBe(18);
    });
  });

  describe('getLinesUntilNextLevel', () => {
    it('should return 10 at start', () => {
      expect(getLinesUntilNextLevel(0, 0)).toBe(10);
    });

    it('should decrease as lines are cleared', () => {
      expect(getLinesUntilNextLevel(5, 0)).toBe(5);
      expect(getLinesUntilNextLevel(9, 0)).toBe(1);
    });

    it('should return 10 at exact level boundaries', () => {
      expect(getLinesUntilNextLevel(10, 0)).toBe(10);
      expect(getLinesUntilNextLevel(20, 0)).toBe(10);
      expect(getLinesUntilNextLevel(30, 0)).toBe(10);
    });

    it('should handle custom start level', () => {
      expect(getLinesUntilNextLevel(0, 5)).toBe(10);
      expect(getLinesUntilNextLevel(52, 5)).toBe(8); // Level 5 + 2 lines
    });

    it('should handle negative lines', () => {
      expect(getLinesUntilNextLevel(-5, 0)).toBe(10);
    });
  });

  describe('didLevelIncrease', () => {
    it('should detect level increase', () => {
      expect(didLevelIncrease(9, 10, 0)).toBe(true);
      expect(didLevelIncrease(19, 20, 0)).toBe(true);
      expect(didLevelIncrease(99, 100, 0)).toBe(true);
    });

    it('should return false when level unchanged', () => {
      expect(didLevelIncrease(5, 6, 0)).toBe(false);
      expect(didLevelIncrease(9, 9, 0)).toBe(false);
      expect(didLevelIncrease(10, 19, 0)).toBe(false);
    });

    it('should handle multiple lines clearing', () => {
      expect(didLevelIncrease(8, 12, 0)).toBe(true);  // 8 -> 12 crosses level boundary
      expect(didLevelIncrease(18, 22, 0)).toBe(true); // 18 -> 22 crosses level boundary
    });
  });

  describe('createLevelState', () => {
    it('should create level 0 state by default', () => {
      const level = createLevelState();

      expect(level.currentLevel).toBe(0);
      expect(level.startLevel).toBe(0);
      expect(level.totalLines).toBe(0);
      expect(level.linesUntilNext).toBe(10);
      expect(level.gravity).toBeDefined();
      expect(level.gravity.level).toBe(0);
    });

    it('should create level state with custom start', () => {
      const level = createLevelState(5);

      expect(level.currentLevel).toBe(5);
      expect(level.startLevel).toBe(5);
      expect(level.gravity.level).toBe(5);
    });

    it('should clamp negative start level to 0', () => {
      const level = createLevelState(-5);

      expect(level.currentLevel).toBe(0);
      expect(level.startLevel).toBe(0);
    });

    it('should clamp high start level to MAX_LEVEL', () => {
      const level = createLevelState(150);

      expect(level.currentLevel).toBe(MAX_LEVEL);
      expect(level.startLevel).toBe(MAX_LEVEL);
    });
  });

  describe('updateAfterClear', () => {
    it('should update lines and check for level up', () => {
      let level = createLevelState();
      const result = updateAfterClear(level, 1);

      expect(result.levelState.totalLines).toBe(1);
      expect(result.levelState.linesUntilNext).toBe(9);
      expect(result.leveledUp).toBe(false);
    });

    it('should detect level up at 10 lines', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 9 };

      const result = updateAfterClear(level, 1);

      expect(result.leveledUp).toBe(true);
      expect(result.previousLevel).toBe(0);
      expect(result.levelState.currentLevel).toBe(1);
    });

    it('should update gravity on level up', () => {
      let level = createLevelState(0);
      level = { ...level, totalLines: 9 };

      const result = updateAfterClear(level, 1);

      // Level 0: 48 frames, Level 1: 43 frames
      expect(result.levelState.gravity.framesPerDrop).toBe(43);
    });

    it('should not change gravity when no level up', () => {
      let level = createLevelState();

      const result = updateAfterClear(level, 2);

      expect(result.leveledUp).toBe(false);
      expect(result.levelState.gravity.framesPerDrop).toBe(48); // Still level 0 speed
    });

    it('should handle multiple lines clearing causing level up', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 8 };

      const result = updateAfterClear(level, 4); // Tetris at 8 lines

      expect(result.leveledUp).toBe(true);
      expect(result.levelState.currentLevel).toBe(1);
      expect(result.levelState.totalLines).toBe(12);
    });

    it('should handle multiple level ups (rare but possible)', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 8 };

      const result = updateAfterClear(level, 25); // Very rare but possible

      expect(result.leveledUp).toBe(true);
      expect(result.levelState.totalLines).toBe(33);
    });
  });

  describe('getCurrentSpeed', () => {
    it('should return correct speed for level 0', () => {
      const level = createLevelState(0);
      expect(getCurrentSpeed(level)).toBe(48);
    });

    it('should return correct speed for level 9', () => {
      const level = createLevelState(9);
      expect(getCurrentSpeed(level)).toBe(6);
    });

    it('should return correct speed for level 20', () => {
      const level = createLevelState(20);
      expect(getCurrentSpeed(level)).toBe(2);
    });
  });

  describe('getGravityState', () => {
    it('should return gravity state', () => {
      const level = createLevelState(5);
      const gravity = getGravityState(level);

      expect(gravity).toBeDefined();
      expect(gravity.level).toBe(5);
    });
  });

  describe('setLevel', () => {
    it('should set level directly', () => {
      let level = createLevelState(0);
      level = setLevel(level, 5);

      expect(level.currentLevel).toBe(5);
    });

    it('should update gravity when setting level', () => {
      let level = createLevelState(0);
      level = setLevel(level, 9);

      expect(level.gravity.framesPerDrop).toBe(6);
    });

    it('should clamp negative level', () => {
      let level = createLevelState(0);
      level = setLevel(level, -5);

      expect(level.currentLevel).toBe(0);
    });

    it('should clamp level above MAX_LEVEL', () => {
      let level = createLevelState(0);
      level = setLevel(level, 150);

      expect(level.currentLevel).toBe(MAX_LEVEL);
    });
  });

  describe('resetLevel', () => {
    it('should reset to level 0', () => {
      let level = createLevelState(5);
      level = resetLevel();

      expect(level.currentLevel).toBe(0);
      expect(level.totalLines).toBe(0);
    });

    it('should reset to custom start level', () => {
      const level = resetLevel(9);

      expect(level.currentLevel).toBe(9);
    });
  });

  describe('getLevelInfo', () => {
    it('should return level info object', () => {
      let level = createLevelState(5);
      level = { ...level, totalLines: 52 };
      level.linesUntilNext = 8;

      const info = getLevelInfo(level);

      expect(info.current).toBe(5);
      expect(info.start).toBe(5);
      expect(info.totalLines).toBe(52);
      expect(info.linesUntilNext).toBe(8);
      expect(info.speed).toBe(23); // Level 5 speed
      expect(info.speedLabel).toBe('Slow');
    });

    it('should return correct speed labels for all ranges', () => {
      // Very Slow (48+ frames)
      let level0 = createLevelState(0);
      expect(getLevelInfo(level0).speedLabel).toBe('Very Slow');

      // Slow (20-47 frames) - Level 5 has 23 frames
      let level5 = createLevelState(5);
      expect(getLevelInfo(level5).speedLabel).toBe('Slow');

      // Normal (10-19 frames) - Level 8 has 8 frames, Level 7 has 13
      let level7 = createLevelState(7);
      expect(getLevelInfo(level7).speedLabel).toBe('Normal');

      // Fast (6-9 frames) - Level 9 has 6 frames
      let level9 = createLevelState(9);
      expect(getLevelInfo(level9).speedLabel).toBe('Fast');

      // Very Fast (4-5 frames) - Level 13 has 4 frames
      let level13 = createLevelState(13);
      expect(getLevelInfo(level13).speedLabel).toBe('Very Fast');

      // Extreme (0-3 frames) - Level 19 has 2 frames
      let level19 = createLevelState(19);
      expect(getLevelInfo(level19).speedLabel).toBe('Extreme');
    });
  });

  describe('validateStartLevel', () => {
    it('should accept valid levels', () => {
      expect(validateStartLevel(0)).toBe(0);
      expect(validateStartLevel(5)).toBe(5);
      expect(validateStartLevel(9)).toBe(9);
      expect(validateStartLevel(99)).toBe(99);
    });

    it('should clamp negative levels', () => {
      expect(validateStartLevel(-1)).toBe(0);
      expect(validateStartLevel(-10)).toBe(0);
    });

    it('should clamp levels above MAX_LEVEL', () => {
      expect(validateStartLevel(100)).toBe(99);
      expect(validateStartLevel(999)).toBe(99);
    });
  });

  describe('getLevelProgress', () => {
    it('should return 0 at level start', () => {
      const level = createLevelState();
      expect(getLevelProgress(level)).toBe(0);
    });

    it('should return 50% at 5 lines', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 5 };

      expect(getLevelProgress(level)).toBe(50);
    });

    it('should return 90% at 9 lines', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 9 };

      expect(getLevelProgress(level)).toBe(90);
    });

    it('should return 0 at exact level boundary', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 10 };

      expect(getLevelProgress(level)).toBe(0);
    });

    it('should handle lines across levels', () => {
      let level = createLevelState();
      level = { ...level, totalLines: 15 };

      expect(getLevelProgress(level)).toBe(50); // 5 lines into level 1
    });
  });

  describe('NES level progression accuracy', () => {
    it('should match NES progression (every 10 lines)', () => {
      // Level 0: 0-9 lines
      expect(calculateLevel(0, 0)).toBe(0);
      expect(calculateLevel(9, 0)).toBe(0);

      // Level 1: 10-19 lines
      expect(calculateLevel(10, 0)).toBe(1);
      expect(calculateLevel(19, 0)).toBe(1);

      // Level 2: 20-29 lines
      expect(calculateLevel(20, 0)).toBe(2);
      expect(calculateLevel(29, 0)).toBe(2);
    });

    it('should match NES level select behavior', () => {
      // Starting at level 9 (common for competitive play)
      expect(calculateLevel(0, 9)).toBe(9);
      expect(calculateLevel(10, 9)).toBe(10);

      // Starting at level 19 (killscreen practice)
      expect(calculateLevel(0, 19)).toBe(19);
      expect(calculateLevel(10, 19)).toBe(20);
    });

    it('should cap gravity at level 20', () => {
      // Gravity table caps at level 20
      const level0 = createLevelState(0);
      const level20 = createLevelState(20);
      const level50 = createLevelState(50);

      expect(getCurrentSpeed(level0)).toBe(48);
      expect(getCurrentSpeed(level20)).toBe(2);
      expect(getCurrentSpeed(level50)).toBe(2); // Still 2 frames
    });
  });

  describe('Immutability', () => {
    it('updateAfterClear should not mutate input', () => {
      const level = createLevelState();
      const originalLines = level.totalLines;

      updateAfterClear(level, 1);

      expect(level.totalLines).toBe(originalLines);
    });

    it('setLevel should not mutate input', () => {
      const level = createLevelState(0);
      const originalLevel = level.currentLevel;

      setLevel(level, 5);

      expect(level.currentLevel).toBe(originalLevel);
    });
  });
});
