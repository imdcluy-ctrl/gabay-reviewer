const fs = require('fs');
const path = require('path');

// Read current seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);
console.log('Loaded', qs.length, 'questions from seed.json');

// Filter for free tier questions
const freeQs = qs.filter(q => q.is_free);
console.log('Found', freeQs.length, 'free tier questions.');

// Create output directory
const outDir = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/enhance-round2-batches';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Create 1-question batches
for (let i = 0; i < freeQs.length; i++) {
  const batchNum = String(i + 1).padStart(3, '0');
  const q = freeQs[i];
  
  const outPath = path.join(outDir, 'free_tier_q' + batchNum + '_' + q.id + '.json');
  fs.writeFileSync(outPath, JSON.stringify([q], null, 2), 'utf8');
}

console.log('Created', freeQs.length, 'individual JSON files in:', outDir);
