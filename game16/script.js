// Boosting Hack (SecBypass) - Vanilla JS port of test/source/SecBypass/SecBypass.tsx
(function(){
  const state = {
    page: 'spinner', // spinner | loading | hack
    canHack: true,
    loaded: false,
    allowStart: false,
    security: 100,
    originalTimer: 30000,
    timer: 30000,
    updateInterval: { min: 3000, max: 5000 },
    refreshRate: 0,
    lastUpdated: 0,
    maxChances: 5,
    chances: 5,
    error: false,
    targetNumbers: [],
    currentTarget: 0,
    currentRow: 1,
    currentColumn: 1,
    grid: [],
  };

  const el = { view: document.getElementById('view'), app: document.getElementById('app') };

  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function twoDigits(n){ return n < 10 ? `0${n}` : `${n}`; }
  function generateTargetNumbers(){
    const arr = [];
    while(arr.length < 6){
      const n = twoDigits(rnd(1,99));
      if(!arr.includes(n)) arr.push(n);
    }
    return arr;
  }

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()* (i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

  function generateGrid(targets){
    const gridRows = 6, rowLength = 17, total = gridRows * rowLength;
    const positions = Array.from({length: total}, (_,i)=>({ row: Math.floor(i/rowLength), col: i%rowLength }));
    const shuffled = shuffle(positions.slice());
    const map = new Map(shuffled.slice(0, targets.length).map((pos,idx)=>[`${pos.row}-${pos.col}`, targets[idx]]));
    const grid = Array.from({length: gridRows}, (_,r)=>
      Array.from({length: rowLength}, (_,c)=>{
        const t = map.get(`${r}-${c}`);
        if (t) return t;
        let pick;
        do { pick = twoDigits(rnd(1,99)); } while(targets.includes(pick));
        return pick;
      })
    );
    return grid;
  }

  function getCurrentValue(){ return state.grid[state.currentRow-1]?.[state.currentColumn-1]; }
  function timePercent(){ return (state.timer / state.originalTimer) * 100; }

  function setPage(p){ state.page = p; render(); }

  // Simulated NUI
  function updateSecurity(win){
    // decrease security on both success or fail; more on fail
    let newSec = state.security - (win ? rnd(20,35) : rnd(10,20));
    if (newSec < 0) newSec = 0; if (newSec > 100) newSec = 100;
    state.security = newSec; return Promise.resolve(newSec);
  }

  function scheduleGridRefresh(){
    state.refreshRate = Math.random() * (state.updateInterval.max - state.updateInterval.min) + state.updateInterval.min;
    state.lastUpdated = performance.now();
    setTimeout(()=>{
      if (state.page !== 'hack') return;
      state.refreshRate = Math.random() * (state.updateInterval.max - state.updateInterval.min) + state.updateInterval.min;
      state.grid = generateGrid(state.targetNumbers);
      state.lastUpdated = performance.now();
      scheduleGridRefresh();
    }, state.refreshRate);
  }

  function startHack(){
    state.targetNumbers = generateTargetNumbers();
    state.grid = generateGrid(state.targetNumbers);
    state.currentTarget = 0;
    state.timer = state.originalTimer;
    state.currentRow = 1; state.currentColumn = 1;
    state.chances = state.maxChances;
    setPage('hack');
    // Timer rAF
    let startTime = null, shouldUpdate = true;
    function tick(ts){
      if (!shouldUpdate) return;
      if (startTime === null) startTime = ts;
      const remaining = state.originalTimer - (ts - startTime);
      state.timer = remaining <= 0 ? 0 : remaining;
      if (remaining > 0 && state.page === 'hack'){
        requestAnimationFrame(tick);
      } else if (state.page === 'hack') {
        state.error = true; setPage('loading');
      }
    }
    requestAnimationFrame(tick);
    scheduleGridRefresh();
  }

  function render(){
    if (state.page === 'spinner'){
      el.view.innerHTML = `<div class="spinnerContainer"><i class="fa-solid fa-spinner fa-6x" style="color:grey; animation: spin 1s linear infinite;"></i></div>`;
      // Immediately transition to loading (simulating fetchNui hackStatus)
      setTimeout(()=>{
        state.canHack = true;
        state.loaded = false; state.allowStart = false; state.error = false;
        setPage('loading');
      }, 500);
      return;
    }

    if (state.page === 'loading'){
      const showStart = (state.allowStart && state.security > 0 && state.canHack);
      el.view.innerHTML = `
        <div class="loadingTextContainer">
          ${!state.loaded ? `
            <span>INITIALIZING SYSTEM SETUP...</span>
            <span>SUCCESSFULLY INITIALIZED...</span>
            <span>SECURITY ECU MODEL:<span style="color:#80ABFF; padding-left:24px">${state.canHack ? 'ANGEE' : 'UNKNOWN'}</span></span>
            ${state.canHack ? `<span style="opacity:.45">--------------------------------------------------------------------------------------------------------------------------------------</span>` : ''}
            ${state.canHack ? `<span>SECURITY PROTOCOL INTEGRITY  <span style="color:#00FF00">${state.security}%</span></span>` : ''}
          ` : `
            <span>INITIALIZING SYSTEM SETUP..</span>
            <span>SUCCESSFULLY INITIALIZED...</span>
            <span>SECURITY ECU MODEL:<span style="color:#80ABFF; padding-left:24px">${state.canHack ? 'ANGEE' : 'UNKNOWN'}</span></span>
            ${state.canHack ? `<span style="opacity:.45">--------------------------------------------------------------------------------------------------------------------------------------</span>` : ''}
            ${state.canHack ? `<span>SECURITY PROTOCOL INTEGRITY  <span style="color:#00FF00">${state.security}%</span></span>` : ''}
            ${(state.security !== 100 || state.error) ? `<span>SECURITY PROTOCOL  <span style="color:${state.error ? '#EE1041':'#00FF00'}">${state.error ? 'BYPASS FAILED' : state.security <= 0 ? 'DISABLED' : 'BYPASSED'}</span></span>` : ''}
          `}
          ${showStart ? `<span style="margin-top:auto; align-self:center; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">PRESS <span style="color:#00FF00">E</span> TO ACCESS SECURITY PROTOCOL</span>` : ''}
          ${(state.security === 0 && state.allowStart) ? `<span style="margin-top:auto; align-self:center; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">LOSE THE COPS</span>` : ''}
        </div>`;

      // Simulate finishing "typewriter" and enabling start
      if (!state.loaded){
        setTimeout(()=>{ state.loaded = true; state.allowStart = state.canHack; render(); }, 800);
      }
      return;
    }

    if (state.page === 'hack'){
      const targetHtml = state.targetNumbers.map((t,idx)=>{
        const chancePct = (idx === state.currentTarget) ? (state.chances / state.maxChances) : 1;
        const color = idx < state.currentTarget ? '#00FF00' : (chancePct < 0.3 ? '#EE1041' : (chancePct < 0.6 ? '#EEA210' : '#505256'));
        return `<span style="color:${color}">${idx===0?'':'.'}${t}</span>`;
      }).join('');

      const timerHtml = Array.from({length:70},(_,i)=>{
        const pct = timePercent(); const idxPct = (i/70)*100;
        const col = idxPct <= pct ? (state.timer <= 7500 ? '#EE1041' : '#00FF00') : 'white';
        return `<span style="color:${col}; transition: color .2s ease">/</span>`;
      }).join('');

      let gridRows = '';
      for(let r=0;r<6;r++){
        let rowHtml='';
        for(let c=0;c<17;c++){
          const active = (r+1===state.currentRow && c+1===state.currentColumn) ? ' active' : '';
          rowHtml += `<span class="cell${active}">${state.grid[r][c]}</span>`;
        }
        gridRows += `<div class="row">${rowHtml}</div>`;
      }

      el.view.innerHTML = `
        <div class="hackContainer">
          <div class="targetList">${targetHtml}</div>
          <div class="timer">${timerHtml}</div>
          <div class="numberGrid">${gridRows}</div>
          <div class="controls"><span style="color:#00FF00">W S A D</span> TO NAVIGATE <span style="color:#00FF00">ENTER</span> TO CONFIRM</div>
        </div>`;
      return;
    }
  }

  // Key handling
  window.addEventListener('keydown', (e)=>{
    if (state.page === 'loading' && (e.key==='e' || e.key==='E')){
      if (state.allowStart && state.security>0 && state.canHack){ startHack(); }
      return;
    }
    if (state.page !== 'hack') return;
    if (e.key==='w' || e.key==='W'){ state.currentRow = (state.currentRow===1?6:state.currentRow-1); render(); }
    else if (e.key==='s' || e.key==='S'){ state.currentRow = (state.currentRow===6?1:state.currentRow+1); render(); }
    else if (e.key==='a' || e.key==='A'){ state.currentColumn = (state.currentColumn===1?17:state.currentColumn-1); render(); }
    else if (e.key==='d' || e.key==='D'){ state.currentColumn = (state.currentColumn===17?1:state.currentColumn+1); render(); }
    else if (e.key==='Enter'){
      const val = getCurrentValue();
      if (val === state.targetNumbers[state.currentTarget]){
        state.currentTarget += 1; state.chances = state.maxChances;
        if (state.currentTarget === 6){
          updateSecurity(true).then(()=>{ state.error=false; state.loaded=false; state.allowStart=false; setPage('loading'); });
        } else { render(); }
      } else {
        state.chances -= 1; const isError = state.chances === 0; state.error = isError;
        if (isError){ updateSecurity(false).then(()=>{ state.loaded=false; state.allowStart=false; setPage('loading'); }); }
        else { render(); }
      }
    }
  });

  // Header controls
  document.getElementById('closeBtn')?.addEventListener('click', ()=>{ el.app.style.display='none'; });
  document.getElementById('minBtn')?.addEventListener('click', ()=>{ el.app.classList.toggle('min'); });

  // Init
  setPage('spinner');

  // CSS spinner keyframes
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
})();

