/**
 * Gravity module - NES Tetris fall speed and frame timing
 * 60 FPS logic, tick-based (no delta time)
 * Frame counter for tracking fall timing
 */

/**
 * NES Tetris fall speed table (frames per cell drop)
 * Source: NES Tetris 1989 NTSC timing
 * Level 0-20 speeds in frames per grid cell
 */
export const GRAVITY_TABLE = [
  48,  // Level 0: 48 frames per drop
  43,  // Level 1
  38,  // Level 2
  33,  // Level 3
  28,  // Level 4
  23,  // Level 5
  18,  // Level 6
  13,  // Level 7
  8,   // Level 8
  6,   // Level 9
  5,   // Level 10
  5,   // Level 11
  5,   // Level 12
  4,   // Level 13
  4,   // Level 14
  4,   // Level 15
  3,   // Level 16
  3,   // Level 17
  3,   // Level 18
  2,   // Level 19
  2    // Level 20+
];

/**
 * Gets the gravity (frames per drop) for a given level
 * @param {number} level - Game level (0-20+)
 * @returns {number} Frames per cell drop
 */
export function getGravityForLevel(level) {
  // Clamp level to valid index range
  const index = Math.max(0, Math.min(level, GRAVITY_TABLE.length - 1));
  return GRAVITY_TABLE[index];
}

/**
 * Creates a new gravity state
 * @param {number} level - Initial level
 * @returns {Object} Gravity state
 */
export function createGravity(level = 0) {
  return {
    level,
    framesPerDrop: getGravityForLevel(level),
    frameCounter: 0
  };
}

/**
 * Advances the frame counter and checks if piece should fall
 * @param {Object} gravity - Current gravity state
 * @returns {Object} { shouldFall: boolean, gravity: Object }
 *                   Returns new gravity state (immutable)
 */
export function tick(gravity) {
  const newFrameCounter = gravity.frameCounter + 1;
  const shouldFall = newFrameCounter >= gravity.framesPerDrop;

  return {
    shouldFall,
    gravity: {
      ...gravity,
      frameCounter: shouldFall ? 0 : newFrameCounter
    }
  };
}

/**
 * Ticks multiple times
 * Useful for testing or fast-forwarding
 * @param {Object} gravity - Current gravity state
 * @param {number} count - Number of ticks to advance
 * @returns {Object} { fallCount: number, gravity: Object }
 */
export function tickMultiple(gravity, count) {
  let currentGravity = gravity;
  let fallCount = 0;

  for (let i = 0; i < count; i++) {
    const result = tick(currentGravity);
    if (result.shouldFall) {
      fallCount++;
    }
    currentGravity = result.gravity;
  }

  return {
    fallCount,
    gravity: currentGravity
  };
}

/**
 * Updates the gravity level (e.g., when player levels up)
 * @param {Object} gravity - Current gravity state
 * @param {number} newLevel - New level
 * @returns {Object} New gravity state with updated level and speed
 */
export function updateLevel(gravity, newLevel) {
  return {
    ...gravity,
    level: newLevel,
    framesPerDrop: getGravityForLevel(newLevel),
    frameCounter: 0 // Reset counter on level change
  };
}

/**
 * Resets frame counter (useful when piece locks or spawns)
 * @param {Object} gravity - Current gravity state
 * @returns {Object} New gravity state with reset counter
 */
export function resetCounter(gravity) {
  return {
    ...gravity,
    frameCounter: 0
  };
}

/**
 * Gets the current fall speed in frames per cell
 * @param {Object} gravity - Gravity state
 * @returns {number} Frames per cell drop
 */
export function getCurrentSpeed(gravity) {
  return gravity.framesPerDrop;
}

/**
 * Gets frames remaining until next fall
 * @param {Object} gravity - Gravity state
 * @returns {number} Frames until piece should fall
 */
export function getFramesUntilFall(gravity) {
  return gravity.framesPerDrop - gravity.frameCounter;
}

/**
 * Constants for reference
 */
export const FPS = 60;
