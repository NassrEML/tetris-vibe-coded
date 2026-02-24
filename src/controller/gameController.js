/**
 * Game Controller - Orchestrates game flow
 * Handles: start game, spawn pieces, locking, line clears, scoring, game over
 */

import { createPiece, PIECE_TYPES } from '../domain/piece.js';
import { createEmptyBoard, placePiece, clearLines } from '../domain/board.js';
import { canSpawnPiece, canMovePiece, checkCollision } from '../domain/collision.js';
import { tryRotate } from '../domain/rotation.js';
import { nextPiece } from '../domain/randomizer.js';
import { shouldLock, lockPiece, lockAndClear } from '../domain/lock.js';
import { addLineClearScore, addSoftDropScore } from '../domain/scoring.js';
import { updateAfterClear } from '../domain/level.js';
import { createDAS, moveLeft, moveRight, DIRECTION_LEFT, DIRECTION_RIGHT } from '../domain/das.js';
import { 
  createGameState, 
  startGame, 
  spawnPiece as spawnPieceState, 
  setNextPiece,
  updateCurrentPiece,
  updateBoard,
  updateScore,
  updateLevel,
  updateRandomizer,
  updateDAS,
  isPlaying,
  GAME_STATES
} from '../domain/gameState.js';
import { 
  checkGameOver, 
  triggerGameOver, 
  advanceGameOverAnimation,
  isGameOverAnimationActive 
} from '../domain/gameOver.js';
import { resetGravity, shouldApplyGravity, shouldApplyDAS } from './gameLoop.js';
import { getNextAction, consumeAction, isSoftDropping, ACTIONS } from './inputController.js';

/**
 * Initializes a new game
 * @param {number} startLevel - Starting level (default 0)
 * @returns {Object} Initial game state
 */
export function initGame(startLevel = 0) {
  return createGameState(startLevel);
}

/**
 * Starts a new game session
 * @param {Object} gameState - Current game state
 * @param {number} startLevel - Starting level
 * @returns {Object} New game state ready to play
 */
export function startNewGame(gameState, startLevel = 0) {
  let newState = startGame(gameState, startLevel);
  
  // Get first piece from randomizer
  const firstPieceResult = nextPiece(newState.randomizer);
  const firstPiece = createPiece(firstPieceResult.pieceType);
  
  // Get next piece
  const nextPieceResult = nextPiece(firstPieceResult.randomizer);
  
  newState = spawnPieceState(newState, firstPiece);
  newState = setNextPiece(newState, nextPieceResult.pieceType);
  newState = updateRandomizer(newState, nextPieceResult.randomizer);
  
  return newState;
}

/**
 * Spawns a new piece
 * Checks for game over condition
 * @param {Object} gameState - Current game state
 * @returns {Object} { gameState: Object, gameOver: boolean }
 */
export function spawnNewPiece(gameState) {
  const nextPieceType = gameState.nextPiece;
  
  // Check if we can spawn
  if (checkGameOver(gameState.board, nextPieceType)) {
    const gameOverState = triggerGameOver(gameState);
    return { gameState: gameOverState, gameOver: true };
  }
  
  // Spawn the piece
  const newPiece = createPiece(nextPieceType);
  let newState = spawnPieceState(gameState, newPiece);
  
  // Get next piece from randomizer
  const randomizerResult = nextPiece(gameState.randomizer);
  newState = setNextPiece(newState, randomizerResult.pieceType);
  newState = updateRandomizer(newState, randomizerResult.randomizer);
  
  // Reset gravity for new piece
  newState = resetGravity(newState);
  
  return { gameState: newState, gameOver: false };
}

/**
 * Attempts to move current piece left
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with piece potentially moved
 */
export function movePieceLeft(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return gameState;
  }
  
  const moveResult = moveLeft(gameState.board, gameState.currentPiece);
  if (moveResult.success) {
    return updateCurrentPiece(gameState, moveResult.piece);
  }
  return gameState;
}

/**
 * Attempts to move current piece right
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with piece potentially moved
 */
export function movePieceRight(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return gameState;
  }
  
  const moveResult = moveRight(gameState.board, gameState.currentPiece);
  if (moveResult.success) {
    return updateCurrentPiece(gameState, moveResult.piece);
  }
  return gameState;
}

