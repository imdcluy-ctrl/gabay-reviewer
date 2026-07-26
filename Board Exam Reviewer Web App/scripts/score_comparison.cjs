const fs = require('fs');

const original = JSON.parse(fs.readFileSync('C:/Users/ACER/Downloads/exam reviewer plan/question-generation/enhance-batches/enhance_batch_01.json', 'utf8'));
const enhanced = JSON.parse(fs.readFileSync('scripts/incoming_batch.json', 'utf8'));

const BANNED = [
  'This option represents a',
  'arising from an incorrect arithmetic operation',
  'arising from an incorrect scaling factor',
  'Professional and academic multiple-choice assessments require',
  'applying logical principles, category rules, or analytical procedures',
  'Incorrect option. Selecting',
  'Incorrect choice. Selecting',
];

const GENERIC_HINTS = ['step by step', 'think carefully', 'consider the options', 'choose the best'];

function scoreQuestion(q, label) {
  let score = 0;
  const issues = [];

  // 1. Hint ladder quality (0-25)
  let hintScore = 0;
  (q.hint_ladder || []).forEach((r, i) => {
    const txt = (r.text || '');
    const isGeneric = txt.length < 30 || GENERIC_HINTS.some(g => txt.toLowerCase().includes(g));
    const hasBanned = BANNED.some(b => txt.includes(b));
    if (!isGeneric && !hasBanned) {
      hintScore += 6.25; // 4 rungs * 6.25 = 25 max
    } else {
      issues.push('Rung ' + (i+1) + ': ' + (isGeneric ? 'generic/short' : 'banned phrase'));
    }
  });
  score += hintScore;

  // 2. Distractor specificity (0-30) — 3 wrong answers * 10 each
  let distractorScore = 0;
  const wrongOpts = ['A','B','C','D'].filter(o => o !== q.correct_option);
  wrongOpts.forEach(opt => {
    const ce = q.choice_explanations[opt];
    const txt = typeof ce === 'object' ? (ce.text || '') : String(ce || '');
    const trap = typeof ce === 'object' ? ce.trap_type : null;
    
    const hasBannedText = BANNED.some(b => txt.includes(b));
    const isGeneric = txt.length < 40;
    const hasSpecificTrap = trap && trap !== 'null' && trap !== 'wrong' && trap !== 'incorrect';
    
    if (!hasBannedText && !isGeneric && hasSpecificTrap) {
      distractorScore += 10;
    } else {
      issues.push('Distractor ' + opt + ': ' + (hasBannedText ? 'banned phrase' : isGeneric ? 'too short' : 'vague trap_type'));
    }
  });
  score += distractorScore;

  // 3. Deconstruct text quality (0-30)
  const dec = q.deconstruct_text || '';
  const hasBannedDec = BANNED.some(b => dec.includes(b));
  const hasStepByStep = dec.toLowerCase().includes('step 1') || dec.toLowerCase().includes('step 2');
  const isSubstantial = dec.length > 300;
  const hasBoilerplate = dec.includes('Governing Rule / Concept') && dec.includes('Step-by-Step Analysis');
  
  if (!hasBannedDec && hasStepByStep && isSubstantial && !hasBoilerplate) {
    score += 30;
  } else if (!hasBannedDec && hasStepByStep) {
    score += 20;
    issues.push('Deconstruct: has steps but may have boilerplate');
  } else if (hasBannedDec || hasBoilerplate) {
    issues.push('Deconstruct: boilerplate header detected');
    score += 5;
  } else {
    score += 10;
    issues.push('Deconstruct: no step-by-step structure');
  }

  // 4. Next time rule (0-15)
  const rule = q.next_time_rule || '';
  const isMeaningful = rule.length > 50 && !BANNED.some(b => rule.includes(b));
  if (isMeaningful) {
    score += 15;
  } else {
    score += 5;
    issues.push('next_time_rule: too short or generic');
  }

  return { id: q.id, label, score: Math.round(score), issues };
}

console.log('=== BEFORE vs AFTER QUALITY SCORES ===\n');
console.log('| # | ID | BEFORE /100 | AFTER /100 | Delta | Key Improvement |');
console.log('|---|---|---|---|---|---|');

let totalBefore = 0, totalAfter = 0;

original.forEach((orig, i) => {
  const enh = enhanced.find(e => e.id === orig.id);
  const beforeScore = scoreQuestion(orig, 'BEFORE');
  const afterScore = scoreQuestion(enh, 'AFTER');
  
  totalBefore += beforeScore.score;
  totalAfter += afterScore.score;
  
  const delta = afterScore.score - beforeScore.score;
  const deltaStr = (delta >= 0 ? '+' : '') + delta;
  
  // Find the biggest single improvement
  let keyImprovement = '';
  if (beforeScore.issues.some(i => i.includes('Deconstruct')) && !afterScore.issues.some(i => i.includes('Deconstruct'))) {
    keyImprovement = 'Deconstruct rewritten';
  } else if (beforeScore.issues.some(i => i.includes('Rung')) && !afterScore.issues.some(i => i.includes('Rung'))) {
    keyImprovement = 'All hint rungs specific';
  } else if (beforeScore.issues.some(i => i.includes('Distractor')) && !afterScore.issues.some(i => i.includes('Distractor'))) {
    keyImprovement = 'Distractors specified';
  } else {
    keyImprovement = delta > 0 ? 'Incremental improvement' : 'Already strong';
  }
  
  console.log('| ' + (i+1) + ' | ' + orig.id + ' | ' + beforeScore.score + ' | ' + afterScore.score + ' | ' + deltaStr + ' | ' + keyImprovement + ' |');
  
  if (beforeScore.issues.length > 0) {
    console.log('|   | *BEFORE issues:* | ' + beforeScore.issues.slice(0,2).join('; ') + ' | | | |');
  }
  if (afterScore.issues.length > 0) {
    console.log('|   | *AFTER issues:* | | ' + afterScore.issues.slice(0,2).join('; ') + ' | | |');
  }
});

const avgBefore = Math.round(totalBefore / original.length);
const avgAfter = Math.round(totalAfter / original.length);
console.log('|---|---|---|---|---|---|');
console.log('| **AVG** | | **' + avgBefore + '/100** | **' + avgAfter + '/100** | **+' + (avgAfter - avgBefore) + '** | |');
