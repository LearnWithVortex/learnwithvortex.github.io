
// DOM Elements
const loadingScreen = document.querySelector('.loading-screen');
const timeDisplay = document.getElementById('time');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettings = document.getElementById('close-settings');
const randomBtn = document.getElementById('random-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const recentBtn = document.getElementById('recent-btn');
const searchInput = document.getElementById('search');
const gameList = document.getElementById('game-list');
const recentlyPlayed = document.getElementById('recently-played');
const gameOverlay = document.getElementById('game-overlay');
const gameFrame = document.getElementById('game-frame');
const currentGameTitle = document.getElementById('current-game-title');
const gameCategory = document.getElementById('game-category');
const closeGame = document.getElementById('close-game');
const fullscreenGame = document.getElementById('fullscreen-game');
const favoriteGame = document.getElementById('favorite-game');
const clearHistory = document.getElementById('clear-history');
const resetFavorites = document.getElementById('reset-favorites');
const toggleAnimations = document.getElementById('toggle-animations');
const thumbnailSize = document.getElementById('thumbnail-size');
const carouselContainer = document.getElementById('featured-carousel');
const carouselDots = document.getElementById('carousel-dots');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
const navLinks = document.querySelectorAll('.nav-link');
const viewBtns = document.querySelectorAll('.view-btn');

// Game data
let games = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentGameIndex = 0;
let currentCategory = 'all';
let carouselIndex = 0;
let featuredGames = [];

// Initialize the application
function init() {
  // Simulate loading
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 1500);

  // Update time display
  updateClock();
  setInterval(updateClock, 1000);

  // Load games
  loadGames();

  // Set up event listeners
  setupEventListeners();

  // Apply settings
  applySettings();
}

// Update the clock display
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  timeDisplay.textContent = `${h}:${m} ${ampm}`;
}

// Load games from JSON file
async function loadGames() {
  try {
    // This is a placeholder for the games data
    // In a real application, you would fetch this from a server
    games = [
      { id: 1, name: "Space Invaders", category: "arcade", path: "games/space-invaders.html", logo: "assets/images/games/space-invaders.jpg", featured: true, rating: 4.5 },
      { id: 2, name: "Pac-Man", category: "arcade", path: "games/pacman.html", logo: "assets/images/games/pacman.jpg", featured: true, rating: 4.8 },
      { id: 3, name: "Tetris", category: "puzzle", path: "games/tetris.html", logo: "assets/images/games/tetris.jpg", featured: false, rating: 4.7 },
      { id: 4, name: "Snake", category: "arcade", path: "games/snake.html", logo: "assets/images/games/snake.jpg", featured: false, rating: 4.2 },
      { id: 5, name: "Chess", category: "strategy", path: "games/chess.html", logo: "assets/images/games/chess.jpg", featured: true, rating: 4.6 },
      { id: 6, name: "Sudoku", category: "puzzle", path: "games/sudoku.html", logo: "assets/images/games/sudoku.jpg", featured: false, rating: 4.4 },
      { id: 7, name: "2048", category: "puzzle", path: "games/2048.html", logo: "assets/images/games/2048.jpg", featured: false, rating: 4.3 },
      { id: 8, name: "Racing", category: "action", path: "games/racing.html", logo: "assets/images/games/racing.jpg", featured: true, rating: 4.1 },
      { id: 9, name: "Platformer", category: "action", path: "games/platformer.html", logo: "assets/images/games/platformer.jpg", featured: false, rating: 4.0 },
      { id: 10, name: "Tower Defense", category: "strategy", path: "games/tower-defense.html", logo: "assets/images/games/tower-defense.jpg", featured: true, rating: 4.5 },
      { id: 11, name: "Minesweeper", category: "puzzle", path: "games/minesweeper.html", logo: "assets/images/games/minesweeper.jpg", featured: false, rating: 4.2 },
      { id: 12, name: "Breakout", category: "arcade", path: "games/breakout.html", logo: "assets/images/games/breakout.jpg", featured: false, rating: 4.0 }
    ];

    // Extract featured games for carousel
    featuredGames = games.filter(game => game.featured);
    
    // Initialize the UI
    renderGames(games);
    renderRecentGames();
    setupCarousel();
    
  } catch (error) {
    console.error('Error loading games:', error);
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Settings panel
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('active');
  });
  
  closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });
  
  // Game overlay
  closeGame.addEventListener('click', () => {
    gameOverlay.classList.remove('active');
    gameFrame.src = '';
  });
  
  fullscreenGame.addEventListener('click', () => {
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen();
    }
  });
  
  favoriteGame.addEventListener('click', () => {
    const currentGame = games[currentGameIndex];
    toggleFavorite(currentGame.id);
    updateFavoriteButton(currentGame.id);
  });
  
  // Search
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredGames = games.filter(game => {
      return game.name.toLowerCase().includes(query) && 
             (currentCategory === 'all' || game.category === currentCategory);
    });
    renderGames(filteredGames);
  });
  
  // Random game button
  randomBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * games.length);
    playGame(games[randomIndex]);
  });
  
  // Favorites button
  favoritesBtn.addEventListener('click', () => {
    toggleActiveButton(favoritesBtn);
    const favoriteGames = games.filter(game => favorites.includes(game.id));
    renderGames(favoriteGames);
  });
  
  // Recent games button
  recentBtn.addEventListener('click', () => {
    toggleActiveButton(recentBtn);
    renderGames(games);
  });
  
  // Category filters
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      currentCategory = link.dataset.section;
      
      if (currentCategory === 'all') {
        renderGames(games);
      } else {
        const filteredGames = games.filter(game => game.category === currentCategory);
        renderGames(filteredGames);
      }
    });
  });
  
  // View options (grid/list)
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const viewMode = btn.dataset.view;
      if (viewMode === 'list') {
        gameList.classList.add('list-view');
      } else {
        gameList.classList.remove('list-view');
      }
    });
  });
  
  // Settings
  toggleAnimations.addEventListener('change', saveSettings);
  thumbnailSize.addEventListener('change', saveSettings);
  
  // Clear history and favorites
  clearHistory.addEventListener('click', () => {
    localStorage.removeItem('recentlyPlayed');
    renderRecentGames();
  });
  
  resetFavorites.addEventListener('click', () => {
    localStorage.removeItem('favorites');
    favorites = [];
    renderGames(games);
  });
  
  // Carousel controls
  carouselPrev.addEventListener('click', () => {
    carouselIndex = (carouselIndex - 1 + featuredGames.length) % featuredGames.length;
    updateCarousel();
  });
  
  carouselNext.addEventListener('click', () => {
    carouselIndex = (carouselIndex + 1) % featuredGames.length;
    updateCarousel();
  });
}

