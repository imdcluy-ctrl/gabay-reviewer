const fs = require('fs');
const path = require('path');

// Read current seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);
console.log('Loaded', qs.length, 'questions from seed.json');

// Create output directory
const outDir = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/enhance-batches';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Split into batches of 10
const batchSize = 10;
const totalBatches = Math.ceil(qs.length / batchSize);

for (let i = 0; i < totalBatches; i++) {
  const batchNum = String(i + 1).padStart(2, '0');
  const start = i * batchSize;
  const end = Math.min(start + batchSize, qs.length);
  const batch = qs.slice(start, end);
  
  const outPath = path.join(outDir, 'enhance_batch_' + batchNum + '.json');
  fs.writeFileSync(outPath, JSON.stringify(batch, null, 2), 'utf8');
}

console.log('Created', totalBatches, 'enhancement batches of', batchSize, 'in:', outDir);

// Print a summary of which IDs are in which batch
console.log('\nBatch Index:');
for (let i = 0; i < totalBatches; i++) {
  const batchNum = String(i + 1).padStart(2, '0');
  const start = i * batchSize;
  const end = Math.min(start + batchSize, qs.length);
  const batch = qs.slice(start, end);
  const ids = batch.map(q => q.id);
  const cats = [...new Set(batch.map(q => q.category_id))];
  console.log('  enhance_batch_' + batchNum + ': ' + ids[0] + ' → ' + ids[ids.length-1] + ' [' + cats.join(', ') + ']');
}
