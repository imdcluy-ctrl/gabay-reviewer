const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

const batch2a = data.filter(q => q.id.includes('-100') || q.id.includes('-101') || q.id.includes('-102') || q.id.includes('-103') || q.id.includes('-104') || q.id.includes('-105') || q.id.includes('-106') || q.id.includes('-107') || q.id.includes('-108') || q.id.includes('-109') || q.id.includes('-110') || q.id.includes('-111') || q.id.includes('-112') || q.id.includes('-113') || q.id.includes('-114') || q.id.includes('-115') || q.id.includes('-116') || q.id.includes('-117') || q.id.includes('-118') || q.id.includes('-119') || q.id.includes('-120') || q.id.includes('-121') || q.id.includes('-122') || q.id.includes('-123') || q.id.includes('-124'));

let manifestLines = [
  '# COMPLETION MANIFEST — Questions Already Created',
  '# Format: ID | blueprint_id | one-line summary',
  '# DO NOT create questions covering these same blueprints/scenarios.',
  '',
  '## Batch 2 Chunk 2A — Numerical Ability (118 questions)'
];

batch2a.forEach(q => {
  const textSnippet = q.question_text.replace(/\n/g, ' ').slice(0, 80);
  manifestLines.push(`${q.id} | ${q.blueprint_id} | ${textSnippet}`);
});

fs.writeFileSync('C:/Users/ACER/Downloads/exam reviewer plan/question-generation/completion_manifest_batch2.txt', manifestLines.join('\n'), 'utf8');
console.log(`Successfully generated completion_manifest_batch2.txt with ${batch2a.length} entries.`);
