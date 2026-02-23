/**
 * Tetromino module - Piece definitions and rotations (NES exact)
 * 7 pieces: I, O, T, S, Z, J, L
 * Spawn positions and rotations match NES Tetris 1989
 */

export const PIECE_TYPES = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7
};

export const PIECE_NAMES = ['', 'I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * Piece definitions with spawn positions and rotation states
 * Each piece has 4 rotation states (0, 1, 2, 3)
 * Coordinates are relative to the piece's position (x, y)
 * Spawn position is where the piece appears when it enters the board
 */
export const PIECES = {
  // I-piece (cyan) - horizontal spawn
  [PIECE_TYPES.I]: {
    type: PIECE_TYPES.I,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (horizontal)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
      // State 1 (vertical)
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
      // State 2 (horizontal, mirrored)
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
      // State 3 (vertical, mirrored)
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }]
    ]
  },

  // O-piece (yellow) - no rotation
  [PIECE_TYPES.O]: {
    type: PIECE_TYPES.O,
    spawnX: 4,
    spawnY: 0,
    rotations: [
      // All states are identical for O-piece
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    ]
  },

  // T-piece (purple)
  [PIECE_TYPES.T]: {
    type: PIECE_TYPES.T,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (T pointing down)
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      // State 1 (T pointing left)
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      // State 2 (T pointing up)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      // State 3 (T pointing right)
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
    ]
  },

  // S-piece (green)
  [PIECE_TYPES.S]: {
    type: PIECE_TYPES.S,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (horizontal)
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      // State 1 (vertical)
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      // State 2 (horizontal, mirrored)
      [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
      // State 3 (vertical, mirrored)
      [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
    ]
  },

  // Z-piece (red)
  [PIECE_TYPES.Z]: {
    type: PIECE_TYPES.Z,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (horizontal)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      // State 1 (vertical)
      [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      // State 2 (horizontal, mirrored)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
      // State 3 (vertical, mirrored)
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }]
    ]
  },

  // J-piece (blue)
  [PIECE_TYPES.J]: {
    type: PIECE_TYPES.J,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (J pointing right)
      [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      // State 1 (J pointing down)
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
      // State 2 (J pointing left)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      // State 3 (J pointing up)
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }]
    ]
  },

  // L-piece (orange)
  [PIECE_TYPES.L]: {
    type: PIECE_TYPES.L,
    spawnX: 3,
    spawnY: 0,
    rotations: [
      // State 0 (L pointing left)
      [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      // State 1 (L pointing down)
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
      // State 2 (L pointing right)
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
      // State 3 (L pointing up)
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
    ]
  }
};

/**
 * Creates a new piece at spawn position
 * @param {number} type - Piece type (1-7)
 * @returns {Object} Piece object with type, x, y, rotation, cells
 */
export function createPiece(type) {
  const pieceDef = PIECES[type];
  if (!pieceDef) {
    return null;
  }

  return {
    type: pieceDef.type,
    x: pieceDef.spawnX,
    y: pieceDef.spawnY,
    rotation: 0,
    cells: pieceDef.rotations[0]
  };
}

/**
 * Gets cell coordinates for a piece at a specific position and rotation
 * @param {number} type - Piece type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} rotation - Rotation state (0-3)
 * @returns {Array} Array of {x, y} absolute coordinates
 */
export function getPieceCells(type, x, y, rotation) {
  const pieceDef = PIECES[type];
  if (!pieceDef) {
    return null;
  }

  const rotationIndex = ((rotation % 4) + 4) % 4;
  const relativeCells = pieceDef.rotations[rotationIndex];

  return relativeCells.map(cell => ({
    x: x + cell.x,
    y: y + cell.y
  }));
}

/**
 * Rotates a piece (returns new piece, does not mutate)
 * @param {Object} piece - Current piece
 * @param {number} direction - 1 for clockwise, -1 for counter-clockwise
 * @returns {Object} New piece with updated rotation
 */
export function rotatePiece(piece, direction = 1) {
  const newRotation = ((piece.rotation + direction) % 4 + 4) % 4;
  const pieceDef = PIECES[piece.type];

  return {
    ...piece,
    rotation: newRotation,
    cells: pieceDef.rotations[newRotation]
  };
}

/**
 * Moves a piece (returns new piece, does not mutate)
 * @param {Object} piece - Current piece
 * @param {number} deltaX - Horizontal movement
 * @param {number} deltaY - Vertical movement
 * @returns {Object} New piece with updated position
 */
export function movePiece(piece, deltaX, deltaY) {
  return {
    ...piece,
    x: piece.x + deltaX,
    y: piece.y + deltaY
  };
}

/**
 * Gets absolute cell positions for current piece state
 * @param {Object} piece - Current piece
 * @returns {Array} Array of {x, y} absolute coordinates
 */
export function getAbsoluteCells(piece) {
  return piece.cells.map(cell => ({
    x: piece.x + cell.x,
    y: piece.y + cell.y
  }));
}

/**
 * Returns array of all piece types (for randomizer)
 */
export function getAllPieceTypes() {
  return [PIECE_TYPES.I, PIECE_TYPES.O, PIECE_TYPES.T, PIECE_TYPES.S, 
          PIECE_TYPES.Z, PIECE_TYPES.J, PIECE_TYPES.L];
}
