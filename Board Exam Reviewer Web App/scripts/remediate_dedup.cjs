const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

const genericPhrase = "step by step";

function hasLeak(q) {
  return JSON.stringify(q).includes('${');
}

function hasGenericHint(q) {
  return JSON.stringify(q).toLowerCase().includes(genericPhrase);
}

let duplicateStems = {};
let uniqueQuestions = [];
let prunedCount = 0;

questions.forEach(q => {
  let normalized = q.question_text
    .toLowerCase()
    .replace(/[0-9,.]+/g, '#')
    .replace(/[^\w\s#]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!duplicateStems[normalized]) {
    duplicateStems[normalized] = [];
  }
  duplicateStems[normalized].push(q);
});

for (const [_stem, group] of Object.entries(duplicateStems)) {
  // If only one question, keep it
  if (group.length === 1) {
    uniqueQuestions.push(group[0]);
    continue;
  }

  // If multiple, try to find one without leaks or generic hints
  let bestQ = group.find(q => !hasLeak(q) && !hasGenericHint(q));
  
  // Fallback 1: no leaks
  if (!bestQ) {
    bestQ = group.find(q => !hasLeak(q));
  }
  
  // Fallback 2: first one
  if (!bestQ) {
    bestQ = group[0];
  }

  uniqueQuestions.push(bestQ);
  prunedCount += (group.length - 1);
}

// Preserve UTF-8 BOM when saving
const bom = '\uFEFF';
fs.writeFileSync('public/content/seed.json', bom + JSON.stringify(uniqueQuestions, null, 2), 'utf8');

console.log(`Original count: ${questions.length}`);
console.log(`Pruned count: ${prunedCount}`);
console.log(`New unique count: ${uniqueQuestions.length}`);
