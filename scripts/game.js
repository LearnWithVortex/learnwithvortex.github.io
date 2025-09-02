import { stateManager } from './state.js';
import { domElements, domUtils } from './dom.js';
import { ANIMATION_DELAYS } from './config.js';
import { carouselManager } from './manager.js';

export const gameManager = {
  async loadGames() {
    try {
      const response = await fetch('/assets/lists/gl.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    carouselManager.stopAutoRotation()
    const gameOverlay = domElements.get('GAME_OVERLAY');
    const gameFrame = domElements.get('GAME_FRAME');
    const currentGameTitle = domElements.get('CURRENT_GAME_TITLE');
    const gameCategory = domElements.get('GAME_CATEGORY');
    const fullscreenGame = domElements.get('FULLSCREEN_GAME');

    domUtils.addClass(gameOverlay, 'preload');

    requestAnimationFrame(() => {
      gameFrame.src = game.path;
      currentGameTitle.textContent = game.name;
      gameCategory.textContent = game.category;
      this.updateFavoriteButton(game.id);

      domUtils.removeClass(gameOverlay, 'preload');
      domUtils.addClass(gameOverlay, 'active');

      fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';

      this.animateGameRating(game.rating);
    });

    stateManager.addToRecentlyPlayed(game.id);
    this.setupGamePopout(game);
  },

  playRandomGame() {
    const games = stateManager.get('games');
    if (!games.length) return;
    const randomIndex = Math.floor(Math.random() * games.length);
    this.playGame(games[randomIndex], randomIndex);
  },

  closeGame() {
    const gameOverlay = domElements.get('GAME_OVERLAY');
    const gameFrame = domElements.get('GAME_FRAME');
    carouselManager.startAutoRotation()
    domUtils.addClass(gameOverlay, 'closing');
    setTimeout(() => {
      domUtils.removeClass(gameOverlay, 'active');
      domUtils.removeClass(gameOverlay, 'closing');
      gameFrame.src = '';
    }, ANIMATION_DELAYS.TRANSITION);
  },

  toggleFavoriteCurrentGame() {
    const currentGame = stateManager.get('games')[stateManager.get('currentGameIndex')];
    if (!currentGame) return;
    if (stateManager.toggleFavorite(currentGame.id)) domUtils.addFloatingHeart();
    this.updateFavoriteButton(currentGame.id);
  },

  updateFavoriteButton(gameId) {
    const favoriteGame = domElements.get('FAVORITE_GAME');
    const isFavorite = stateManager.get('favorites').includes(gameId);
    favoriteGame.innerHTML = `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`;
  },

  toggleFullscreen() {
    const gameFrame = domElements.get('GAME_FRAME');
    const fullscreenGame = domElements.get('FULLSCREEN_GAME');

    if (!document.fullscreenElement) {
      this.enterFullscreen(gameFrame);
      fullscreenGame.innerHTML = '<i class="fa-solid fa-compress"></i>';
    } else {
      this.exitFullscreen();
      fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }

    domUtils.addPulseAnimation(fullscreenGame, ANIMATION_DELAYS.TRANSITION);
  },

  enterFullscreen(element) {
    element.requestFullscreen?.().catch(err => console.error(err));
  },

  exitFullscreen() {
    document.exitFullscreen?.();
  },

  setupGamePopout(game) {
    const popout = domElements.get('GAME_POPOUT');
    popout.replaceWith(popout.cloneNode(true));
    domElements.cache();
    domElements.get('GAME_POPOUT').addEventListener('click', () => this.openGamePopout(game));
  },

  openGamePopout(game) {
    const activePopout = stateManager.get('activePopoutWindow');
    if (activePopout?.closed === false) activePopout.close();

    let inFrame;
    try { inFrame = window !== top; } catch { inFrame = true; }
    if (navigator.userAgent.includes("Firefox") || inFrame) return;

    const popup = window.open("about:blank", "_blank");
    if (!popup || popup.closed) return console.log("Popup blocked");

    stateManager.set('activePopoutWindow', popup);
    this.setupPopupWindow(popup, game);
    this.closeGame();
  },

  setupPopupWindow(popup, game) {
    popup.document.title = `Google Docs`;
    const link = popup.document.createElement("link");
    link.rel = "icon";
    link.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png";
    popup.document.head.appendChild(link);

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
    Object.assign(iframe.style, { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", border: "none", margin: 0, padding: 0, outline: "none", zIndex: 9999 });
    popup.document.body.style.margin = 0;
    popup.document.body.appendChild(iframe);

    popup.addEventListener('unload', () => {
      if (stateManager.get('activePopoutWindow') === popup) stateManager.set('activePopoutWindow', null);
    });
  },

  animateGameRating(rating) {
    const stars = document.querySelectorAll('.game-rating i');
    stars.forEach((star, i) => {
      requestAnimationFrame(() => {
        if (i < Math.floor(rating)) star.className = 'fa-solid fa-star';
        else if (i < rating) star.className = 'fa-solid fa-star-half-stroke';
        else star.className = 'fa-regular fa-star';
      });
    });
  }
};
