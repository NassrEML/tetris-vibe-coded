/**
 * Input Controller - Handles keyboard input for NES Tetris
 * Maps keys to game actions
 * 
 * Controls:
 * - A: Move left
 * - D: Move right  
 * - Left Arrow: Rotate counter-clockwise
 * - Right Arrow: Rotate clockwise
 * - Down Arrow: Soft drop
 * - P: Pause/Resume
 * - Enter/Space: Start/Confirm
 * - R: Reset/Return to title
 */

import { DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_NONE } from '../domain/das.js';

/**
 * Key mappings
 */
export const KEY_MAPPINGS = {
  // Movement
  MOVE_LEFT: ['a', 'A'],
  MOVE_RIGHT: ['d', 'D'],
  
  // Rotation
  ROTATE_CCW: ['ArrowLeft'],
  ROTATE_CW: ['ArrowRight'],
  
  // Soft drop
  SOFT_DROP: ['ArrowDown'],
  
  // Game control
  PAUSE: ['p', 'P'],
  START: ['Enter', ' '],
  RESET: ['r', 'R', 'Escape']
};

/**
 * Action types
 */
export const ACTIONS = {
  NONE: 'none',
  MOVE_LEFT: 'moveLeft',
  MOVE_RIGHT: 'moveRight',
  ROTATE_CCW: 'rotateCCW',
  ROTATE_CW: 'rotateCW',
  SOFT_DROP: 'softDrop',
  PAUSE: 'pause',
  START: 'start',
  RESET: 'reset'
};

/**
 * Creates initial input state
 * @returns {Object} Input state
 */
export function createInputState() {
  return {
    keysPressed: new Set(),
    keysJustPressed: new Set(),
    keysJustReleased: new Set(),
    dasDirection: DIRECTION_NONE,
    softDropActive: false,
    actionQueue: []
  };
}

/**
 * Processes a key down event
 * @param {Object} inputState - Current input state
 * @param {string} key - Key pressed
 * @returns {Object} Updated input state
 */
export function handleKeyDown(inputState, key) {
  if (inputState.keysPressed.has(key)) {
    // Key already pressed, no change
    return inputState;
  }

  const newKeysPressed = new Set(inputState.keysPressed);
  newKeysPressed.add(key);

  const newKeysJustPressed = new Set(inputState.keysJustPressed);
  newKeysJustPressed.add(key);

  // Determine DAS direction
  let dasDirection = inputState.dasDirection;
  if (KEY_MAPPINGS.MOVE_LEFT.includes(key)) {
    dasDirection = DIRECTION_LEFT;
  } else if (KEY_MAPPINGS.MOVE_RIGHT.includes(key)) {
    dasDirection = DIRECTION_RIGHT;
  }

  // Check soft drop
  let softDropActive = inputState.softDropActive;
  if (KEY_MAPPINGS.SOFT_DROP.includes(key)) {
    softDropActive = true;
  }

  // Build action queue based on key pressed
  const actionQueue = [...inputState.actionQueue];
  
  if (KEY_MAPPINGS.ROTATE_CCW.includes(key)) {
    actionQueue.push(ACTIONS.ROTATE_CCW);
  } else if (KEY_MAPPINGS.ROTATE_CW.includes(key)) {
    actionQueue.push(ACTIONS.ROTATE_CW);
  } else if (KEY_MAPPINGS.PAUSE.includes(key)) {
    actionQueue.push(ACTIONS.PAUSE);
  } else if (KEY_MAPPINGS.START.includes(key)) {
    actionQueue.push(ACTIONS.START);
  } else if (KEY_MAPPINGS.RESET.includes(key)) {
    actionQueue.push(ACTIONS.RESET);
  }

  return {
    keysPressed: newKeysPressed,
    keysJustPressed: newKeysJustPressed,
    keysJustReleased: inputState.keysJustReleased,
    dasDirection,
    softDropActive,
    actionQueue
  };
}

/**
 * Processes a key up event
 * @param {Object} inputState - Current input state
 * @param {string} key - Key released
 * @returns {Object} Updated input state
 */
