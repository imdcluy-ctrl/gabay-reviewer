const fs = require('fs');

const enhancedPath = 'C:/Users/ACER/Downloads/exam reviewer plan/enhance generate questions/all_405_questions_enhanced.json';
let raw = fs.readFileSync(enhancedPath, 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);
console.log('Enhanced file loaded:', qs.length, 'questions');

// Check for template leaks
const leaks = qs.filter(q => JSON.stringify(q).includes('${'));
console.log('Template leaks:', leaks.length);

// Check for generic hints
const generic = qs.filter(q => JSON.stringify(q).toLowerCase().includes('step by step'));
console.log('Generic step-by-step hints:', generic.length);

// Check schema compliance
let schemaErrors = [];
qs.forEach(q => {
  const errs = [];
  if (!q.id) errs.push('missing id');
  if (!q.subtopic_id) errs.push('missing subtopic_id');
  if (!q.category_id) errs.push('missing category_id');
  if (!q.question_text) errs.push('missing question_text');
  if (!q.options || q.options.length !== 4) errs.push('options not 4');
  if (!q.correct_option) errs.push('missing correct_option');
  if (!q.hint_ladder || q.hint_ladder.length !== 4) errs.push('hint_ladder not 4 rungs');
  if (!q.choice_explanations) errs.push('missing choice_explanations');
  if (errs.length > 0) schemaErrors.push({ id: q.id, errors: errs });
});
console.log('Questions with schema errors:', schemaErrors.length);
if (schemaErrors.length > 0) {
  schemaErrors.slice(0, 5).forEach(e => console.log('  ', e.id, '-', e.errors.join(', ')));
}

// Check for duplicate IDs
const ids = qs.map(q => q.id);
const seen = new Set();
const dupeIds = [];
ids.forEach(id => {
  if (seen.has(id)) dupeIds.push(id);
  seen.add(id);
});
console.log('Duplicate IDs:', dupeIds.length);

// Category distribution
const cats = {};
qs.forEach(q => {
  cats[q.category_id] = (cats[q.category_id] || 0) + 1;
});
console.log('\nCategory distribution:');
Object.entries(cats).forEach(([k, v]) => console.log('  ' + k + ': ' + v));

// Sample hints to check quality
console.log('\n--- Sample Hint Quality Check (3 random questions) ---');
for (let i = 0; i < 3; i++) {
  const sample = qs[Math.floor(Math.random() * qs.length)];
  console.log('\n[' + sample.id + ']');
  console.log('  R1:', sample.hint_ladder[0].text.slice(0, 120));
  console.log('  R4:', sample.hint_ladder[3].text.slice(0, 120));
}
