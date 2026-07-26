const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);

const targetPath = 'C:/Users/ACER/Downloads/exam reviewer plan/question-generation/all_2077_questions.json';
fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Successfully exported all ${data.length} questions to: ${targetPath}`);
