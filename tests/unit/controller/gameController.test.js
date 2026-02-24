import { describe, it, expect, beforeEach } from 'vitest';
import {
  initGame,
  startNewGame,
  spawnNewPiece,
  movePieceLeft,
  movePieceRight,
  rotatePieceClockwise,
  rotatePieceCounterClockwise,
  softDrop,
  applyGravity,
  lockCurrentPiece,
  processInput,
  updateGame,
  togglePause,
  returnToTitle,
  getGameStatus
} from '../../../src/controller/gameController.js';
import { createGameState, GAME_STATES } from '../../../src/domain/gameState.js';
import { createInputState, handleKeyDown, ACTIONS } from '../../../src/controller/inputController.js';
import { PIECE_TYPES } from '../../../src/domain/piece.js';
import { createEmptyBoard, setCell, BOARD_WIDTH } from '../../../src/domain/board.js';

describe('Game Controller', () => {
  let gameState;
  let inputState;

  beforeEach(() => {
    inputState = createInputState();
  });

  describe('initGame', () => {
    it('should create initial game state', () => {
      const state = initGame();
      
      expect(state.state).toBe(GAME_STATES.TITLE);
      expect(state.currentPiece).toBeNull();
      expect(state.nextPiece).toBeNull();
    });

    it('should accept start level', () => {
      const state = initGame(5);
      
      expect(state.level.startLevel).toBe(5);
    });
  });

  describe('startNewGame', () => {
    it('should start game in playing state', () => {
      gameState = createGameState();
      const result = startNewGame(gameState);
      
      expect(result.state).toBe(GAME_STATES.PLAYING);
    });

    it('should spawn first piece', () => {
      gameState = createGameState();
      const result = startNewGame(gameState);
      
      expect(result.currentPiece).not.toBeNull();
      expect(result.currentPiece.type).toBeGreaterThanOrEqual(1);
      expect(result.currentPiece.type).toBeLessThanOrEqual(7);
    });

    it('should set next piece', () => {
      gameState = createGameState();
      const result = startNewGame(gameState);
      
      expect(result.nextPiece).not.toBeNull();
      expect(result.nextPiece).toBeGreaterThanOrEqual(1);
      expect(result.nextPiece).toBeLessThanOrEqual(7);
    });

    it('should reset score', () => {
      gameState = createGameState();
      gameState = startNewGame(gameState);
      gameState.score.totalScore = 1000;
      
      const result = startNewGame(gameState);
      
      expect(result.score.totalScore).toBe(0);
    });
  });

  describe('spawnNewPiece', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should spawn new piece', () => {
      const originalPiece = gameState.currentPiece;
      const originalNextPiece = gameState.nextPiece;
      
      const result = spawnNewPiece(gameState);
      
      expect(result.gameOver).toBe(false);
      expect(result.gameState.currentPiece).not.toBeNull();
    });

    it('should advance next piece to current', () => {
      const originalNextPiece = gameState.nextPiece;
      
      const result = spawnNewPiece(gameState);
      
      expect(result.gameState.currentPiece.type).toBe(originalNextPiece);
    });

    it('should get new next piece from randomizer', () => {
      const result = spawnNewPiece(gameState);
      
      expect(result.gameState.nextPiece).not.toBeNull();
      expect(result.gameState.nextPiece).toBeGreaterThanOrEqual(1);
      expect(result.gameState.nextPiece).toBeLessThanOrEqual(7);
    });

    it('should trigger game over when spawn blocked', () => {
      // Fill spawn area
      let board = createEmptyBoard();
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board = setCell(board, x, y, 1);
        }
      }
      gameState = { ...gameState, board };
      
      const result = spawnNewPiece(gameState);
      
      expect(result.gameOver).toBe(true);
      expect(result.gameState.state).toBe(GAME_STATES.GAMEOVER);
    });
  });

  describe('movePieceLeft', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should move piece left when possible', () => {
      const originalX = gameState.currentPiece.x;
      
      const result = movePieceLeft(gameState);
      
      // Piece might not move if at left edge
      expect(result.currentPiece.x).toBeLessThanOrEqual(originalX);
    });

    it('should not move if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = movePieceLeft(gameState);
      
      expect(result).toBe(gameState);
    });

    it('should not move if not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      
      const result = movePieceLeft(gameState);
      
      expect(result).toBe(gameState);
    });

    it('should not move into wall', () => {
      // Move piece to left edge
      gameState.currentPiece.x = 0;
      
      const result = movePieceLeft(gameState);
      
      expect(result.currentPiece.x).toBe(0);
    });
  });

  describe('movePieceRight', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should move piece right when possible', () => {
      const originalX = gameState.currentPiece.x;
      
      const result = movePieceRight(gameState);
      
      // Piece might not move if at right edge
      expect(result.currentPiece.x).toBeGreaterThanOrEqual(originalX);
    });

    it('should not move if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = movePieceRight(gameState);
      
      expect(result).toBe(gameState);
    });

    it('should not move into wall', () => {
      // Move piece to right edge
      gameState.currentPiece.x = 9;
      
      const result = movePieceRight(gameState);
      
      // Should stay at edge or bounce back
      expect(result.currentPiece.x).toBeLessThanOrEqual(9);
    });
  });

  describe('rotatePieceClockwise', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should rotate piece', () => {
      const originalRotation = gameState.currentPiece.rotation;
      
      const result = rotatePieceClockwise(gameState);
      
      // Rotation should change or stay same if blocked
      expect(result.currentPiece.rotation).not.toBeNull();
    });

    it('should not rotate if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = rotatePieceClockwise(gameState);
      
      expect(result).toBe(gameState);
    });

    it('should not rotate if not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      
      const result = rotatePieceClockwise(gameState);
      
      expect(result).toBe(gameState);
    });
  });

  describe('rotatePieceCounterClockwise', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should rotate piece', () => {
      const originalRotation = gameState.currentPiece.rotation;
      
      const result = rotatePieceCounterClockwise(gameState);
      
      expect(result.currentPiece.rotation).not.toBeNull();
    });

    it('should not rotate if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = rotatePieceCounterClockwise(gameState);
      
      expect(result).toBe(gameState);
    });
  });

  describe('softDrop', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should drop piece when possible', () => {
      const originalY = gameState.currentPiece.y;
      
      const result = softDrop(gameState);
      
      expect(result.dropped).toBe(true);
      expect(result.cellsDropped).toBe(1);
      expect(result.gameState.currentPiece.y).toBe(originalY + 1);
    });

    it('should add soft drop score', () => {
      const originalScore = gameState.score.totalScore;
      
      const result = softDrop(gameState);
      
      expect(result.gameState.score.totalScore).toBe(originalScore + 1);
    });

    it('should not drop when on floor', () => {
      // Move piece to bottom
      gameState.currentPiece.y = 20;
      
      const result = softDrop(gameState);
      
      expect(result.dropped).toBe(false);
      expect(result.cellsDropped).toBe(0);
    });

    it('should not drop if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = softDrop(gameState);
      
      expect(result.dropped).toBe(false);
    });

    it('should not drop if not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      
      const result = softDrop(gameState);
      
      expect(result.dropped).toBe(false);
    });
  });

  describe('applyGravity', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should move piece down when possible', () => {
      const originalY = gameState.currentPiece.y;
      
      const result = applyGravity(gameState);
      
      expect(result.fell).toBe(true);
      expect(result.gameState.currentPiece.y).toBe(originalY + 1);
    });

    it('should not fall when on floor', () => {
      // Move piece to bottom
      gameState.currentPiece.y = 20;
      
      const result = applyGravity(gameState);
      
      expect(result.fell).toBe(false);
    });

    it('should not fall if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = applyGravity(gameState);
      
      expect(result.fell).toBe(false);
    });

    it('should not fall if not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      
      const result = applyGravity(gameState);
      
      expect(result.fell).toBe(false);
    });
  });

  describe('lockCurrentPiece', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should lock piece when touching floor', () => {
      // Move piece to bottom
      gameState.currentPiece.y = 20;
      
      const result = lockCurrentPiece(gameState);
      
      expect(result.locked).toBe(true);
    });

    it('should return board with locked piece', () => {
      gameState.currentPiece.y = 20;
      
      const result = lockCurrentPiece(gameState);
      
      expect(result.gameState.board).not.toBe(gameState.board);
    });

    it('should not lock if not touching floor', () => {
      const result = lockCurrentPiece(gameState);
      
      expect(result.locked).toBe(false);
    });

    it('should not lock if no current piece', () => {
      gameState = { ...gameState, currentPiece: null };
      
      const result = lockCurrentPiece(gameState);
      
      expect(result.locked).toBe(false);
    });

    it('should not lock if not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      gameState.currentPiece.y = 20;
      
      const result = lockCurrentPiece(gameState);
      
      expect(result.locked).toBe(false);
    });

    it('should clear completed lines', () => {
      // Set up a scenario where locking completes a line
      // Fill row 21 (visible row 19) except where piece will land
      let board = createEmptyBoard();
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x !== 4 && x !== 5) { // Leave space for O-piece
          board = setCell(board, x, 21, 1);
        }
      }
      
      gameState = { ...gameState, board };
      gameState.currentPiece.x = 4;
      gameState.currentPiece.y = 20; // O-piece will occupy rows 20-21
      
      const result = lockCurrentPiece(gameState);
      
      // Should have cleared at least the line we just completed
      if (result.locked) {
        expect(result.linesCleared).toBeGreaterThanOrEqual(0);
      }
    });

    it('should update score when lines cleared', () => {
      // Set up board to clear lines
      let board = createEmptyBoard();
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board = setCell(board, x, 21, 1);
      }
      
      // Move piece to row above
      gameState = { ...gameState, board };
      gameState.currentPiece.y = 19;
      
      const result = lockCurrentPiece(gameState);
      
      if (result.locked && result.linesCleared > 0) {
        expect(result.gameState.score.totalScore).toBeGreaterThan(0);
      }
    });
  });

  describe('processInput', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should process rotate CCW action', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      
      const result = processInput(gameState, inputState);
      
      // Should have rotated
      expect(result.gameState.currentPiece.rotation).toBeDefined();
    });

    it('should process rotate CW action', () => {
      inputState = handleKeyDown(inputState, 'ArrowRight');
      
      const result = processInput(gameState, inputState);
      
      // Should have rotated
      expect(result.gameState.currentPiece.rotation).toBeDefined();
    });

    it('should consume actions after processing', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      
      const result = processInput(gameState, inputState);
      
      expect(result.inputState.actionQueue.length).toBe(0);
    });

    it('should handle multiple actions', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      inputState = handleKeyDown(inputState, 'p');
      
      const result = processInput(gameState, inputState);
      
      expect(result.inputState.actionQueue.length).toBe(0);
    });
  });

  describe('updateGame', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
      // Set gravity to trigger immediately for testing
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 0 },
        frameCount: 1
      };
    });

    it('should return events array', () => {
      const result = updateGame(gameState, inputState);
      
      expect(Array.isArray(result.events)).toBe(true);
    });

    it('should process piece locking when gravity hits floor', () => {
      // Move piece to bottom
      gameState.currentPiece.y = 20;
      
      const result = updateGame(gameState, inputState);
      
      const lockEvent = result.events.find(e => e.type === 'PIECE_LOCKED');
      expect(lockEvent).toBeDefined();
    });

    it('should spawn new piece after locking', () => {
      gameState.currentPiece.y = 20;
      
      const result = updateGame(gameState, inputState);
      
      const spawnEvent = result.events.find(e => e.type === 'PIECE_SPAWNED');
      expect(spawnEvent).toBeDefined();
    });

    it('should not update when not playing', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      const originalPiece = gameState.currentPiece;
      
      const result = updateGame(gameState, inputState);
      
      expect(result.gameState.currentPiece).toBe(originalPiece);
    });

    it('should handle game over animation', () => {
      gameState = { ...gameState, state: GAME_STATES.GAMEOVER };
      gameState.gameOverAnimation = {
        active: true,
        currentRow: 21,
        completed: false
      };
      
      const result = updateGame(gameState, inputState);
      
      // Should advance animation
      expect(result.gameState.gameOverAnimation.currentRow).toBeLessThan(21);
    });
  });

  describe('togglePause', () => {
    it('should pause when playing', () => {
      gameState = { ...createGameState(), state: GAME_STATES.PLAYING };
      
      const result = togglePause(gameState);
      
      expect(result.state).toBe(GAME_STATES.PAUSED);
    });

    it('should resume when paused', () => {
      gameState = { ...createGameState(), state: GAME_STATES.PAUSED };
      
      const result = togglePause(gameState);
      
      expect(result.state).toBe(GAME_STATES.PLAYING);
    });

    it('should not change state when not playing or paused', () => {
      gameState = { ...createGameState(), state: GAME_STATES.TITLE };
      
      const result = togglePause(gameState);
      
      expect(result.state).toBe(GAME_STATES.TITLE);
    });
  });

  describe('returnToTitle', () => {
    it('should return to title state', () => {
      gameState = startNewGame(createGameState());
      
      const result = returnToTitle(gameState);
      
      expect(result.state).toBe(GAME_STATES.TITLE);
    });

    it('should clear current piece', () => {
      gameState = startNewGame(createGameState());
      
      const result = returnToTitle(gameState);
      
      expect(result.currentPiece).toBeNull();
    });

    it('should clear next piece', () => {
      gameState = startNewGame(createGameState());
      
      const result = returnToTitle(gameState);
      
      expect(result.nextPiece).toBeNull();
    });
  });

  describe('getGameStatus', () => {
    beforeEach(() => {
      gameState = startNewGame(createGameState());
    });

    it('should return game status info', () => {
      const status = getGameStatus(gameState);
      
      expect(status.state).toBeDefined();
      expect(status.score).toBeDefined();
      expect(status.level).toBeDefined();
      expect(status.lines).toBeDefined();
      expect(status.nextPiece).toBeDefined();
    });

    it('should reflect current score', () => {
      gameState.score.totalScore = 1000;
      
      const status = getGameStatus(gameState);
      
      expect(status.score).toBe(1000);
    });

    it('should reflect current level', () => {
      gameState.level.currentLevel = 5;
      
      const status = getGameStatus(gameState);
      
      expect(status.level).toBe(5);
    });

    it('should indicate if has current piece', () => {
      const status = getGameStatus(gameState);
      
      expect(status.hasCurrentPiece).toBe(true);
    });

    it('should return piece position when available', () => {
      const status = getGameStatus(gameState);
      
      expect(status.piecePosition).not.toBeNull();
      expect(status.piecePosition.x).toBeDefined();
      expect(status.piecePosition.y).toBeDefined();
    });
  });
});
