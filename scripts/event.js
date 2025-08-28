import { stateManager } from './state.js';
import { domElements, domUtils } from './dom.js';
import { gameManager } from './manager.js';
import { uiRenderer } from './ui.js';
import { carouselManager } from './carousel-manager.js';

export const eventHandlers = {
  setupAllEventListeners() {
    this.setupSettingsEvents();
    this.setupGameOverlayEvents();
    this.setupSearchEvents();
    this.setupActionButtonEvents();
    this.setupNavigationEvents();
    this.setupViewEvents();
    this.setupSettingsChangeEvents();
    this.setupManagementEvents();
    this.setupFullscreenEvents();
    this.setupCarouselEvents();
  },

  setupSettingsEvents() {
    const settingsBtn = domElements.get('SETTINGS_BTN');
    const closeSettings = domElements.get('CLOSE_SETTINGS');
    const settingsPanel = domElements.get('SETTINGS_PANEL');

    settingsBtn.addEventListener('click', () => {
      domUtils.addClass(settingsPanel, 'active');
      uiRenderer.applySettings();
    });
    
    closeSettings.addEventListener('click', () => {
      domUtils.removeClass(settingsPanel, 'active');
    });
  },

  setupGameOverlayEvents() {
    const closeGame = domElements.get('CLOSE_GAME');
    const favoriteGame = domElements.get('FAVORITE_GAME');

    closeGame.addEventListener('click', () => {
      gameManager.closeGame();
    });
    
    favoriteGame.addEventListener('click', () => {
      gameManager.toggleFavoriteCurrentGame();
    });
  },

  setupSearchEvents() {
    const searchInput = domElements.get('SEARCH_INPUT');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const currentCategory = stateManager.get('currentCategory');
      const filteredGames = stateManager.getFilteredGames(currentCategory, query);
      uiRenderer.renderGames(filteredGames);
    });
  },

  setupActionButtonEvents() {
    const randomBtn = domElements.get('RANDOM_BTN');
    const favoritesBtn = domElements.get('FAVORITES_BTN');
    const recentBtn = domElements.get('RECENT_BTN');

    randomBtn.addEventListener('click', () => {
      gameManager.playRandomGame();
    });
    
    favoritesBtn.addEventListener('click', () => {
      uiRenderer.toggleActiveButton(favoritesBtn);
      stateManager.set('currentView', 'favorites');
      uiRenderer.renderFavoriteGames();
    });
    
    recentBtn.addEventListener('click', () => {
      uiRenderer.toggleActiveButton(recentBtn);
      stateManager.set('currentView', 'all');
      const games = stateManager.get('games');
      uiRenderer.renderGames(games);
    });
  },

  setupNavigationEvents() {
    const navLinks = domElements.get('NAV_LINKS');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Skip special links
        const href = link.getAttribute('href');
        if (href === 'form.html' || href === 'choose.html') {
          return;
        }
        
        e.preventDefault();
        
        // Update active nav link
        navLinks.forEach(l => domUtils.removeClass(l, 'active'));
        domUtils.addClass(link, 'active');
        
        // Filter games by category
        const category = link.dataset.section;
        stateManager.set('currentCategory', category);
        
        const filteredGames = stateManager.getFilteredGames(category);
        uiRenderer.renderGames(filteredGames);
      });
    });
  },

  setupViewEvents() {
    const viewBtns = domElements.get('VIEW_BTNS');
    const gameList = domElements.get('GAME_LIST');
    const viewAllRecent = domElements.get('VIEW_ALL_RECENT');

    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => domUtils.removeClass(b, 'active'));
        domUtils.addClass(btn, 'active');
        
        const viewMode = btn.dataset.view;
        domUtils.toggleClass(gameList, 'list-view', viewMode === 'list');
      });
    });

    viewAllRecent.addEventListener('click', () => {
      const showAllRecent = !stateManager.get('showAllRecent');
      stateManager.set('showAllRecent', showAllRecent);
      uiRenderer.renderRecentGames();
    });
  },

  setupSettingsChangeEvents() {
    const thumbnailSize = domElements.get('THUMBNAIL_SIZE');
    const toggleDarkmode = domElements.get('TOGGLE_DARKMODE');
    const toggleCompact = domElements.get('TOGGLE_COMPACT');

    const saveSettings = () => {
      const settings = {
        thumbnailSize: thumbnailSize.value,
        darkmode: toggleDarkmode.checked,
        compact: toggleCompact.checked,
      };
      stateManager.saveSettings(settings);
      uiRenderer.applySettings();
    };

    thumbnailSize.addEventListener('change', () => {
      saveSettings();
      // Apply size immediately to existing grids
      document.querySelectorAll('.game-grid').forEach(grid => {
        domUtils.setAttribute(grid, 'data-size', thumbnailSize.value);
      });
    });

    toggleDarkmode.addEventListener('change', saveSettings);
    toggleCompact.addEventListener('change', saveSettings);
  },

  setupManagementEvents() {
    const clearHistory = domElements.get('CLEAR_HISTORY');
    const resetFavorites = domElements.get('RESET_FAVORITES');

    clearHistory.addEventListener('click', () => {
      stateManager.clearRecentlyPlayed();
      uiRenderer.renderRecentGames();
    });
    
    resetFavorites.addEventListener('click', () => {
      stateManager.clearFavorites();
      const games = stateManager.get('games');
      uiRenderer.renderGames(games);
    });
  },

  setupFullscreenEvents() {
    const fullscreenGame = domElements.get('FULLSCREEN_GAME');

    fullscreenGame.addEventListener('click', () => {
      gameManager.toggleFullscreen();
    });

    // Listen for fullscreen change to update button
    document.addEventListener('fullscreenchange', () => {
      const icon = document.fullscreenElement ? 
        '<i class="fa-solid fa-compress"></i>' : 
        '<i class="fa-solid fa-expand"></i>';
      domUtils.setHTML(fullscreenGame, icon);
    });
  },

  setupCarouselEvents() {
    carouselManager.setupControls();
  }
};
