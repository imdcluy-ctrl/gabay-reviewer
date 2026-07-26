const fs = require('fs');
const path = require('path');

// Read current seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);
console.log('Loaded', qs.length, 'total questions from seed.json');

// Create output directory for ALL 2910 single-question microbatches
const outDir = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/enhance-round2-all-batches';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Empty old files if directory exists
const existing = fs.readdirSync(outDir);
for (const file of existing) {
  if (file.endsWith('.json')) {
    fs.unlinkSync(path.join(outDir, file));
  }
}

// Create 1-question microbatch JSON files for ALL questions
for (let i = 0; i < qs.length; i++) {
  const batchNum = String(i + 1).padStart(4, '0');
  const q = qs[i];
  
  const outPath = path.join(outDir, `q${batchNum}_${q.id}.json`);
  fs.writeFileSync(outPath, JSON.stringify([q], null, 2), 'utf8');
}

console.log(`✅ Successfully generated ${qs.length} 1-question microbatch JSON files for the ENTIRE bank in:\n${outDir}`);
