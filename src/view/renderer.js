/**
 * Renderer - DOM rendering for Tetris NES 1989
 * Renders the 10×20 grid, pieces, board, and UI
 */

import { BOARD_WIDTH, BOARD_HEIGHT, PIECE_TYPES, PIECE_NAMES } from '../domain/index.js';
import { getVisibleBoard } from '../domain/board.js';
import { getAbsoluteCells } from '../domain/piece.js';

/**
 * NES Color mapping for CSS classes
 */
const PIECE_CLASS_MAP = {
  0: '',           // Empty
  1: 'piece-1',    // I - Cyan
  2: 'piece-2',    // O - Yellow
  3: 'piece-3',    // T - Purple
  4: 'piece-4',    // S - Green
  5: 'piece-5',    // Z - Red
  6: 'piece-6',    // J - Blue
  7: 'piece-7'     // L - Orange
};

/**
 * Creates the game board grid (10×20 cells)
 * @param {HTMLElement} container - Container element
 * @returns {Array} Array of cell elements (row-major order)
 */
export function createGameBoard(container) {
  const cells = [];
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      container.appendChild(cell);
      cells.push(cell);
    }
  }
  
  return cells;
}

/**
 * Gets cell element by coordinates
 * @param {Array} cells - Array of cell elements
 * @param {number} x - X coordinate (0-9)
 * @param {number} y - Y coordinate (0-19)
 * @returns {HTMLElement|null} Cell element or null
 */
export function getCellAt(cells, x, y) {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
    return null;
  }
  const index = y * BOARD_WIDTH + x;
  return cells[index] || null;
}

/**
 * Clears all piece classes from the board
 * @param {Array} cells - Array of cell elements
 */
export function clearBoardDisplay(cells) {
  cells.forEach(cell => {
    cell.className = 'board-cell';
  });
}

/**
 * Renders the board (locked pieces)
 * @param {Array} cells - Array of cell elements
 * @param {Array} board - Board state (with hidden rows)
 */
export function renderBoard(cells, board) {
  const visibleBoard = getVisibleBoard(board);
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cellValue = visibleBoard[y][x];
      const cell = getCellAt(cells, x, y);
      if (cell) {
        cell.className = `board-cell ${PIECE_CLASS_MAP[cellValue] || ''}`.trim();
      }
    }
  }
}

/**
 * Renders the current piece on the board
 * @param {Array} cells - Array of cell elements
 * @param {Object} piece - Current piece object
 */
export function renderCurrentPiece(cells, piece) {
  if (!piece) return;
  
  const absoluteCells = getAbsoluteCells(piece);
  
  for (const cellPos of absoluteCells) {
    // Convert to visible board coordinates (subtract hidden rows offset)
    const visibleY = cellPos.y - 2;
    if (visibleY >= 0 && visibleY < BOARD_HEIGHT) {
      const cell = getCellAt(cells, cellPos.x, visibleY);
      if (cell) {
        cell.className = `board-cell ${PIECE_CLASS_MAP[piece.type] || ''}`;
      }
    }
  }
}

/**
 * Renders both board and current piece
 * @param {Array} cells - Array of cell elements
 * @param {Object} gameState - Game state with board and currentPiece
 */
export function renderGame(cells, gameState) {
  clearBoardDisplay(cells);
  renderBoard(cells, gameState.board);
  if (gameState.currentPiece) {
    renderCurrentPiece(cells, gameState.currentPiece);
  }
}

/**
 * Creates next piece preview grid
 * @param {HTMLElement} container - Container element
 * @returns {Array} Array of cell elements for preview
 */
export function createNextPiecePreview(container) {
  const cells = [];
  const grid = document.createElement('div');
  grid.className = 'next-piece-grid';
  
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const cell = document.createElement('div');
      cell.className = 'next-piece-cell';
      grid.appendChild(cell);
      cells.push(cell);
    }
  }
  
  container.appendChild(grid);
  return cells;
}

/**
 * Renders next piece preview
 * @param {Array} cells - Array of preview cell elements
 * @param {number} pieceType - Piece type (1-7)
 * @returns {Promise<void>}
 */
