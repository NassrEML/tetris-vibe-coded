import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGameState,
  startGame,
  setGameOver,
  pauseGame,
  resumeGame,
  returnToTitle,
  spawnPiece,
  setNextPiece,
  updateBoard,
  updateCurrentPiece,
  updateScore,
  updateLevel,
  updateGravity,
  updateDAS,
  updateLock,
  updateRandomizer,
  incrementFrame,
  isPlaying,
  isGameOver,
  isPaused,
  isAtTitle,
  getGameInfo,
  GAME_STATES
} from '../../src/domain/gameState.js';
import { createEmptyBoard } from '../../src/domain/board.js';
import { createScoreState } from '../../src/domain/scoring.js';
import { createLevelState } from '../../src/domain/level.js';
import { createRandomizer } from '../../src/domain/randomizer.js';
import { createGravity } from '../../src/domain/gravity.js';
import { createDAS } from '../../src/domain/das.js';
import { createLockState } from '../../src/domain/lock.js';
import { createPiece } from '../../src/domain/piece.js';

describe('Game State Integration', () => {
  let gameState;

  beforeEach(() => {
    gameState = createGameState(0);
  });

  describe('Game State Creation', () => {
    it('should create initial game state with all properties', () => {
      expect(gameState.state).toBe(GAME_STATES.TITLE);
      expect(gameState.board).toBeDefined();
      expect(gameState.currentPiece).toBeNull();
      expect(gameState.nextPiece).toBeNull();
      expect(gameState.score).toBeDefined();
      expect(gameState.level).toBeDefined();
      expect(gameState.randomizer).toBeDefined();
      expect(gameState.gravity).toBeDefined();
      expect(gameState.das).toBeDefined();
      expect(gameState.lock).toBeDefined();
      expect(gameState.frameCount).toBe(0);
    });

    it('should create state with custom start level', () => {
      const state = createGameState(5);
      expect(state.level.currentLevel).toBe(5);
    });
  });

  describe('State Transitions', () => {
    it('should transition from title to playing', () => {
      const playing = startGame(gameState, 0);
      expect(playing.state).toBe(GAME_STATES.PLAYING);
    });

    it('should set game over', () => {
      gameState = startGame(gameState, 0);
      const over = setGameOver(gameState);
      expect(over.state).toBe(GAME_STATES.GAMEOVER);
      expect(over.gameOverAnimation).not.toBeNull();
    });

    it('should pause game when playing', () => {
      gameState = startGame(gameState, 0);
      const paused = pauseGame(gameState);
      expect(paused.state).toBe(GAME_STATES.PAUSED);
    });

    it('should not pause when not playing', () => {
      const paused = pauseGame(gameState);
      expect(paused.state).toBe(GAME_STATES.TITLE);
    });

    it('should resume game when paused', () => {
      gameState = startGame(gameState, 0);
      gameState = pauseGame(gameState);
      const resumed = resumeGame(gameState);
      expect(resumed.state).toBe(GAME_STATES.PLAYING);
    });

    it('should not resume when not paused', () => {
      gameState = startGame(gameState, 0);
      const notResumed = resumeGame(gameState);
      expect(notResumed.state).toBe(GAME_STATES.PLAYING);
    });

    it('should return to title', () => {
      gameState = startGame(gameState, 0);
      const title = returnToTitle(gameState);
      expect(title.state).toBe(GAME_STATES.TITLE);
      expect(title.currentPiece).toBeNull();
      expect(title.nextPiece).toBeNull();
    });
  });

  describe('Piece Management', () => {
    it('should spawn piece', () => {
      const piece = createPiece(1);
      const spawned = spawnPiece(gameState, piece);
      expect(spawned.currentPiece).toEqual(piece);
    });

    it('should reset DAS and lock when spawning', () => {
      const piece = createPiece(1);
      const spawned = spawnPiece(gameState, piece);
      expect(spawned.das.counter).toBe(0);
      expect(spawned.lock.isLocked).toBe(false);
    });

    it('should set next piece', () => {
      const updated = setNextPiece(gameState, 3);
      expect(updated.nextPiece).toBe(3);
    });
  });

  describe('State Updates', () => {
    it('should update board', () => {
      const newBoard = createEmptyBoard();
      newBoard[2][0] = 1;
      const updated = updateBoard(gameState, newBoard);
      expect(updated.board[2][0]).toBe(1);
    });

    it('should update current piece', () => {
      const piece = createPiece(2);
      const updated = updateCurrentPiece(gameState, piece);
      expect(updated.currentPiece).toEqual(piece);
    });

    it('should update score', () => {
      const newScore = { ...createScoreState(), totalScore: 1000 };
      const updated = updateScore(gameState, newScore);
      expect(updated.score.totalScore).toBe(1000);
    });

    it('should update level', () => {
      const newLevel = createLevelState(5);
      const updated = updateLevel(gameState, newLevel);
      expect(updated.level.currentLevel).toBe(5);
    });

    it('should update gravity', () => {
      const newGravity = createGravity(10);
      const updated = updateGravity(gameState, newGravity);
      expect(updated.gravity.level).toBe(10);
    });

    it('should update DAS', () => {
      const newDAS = { ...gameState.das, direction: 1 };
      const updated = updateDAS(gameState, newDAS);
      expect(updated.das.direction).toBe(1);
    });

    it('should update lock', () => {
      const newLock = { ...createLockState(), lockTimer: 10 };
      const updated = updateLock(gameState, newLock);
      expect(updated.lock.lockTimer).toBe(10);
    });

    it('should update randomizer', () => {
      const newRandomizer = createRandomizer();
      const updated = updateRandomizer(gameState, newRandomizer);
      expect(updated.randomizer).toEqual(newRandomizer);
    });

    it('should increment frame', () => {
      const incremented = incrementFrame(gameState);
      expect(incremented.frameCount).toBe(1);
    });

    it('should increment frame multiple times', () => {
      let state = gameState;
      for (let i = 0; i < 5; i++) {
        state = incrementFrame(state);
      }
      expect(state.frameCount).toBe(5);
    });
  });

  describe('State Checkers', () => {
    it('should check if playing', () => {
      expect(isPlaying(gameState)).toBe(false);
      gameState = startGame(gameState, 0);
      expect(isPlaying(gameState)).toBe(true);
    });

    it('should check if game over', () => {
      expect(isGameOver(gameState)).toBe(false);
      gameState = setGameOver(gameState);
      expect(isGameOver(gameState)).toBe(true);
    });

    it('should check if paused', () => {
      expect(isPaused(gameState)).toBe(false);
      gameState = startGame(gameState, 0);
      gameState = pauseGame(gameState);
      expect(isPaused(gameState)).toBe(true);
    });

    it('should check if at title', () => {
      expect(isAtTitle(gameState)).toBe(true);
      gameState = startGame(gameState, 0);
      expect(isAtTitle(gameState)).toBe(false);
    });
  });

  describe('Game Info', () => {
    it('should get game info for display', () => {
      gameState = startGame(gameState, 5);
      gameState = spawnPiece(gameState, createPiece(1));
      gameState = setNextPiece(gameState, 2);
      
      const info = getGameInfo(gameState);
      
      expect(info.state).toBe(GAME_STATES.PLAYING);
      expect(info.level).toBe(5);
      expect(info.nextPiece).toBe(2);
      expect(info).toHaveProperty('score');
      expect(info).toHaveProperty('highScore');
      expect(info).toHaveProperty('lines');
    });

    it('should provide safe defaults for null state', () => {
      const emptyState = createGameState(0);
      const info = getGameInfo(emptyState);
      
      expect(info.state).toBe(GAME_STATES.TITLE);
      expect(info.score).toBe(0);
      expect(info.lines).toBe(0);
      expect(info.nextPiece).toBeNull();
    });
  });

  describe('Complete Game Flow', () => {
    it('should handle full game lifecycle', () => {
      // Create
      let state = createGameState(0);
      expect(isAtTitle(state)).toBe(true);
      
      // Start
      state = startGame(state, 3);
      expect(isPlaying(state)).toBe(true);
      expect(state.level.currentLevel).toBe(3);
      
      // Spawn piece
      state = spawnPiece(state, createPiece(1));
      expect(state.currentPiece).not.toBeNull();
      
      // Update score
      const newScore = { ...state.score, totalScore: 500, linesCleared: 2 };
      state = updateScore(state, newScore);
      expect(state.score.totalScore).toBe(500);
      
      // Pause
      state = pauseGame(state);
      expect(isPaused(state)).toBe(true);
      
      // Resume
      state = resumeGame(state);
      expect(isPlaying(state)).toBe(true);
      
      // Game over
      state = setGameOver(state);
      expect(isGameOver(state)).toBe(true);
      
      // Return to title
      state = returnToTitle(state);
      expect(isAtTitle(state)).toBe(true);
    });
  });
});
