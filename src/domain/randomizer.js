/**
 * Randomizer module - NES Tetris LCG (Linear Congruential Generator)
 * Deterministic pseudo-random number generator with seed support
 */

/**
 * NES Tetris uses a simple LCG algorithm.
 * The original uses a sequence that can produce any piece at any time,
 * including repeats (unlike modern 7-bag systems).
 *
 * LCG parameters used by NES Tetris:
 * - multiplier: 0x41C64E6D (commonly used in games)
 * - increment: 0x3039
 * - modulus: 2^32 (implicit via 32-bit integer overflow)
 */

const LCG_MULTIPLIER = 0x41C64E6D;
const LCG_INCREMENT = 0x3039;
const PIECE_COUNT = 7;

/**
 * Creates a new randomizer with optional seed
 * @param {number} seed - Initial seed value (default: random)
 * @returns {Object} Randomizer state object
 */
export function createRandomizer(seed = null) {
  // Use provided seed or generate random one
  const initialSeed = seed !== null ? seed : Math.floor(Math.random() * 0x7FFFFFFF);

  return {
    seed: initialSeed,
    current: initialSeed
  };
}

/**
 * Steps the LCG to the next value
 * @param {number} current - Current state
 * @returns {number} Next state value
 */
function lcgStep(current) {
  // LCG formula: next = (multiplier * current + increment) mod 2^32
  // Use >>> 0 to ensure unsigned 32-bit arithmetic
  return ((LCG_MULTIPLIER * current + LCG_INCREMENT) >>> 0);
}

/**
 * Converts LCG value to piece type (1-7)
 * @param {number} lcgValue - LCG state value
 * @returns {number} Piece type (1-7)
 */
function lcgToPieceType(lcgValue) {
  // Extract bits and map to 0-6 range, then add 1 for 1-7
  // Use middle bits which have better randomness
  const value = (lcgValue >>> 10) & 0x7FFFFFFF;
  return (value % PIECE_COUNT) + 1;
}

/**
 * Gets the next piece from the randomizer
 * @param {Object} randomizer - Randomizer state
 * @returns {Object} { pieceType: number, randomizer: Object }
 *                   Returns new randomizer state (immutable)
 */
export function nextPiece(randomizer) {
  const newCurrent = lcgStep(randomizer.current);
  const pieceType = lcgToPieceType(newCurrent);

  return {
    pieceType,
    randomizer: {
      ...randomizer,
      current: newCurrent
    }
  };
}

/**
 * Gets next N pieces from the randomizer
 * Useful for generating a sequence or previewing next pieces
 * @param {Object} randomizer - Randomizer state
 * @param {number} count - Number of pieces to generate
 * @returns {Object} { pieces: Array<number>, randomizer: Object }
 */
export function nextPieces(randomizer, count) {
  const pieces = [];
  let currentRandomizer = randomizer;

  for (let i = 0; i < count; i++) {
    const result = nextPiece(currentRandomizer);
    pieces.push(result.pieceType);
    currentRandomizer = result.randomizer;
  }

  return {
    pieces,
    randomizer: currentRandomizer
  };
}

/**
 * Resets randomizer to initial seed
 * @param {Object} randomizer - Randomizer state
 * @returns {Object} Reset randomizer state
 */
export function resetRandomizer(randomizer) {
  return {
    ...randomizer,
    current: randomizer.seed
  };
}

/**
 * Creates a new randomizer with specific seed and gets first piece
 * Convenience function for testing determinism
 * @param {number} seed - Seed value
 * @returns {Object} { pieceType: number, randomizer: Object }
 */
export function createRandomizerWithFirstPiece(seed) {
  const randomizer = createRandomizer(seed);
  return nextPiece(randomizer);
}
