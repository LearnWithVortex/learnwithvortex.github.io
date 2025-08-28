import { stateManager } from './state.js';
import { domElements, domUtils } from './dom.js';
import { ANIMATION_DELAYS } from './config.js';

export const gameManager = {
  async loadGames() {
    try {
      const response = await fetch('/assets/lists/gl.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const games = await response.json();
      stateManager.setGames(games);
      
      return games;
    } catch (error) {
      console.error('Error loading games:', error);
      throw error;
    }
  },

  playGame(game, index = null) {
    const gameIndex = index !== null ? index : stateManager.findGameIndex(game.id);
    stateManager.set('currentGameIndex', gameIndex);
    
    const gameOverlay = domElements.get('GAME_OVERLAY');
    const gameFrame = domElements.get('GAME_FRAME');
    const currentGameTitle = domElements.get('CURRENT_GAME_TITLE');
    const gameCategory = domElements.get('GAME_CATEGORY');
    const fullscreenGame = domElements.get('FULLSCREEN_GAME');
    
    // Preload animation
    domUtils.addClass(gameOverlay, 'preload');
    
    setTimeout(() => {
      gameFrame.src = game.path;
      domUtils.setText(currentGameTitle, game.name);
      domUtils.setText(gameCategory, game.category);
      this.updateFavoriteButton(game.id);
      
      domUtils.removeClass(gameOverlay, 'preload');
      domUtils.addClass(gameOverlay, 'active');
      
      // Reset fullscreen button
      domUtils.setHTML(fullscreenGame, '<i class="fa-solid fa-expand"></i>');
      
      // Animate game rating
      this.animateGameRating(game.rating);
    }, ANIMATION_DELAYS.TRANSITION);
    
    // Save to recently played and setup popout
    stateManager.addToRecentlyPlayed(game.id);
    this.setupGamePopout(game);
  },

  playRandomGame() {
    const games = stateManager.get('games');
    if (games.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * games.length);
    this.playGame(games[randomIndex], randomIndex);
  },

  closeGame() {
    const gameOverlay = domElements.get('GAME_OVERLAY');
    const gameFrame = domElements.get('GAME_FRAME');
    
    domUtils.addClass(gameOverlay, 'closing');
    
    setTimeout(() => {
      domUtils.removeClass(gameOverlay, 'active');
      domUtils.removeClass(gameOverlay, 'closing');
      gameFrame.src = '';
    }, ANIMATION_DELAYS.TRANSITION);
  },

  toggleFavoriteCurrentGame() {
    const currentGameIndex = stateManager.get('currentGameIndex');
    const games = stateManager.get('games');
    const currentGame = games[currentGameIndex];
    
    if (!currentGame) return;
    
    const isNowFavorite = stateManager.toggleFavorite(currentGame.id);
    this.updateFavoriteButton(currentGame.id);
    
    // Add heart animation if favorited
    if (isNowFavorite) {
      domUtils.addFloatingHeart();
    }
  },

  updateFavoriteButton(gameId) {
    const favoriteGame = domElements.get('FAVORITE_GAME');
    const favorites = stateManager.get('favorites');
    const isFavorite = favorites.includes(gameId);
    
    domUtils.setHTML(favoriteGame, `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`);
  },

  toggleFullscreen() {
    const gameFrame = domElements.get('GAME_FRAME');
    const fullscreenGame = domElements.get('FULLSCREEN_GAME');
    
    if (!document.fullscreenElement) {
      this.enterFullscreen(gameFrame);
      domUtils.setHTML(fullscreenGame, '<i class="fa-solid fa-compress"></i>');
    } else {
      this.exitFullscreen();
      domUtils.setHTML(fullscreenGame, '<i class="fa-solid fa-expand"></i>');
    }
    
    domUtils.addPulseAnimation(fullscreenGame, ANIMATION_DELAYS.TRANSITION);
  },

  enterFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (element.webkitRequestFullscreen) { /* Safari */
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE11 */
      element.msRequestFullscreen();
    }
  },

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  },

  setupGamePopout(game) {
    const gamePopout = domElements.get('GAME_POPOUT');
    
    // Remove existing event listener
    const newGamePopout = gamePopout.cloneNode(true);
    gamePopout.parentNode.replaceChild(newGamePopout, gamePopout);
    
    // Update DOM elements cache
    domElements.cache();
    
    newGamePopout.addEventListener('click', () => {
      this.openGamePopout(game);
    });
  },

  openGamePopout(game) {
    // Close existing popout
    const activePopout = stateManager.get('activePopoutWindow');
    if (activePopout && !activePopout.closed) {
      try {
        activePopout.close();
      } catch (e) {
        console.log("Could not close previous popup:", e);
      }
    }

    // Check if already in iframe or Firefox
    let inFrame;
    try {
      inFrame = window !== top;
    } catch (e) {
      inFrame = true;
    }

    if (!navigator.userAgent.includes("Firefox") && !inFrame) {
      const popup = window.open("about:blank", "_blank");

      if (!popup || popup.closed) {
        console.log("Popup was blocked");
        return;
      }

      stateManager.set('activePopoutWindow', popup);
      this.setupPopupWindow(popup, game);
      this.closeGame();
    }
  },

  setupPopupWindow(popup, game) {
    // Set title and favicon
    popup.document.title = `Google Docs`;
    const link = popup.document.createElement("link");
    link.rel = "icon";
    link.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png";
    popup.document.head.appendChild(link);

    // Create iframe
    const iframe = popup.document.createElement("iframe");
    iframe.sandbox = [
      "allow-scripts",
      "allow-forms", 
      "allow-same-origin",
      "allow-popups",
      "allow-downloads",
      "allow-modals",
      "allow-presentation",
      "allow-top-navigation",
      "allow-top-navigation-by-user-activation",
      "allow-popups-to-escape-sandbox"
    ].join(" ");

    iframe.src = game.name === "Minecraft" ? game.path : window.location.origin + game.path;
    
    Object.assign(iframe.style, {
      position: "fixed",
      top: "0",
      left: "0", 
      width: "100%",
      height: "100%",
      margin: "0",
      padding: "0",
      border: "none",
      outline: "none",
      zIndex: "9999"
    });

    popup.document.body.style.margin = "0";
    popup.document.body.appendChild(iframe);

    // Track popup close
    popup.addEventListener('unload', () => {
      if (stateManager.get('activePopoutWindow') === popup) {
        stateManager.set('activePopoutWindow', null);
      }
    });
  },

  animateGameRating(rating) {
    const stars = document.querySelectorAll('.game-rating i');
    stars.forEach((star, i) => {
      setTimeout(() => {
        if (i < Math.floor(rating)) {
          star.className = 'fa-solid fa-star';
        } else if (i < rating) {
          star.className = 'fa-solid fa-star-half-stroke';
        } else {
          star.className = 'fa-regular fa-star';
        }
      }, i * ANIMATION_DELAYS.STAR_RATING);
    });
  }
};
