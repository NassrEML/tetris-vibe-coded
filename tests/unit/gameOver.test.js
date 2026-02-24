import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkGameOver,
  triggerGameOver,
  advanceGameOverAnimation,
  isGameOverAnimationActive,
  isGameOverAnimationComplete,
  resetGameOverAnimation,
  createFilledBoard,
  getAnimationRow,
  getAnimationProgress
} from '../../src/domain/gameOver.js';
import {
  createGameState,
  startGame,
  GAME_STATES
} from '../../src/domain/gameState.js';
import { createEmptyBoard, setCell, BOARD_WIDTH } from '../../src/domain/board.js';
import { PIECE_TYPES } from '../../src/domain/piece.js';

describe('Game Over Domain', () => {
  let gameState;
  let board;

  beforeEach(() => {
    gameState = createGameState();
    board = createEmptyBoard();
  });

  describe('checkGameOver', () => {
    it('should return false when spawn area is clear', () => {
      expect(checkGameOver(board, PIECE_TYPES.I)).toBe(false);
      expect(checkGameOver(board, PIECE_TYPES.O)).toBe(false);
      expect(checkGameOver(board, PIECE_TYPES.T)).toBe(false);
    });

    it('should return true when spawn area is blocked', () => {
      // Block spawn area for T-piece
      board = setCell(board, 4, 0, 1);
      
      expect(checkGameOver(board, PIECE_TYPES.T)).toBe(true);
    });

    it('should detect collision in hidden rows', () => {
      // Block hidden row for O-piece
      board = setCell(board, 4, 1, 1);
      
      expect(checkGameOver(board, PIECE_TYPES.O)).toBe(true);
    });

    it('should return true when board is nearly full', () => {
      // Fill most of the board, leaving only bottom rows
      for (let y = 0; y < 18; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board = setCell(board, x, y, 1);
        }
      }
      
      expect(checkGameOver(board, PIECE_TYPES.I)).toBe(true);
    });
  });

  describe('triggerGameOver', () => {
    it('should set game state to gameover', () => {
      gameState = startGame(gameState);
      
      const result = triggerGameOver(gameState);
      
      expect(result.state).toBe(GAME_STATES.GAMEOVER);
      expect(result.gameOverAnimation).not.toBeNull();
      expect(result.gameOverAnimation.active).toBe(true);
    });

    it('should initialize animation starting from bottom', () => {
      gameState = startGame(gameState);
      
      const result = triggerGameOver(gameState);
      
      expect(result.gameOverAnimation.currentRow).toBe(21);
      expect(result.gameOverAnimation.completed).toBe(false);
    });

    it('should not mutate original state', () => {
      gameState = startGame(gameState);
      const originalState = gameState.state;
      
      triggerGameOver(gameState);
      
      expect(gameState.state).toBe(originalState);
    });
  });

  describe('advanceGameOverAnimation', () => {
    it('should fill one row per call', () => {
      gameState = triggerGameOver(gameState);
      
      const result = advanceGameOverAnimation(gameState);
      
      expect(result.completed).toBe(false);
      expect(result.gameState.board[21].every(cell => cell !== 0)).toBe(true);
    });

    it('should advance to next row on each call', () => {
      gameState = triggerGameOver(gameState);
      
      const result1 = advanceGameOverAnimation(gameState);
      expect(result1.gameState.gameOverAnimation.currentRow).toBe(20);
      
      const result2 = advanceGameOverAnimation(result1.gameState);
      expect(result2.gameState.gameOverAnimation.currentRow).toBe(19);
    });

    it('should complete when reaching top', () => {
      gameState = triggerGameOver(gameState);
      
      // Advance through all rows
      let result = { gameState };
      for (let i = 0; i < 25; i++) {
        result = advanceGameOverAnimation(result.gameState);
      }
      
      expect(result.completed).toBe(true);
      expect(result.gameState.gameOverAnimation.completed).toBe(true);
    });

    it('should fill entire board when complete', () => {
      gameState = triggerGameOver(gameState);
      
      // Advance through all rows
      let result = { gameState };
      while (!result.completed) {
        result = advanceGameOverAnimation(result.gameState);
      }
      
      // Check all rows are filled
      for (let y = 0; y < result.gameState.board.length; y++) {
        expect(result.gameState.board[y].every(cell => cell !== 0)).toBe(true);
      }
    });

    it('should return completed=true if no animation active', () => {
      const result = advanceGameOverAnimation(gameState);
      
      expect(result.completed).toBe(true);
      expect(result.gameState).toBe(gameState);
    });

    it('should not mutate original state', () => {
      gameState = triggerGameOver(gameState);
      const originalBoard = JSON.stringify(gameState.board);
      
      advanceGameOverAnimation(gameState);
      
      expect(JSON.stringify(gameState.board)).toBe(originalBoard);
    });
  });

  describe('isGameOverAnimationActive', () => {
    it('should return false for new game state', () => {
      expect(isGameOverAnimationActive(gameState)).toBe(false);
    });

    it('should return true when animation is active', () => {
      gameState = triggerGameOver(gameState);
      expect(isGameOverAnimationActive(gameState)).toBe(true);
    });

    it('should return false when animation is completed', () => {
      gameState = triggerGameOver(gameState);
      
      let result = { gameState };
      while (!result.completed) {
        result = advanceGameOverAnimation(result.gameState);
      }
      
      expect(isGameOverAnimationActive(result.gameState)).toBe(false);
    });
  });

  describe('isGameOverAnimationComplete', () => {
    it('should return false initially', () => {
      gameState = triggerGameOver(gameState);
      expect(isGameOverAnimationComplete(gameState)).toBe(false);
    });

    it('should return true when animation completes', () => {
      gameState = triggerGameOver(gameState);
      
      let result = { gameState };
      while (!result.completed) {
        result = advanceGameOverAnimation(result.gameState);
      }
      
      expect(isGameOverAnimationComplete(result.gameState)).toBe(true);
    });
  });

  describe('resetGameOverAnimation', () => {
    it('should clear animation state', () => {
      gameState = triggerGameOver(gameState);
      
      const result = resetGameOverAnimation(gameState);
      
      expect(result.gameOverAnimation).toBeNull();
    });

    it('should not mutate original state', () => {
      gameState = triggerGameOver(gameState);
      
      resetGameOverAnimation(gameState);
      
      expect(gameState.gameOverAnimation).not.toBeNull();
    });
  });

  describe('createFilledBoard', () => {
    it('should create a completely filled board', () => {
      const filledBoard = createFilledBoard();
      
      for (let y = 0; y < filledBoard.length; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          expect(filledBoard[y][x]).not.toBe(0);
          expect(filledBoard[y][x]).toBeGreaterThanOrEqual(1);
          expect(filledBoard[y][x]).toBeLessThanOrEqual(7);
        }
      }
    });

    it('should have varied colors', () => {
      const filledBoard = createFilledBoard();
      
      // Check that there are different colors in the board
      const firstColor = filledBoard[0][0];
      let hasDifferentColor = false;
      
      for (let y = 0; y < filledBoard.length && !hasDifferentColor; y++) {
        for (let x = 0; x < BOARD_WIDTH && !hasDifferentColor; x++) {
          if (filledBoard[y][x] !== firstColor) {
            hasDifferentColor = true;
          }
        }
      }
      
      expect(hasDifferentColor).toBe(true);
    });
  });

  describe('getAnimationRow', () => {
    it('should return -1 when not animating', () => {
      expect(getAnimationRow(gameState)).toBe(-1);
    });

    it('should return current row during animation', () => {
      gameState = triggerGameOver(gameState);
      expect(getAnimationRow(gameState)).toBe(21);
      
      const result = advanceGameOverAnimation(gameState);
      expect(getAnimationRow(result.gameState)).toBe(20);
    });
  });

  describe('getAnimationProgress', () => {
    it('should return 100 when not animating', () => {
      expect(getAnimationProgress(gameState)).toBe(100);
    });

    it('should return 0 at start of animation', () => {
      gameState = triggerGameOver(gameState);
      // At row 21 (start), no rows filled yet, progress should be near 0
      expect(getAnimationProgress(gameState)).toBeLessThan(10);
    });

    it('should increase as animation progresses', () => {
      gameState = triggerGameOver(gameState);
      const startProgress = getAnimationProgress(gameState);
      
      const result = advanceGameOverAnimation(gameState);
      const midProgress = getAnimationProgress(result.gameState);
      
      expect(midProgress).toBeGreaterThan(startProgress);
    });

    it('should return 100 when animation completes', () => {
      gameState = triggerGameOver(gameState);
      
      let result = { gameState };
      while (!result.completed) {
        result = advanceGameOverAnimation(result.gameState);
      }
      
      expect(getAnimationProgress(result.gameState)).toBe(100);
    });
  });

  describe('Integration with game state', () => {
    it('should properly transition through game over sequence', () => {
      // Start a game
      gameState = startGame(gameState);
      expect(gameState.state).toBe(GAME_STATES.PLAYING);
      
      // Trigger game over
      gameState = triggerGameOver(gameState);
      expect(gameState.state).toBe(GAME_STATES.GAMEOVER);
      expect(isGameOverAnimationActive(gameState)).toBe(true);
      
      // Run animation
      let animationActive = true;
      while (animationActive) {
        const result = advanceGameOverAnimation(gameState);
        gameState = result.gameState;
        animationActive = !result.completed;
      }
      
      expect(isGameOverAnimationComplete(gameState)).toBe(true);
      expect(gameState.state).toBe(GAME_STATES.GAMEOVER);
    });
  });
});