export async function renderNextPiece(cells, pieceType) {
  // Clear all cells
  cells.forEach(cell => {
    cell.className = 'next-piece-cell';
  });
  
  if (!pieceType || pieceType < 1 || pieceType > 7) return;
  
  // Get piece shape for rotation 0
  const { PIECES } = await import('../domain/piece.js');
  const pieceDef = PIECES[pieceType];
  if (!pieceDef) return;
  
  const shape = pieceDef.rotations[0];
  const className = PIECE_CLASS_MAP[pieceType];
  
  // Center the piece in the 4×4 grid
  const offsetX = pieceType === 1 ? 0 : 1; // I-piece is wider
  const offsetY = 0;
  
  for (const cell of shape) {
    const x = cell.x - pieceDef.spawnX + offsetX + 1;
    const y = cell.y - pieceDef.spawnY + offsetY + 1;
    const index = y * 4 + x;
    if (index >= 0 && index < cells.length) {
      cells[index].className = `next-piece-cell ${className}`;
    }
  }
}

// Synchronous version using hardcoded shapes
const PREVIEW_SHAPES = {
  1: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}], // I
  2: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}], // O
  3: [{x: 1, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}], // T
  4: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}], // S
  5: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}], // Z
  6: [{x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}], // J
  7: [{x: 2, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]  // L
};

/**
 * Renders next piece preview (synchronous version)
 * @param {Array} cells - Array of preview cell elements
 * @param {number} pieceType - Piece type (1-7)
 */
export function renderNextPieceSync(cells, pieceType) {
  // Clear all cells
  cells.forEach(cell => {
    cell.className = 'next-piece-cell';
  });
  
  if (!pieceType || pieceType < 1 || pieceType > 7) return;
  
  const shape = PREVIEW_SHAPES[pieceType];
  const className = PIECE_CLASS_MAP[pieceType];
  
  for (const cell of shape) {
    const index = cell.y * 4 + cell.x;
    if (index >= 0 && index < cells.length) {
      cells[index].className = `next-piece-cell ${className}`;
    }
  }
}

/**
 * Updates score display
 * @param {HTMLElement} scoreElement - Score element
 * @param {number} score - Score value
 */
export function renderScore(scoreElement, score) {
  if (scoreElement) {
    scoreElement.textContent = score.toString().padStart(6, '0');
  }
}

/**
 * Updates level display
 * @param {HTMLElement} levelElement - Level element
 * @param {number} level - Level value
 */
export function renderLevel(levelElement, level) {
  if (levelElement) {
    levelElement.textContent = level.toString().padStart(2, '0');
  }
}

/**
 * Updates lines display
 * @param {HTMLElement} linesElement - Lines element
 * @param {number} lines - Lines value
 */
export function renderLines(linesElement, lines) {
  if (linesElement) {
    linesElement.textContent = lines.toString().padStart(3, '0');
  }
}

/**
 * Updates high score display
 * @param {HTMLElement} highScoreElement - High score element
 * @param {number} highScore - High score value
 */
export function renderHighScore(highScoreElement, highScore) {
  if (highScoreElement) {
    highScoreElement.textContent = highScore.toString().padStart(6, '0');
  }
}

/**
 * Updates all game stats
 * @param {Object} elements - Object containing stat elements
 * @param {Object} gameState - Game state
 */
export function renderStats(elements, gameState) {
  const { score, level, lines, highScore } = elements;
  const info = gameState.score || {};
  
  renderScore(score, info.totalScore || 0);
  renderLevel(level, gameState.level?.currentLevel || 0);
  renderLines(lines, info.linesCleared || 0);
  renderHighScore(highScore, info.highScore || 0);
}

/**
 * Creates all UI elements for the game screen
 * @param {HTMLElement} container - Game screen container
 * @returns {Object} Object with references to all UI elements
 */
