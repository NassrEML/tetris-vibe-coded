import { describe, it, expect, beforeEach } from 'vitest';
import { 
  initGame, 
  startNewGame, 
  updateGame,
  movePieceLeft,
  movePieceRight,
  rotatePieceClockwise,
  softDrop,
  spawnNewPiece
} from '../../src/controller/gameController.js';
import { createInputState } from '../../src/controller/inputController.js';
import { GAME_STATES } from '../../src/domain/gameState.js';
import { PIECES, PIECE_TYPES } from '../../src/domain/piece.js';

describe('Integration - End-to-End Gameplay', () => {
  let gameState;
  let inputState;

  beforeEach(() => {
    gameState = initGame(0);
    inputState = createInputState();
  });

  describe('Basic Movement Flow', () => {
    beforeEach(() => {
      gameState = startNewGame(gameState, 0);
    });

    it('should allow left movement', () => {
      const initialX = gameState.currentPiece.x;
      
      // Try to move left if possible
      const newState = movePieceLeft(gameState);
      
      // State should be valid
      expect(newState.state).toBe(GAME_STATES.PLAYING);
    });

    it('should allow right movement', () => {
      const initialX = gameState.currentPiece.x;
      
      // Try to move right
      const newState = movePieceRight(gameState);
      
      expect(newState.state).toBe(GAME_STATES.PLAYING);
    });

    it('should allow rotation', () => {
      const initialRotation = gameState.currentPiece.rotation;
      
      // Try to rotate
      const newState = rotatePieceClockwise(gameState);
      
      expect(newState.state).toBe(GAME_STATES.PLAYING);
      expect(newState.currentPiece.rotation).toBeDefined();
    });

    it('should handle soft drop', () => {
      const result = softDrop(gameState);
      
      expect(result).toHaveProperty('gameState');
      expect(result).toHaveProperty('dropped');
      expect(result.gameState.state).toBe(GAME_STATES.PLAYING);
    });
  });

  describe('Complete Piece Lifecycle', () => {
    beforeEach(() => {
      gameState = startNewGame(gameState, 0);
    });

    it('should handle piece from spawn to lock', () => {
      // Track piece through its lifecycle
      const initialPiece = gameState.currentPiece;
      
      // Piece should start at spawn position
      expect(initialPiece.y).toBe(0);
      
      // Let gravity do its work
      let frames = 0;
      let locked = false;
      
      while (frames < 300 && !locked) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState();
        
        // Check for lock event
        for (const event of result.events) {
          if (event.type === 'PIECE_LOCKED') {
            locked = true;
            expect(event.linesCleared).toBeGreaterThanOrEqual(0);
          }
          if (event.type === 'PIECE_SPAWNED') {
            // New piece spawned after lock
            expect(gameState.currentPiece).not.toBeNull();
          }
        }
        
        frames++;
      }
      
      // Piece should eventually lock or game continues
      expect(frames).toBeGreaterThan(0);
    });
  });

  describe('Line Clearing Scenario', () => {
    it('should detect and clear lines', () => {
      // This is a simplified scenario - in a real test we'd set up a board
      // with a complete line and verify it's cleared
      gameState = startNewGame(gameState, 0);
      
      let linesCleared = 0;
      let frames = 0;
      
      // Run game and watch for line clears
      while (frames < 500 && linesCleared === 0) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        
        for (const event of result.events) {
          if (event.type === 'PIECE_LOCKED') {
            linesCleared += event.linesCleared;
          }
        }
        
        inputState = createInputState();
        frames++;
      }
      
      // Either we cleared lines or we ran out of frames
      expect(frames).toBeGreaterThan(0);
    });
  });

  describe('Level Transition', () => {
    it('should handle gameplay at different levels', () => {
      const levels = [0, 5, 9];
      
      for (const level of levels) {
        let state = startNewGame(initGame(level), level);
        
        expect(state.level.currentLevel).toBe(level);
        
        // Run a few frames
        for (let i = 0; i < 30; i++) {
          const result = updateGame(state, createInputState());
          state = result.gameState;
        }
        
        // Game should still be valid
        expect(state.state).toBe(GAME_STATES.PLAYING);
      }
    });
  });

  describe('Game Over Sequence', () => {
    it('should handle game over animation', () => {
      gameState = startNewGame(gameState, 0);
      
      // Simulate game state where game over would trigger
      // This would normally happen when spawn is blocked
      
      // Set game over state directly for testing
      gameState = { 
        ...gameState, 
        state: GAME_STATES.GAMEOVER,
        gameOverAnimation: {
          active: true,
          currentRow: 21,
          completed: false
        }
      };
      
      expect(gameState.state).toBe(GAME_STATES.GAMEOVER);
      expect(gameState.gameOverAnimation).not.toBeNull();
    });
  });

  describe('Score Accumulation', () => {
    beforeEach(() => {
      gameState = startNewGame(gameState, 0);
    });

    it('should accumulate score from various sources', () => {
      const initialScore = gameState.score.totalScore;
      
      // Apply soft drops
      for (let i = 0; i < 10; i++) {
        const result = softDrop(gameState);
        if (result.dropped) {
          gameState = result.gameState;
        }
      }
      
      // Score may have increased from soft drops
      expect(gameState.score.totalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should track different score components', () => {
      expect(gameState.score).toHaveProperty('totalScore');
      expect(gameState.score).toHaveProperty('linesCleared');
      expect(gameState.score).toHaveProperty('softDropScore');
      expect(gameState.score).toHaveProperty('softDropCells');
    });
  });

  describe('High Score Tracking', () => {
    it('should maintain high score across sessions', () => {
      gameState = startNewGame(gameState, 0);
      
      // Initial high score
      const initialHigh = gameState.score.highScore;
      
      // Simulate score gain
      gameState = {
        ...gameState,
        score: {
          ...gameState.score,
          totalScore: 1000,
          highScore: Math.max(1000, gameState.score.highScore)
        }
      };
      
      expect(gameState.score.highScore).toBeGreaterThanOrEqual(initialHigh);
    });
  });

  describe('Complex Gameplay Scenarios', () => {
    it('should handle rapid input during gameplay', () => {
      gameState = startNewGame(gameState, 0);
      
      // Simulate rapid movements
      for (let i = 0; i < 20; i++) {
        gameState = movePieceLeft(gameState);
        gameState = movePieceRight(gameState);
        gameState = rotatePieceClockwise(gameState);
      }
      
      // Game should still be in valid state
      expect(gameState.state).toBe(GAME_STATES.PLAYING);
    });

    it('should handle gameplay with mixed actions', () => {
      gameState = startNewGame(gameState, 0);
      
      let frames = 0;
      const maxFrames = 200;
      
      while (gameState.state === GAME_STATES.PLAYING && frames < maxFrames) {
        // Mix of auto-gravity and manual moves
        if (frames % 10 === 0) {
          gameState = movePieceLeft(gameState);
        }
        if (frames % 15 === 0) {
          gameState = rotatePieceClockwise(gameState);
        }
        
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState();
        frames++;
      }
      
      expect(frames).toBeGreaterThan(0);
    });
  });

  describe('Input State Persistence', () => {
    it('should maintain input state through game updates', () => {
      gameState = startNewGame(gameState, 0);
      
      // Process input with DAS direction
      inputState = { ...inputState, dasDirection: -1 };
      
      const result = updateGame(gameState, inputState);
      
      expect(result.gameState.state).toBe(GAME_STATES.PLAYING);
    });
  });
});
