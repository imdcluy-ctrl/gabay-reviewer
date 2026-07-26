const fs = require('fs');
const path = require('path');

// Read current seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);
console.log('Loaded', qs.length, 'total questions from seed.json');

// Filter for questions needing Round 2 enhancement
// (questions that don't yet have the 4-rung Socratic hint ladder with 'Orient')
const pendingQs = qs.filter(q => {
  if (!q.hint_ladder || q.hint_ladder.length < 4) return true;
  const firstTitle = (q.hint_ladder[0]?.title || '').toLowerCase();
  return !firstTitle.includes('orient');
});

console.log('Found', pendingQs.length, 'questions needing Round 2 DeepSeek enhancement.');

// Create output directory for remaining single-question microbatches
const outDir = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/enhance-round2-all-batches';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Empty old files if directory exists
const existing = fs.readdirSync(outDir);
for (const file of existing) {
  if (file.endsWith('.json')) {
    fs.unlinkSync(path.join(outDir, file));
  }
}

// Create 1-question microbatch JSON files
for (let i = 0; i < pendingQs.length; i++) {
  const batchNum = String(i + 1).padStart(4, '0');
  const q = pendingQs[i];
  
  const outPath = path.join(outDir, `q${batchNum}_${q.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify([q], null, 2), 'utf8');
}

console.log(`✅ Successfully generated ${pendingQs.length} 1-question microbatch JSON files in:\n${outDir}`);
