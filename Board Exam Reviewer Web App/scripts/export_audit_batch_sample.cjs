const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

// Helper to shuffle array
function shuffle(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Partition by batch based on ID trailing digits
const batch1 = data.filter(q => {
  const num = parseInt(q.id.split('-').pop(), 10);
  return num < 100;
});

const batch2 = data.filter(q => {
  const num = parseInt(q.id.split('-').pop(), 10);
  return num >= 100 && num < 200;
});

const batch3 = data.filter(q => {
  const num = parseInt(q.id.split('-').pop(), 10);
  return num >= 200 && num < 300;
});

const batch4 = data.filter(q => {
  const num = parseInt(q.id.split('-').pop(), 10);
  return num >= 300 && num < 400;
});

console.log(`Available items - Batch 1: ${batch1.length}, Batch 2: ${batch2.length}, Batch 3: ${batch3.length}, Batch 4: ${batch4.length}`);

// Pick 20 at random from each
const sampleB1 = shuffle(batch1).slice(0, 20);
const sampleB2 = shuffle(batch2).slice(0, 20);
const sampleB3 = shuffle(batch3).slice(0, 20);
const sampleB4 = shuffle(batch4).slice(0, 20);

const combined = [...sampleB1, ...sampleB2, ...sampleB3, ...sampleB4];

const downloadPath = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/audit_sample_80q_by_batch.json';
const artifactPath = 'C:/Users/ACER/.gemini/antigravity/brain/9918624f-40f3-48e7-97d9-22b4a73f603c/audit_sample_80q_by_batch.json';

fs.writeFileSync(downloadPath, JSON.stringify(combined, null, 2), 'utf8');
fs.writeFileSync(artifactPath, JSON.stringify(combined, null, 2), 'utf8');

console.log(`Successfully exported ${combined.length} sampled questions (20 per batch) to:\n- ${downloadPath}\n- ${artifactPath}`);
