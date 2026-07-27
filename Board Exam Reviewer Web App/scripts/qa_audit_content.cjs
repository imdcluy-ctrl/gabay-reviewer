const fs = require('fs');

console.log('=== STARTING COMPREHENSIVE QUESTION BANK QA AUDIT ===\n');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

console.log(`Total questions loaded: ${questions.length}`);

const stats = {
  total: questions.length,
  duplicateIds: [],
  missingFields: [],
  optionsErrors: [],
  hintLadderErrors: [],
  explanationErrors: [],
  trapTypeErrors: [],
  mathMismatches: [],
  categoryCounts: {},
  subtopicCounts: {},
  difficultyCounts: { 1: 0, 2: 0, 3: 0 }
};

const idSet = new Set();

questions.forEach((q, _idx) => {
  // 1. Duplicate ID Check
  if (idSet.has(q.id)) {
    stats.duplicateIds.push(q.id);
  } else {
    idSet.add(q.id);
  }

  // 2. Category & Subtopic Breakdown
  stats.categoryCounts[q.category_id] = (stats.categoryCounts[q.category_id] || 0) + 1;
  const subKey = `${q.category_id} -> ${q.subtopic_id}`;
  stats.subtopicCounts[subKey] = (stats.subtopicCounts[subKey] || 0) + 1;

  // Difficulty Count
  if (stats.difficultyCounts[q.difficulty_level] !== undefined) {
    stats.difficultyCounts[q.difficulty_level]++;
  }

  // 3. Schema Completeness
  const requiredFields = ['id', 'subtopic_id', 'category_id', 'question_text', 'options', 'correct_option', 'difficulty_level', 'hint_ladder', 'choice_explanations', 'next_time_rule', 'blueprint_id', 'deconstruct_text'];
  requiredFields.forEach(f => {
    if (!q[f]) {
      stats.missingFields.push({ id: q.id, field: f });
    }
  });

  // 4. Options Array Check
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    stats.optionsErrors.push({ id: q.id, issue: `Options length is ${q.options ? q.options.length : 0}` });
  } else {
    const keys = q.options.map(o => o.key).join('');
    if (keys !== 'ABCD') {
      stats.optionsErrors.push({ id: q.id, issue: `Option keys are '${keys}', expected 'ABCD'` });
    }
  }

  // 5. Hint Ladder Check
  if (!Array.isArray(q.hint_ladder) || q.hint_ladder.length !== 4) {
    stats.hintLadderErrors.push({ id: q.id, issue: `Hint rungs count is ${q.hint_ladder ? q.hint_ladder.length : 0}` });
  }

  // 6. Choice Explanations & Trap Type Check
  if (!q.choice_explanations) {
    stats.explanationErrors.push({ id: q.id, issue: 'Missing choice_explanations object' });
  } else {
    ['A', 'B', 'C', 'D'].forEach(k => {
      if (!q.choice_explanations[k]) {
        stats.explanationErrors.push({ id: q.id, issue: `Missing explanation for option ${k}` });
      }
    });

    if (q.choice_explanations[q.correct_option]) {
      if (q.choice_explanations[q.correct_option].trap_type !== null) {
        stats.trapTypeErrors.push({ id: q.id, issue: `Correct option '${q.correct_option}' trap_type is not null (${q.choice_explanations[q.correct_option].trap_type})` });
      }
    }
  }
});

console.log('\n--- QA RESULTS SUMMARY ---');
console.log(`✓ Total Questions Audited: ${stats.total}`);
console.log(`✓ Duplicate IDs Found: ${stats.duplicateIds.length}`);
console.log(`✓ Missing Schema Fields: ${stats.missingFields.length}`);
console.log(`✓ Options Structure Errors: ${stats.optionsErrors.length}`);
console.log(`✓ Hint Ladder Errors: ${stats.hintLadderErrors.length}`);
console.log(`✓ Explanation Missing Errors: ${stats.explanationErrors.length}`);
console.log(`✓ Correct Option Trap Type Errors: ${stats.trapTypeErrors.length}`);

console.log('\n--- DIFFICULTY LEVEL DISTRIBUTION ---');
Object.keys(stats.difficultyCounts).forEach(lvl => {
  const pct = ((stats.difficultyCounts[lvl] / stats.total) * 100).toFixed(1);
  console.log(`Level ${lvl}: ${stats.difficultyCounts[lvl]} questions (${pct}%)`);
});

console.log('\n--- CATEGORY DISTRIBUTION ---');
Object.keys(stats.categoryCounts).forEach(cat => {
  const pct = ((stats.categoryCounts[cat] / stats.total) * 100).toFixed(1);
  console.log(`- ${cat}: ${stats.categoryCounts[cat]} (${pct}%)`);
});

console.log('\n--- SUBTOPIC BREAKDOWN ---');
Object.keys(stats.subtopicCounts).sort().forEach(sub => {
  console.log(`  * ${sub}: ${stats.subtopicCounts[sub]}`);
});

if (stats.duplicateIds.length > 0) {
  console.log('\n⚠️ DUPLICATE IDS DETECTED:', stats.duplicateIds);
}
if (stats.missingFields.length > 0) {
  console.log('\n⚠️ MISSING FIELDS DETECTED:', stats.missingFields);
}
if (stats.optionsErrors.length > 0) {
  console.log('\n⚠️ OPTIONS ERRORS DETECTED:', stats.optionsErrors);
}
if (stats.hintLadderErrors.length > 0) {
  console.log('\n⚠️ HINT LADDER ERRORS DETECTED:', stats.hintLadderErrors);
}
if (stats.trapTypeErrors.length > 0) {
  console.log('\n⚠️ TRAP TYPE ERRORS DETECTED:', stats.trapTypeErrors);
}

console.log('\n=== QA AUDIT COMPLETE ===');