export function createGameUI(container) {
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  
  // Left panel - Next piece
  const leftPanel = document.createElement('div');
  leftPanel.className = 'left-panel';
  
  const nextPieceTitle = document.createElement('div');
  nextPieceTitle.className = 'panel-title';
  nextPieceTitle.textContent = 'NEXT';
  leftPanel.appendChild(nextPieceTitle);
  
  const nextPieceBox = document.createElement('div');
  nextPieceBox.className = 'next-piece-box';
  leftPanel.appendChild(nextPieceBox);
  
  const nextPieceCells = createNextPiecePreview(nextPieceBox);
  
  // Center - Board
  const boardContainer = document.createElement('div');
  boardContainer.className = 'board-container';
  
  const boardWrapper = document.createElement('div');
  boardWrapper.className = 'board-wrapper';
  
  const gameBoard = document.createElement('div');
  gameBoard.id = 'game-board';
  boardWrapper.appendChild(gameBoard);
  boardContainer.appendChild(boardWrapper);
  
  const boardCells = createGameBoard(gameBoard);
  
  // Right panel - Stats
  const rightPanel = document.createElement('div');
  rightPanel.className = 'right-panel';
  
  // Score
  const scoreBox = document.createElement('div');
  scoreBox.className = 'stat-box';
  const scoreLabel = document.createElement('div');
  scoreLabel.className = 'stat-label';
  scoreLabel.textContent = 'SCORE';
  const scoreValue = document.createElement('div');
  scoreValue.className = 'stat-value';
  scoreValue.id = 'score-value';
  scoreValue.textContent = '000000';
  scoreBox.appendChild(scoreLabel);
  scoreBox.appendChild(scoreValue);
  rightPanel.appendChild(scoreBox);
  
  // Level
  const levelBox = document.createElement('div');
  levelBox.className = 'stat-box';
  const levelLabel = document.createElement('div');
  levelLabel.className = 'stat-label';
  levelLabel.textContent = 'LEVEL';
  const levelValue = document.createElement('div');
  levelValue.className = 'stat-value';
  levelValue.id = 'level-value';
  levelValue.textContent = '00';
  levelBox.appendChild(levelLabel);
  levelBox.appendChild(levelValue);
  rightPanel.appendChild(levelBox);
  
  // Lines
  const linesBox = document.createElement('div');
  linesBox.className = 'stat-box';
  const linesLabel = document.createElement('div');
  linesLabel.className = 'stat-label';
  linesLabel.textContent = 'LINES';
  const linesValue = document.createElement('div');
  linesValue.className = 'stat-value';
  linesValue.id = 'lines-value';
  linesValue.textContent = '000';
  linesBox.appendChild(linesLabel);
  linesBox.appendChild(linesValue);
  rightPanel.appendChild(linesBox);
  
  // High Score
  const highScoreBox = document.createElement('div');
  highScoreBox.className = 'stat-box';
  const highScoreLabel = document.createElement('div');
  highScoreLabel.className = 'stat-label';
  highScoreLabel.textContent = 'TOP';
  const highScoreValue = document.createElement('div');
  highScoreValue.className = 'stat-value';
  highScoreValue.id = 'high-score-value';
  highScoreValue.textContent = '000000';
  highScoreBox.appendChild(highScoreLabel);
  highScoreBox.appendChild(highScoreValue);
  rightPanel.appendChild(highScoreBox);
  
  // Assemble
  gameContainer.appendChild(leftPanel);
  gameContainer.appendChild(boardContainer);
  gameContainer.appendChild(rightPanel);
  container.appendChild(gameContainer);
  
  return {
    boardCells,
    nextPieceCells,
    score: scoreValue,
    level: levelValue,
    lines: linesValue,
    highScore: highScoreValue
  };
}

/**
 * Flashes lines that are about to be cleared
 * @param {Array} cells - Array of board cell elements
 * @param {Array} rowsToClear - Array of row indices to flash
 */
export function flashLines(cells, rowsToClear) {
  for (const row of rowsToClear) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = getCellAt(cells, x, row);
      if (cell) {
        cell.classList.add('line-clearing');
      }
    }
  }
}

/**
 * Removes line clearing animation
 * @param {Array} cells - Array of board cell elements
 */
export function clearLineFlash(cells) {
  cells.forEach(cell => {
    cell.classList.remove('line-clearing');
  });
}
