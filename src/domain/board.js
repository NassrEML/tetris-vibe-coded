/**
 * Board module - Immutable game board representation
 * NES Tetris: 10 columns × 20 visible rows + 2 hidden rows at top
 */

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_ROWS = BOARD_HEIGHT + HIDDEN_ROWS;

/**
 * Creates an empty board
 * Returns a 2D array: rows × columns
 * 0 = empty, other values = piece type (1-7)
 */
export function createEmptyBoard() {
  return Array(TOTAL_ROWS).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

/**
 * Creates a new board from an existing one (deep copy)
 */
export function cloneBoard(board) {
  return board.map(row => [...row]);
}

/**
 * Checks if coordinates are within board bounds
 */
export function isValidPosition(board, x, y) {
  return y >= 0 && y < TOTAL_ROWS && x >= 0 && x < BOARD_WIDTH;
}

/**
 * Gets cell value at position
 */
export function getCell(board, x, y) {
  if (!isValidPosition(board, x, y)) {
    return null;
  }
  return board[y][x];
}

/**
 * Sets cell value at position (returns new board)
 * Returns null if position is invalid
 */
export function setCell(board, x, y, value) {
  if (!isValidPosition(board, x, y)) {
    return null;
  }
  const newBoard = cloneBoard(board);
  newBoard[y][x] = value;
  return newBoard;
}

/**
 * Checks if a row is completely filled
 */
export function isRowComplete(board, rowIndex) {
  if (rowIndex < 0 || rowIndex >= TOTAL_ROWS) {
    return false;
  }
  return board[rowIndex].every(cell => cell !== 0);
}

/**
 * Clears completed lines and returns new board with lines removed
 * Also returns count of cleared lines
 */
export function clearLines(board) {
  const newBoard = [];
  let clearedCount = 0;
  
  // Keep only non-complete rows
  for (let i = 0; i < TOTAL_ROWS; i++) {
    if (!isRowComplete(board, i)) {
      newBoard.push([...board[i]]);
    } else {
      clearedCount++;
    }
  }
  
  // Add empty rows at top to maintain board size
  const emptyRowsToAdd = clearedCount;
  for (let i = 0; i < emptyRowsToAdd; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }
  
  return {
    board: newBoard,
    clearedLines: clearedCount
  };
}

/**
 * Places a piece on the board (returns new board)
 * piece.cells is array of {x, y} relative to piece position
 */
export function placePiece(board, piece) {
  let newBoard = cloneBoard(board);
  
  for (const cell of piece.cells) {
    const absoluteX = piece.x + cell.x;
    const absoluteY = piece.y + cell.y;
    
    const result = setCell(newBoard, absoluteX, absoluteY, piece.type);
    if (result === null) {
      return null; // Invalid placement
    }
    newBoard = result;
  }
  
  return newBoard;
}

/**
 * Gets only visible rows (20 rows, excludes hidden top 2)
 */
export function getVisibleBoard(board) {
  return board.slice(HIDDEN_ROWS);
}

/**
 * Checks if spawn area (hidden rows) is clear for new piece
 */
export function isSpawnAreaClear(board) {
  for (let y = 0; y < HIDDEN_ROWS; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x] !== 0) {
        return false;
      }
    }
  }
  return true;
}
