
import { applySettings, saveSettings } from './modules/settings.js';
import { loadGames, renderGames } from './modules/games.js';
import { setupCarousel, updateCarousel } from './modules/carousel.js';
import { updateClock, setupUIListeners } from './modules/ui.js';

// Initialize the application
async function init() {
  // Update time display
  updateClock();
  setInterval(updateClock, 1000);

  // Load games
  const games = await loadGames();
  
  // Initialize UI
  setupUIListeners();
  renderGames(games);
  setupCarousel(games);
  
  // Apply settings
  applySettings();
  
  // Set up settings event listeners
  const toggleAnimations = document.getElementById('toggle-animations');
  const thumbnailSize = document.getElementById('thumbnail-size');
  
  if (toggleAnimations && thumbnailSize) {
    toggleAnimations.addEventListener('change', saveSettings);
    thumbnailSize.addEventListener('change', saveSettings);
  }
  
  // Add page transition effect
  document.body.classList.add('page-loaded');
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
