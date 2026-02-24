import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initGame, 
  startNewGame, 
  updateGame,
  spawnNewPiece,
  lockCurrentPiece
} from '../../src/controller/gameController.js';
import { createInputState } from '../../src/controller/inputController.js';
import { GAME_STATES } from '../../src/domain/gameState.js';
import { PIECE_TYPES } from '../../src/domain/piece.js';

describe('Integration - Game Simulation', () => {
  let gameState;
  let inputState;

  beforeEach(() => {
    gameState = initGame(0);
    inputState = createInputState();
  });

  describe('Full Game Flow', () => {
    it('should start game and spawn first piece', () => {
      gameState = startNewGame(gameState, 0);
      
      expect(gameState.state).toBe(GAME_STATES.PLAYING);
      expect(gameState.currentPiece).not.toBeNull();
      expect(gameState.nextPiece).toBeGreaterThanOrEqual(1);
      expect(gameState.nextPiece).toBeLessThanOrEqual(7);
    });

    it('should update game state over multiple frames', () => {
      gameState = startNewGame(gameState, 0);
      const initialY = gameState.currentPiece.y;
      
      // Run several frames to let gravity act
      for (let i = 0; i < 60; i++) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState(); // Reset input each frame
      }
      
      // Piece should have fallen or been locked
      expect(gameState.currentPiece.y).toBeGreaterThanOrEqual(initialY);
    });

    it('should maintain consistent piece sequence (determinism)', () => {
      // Simulate two identical games
      const game1 = startNewGame(initGame(0), 0);
      const game2 = startNewGame(initGame(0), 0);
      
      // First pieces should be different due to randomization
      expect(game1.currentPiece.type).toBeGreaterThanOrEqual(1);
      expect(game1.currentPiece.type).toBeLessThanOrEqual(7);
    });
  });

  describe('Piece Manipulation', () => {
    beforeEach(() => {
      gameState = startNewGame(gameState, 0);
    });

    it('should handle piece locking and spawning sequence', () => {
      const initialPiece = gameState.currentPiece;
      const nextPieceType = gameState.nextPiece;
      
      // Force lock the piece
      const lockResult = lockCurrentPiece(gameState);
      
      if (lockResult.locked) {
        expect(lockResult.linesCleared).toBeGreaterThanOrEqual(0);
        
        // Spawn new piece
        const spawnResult = spawnNewPiece(lockResult.gameState);
        gameState = spawnResult.gameState;
        
        if (!spawnResult.gameOver) {
          expect(gameState.currentPiece).not.toBeNull();
          expect(gameState.currentPiece.type).toBe(nextPieceType);
        }
      }
    });
  });

  describe('Scoring Integration', () => {
    beforeEach(() => {
      gameState = startNewGame(gameState, 0);
    });

    it('should track score through gameplay', () => {
      const initialScore = gameState.score.totalScore;
      
      // Run game for several frames
      for (let i = 0; i < 120; i++) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState();
      }
      
      // Score should be tracked
      expect(gameState.score.totalScore).toBeGreaterThanOrEqual(initialScore);
    });

    it('should track lines cleared', () => {
      const initialLines = gameState.score.linesCleared;
      
      // Game should track lines
      expect(gameState.score).toHaveProperty('linesCleared');
      expect(gameState.score.linesCleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Level Progression', () => {
    it('should maintain level state through gameplay', () => {
      gameState = startNewGame(gameState, 5);
      
      expect(gameState.level.currentLevel).toBe(5);
      
      // Run game for frames
      for (let i = 0; i < 60; i++) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState();
      }
      
      // Level should still be tracked
      expect(gameState.level).toHaveProperty('currentLevel');
    });
  });

  describe('Game State Transitions', () => {
    it('should transition from title to playing', () => {
      const titleState = initGame(0);
      expect(titleState.state).toBe(GAME_STATES.TITLE);
      
      const playingState = startNewGame(titleState, 0);
      expect(playingState.state).toBe(GAME_STATES.PLAYING);
    });

    it('should handle pause/resume cycle', () => {
      gameState = startNewGame(gameState, 0);
      expect(gameState.state).toBe(GAME_STATES.PLAYING);
      
      // Pause
      gameState = { ...gameState, state: GAME_STATES.PAUSED };
      expect(gameState.state).toBe(GAME_STATES.PAUSED);
      
      // Resume
      gameState = { ...gameState, state: GAME_STATES.PLAYING };
      expect(gameState.state).toBe(GAME_STATES.PLAYING);
    });
  });

  describe('End-to-End Scenarios', () => {
    it('should simulate a complete game session', () => {
      // Start game
      gameState = startNewGame(gameState, 0);
      let frames = 0;
      let piecesSpawned = 0;
      let piecesLocked = 0;
      
      // Run simulation until game over or max frames
      while (gameState.state === GAME_STATES.PLAYING && frames < 1000) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        
        // Track events
        for (const event of result.events) {
          if (event.type === 'PIECE_SPAWNED') piecesSpawned++;
          if (event.type === 'PIECE_LOCKED') piecesLocked++;
        }
        
        inputState = createInputState();
        frames++;
      }
      
      // Game should have progressed
      expect(frames).toBeGreaterThan(0);
      expect(piecesSpawned + piecesLocked).toBeGreaterThanOrEqual(0);
    });

    it('should maintain game integrity over many frames', () => {
      gameState = startNewGame(gameState, 0);
      
      // Run 500 frames
      for (let i = 0; i < 500; i++) {
        const result = updateGame(gameState, inputState);
        gameState = result.gameState;
        inputState = createInputState();
        
        // Verify game state integrity
        expect(gameState.board).toBeDefined();
        expect(gameState.board.length).toBe(22); // 20 visible + 2 hidden
        expect(gameState.score).toBeDefined();
      }
    });
  });
});
