
// Settings management module
export function applySettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  
  // Animations toggle
  if (settings.animations !== undefined) {
    document.getElementById('toggle-animations').checked = settings.animations;
    document.body.classList.toggle('no-animations', !settings.animations);
  }
  
  // Thumbnail size
  const thumbnailSize = document.getElementById('thumbnail-size');
  const gameList = document.getElementById('game-list');
  if (settings.thumbnailSize && thumbnailSize && gameList) {
    thumbnailSize.value = settings.thumbnailSize;
    gameList.setAttribute('data-size', settings.thumbnailSize);
  }
}

export function saveSettings() {
  const toggleAnimations = document.getElementById('toggle-animations');
  const thumbnailSize = document.getElementById('thumbnail-size');
  
  const settings = {
    animations: toggleAnimations.checked,
    thumbnailSize: thumbnailSize.value
  };
  
  localStorage.setItem('settings', JSON.stringify(settings));
  applySettings();
}

