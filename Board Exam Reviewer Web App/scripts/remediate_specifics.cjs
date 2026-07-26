const fs = require('fs');

let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const questions = JSON.parse(raw);

let modifiedCount = 0;

questions.forEach(q => {
  // 1. Fix gen-curenv-300
  if (q.id === 'gen-curenv-300') {
    q.question_text = "Under RA 9729, as amended by RA 10174 (People's Survival Fund Act), who chairs the Climate Change Commission?";
    if (q.explanation) {
      q.explanation += " Note: RA 10174 amended RA 9729, creating the People's Survival Fund and clarifying the Commission's composition, though the President remains the nominal chair.";
    }
    modifiedCount++;
  }

  // 2. Fix generic hints
  if (q.ladder) {
    q.ladder.forEach(rung => {
      if (rung.text.toLowerCase().includes('step by step')) {
        if (q.category === 'Numerical Ability') {
          rung.text = "Write out the equation clearly. Which variable are you trying to isolate? Check your order of operations.";
        } else if (q.category === 'Verbal Ability') {
          rung.text = "Look at the subject-verb agreement and the tense of the surrounding context. Does the modifier correctly attach to the noun?";
        } else {
          rung.text = "Re-read the premise carefully. Eliminate options that contradict the explicit constraints given in the text.";
        }
        modifiedCount++;
      }
    });
  }

  // 3. Fix template leaks
  if (q.choice_explanations && typeof q.choice_explanations === 'object') {
    Object.keys(q.choice_explanations).forEach(key => {
      if (typeof q.choice_explanations[key] === 'string' && q.choice_explanations[key].includes('${')) {
        q.choice_explanations[key] = q.choice_explanations[key].replace(/\$\{[^}]+\}/g, '[calculated value]');
        modifiedCount++;
      }
    });
  }
});

const bom = '\uFEFF';
fs.writeFileSync('public/content/seed.json', bom + JSON.stringify(questions, null, 2), 'utf8');

console.log(`Successfully remediated ${modifiedCount} specific items/hints/leaks.`);
