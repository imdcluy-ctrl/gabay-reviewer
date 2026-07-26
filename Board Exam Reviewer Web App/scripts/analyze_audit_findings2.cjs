const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

let templateLeaks = [];
questions.forEach(q => {
  const jsonStr = JSON.stringify(q);
  if (jsonStr.includes('${')) templateLeaks.push(q.id);
});

let genericHints = [];
const genericPhrase = "step by step";
questions.forEach(q => {
  const jsonStr = JSON.stringify(q).toLowerCase();
  if (jsonStr.includes(genericPhrase)) {
    genericHints.push(q.id);
  }
});

let duplicateStems = {};
questions.forEach(q => {
  let normalized = q.question_text
    .toLowerCase()
    .replace(/[0-9,\.]+/g, '#')
    .replace(/[^\w\s#]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!duplicateStems[normalized]) duplicateStems[normalized] = [];
  duplicateStems[normalized].push(q.id);
});

let report = `Total questions: ${questions.length}\n`;
report += `Template leaks (${templateLeaks.length}): ${templateLeaks.join(', ')}\n\n`;
report += `Generic step by step hints (${genericHints.length}): ${genericHints.join(', ')}\n\n`;

report += `Duplication Groups:\n`;
for (const [stem, ids] of Object.entries(duplicateStems)) {
  if (ids.length > 1) {
    report += `\n[${ids.length} copies] - Stem: ${stem}\n  IDs: ${ids.join(', ')}\n`;
  }
}

fs.writeFileSync('duplicate_report.txt', report, 'utf8');
console.log('Report saved to duplicate_report.txt');
