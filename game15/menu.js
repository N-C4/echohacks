// Menu to launch each minigame using the default settings from client.lua
(function(){
  const defaults = {
    path: { gridSize: 19, lives: 3, timeLimit: 10000 },
    spot: { gridSize: 6, timeLimit: 8000, charSet: 'alphabet', required: 10 },
    math: { timeLimit: 300000 },
  };

  function rnd(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

  function scenarioSettings(btn){
    const scenario = btn.getAttribute('data-scenario');
    if (!scenario) return null;
    if (scenario === 'containers'){
      const level = parseInt(btn.getAttribute('data-level') || '1', 10);
      return { game: 'path', settings: {
        gridSize: 10 * level,
        lives: Math.ceil(4 - level),
        timeLimit: 5000 + (level - 1) * 3000,
      }};
    }
    if (scenario === 'crypto-heist'){
      return { game: 'path', settings: {
        gridSize: rnd(25, 45),
        lives: rnd(4, 5),
        timeLimit: rnd(14000, 16000),
      }};
    }
    if (scenario === 'server-room'){
      return { game: 'spot', settings: {
        gridSize: 8,
        timeLimit: 8000,
        charSet: 'alphabet',
        required: rnd(10, 16),
      }};
    }
    return null;
  }

  function showMenu(){
    const m = document.getElementById('menu');
    if (m) m.style.display = 'block';
  }
  function hideMenu(){
    const m = document.getElementById('menu');
    if (m) m.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-btn');
    if (!btn) return;
    const game = btn.getAttribute('data-game');
    const scenario = scenarioSettings(btn);
    hideMenu();
    // startGame is defined in js/main.js from echo_minigames_1
    if (typeof startGame === 'function') {
      if (scenario){
        startGame(scenario.game, scenario.settings);
      } else if (game) {
        startGame(game, defaults[game]);
      }
    }
  });

  // When a game finishes and the end screen hides, show the menu again
  const observer = new MutationObserver(() => {
    const screen = document.getElementById('screen');
    const screenVisible = screen && screen.style.display !== 'none';
    const containersHidden =
      (document.getElementById('path-container')?.style.display === 'none' || !document.getElementById('path-container')) &&
      (document.getElementById('spot-container')?.style.display === 'none' || !document.getElementById('spot-container')) &&
      (document.getElementById('math-container')?.style.display === 'none' || !document.getElementById('math-container'));
    if (!screenVisible && containersHidden) {
      showMenu();
    }
  });
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });

  // Initial
  showMenu();
})();
