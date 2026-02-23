/**
 * Scoring module - NES Tetris scoring system
 * NES scoring table with level multipliers
 * Soft drop scoring: 1 point per cell dropped
 */

/**
 * NES Tetris base score table (before level multiplication)
 * Source: NES Tetris 1989 scoring
 */
export const SCORE_TABLE = {
  1: 40,    // Single
  2: 100,   // Double
  3: 300,   // Triple
  4: 1200   // Tetris
};

/**
 * Points per cell for soft drop
 */
export const SOFT_DROP_POINTS = 1;

/**
 * Points per cell for hard drop (NES doesn't have hard drop, but defined for completeness)
 * NES Tetris 1989 does NOT have hard drop
 */
export const HARD_DROP_POINTS = 0; // Not used in NES

/**
 * Calculates score for line clears
 * NES formula: base_score × level
 * 
 * @param {number} linesCleared - Number of lines cleared (1-4)
 * @param {number} level - Current level (0+)
 * @returns {number} Score earned
 */
export function calculateLineClearScore(linesCleared, level) {
  // Validate inputs
  if (!linesCleared || linesCleared < 1 || linesCleared > 4) {
    return 0;
  }

  if (level < 0) {
    level = 0;
  }

  const baseScore = SCORE_TABLE[linesCleared];
  if (!baseScore) {
    return 0;
  }

  return baseScore * (level + 1);
}

/**
 * Calculates soft drop score
 * NES: 1 point per cell soft dropped
 * 
 * @param {number} cellsDropped - Number of cells soft dropped
 * @returns {number} Score earned
 */
export function calculateSoftDropScore(cellsDropped) {
  if (cellsDropped <= 0) {
    return 0;
  }

  return cellsDropped * SOFT_DROP_POINTS;
}

/**
 * Creates initial score state
 * @returns {Object} Score state object
 */
export function createScoreState() {
  return {
    totalScore: 0,
    linesCleared: 0,
    tetrises: 0,
    softDropCells: 0,
    softDropScore: 0,
    lastClearScore: 0,
    highScore: 0
  };
}

/**
 * Adds line clear score to total
 * 
 * @param {Object} scoreState - Current score state
 * @param {number} linesCleared - Number of lines cleared (1-4)
 * @param {number} level - Current level
 * @returns {Object} New score state with updated totals
 */
export function addLineClearScore(scoreState, linesCleared, level) {
  const points = calculateLineClearScore(linesCleared, level);

  const newTotalScore = scoreState.totalScore + points;
  const newLinesCleared = scoreState.linesCleared + linesCleared;
  const newTetrises = scoreState.tetrises + (linesCleared === 4 ? 1 : 0);

  return {
    ...scoreState,
    totalScore: newTotalScore,
    linesCleared: newLinesCleared,
    tetrises: newTetrises,
    lastClearScore: points,
    highScore: Math.max(newTotalScore, scoreState.highScore)
  };
}

/**
 * Adds soft drop score to total
 * 
 * @param {Object} scoreState - Current score state
 * @param {number} cellsDropped - Number of cells soft dropped
 * @returns {Object} New score state with updated totals
 */
export function addSoftDropScore(scoreState, cellsDropped) {
  const points = calculateSoftDropScore(cellsDropped);

  return {
    ...scoreState,
    totalScore: scoreState.totalScore + points,
    softDropCells: scoreState.softDropCells + cellsDropped,
    softDropScore: scoreState.softDropScore + points,
    highScore: Math.max(scoreState.totalScore + points, scoreState.highScore)
  };
}

/**
 * Resets score state (for new game)
 * @returns {Object} Fresh score state
 */
export function resetScore() {
  return createScoreState();
}

/**
 * Gets the current score
 * @param {Object} scoreState - Score state
 * @returns {number} Total score
 */
export function getTotalScore(scoreState) {
  return scoreState.totalScore;
}

/**
 * Gets total lines cleared
 * @param {Object} scoreState - Score state
 * @returns {number} Total lines cleared
 */
export function getTotalLines(scoreState) {
  return scoreState.linesCleared;
}

/**
 * Gets tetris count
 * @param {Object} scoreState - Score state
 * @returns {number} Number of tetrises cleared
 */
export function getTetrisCount(scoreState) {
  return scoreState.tetrises;
}

/**
 * Gets score breakdown for display
 * @param {Object} scoreState - Score state
 * @returns {Object} Breakdown of score sources
 */
export function getScoreBreakdown(scoreState) {
  return {
    lineClears: scoreState.totalScore - scoreState.softDropScore,
    softDrops: scoreState.softDropScore,
    total: scoreState.totalScore
  };
}

/**
 * Creates high score tracking
 * @returns {Object} High score state
 */
export function createHighScoreState() {
  return {
    scores: [],
    maxEntries: 10
  };
}

/**
 * Adds a score to high score list
 * @param {Object} highScoreState - High score state
 * @param {Object} entry - Score entry { name: string, score: number, lines: number, level: number }
 * @returns {Object} New high score state
 */
export function addHighScore(highScoreState, entry) {
  const newScores = [...highScoreState.scores, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, highScoreState.maxEntries);

  return {
    ...highScoreState,
    scores: newScores
  };
}

/**
 * Checks if score qualifies for high score list
 * @param {Object} highScoreState - High score state
 * @param {number} score - Score to check
 * @returns {boolean} True if score qualifies
 */
export function isHighScore(highScoreState, score) {
  if (highScoreState.scores.length < highScoreState.maxEntries) {
    return true;
  }

  const lowestHigh = highScoreState.scores[highScoreState.scores.length - 1];
  return score > lowestHigh.score;
}
