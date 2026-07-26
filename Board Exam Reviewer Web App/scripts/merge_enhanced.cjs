const fs = require('fs');

const enhancedPath = 'C:/Users/ACER/Downloads/exam reviewer plan/enhance generate questions/all_405_questions_enhanced.json';
let raw = fs.readFileSync(enhancedPath, 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);

// Fix template leaks
let fixCount = 0;
qs.forEach(q => {
  const str = JSON.stringify(q);
  if (str.includes('${')) {
    // Fix in choice_explanations
    if (q.choice_explanations) {
      Object.keys(q.choice_explanations).forEach(key => {
        const ce = q.choice_explanations[key];
        if (typeof ce === 'object' && ce.text && ce.text.includes('${')) {
          ce.text = ce.text.replace(/\$\{[^}]+\}/g, 'the calculated value');
          fixCount++;
        } else if (typeof ce === 'string' && ce.includes('${')) {
          q.choice_explanations[key] = ce.replace(/\$\{[^}]+\}/g, 'the calculated value');
          fixCount++;
        }
      });
    }
    // Fix in deconstruct_text
    if (q.deconstruct_text && q.deconstruct_text.includes('${')) {
      q.deconstruct_text = q.deconstruct_text.replace(/\$\{[^}]+\}/g, 'the calculated value');
      fixCount++;
    }
    // Fix anywhere else
    if (q.next_time_rule && q.next_time_rule.includes('${')) {
      q.next_time_rule = q.next_time_rule.replace(/\$\{[^}]+\}/g, 'the value');
      fixCount++;
    }
  }
});
console.log('Template leaks fixed:', fixCount);

// Write to seed.json
const bom = '\uFEFF';
fs.writeFileSync('public/content/seed.json', bom + JSON.stringify(qs, null, 2), 'utf8');
console.log('Merged', qs.length, 'enhanced questions into seed.json');
