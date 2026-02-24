import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInputState,
  handleKeyDown,
  handleKeyUp,
  clearTransientKeys,
  getNextAction,
  consumeAction,
  getDASDirection,
  isSoftDropping,
  isKeyPressed,
  wasKeyJustPressed,
  wasKeyJustReleased,
  getPressedKeys,
  resetInput,
  ACTIONS,
  KEY_MAPPINGS
} from '../../../src/controller/inputController.js';
import { DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_NONE } from '../../../src/domain/das.js';

describe('Input Controller', () => {
  let inputState;

  beforeEach(() => {
    inputState = createInputState();
  });

  describe('createInputState', () => {
    it('should create empty input state', () => {
      expect(inputState.keysPressed.size).toBe(0);
      expect(inputState.keysJustPressed.size).toBe(0);
      expect(inputState.keysJustReleased.size).toBe(0);
      expect(inputState.dasDirection).toBe(DIRECTION_NONE);
      expect(inputState.softDropActive).toBe(false);
      expect(inputState.actionQueue).toEqual([]);
    });
  });

  describe('handleKeyDown', () => {
    it('should register key press', () => {
      const result = handleKeyDown(inputState, 'a');
      
      expect(result.keysPressed.has('a')).toBe(true);
      expect(result.keysJustPressed.has('a')).toBe(true);
    });

    it('should set DAS direction to left for A key', () => {
      const result = handleKeyDown(inputState, 'a');
      
      expect(result.dasDirection).toBe(DIRECTION_LEFT);
    });

    it('should set DAS direction to right for D key', () => {
      const result = handleKeyDown(inputState, 'd');
      
      expect(result.dasDirection).toBe(DIRECTION_RIGHT);
    });

    it('should activate soft drop for down arrow', () => {
      const result = handleKeyDown(inputState, 'ArrowDown');
      
      expect(result.softDropActive).toBe(true);
    });

    it('should queue rotate CCW action for left arrow', () => {
      const result = handleKeyDown(inputState, 'ArrowLeft');
      
      expect(result.actionQueue).toContain(ACTIONS.ROTATE_CCW);
    });

    it('should queue rotate CW action for right arrow', () => {
      const result = handleKeyDown(inputState, 'ArrowRight');
      
      expect(result.actionQueue).toContain(ACTIONS.ROTATE_CW);
    });

    it('should queue pause action for P key', () => {
      const result = handleKeyDown(inputState, 'p');
      
      expect(result.actionQueue).toContain(ACTIONS.PAUSE);
    });

    it('should queue start action for Enter key', () => {
      const result = handleKeyDown(inputState, 'Enter');
      
      expect(result.actionQueue).toContain(ACTIONS.START);
    });

    it('should queue start action for Space key', () => {
      const result = handleKeyDown(inputState, ' ');
      
      expect(result.actionQueue).toContain(ACTIONS.START);
    });

    it('should queue reset action for R key', () => {
      const result = handleKeyDown(inputState, 'r');
      
      expect(result.actionQueue).toContain(ACTIONS.RESET);
    });

    it('should queue reset action for Escape key', () => {
      const result = handleKeyDown(inputState, 'Escape');
      
      expect(result.actionQueue).toContain(ACTIONS.RESET);
    });

    it('should handle capital letters', () => {
      const result = handleKeyDown(inputState, 'A');
      
      expect(result.dasDirection).toBe(DIRECTION_LEFT);
    });

    it('should not duplicate key press', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = handleKeyDown(inputState, 'a');
      
      expect(result.keysPressed.size).toBe(1);
    });

    it('should not mutate original state', () => {
      handleKeyDown(inputState, 'a');
      
      expect(inputState.keysPressed.has('a')).toBe(false);
    });
  });

  describe('handleKeyUp', () => {
    it('should remove key from pressed set', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = handleKeyUp(inputState, 'a');
      
      expect(result.keysPressed.has('a')).toBe(false);
      expect(result.keysJustReleased.has('a')).toBe(true);
    });

    it('should reset DAS when left key released', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = handleKeyUp(inputState, 'a');
      
      expect(result.dasDirection).toBe(DIRECTION_NONE);
    });

    it('should reset DAS when right key released', () => {
      inputState = handleKeyDown(inputState, 'd');
      const result = handleKeyUp(inputState, 'd');
      
      expect(result.dasDirection).toBe(DIRECTION_NONE);
    });

    it('should deactivate soft drop when down arrow released', () => {
      inputState = handleKeyDown(inputState, 'ArrowDown');
      const result = handleKeyUp(inputState, 'ArrowDown');
      
      expect(result.softDropActive).toBe(false);
    });

    it('should keep DAS direction if opposite key still pressed', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyDown(inputState, 'd');
      
      // Release left, should keep right
      const result = handleKeyUp(inputState, 'a');
      
      expect(result.dasDirection).toBe(DIRECTION_RIGHT);
    });

    it('should handle key that was not pressed', () => {
      const result = handleKeyUp(inputState, 'x');
      
      expect(result).toBe(inputState);
    });

    it('should not mutate original state', () => {
      inputState = handleKeyDown(inputState, 'a');
      handleKeyUp(inputState, 'a');
      
      expect(inputState.keysPressed.has('a')).toBe(true);
    });
  });

  describe('clearTransientKeys', () => {
    it('should clear just pressed keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = clearTransientKeys(inputState);
      
      expect(result.keysJustPressed.size).toBe(0);
    });

    it('should clear just released keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyUp(inputState, 'a');
      const result = clearTransientKeys(inputState);
      
      expect(result.keysJustReleased.size).toBe(0);
    });

    it('should clear action queue', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      const result = clearTransientKeys(inputState);
      
      expect(result.actionQueue).toEqual([]);
    });

    it('should keep pressed keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = clearTransientKeys(inputState);
      
      expect(result.keysPressed.has('a')).toBe(true);
    });
  });

  describe('getNextAction', () => {
    it('should return null for empty queue', () => {
      expect(getNextAction(inputState)).toBeNull();
    });

    it('should return next action', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      
      expect(getNextAction(inputState)).toBe(ACTIONS.ROTATE_CCW);
    });
  });

  describe('consumeAction', () => {
    it('should remove action from queue', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      const result = consumeAction(inputState);
      
      expect(result.actionQueue.length).toBe(0);
    });

    it('should only remove one action', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      inputState = handleKeyDown(inputState, 'p');
      const result = consumeAction(inputState);
      
      expect(result.actionQueue.length).toBe(1);
    });

    it('should handle empty queue', () => {
      const result = consumeAction(inputState);
      
      expect(result).toBe(inputState);
    });
  });

  describe('getDASDirection', () => {
    it('should return none by default', () => {
      expect(getDASDirection(inputState)).toBe(DIRECTION_NONE);
    });

    it('should return left when A pressed', () => {
      inputState = handleKeyDown(inputState, 'a');
      
      expect(getDASDirection(inputState)).toBe(DIRECTION_LEFT);
    });

    it('should return right when D pressed', () => {
      inputState = handleKeyDown(inputState, 'd');
      
      expect(getDASDirection(inputState)).toBe(DIRECTION_RIGHT);
    });
  });

  describe('isSoftDropping', () => {
    it('should return false by default', () => {
      expect(isSoftDropping(inputState)).toBe(false);
    });

    it('should return true when down arrow pressed', () => {
      inputState = handleKeyDown(inputState, 'ArrowDown');
      
      expect(isSoftDropping(inputState)).toBe(true);
    });

    it('should return false after down arrow released', () => {
      inputState = handleKeyDown(inputState, 'ArrowDown');
      inputState = handleKeyUp(inputState, 'ArrowDown');
      
      expect(isSoftDropping(inputState)).toBe(false);
    });
  });

  describe('isKeyPressed', () => {
    it('should return false for unpressed key', () => {
      expect(isKeyPressed(inputState, 'a')).toBe(false);
    });

    it('should return true for pressed key', () => {
      inputState = handleKeyDown(inputState, 'a');
      
      expect(isKeyPressed(inputState, 'a')).toBe(true);
    });
  });

  describe('wasKeyJustPressed', () => {
    it('should return true for key just pressed', () => {
      inputState = handleKeyDown(inputState, 'a');
      
      expect(wasKeyJustPressed(inputState, 'a')).toBe(true);
    });

    it('should return false after clearing transient keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = clearTransientKeys(inputState);
      
      expect(wasKeyJustPressed(inputState, 'a')).toBe(false);
    });
  });

  describe('wasKeyJustReleased', () => {
    it('should return true for key just released', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyUp(inputState, 'a');
      
      expect(wasKeyJustReleased(inputState, 'a')).toBe(true);
    });

    it('should return false after clearing transient keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyUp(inputState, 'a');
      inputState = clearTransientKeys(inputState);
      
      expect(wasKeyJustReleased(inputState, 'a')).toBe(false);
    });
  });

  describe('getPressedKeys', () => {
    it('should return empty array initially', () => {
      expect(getPressedKeys(inputState)).toEqual([]);
    });

    it('should return pressed keys', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyDown(inputState, 'd');
      
      const pressed = getPressedKeys(inputState);
      expect(pressed).toContain('a');
      expect(pressed).toContain('d');
      expect(pressed.length).toBe(2);
    });
  });

  describe('resetInput', () => {
    it('should return fresh input state', () => {
      inputState = handleKeyDown(inputState, 'a');
      const result = resetInput();
      
      expect(result.keysPressed.size).toBe(0);
      expect(result.dasDirection).toBe(DIRECTION_NONE);
    });
  });

  describe('Key mappings', () => {
    it('should have all required key mappings', () => {
      expect(KEY_MAPPINGS.MOVE_LEFT).toContain('a');
      expect(KEY_MAPPINGS.MOVE_RIGHT).toContain('d');
      expect(KEY_MAPPINGS.ROTATE_CCW).toContain('ArrowLeft');
      expect(KEY_MAPPINGS.ROTATE_CW).toContain('ArrowRight');
      expect(KEY_MAPPINGS.SOFT_DROP).toContain('ArrowDown');
      expect(KEY_MAPPINGS.PAUSE).toContain('p');
      expect(KEY_MAPPINGS.START).toContain('Enter');
      expect(KEY_MAPPINGS.RESET).toContain('r');
    });
  });

  describe('Simultaneous key handling', () => {
    it('should handle both left and right pressed (left wins if pressed first)', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyDown(inputState, 'd');
      
      // Both pressed, DAS direction based on last pressed
      expect(inputState.dasDirection).toBe(DIRECTION_RIGHT);
    });

    it('should switch direction when releasing and repressing', () => {
      inputState = handleKeyDown(inputState, 'a');
      inputState = handleKeyUp(inputState, 'a');
      inputState = handleKeyDown(inputState, 'd');
      
      expect(inputState.dasDirection).toBe(DIRECTION_RIGHT);
    });

    it('should handle multiple actions queued', () => {
      inputState = handleKeyDown(inputState, 'ArrowLeft');
      inputState = handleKeyDown(inputState, 'p');
      
      expect(inputState.actionQueue.length).toBe(2);
      expect(inputState.actionQueue[0]).toBe(ACTIONS.ROTATE_CCW);
      expect(inputState.actionQueue[1]).toBe(ACTIONS.PAUSE);
    });
  });
});
