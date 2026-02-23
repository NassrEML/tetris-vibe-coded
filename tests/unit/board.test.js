import { describe, it, expect, beforeEach } from 'vitest';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  HIDDEN_ROWS,
  TOTAL_ROWS,
  createEmptyBoard,
  cloneBoard,
  isValidPosition,
  getCell,
  setCell,
  isRowComplete,
  clearLines,
  placePiece,
  getVisibleBoard,
  isSpawnAreaClear
} from '../../src/domain/board.js';

describe('Board Domain', () => {
  describe('Board Constants', () => {
    it('should have correct dimensions', () => {
      expect(BOARD_WIDTH).toBe(10);
      expect(BOARD_HEIGHT).toBe(20);
      expect(HIDDEN_ROWS).toBe(2);
      expect(TOTAL_ROWS).toBe(22);
    });
  });

  describe('createEmptyBoard', () => {
    it('should create board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board.length).toBe(TOTAL_ROWS);
      expect(board[0].length).toBe(BOARD_WIDTH);
    });

    it('should create board filled with zeros', () => {
      const board = createEmptyBoard();
      for (let y = 0; y < TOTAL_ROWS; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          expect(board[y][x]).toBe(0);
        }
      }
    });
  });

  describe('cloneBoard', () => {
    it('should create a deep copy of board', () => {
      const original = createEmptyBoard();
      const clone = cloneBoard(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone[0]).not.toBe(original[0]);
    });

    it('should not affect original when modifying clone', () => {
      const original = createEmptyBoard();
      const clone = cloneBoard(original);
      
      clone[0][0] = 1;
      
      expect(original[0][0]).toBe(0);
      expect(clone[0][0]).toBe(1);
    });
  });

  describe('isValidPosition', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return true for valid positions', () => {
      expect(isValidPosition(board, 0, 0)).toBe(true);
      expect(isValidPosition(board, 9, 21)).toBe(true);
      expect(isValidPosition(board, 5, 10)).toBe(true);
    });

    it('should return false for x < 0', () => {
      expect(isValidPosition(board, -1, 5)).toBe(false);
    });

    it('should return false for x >= BOARD_WIDTH', () => {
      expect(isValidPosition(board, 10, 5)).toBe(false);
      expect(isValidPosition(board, 15, 5)).toBe(false);
    });

    it('should return false for y < 0', () => {
      expect(isValidPosition(board, 5, -1)).toBe(false);
    });

    it('should return false for y >= TOTAL_ROWS', () => {
      expect(isValidPosition(board, 5, 22)).toBe(false);
      expect(isValidPosition(board, 5, 30)).toBe(false);
    });
  });

  describe('getCell', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
      board[5][5] = 3;
    });

    it('should return cell value for valid positions', () => {
      expect(getCell(board, 5, 5)).toBe(3);
      expect(getCell(board, 0, 0)).toBe(0);
    });

    it('should return null for invalid positions', () => {
      expect(getCell(board, -1, 5)).toBe(null);
      expect(getCell(board, 10, 5)).toBe(null);
      expect(getCell(board, 5, -1)).toBe(null);
      expect(getCell(board, 5, 22)).toBe(null);
    });
  });

  describe('setCell', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should set cell value and return new board', () => {
      const newBoard = setCell(board, 5, 5, 2);
      
      expect(newBoard).not.toBe(board);
      expect(newBoard[5][5]).toBe(2);
      expect(board[5][5]).toBe(0);
    });

    it('should return null for invalid positions', () => {
      expect(setCell(board, -1, 5, 1)).toBe(null);
      expect(setCell(board, 10, 5, 1)).toBe(null);
      expect(setCell(board, 5, -1, 1)).toBe(null);
      expect(setCell(board, 5, 22, 1)).toBe(null);
    });
  });

  describe('isRowComplete', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return false for empty row', () => {
      expect(isRowComplete(board, 5)).toBe(false);
    });

    it('should return false for partially filled row', () => {
      board[5][0] = 1;
      board[5][1] = 1;
      expect(isRowComplete(board, 5)).toBe(false);
    });

    it('should return true for completely filled row', () => {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[5][x] = 1;
      }
      expect(isRowComplete(board, 5)).toBe(true);
    });

    it('should return false for invalid row indices', () => {
      expect(isRowComplete(board, -1)).toBe(false);
      expect(isRowComplete(board, 22)).toBe(false);
    });
  });

  describe('clearLines', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should clear 1 line', () => {
      // Fill row 21 (last visible row)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[21][x] = 1;
      }
      
      const result = clearLines(board);
      
      expect(result.clearedLines).toBe(1);
      expect(result.board[21].every(cell => cell === 0)).toBe(true);
    });

    it('should clear 4 lines (Tetris)', () => {
      // Fill rows 18, 19, 20, 21
      for (let y = 18; y <= 21; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board[y][x] = 1;
        }
      }
      
      const result = clearLines(board);
      
      expect(result.clearedLines).toBe(4);
      // All bottom 4 rows should now be empty
      for (let y = 18; y <= 21; y++) {
        expect(result.board[y].every(cell => cell === 0)).toBe(true);
      }
    });

    it('should clear line at top visible row (row 2)', () => {
      // Fill row 2 (first visible row)
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[2][x] = 1;
      }
      
      const result = clearLines(board);
      
      expect(result.clearedLines).toBe(1);
      // Row 2 should now be empty (new empty row added at top)
      expect(result.board[2].every(cell => cell === 0)).toBe(true);
    });

    it('should handle multiple clears with gaps above', () => {
      // Fill rows 20 and 21, leave 19 with a gap
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[20][x] = 1;
        board[21][x] = 1;
      }
      // Row 19 has a gap at position 5
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x !== 5) {
          board[19][x] = 2;
        }
      }
      
      const result = clearLines(board);
      
      expect(result.clearedLines).toBe(2);
      // Previous row 19 should now be at row 21
      expect(result.board[21][0]).toBe(2);
      expect(result.board[21][5]).toBe(0);
    });

    it('should maintain board size after clear', () => {
      // Fill 2 rows
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[20][x] = 1;
        board[21][x] = 1;
      }
      
      const result = clearLines(board);
      
      expect(result.board.length).toBe(TOTAL_ROWS);
      expect(result.board[0].length).toBe(BOARD_WIDTH);
    });
  });

  describe('placePiece', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should place piece on board', () => {
      const piece = {
        type: 1,
        x: 4,
        y: 2,
        cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
      };
      
      const newBoard = placePiece(board, piece);
      
      expect(newBoard).not.toBe(board);
      expect(newBoard[2][4]).toBe(1);
      expect(newBoard[2][5]).toBe(1);
      expect(newBoard[3][4]).toBe(1);
      expect(newBoard[3][5]).toBe(1);
    });

    it('should return null for invalid placement', () => {
      const piece = {
        type: 1,
        x: 9,
        y: 2,
        cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] // x=9+1=10 is out of bounds
      };
      
      const newBoard = placePiece(board, piece);
      
      expect(newBoard).toBe(null);
    });

    it('should not mutate original board', () => {
      const piece = {
        type: 1,
        x: 4,
        y: 2,
        cells: [{ x: 0, y: 0 }]
      };
      
      placePiece(board, piece);
      
      expect(board[2][4]).toBe(0);
    });
  });

  describe('getVisibleBoard', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return only visible rows (20 rows)', () => {
      // Mark hidden rows
      board[0][0] = 9;
      board[1][0] = 9;
      // Mark visible rows
      board[2][0] = 1;
      board[21][0] = 1;
      
      const visible = getVisibleBoard(board);
      
      expect(visible.length).toBe(BOARD_HEIGHT);
      expect(visible[0][0]).toBe(1); // Was row 2
      expect(visible[19][0]).toBe(1); // Was row 21
    });

    it('should exclude hidden rows', () => {
      board[0][0] = 9;
      board[1][0] = 9;
      
      const visible = getVisibleBoard(board);
      
      expect(visible.some(row => row[0] === 9)).toBe(false);
    });
  });

  describe('isSpawnAreaClear', () => {
    let board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return true when spawn area is empty', () => {
      expect(isSpawnAreaClear(board)).toBe(true);
    });

    it('should return false when any cell in hidden rows is occupied', () => {
      board[0][5] = 1;
      expect(isSpawnAreaClear(board)).toBe(false);
    });

    it('should return false when spawn area is partially filled', () => {
      board[1][0] = 2;
      expect(isSpawnAreaClear(board)).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should never mutate previous board state', () => {
      const board1 = createEmptyBoard();
      const board2 = setCell(board1, 5, 5, 1);
      const board3 = setCell(board2, 6, 6, 2);
      
      // board1 should still be all zeros
      expect(board1.every(row => row.every(cell => cell === 0))).toBe(true);
      
      // board2 should only have cell at 5,5
      expect(board2[5][5]).toBe(1);
      expect(board2[6][6]).toBe(0);
      
      // board3 should have both cells
      expect(board3[5][5]).toBe(1);
      expect(board3[6][6]).toBe(2);
    });
  });
});
