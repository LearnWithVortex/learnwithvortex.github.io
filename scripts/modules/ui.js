
// UI interactions module
export function updateClock() {
  const timeDisplay = document.getElementById('time');
  if (!timeDisplay) return;
  
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  timeDisplay.textContent = `${h}:${m} ${ampm}`;
}

export function setupUIListeners() {
  setupSettingsPanel();
  setupSearchInput();
  setupViewOptions();
}

function setupSettingsPanel() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettings = document.getElementById('close-settings');
  
  if (settingsBtn && settingsPanel && closeSettings) {
    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.add('active');
    });
    
    closeSettings.addEventListener('click', () => {
      settingsPanel.classList.remove('active');
    });
  }
}

function setupSearchInput() {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      // Search functionality will be implemented here
      console.log('Search input:', searchInput.value);
    });
  }
}

function setupViewOptions() {
  const viewBtns = document.querySelectorAll('.view-btn');
  const gameList = document.getElementById('game-list');
  
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (gameList) {
        const viewMode = btn.dataset.view;
        gameList.classList.toggle('list-view', viewMode === 'list');
      }
    });
  });
}

