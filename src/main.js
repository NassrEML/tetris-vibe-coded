/**
 * Main entry point for Tetris NES 1989
 * Wires together domain, controller, and view
 */

import { GAME_STATES } from './domain/gameState.js';
import { 
  initGame, 
  startNewGame, 
  updateGame,
  returnToTitle as returnToTitleController
} from './controller/gameController.js';
import { createInputState, handleKeyDown, handleKeyUp, clearTransientKeys } from './controller/inputController.js';
import { createGameLoop, startGameLoop, stopGameLoop } from './controller/gameLoop.js';
import { createScreens, SCREENS, getSelectedLevel, setSelectedLevel, changeSelectedLevel } from './view/screens.js';
import { createGameUI, renderGame, renderNextPieceSync, renderStats } from './view/renderer.js';
import { advanceGameOverAnimation } from './domain/gameOver.js';

/**
 * High Score Manager - Handles localStorage persistence
 */
const HighScoreManager = {
  STORAGE_KEY: 'tetris_nes_highscore',
  
  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
      return 0;
    }
  },
  
  save(score) {
    try {
      localStorage.setItem(this.STORAGE_KEY, score.toString());
    } catch (e) {
      // Ignore storage errors
    }
  },
  
  update(score) {
    const current = this.load();
    if (score > current) {
      this.save(score);
      return score;
    }
    return current;
  }
};

/**
 * Game instance
 */
const game = {
  state: null,
  input: null,
  screens: null,
  ui: null,
  loop: null,
  selectedLevel: 0,
  isRunning: false
};

/**
 * Initialize the game
 */
function init() {
  const app = document.getElementById('app');
  
  // Create screens
  game.screens = createScreens(app);
  
  // Create game UI within game screen
  const gameScreen = game.screens.game;
  game.ui = createGameUI(gameScreen);
  
  // Initialize game state
  game.state = initGame(0);
  
  // Initialize input
  game.input = createInputState();
  
  // Create game loop
  game.loop = createGameLoop(
    (frameCount) => update(frameCount),
    () => render()
  );
  
  // Setup input handlers
  setupInputHandlers();
  
  // Start at title screen
  showScreen(SCREENS.TITLE);
  
  // Start the game loop
  startGameLoop(game.loop);
  game.isRunning = true;
  
  console.log('Tetris NES 1989 initialized');
}

/**
 * Setup keyboard input handlers
 */
function setupInputHandlers() {
  window.addEventListener('keydown', (e) => {
    game.input = handleKeyDown(game.input, e.key);
    handleGlobalInput(e.key);
  });
  
  window.addEventListener('keyup', (e) => {
    game.input = handleKeyUp(game.input, e.key);
  });
}

/**
 * Handle global input (screen navigation)
 * @param {string} key - Key pressed
 */
function handleGlobalInput(key) {
  const currentScreen = game.screens.current;
  
  switch (currentScreen) {
    case SCREENS.TITLE:
      if (key === 'Enter' || key === ' ') {
        showScreen(SCREENS.LEVEL_SELECT);
      }
      break;
      
    case SCREENS.LEVEL_SELECT:
      if (key === 'Enter') {
        const level = getSelectedLevel(game.screens.levelSelect);
        startGame(level);
      } else if (key === 'r' || key === 'R' || key === 'Escape') {
        showScreen(SCREENS.TITLE);
      } else if (key === 'ArrowLeft') {
        changeSelectedLevel(game.screens.levelSelect, -1);
      } else if (key === 'ArrowRight') {
        changeSelectedLevel(game.screens.levelSelect, 1);
      }
      break;
      
    case SCREENS.GAME:
      if (key === 'p' || key === 'P') {
        togglePause();
      } else if (key === 'r' || key === 'R' || key === 'Escape') {
        returnToTitleScreen();
      }
      break;
      
    case SCREENS.GAME_OVER:
      if (key === 'Enter' || key === ' ') {
        showScreen(SCREENS.LEVEL_SELECT);
      } else if (key === 'r' || key === 'R' || key === 'Escape') {
        showScreen(SCREENS.TITLE);
      }
      break;
  }
}