export function handleKeyUp(inputState, key) {
  if (!inputState.keysPressed.has(key)) {
    // Key wasn't pressed, no change
    return inputState;
  }

  const newKeysPressed = new Set(inputState.keysPressed);
  newKeysPressed.delete(key);

  const newKeysJustReleased = new Set(inputState.keysJustReleased);
  newKeysJustReleased.add(key);

  // Recalculate DAS direction based on remaining pressed keys
  let dasDirection = DIRECTION_NONE;
  const hasLeft = KEY_MAPPINGS.MOVE_LEFT.some(k => newKeysPressed.has(k));
  const hasRight = KEY_MAPPINGS.MOVE_RIGHT.some(k => newKeysPressed.has(k));
  
  if (hasLeft && !hasRight) {
    dasDirection = DIRECTION_LEFT;
  } else if (hasRight && !hasLeft) {
    dasDirection = DIRECTION_RIGHT;
  }

  // Recalculate soft drop
  const softDropActive = KEY_MAPPINGS.SOFT_DROP.some(k => newKeysPressed.has(k));

  return {
    keysPressed: newKeysPressed,
    keysJustPressed: inputState.keysJustPressed,
    keysJustReleased: newKeysJustReleased,
    dasDirection,
    softDropActive,
    actionQueue: inputState.actionQueue
  };
}

/**
 * Clears the just pressed/released sets (call at end of frame)
 * @param {Object} inputState - Current input state
 * @returns {Object} Input state with transient keys cleared
 */
export function clearTransientKeys(inputState) {
  return {
    ...inputState,
    keysJustPressed: new Set(),
    keysJustReleased: new Set(),
    actionQueue: [] // Clear action queue after processing
  };
}

/**
 * Gets the next action from the queue
 * @param {Object} inputState - Current input state
 * @returns {string|null} Next action or null if empty
 */
export function getNextAction(inputState) {
  if (inputState.actionQueue.length === 0) {
    return null;
  }
  return inputState.actionQueue[0];
}

/**
 * Removes the next action from the queue
 * @param {Object} inputState - Current input state
 * @returns {Object} Input state with action removed
 */
export function consumeAction(inputState) {
  if (inputState.actionQueue.length === 0) {
    return inputState;
  }
  
  const newQueue = inputState.actionQueue.slice(1);
  return {
    ...inputState,
    actionQueue: newQueue
  };
}

/**
 * Gets current DAS direction
 * @param {Object} inputState - Current input state
 * @returns {number} DAS direction (-1, 0, or 1)
 */
export function getDASDirection(inputState) {
  return inputState.dasDirection;
}

/**
 * Checks if soft drop is active
 * @param {Object} inputState - Current input state
 * @returns {boolean} True if soft dropping
 */
export function isSoftDropping(inputState) {
  return inputState.softDropActive;
}

/**
 * Checks if a specific key is currently pressed
 * @param {Object} inputState - Current input state
 * @param {string} key - Key to check
 * @returns {boolean} True if key is pressed
 */
export function isKeyPressed(inputState, key) {
  return inputState.keysPressed.has(key);
}

/**
 * Checks if a key was just pressed this frame
 * @param {Object} inputState - Current input state
 * @param {string} key - Key to check
 * @returns {boolean} True if key was just pressed
 */
export function wasKeyJustPressed(inputState, key) {
  return inputState.keysJustPressed.has(key);
}

/**
 * Checks if a key was just released this frame
 * @param {Object} inputState - Current input state
 * @param {string} key - Key to check
 * @returns {boolean} True if key was just released
 */
export function wasKeyJustReleased(inputState, key) {
  return inputState.keysJustReleased.has(key);
}

/**
 * Gets all currently pressed keys
 * @param {Object} inputState - Current input state
 * @returns {Array} Array of pressed keys
 */
export function getPressedKeys(inputState) {
  return Array.from(inputState.keysPressed);
}

/**
 * Resets input state (e.g., on game over or new game)
 * @returns {Object} Fresh input state
 */
export function resetInput() {
  return createInputState();
}
