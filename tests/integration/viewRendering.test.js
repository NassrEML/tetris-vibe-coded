import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { 
  createGameBoard, 
  createNextPiecePreview,
  getCellAt,
  renderBoard,
  renderCurrentPiece,
  renderGame,
  renderNextPieceSync,
  renderScore,
  renderLevel,
  renderLines,
  clearBoardDisplay
} from '../../src/view/renderer.js';
import { createEmptyBoard, BOARD_WIDTH, BOARD_HEIGHT } from '../../src/domain/board.js';
import { createPiece } from '../../src/domain/piece.js';

describe('Integration - View Rendering', () => {
  let dom;
  let document;
  let container;

  beforeEach(() => {
    // Setup DOM
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="test"></div></body></html>', {
      url: 'http://localhost'
    });
    document = dom.window.document;
    container = document.getElementById('test');
    
    // Mock document globally for the module
    global.document = document;
  });

  describe('Board Creation', () => {
    it('should create correct number of cells', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      expect(cells).toHaveLength(BOARD_WIDTH * BOARD_HEIGHT);
    });

    it('should create cells with correct attributes', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      const firstCell = cells[0];
      expect(firstCell.className).toBe('board-cell');
      expect(firstCell.dataset.x).toBe('0');
      expect(firstCell.dataset.y).toBe('0');
    });
  });

  describe('Cell Access', () => {
    it('should return correct cell at coordinates', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      const cell = getCellAt(cells, 5, 10);
      expect(cell).not.toBeNull();
      expect(cell.dataset.x).toBe('5');
      expect(cell.dataset.y).toBe('10');
    });

    it('should return null for out of bounds', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      expect(getCellAt(cells, -1, 0)).toBeNull();
      expect(getCellAt(cells, 0, -1)).toBeNull();
      expect(getCellAt(cells, BOARD_WIDTH, 0)).toBeNull();
      expect(getCellAt(cells, 0, BOARD_HEIGHT)).toBeNull();
    });
  });

  describe('Board Rendering', () => {
    it('should clear all piece classes', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      // Add some classes
      cells[0].className = 'board-cell piece-1';
      cells[1].className = 'board-cell piece-2';
      
      clearBoardDisplay(cells);
      
      expect(cells[0].className).toBe('board-cell');
      expect(cells[1].className).toBe('board-cell');
    });

    it('should render board state correctly', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      const board = createEmptyBoard();
      board[2][0] = 1; // I-piece in first visible row
      board[2][1] = 2; // O-piece
      
      renderBoard(cells, board);
      
      expect(cells[0].className).toContain('piece-1');
      expect(cells[1].className).toContain('piece-2');
    });
  });

  describe('Piece Rendering', () => {
    it('should render current piece', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      const piece = createPiece(1); // I-piece
      piece.y = 2; // Move to visible area
      
      renderCurrentPiece(cells, piece);
      
      // Check that some cells have the piece class
      const pieceCells = cells.filter(cell => cell.className.includes('piece-1'));
      expect(pieceCells.length).toBeGreaterThan(0);
    });
  });

  describe('Next Piece Preview', () => {
    it('should create preview grid', () => {
      const container = document.createElement('div');
      const cells = createNextPiecePreview(container);
      
      expect(cells).toHaveLength(16); // 4x4 grid
    });

    it('should render next piece correctly', () => {
      const container = document.createElement('div');
      const cells = createNextPiecePreview(container);
      
      renderNextPieceSync(cells, 2); // O-piece
      
      // Should have colored cells for the piece
      const coloredCells = cells.filter(cell => 
        cell.className.includes('piece-2')
      );
      expect(coloredCells.length).toBeGreaterThan(0);
    });
  });

  describe('Stat Rendering', () => {
    it('should render score with padding', () => {
      const scoreEl = document.createElement('div');
      renderScore(scoreEl, 42);
      
      expect(scoreEl.textContent).toBe('000042');
    });

    it('should render level with padding', () => {
      const levelEl = document.createElement('div');
      renderLevel(levelEl, 5);
      
      expect(levelEl.textContent).toBe('05');
    });

    it('should render lines with padding', () => {
      const linesEl = document.createElement('div');
      renderLines(linesEl, 123);
      
      expect(linesEl.textContent).toBe('123');
    });
  });

  describe('Game State Rendering', () => {
    it('should render complete game state', () => {
      const boardContainer = document.createElement('div');
      const cells = createGameBoard(boardContainer);
      
      const gameState = {
        board: createEmptyBoard(),
        currentPiece: null
      };
      
      // Should not throw
      expect(() => renderGame(cells, gameState)).not.toThrow();
    });
  });
});
