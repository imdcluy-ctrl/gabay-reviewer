const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const batches = [
  { name: 'batch1', filter: q => parseInt(q.id.split('-').pop(), 10) < 100 },
  { name: 'batch2', filter: q => parseInt(q.id.split('-').pop(), 10) >= 100 && parseInt(q.id.split('-').pop(), 10) < 200 },
  { name: 'batch3', filter: q => parseInt(q.id.split('-').pop(), 10) >= 200 && parseInt(q.id.split('-').pop(), 10) < 300 },
  { name: 'batch4', filter: q => parseInt(q.id.split('-').pop(), 10) >= 300 && parseInt(q.id.split('-').pop(), 10) < 400 }
];

batches.forEach(b => {
  const items = data.filter(b.filter);
  const sample = shuffle(items).slice(0, 20);
  const target = `C:/Users/ACER/Downloads/exam reviewer plan/question-generation/audit_sample_${b.name}_20q.json`;
  fs.writeFileSync(target, JSON.stringify(sample, null, 2), 'utf8');
  console.log(`Saved ${sample.length} items to ${target}`);
});
