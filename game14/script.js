// Vanilla JS conversion of Interception.tsx (1:1 behavior, no React)

(function(){
  // Font Awesome Free icon class names mirroring the original set
  const ICONS = ['fa-coffee','fa-heart','fa-star','fa-phone','fa-car','fa-lock','fa-tag','fa-dinosaur'];
  const MAX_ICONS = 40;
  const COLORS = ['red', 'lime', 'deepskyblue', 'violet', 'gold', 'orange'];

  const state = {
    page: 'start', // 'start' | 'minigame' | 'guess' | 'result'
    selectedIcon: 0,
    count: 0,
    showLoading: false,
    prog: -1,
    remainingSeconds: -1,
    tempInput: '',
    win: false,
    spawnInterval: null,
    timerInterval: null,
    progressInterval: null,
  };

  const el = {
    view: document.getElementById('view'),
    app: document.getElementById('app')
  };

  // Utility
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function setPage(p){
    state.page = p;
    render();
  }

  function selectIcon(){
    state.selectedIcon = rnd(0, ICONS.length - 1);
  }

  function clearIntervals(){
    if (state.spawnInterval) { clearInterval(state.spawnInterval); state.spawnInterval = null; }
    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
    if (state.progressInterval) { clearInterval(state.progressInterval); state.progressInterval = null; }
  }

  function startProgress(){
    state.prog = 0;
    const bar = document.querySelector('.progressbar-inner');
    state.progressInterval = setInterval(() => {
      state.prog += 1;
      if (bar) bar.style.width = state.prog + '%';
      if (state.prog >= 100){
        clearInterval(state.progressInterval);
        state.progressInterval = null;
        setPage('minigame');
        startMinigame();
      }
    }, 75);
  }

  function startMinigame(){
    const container = document.querySelector('.interception-container');
    if (!container) return;
    state.count = 0;
    state.remainingSeconds = 60;

    // Timer
    state.timerInterval = setInterval(() => {
      state.remainingSeconds -= 1;
      const t = document.querySelector('.fw-timer .time');
      if (t) t.textContent = String(state.remainingSeconds);
      if (state.remainingSeconds <= 0){
        clearIntervals();
        setPage('guess');
      }
    }, 1000);

    // Spawner
    state.spawnInterval = setInterval(() => {
      const randomIndex = rnd(0, ICONS.length - 1);
      const iconClass = ICONS[randomIndex];
      if (randomIndex === state.selectedIcon){
        state.count += 1;
      }

      const iconId = Date.now() + '-' + Math.random().toString(36).slice(2);
      const margin = rnd(-240, 240);
      const color = COLORS[rnd(0, COLORS.length - 1)];
      const speed = rnd(2, 3); // seconds

      const node = document.createElement('div');
      node.className = 'falling-icon';
      node.style.left = `calc(50% + ${margin}px)`;
      node.style.animationDuration = `${speed}s`;
      node.style.color = color;
      node.dataset.id = iconId;
      const inner = document.createElement('i');
      inner.className = `fa-solid ${iconClass}`;
      node.appendChild(inner);
      container.appendChild(node);

      // Cleanup after animation
      setTimeout(() => {
        node.remove();
        // Cap icon count
        const children = container.children;
        if (children.length > MAX_ICONS){
          for (let i = 0; i < children.length - MAX_ICONS; i++){
            children[i].remove();
          }
        }
      }, speed * 1000);
    }, 150);
  }

  function handleGuessEnter(e){
    if (state.page !== 'guess') return;
    if (e.key === 'Enter'){
      const val = parseInt(state.tempInput, 10);
      state.win = (val === state.count);
      setPage('result');
    }
  }

  function render(){
    const currentIconClass = ICONS[state.selectedIcon];
    if (state.page === 'start'){
      el.view.innerHTML = `
        <div class="centered" style="text-align:center; width:100%">
          <div style="font-size:32px">Manual Authorization Required!</div>
          <div style="margin-top:30px; font-size:100px; color:green"><i class="fa-solid ${currentIconClass}"></i></div>
          ${state.showLoading ? `
            <div class="progressbar" style="margin-top:300px; margin-bottom:auto">
              <div class="progressbar-inner" style="width: ${Math.max(0, state.prog)}%"></div>
            </div>
          ` : `
            <div style="margin-top:300px;margin-bottom:auto;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">PRESS <span style="color:#00FF00">E</span> TO START MANUAL AUTHORIZATION</div>
          `}
        </div>
      `;
    }
    else if (state.page === 'minigame'){
      el.view.innerHTML = `
        <div class="firewall-container">
          <div class="fw-header">COUNT : <i class="fa-solid ${currentIconClass}"></i></div>
          <div class="fw-timer">Timer : <span class="time">${state.remainingSeconds}</span> seconds</div>
          <div class="interception-container"></div>
        </div>
      `;
    }
    else if (state.page === 'guess'){
      el.view.innerHTML = `
        <div class="centered">
          <div class="title">Guess the number : <i class="fa-solid ${currentIconClass}"></i></div>
          <input class="phrase-input" id="guessInput" type="text" placeholder="GUESS" value="${state.tempInput}">
        </div>
      `;
      const input = document.getElementById('guessInput');
      input.focus();
      input.addEventListener('input', (e) => { state.tempInput = e.target.value; });
      input.addEventListener('keypress', handleGuessEnter);
    }
    else if (state.page === 'result'){
      el.view.innerHTML = `
        <div class="centered">
          <div class="result">AUTHORIZATION ${state.win ? 'SUCCESSFUL' : 'FAILED'}</div>
          <div>ANSWER : ${state.count}</div>
        </div>
      `;
    }
  }

  // Wire header controls
  document.getElementById('closeBtn')?.addEventListener('click', () => {
    el.app.style.display = 'none';
  });
  document.getElementById('minBtn')?.addEventListener('click', () => {
    el.app.classList.toggle('minimized');
  });

  // Global key handling for start flow
  window.addEventListener('keydown', (e) => {
    if (state.page !== 'start') return;
    if (e.key === 'e' || e.key === 'E'){
      if (!state.showLoading){
        state.showLoading = true;
        render();
        selectIcon();
        startProgress();
      }
    }
  });

  // Init
  selectIcon();
  render();
})();

