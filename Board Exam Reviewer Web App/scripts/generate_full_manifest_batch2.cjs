const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

const batch2All = data.filter(q => {
  const parts = q.id.split('-');
  const num = parseInt(parts[parts.length - 1], 10);
  return num >= 100 && num < 200;
});

let manifestLines = [
  '# COMPLETION MANIFEST — Questions Already Created',
  '# Format: ID | blueprint_id | one-line summary',
  '# DO NOT create questions covering these same blueprints/scenarios.',
  '',
  `## Batch 2 Complete (${batch2All.length} questions)`
];

batch2All.forEach(q => {
  const textSnippet = q.question_text.replace(/\n/g, ' ').slice(0, 80);
  manifestLines.push(`${q.id} | ${q.blueprint_id} | ${textSnippet}`);
});

fs.writeFileSync('C:/Users/ACER/Downloads/exam reviewer plan/question-generation/completion_manifest_batch2.txt', manifestLines.join('\n'), 'utf8');
console.log(`Successfully generated completion_manifest_batch2.txt with ${batch2All.length} entries.`);
