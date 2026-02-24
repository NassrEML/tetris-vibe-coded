/**
 * Screens - Screen management for Tetris NES 1989
 * Handles: Title, Level Select, Game, Game Over screens
 */

import { GAME_STATES } from '../domain/gameState.js';

/**
 * Screen types
 */
export const SCREENS = {
  TITLE: 'title',
  LEVEL_SELECT: 'levelSelect',
  GAME: 'game',
  GAME_OVER: 'gameOver'
};

/**
 * Creates all screen elements and appends to container
 * @param {HTMLElement} appContainer - Main app container
 * @returns {Object} Screen elements and show/hide functions
 */
export function createScreens(appContainer) {
  // Title Screen
  const titleScreen = createTitleScreen();
  appContainer.appendChild(titleScreen);
  
  // Level Select Screen
  const levelSelectScreen = createLevelSelectScreen();
  appContainer.appendChild(levelSelectScreen);
  
  // Game Screen
  const gameScreen = createGameScreen();
  appContainer.appendChild(gameScreen);
  
  // Game Over Screen
  const gameOverScreen = createGameOverScreen();
  appContainer.appendChild(gameOverScreen);
  
  // Pause Overlay
  const pauseOverlay = createPauseOverlay();
  appContainer.appendChild(pauseOverlay);
  
  return {
    title: titleScreen,
    levelSelect: levelSelectScreen,
    game: gameScreen,
    gameOver: gameOverScreen,
    pauseOverlay: pauseOverlay,
    current: SCREENS.TITLE,
    
    // Navigation methods
    showTitle: () => showScreen(titleScreen, levelSelectScreen, gameScreen, gameOverScreen, SCREENS.TITLE),
    showLevelSelect: () => showScreen(levelSelectScreen, titleScreen, gameScreen, gameOverScreen, SCREENS.LEVEL_SELECT),
    showGame: () => showScreen(gameScreen, titleScreen, levelSelectScreen, gameOverScreen, SCREENS.GAME),
    showGameOver: () => showScreen(gameOverScreen, titleScreen, levelSelectScreen, gameScreen, SCREENS.GAME_OVER),
    
    // Pause methods
    showPause: () => pauseOverlay.classList.add('active'),
    hidePause: () => pauseOverlay.classList.remove('active'),
    isPaused: () => pauseOverlay.classList.contains('active'),
    
    // Update methods
    updateGameOver: (score, highScore) => updateGameOverScreen(gameOverScreen, score, highScore)
  };
}

/**
 * Creates the title screen
 * @returns {HTMLElement} Title screen element
 */
function createTitleScreen() {
  const screen = document.createElement('div');
  screen.id = 'title-screen';
  screen.className = 'screen active';
  
  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.textContent = 'TETRIS';
  screen.appendChild(logo);
  
  const menu = document.createElement('div');
  menu.className = 'menu';
  
  const startOption = document.createElement('div');
  startOption.className = 'menu-item selected';
  startOption.id = 'title-start';
  startOption.textContent = 'START GAME';
  menu.appendChild(startOption);
  
  screen.appendChild(menu);
  
  const hint = document.createElement('div');
  hint.className = 'controls-hint';
  hint.textContent = 'Press ENTER to start';
  screen.appendChild(hint);
  
  return screen;
}

/**
 * Creates the level select screen
 * @returns {HTMLElement} Level select screen element
 */
function createLevelSelectScreen() {
  const screen = document.createElement('div');
  screen.id = 'level-select-screen';
  screen.className = 'screen';
  
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'SELECT LEVEL';
  screen.appendChild(title);
  
  const levelGrid = document.createElement('div');
  levelGrid.className = 'level-grid';
  levelGrid.id = 'level-grid';
  
  // Create level options 0-9
  for (let i = 0; i <= 9; i++) {
    const option = document.createElement('div');
    option.className = 'level-option';
    option.dataset.level = i;
    option.textContent = i;
    if (i === 0) option.classList.add('selected');
    levelGrid.appendChild(option);
  }
  
  screen.appendChild(levelGrid);
  
  const backHint = document.createElement('div');
  backHint.className = 'back-hint';
  backHint.textContent = 'Press ENTER to start • R to go back';
  screen.appendChild(backHint);
  
  return screen;
}

/**
 * Creates the game screen
 * @returns {HTMLElement} Game screen element
 */
function createGameScreen() {
  const screen = document.createElement('div');
  screen.id = 'game-screen';
  screen.className = 'screen';
  
  // Game UI will be created by renderer
  return screen;
}

/**
 * Creates the game over screen
 * @returns {HTMLElement} Game over screen element
 */
