import { CONFIG, LOCAL_STORAGE_KEYS } from './config.js';
import { stateManager } from './state.js';
import { domElements, domUtils } from './dom.js';
import { gameManager } from './game.js';
import { uiRenderer } from './ui.js';
import { carouselManager } from './manager.js';
import { eventHandlers } from './event.js';

export const appInitializer = {
  async init() {
    try {
      // Initialize optimized settings for Cookie Clicker if first visit
      this.initializeFirstTimeSetup();
      
      // Show loading screen with animation
      uiRenderer.showLoadingScreen();
      
      // Start clock
      this.startClock();
      
      // Load games data
      const games = await gameManager.loadGames();
      
      // Initialize UI with smooth animations
      uiRenderer.renderGames(games);
      uiRenderer.renderRecentGames();
      uiRenderer.setupCarousel();
      
      // Set up event listeners
      eventHandlers.setupAllEventListeners();
      
      // Apply saved settings
      uiRenderer.applySettings();
      
      // Start carousel auto-rotation
      carouselManager.startAutoRotation();
      
      // Add page transition effect
      domUtils.addClass(document.body, 'page-loaded');
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.handleInitializationError(error);
    }
  },

  initializeFirstTimeSetup() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.INITIALIZED)) {
      // Set optimized Cookie Clicker save data
      localStorage.setItem(LOCAL_STORAGE_KEYS.COOKIE_CLICKER, CONFIG.COOKIE_CLICKER_SAVE);
      localStorage.setItem(LOCAL_STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  startClock() {
    // Update clock immediately, then every second
    uiRenderer.updateClock();
    setInterval(() => uiRenderer.updateClock(), 1000);
  },

  handleInitializationError(error) {
    // Show user-friendly error message
    const gameList = domElements.get('GAME_LIST');
    if (gameList) {
      domUtils.setHTML(gameList, `
        <div class="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>We're having trouble loading the games. Please refresh the page or try again later.</p>
          <button onclick="window.location.reload()" class="retry-btn">Retry</button>
        </div>
      `);
    }
  }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  appInitializer.init();
});
