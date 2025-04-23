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
const gamePopout = document.getElementById('popout-game');
const closeGame = document.getElementById('close-game');
const favoriteGame = document.getElementById('favorite-game');
const fullscreenGame = document.getElementById('fullscreen-game');
const clearHistory = document.getElementById('clear-history');
const resetFavorites = document.getElementById('reset-favorites');
const thumbnailSize = document.getElementById('thumbnail-size');
const carouselContainer = document.getElementById('featured-carousel');
const carouselDots = document.getElementById('carousel-dots');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
const navLinks = document.querySelectorAll('.nav-link');
const viewBtns = document.querySelectorAll('.view-btn');
const viewAllRecent = document.getElementById('view-all-recent');
const toggleDarkmode = document.getElementById('toggle-darkmode');
const toggleCompact = document.getElementById('toggle-compact');
const gamesCountSpan = document.getElementById('games-count');

// Game data
let games = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentGameIndex = 0;
let currentCategory = 'all';
let carouselIndex = 0;
let featuredGames = [];
let showAllRecent = false;
let currentView = 'all';

// Add new variable for carousel interval
let carouselInterval = null;
// Add a new variable to track if a popout window is already open
let activePopoutWindow = null;

// Initialize the application
function init() {
  // Simulate loading with a more dynamic animation
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 500);
  }, 1200);

  // Update time display
  updateClock();
  setInterval(updateClock, 1000);

  // Load games
  loadGames();

  // Set up event listeners
  setupEventListeners();

  // Apply settings
  applySettings();
  
  // Add page transition effect
  document.body.classList.add('page-loaded');

  // Set up carousel controls
  setupCarouselControls();
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
    const response = await fetch('/assets/lists/gl.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    games = data;

    // Extract featured games for carousel
    featuredGames = games.filter(game => game.featured);

    // Initialize the UI with smooth animations
    renderGames(games);
    renderRecentGames();
    setupCarousel();

    // Update games count
    updateGamesCount(games.length);
  } catch (error) {
    console.error('Error loading games:', error);
  }
}

// Helper function to update games count
function updateGamesCount(count) {
  if (gamesCountSpan) {
    gamesCountSpan.textContent = `(${count})`;
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Settings panel
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('active');
    applySettings();
  });
  
  closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });
  
  // Game overlay
  closeGame.addEventListener('click', () => {
    gameOverlay.classList.add('closing');
    setTimeout(() => {
      gameOverlay.classList.remove('active');
      gameOverlay.classList.remove('closing');
      gameFrame.src = '';
    }, 300);
  });
  
  favoriteGame.addEventListener('click', () => {
    const currentGame = games[currentGameIndex];
    toggleFavorite(currentGame.id);
    updateFavoriteButton(currentGame.id);
    
    // Add heart animation
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerHTML = '<i class="fa-solid fa-heart"></i>';
    document.body.appendChild(heart);
    
    setTimeout(() => {
      document.body.removeChild(heart);
    }, 1000);
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
    currentView = 'favorites';
    renderFavoriteGames();
  });
  
  // Recent games button
  recentBtn.addEventListener('click', () => {
    toggleActiveButton(recentBtn);
    currentView = 'all';
    renderGames(games);
  });
  
  // Category filters
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      // Skip if it's the Contact link
      if (link.getAttribute('href') === 'form.html') {
        return;
      }
      
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
  thumbnailSize.addEventListener('change', saveSettings);

  toggleDarkmode.addEventListener('change', () => {
    saveSettings();
  });
  
  toggleCompact.addEventListener('change', saveSettings);
  
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
  
  // Fullscreen game button
  fullscreenGame.addEventListener('click', () => {
    toggleFullscreen();
  });
  
  // View all recent games
  viewAllRecent.addEventListener('click', () => {
    showAllRecent = !showAllRecent;
    renderRecentGames();
    // Update the button text
    viewAllRecent.textContent = showAllRecent ? 'Show Less' : 'View All';
  });
}

