import { stateManager } from './state-manager.js';
import { domElements, domUtils } from './dom-elements.js';
import { gameManager } from './game-manager.js';
import { ANIMATION_DELAYS, CONFIG } from './config.js';

export const uiRenderer = {
  updateGamesCount(count) {
    const gamesCountSpan = domElements.get('GAMES_COUNT');
    if (gamesCountSpan) {
      domUtils.setText(gamesCountSpan, `(${count})`);
    }
  },

  renderGames(gamesList) {
    const gameList = domElements.get('GAME_LIST');
    const settings = stateManager.getSettings();
    
    this.updateGamesCount(gamesList.length);
    domUtils.setHTML(gameList, '');
    domUtils.setAttribute(gameList, 'data-size', settings.thumbnailSize);
    
    gamesList.forEach((game, index) => {
      const gameCard = this.createGameCard(game, index);
      gameList.appendChild(gameCard);
    });
  },

  createGameCard(game, index) {
    const favorites = stateManager.get('favorites');
    const isFavorite = favorites.includes(game.id);
    
    const gameCard = domUtils.createElement('div', 'game-card');
    domUtils.setAttribute(gameCard, 'data-game-id', game.id);
    gameCard.style.animationDelay = `${index * ANIMATION_DELAYS.GAME_CARD_STAGGER}ms`;
    
    gameCard.innerHTML = `
      <div class="game-img-container">
        <img src="${game.logo}" alt="${game.name}" class="game-img">
        <div class="game-overlay">
          <div class="play-btn">
            <i class="fa-solid fa-play"></i>
          </div>
        </div>
      </div>
      <div class="game-info">
        <h3 class="game-title">${game.name}</h3>
        <div class="game-meta">
          <span class="game-category">${game.category}</span>
          <button class="favorite-btn ${isFavorite ? 'active' : ''}">
            <i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    
    this.attachGameCardEvents(gameCard, game, index);
    return gameCard;
  },

  attachGameCardEvents(gameCard, game, index) {
    // Game click event with ripple effect
    gameCard.addEventListener('click', async (e) => {
      if (!e.target.closest('.favorite-btn')) {
        await domUtils.addRippleEffect(gameCard, e);
        gameManager.playGame(game, index);
      }
    });
    
    // Favorite button click
    const favoriteBtn = gameCard.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleFavoriteClick(game.id, gameCard, favoriteBtn);
    });
  },

  handleFavoriteClick(gameId, gameCard, favoriteBtn) {
    const wasAdded = stateManager.toggleFavorite(gameId);
    const currentView = stateManager.get('currentView');
    
    if (currentView === 'favorites' && !wasAdded) {
      // Removing from favorites view - animate out
      domUtils.addClass(gameCard, 'fade-out');
      setTimeout(() => {
        domUtils.removeElement(gameCard);
        this.updateGamesCount(document.querySelectorAll('.game-card').length);
      }, ANIMATION_DELAYS.TRANSITION);
    } else {
      // Update button state
      this.updateFavoriteButton(favoriteBtn, wasAdded);
    }
  },

  updateFavoriteButton(favoriteBtn, isFavorite) {
    domUtils.toggleClass(favoriteBtn, 'active', isFavorite);
    domUtils.setHTML(favoriteBtn, `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`);
  },

  renderRecentGames() {
    const recentlyPlayed = domElements.get('RECENTLY_PLAYED');
    const viewAllRecent = domElements.get('VIEW_ALL_RECENT');
    const settings = stateManager.getSettings();
    const showAllRecent = stateManager.get('showAllRecent');
    
    domUtils.setHTML(recentlyPlayed, '');
    domUtils.setAttribute(recentlyPlayed, 'data-size', settings.thumbnailSize);
    
    const recentGames = stateManager.getRecentlyPlayedGames();
    
    if (recentGames.length === 0) {
      domUtils.setHTML(recentlyPlayed, '<p class="empty-state">No recently played games</p>');
      viewAllRecent.style.display = 'none';
      return;
    }
    
    // Show view all button only if more than max display
    viewAllRecent.style.display = recentGames.length > CONFIG.MAX_RECENT_DISPLAY ? 'block' : 'none';
    
    // Limit games shown unless view all is active
    const gamesToShow = showAllRecent ? recentGames : recentGames.slice(0, CONFIG.MAX_RECENT_DISPLAY);
    
    gamesToShow.forEach(game => {
      const gameCard = this.createGameCard(game, 0);
      recentlyPlayed.appendChild(gameCard);
    });
    
    // Update button text
    domUtils.setText(viewAllRecent, showAllRecent ? 'Show Less' : 'View All');
  },

  renderFavoriteGames() {
    const favoriteGames = stateManager.getFavoriteGames();
    this.renderGames(favoriteGames);
  },

  setupCarousel() {
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
    const carouselDots = domElements.get('CAROUSEL_DOTS');
    const featuredGames = stateManager.get('featuredGames');
    
    domUtils.setHTML(carouselContainer, '');
    domUtils.setHTML(carouselDots, '');
    
    if (!featuredGames || featuredGames.length === 0) {
      console.log("No featured games available for carousel");
      return;
    }

    featuredGames.forEach((game, index) => {
      this.createCarouselItem(game, index);
      this.createCarouselDot(index);
    });
  },

  createCarouselItem(game, index) {
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
    const maxLength = 120;
    const fullDesc = game.description || `Experience the excitement of ${game.name}. One of our most popular ${game.category} games!`;
    const isLong = fullDesc.length > maxLength;
    const shortDesc = fullDesc.slice(0, maxLength) + (isLong ? '...' : '');

    const carouselItem = domUtils.createElement('div', 'carousel-item');
    
    carouselItem.innerHTML = `
      <img src="${game.logo}" alt="${game.name}">
      <div class="carousel-content">
        <h2 class="carousel-title">${game.name}</h2>
        <p class="carousel-desc" data-full="${fullDesc}" data-short="${shortDesc}">
          ${shortDesc}
          ${isLong ? '<span class="show-more-btn" style="color: #4fc3f7; cursor: pointer; margin-left: 10px; font-weight: 500;">Show More</span>' : ''}
        </p>
        <button class="carousel-btn">Play Now</button>
      </div>
    `;

    // Add event listeners
    if (isLong) {
      const desc = carouselItem.querySelector('.carousel-desc');
      desc.addEventListener('click', (e) => {
        if (e.target.classList.contains('show-more-btn')) {
          this.toggleCarouselDescription(desc, e.target);
        }
      });
    }

    const playBtn = carouselItem.querySelector('.carousel-btn');
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentFeatured = stateManager.getCurrentFeaturedGame();
      const gameIndex = stateManager.findGameIndex(currentFeatured.id);
      gameManager.playGame(currentFeatured, gameIndex);
    });

    carouselContainer.appendChild(carouselItem);
  },

  createCarouselDot(index) {
    const carouselDots = domElements.get('CAROUSEL_DOTS');
    const carouselIndex = stateManager.get('carouselIndex');
    
    const dot = domUtils.createElement('div', `carousel-dot ${index === carouselIndex ? 'active' : ''}`);
    dot.addEventListener('click', () => {
      stateManager.set('carouselIndex', index);
      this.updateCarousel();
    });
    
    carouselDots.appendChild(dot);
  },

  toggleCarouselDescription(descElement, button) {
    const isExpanded = button.textContent.trim() === 'Show Less';
    const fullDesc = descElement.dataset.full;
    const shortDesc = descElement.dataset.short;
    
    domUtils.setHTML(descElement, 
      (isExpanded ? shortDesc : fullDesc) +
      '<span class="show-more-btn" style="color: #4fc3f7; cursor: pointer; margin-left: 10px; font-weight: 500;">' +
      (isExpanded ? 'Show More' : 'Show Less') +
      '</span>'
    );
  },

  updateCarousel() {
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
    const carouselDots = domElements.get('CAROUSEL_DOTS');
    const carouselIndex = stateManager.get('carouselIndex');
    const featuredGames = stateManager.get('featuredGames');
    
    if (!featuredGames || featuredGames.length === 0) {
      return;
    }
    
    carouselContainer.style.transform = `translateX(-${carouselIndex * 100}%)`;
    
    const dots = carouselDots.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      const isActive = index === carouselIndex;
      domUtils.toggleClass(dot, 'active', isActive);
      
      if (isActive) {
        domUtils.addPulseAnimation(dot, ANIMATION_DELAYS.PULSE_DURATION);
      }
    });
  },

  updateClock() {
    const timeDisplay = domElements.get('TIME_DISPLAY');
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    
    domUtils.setText(timeDisplay, `${h}:${m} ${ampm}`);
  },

  applySettings() {
    const settings = stateManager.getSettings();
    const thumbnailSize = domElements.get('THUMBNAIL_SIZE');
    const toggleDarkmode = domElements.get('TOGGLE_DARKMODE');
    const toggleCompact = domElements.get('TOGGLE_COMPACT');

    // Apply thumbnail size
    if (settings.thumbnailSize && thumbnailSize) {
      thumbnailSize.value = settings.thumbnailSize;
      document.querySelectorAll('.game-grid').forEach(grid => {
        domUtils.setAttribute(grid, 'data-size', settings.thumbnailSize);
      });
    }

    // Apply dark mode
    if (settings.darkmode !== undefined && toggleDarkmode) {
      toggleDarkmode.checked = !!settings.darkmode;
      domUtils.toggleClass(document.body, 'dark-mode', !!settings.darkmode);
    }

    // Apply compact view
    if (settings.compact !== undefined && toggleCompact) {
      toggleCompact.checked = !!settings.compact;
      document.querySelectorAll('.game-grid').forEach(grid => {
        domUtils.toggleClass(grid, 'compact', !!settings.compact);
      });
    }
  },

  showLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (!loadingScreen) {
      console.warn('Loading screen element not found');
      return;
    }
    
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, ANIMATION_DELAYS.LOADING_FADE);
    }, CONFIG.LOADING_SCREEN_DELAY);
  },

  toggleActiveButton(button) {
    const allButtons = document.querySelectorAll('.action-btn');
    allButtons.forEach(btn => {
      if (btn === button) {
        domUtils.addClass(btn, 'active');
        domUtils.addPulseAnimation(btn, ANIMATION_DELAYS.PULSE_DURATION);
      } else {
        domUtils.removeClass(btn, 'active');
      }
    });
  }
};
