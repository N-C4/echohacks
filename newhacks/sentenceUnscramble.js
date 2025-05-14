// sentenceUnscramble.js

let sentences = [];
let sentencesLoaded = false;

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z]/g, '');
}
function sortedChars(str) {
  return normalize(str).split('').sort().join('');
}

async function loadSentences() {
  if (sentencesLoaded) return sentences;
  try {
    const res = await fetch('list.json');
    sentences = await res.json();
    sentencesLoaded = true;
    return sentences;
  } catch (e) {
    console.error('Failed to load list.json:', e);
    sentences = [];
    sentencesLoaded = false;
    return [];
  }
}

/**
 * Finds all sentences where ANY n-gram (group of up to N words)
 * is an anagram of the input.
 * e.g. input: "eh sdnrik" will match "he drinks coffee in the morning"
 */
async function findUnscrambledSentences(input) {
  await loadSentences();
  const sortedInput = sortedChars(input);
  let matches = [];

  // Try all n-grams up to maxNgramLength in every sentence
  const maxNgramLength = 5;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    let found = false;

    outer: for (let n = 1; n <= Math.min(words.length, maxNgramLength); n++) {
      for (let start = 0; start <= words.length - n; start++) {
        const ngram = words.slice(start, start + n).join(' ');
        if (sortedChars(ngram) === sortedInput) {
          found = true;
          break outer;
        }
      }
    }

    if (found) matches.push(sentence);
  }

  // Fallback: normal substring search if nothing found
  if (!matches.length) {
    const raw = input.trim().toLowerCase();
    matches = sentences.filter(s => s.toLowerCase().includes(raw));
  }

  return matches.slice(0, 10);
}

// Modal controls (you can remove if in script.js)
function toggleSentenceHelper() {
  document.getElementById('sentenceHelperModal').style.display = 'flex';
}
function closeSentenceHelper() {
  document.getElementById('sentenceHelperModal').style.display = 'none';
  document.getElementById('sentenceInput').value = '';
  document.getElementById('sentenceResults').innerHTML = '';
}

// UI logic for the Find Sentence modal
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('sentenceInput');
  const container = document.getElementById('sentenceResults');

  input.addEventListener('input', async () => {
    const value = input.value.trim();
    if (!value) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = '<span style="color:#aaa;">Searching…</span>';
    const matches = await findUnscrambledSentences(value);

    if (!matches.length) {
      container.innerHTML = '<p style="color:#ccc;">No matches found.</p>';
    } else {
      container.innerHTML = matches.map(s =>
        `<div class="result-item">
           <span>${s}</span>
           <button onclick="navigator.clipboard.writeText('${s.replace(/'/g,"\\'")}');this.innerText='Copied';this.disabled=true;setTimeout(()=>{this.innerText='Copy';this.disabled=false;},900);">Copy</button>
         </div>`
      ).join('');
    }
  });
});