/**
 * Attempts to rotate piece clockwise
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with piece potentially rotated
 */
export function rotatePieceClockwise(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return gameState;
  }
  
  const rotateResult = tryRotate(gameState.board, gameState.currentPiece, 1);
  return updateCurrentPiece(gameState, rotateResult.piece);
}

/**
 * Attempts to rotate piece counter-clockwise
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with piece potentially rotated
 */
export function rotatePieceCounterClockwise(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return gameState;
  }
  
  const rotateResult = tryRotate(gameState.board, gameState.currentPiece, -1);
  return updateCurrentPiece(gameState, rotateResult.piece);
}

/**
 * Attempts to soft drop piece
 * @param {Object} gameState - Current game state
 * @returns {Object} { gameState: Object, dropped: boolean, cellsDropped: number }
 */
export function softDrop(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return { gameState, dropped: false, cellsDropped: 0 };
  }
  
  // Check if can move down
  if (canMovePiece(gameState.board, gameState.currentPiece, 0, 1)) {
    const movedPiece = {
      ...gameState.currentPiece,
      y: gameState.currentPiece.y + 1
    };
    
    // Add soft drop score
    const newScore = addSoftDropScore(gameState.score, 1);
    let newState = updateScore(gameState, newScore);
    newState = updateCurrentPiece(newState, movedPiece);
    
    return { gameState: newState, dropped: true, cellsDropped: 1 };
  }
  
  return { gameState, dropped: false, cellsDropped: 0 };
}

/**
 * Attempts to move piece down (gravity)
 * @param {Object} gameState - Current game state
 * @returns {Object} { gameState: Object, fell: boolean }
 */
export function applyGravity(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return { gameState, fell: false };
  }
  
  if (canMovePiece(gameState.board, gameState.currentPiece, 0, 1)) {
    const movedPiece = {
      ...gameState.currentPiece,
      y: gameState.currentPiece.y + 1
    };
    return { gameState: updateCurrentPiece(gameState, movedPiece), fell: true };
  }
  
  return { gameState, fell: false };
}

/**
 * Attempts to lock piece to board
 * Handles line clearing, scoring, and level progression
 * @param {Object} gameState - Current game state
 * @returns {Object} { gameState: Object, locked: boolean, linesCleared: number }
 */
export function lockCurrentPiece(gameState) {
  if (!gameState.currentPiece || !isPlaying(gameState)) {
    return { gameState, locked: false, linesCleared: 0 };
  }
  
  // Check if piece should lock
  if (!shouldLock(gameState.board, gameState.currentPiece)) {
    return { gameState, locked: false, linesCleared: 0 };
  }
  
  // Lock and clear lines
  const lockResult = lockAndClear(gameState.board, gameState.currentPiece);
  
  if (!lockResult.locked) {
    return { gameState, locked: false, linesCleared: 0, error: lockResult.error };
  }
  
  // Update board
  let newState = updateBoard(gameState, lockResult.board);
  
  // Update score with line clears
  const linesCleared = lockResult.clearedLines;
  if (linesCleared > 0) {
    const newScore = addLineClearScore(newState.score, linesCleared, newState.level.currentLevel);
    newState = updateScore(newState, newScore);
    
    // Update level
    const levelResult = updateAfterClear(newState.level, linesCleared);
    newState = updateLevel(newState, levelResult.levelState);
    
    // Update gravity if level changed
    if (levelResult.leveledUp) {
      newState = {
        ...newState,
        gravity: levelResult.levelState.gravity
      };
    }
  }
  
  return { gameState: newState, locked: true, linesCleared };
}

/**
 * Processes input actions
 * @param {Object} gameState - Current game state
 * @param {Object} inputState - Current input state
 * @returns {Object} { gameState: Object, inputState: Object }
 */
