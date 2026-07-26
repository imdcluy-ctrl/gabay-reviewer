const fs = require('fs');
const path = require('path');

const part1Path = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/blueprint_registry_part1.md';
const part2Path = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/blueprint_registry_part2.md';

const part1Lines = fs.readFileSync(part1Path, 'utf8').trim().split('\n').filter(l => l.startsWith('B-'));
const part2Lines = fs.readFileSync(part2Path, 'utf8').trim().split('\n').filter(l => l.startsWith('B-'));

const allBlueprints = [...part1Lines, ...part2Lines];
console.log('Total blueprints:', allBlueprints.length);

// Check for duplicate registry IDs
const ids = allBlueprints.map(l => l.split('|')[0].trim());
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('Duplicate registry IDs:', dupes.length);

// Delete old micro-batches
const batchDir = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/micro-batches';
if (fs.existsSync(batchDir)) {
  const oldFiles = fs.readdirSync(batchDir);
  oldFiles.forEach(f => fs.unlinkSync(path.join(batchDir, f)));
  console.log('Deleted', oldFiles.length, 'old batch files');
} else {
  fs.mkdirSync(batchDir, { recursive: true });
}

// Create new micro-batches of 10
const batchSize = 10;
const totalBatches = Math.ceil(allBlueprints.length / batchSize);
console.log('Creating', totalBatches, 'new micro-batches of', batchSize);

for (let i = 0; i < totalBatches; i++) {
  const batchNum = String(i + 1).padStart(3, '0');
  const start = i * batchSize;
  const end = Math.min(start + batchSize, allBlueprints.length);
  const batchItems = allBlueprints.slice(start, end);

  const tableRows = batchItems.map((line, idx) => {
    const parts = line.split('|').map(p => p.trim());
    const regId = parts[0] || '';
    const subtopic = parts[1] || '';
    const desc = parts[2] || '';
    return '| ' + (idx + 1) + ' | ' + regId + ' | ' + subtopic + ' | ' + desc + ' |';
  });

  let sheetContent = '# Micro-Batch ' + batchNum + ' — Assignment Sheet (10 Questions)\n';
  sheetContent += '## Concepts ' + (start + 1) + ' to ' + end + ' of ' + allBlueprints.length + '\n\n';
  sheetContent += '| # | Registry ID | Subtopic | Blueprint Concept |\n';
  sheetContent += '|---|---|---|---|\n';
  sheetContent += tableRows.join('\n') + '\n';

  const sheetPath = path.join(batchDir, 'batch_' + batchNum + '.md');
  fs.writeFileSync(sheetPath, sheetContent, 'utf8');
}

console.log('Created', totalBatches, 'micro-batch sheets in:', batchDir);

// Verify last batch size
const lastBatchSize = allBlueprints.length % batchSize || batchSize;
console.log('Last batch (batch_' + String(totalBatches).padStart(3, '0') + ') has', lastBatchSize, 'concepts');
