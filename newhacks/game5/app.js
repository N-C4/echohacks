// -- 1) Core game object and public API
const ThermiteNew = {};
function startThermiteMinigame(size, correctBlocks, incorrectBlocks, timetoShow, timetoLose) {
  ThermiteNew.Start({
    size,
    correct:   correctBlocks,
    incorrect: incorrectBlocks,
    showtime:  timetoShow,
    losetime:  timetoLose + timetoShow,
  });
}

// -- 2) Helpers (same as before) ...
function generateRandomNumberBetween(min, max, length) {
  const arr = [];
  while (arr.length < length) {
    const r = Math.floor(Math.random() * (max + 1 - min)) + min;
    if (!arr.includes(r)) arr.push(r);
  }
  return arr;
}
function generateGrid(size) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${size},1fr)`;
  grid.style.gridTemplateRows    = `repeat(${size},1fr)`;
  for (let i = 1; i <= size * size; i++) {
    const el = document.createElement("div");
    el.classList.add("block", `block-${i}`);
    grid.appendChild(el);
  }
}
function hideAllBlocks() {
  document.querySelectorAll('.block').forEach(ele =>
    ele.classList.remove("show","correct","incorrect","clicked")
  );
}
function showCorrectBlocks() {
  document.querySelectorAll('.block').forEach(ele => {
    const idx = +ele.className.match(/block-(\d+)/)[1];
    if (window.gridCorrectBlocks.includes(idx)) ele.classList.add("show");
  });
}
function isGameWon()    { return document.querySelectorAll(".correct").length   >= window.correctBlocksNum; }
function isGameLost()   { return document.querySelectorAll(".incorrect").length >= window.maxIncorrectBlocksNum; }
function checkWinOrLost(){
  if (isGameWon() || isGameLost()) {
    hideAllBlocks();
    window.activateClicking = false;
    document.querySelector(".container").style.display = "none";
    console.log("Game Result:", isGameWon() ? "WIN" : "LOSS");
  }
}
function isGameForeited(){
  if (window.activateClicking) {
    hideAllBlocks();
    window.activateClicking = false;
    document.querySelector(".container").style.display = "none";
    console.log("Game Result: FORFEITED");
  }
}
function onBlockClick(e){
  if (!window.activateClicking) return;
  const idx = +e.target.className.match(/block-(\d+)/)[1];
  const correct = window.gridCorrectBlocks.includes(idx);
  e.target.classList.add("clicked");
  e.target.classList.toggle("correct", correct);
  e.target.classList.toggle("incorrect", !correct);
  checkWinOrLost();
}

// -- 3) Define Start (same as before) ...
ThermiteNew.Start = function(data) {
  window.allBlocksNum          = data.size * data.size;
  window.correctBlocksNum      = data.correct;
  window.maxIncorrectBlocksNum = data.incorrect;
  window.timeBlocksShows       = data.showtime;
  window.timeUntilLose         = data.losetime;
  window.gridCorrectBlocks     = generateRandomNumberBetween(1, window.allBlocksNum, data.correct);
  window.activateClicking      = false;

  generateGrid(data.size);
  hideAllBlocks();
  showCorrectBlocks();

  setTimeout(() => {
    hideAllBlocks();
    window.activateClicking = true;
  }, window.timeBlocksShows * 1000);

  setTimeout(() => {
    isGameForeited();
  }, window.timeUntilLose * 1000);

  document.querySelector(".container").style.display = "block";
};

// -- 4) Wire up mode selector, custom form & clicks on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // delegate block-clicks
  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("block")) onBlockClick(e);
  });

  const presets = {
    paleto:  [7,20,5,5,10],
    vangies: [8,15,5,5,15],
    vault:   [8,15,5,5,10],
  };

  // Mode buttons
  document.querySelectorAll("#mode-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode === "custom") {
        // Show the custom form
        document.getElementById("mode-selector").classList.add("hidden");
        document.getElementById("custom-config").classList.remove("hidden");
      } else {
        // Start a preset
        const [sz, cr, ic, st, lt] = presets[mode];
        document.getElementById("mode-selector").classList.add("hidden");
        startThermiteMinigame(sz, cr, ic, st, lt);
      }
    });
  });

  // Custom form buttons
  document.getElementById("custom-back").addEventListener("click", () => {
    document.getElementById("custom-config").classList.add("hidden");
    document.getElementById("mode-selector").classList.remove("hidden");
  });

  document.getElementById("custom-start").addEventListener("click", () => {
    const size       = +document.getElementById("custom-size").value;
    const correct    = +document.getElementById("custom-correct").value;
    const incorrect  = +document.getElementById("custom-incorrect").value;
    const showtime   = +document.getElementById("custom-showtime").value;
    const losetime   = +document.getElementById("custom-losetime").value;

    document.getElementById("custom-config").classList.add("hidden");
    startThermiteMinigame(size, correct, incorrect, showtime, losetime);
  });
});
