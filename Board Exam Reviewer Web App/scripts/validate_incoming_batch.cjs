const fs = require('fs');

const incomingRaw = fs.readFileSync('scripts/incoming_batch.json', 'utf8').trim();
const incoming = JSON.parse(incomingRaw);

console.log('Incoming questions:', incoming.length);

// 1. Schema validation
let errors = [];
const BANNED = [
  'This option represents a',
  'representing a cognitive error where the student',
  'misinterprets the specific provisions of the law',
  'confuses administrative peri',
  'arising from an incorrect arithmetic operation',
  'arising from an incorrect scaling factor',
  'Professional and academic multiple-choice assessments require',
  'applying logical principles, category rules, or analytical procedures',
  'to determine the single correct answer',
  'Review the solution step by step',
  'Think carefully about',
  'Incorrect option. Selecting',
  'Incorrect choice. Selecting',
];

incoming.forEach((q, i) => {
  const idx = 'Q' + (i+1) + ' [' + q.id + ']';
  if (!q.id) errors.push(idx + ': missing id');
  if (!q.question_text) errors.push(idx + ': missing question_text');
  if (!q.options || q.options.length !== 4) errors.push(idx + ': options not 4');
  if (!q.correct_option) errors.push(idx + ': missing correct_option');
  if (!q.hint_ladder || q.hint_ladder.length !== 4) errors.push(idx + ': hint_ladder not 4 rungs');
  if (!q.choice_explanations) errors.push(idx + ': missing choice_explanations');
  if (!q.deconstruct_text) errors.push(idx + ': missing deconstruct_text');

  // Check hint rung length
  (q.hint_ladder || []).forEach((r, ri) => {
    if ((r.text || '').length < 30) errors.push(idx + ': rung ' + (ri+1) + ' too short (' + r.text.length + ' chars)');
  });

  // Check banned phrases
  const fullStr = JSON.stringify(q);
  BANNED.forEach(phrase => {
    if (fullStr.includes(phrase)) {
      errors.push(idx + ': BANNED PHRASE found: "' + phrase.slice(0, 50) + '"');
    }
  });

  // Check correct answer has null trap_type
  const correct = q.choice_explanations[q.correct_option];
  if (correct && typeof correct === 'object' && correct.trap_type !== null) {
    errors.push(idx + ': correct answer trap_type should be null, got: ' + correct.trap_type);
  }

  // Check wrong answers have non-null trap_type
  ['A','B','C','D'].forEach(opt => {
    if (opt === q.correct_option) return;
    const ce = q.choice_explanations[opt];
    if (!ce) return;
    const trap = typeof ce === 'object' ? ce.trap_type : null;
    if (!trap || trap === 'null') {
      errors.push(idx + ': wrong answer ' + opt + ' missing trap_type');
    }
  });
});

// Check for duplicate IDs within batch
const ids = incoming.map(q => q.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length > 0) errors.push('Duplicate IDs in batch: ' + dupes.join(', '));

console.log('\n=== VALIDATION RESULTS ===');
if (errors.length === 0) {
  console.log('✅ All checks passed! Ready to merge.');
} else {
  console.log('❌ ' + errors.length + ' error(s) found:');
  errors.forEach(e => console.log('  - ' + e));
}

// 2. Show a quality sample
console.log('\n=== QUALITY SAMPLE (first question) ===');
const q0 = incoming[0];
console.log('ID:', q0.id);
console.log('Q:', q0.question_text.slice(0, 100));
console.log('Hint R1:', q0.hint_ladder[0].text);
console.log('Hint R4:', q0.hint_ladder[3].text);
const wrongOpts = ['A','B','C','D'].filter(o => o !== q0.correct_option);
wrongOpts.forEach(o => {
  const ce = q0.choice_explanations[o];
  console.log('Wrong ' + o + ':', (typeof ce === 'object' ? ce.text : ce).slice(0, 120));
  console.log('  trap_type:', typeof ce === 'object' ? ce.trap_type : 'N/A');
});
console.log('Deconstruct (200 chars):', q0.deconstruct_text.slice(0, 200));
