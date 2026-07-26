const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

const mathQs = questions.filter(q => q.category_id === 'numerical-ability' && q.id.includes('-300'));
const lawQs = questions.filter(q => q.category_id === 'general-information' && q.id.includes('-300'));

console.log('=== MATH SPOT CHECK SAMPLE (Batch 4) ===');
mathQs.slice(0, 5).forEach(q => {
  console.log(`\nID: ${q.id}`);
  console.log(`Question: ${q.question_text}`);
  console.log(`Options: ${JSON.stringify(q.options)}`);
  console.log(`Correct Option: ${q.correct_option}`);
  console.log(`Deconstruct: ${q.deconstruct_text}`);
});

console.log('\n=== LAW SPOT CHECK SAMPLE (Batch 4) ===');
lawQs.slice(0, 5).forEach(q => {
  console.log(`\nID: ${q.id}`);
  console.log(`Question: ${q.question_text}`);
  console.log(`Options: ${JSON.stringify(q.options)}`);
  console.log(`Correct Option: ${q.correct_option}`);
  console.log(`Deconstruct: ${q.deconstruct_text}`);
});
