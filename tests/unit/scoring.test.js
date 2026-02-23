import { describe, it, expect, beforeEach } from 'vitest';
import {
  SCORE_TABLE,
  SOFT_DROP_POINTS,
  HARD_DROP_POINTS,
  calculateLineClearScore,
  calculateSoftDropScore,
  createScoreState,
  addLineClearScore,
  addSoftDropScore,
  resetScore,
  getTotalScore,
  getTotalLines,
  getTetrisCount,
  getScoreBreakdown,
  createHighScoreState,
  addHighScore,
  isHighScore
} from '../../src/domain/scoring.js';

describe('Scoring Domain (NES)', () => {
  describe('Constants', () => {
    it('should have correct NES score table', () => {
      expect(SCORE_TABLE[1]).toBe(40);
      expect(SCORE_TABLE[2]).toBe(100);
      expect(SCORE_TABLE[3]).toBe(300);
      expect(SCORE_TABLE[4]).toBe(1200);
    });

    it('should have soft drop points (1 per cell)', () => {
      expect(SOFT_DROP_POINTS).toBe(1);
    });

    it('should have hard drop points set to 0 (NES does not have hard drop)', () => {
      expect(HARD_DROP_POINTS).toBe(0);
    });
  });

  describe('calculateLineClearScore', () => {
    it('should calculate single line score correctly', () => {
      expect(calculateLineClearScore(1, 0)).toBe(40);   // Level 0: 40 × 1
      expect(calculateLineClearScore(1, 1)).toBe(80);   // Level 1: 40 × 2
      expect(calculateLineClearScore(1, 5)).toBe(240); // Level 5: 40 × 6
      expect(calculateLineClearScore(1, 9)).toBe(400); // Level 9: 40 × 10
    });

    it('should calculate double line score correctly', () => {
      expect(calculateLineClearScore(2, 0)).toBe(100);  // Level 0: 100 × 1
      expect(calculateLineClearScore(2, 1)).toBe(200);  // Level 1: 100 × 2
      expect(calculateLineClearScore(2, 5)).toBe(600);  // Level 5: 100 × 6
    });

    it('should calculate triple line score correctly', () => {
      expect(calculateLineClearScore(3, 0)).toBe(300);   // Level 0: 300 × 1
      expect(calculateLineClearScore(3, 1)).toBe(600);   // Level 1: 300 × 2
      expect(calculateLineClearScore(3, 5)).toBe(1800);  // Level 5: 300 × 6
    });

    it('should calculate tetris score correctly', () => {
      expect(calculateLineClearScore(4, 0)).toBe(1200);  // Level 0: 1200 × 1
      expect(calculateLineClearScore(4, 1)).toBe(2400);  // Level 1: 1200 × 2
      expect(calculateLineClearScore(4, 5)).toBe(7200);  // Level 5: 1200 × 6
      expect(calculateLineClearScore(4, 9)).toBe(12000);  // Level 9: 1200 × 10
    });

    it('should return 0 for invalid line count', () => {
      expect(calculateLineClearScore(0, 0)).toBe(0);
      expect(calculateLineClearScore(5, 0)).toBe(0);
      expect(calculateLineClearScore(-1, 0)).toBe(0);
      expect(calculateLineClearScore(null, 0)).toBe(0);
      expect(calculateLineClearScore(undefined, 0)).toBe(0);
      expect(calculateLineClearScore(3.5, 0)).toBe(0); // Not in SCORE_TABLE
    });

    it('should handle negative level (treat as 0)', () => {
      expect(calculateLineClearScore(1, -1)).toBe(40);
      expect(calculateLineClearScore(4, -5)).toBe(1200);
    });

    it('should handle high levels correctly', () => {
      expect(calculateLineClearScore(4, 20)).toBe(25200);  // Level 20: 1200 × 21
      expect(calculateLineClearScore(1, 99)).toBe(4000);   // Level 99: 40 × 100
    });
  });

  describe('calculateSoftDropScore', () => {
    it('should calculate soft drop score (1 point per cell)', () => {
      expect(calculateSoftDropScore(1)).toBe(1);
      expect(calculateSoftDropScore(5)).toBe(5);
      expect(calculateSoftDropScore(10)).toBe(10);
      expect(calculateSoftDropScore(20)).toBe(20);
    });

    it('should return 0 for no drop', () => {
      expect(calculateSoftDropScore(0)).toBe(0);
    });

    it('should return 0 for negative drop', () => {
      expect(calculateSoftDropScore(-1)).toBe(0);
    });
  });

  describe('createScoreState', () => {
    it('should create initial score state', () => {
      const score = createScoreState();

      expect(score.totalScore).toBe(0);
      expect(score.linesCleared).toBe(0);
      expect(score.tetrises).toBe(0);
      expect(score.softDropCells).toBe(0);
      expect(score.softDropScore).toBe(0);
      expect(score.lastClearScore).toBe(0);
      expect(score.highScore).toBe(0);
    });
  });

  describe('addLineClearScore', () => {
    it('should add single line score', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 1, 0);

      expect(score.totalScore).toBe(40);
      expect(score.linesCleared).toBe(1);
      expect(score.tetrises).toBe(0);
      expect(score.lastClearScore).toBe(40);
    });

    it('should add tetris score', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 4, 0);

      expect(score.totalScore).toBe(1200);
      expect(score.linesCleared).toBe(4);
      expect(score.tetrises).toBe(1);
      expect(score.lastClearScore).toBe(1200);
    });

    it('should accumulate multiple clears', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 2, 0);  // 100
      score = addLineClearScore(score, 2, 0);  // 100
      score = addLineClearScore(score, 4, 0); // 1200

      expect(score.totalScore).toBe(1400);
      expect(score.linesCleared).toBe(8);
      expect(score.tetrises).toBe(1);
    });

    it('should update high score when total increases', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 4, 0);

      expect(score.highScore).toBe(1200);
    });

    it('should update high score when total increases', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 4, 0);

      expect(score.highScore).toBe(1200);
    });
  });

  describe('addSoftDropScore', () => {
    it('should add soft drop score', () => {
      let score = createScoreState();
      score = addSoftDropScore(score, 5);

      expect(score.totalScore).toBe(5);
      expect(score.softDropCells).toBe(5);
      expect(score.softDropScore).toBe(5);
    });

    it('should accumulate soft drops', () => {
      let score = createScoreState();
      score = addSoftDropScore(score, 3);
      score = addSoftDropScore(score, 7);

      expect(score.totalScore).toBe(10);
      expect(score.softDropCells).toBe(10);
      expect(score.softDropScore).toBe(10);
    });

    it('should combine with line clear score', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 1, 0);  // 40 points
      score = addSoftDropScore(score, 5);      // 5 points

      expect(score.totalScore).toBe(45);
    });
  });

  describe('resetScore', () => {
    it('should reset score to initial state', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 4, 0);
      score = addSoftDropScore(score, 10);

      score = resetScore();

      expect(score.totalScore).toBe(0);
      expect(score.linesCleared).toBe(0);
      expect(score.tetrises).toBe(0);
    });
  });

  describe('getTotalScore', () => {
    it('should return total score', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 1, 0);

      expect(getTotalScore(score)).toBe(40);
    });
  });

  describe('getTotalLines', () => {
    it('should return total lines cleared', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 2, 0);
      score = addLineClearScore(score, 3, 0);

      expect(getTotalLines(score)).toBe(5);
    });
  });

  describe('getTetrisCount', () => {
    it('should return tetris count', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 4, 0);
      score = addLineClearScore(score, 4, 0);

      expect(getTetrisCount(score)).toBe(2);
    });
  });

  describe('getScoreBreakdown', () => {
    it('should return score breakdown', () => {
      let score = createScoreState();
      score = addLineClearScore(score, 1, 0);  // 40
      score = addSoftDropScore(score, 5);      // 5

      const breakdown = getScoreBreakdown(score);

      expect(breakdown.lineClears).toBe(40);
      expect(breakdown.softDrops).toBe(5);
      expect(breakdown.total).toBe(45);
    });
  });

  describe('createHighScoreState', () => {
    it('should create high score state', () => {
      const highScore = createHighScoreState();

      expect(highScore.scores).toEqual([]);
      expect(highScore.maxEntries).toBe(10);
    });
  });

  describe('addHighScore', () => {
    it('should add score to list', () => {
      let highScore = createHighScoreState();
      const entry = { name: 'AAA', score: 10000, lines: 40, level: 5 };

      highScore = addHighScore(highScore, entry);

      expect(highScore.scores).toHaveLength(1);
      expect(highScore.scores[0]).toEqual(entry);
    });

    it('should sort scores descending', () => {
      let highScore = createHighScoreState();
      highScore = addHighScore(highScore, { name: 'BBB', score: 5000 });
      highScore = addHighScore(highScore, { name: 'AAA', score: 10000 });
      highScore = addHighScore(highScore, { name: 'CCC', score: 3000 });

      expect(highScore.scores[0].name).toBe('AAA');
      expect(highScore.scores[1].name).toBe('BBB');
      expect(highScore.scores[2].name).toBe('CCC');
    });

    it('should limit to max entries', () => {
      let highScore = createHighScoreState();

      // Add 12 scores
      for (let i = 0; i < 12; i++) {
        highScore = addHighScore(highScore, { 
          name: `PLR${i}`, 
          score: (12 - i) * 1000 
        });
      }

      expect(highScore.scores).toHaveLength(10);
    });
  });

  describe('isHighScore', () => {
    it('should return true when list not full', () => {
      const highScore = createHighScoreState();
      expect(isHighScore(highScore, 100)).toBe(true);
    });

    it('should return true when score beats lowest', () => {
      let highScore = createHighScoreState();
      for (let i = 0; i < 10; i++) {
        highScore = addHighScore(highScore, { name: 'TST', score: (i + 1) * 1000 });
      }

      expect(isHighScore(highScore, 15000)).toBe(true);
    });

    it('should return false when score does not beat lowest', () => {
      let highScore = createHighScoreState();
      for (let i = 0; i < 10; i++) {
        highScore = addHighScore(highScore, { name: 'TST', score: (i + 1) * 1000 });
      }

      expect(isHighScore(highScore, 500)).toBe(false);
    });
  });

  describe('NES scoring accuracy', () => {
    it('should match known NES scoring values', () => {
      // Level 0
      expect(calculateLineClearScore(1, 0)).toBe(40);
      expect(calculateLineClearScore(2, 0)).toBe(100);
      expect(calculateLineClearScore(3, 0)).toBe(300);
      expect(calculateLineClearScore(4, 0)).toBe(1200);

      // Level 9 (common scoring showcase level)
      expect(calculateLineClearScore(1, 9)).toBe(400);
      expect(calculateLineClearScore(2, 9)).toBe(1000);
      expect(calculateLineClearScore(3, 9)).toBe(3000);
      expect(calculateLineClearScore(4, 9)).toBe(12000);
    });

    it('should properly multiply by level + 1', () => {
      // NES multiplies by (level + 1), not just level
      for (let level = 0; level <= 20; level++) {
        const multiplier = level + 1;
        expect(calculateLineClearScore(1, level)).toBe(40 * multiplier);
        expect(calculateLineClearScore(2, level)).toBe(100 * multiplier);
        expect(calculateLineClearScore(3, level)).toBe(300 * multiplier);
        expect(calculateLineClearScore(4, level)).toBe(1200 * multiplier);
      }
    });
  });

  describe('Immutability', () => {
    it('addLineClearScore should not mutate input', () => {
      const score = createScoreState();
      const originalTotal = score.totalScore;

      addLineClearScore(score, 1, 0);

      expect(score.totalScore).toBe(originalTotal);
    });

    it('addSoftDropScore should not mutate input', () => {
      const score = createScoreState();
      const originalSoftDrops = score.softDropCells;

      addSoftDropScore(score, 5);

      expect(score.softDropCells).toBe(originalSoftDrops);
    });

    it('addHighScore should not mutate input', () => {
      const highScore = createHighScoreState();
      const originalLength = highScore.scores.length;

      addHighScore(highScore, { name: 'TST', score: 1000 });

      expect(highScore.scores.length).toBe(originalLength);
    });
  });
});
