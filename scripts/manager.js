import { stateManager } from './state.js';
import { domElements, domUtils } from './dom.js';
import { uiRenderer } from './ui.js';
import { CONFIG, ANIMATION_DELAYS } from './config.js';

export const carouselManager = {
  startAutoRotation() {
    // Clear any existing interval
    this.stopAutoRotation();

    const featuredGames = stateManager.get('featuredGames');
    if (!featuredGames || featuredGames.length <= 1) {
      return;
    }

    // Rotate every 5 seconds
    const interval = setInterval(() => {
      const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
      domUtils.addClass(carouselContainer, 'transition-right');
      
      setTimeout(() => {
        stateManager.updateCarouselIndex('next');
        uiRenderer.updateCarousel();
        domUtils.removeClass(carouselContainer, 'transition-right');
      }, ANIMATION_DELAYS.TRANSITION);
    }, CONFIG.CAROUSEL_AUTO_ROTATE_INTERVAL);

    stateManager.set('carouselInterval', interval);
  },

  stopAutoRotation() {
    const currentInterval = stateManager.get('carouselInterval');
    if (currentInterval) {
      clearInterval(currentInterval);
      stateManager.set('carouselInterval', null);
    }
  },

  goToNext() {
    this.stopAutoRotation();
    
    const featuredGames = stateManager.get('featuredGames');
    if (!featuredGames || featuredGames.length === 0) {
      return;
    }
    
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
    domUtils.addClass(carouselContainer, 'transition-right');
    
    setTimeout(() => {
      stateManager.updateCarouselIndex('next');
      uiRenderer.updateCarousel();
      domUtils.removeClass(carouselContainer, 'transition-right');
      this.startAutoRotation();
    }, ANIMATION_DELAYS.TRANSITION);
  },

  goToPrevious() {
    this.stopAutoRotation();
    
    const featuredGames = stateManager.get('featuredGames');
    if (!featuredGames || featuredGames.length === 0) {
      return;
    }
    
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');
    domUtils.addClass(carouselContainer, 'transition-left');
    
    setTimeout(() => {
      stateManager.updateCarouselIndex('previous');
      uiRenderer.updateCarousel();
      domUtils.removeClass(carouselContainer, 'transition-left');
      this.startAutoRotation();
    }, ANIMATION_DELAYS.TRANSITION);
  },

  setupControls() {
    const carouselPrev = domElements.get('CAROUSEL_PREV');
    const carouselNext = domElements.get('CAROUSEL_NEXT');
    const carouselContainer = domElements.get('CAROUSEL_CONTAINER');

    if (!carouselPrev || !carouselNext) {
      console.log("Carousel controls not found");
      return;
    }

    // Previous button
    carouselPrev[0]?.addEventListener('click', () => {
      this.goToPrevious();
    });

    // Next button
    carouselNext[0]?.addEventListener('click', () => {
      this.goToNext();
    });

    // Pause on hover
    carouselContainer.addEventListener('mouseenter', () => {
      this.stopAutoRotation();
    });

    carouselContainer.addEventListener('mouseleave', () => {
      this.startAutoRotation();
    });
  }
};
