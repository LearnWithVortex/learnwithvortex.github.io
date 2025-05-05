document.addEventListener('DOMContentLoaded', function() {
  // Utility functions
  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  }

  function updateTime() {
    document.getElementById('time').textContent = getFormattedTime();
  }

  // Local Storage functions
  function getFavorites() {
    return JSON.parse(localStorage.getItem('favoriteGames') || '[]');
  }

  function isFavorite(gameId) {
    const favorites = getFavorites();
    return favorites.includes(gameId);
  }

  function addToFavorites(gameId) {
    const favorites = getFavorites();
    if (!favorites.includes(gameId)) {
      favorites.push(gameId);
      localStorage.setItem('favoriteGames', JSON.stringify(favorites));
    }
  }

  function removeFromFavorites(gameId) {
    let favorites = getFavorites();
    favorites = favorites.filter(id => id !== gameId);
    localStorage.setItem('favoriteGames', JSON.stringify(favorites));
  }

  // Rating stars generator
  function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fa-solid fa-star"></i>';
    }

    if (hasHalfStar) {
      stars += '<i class="fa-solid fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="fa-regular fa-star"></i>';
    }

    return stars;
  }

  // Render game cards
  function renderGames(games, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.setAttribute('data-id', game.id);
      card.setAttribute('data-path', game.path);
      
      // Add category attribute for filtering
      if (game.category) {
        card.setAttribute('data-category', game.category);
      }
      
      card.innerHTML = `
        <div class="game-thumbnail">
          <img src="${game.image}" alt="${game.name}" loading="lazy">
          <div class="game-overlay-info">
            <div class="game-actions">
              <button class="play-btn"><i class="fa-solid fa-play"></i></button>
              <button class="favorite-btn" title="${isFavorite(game.id) ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="fa-${isFavorite(game.id) ? 'solid' : 'regular'} fa-heart"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="game-info">
          <h3>${game.name}</h3>
          <div class="game-meta">
            <span class="game-category">${game.category || 'Uncategorized'}</span>
            <div class="game-rating">
              ${getRatingStars(game.rating || 4)}
            </div>
          </div>
        </div>
      `;
      
      // Event listeners for play and favorite buttons
      const playBtn = card.querySelector('.play-btn');
      playBtn.addEventListener('click', () => {
        loadGame(game.path, game.name);
      });
      
      const favoriteBtn = card.querySelector('.favorite-btn');
      favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameId = card.getAttribute('data-id');
        
        if (isFavorite(gameId)) {
          removeFromFavorites(gameId);
          favoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
          favoriteBtn.setAttribute('title', 'Add to favorites');
          
          // If in favorites view, remove the card with animation
          if (document.querySelector('#favorites-btn.active')) {
            card.style.opacity = '0';
            setTimeout(() => {
              card.remove();
            }, 300);
          }
        } else {
          addToFavorites(gameId);
          favoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
          favoriteBtn.setAttribute('title', 'Remove from favorites');
        }
      });
      
      container.appendChild(card);
    });
    
    // Update game count
    if (containerId === 'game-list') {
      document.getElementById('games-count').textContent = `(${games.length})`;
    }
  }

  // Load game function
  function loadGame(gamePath, gameTitle) {
    document.getElementById('game-frame').src = gamePath;
    document.getElementById('current-game-title').textContent = gameTitle;
    document.getElementById('game-overlay').classList.add('active');
  }

  // Close game function
  document.getElementById('close-game').addEventListener('click', () => {
    document.getElementById('game-overlay').classList.remove('active');
    document.getElementById('game-frame').src = '';
  });

  // Fullscreen game function
  document.getElementById('fullscreen-game').addEventListener('click', () => {
    const frame = document.getElementById('game-frame');
    if (frame.requestFullscreen) {
      frame.requestFullscreen();
    } else if (frame.mozRequestFullScreen) { /* Firefox */
      frame.mozRequestFullScreen();
    } else if (frame.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      frame.webkitRequestFullscreen();
    } else if (frame.msRequestFullscreen) { /* IE/Edge */
      frame.msRequestFullscreen();
    }
  });

  // Popout game function
    document.getElementById('popout-game').addEventListener('click', () => {
        const gameFrame = document.getElementById('game-frame');
        const gameURL = gameFrame.src;

        if (gameURL) {
            window.open(gameURL, '_blank', 'width=800,height=600');
        } else {
            alert('No game loaded in the frame.');
        }
    });

  // Load games from JSON
  async function loadGames() {
    try {
      const response = await fetch('assets/lists/gl.json');
      if (!response.ok) {
        throw new Error('Failed to load games data');
      }
      const games = await response.json();
      renderGames(games, 'game-list');
      document.getElementById('games-count').textContent = `(${games.length})`;
    } catch (error) {
      console.error('Error loading games:', error);
      document.getElementById('game-list').innerHTML = '<p>Failed to load games.</p>';
    }
  }

  // Load recent games from local storage
  function loadRecentGames() {
    const recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    if (recentGames.length === 0) {
      document.getElementById('recently-played').innerHTML = '<p>No recent games.</p>';
      return;
    }

    // Fetch all games to find the recent ones
    fetch('assets/lists/gl.json')
      .then(response => response.json())
      .then(allGames => {
        const recentGamesData = [];
        recentGames.forEach(gameId => {
          const game = allGames.find(g => g.id === gameId);
          if (game) {
            recentGamesData.push(game);
          }
        });

        renderGames(recentGamesData, 'recently-played');
      })
      .catch(error => {
        console.error('Error loading games:', error);
        document.getElementById('recently-played').innerHTML = '<p>Failed to load recent games.</p>';
      });
  }

  // Add game to recent games
  function addRecentGame(gameId) {
    let recentGames = JSON.parse(localStorage.getItem('recentGames') || '[]');
    if (!recentGames.includes(gameId)) {
      recentGames.unshift(gameId);
      recentGames = recentGames.slice(0, 6); // Limit to 6 recent games
      localStorage.setItem('recentGames', JSON.stringify(recentGames));
    }
  }

  // Load favorite games
  function loadFavoriteGames() {
    const favoriteGames = getFavorites();
    if (favoriteGames.length === 0) {
      document.getElementById('game-list').innerHTML = '<p>No favorite games.</p>';
      return;
    }

    fetch('assets/lists/gl.json')
      .then(response => response.json())
      .then(allGames => {
        const favoriteGamesData = [];
        favoriteGames.forEach(gameId => {
          const game = allGames.find(g => g.id === gameId);
          if (game) {
            favoriteGamesData.push(game);
          }
        });

        renderGames(favoriteGamesData, 'game-list');
        document.getElementById('games-count').textContent = `(${favoriteGamesData.length})`;
      })
      .catch(error => {
        console.error('Error loading games:', error);
        document.getElementById('game-list').innerHTML = '<p>Failed to load favorite games.</p>';
      });
  }

  // Settings panel functions
  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('active');
  });

  document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.remove('active');
  });

  // Toggle dark mode
  const toggleDarkMode = document.getElementById('toggle-darkmode');
  toggleDarkMode.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
  });

    // View all recent games
    document.getElementById('view-all-recent').addEventListener('click', () => {
        loadGames();
        document.getElementById('recent-btn').classList.remove('active');
        document.getElementById('favorites-btn').classList.remove('active');
    });

  // Action buttons
  document.getElementById('recent-btn').addEventListener('click', () => {
    loadRecentGames();
    document.getElementById('recent-btn').classList.add('active');
    document.getElementById('all-games-section').style.display = 'block';
    document.getElementById('favorites-btn').classList.remove('active');
    document.getElementById('game-list').classList.remove('list-view');
    document.querySelector('.view-btn[data-view="grid"]').classList.add('active');
    document.querySelector('.view-btn[data-view="list"]').classList.remove('active');
  });

  document.getElementById('favorites-btn').addEventListener('click', () => {
    loadFavoriteGames();
    document.getElementById('favorites-btn').classList.add('active');
    document.getElementById('recent-btn').classList.remove('active');
    document.getElementById('all-games-section').style.display = 'block';
    document.getElementById('game-list').classList.remove('list-view');
        document.querySelector('.view-btn[data-view="grid"]').classList.add('active');
        document.querySelector('.view-btn[data-view="list"]').classList.remove('active');
  });

  document.getElementById('random-btn').addEventListener('click', () => {
    fetch('assets/lists/gl.json')
      .then(response => response.json())
      .then(games => {
        const randomIndex = Math.floor(Math.random() * games.length);
        const randomGame = games[randomIndex];
        loadGame(randomGame.path, randomGame.name);
      })
      .catch(error => console.error('Error loading games:', error));
  });

  // Game view options
  document.querySelectorAll('.view-options .view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.view-options .view-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const view = e.target.dataset.view;
      if (view === 'list') {
        document.getElementById('game-list').classList.add('list-view');
      } else {
        document.getElementById('game-list').classList.remove('list-view');
      }
    });
  });

  // Initial setup
  updateTime();
  setInterval(updateTime, 60000);
  loadGames();
});
