const fs = require('fs');

// Load incoming batch
const incoming = JSON.parse(fs.readFileSync('scripts/incoming_batch.json', 'utf8'));

// Load current seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
const hasBOM = raw.charCodeAt(0) === 0xFEFF;
if (hasBOM) raw = raw.slice(1);
const seed = JSON.parse(raw);

console.log('Seed before merge:', seed.length, 'questions');
console.log('Incoming:', incoming.length, 'questions');

// Build a map of existing questions by ID
const seedMap = new Map(seed.map(q => [q.id, q]));

let replaced = 0;
let added = 0;

incoming.forEach(q => {
  if (seedMap.has(q.id)) {
    seedMap.set(q.id, q);
    replaced++;
  } else {
    seedMap.set(q.id, q);
    added++;
  }
});

// Reconstruct array preserving original order, then appending new ones
const originalIds = seed.map(q => q.id);
const _newIds = incoming.map(q => q.id).filter(id => !seedMap.has(id) || !originalIds.includes(id));

const mergedArr = originalIds.map(id => seedMap.get(id));
// Add any truly new IDs not in original
incoming.forEach(q => {
  if (!originalIds.includes(q.id)) mergedArr.push(q);
});

console.log('Replaced:', replaced, '| Added (new):', added);
console.log('Seed after merge:', mergedArr.length, 'questions');

// Write back
const bom = '\uFEFF';
fs.writeFileSync('public/content/seed.json', bom + JSON.stringify(mergedArr, null, 2), 'utf8');
console.log('✅ seed.json updated successfully');