function createGameOverScreen() {
  const screen = document.createElement('div');
  screen.id = 'game-over-screen';
  screen.className = 'screen';
  
  const gameOverText = document.createElement('div');
  gameOverText.className = 'game-over-text';
  gameOverText.textContent = 'GAME OVER';
  screen.appendChild(gameOverText);
  
  const finalScore = document.createElement('div');
  finalScore.className = 'final-score';
  finalScore.id = 'final-score';
  finalScore.textContent = 'SCORE: 0';
  screen.appendChild(finalScore);
  
  const highScore = document.createElement('div');
  highScore.className = 'high-score';
  highScore.id = 'high-score-display';
  highScore.textContent = 'HIGH: 0';
  screen.appendChild(highScore);
  
  const menu = document.createElement('div');
  menu.className = 'menu';
  
  const retryOption = document.createElement('div');
  retryOption.className = 'menu-item selected';
  retryOption.id = 'retry-option';
  retryOption.textContent = 'TRY AGAIN';
  menu.appendChild(retryOption);
  
  const titleOption = document.createElement('div');
  titleOption.className = 'menu-item';
  titleOption.id = 'title-option';
  titleOption.textContent = 'TITLE SCREEN';
  menu.appendChild(titleOption);
  
  screen.appendChild(menu);
  
  return screen;
}

/**
 * Creates the pause overlay
 * @returns {HTMLElement} Pause overlay element
 */
function createPauseOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'pause-overlay';
  overlay.className = 'pause-overlay';
  
  const pauseText = document.createElement('div');
  pauseText.className = 'pause-text';
  pauseText.textContent = 'PAUSED';
  overlay.appendChild(pauseText);
  
  return overlay;
}

/**
 * Shows one screen and hides others
 * @param {HTMLElement} show - Screen to show
 * @param {...HTMLElement} hide - Screens to hide
 */
function showScreen(show, ...hide) {
  show.classList.add('active');
  hide.forEach(screen => screen.classList.remove('active'));
}

/**
 * Updates the game over screen with scores
 * @param {HTMLElement} screen - Game over screen element
 * @param {number} score - Final score
 * @param {number} highScore - High score
 */
function updateGameOverScreen(screen, score, highScore) {
  const finalScoreEl = screen.querySelector('#final-score');
  const highScoreEl = screen.querySelector('#high-score-display');
  
  if (finalScoreEl) {
    finalScoreEl.textContent = `SCORE: ${score.toString().padStart(6, '0')}`;
  }
  if (highScoreEl) {
    highScoreEl.textContent = `HIGH: ${highScore.toString().padStart(6, '0')}`;
  }
}

/**
 * Gets selected level from level select screen
 * @param {HTMLElement} screen - Level select screen
 * @returns {number} Selected level (0-9)
 */
export function getSelectedLevel(screen) {
  const selected = screen.querySelector('.level-option.selected');
  return selected ? parseInt(selected.dataset.level, 10) : 0;
}

/**
 * Sets selected level on level select screen
 * @param {HTMLElement} screen - Level select screen
 * @param {number} level - Level to select (0-9)
 */
export function setSelectedLevel(screen, level) {
  const options = screen.querySelectorAll('.level-option');
  options.forEach(opt => opt.classList.remove('selected'));
  
  const target = screen.querySelector(`.level-option[data-level="${level}"]`);
  if (target) {
    target.classList.add('selected');
  }
}

/**
 * Changes selected level (for keyboard navigation)
 * @param {HTMLElement} screen - Level select screen
 * @param {number} delta - Change amount (+1 or -1)
 */
export function changeSelectedLevel(screen, delta) {
  const current = getSelectedLevel(screen);
  const newLevel = Math.max(0, Math.min(9, current + delta));
  setSelectedLevel(screen, newLevel);
}

/**
 * Gets the appropriate screen element for a game state
 * @param {string} gameState - Game state from GAME_STATES
 * @param {Object} screens - Screens object from createScreens
 * @returns {HTMLElement|null} Screen element
 */
export function getScreenForGameState(gameState, screens) {
  switch (gameState) {
    case GAME_STATES.TITLE:
      return screens.title;
    case GAME_STATES.PLAYING:
      return screens.game;
    case GAME_STATES.PAUSED:
      return screens.game;
    case GAME_STATES.GAMEOVER:
      return screens.gameOver;
    default:
      return screens.title;
  }
}

/**
 * Transitions between screens with optional callback
 * @param {Object} screens - Screens object
 * @param {string} fromScreen - Current screen id
 * @param {string} toScreen - Target screen id
 * @param {Function} onComplete - Callback after transition
 */
export function transitionScreen(screens, fromScreen, toScreen, onComplete) {
  // Simple transition - just switch screens
  switch (toScreen) {
    case SCREENS.TITLE:
      screens.showTitle();
      break;
    case SCREENS.LEVEL_SELECT:
      screens.showLevelSelect();
      break;
    case SCREENS.GAME:
      screens.showGame();
      break;
    case SCREENS.GAME_OVER:
      screens.showGameOver();
      break;
  }
  
  if (onComplete) {
    onComplete();
  }
}