/**
 * Show a specific screen
 * @param {string} screenName - Screen name from SCREENS
 */
function showScreen(screenName) {
  game.screens.current = screenName;
  
  switch (screenName) {
    case SCREENS.TITLE:
      game.screens.showTitle();
      break;
    case SCREENS.LEVEL_SELECT:
      game.screens.showLevelSelect();
      break;
    case SCREENS.GAME:
      game.screens.showGame();
      break;
    case SCREENS.GAME_OVER:
      game.screens.showGameOver();
      break;
  }
}

/**
 * Start a new game
 * @param {number} level - Starting level
 */
function startGame(level) {
  game.selectedLevel = level;
  game.state = initGame(level);
  game.state = startNewGame(game.state, level);
  
  // Load high score
  const highScore = HighScoreManager.load();
  game.state.score.highScore = highScore;
  
  // Update UI
  renderNextPieceSync(game.ui.nextPieceCells, game.state.nextPiece);
  renderStats(game.ui, game.state);
  
  showScreen(SCREENS.GAME);
  console.log('Game started at level', level);
}

/**
 * Return to title screen
 */
function returnToTitleScreen() {
  game.state = initGame(0);
  game.screens.hidePause();
  showScreen(SCREENS.TITLE);
}

/**
 * Toggle pause state
 */
function togglePause() {
  if (game.state.state === GAME_STATES.PLAYING) {
    game.state = { ...game.state, state: GAME_STATES.PAUSED };
    game.screens.showPause();
  } else if (game.state.state === GAME_STATES.PAUSED) {
    game.state = { ...game.state, state: GAME_STATES.PLAYING };
    game.screens.hidePause();
  }
}

/**
 * Update game state (called by game loop)
 * @param {number} frameCount - Current frame
 */
function update(frameCount) {
  if (game.state.state === GAME_STATES.PLAYING) {
    const result = updateGame(game.state, game.input);
    game.state = result.gameState;
    
    // Handle events
    for (const event of result.events) {
      switch (event.type) {
        case 'PIECE_LOCKED':
          if (event.linesCleared > 0) {
            console.log('Cleared', event.linesCleared, 'lines!');
          }
          break;
          
        case 'PIECE_SPAWNED':
          renderNextPieceSync(game.ui.nextPieceCells, game.state.nextPiece);
          break;
          
        case 'GAME_OVER':
          handleGameOver();
          break;
      }
    }
    
    // Update high score if needed
    if (game.state.score.totalScore > game.state.score.highScore) {
      game.state.score.highScore = HighScoreManager.update(game.state.score.totalScore);
    }
  } else if (game.state.state === GAME_STATES.GAMEOVER) {
    // Handle game over animation
    const result = advanceGameOverAnimation(game.state);
    game.state = result.gameState;
    
    if (result.completed && game.screens.current !== SCREENS.GAME_OVER) {
      handleGameOver();
    }
  }
  
  // Clear transient input
  game.input = clearTransientKeys(game.input);
}

/**
 * Render game (called by game loop)
 */
function render() {
  if (game.screens.current === SCREENS.GAME) {
    // Render game board
    renderGame(game.ui.boardCells, game.state);
    
    // Render stats
    renderStats(game.ui, game.state);
  }
}

/**
 * Handle game over
 */
function handleGameOver() {
  // Save final high score
  const finalHighScore = HighScoreManager.update(game.state.score.totalScore);
  game.state.score.highScore = finalHighScore;
  
  // Update game over screen
  game.screens.updateGameOver(game.state.score.totalScore, finalHighScore);
  
  // Switch to game over screen
  showScreen(SCREENS.GAME_OVER);
}

/**
 * Cleanup function
 */
function cleanup() {
  if (game.loop) {
    stopGameLoop(game.loop);
  }
  game.isRunning = false;
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for testing
export { init, cleanup, game, showScreen, startGame, togglePause };
