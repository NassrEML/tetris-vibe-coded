/**
 * Level module - NES Tetris level progression
 * Level increases every 10 lines cleared
 * Level affects gravity speed and scoring multiplier
 */

import { getGravityForLevel, createGravity, updateLevel } from './gravity.js';

/**
 * Lines required to advance to next level
 */
export const LINES_PER_LEVEL = 10;

/**
 * Starting level (NES default is 0)
 */
export const DEFAULT_START_LEVEL = 0;

/**
 * Maximum level (NES display limit, though gravity caps at 20)
 */
export const MAX_LEVEL = 99;

/**
 * Calculates level based on lines cleared
 * NES: Level = startLevel + floor(totalLines / 10)
 * 
 * @param {number} totalLines - Total lines cleared
 * @param {number} startLevel - Starting level (default 0)
 * @returns {number} Current level
 */
export function calculateLevel(totalLines, startLevel = DEFAULT_START_LEVEL) {
  if (totalLines < 0) {
    totalLines = 0;
  }

  if (startLevel < 0) {
    startLevel = 0;
  }

  const levelIncrease = Math.floor(totalLines / LINES_PER_LEVEL);
  const level = startLevel + levelIncrease;

  return Math.min(level, MAX_LEVEL);
}

/**
 * Calculates lines remaining until next level
 * 
 * @param {number} totalLines - Total lines cleared
 * @param {number} startLevel - Starting level
 * @returns {number} Lines needed for next level (0 if just leveled up)
 */
export function getLinesUntilNextLevel(totalLines, startLevel = DEFAULT_START_LEVEL) {
  if (totalLines < 0) {
    totalLines = 0;
  }

  // Calculate lines into current level
  const linesInCurrentLevel = totalLines % LINES_PER_LEVEL;

  return LINES_PER_LEVEL - linesInCurrentLevel;
}

/**
 * Checks if level should increase
 * 
 * @param {number} previousLines - Lines before last clear
 * @param {number} currentLines - Lines after last clear
 * @param {number} startLevel - Starting level
 * @returns {boolean} True if level increased
 */
export function didLevelIncrease(previousLines, currentLines, startLevel = DEFAULT_START_LEVEL) {
  const previousLevel = calculateLevel(previousLines, startLevel);
  const currentLevel = calculateLevel(currentLines, startLevel);

  return currentLevel > previousLevel;
}

/**
 * Creates level state
 * @param {number} startLevel - Starting level (default 0)
 * @returns {Object} Level state object
 */
export function createLevelState(startLevel = DEFAULT_START_LEVEL) {
  const validStartLevel = Math.max(0, Math.min(startLevel, MAX_LEVEL));

  return {
    currentLevel: validStartLevel,
    startLevel: validStartLevel,
    totalLines: 0,
    linesUntilNext: LINES_PER_LEVEL,
    gravity: createGravity(validStartLevel)
  };
}

/**
 * Updates level state after line clears
 * 
 * @param {Object} levelState - Current level state
 * @param {number} linesCleared - Lines just cleared
 * @returns {Object} { 
 *                     levelState: Object, 
 *                     leveledUp: boolean,
 *                     previousLevel: number 
 *                   }
 */
export function updateAfterClear(levelState, linesCleared) {
  const previousLevel = levelState.currentLevel;
  const newTotalLines = levelState.totalLines + linesCleared;
  const newLevel = calculateLevel(newTotalLines, levelState.startLevel);
  const leveledUp = newLevel > previousLevel;

  // Update gravity if level changed
  let newGravity = levelState.gravity;
  if (leveledUp) {
    newGravity = updateLevel(levelState.gravity, newLevel);
  }

  const newLevelState = {
    ...levelState,
    currentLevel: newLevel,
    totalLines: newTotalLines,
    linesUntilNext: getLinesUntilNextLevel(newTotalLines, levelState.startLevel),
    gravity: newGravity
  };

  return {
    levelState: newLevelState,
    leveledUp,
    previousLevel
  };
}

/**
 * Gets current gravity speed for level
 * @param {Object} levelState - Level state
 * @returns {number} Frames per drop
 */
export function getCurrentSpeed(levelState) {
  return levelState.gravity.framesPerDrop;
}

/**
 * Gets gravity state from level state
 * @param {Object} levelState - Level state
 * @returns {Object} Gravity state
 */
export function getGravityState(levelState) {
  return levelState.gravity;
}

/**
 * Sets level directly (e.g., for level select)
 * @param {Object} levelState - Current level state
 * @param {number} newLevel - New level to set
 * @returns {Object} New level state
 */
export function setLevel(levelState, newLevel) {
  const validLevel = Math.max(0, Math.min(newLevel, MAX_LEVEL));

  return {
    ...levelState,
    currentLevel: validLevel,
    gravity: updateLevel(levelState.gravity, validLevel)
  };
}

/**
 * Resets level state for new game
 * @param {number} startLevel - Starting level
 * @returns {Object} Fresh level state
 */
export function resetLevel(startLevel = DEFAULT_START_LEVEL) {
  return createLevelState(startLevel);
}

/**
 * Gets level display info for UI
 * @param {Object} levelState - Level state
 * @returns {Object} Display info { current, start, linesUntilNext, speed }
 */
export function getLevelInfo(levelState) {
  return {
    current: levelState.currentLevel,
    start: levelState.startLevel,
    totalLines: levelState.totalLines,
    linesUntilNext: levelState.linesUntilNext,
    speed: getCurrentSpeed(levelState),
    speedLabel: getSpeedLabel(getCurrentSpeed(levelState))
  };
}

/**
 * Gets human-readable speed label
 * @param {number} framesPerDrop - Frames per cell drop
 * @returns {string} Speed description
 */
function getSpeedLabel(framesPerDrop) {
  if (framesPerDrop >= 48) return 'Very Slow';
  if (framesPerDrop >= 20) return 'Slow';
  if (framesPerDrop >= 10) return 'Normal';
  if (framesPerDrop >= 6) return 'Fast';
  if (framesPerDrop >= 4) return 'Very Fast';
  return 'Extreme';
}

/**
 * Validates start level
 * @param {number} level - Level to validate
 * @returns {number} Validated level (clamped to 0-MAX_LEVEL)
 */
export function validateStartLevel(level) {
  return Math.max(0, Math.min(level, MAX_LEVEL));
}

/**
 * Calculates progress to next level as percentage
 * @param {Object} levelState - Level state
 * @returns {number} Percentage (0-100)
 */
export function getLevelProgress(levelState) {
  const linesInLevel = levelState.totalLines % LINES_PER_LEVEL;
  return (linesInLevel / LINES_PER_LEVEL) * 100;
}
