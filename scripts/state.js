import { LOCAL_STORAGE_KEYS, CONFIG } from './config.js';

// Application State Manager
class StateManager {
  constructor() {
    this.state = {
      games: [],
      favorites: this.loadFromStorage(LOCAL_STORAGE_KEYS.FAVORITES, []),
      currentGameIndex: 0,
      currentCategory: 'all',
      carouselIndex: 0,
      featuredGames: [],
      showAllRecent: false,
      currentView: 'all',
      carouselInterval: null,
      activePopoutWindow: null
    };
  }

  // Generic state getters and setters
  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
  }

  update(updates) {
    Object.assign(this.state, updates);
  }

  // Local storage helpers
  loadFromStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }

  // Specific state management methods
  setGames(games) {
    this.state.games = games;
    this.state.featuredGames = games.filter(game => game.featured);
  }

  addToFavorites(gameId) {
    if (!this.state.favorites.includes(gameId)) {
      this.state.favorites.push(gameId);
      this.saveToStorage(LOCAL_STORAGE_KEYS.FAVORITES, this.state.favorites);
    }
  }

  removeFromFavorites(gameId) {
    const index = this.state.favorites.indexOf(gameId);
    if (index !== -1) {
      this.state.favorites.splice(index, 1);
      this.saveToStorage(LOCAL_STORAGE_KEYS.FAVORITES, this.state.favorites);
    }
  }

  toggleFavorite(gameId) {
    const isFavorite = this.state.favorites.includes(gameId);
    if (isFavorite) {
      this.removeFromFavorites(gameId);
    } else {
      this.addToFavorites(gameId);
    }
    return !isFavorite;
  }

  addToRecentlyPlayed(gameId) {
    let recentGames = this.loadFromStorage(LOCAL_STORAGE_KEYS.RECENTLY_PLAYED, []);
    
    // Remove if already exists
    recentGames = recentGames.filter(id => id !== gameId);
    
    // Add to the beginning
    recentGames.unshift(gameId);
    
    // Limit to max recent games
    if (recentGames.length > CONFIG.MAX_RECENT_GAMES) {
      recentGames = recentGames.slice(0, CONFIG.MAX_RECENT_GAMES);
    }
    
    this.saveToStorage(LOCAL_STORAGE_KEYS.RECENTLY_PLAYED, recentGames);
  }

  clearRecentlyPlayed() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RECENTLY_PLAYED);
  }

  clearFavorites() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.FAVORITES);
    this.state.favorites = [];
  }

  getFilteredGames(category = 'all', searchQuery = '') {
    let filtered = this.state.games;
    
    if (category !== 'all') {
      filtered = filtered.filter(game => game.category === category);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }

  getFavoriteGames() {
    return this.state.games.filter(game => 
      this.state.favorites.includes(game.id)
    );
  }

  getRecentlyPlayedGames(limit = null) {
    const recentIds = this.loadFromStorage(LOCAL_STORAGE_KEYS.RECENTLY_PLAYED, []);
    const recentGames = recentIds
      .map(id => this.state.games.find(game => game.id === id))
      .filter(game => game); // Remove undefined games
    
    return limit ? recentGames.slice(0, limit) : recentGames;
  }

  // Settings management
  getSettings() {
    return this.loadFromStorage(LOCAL_STORAGE_KEYS.SETTINGS, {
      thumbnailSize: 'medium',
      darkmode: false,
      compact: false
    });
  }

  saveSettings(settings) {
    this.saveToStorage(LOCAL_STORAGE_KEYS.SETTINGS, settings);
  }

  updateCarouselIndex(direction = 'next') {
    const maxIndex = this.state.featuredGames.length - 1;
    
    if (direction === 'next') {
      this.state.carouselIndex = (this.state.carouselIndex + 1) % this.state.featuredGames.length;
    } else {
      this.state.carouselIndex = (this.state.carouselIndex - 1 + this.state.featuredGames.length) % this.state.featuredGames.length;
    }
  }

  getCurrentFeaturedGame() {
    return this.state.featuredGames[this.state.carouselIndex];
  }

  findGameById(gameId) {
    return this.state.games.find(game => game.id === gameId);
  }

  findGameIndex(gameId) {
    return this.state.games.findIndex(game => game.id === gameId);
  }
}

// Create and export singleton instance
export const stateManager = new StateManager();
