const fs = require('fs');
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const qs = JSON.parse(raw);

// 1. Find copy-pasted distractor explanations
const TEMPLATE_PHRASES = [
  'This option represents a',
  'representing a cognitive error where the student mis',
  'misinterprets the specific provisions of the law',
  'confuses administrative peri',
  'incorrectly attributes official authority',
  'Review the solution step by step',
  'Think carefully about',
  'Consider the options',
];

let templateCount = 0;
const templateQuestions = {};

qs.forEach(q => {
  const ceStr = JSON.stringify(q.choice_explanations || {});
  const dtStr = JSON.stringify(q.deconstruct_text || '');
  const hlStr = JSON.stringify(q.hint_ladder || []);
  const combined = ceStr + dtStr + hlStr;
  
  for (const phrase of TEMPLATE_PHRASES) {
    if (combined.includes(phrase)) {
      templateCount++;
      const cat = q.category_id;
      templateQuestions[cat] = (templateQuestions[cat] || 0) + 1;
      break;
    }
  }
});

console.log('\n=== TEMPLATE CONTAMINATION REPORT ===');
console.log('Total questions with templated text:', templateCount, '/', qs.length);
console.log('By category:');
Object.entries(templateQuestions).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
  const total = qs.filter(q => q.category_id === k).length;
  console.log('  ' + k + ': ' + v + '/' + total + ' (' + Math.round(v/total*100) + '%)');
});

// 2. Find identical distractor texts across different questions
console.log('\n=== IDENTICAL DISTRACTOR TEXT ANALYSIS ===');
const explanationTexts = {};
qs.forEach(q => {
  if (!q.choice_explanations) return;
  Object.entries(q.choice_explanations).forEach(([opt, val]) => {
    const txt = (typeof val === 'object' ? val.text : val) || '';
    // Only look at wrong answers (non-null trap_type)
    const trap = typeof val === 'object' ? val.trap_type : null;
    if (trap === null || trap === 'null') return;
    
    const normalized = txt.trim().slice(0, 100);
    if (!explanationTexts[normalized]) explanationTexts[normalized] = [];
    explanationTexts[normalized].push(q.id + ':' + opt);
  });
});

const repeatedTexts = Object.entries(explanationTexts)
  .filter(([_, ids]) => ids.length > 2)
  .sort((a, b) => b[1].length - a[1].length);

console.log('Distractor explanations used 3+ times (copy-paste indicators):');
repeatedTexts.slice(0, 15).forEach(([text, ids]) => {
  console.log('  [' + ids.length + 'x] "' + text.slice(0, 80) + '..."');
});

// 3. Check hint ladder quality
console.log('\n=== HINT LADDER QUALITY ===');
let genericRungs = 0;
let totalRungs = 0;
const GENERIC_HINTS = [
  'step by step',
  'think carefully',
  'consider the',
  'choose the best',
  'review the problem',
  'recall the',
];
qs.forEach(q => {
  if (!q.hint_ladder) return;
  q.hint_ladder.forEach(rung => {
    totalRungs++;
    const txt = (rung.text || '').toLowerCase();
    if (txt.length < 30 || GENERIC_HINTS.some(g => txt.includes(g))) {
      genericRungs++;
    }
  });
});
console.log('Generic/short hint rungs:', genericRungs, '/', totalRungs, '(' + Math.round(genericRungs/totalRungs*100) + '%)');

// 4. Check deconstruct_text quality
console.log('\n=== DECONSTRUCT TEXT QUALITY ===');
let thinDeconstructs = 0;
let templateDeconstructs = 0;
qs.forEach(q => {
  const dt = q.deconstruct_text || '';
  if (dt.length < 100) thinDeconstructs++;
  if (dt.includes('is the legally mandated or structurally correct') || 
      dt.includes('misattributes authority, cites an incorrect')) {
    templateDeconstructs++;
  }
});
console.log('Thin deconstruct_text (<100 chars):', thinDeconstructs, '/', qs.length);
console.log('Templated deconstruct_text:', templateDeconstructs, '/', qs.length);
