// Main entry point
import { DOMAIN_PLACEHOLDER } from './domain/index.js';
import { CONTROLLER_PLACEHOLDER } from './controller/index.js';
import { VIEW_PLACEHOLDER } from './view/index.js';

console.log(DOMAIN_PLACEHOLDER);
console.log(CONTROLLER_PLACEHOLDER);
console.log(VIEW_PLACEHOLDER);

// Initialize game
const app = document.getElementById('app');
app.innerHTML = '<h1>Tetris NES 1989</h1><p>Loading...</p>';
