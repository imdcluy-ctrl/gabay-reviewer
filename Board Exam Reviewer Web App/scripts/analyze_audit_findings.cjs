const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

console.log(`Total questions analyzed: ${questions.length}`);

// 1. Check for template leakage
let templateLeaks = [];
questions.forEach(q => {
  const jsonStr = JSON.stringify(q);
  if (jsonStr.includes('${')) {
    templateLeaks.push(q.id);
  }
});
console.log(`\n--- Template Leakage (\${...}) ---`);
console.log(`Found ${templateLeaks.length} items: ${templateLeaks.slice(0, 10).join(', ')}...`);

// 2. Check for generic hints
let genericHints = [];
const genericPhrase = "Review the solution step by step to reach the correct answer";
const genericPhrase2 = "Review the solution step by step";
questions.forEach(q => {
  const jsonStr = JSON.stringify(q.ladder || []);
  if (jsonStr.includes(genericPhrase) || jsonStr.includes(genericPhrase2)) {
    genericHints.push(q.id);
  }
});
console.log(`\n--- Generic Hints ---`);
console.log(`Found ${genericHints.length} items with generic filler hints.`);

// 3. Exact Duplication / Near Duplication Check
let duplicateStems = {};
let duplicateCount = 0;
questions.forEach(q => {
  // Normalize stem: remove punctuation, lowercase, remove numbers to catch template clones
  let normalized = q.question_text
    .toLowerCase()
    .replace(/[0-9,\.]+/g, '#') // replace numbers with #
    .replace(/[^\w\s#]/gi, '')  // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!duplicateStems[normalized]) {
    duplicateStems[normalized] = [];
  }
  duplicateStems[normalized].push(q.id);
});

console.log(`\n--- Duplication Report ---`);
let heavilyDuplicatedGroups = 0;
for (const [stem, ids] of Object.entries(duplicateStems)) {
  if (ids.length > 1) {
    duplicateCount += (ids.length - 1);
    if (ids.length > 2) {
      heavilyDuplicatedGroups++;
      // console.log(`Group of ${ids.length}: ${ids.slice(0, 5).join(', ')}`);
    }
  }
}
console.log(`Total duplicated items to prune: ${duplicateCount}`);
console.log(`Number of heavily duplicated templates (3+ copies): ${heavilyDuplicatedGroups}`);