export function processInput(gameState, inputState) {
  let newState = gameState;
  let newInput = inputState;
  
  // Process all queued actions
  let action = getNextAction(inputState);
  while (action) {
    switch (action) {
      case ACTIONS.MOVE_LEFT:
        // Handled by DAS
        break;
      case ACTIONS.MOVE_RIGHT:
        // Handled by DAS
        break;
      case ACTIONS.ROTATE_CCW:
        newState = rotatePieceCounterClockwise(newState);
        break;
      case ACTIONS.ROTATE_CW:
        newState = rotatePieceClockwise(newState);
        break;
      case ACTIONS.SOFT_DROP:
        // Handled by soft drop check
        break;
      case ACTIONS.PAUSE:
        // Handled by game controller
        break;
      case ACTIONS.START:
        // Handled by game controller
        break;
      case ACTIONS.RESET:
        // Handled by game controller
        break;
    }
    newInput = consumeAction(newInput);
    action = getNextAction(newInput);
  }
  
  return { gameState: newState, inputState: newInput };
}

/**
 * Main game update - processes one frame of game logic
 * Should be called once per frame
 * 
 * @param {Object} gameState - Current game state
 * @param {Object} inputState - Current input state
 * @returns {Object} { gameState: Object, events: Array }
 */
export function updateGame(gameState, inputState) {
  const events = [];
  let newState = gameState;
  
  // Skip if not playing
  if (!isPlaying(newState)) {
    // Handle game over animation
    if (isGameOverAnimationActive(newState)) {
      const animationResult = advanceGameOverAnimation(newState);
      newState = animationResult.gameState;
      if (animationResult.completed) {
        events.push({ type: 'GAME_OVER_ANIMATION_COMPLETE' });
      }
    }
    return { gameState: newState, events };
  }
  
  // Process input actions
  const inputResult = processInput(newState, inputState);
  newState = inputResult.gameState;
  
  // Apply DAS movement
  if (shouldApplyDAS(newState)) {
    if (newState.das.direction === DIRECTION_LEFT) {
      newState = movePieceLeft(newState);
    } else if (newState.das.direction === DIRECTION_RIGHT) {
      newState = movePieceRight(newState);
    }
  }
  
  // Apply soft drop if active
  if (isSoftDropping(inputState)) {
    const softDropResult = softDrop(newState);
    newState = softDropResult.gameState;
    if (softDropResult.dropped) {
      events.push({ type: 'SOFT_DROP', cells: softDropResult.cellsDropped });
    }
  }
  
  // Apply gravity
  if (shouldApplyGravity(newState)) {
    const gravityResult = applyGravity(newState);
    newState = gravityResult.gameState;
    if (!gravityResult.fell) {
      // Piece couldn't fall, check if should lock
      const lockResult = lockCurrentPiece(newState);
      if (lockResult.locked) {
        newState = lockResult.gameState;
        events.push({ type: 'PIECE_LOCKED', linesCleared: lockResult.linesCleared });
        
        // Spawn new piece
        const spawnResult = spawnNewPiece(newState);
        newState = spawnResult.gameState;
        
        if (spawnResult.gameOver) {
          events.push({ type: 'GAME_OVER' });
        } else {
          events.push({ type: 'PIECE_SPAWNED' });
        }
      }
    } else {
      events.push({ type: 'PIECE_FELL' });
    }
  }
  
  return { gameState: newState, events };
}

/**
 * Pauses or resumes the game
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state with toggled pause
 */
export function togglePause(gameState) {
  if (gameState.state === GAME_STATES.PLAYING) {
    return {
      ...gameState,
      state: GAME_STATES.PAUSED
    };
  } else if (gameState.state === GAME_STATES.PAUSED) {
    return {
      ...gameState,
      state: GAME_STATES.PLAYING
    };
  }
  return gameState;
}

/**
 * Returns to title screen
 * @param {Object} gameState - Current game state
 * @returns {Object} Game state at title
 */
export function returnToTitle(gameState) {
  return createGameState();
}

/**
 * Gets game status for display
 * @param {Object} gameState - Current game state
 * @returns {Object} Game status info
 */
export function getGameStatus(gameState) {
  return {
    state: gameState.state,
    score: gameState.score.totalScore,
    highScore: gameState.score.highScore,
    level: gameState.level.currentLevel,
    lines: gameState.score.linesCleared,
    nextPiece: gameState.nextPiece,
    hasCurrentPiece: !!gameState.currentPiece,
    piecePosition: gameState.currentPiece ? 
      { x: gameState.currentPiece.x, y: gameState.currentPiece.y } : null
  };
}
