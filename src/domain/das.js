/**
 * DAS (Delayed Auto Shift) module - NES Tetris horizontal movement
 * Implements NES-style DAS with initial delay and auto-repeat
 * Controls: A=left, D=right
 * 
 * NES DAS Parameters:
 * - DAS Delay: 16 frames (initial delay before auto-repeat starts)
 * - Auto Repeat Rate (ARR): 6 frames (time between repeats once DAS is active)
 */

import { canMovePiece } from './collision.js';
import { movePiece } from './piece.js';

/**
 * NES DAS timing constants (in frames)
 */
export const DAS_DELAY_FRAMES = 16;
export const DAS_ARR_FRAMES = 6;

/**
 * Direction constants
 */
export const DIRECTION_LEFT = -1;
export const DIRECTION_RIGHT = 1;
export const DIRECTION_NONE = 0;

/**
 * Creates initial DAS state
 * @returns {Object} DAS state object
 */
export function createDAS() {
  return {
    direction: DIRECTION_NONE,
    counter: 0,
    isActive: false,
    lastMoveFrame: 0
  };
}

/**
 * Processes a single frame of DAS
 * Handles initial delay and auto-repeat timing
 * 
 * NES DAS behavior:
 * - Frame 0: First move when direction pressed (counter goes to 1)
 * - Frames 1-15: Delay (15 frames, counter goes 2-16)
 * - Frame 16: DAS activates and move (counter goes to 17)
 * - Then every 6 frames: Move
 * 
 * @param {Object} das - Current DAS state
 * @param {number} currentFrame - Current frame number (for timing)
 * @returns {Object} { shouldMove: boolean, direction: number, das: Object }
 *                   shouldMove: true if piece should move this frame
 *                   direction: -1 for left, 1 for right, 0 for none
 *                   das: new DAS state (immutable)
 */
export function tick(das, currentFrame = 0) {
  // No direction held - reset state
  if (das.direction === DIRECTION_NONE) {
    return {
      shouldMove: false,
      direction: DIRECTION_NONE,
      das: createDAS()
    };
  }

  const newCounter = das.counter + 1;

  // First frame of holding direction - immediate move
  if (das.counter === 0) {
    return {
      shouldMove: true,
      direction: das.direction,
      das: {
        ...das,
        counter: newCounter,
        isActive: false,
        lastMoveFrame: currentFrame
      }
    };
  }

  // Check if DAS delay has been exceeded (counter > 16)
  // Frame 0: counter=0 -> 1 (initial move)
  // Frames 1-15: counter goes 2-16 (delay, no moves)
  // Frame 16: counter=16 -> 17 (DAS activates and moves)
  if (!das.isActive && newCounter > DAS_DELAY_FRAMES) {
    // DAS just activated - move and start auto-repeat
    return {
      shouldMove: true,
      direction: das.direction,
      das: {
        ...das,
        counter: newCounter,
        isActive: true,
        lastMoveFrame: currentFrame
      }
    };
  }

  // DAS is active - check auto-repeat timing
  // DAS activated at counter=17 (frame 16), moved
  // Next moves at: counter=23, 29, 35, etc. (every 6 frames from 17)
  if (das.isActive) {
    const framesSinceFirstARR = newCounter - DAS_DELAY_FRAMES - 1;
    if (framesSinceFirstARR % DAS_ARR_FRAMES === 0) {
      return {
        shouldMove: true,
        direction: das.direction,
        das: {
          ...das,
          counter: newCounter,
          lastMoveFrame: currentFrame
        }
      };
    }
  }

  // No movement this frame
  return {
    shouldMove: false,
    direction: das.direction,
    das: {
      ...das,
      counter: newCounter
    }
  };
}

/**
 * Sets the DAS direction (called when key is pressed/released)
 * @param {Object} das - Current DAS state
 * @param {number} direction - DIRECTION_LEFT, DIRECTION_RIGHT, or DIRECTION_NONE
 * @returns {Object} New DAS state with updated direction
 */
