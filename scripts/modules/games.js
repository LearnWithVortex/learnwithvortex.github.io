
// Games management module
let games = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let currentGameIndex = 0;
let currentCategory = 'all';

export async function loadGames() {
  try {
    const response = await fetch('/assets/lists/gl.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    games = await response.json();
    return games;
  } catch (error) {
    console.error('Error loading games:', error);
    return [];
  }
}

export function renderGames(gamesList, container = document.getElementById('game-list')) {
  if (!container) return;
  
  container.innerHTML = '';
  
  gamesList.forEach((game, index) => {
    const gameCard = createGameCard(game, index);
    container.appendChild(gameCard);
  });
}

export function toggleFavorite(gameId) {
  const index = favorites.indexOf(gameId);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(gameId);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  return favorites.includes(gameId);
}

function createGameCard(game, index) {
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
  
  setupGameCardListeners(gameCard, game, index);
  return gameCard;
}

function setupGameCardListeners(gameCard, game, index) {
  // Game click event with ripple effect
  gameCard.addEventListener('click', e => {
    if (!e.target.closest('.favorite-btn')) {
      addRippleEffect(e, gameCard);
      setTimeout(() => playGame(game, index), 300);
    }
  });
  
  // Favorite button click
  const favoriteBtn = gameCard.querySelector('.favorite-btn');
  favoriteBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isFavorite = toggleFavorite(game.id);
    updateFavoriteButton(favoriteBtn, isFavorite);
  });
}

function addRippleEffect(e, element) {
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 300);
}

