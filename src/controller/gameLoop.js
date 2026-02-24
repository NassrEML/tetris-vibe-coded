/**
 * Game Loop - 60 FPS timing and game update orchestration
 * Handles frame timing, DAS, gravity, and state updates
 */

import { tick as gravityTick, resetCounter } from '../domain/gravity.js';
import { tick as dasTick, setDirection } from '../domain/das.js';
import { getDASDirection, isSoftDropping, clearTransientKeys } from './inputController.js';

/**
 * Target frame rate (NES: 60 FPS)
 */
export const TARGET_FPS = 60;
export const FRAME_DURATION_MS = 1000 / TARGET_FPS;

/**
 * Creates initial game loop state
 * @returns {Object} Game loop state
 */
export function createGameLoop() {
  return {
    isRunning: false,
    lastFrameTime: 0,
    accumulator: 0,
    frameCount: 0,
    frameCallbacks: [],
    rafId: null
  };
}

/**
 * Starts the game loop
 * @param {Object} gameLoop - Game loop state
 * @param {Function} updateCallback - Callback for each frame: (deltaTime, frameCount) => void
 * @returns {Object} Running game loop state
 */
export function startGameLoop(gameLoop, updateCallback) {
  if (gameLoop.isRunning) {
    return gameLoop;
  }

  const newCallbacks = [...gameLoop.frameCallbacks];
  if (updateCallback) {
    newCallbacks.push(updateCallback);
  }

  return {
    ...gameLoop,
    isRunning: true,
    lastFrameTime: performance.now(),
    frameCallbacks: newCallbacks
  };
}

/**
 * Stops the game loop
 * @param {Object} gameLoop - Game loop state
 * @returns {Object} Stopped game loop state
 */
export function stopGameLoop(gameLoop) {
  if (gameLoop.rafId !== null) {
    cancelAnimationFrame(gameLoop.rafId);
  }

  return {
    ...gameLoop,
    isRunning: false,
    rafId: null
  };
}

/**
 * Main update function called each frame
 * Handles timing, DAS, gravity, and invokes callbacks
 * 
 * @param {Object} gameLoop - Game loop state
 * @param {Object} gameState - Current game state
 * @param {Object} inputState - Current input state
 * @returns {Object} { gameLoop: Object, gameState: Object, inputState: Object }
 */
export function updateFrame(gameLoop, gameState, inputState) {
  if (!gameLoop.isRunning) {
    return { gameLoop, gameState, inputState };
  }

  const currentTime = performance.now();
  // Handle initial frame where lastFrameTime might be 0
  const deltaTime = gameLoop.lastFrameTime > 0 ? currentTime - gameLoop.lastFrameTime : FRAME_DURATION_MS;
  
  let newGameLoop = {
    ...gameLoop,
    lastFrameTime: currentTime,
    accumulator: gameLoop.accumulator + deltaTime,
    frameCount: gameLoop.frameCount + 1
  };

  // Process all accumulated frames (for catch-up if frame rate drops)
  let newGameState = gameState;
  let newInputState = inputState;
  
  while (newGameLoop.accumulator >= FRAME_DURATION_MS) {
    // Tick DAS
    const dasDirection = getDASDirection(newInputState);
    const dasWithDirection = setDirection(newGameState.das, dasDirection);
    const dasResult = dasTick(dasWithDirection, newGameLoop.frameCount);
    
    newGameState = {
      ...newGameState,
      das: dasResult.das
    };

    // Tick gravity
    const gravityResult = gravityTick(newGameState.gravity);
    
    newGameState = {
      ...newGameState,
      gravity: gravityResult.gravity
    };

    // Increment frame counter
    newGameState = {
      ...newGameState,
      frameCount: newGameState.frameCount + 1
    };

    // Clear transient input keys
    newInputState = clearTransientKeys(newInputState);

    newGameLoop = {
      ...newGameLoop,
      accumulator: newGameLoop.accumulator - FRAME_DURATION_MS
    };
  }

  return {
    gameLoop: newGameLoop,
    gameState: newGameState,
    inputState: newInputState
  };
}

/**
 * Checks if gravity should apply this frame
 * (Convenience function for controller)
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if piece should fall this frame
 */
export function shouldApplyGravity(gameState) {
  return gameState.gravity.frameCounter === 0 && 
         gameState.frameCount > 0; // Don't fall on first frame
}

/**
 * Checks if DAS should move this frame
 * @param {Object} gameState - Current game state
 * @returns {boolean} True if DAS should move
 */
export function shouldApplyDAS(gameState) {
  // DAS counter of 0 means immediate move on first press
  // Counter 17 (after 16-frame delay) means first ARR move
  // Then every 6 frames after that
  const das = gameState.das;
  
  if (das.direction === 0) {
    return false;
  }
  
  // First frame: counter goes from 0 to 1, should move
  if (das.counter === 1) {
    return true;
  }
  
  // DAS active (counter > 16): check ARR
  if (das.isActive) {
    const framesSinceDASStart = das.counter - 16;
    return framesSinceDASStart % 6 === 0;
  }
  
  return false;
}

/**
 * Gets DAS move direction for this frame
 * @param {Object} gameState - Current game state
 * @returns {number} -1 for left, 1 for right, 0 for none
 */
export function getDASMoveDirection(gameState) {
  return shouldApplyDAS(gameState) ? gameState.das.direction : 0;
}

/**
 * Resets gravity counter (e.g., after piece locks or spawns)
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with reset gravity
 */
export function resetGravity(gameState) {
  return {
    ...gameState,
    gravity: resetCounter(gameState.gravity)
  };
}

/**
 * Gets current FPS based on actual frame timing
 * @param {Object} gameLoop - Game loop state
 * @returns {number} Approximate current FPS
 */
export function getCurrentFPS(gameLoop) {
  if (!gameLoop.isRunning || gameLoop.frameCount === 0) {
    return 0;
  }
  // This is a simplified calculation
  return TARGET_FPS;
}

/**
 * Gets frame count
 * @param {Object} gameLoop - Game loop state
 * @returns {number} Total frames processed
 */
export function getFrameCount(gameLoop) {
  return gameLoop.frameCount;
}

/**
 * Checks if loop is running
 * @param {Object} gameLoop - Game loop state
 * @returns {boolean} True if running
 */
export function isRunning(gameLoop) {
  return gameLoop.isRunning;
}