// Toggle fullscreen mode for the game frame
function toggleFullscreen() {
  const gameContainer = document.querySelector('.game-container');
  
  if (!document.fullscreenElement) {
    if (gameFrame.requestFullscreen) {
      gameFrame.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (gameFrame.webkitRequestFullscreen) { /* Safari */
      gameFrame.webkitRequestFullscreen();
    } else if (gameFrame.msRequestFullscreen) { /* IE11 */
      gameFrame.msRequestFullscreen();
    }
    
    fullscreenGame.innerHTML = '<i class="fa-solid fa-compress"></i>';
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    
    fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';
  }
  
  // Add pulse animation
  fullscreenGame.classList.add('pulse-once');
  setTimeout(() => fullscreenGame.classList.remove('pulse-once'), 300);
}

// Apply saved settings
function applySettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');

  // Thumbnail size
  if (settings.thumbnailSize) {
    thumbnailSize.value = settings.thumbnailSize;
    document.querySelectorAll('.game-grid').forEach(grid => {
      grid.setAttribute('data-size', settings.thumbnailSize);
    });
  }
  // Darkmode
  if (settings.darkmode !== undefined) {
    toggleDarkmode.checked = !!settings.darkmode;
    document.body.classList.toggle('dark-mode', !!settings.darkmode);
  }
  // Compact View
  if (settings.compact !== undefined) {
    toggleCompact.checked = !!settings.compact;
    document.querySelectorAll('.game-grid').forEach(grid => {
      grid.classList.toggle('compact', !!settings.compact);
    });
  }
}

// Save settings to localStorage
function saveSettings() {
  const settings = {
    thumbnailSize: thumbnailSize.value,
    darkmode: toggleDarkmode.checked,
    compact: toggleCompact.checked,
  };
  localStorage.setItem('settings', JSON.stringify(settings));
  applySettings();
}

// Render all games in the game list with improved animation
function renderGames(gamesList) {
  updateGamesCount(gamesList.length);
  gameList.innerHTML = '';
  // Set data-size property for correct thumbnail
  gameList.setAttribute('data-size', thumbnailSize.value);
  
  gamesList.forEach((game, index) => {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';
    gameCard.style.animationDelay = `${index * 0.05}s`;
    
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
    
    // Game click event with ripple effect
    gameCard.addEventListener('click', e => {
      if (!e.target.closest('.favorite-btn')) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        const rect = gameCard.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        gameCard.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
          playGame(game, index);
        }, 300);
      }
    });
    
    // Favorite button click
    const favoriteBtn = gameCard.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(game.id);
      
      if (currentView !== 'favorites') {
        if (favorites.includes(game.id)) {
          favoriteBtn.classList.add('active');
          favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        } else {
          favoriteBtn.classList.remove('active');
          favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
      }
    });
    
    gameList.appendChild(gameCard);
  });
}

