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
const gamePopout = document.getElementById('popout-game');
const closeGame = document.getElementById('close-game');
const favoriteGame = document.getElementById('favorite-game');
const fullscreenGame = document.getElementById('fullscreen-game');
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
const viewAllRecent = document.getElementById('view-all-recent');

// Game data
let games = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentGameIndex = 0;
let currentCategory = 'all';
let carouselIndex = 0;
let featuredGames = [];
let showAllRecent = false;

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

    // Add staggered animation to game cards
    setTimeout(() => {
      const gameCards = document.querySelectorAll('.game-card');
      gameCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('appear');
        }, index * 50);
      });
    }, 300);

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
  
  // Carousel controls with improved animation
  carouselPrev.addEventListener('click', () => {
    carouselContainer.classList.add('transition-left');
    setTimeout(() => {
      carouselIndex = (carouselIndex - 1 + featuredGames.length) % featuredGames.length;
      updateCarousel();
      carouselContainer.classList.remove('transition-left');
    }, 300);
  });
  
  carouselNext.addEventListener('click', () => {
    carouselContainer.classList.add('transition-right');
    setTimeout(() => {
      carouselIndex = (carouselIndex + 1) % featuredGames.length;
      updateCarousel();
      carouselContainer.classList.remove('transition-right');
    }, 300);
  });
  
  // Add page transition for navigation links
  document.querySelectorAll('a[href="form.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      
      document.body.classList.add('page-transition');
      
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    });
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

// Render all games in the game list with improved animation
function renderGames(gamesList) {
  gameList.innerHTML = '';
  
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

// Render recently played games, limited to 3 unless "View All" is clicked
function renderRecentGames() {
  recentlyPlayed.innerHTML = '';
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

    gamePopout.addEventListener('click', e => {
      const newTab = window.open('about:blank', '_blank');
      if (newTab) {
        newTab.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Vortex - Game Popout</title>
            <style>
              html, body, iframe {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                border: none;
              }
              iframe {
                display: block;
                height: 100%;
                width: 100%;
              }
            </style>
          </head>
          <body>
            <iframe src="${window.location.origin + game.path}" frameborder="0" allowfullscreen></iframe>
          </body>
          </html>
        `);
        newTab.document.close();
      } else {
        alert('Popup blocked! Please allow popups for this site.');
      }
    }
    }
    
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

// Toggle active state on action buttons with animation
function toggleActiveButton(button) {
  const allButtons = document.querySelectorAll('.action-btn');
  allButtons.forEach(btn => {
    if (btn === button) {
      btn.classList.add('active');
      btn.classList.add('pulse-once');
      setTimeout(() => btn.classList.remove('pulse-once'), 500);
    } else {
      btn.classList.remove('active');
    }
  });
}


function setupCarousel() {
  carouselContainer.innerHTML = '';
  carouselDots.innerHTML = '';

  featuredGames.forEach((game, index) => {
    const maxLength = 120;
    const fullDesc = game.discription || `Experience the excitement of ${game.name}. One of our most popular ${game.category} games!`;
    const isLong = fullDesc.length > maxLength;
    const shortDesc = fullDesc.slice(0, maxLength) + (isLong ? '...' : '');

    // Create carousel item
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item';

    const img = document.createElement('img');
    img.src = game.logo;
    img.alt = game.name;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'carousel-content';

    const title = document.createElement('h2');
    title.className = 'carousel-title';
    title.textContent = game.name;

    const desc = document.createElement('p');
    desc.className = 'carousel-desc';
    desc.textContent = shortDesc;
    desc.dataset.full = fullDesc;
    desc.dataset.short = shortDesc;

    const playBtn = document.createElement('button');
    playBtn.className = 'carousel-btn';
    playBtn.textContent = 'Play Now';

    // Add elements to content
    contentDiv.appendChild(title);
    contentDiv.appendChild(desc);

    // Add Show More/Less button if needed
    if (isLong) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'toggle-desc';
      toggleBtn.textContent = 'Show More';
      toggleBtn.addEventListener('click', () => {
        const expanded = toggleBtn.textContent === 'Show Less';
        desc.textContent = expanded ? desc.dataset.short : desc.dataset.full;
        toggleBtn.textContent = expanded ? 'Show More' : 'Show Less';
      });
      contentDiv.appendChild(toggleBtn);
    }

    contentDiv.appendChild(playBtn);

    // Add image and content to carousel item
    carouselItem.appendChild(img);
    carouselItem.appendChild(contentDiv);
    carouselContainer.appendChild(carouselItem);

    // Create dot with click listener
    const dot = document.createElement('div'); // using div for dot
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      carouselIndex = index;
      updateCarousel();
    });
    carouselDots.appendChild(dot);
  });
}


// Update the carousel position and active dot with improved animation
function updateCarousel() {
  carouselContainer.style.transform = `translateX(-${carouselIndex * 100}%)`;
  
  const dots = carouselDots.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    if (index === carouselIndex) {
      dot.classList.add('active');
      dot.classList.add('pulse-once');
      setTimeout(() => dot.classList.remove('pulse-once'), 500);
    } else {
      dot.classList.remove('active');
    }
  });
}

// Listen for fullscreen change event to update button icon
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenGame.innerHTML = '<i class="fa-solid fa-compress"></i>';
  } else {
    fullscreenGame.innerHTML = '<i class="fa-solid fa-expand"></i>';
  }
});

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