// Apply saved settings
function applySettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  
  // Animations toggle
  if (settings.animations !== undefined) {
    toggleAnimations.checked = settings.animations;
    document.body.classList.toggle('no-animations', !settings.animations);
  }
  
  // Thumbnail size
  if (settings.thumbnailSize) {
    thumbnailSize.value = settings.thumbnailSize;
    gameList.setAttribute('data-size', settings.thumbnailSize);
  }
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
    animations: toggleAnimations.checked,
    thumbnailSize: thumbnailSize.value
  };
  
  localStorage.setItem('settings', JSON.stringify(settings));
  applySettings();
}

// Render all games in the game list
function renderGames(gamesList) {
  gameList.innerHTML = '';
  
  gamesList.forEach((game, index) => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    const isFavorite = favorites.includes(game.id);
    
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
    
    // Game click event
    gameCard.addEventListener('click', e => {
      if (!e.target.closest('.favorite-btn')) {
        playGame(game, index);
      }
    });
    
    // Favorite button click
    const favoriteBtn = gameCard.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(game.id);
      
      if (favorites.includes(game.id)) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });
    
    gameList.appendChild(gameCard);
  });
}

// Render recently played games
function renderRecentGames() {
  recentlyPlayed.innerHTML = '';
  const recentGames = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
  
  if (recentGames.length === 0) {
    recentlyPlayed.innerHTML = '<p class="empty-state">No recently played games</p>';
    return;
  }
  
  recentGames.forEach(gameId => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;
    
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    
    const isFavorite = favorites.includes(game.id);
    
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
    
    // Game click event
    gameCard.addEventListener('click', e => {
      if (!e.target.closest('.favorite-btn')) {
        const index = games.findIndex(g => g.id === game.id);
        playGame(game, index);
      }
    });
    
    // Favorite button click
    const favoriteBtn = gameCard.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(game.id);
      
      if (favorites.includes(game.id)) {
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    });
    
    recentlyPlayed.appendChild(gameCard);
  });
}

// Play a game
function playGame(game, index) {
  currentGameIndex = index;
  gameFrame.src = game.path;
  currentGameTitle.textContent = game.name;
  gameCategory.textContent = game.category;
  updateFavoriteButton(game.id);
  gameOverlay.classList.add('active');
  
  // Save to recently played
  saveRecentGame(game.id);
  renderRecentGames();
}

// Toggle a game as favorite
function toggleFavorite(gameId) {
  const index = favorites.indexOf(gameId);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(gameId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Update the favorite button in the game overlay
function updateFavoriteButton(gameId) {
  const isFavorite = favorites.includes(gameId);
  favoriteGame.innerHTML = `<i class="fa-${isFavorite ? 'solid' : 'regular'} fa-heart"></i>`;
}

// Save a game to recently played
function saveRecentGame(gameId) {
  let recentGames = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
  
  // Remove if already exists
  recentGames = recentGames.filter(id => id !== gameId);
  
  // Add to the beginning
  recentGames.unshift(gameId);
  
  // Limit to 10 recent games
  if (recentGames.length > 10) {
    recentGames = recentGames.slice(0, 10);
  }
  
  localStorage.setItem('recentlyPlayed', JSON.stringify(recentGames));
}

// Toggle active state on action buttons
function toggleActiveButton(button) {
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  button.classList.add('active');
}

// Set up the featured games carousel
function setupCarousel() {
  carouselContainer.innerHTML = '';
  carouselDots.innerHTML = '';
  
  featuredGames.forEach((game, index) => {
    // Create carousel item
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item';
    carouselItem.innerHTML = `
      <img src="${game.logo}" alt="${game.name}">
      <div class="carousel-content">
        <h2 class="carousel-title">${game.name}</h2>
        <p class="carousel-desc">Experience the excitement of ${game.name}. One of our most popular ${game.category} games!</p>
        <button class="carousel-btn">Play Now</button>
      </div>
    `;
    
    // Play button event
    const playBtn = carouselItem.querySelector('.carousel-btn');
    playBtn.addEventListener('click', () => {
      const gameIndex = games.findIndex(g => g.id === game.id);
      playGame(game, gameIndex);
    });
    
    carouselContainer.appendChild(carouselItem);
    
    // Create carousel dot
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      carouselIndex = index;
      updateCarousel();
    });
    carouselDots.appendChild(dot);
  });
  
  // Start carousel auto-rotation
  setInterval(() => {
    carouselIndex = (carouselIndex + 1) % featuredGames.length;
    updateCarousel();
  }, 5000);
  
  updateCarousel();
}

// Update the carousel position and active dot
function updateCarousel() {
  carouselContainer.style.transform = `translateX(-${carouselIndex * 100}%)`;
  
  const dots = carouselDots.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    if (index === carouselIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