// Render recently played games, limited to 3 unless "View All" is clicked
function renderRecentGames() {
  recentlyPlayed.innerHTML = '';
  recentlyPlayed.setAttribute('data-size', thumbnailSize.value);
  const recentGames = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
  
  if (recentGames.length === 0) {
    recentlyPlayed.innerHTML = '<p class="empty-state">No recently played games</p>';
    viewAllRecent.style.display = 'none';
    return;
  }
  
  // Show the view all button only if there are more than 3 games
  viewAllRecent.style.display = recentGames.length > 3 ? 'block' : 'none';
  
  // Limit the number of games shown unless "View All" is clicked
  const gamesToShow = showAllRecent ? recentGames : recentGames.slice(0, 3);
  
  gamesToShow.forEach(gameId => {
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

// Play a game with improved transition
function playGame(game, index) {
  currentGameIndex = index;
  
  // Preload animation
  gameOverlay.classList.add('preload');
  setTimeout(() => {
    gameFrame.src = game.path;
    currentGameTitle.textContent = game.name;
    gameCategory.textContent = game.category;
    updateFavoriteButton(game.id);
    
    gameOverlay.classList.remove('preload');
    gameOverlay.classList.add('active');
    
    // Reset fullscreen button to default state
    fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';
    
    // Game rating animation
    const stars = document.querySelectorAll('.game-rating i');
    stars.forEach((star, i) => {
      setTimeout(() => {
        if (i < Math.floor(game.rating)) {
          star.className = 'fa-solid fa-star';
        } else if (i < game.rating) {
          star.className = 'fa-solid fa-star-half-stroke';
        } else {
          star.className = 'fa-regular fa-star';
        }
      }, i * 100);
    });
  }, 300);
  
  // Save to recently played
  saveRecentGame(game.id);
  renderRecentGames();
  
  // Set up the popup functionality to use the current game
  setupGamePopout(game);
}

// Improved function to set up game popout
function setupGamePopout(game) {
  // Remove any existing event listener to prevent duplicates
  const freshGamePopout = document.getElementById('popout-game');
  const newGamePopout = freshGamePopout.cloneNode(true);
  freshGamePopout.parentNode.replaceChild(newGamePopout, freshGamePopout);
  
  // Add event listener to the new button
  newGamePopout.addEventListener('click', () => {
    // Close any existing popout window first
    if (activePopoutWindow && !activePopoutWindow.closed) {
      try {
        activePopoutWindow.close();
      } catch (e) {
        console.log("Could not close previous popup:", e);
      }
    }
    
    let inFrame;
    try {
      inFrame = window !== top;
    } catch (e) {
      inFrame = true;
    }

    // Only run if not already in an iframe and not Firefox
    if (!navigator.userAgent.includes("Firefox")) {
      const popup = window.open("about:blank", "_blank");

      if (!popup || popup.closed) {
        console.log("Popup was blocked");
      } else {
        // Store reference to this window
        activePopoutWindow = popup;
        
        // Set title and favicon
        popup.document.title = `Google Docs`;
        const link = popup.document.createElement("link");
        link.rel = "icon";
        link.href = "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png";
        popup.document.head.appendChild(link);

        // Create and style iframe
        const iframe = popup.document.createElement("iframe");
        // Use the current game's path
        iframe.src = window.location.origin + game.path;
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
        
        // Track when the popup is closed
        popup.addEventListener('unload', () => {
          if (activePopoutWindow === popup) {
            activePopoutWindow = null;
          }
        });
        
        // Close the overlay
        gameOverlay.classList.add('closing');
        setTimeout(() => {
          gameOverlay.classList.remove('active');
          gameOverlay.classList.remove('closing');
          gameFrame.src = '';
        }, 300);
      }
    }
  });
}

// Update the toggleFavorite function to handle removal in favorites view
function toggleFavorite(gameId) {
  const index = favorites.indexOf(gameId);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(gameId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Re-render only if we're in favorites view
  if (currentView === 'favorites') {
    renderFavoriteGames();
  }
}

// Update favorites button click handler
favoritesBtn.addEventListener('click', () => {
  toggleActiveButton(favoritesBtn);
  currentView = 'favorites';
  renderFavoriteGames();
});

// Update recent button click handler
recentBtn.addEventListener('click', () => {
  toggleActiveButton(recentBtn);
  currentView = 'all';
  renderGames(games);
});

// Improved function to render favorite games
function renderFavoriteGames() {
  gameList.setAttribute('data-size', thumbnailSize.value);
  const favoriteGames = games.filter(game => favorites.includes(game.id));
  updateGamesCount(favoriteGames.length);
  renderGames(favoriteGames);
}

// Listen for fullscreen change event to update button icon
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenGame.innerHTML = '<i class="fa-solid fa-compress"></i>';
  } else {
    fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';
  }
});

// Update event listeners in setupCarousel to pause on interaction
function setupCarouselControls() {
  if (!carouselPrev || !carouselNext) {
    console.log("Carousel controls not found");
    return;
  }

  carouselPrev.addEventListener('click', () => {
    // Clear interval on manual navigation
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }
    
    if (!featuredGames || featuredGames.length === 0) {
      return;
    }
    
    carouselContainer.classList.add('transition-left');
    setTimeout(() => {
      // Use precise calculation to avoid skipping
      carouselIndex = (carouselIndex - 1 + featuredGames.length) % featuredGames.length;
      updateCarousel();
      carouselContainer.classList.remove('transition-left');
      startCarouselAutoRotation();
    }, 300);
  });

  carouselNext.addEventListener('click', () => {
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }
    
    if (!featuredGames || featuredGames.length === 0) {
      return;
    }
    
    carouselContainer.classList.add('transition-right');
    setTimeout(() => {
      // Use precise calculation to avoid skipping
      carouselIndex = (carouselIndex + 1) % featuredGames.length;
      updateCarousel();
      carouselContainer.classList.remove('transition-right');
      startCarouselAutoRotation();
    }, 300);
  });

  carouselContainer.addEventListener('mouseenter', () => {
    if (carouselInterval) {
      clearInterval(carouselInterval);
    }
  });

  carouselContainer.addEventListener('mouseleave', () => {
    startCarouselAutoRotation();
  });
}

// add this after thumbnailSize change to react to UI immediately
thumbnailSize.addEventListener('change', () => {
  saveSettings();
  // Also apply size to existing grids right away
  document.querySelectorAll('.game-grid').forEach(grid => {
    grid.setAttribute('data-size', thumbnailSize.value);
  });
});

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
