
// Carousel functionality module
let carouselIndex = 0;
let featuredGames = [];

export function setupCarousel(games) {
  const container = document.getElementById('featured-carousel');
  const dots = document.getElementById('carousel-dots');
  if (!container || !dots) return;

  featuredGames = games.filter(game => game.featured);
  
  container.innerHTML = '';
  dots.innerHTML = '';

  featuredGames.forEach((game, index) => {
    createCarouselItem(game, container);
    createCarouselDot(index, dots);
  });
}

export function updateCarousel() {
  const container = document.getElementById('featured-carousel');
  if (!container) return;
  
  container.style.transform = `translateX(-${carouselIndex * 100}%)`;
  
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    if (index === carouselIndex) {
      dot.classList.add('active', 'pulse-once');
      setTimeout(() => dot.classList.remove('pulse-once'), 500);
    } else {
      dot.classList.remove('active');
    }
  });
}

function createCarouselItem(game, container) {
  const maxLength = 120;
  const fullDesc = game.discription || `Experience the excitement of ${game.name}. One of our most popular ${game.category} games!`;
  const isLong = fullDesc.length > maxLength;
  const shortDesc = fullDesc.slice(0, maxLength) + (isLong ? '...' : '');

  const item = document.createElement('div');
  item.className = 'carousel-item';
  item.innerHTML = `
    <img src="${game.logo}" alt="${game.name}">
    <div class="carousel-content">
      <h2 class="carousel-title">${game.name}</h2>
      <p class="carousel-desc" data-full="${fullDesc}" data-short="${shortDesc}">${shortDesc}</p>
      ${isLong ? '<button class="toggle-desc">Show More</button>' : ''}
      <button class="carousel-btn">Play Now</button>
    </div>
  `;

  if (isLong) {
    setupDescriptionToggle(item);
  }

  container.appendChild(item);
}

function createCarouselDot(index, dotsContainer) {
  const dot = document.createElement('div');
  dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
  dot.addEventListener('click', () => {
    carouselIndex = index;
    updateCarousel();
  });
  dotsContainer.appendChild(dot);
}

function setupDescriptionToggle(item) {
  const toggleBtn = item.querySelector('.toggle-desc');
  const desc = item.querySelector('.carousel-desc');
  
  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.textContent === 'Show Less';
    desc.textContent = expanded ? desc.dataset.short : desc.dataset.full;
    toggleBtn.textContent = expanded ? 'Show More' : 'Show Less';
  });
}

