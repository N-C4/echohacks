// —————————————————————————————
// Core navigation/store/vlad code stays the same
// —————————————————————————————

function navigateTo(url) {
  window.location.href = url;
}

function toggleStoreHelper() {
  document.getElementById("storeHelperModal").style.display = "flex";
}

function closeStoreHelper() {
  document.getElementById("storeHelperModal").style.display = "none";
  document.getElementById("storeOutput").innerHTML = '';
}

function generateStoreCodes() {
  const input = document.getElementById("storeInput").value;
  const output = document.getElementById("storeOutput");
  output.innerHTML = '';

  if (!/^\d{4}$/.test(input)) {
    output.innerHTML = "<p style='color: red;'>Enter exactly 4 digits.</p>";
    return;
  }

  const digits = input.split('');
  const results = new Set();

  function permute(arr, m = '') {
    if (arr.length === 0) results.add(m);
    for (let i = 0; i < arr.length; i++) {
      let curr = arr.slice();
      let next = curr.splice(i, 1);
      permute(curr.slice(), m + next);
    }
  }

  permute(digits);

  [...results].forEach(code => {
    const div = document.createElement('div');
    div.style.marginBottom = "8px";

    const buttonId = `copy-${code}`;
    div.innerHTML = `
      <code style="font-size: 16px;">${code}</code>
      <button id="${buttonId}" onclick="copyAndMark('${code}', '${buttonId}')" style="
        margin-left: 10px;
        padding: 4px 8px;
        font-size: 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      ">Copy</button>
    `;
    output.appendChild(div);
  });
}

function copyAndMark(text, buttonId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(buttonId);
    btn.innerText = "Copied";
    btn.style.backgroundColor = "#2ecc71";
    btn.style.color = "#fff";
    btn.disabled = true;
  });
}

function toggleVladModule() {
  document.getElementById("vladModuleModal").style.display = "block";
}

function closeVladModule() {
  document.getElementById("vladModuleModal").style.display = "none";
}

function generateVladCommands() {
  const ip = document.getElementById("vlad-ip").value;
  const port = document.getElementById("vlad-port").value;
  const moneyfile = document.getElementById("vlad-moneyfile").value;
  const attackfile = document.getElementById("vlad-attackfile").value;

  const commands = [
    moneyfile,
    `nmap ${ip}`,
    `sshnuke ${ip} -port=${port}`,
    `scp ${moneyfile} root@${ip}:${port}`,
    `ssh root@${ip}:${port}`,
    attackfile
  ];

  document.getElementById("vlad-output").innerHTML =
    commands.map(c => `<div>> ${c}</div>`).join("");
}

// —————————————————————————————
// Sentence helper: JSON load + sliding-window anagram
// —————————————————————————————

let sentences = [];
let sentenceWords = [];

// 1) Load your JSON list
fetch('list.json')
  .then(r => r.json())
  .then(data => {
    sentences = data;
    // 2) Pre-process each sentence
    sentenceWords = sentences.map(s => ({
      original: s,
      normalized: s.toLowerCase().replace(/[^a-z]/g, ''),
      words: s.toLowerCase().split(/\s+/)
    }));
  })
  .catch(console.error);

// Utility fns
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z]/g, '');
}
function sortedChars(str) {
  return normalize(str).split('').sort().join('');
}

// Modal toggles
function toggleSentenceHelper() {
  document.getElementById('sentenceHelperModal').style.display = 'flex';
}
function closeSentenceHelper() {
  document.getElementById('sentenceHelperModal').style.display = 'none';
  document.getElementById('sentenceInput').value = '';
  document.getElementById('sentenceResults').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('sentenceInput');
  const container = document.getElementById('sentenceResults');

  input.addEventListener('input', () => {
    const raw = input.value.trim();
    if (!raw) {
      container.innerHTML = '';
      return;
    }

    const lower = raw.toLowerCase();
    const normInput = normalize(raw);
    const sortedInput = sortedChars(raw);

    let matches = [];

    // 1) Exact substring
    matches = sentences.filter(s => s.toLowerCase().includes(lower));

    // 2) Whole-word anagram
    if (!matches.length) {
      matches = sentenceWords
        .filter(sw =>
          sw.words.some(w =>
            w.length === raw.length &&
            sortedChars(w) === sortedInput
          )
        )
        .map(sw => sw.original);
    }

    // 3) Sliding-window anagram inside each sentence’s normalized string
    if (!matches.length) {
      matches = sentenceWords
        .filter(sw => {
          const W = sw.normalized;
          for (let i = 0; i <= W.length - normInput.length; i++) {
            const slice = W.substr(i, normInput.length);
            if (sortedChars(slice) === sortedInput) return true;
          }
          return false;
        })
        .map(sw => sw.original);
    }

    // 4) Full-sentence anagram
    if (!matches.length) {
      matches = sentences.filter(s =>
        sortedChars(s) === sortedInput
      );
    }

    // 5) Fallback substring
    if (!matches.length) {
      matches = sentences.filter(s =>
        s.toLowerCase().includes(lower)
      );
    }

    // Show top-10 or “no matches”
    if (!matches.length) {
      container.innerHTML = '<p style="color:#ccc;">No matches found.</p>';
    } else {
      container.innerHTML = matches.slice(0,10).map(s =>
        `<div class="result-item">
           <span>${s}</span>
           <button onclick="copyToClipboard('${s.replace(/'/g,"\\'")}')">Copy</button>
         </div>`
      ).join('');
    }
  });
});

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied: ' + text);
  });
}
