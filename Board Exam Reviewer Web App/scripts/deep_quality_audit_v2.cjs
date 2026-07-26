const fs = require('fs');
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);

// Show actual examples of the worst offenders by category
const categories = ['analytical-ability', 'clerical-ability', 'general-information'];

categories.forEach(cat => {
  const catQs = qs.filter(q => q.category_id === cat);
  console.log('\n' + '='.repeat(60));
  console.log('CATEGORY: ' + cat + ' (' + catQs.length + ' questions)');
  console.log('='.repeat(60));
  
  // Show 2 examples
  catQs.slice(0, 2).forEach(q => {
    console.log('\n--- ' + q.id + ' ---');
    console.log('Q: ' + (q.question_text || '').slice(0, 150));
    console.log('\nHint Ladder:');
    (q.hint_ladder || []).forEach((r, i) => {
      console.log('  R' + (i+1) + ': ' + (r.text || '').slice(0, 120));
    });
    console.log('\nDistractor Explanations:');
    Object.entries(q.choice_explanations || {}).forEach(([k, v]) => {
      const txt = typeof v === 'object' ? v.text : v;
      console.log('  ' + k + ': ' + String(txt).slice(0, 150));
    });
    console.log('\nDeconstruct (first 200 chars):');
    console.log('  ' + (q.deconstruct_text || '').slice(0, 200));
  });
});

// Count how many questions need enhancement per category
console.log('\n\n' + '='.repeat(60));
console.log('ENHANCEMENT SEVERITY SUMMARY');
console.log('='.repeat(60));

const TEMPLATE_PHRASES = [
  'This option represents a',
  'representing a cognitive error',
  'misinterprets the specific provisions',
  'confuses administrative peri',
  'arising from an incorrect arithme',
  'arising from an incorrect scaling',
  'Incorrect choice. Selecting',
];

const GENERIC_HINTS = ['step by step', 'think carefully', 'consider the', 'choose the best', 'review the problem'];

const catStats = {};
qs.forEach(q => {
  const cat = q.category_id;
  if (!catStats[cat]) catStats[cat] = { total: 0, templateCE: 0, genericHints: 0, needsFix: 0 };
  catStats[cat].total++;
  
  const ceStr = JSON.stringify(q.choice_explanations || {});
  const hlStr = JSON.stringify(q.hint_ladder || []);
  
  let hasTemplateCE = TEMPLATE_PHRASES.some(p => ceStr.includes(p));
  let hasGenericHint = false;
  (q.hint_ladder || []).forEach(r => {
    const txt = (r.text || '').toLowerCase();
    if (txt.length < 30 || GENERIC_HINTS.some(g => txt.includes(g))) hasGenericHint = true;
  });
  
  if (hasTemplateCE) catStats[cat].templateCE++;
  if (hasGenericHint) catStats[cat].genericHints++;
  if (hasTemplateCE || hasGenericHint) catStats[cat].needsFix++;
});

console.log('\n| Category | Total | Templated Explanations | Generic Hints | Needs Fix |');
console.log('|---|---|---|---|---|');
Object.entries(catStats).sort((a,b) => b[1].needsFix/b[1].total - a[1].needsFix/a[1].total).forEach(([cat, s]) => {
  console.log('| ' + cat + ' | ' + s.total + ' | ' + s.templateCE + ' (' + Math.round(s.templateCE/s.total*100) + '%) | ' + s.genericHints + ' (' + Math.round(s.genericHints/s.total*100) + '%) | ' + s.needsFix + ' (' + Math.round(s.needsFix/s.total*100) + '%) |');
});

let totalNeedsFix = Object.values(catStats).reduce((a,b) => a + b.needsFix, 0);
console.log('\nTotal needing enhancement: ' + totalNeedsFix + ' / ' + qs.length + ' (' + Math.round(totalNeedsFix/qs.length*100) + '%)');
