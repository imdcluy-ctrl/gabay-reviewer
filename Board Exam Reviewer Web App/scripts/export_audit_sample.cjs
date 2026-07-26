const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

// Sample 30 representative questions (6 per category across difficulty levels 1, 2, 3)
const categories = ['numerical-ability', 'verbal-ability', 'analytical-ability', 'clerical-ability', 'general-information'];
const sampled = [];

categories.forEach(cat => {
  const catQs = data.filter(q => q.category_id === cat);
  // Pick 2 from batch 1/2, 2 from batch 3, 2 from batch 4
  const b12 = catQs.filter(q => parseInt(q.id.split('-').pop(), 10) < 200);
  const b3 = catQs.filter(q => parseInt(q.id.split('-').pop(), 10) >= 200 && parseInt(q.id.split('-').pop(), 10) < 300);
  const b4 = catQs.filter(q => parseInt(q.id.split('-').pop(), 10) >= 300);

  if (b12.length >= 2) sampled.push(b12[0], b12[Math.floor(b12.length / 2)]);
  if (b3.length >= 2) sampled.push(b3[0], b3[Math.floor(b3.length / 2)]);
  if (b4.length >= 2) sampled.push(b4[0], b4[Math.floor(b4.length / 2)]);
});

const outputPath = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/audit_sample_30q.json';
fs.writeFileSync(outputPath, JSON.stringify(sampled, null, 2), 'utf8');
console.log(`Successfully exported ${sampled.length} sampled questions for audit to: ${outputPath}`);