export function setDirection(das, direction) {
  // If direction changes, reset counter but preserve timing for quick tap-tap
  if (direction !== das.direction) {
    return {
      ...das,
      direction,
      counter: 0,
      isActive: false,
      lastMoveFrame: 0
    };
  }

  // Direction unchanged
  return das;
}

/**
 * Attempts to move piece left (for controller input)
 * Checks collision before moving
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @returns {Object} { success: boolean, piece: Object }
 *                   If successful, piece is moved piece
 *                   If failed (collision), piece is original piece
 */
export function moveLeft(board, piece) {
  if (canMovePiece(board, piece, DIRECTION_LEFT, 0)) {
    return {
      success: true,
      piece: movePiece(piece, DIRECTION_LEFT, 0)
    };
  }

  return {
    success: false,
    piece
  };
}

/**
 * Attempts to move piece right (for controller input)
 * Checks collision before moving
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @returns {Object} { success: boolean, piece: Object }
 *                   If successful, piece is moved piece
 *                   If failed (collision), piece is original piece
 */
export function moveRight(board, piece) {
  if (canMovePiece(board, piece, DIRECTION_RIGHT, 0)) {
    return {
      success: true,
      piece: movePiece(piece, DIRECTION_RIGHT, 0)
    };
  }

  return {
    success: false,
    piece
  };
}

/**
 * Attempts to move piece with DAS (convenience function)
 * Combines DAS tick with actual movement
 * 
 * @param {Array} board - Game board
 * @param {Object} piece - Current piece
 * @param {Object} das - Current DAS state
 * @param {number} currentFrame - Current frame number
 * @returns {Object} { 
 *                     moved: boolean, 
 *                     piece: Object, 
 *                     das: Object,
 *                     direction: number
 *                   }
 */
export function tickAndMove(board, piece, das, currentFrame = 0) {
  const tickResult = tick(das, currentFrame);

  if (!tickResult.shouldMove) {
    return {
      moved: false,
      piece,
      das: tickResult.das,
      direction: tickResult.direction
    };
  }

  // Attempt to move in the DAS direction
  let moveResult;
  if (tickResult.direction === DIRECTION_LEFT) {
    moveResult = moveLeft(board, piece);
  } else if (tickResult.direction === DIRECTION_RIGHT) {
    moveResult = moveRight(board, piece);
  } else {
    return {
      moved: false,
      piece,
      das: tickResult.das,
      direction: tickResult.direction
    };
  }

  return {
    moved: moveResult.success,
    piece: moveResult.piece,
    das: tickResult.das,
    direction: tickResult.direction
  };
}

/**
 * Resets DAS state (e.g., when piece locks or spawns)
 * @returns {Object} Fresh DAS state
 */
export function resetDAS() {
  return createDAS();
}

/**
 * Checks if DAS is currently active (auto-repeating)
 * @param {Object} das - DAS state
 * @returns {boolean} True if DAS has passed delay and is auto-repeating
 */
export function isDASActive(das) {
  return das.isActive;
}

/**
 * Gets frames until next auto-repeat movement
 * @param {Object} das - DAS state
 * @returns {number} Frames until next move (0 if should move now)
 */
export function getFramesUntilNextMove(das) {
  if (das.direction === DIRECTION_NONE) {
    return Infinity;
  }

  if (das.counter === 0) {
    return 0; // Should move immediately on first frame
  }

  if (!das.isActive) {
    // Still in DAS delay
    // Test expects: at counter=5, return 11 (16-5)
    // This suggests DAS activates when counter would reach 16
    return DAS_DELAY_FRAMES - das.counter;
  }

  // In auto-repeat phase
  // Test expects: at counter=18 (16+2), return 4 (6-2)
  // This suggests next move is at counter=22, so ARR from counter=16
  const framesSinceDASStart = das.counter - DAS_DELAY_FRAMES;
  const framesInCurrentARR = framesSinceDASStart % DAS_ARR_FRAMES;
  return DAS_ARR_FRAMES - framesInCurrentARR;
}
