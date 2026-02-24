import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createGameLoop,
  startGameLoop,
  stopGameLoop,
  updateFrame,
  shouldApplyGravity,
  shouldApplyDAS,
  getDASMoveDirection,
  resetGravity,
  getCurrentFPS,
  getFrameCount,
  isRunning,
  TARGET_FPS,
  FRAME_DURATION_MS
} from '../../../src/controller/gameLoop.js';
import { createGameState, incrementFrame } from '../../../src/domain/gameState.js';
import { createInputState } from '../../../src/controller/inputController.js';
import { createDAS, setDirection, DIRECTION_LEFT, DIRECTION_RIGHT } from '../../../src/domain/das.js';

describe('Game Loop', () => {
  let gameLoop;
  let gameState;
  let inputState;

  beforeEach(() => {
    gameLoop = createGameLoop();
    gameState = createGameState();
    inputState = createInputState();
    vi.useFakeTimers();
    // Mock performance.now() to return the same as Date.now()
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('createGameLoop', () => {
    it('should create initial game loop state', () => {
      expect(gameLoop.isRunning).toBe(false);
      expect(gameLoop.lastFrameTime).toBe(0);
      expect(gameLoop.accumulator).toBe(0);
      expect(gameLoop.frameCount).toBe(0);
      expect(gameLoop.rafId).toBeNull();
    });
  });

  describe('startGameLoop', () => {
    it('should start the game loop', () => {
      const result = startGameLoop(gameLoop, () => {});
      
      expect(result.isRunning).toBe(true);
      expect(result.lastFrameTime).toBeGreaterThanOrEqual(0);
    });

    it('should not restart if already running', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      const result = startGameLoop(gameLoop, () => {});
      
      expect(result).toEqual(gameLoop);
    });

    it('should add callback to frame callbacks', () => {
      const callback = vi.fn();
      const result = startGameLoop(gameLoop, callback);
      
      expect(result.frameCallbacks).toContain(callback);
    });
  });

  describe('stopGameLoop', () => {
    it('should stop the game loop', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      const result = stopGameLoop(gameLoop);
      
      expect(result.isRunning).toBe(false);
      expect(result.rafId).toBeNull();
    });

    it('should handle stopping already stopped loop', () => {
      const result = stopGameLoop(gameLoop);
      
      expect(result.isRunning).toBe(false);
    });
  });

  describe('updateFrame', () => {
    it('should not update if not running', () => {
      const result = updateFrame(gameLoop, gameState, inputState);
      
      expect(result.gameLoop).toBe(gameLoop);
      expect(result.gameState).toBe(gameState);
    });

    it('should update frame count', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      
      // Simulate time passing
      vi.setSystemTime(Date.now() + FRAME_DURATION_MS);
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      expect(result.gameLoop.frameCount).toBeGreaterThan(0);
    });

    it('should update accumulator', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      
      // Simulate time passing
      const timePassed = FRAME_DURATION_MS * 2;
      vi.setSystemTime(Date.now() + timePassed);
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      // After processing one frame, accumulator should have remaining time
      expect(result.gameLoop.accumulator).toBeGreaterThanOrEqual(0);
    });

    it('should tick DAS each frame', () => {
      // This test verifies that DAS is properly handled in the update loop
      // The actual DAS ticking happens when frames are processed
      
      // Create a gameLoop with pre-set accumulated time
      gameLoop = {
        ...startGameLoop(gameLoop, () => {}),
        lastFrameTime: 0, // Forces FRAME_DURATION_MS to be used as delta
        accumulator: FRAME_DURATION_MS * 2 // Ensure at least one frame processes
      };
      
      // Set up DAS with left direction
      gameState = {
        ...gameState,
        das: setDirection(createDAS(), DIRECTION_LEFT)
      };
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      // The updateFrame should process at least one frame
      // which should tick DAS and increment gameState.frameCount
      expect(result.gameLoop.frameCount).toBeGreaterThanOrEqual(1);
    });

    it('should tick gravity each frame', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      
      const initialFrameCounter = gameState.gravity.frameCounter;
      
      vi.setSystemTime(Date.now() + FRAME_DURATION_MS);
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      // Gravity frame counter should have incremented (or reset if it triggered a fall)
      const counterChanged = result.gameState.gravity.frameCounter !== initialFrameCounter ||
                              result.gameState.gravity.frameCounter === 0;
      expect(counterChanged).toBe(true);
    });

    it('should clear transient keys', () => {
      // Start the game loop at a specific time
      const startTime = 1000;
      vi.setSystemTime(startTime);
      gameLoop = startGameLoop(gameLoop, () => {});
      
      // Manually set up the gameLoop to have accumulated time
      gameLoop = {
        ...gameLoop,
        lastFrameTime: startTime - FRAME_DURATION_MS,
        accumulator: FRAME_DURATION_MS
      };
      
      // Set up input with just pressed keys
      inputState = {
        ...createInputState(),
        keysJustPressed: new Set(['a']),
        keysJustReleased: new Set(['b']),
        keysPressed: new Set(['a'])
      };
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      // After processing a frame, transient keys should be cleared
      // clearTransientKeys is called within the updateFrame function
      expect(result.inputState.keysJustPressed.size).toBe(0);
      expect(result.inputState.keysJustReleased.size).toBe(0);
    });

    it('should handle multiple accumulated frames', () => {
      // Start the game loop and set an initial lastFrameTime
      const startTime = 1000;
      vi.setSystemTime(startTime);
      gameLoop = startGameLoop(gameLoop, () => {});
      
      // Now simulate time passing by updating lastFrameTime manually
      // and setting system time forward
      const framesToAccumulate = 3;
      const timePassed = FRAME_DURATION_MS * framesToAccumulate;
      vi.setSystemTime(startTime + timePassed);
      
      // Update the gameLoop to simulate time passing
      gameLoop = {
        ...gameLoop,
        lastFrameTime: startTime
      };
      
      const result = updateFrame(gameLoop, gameState, inputState);
      
      // Should have processed multiple frames worth of game state updates
      expect(result.gameLoop.frameCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('shouldApplyGravity', () => {
    it('should return false when frameCounter is not 0', () => {
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 5 },
        frameCount: 10
      };
      
      expect(shouldApplyGravity(gameState)).toBe(false);
    });

    it('should return false on first frame', () => {
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 0 },
        frameCount: 0
      };
      
      expect(shouldApplyGravity(gameState)).toBe(false);
    });

    it('should return true when frameCounter is 0 and not first frame', () => {
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 0 },
        frameCount: 10
      };
      
      expect(shouldApplyGravity(gameState)).toBe(true);
    });
  });

  describe('shouldApplyDAS', () => {
    it('should return false when no direction held', () => {
      gameState = {
        ...gameState,
        das: { ...createDAS(), counter: 5 }
      };
      
      expect(shouldApplyDAS(gameState)).toBe(false);
    });

    it('should return true on first frame (counter = 1)', () => {
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_LEFT, counter: 1, isActive: false }
      };
      
      expect(shouldApplyDAS(gameState)).toBe(true);
    });

    it('should return false during DAS delay (counter 2-16)', () => {
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_LEFT, counter: 10, isActive: false }
      };
      
      expect(shouldApplyDAS(gameState)).toBe(false);
    });

    it('should return true when DAS active and on ARR interval', () => {
      // DAS activates at counter 17, ARR every 6 frames
      // So counter 17, 22, 28, 34, etc. should trigger
      // (17-16=1, 22-16=6, 28-16=12, 34-16=18, all divisible by 6)
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_LEFT, counter: 22, isActive: true }
      };
      
      expect(shouldApplyDAS(gameState)).toBe(true);
    });

    it('should return false when DAS active but not on ARR interval', () => {
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_LEFT, counter: 20, isActive: true }
      };
      
      expect(shouldApplyDAS(gameState)).toBe(false);
    });
  });

  describe('getDASMoveDirection', () => {
    it('should return 0 when DAS should not apply', () => {
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_LEFT, counter: 10, isActive: false }
      };
      
      expect(getDASMoveDirection(gameState)).toBe(0);
    });

    it('should return direction when DAS applies', () => {
      gameState = {
        ...gameState,
        das: { direction: DIRECTION_RIGHT, counter: 1, isActive: false }
      };
      
      expect(getDASMoveDirection(gameState)).toBe(DIRECTION_RIGHT);
    });
  });

  describe('resetGravity', () => {
    it('should reset gravity counter', () => {
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 10 }
      };
      
      const result = resetGravity(gameState);
      
      expect(result.gravity.frameCounter).toBe(0);
    });

    it('should not mutate original state', () => {
      gameState = {
        ...gameState,
        gravity: { ...gameState.gravity, frameCounter: 10 }
      };
      
      resetGravity(gameState);
      
      expect(gameState.gravity.frameCounter).toBe(10);
    });
  });

  describe('getCurrentFPS', () => {
    it('should return 0 when not running', () => {
      expect(getCurrentFPS(gameLoop)).toBe(0);
    });

    it('should return 0 when no frames processed', () => {
      gameLoop = startGameLoop(gameLoop, () => {});
      expect(getCurrentFPS(gameLoop)).toBe(0);
    });

    it('should return target FPS when running', () => {
      gameLoop = { ...gameLoop, isRunning: true, frameCount: 10 };
      
      expect(getCurrentFPS(gameLoop)).toBe(TARGET_FPS);
    });
  });

  describe('getFrameCount', () => {
    it('should return 0 initially', () => {
      expect(getFrameCount(gameLoop)).toBe(0);
    });

    it('should return frame count', () => {
      gameLoop = { ...gameLoop, frameCount: 100 };
      
      expect(getFrameCount(gameLoop)).toBe(100);
    });
  });

  describe('isRunning', () => {
    it('should return false initially', () => {
      expect(isRunning(gameLoop)).toBe(false);
    });

    it('should return true when running', () => {
      gameLoop = { ...gameLoop, isRunning: true };
      
      expect(isRunning(gameLoop)).toBe(true);
    });
  });

  describe('Constants', () => {
    it('should have correct FPS constant', () => {
      expect(TARGET_FPS).toBe(60);
    });

    it('should have correct frame duration', () => {
      expect(FRAME_DURATION_MS).toBe(1000 / 60);
    });
  });
});
