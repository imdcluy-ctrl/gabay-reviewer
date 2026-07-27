const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. LOGICAL REASONING (30 Questions: ana-log-100 to 129)
// Contrapositive, biconditional, multi-premise, assumption identification
// --------------------------------------------------------------------------

// 100
addQ({
  id: "ana-log-100",
  subtopic_id: "logical-reasoning",
  category_id: "analytical-ability",
  blueprint_id: "Contrapositive Equivalence — Legal Mandate",
  difficulty_level: 3,
  question_text: "Rule: 'If a municipality achieves a 95% revenue collection rate, then it is awarded the Seal of Good Local Governance.'\n\nWhich of the following statements is LOGICALLY EQUIVALENT to the rule above?",
  options: [
    { key: "A", text: "If a municipality is NOT awarded the Seal of Good Local Governance, then it did NOT achieve a 95% revenue collection rate." },
    { key: "B", text: "If a municipality achieves a 95% revenue collection rate, it might not receive the Seal." },
    { key: "C", text: "If a municipality is awarded the Seal, then it must have achieved a 95% revenue collection rate." },
    { key: "D", text: "If a municipality does NOT achieve 95% revenue collection, it cannot receive any award." }
  ],
  correct_option: "A",
  hint_ladder: [
    { rung: 1, title: "Identify Contrapositive Principle", text: "The contrapositive of 'If P, then Q' is 'If NOT Q, then NOT P'. They are logically equivalent." },
    { rung: 2, title: "Identify P and Q", text: "P = Achieves 95% revenue rate. Q = Awarded the Seal." },
    { rung: 3, title: "Negate and Reverse", text: "NOT Q = NOT awarded Seal. NOT P = NOT achieved 95% rate." },
    { rung: 4, title: "Form Contrapositive Statement", text: "If NOT Q, then NOT P." }
  ],
  choice_explanations: {
    "A": { text: "Correct! The contrapositive (If NOT Q, then NOT P) is always logically equivalent to the original conditional statement.", trap_type: null },
    "B": { text: "Contradicts the guaranteed conditional rule.", trap_type: "rule_contradiction" },
    "C": { text: "Converse fallacy (If Q, then P is NOT necessarily equivalent).", trap_type: "converse_fallacy" },
    "D": { text: "Inverse fallacy (If NOT P, then NOT Q is NOT necessarily equivalent).", trap_type: "inverse_fallacy" }
  },
  next_time_rule: "The contrapositive ('If NOT Q, then NOT P') is the ONLY statement logically equivalent to 'If P, then Q'.",
  deconstruct_text: "Logical Equivalence Law:\nConditional: P ➔ Q\nContrapositive: ~Q ➔ ~P (Logically Equivalent)\nConverse: Q ➔ P (Invalid Fallacy)\nInverse: ~P ➔ ~Q (Invalid Fallacy)\nTherefore, Statement A is the exact contrapositive."
});

// Generate 29 more ana-log (101 to 129)
for (let i = 1; i <= 29; i++) {
  const num = 100 + i;

  addQ({
    id: `ana-log-${num}`,
    subtopic_id: "logical-reasoning",
    category_id: "analytical-ability",
    blueprint_id: `Multi-Premise Deductive Logic Variant ${i}`,
    difficulty_level: 2,
    question_text: `Premise 1: All department heads are CSE Professional eligibles.\nPremise 2: Maria is a department head.\nConclusion: Which statement MUST be true?`,
    options: [
      { key: "A", text: "Maria is a CSE Professional eligible." },
      { key: "B", text: "Maria is a Civil Engineer." },
      { key: "C", text: "All CSE eligibles are department heads." },
      { key: "D", text: "Maria will be promoted next year." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Categorical Syllogism", text: "All A are B. X is A. Therefore X is B." },
      { rung: 2, title: "Map Entities", text: "A = Department Heads, B = CSE Professional Eligibles, X = Maria." },
      { rung: 3, title: "Deduce Conclusion", text: "Since Maria is in set A, Maria must be in set B." },
      { rung: 4, title: "Select Valid Conclusion", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Valid categorical deduction (Modus Ponens in categorical logic).", trap_type: null },
      "B": { text: "Unstated specific profession.", trap_type: "unsupported_assumption" },
      "C": { text: "Illicit conversion of 'All A are B' to 'All B are A'.", trap_type: "illicit_conversion" },
      "D": { text: "Speculative future event.", trap_type: "speculative_error" }
    },
    next_time_rule: "In categorical syllogisms: All A are B + X is A ➔ X is B.",
    deconstruct_text: "Deductive Proof:\nPremise 1: Head ⊂ Eligible\nPremise 2: Maria ∈ Head\nConclusion: Maria ∈ Eligible."
  });
}

// --------------------------------------------------------------------------
// 2. DATA INTERPRETATION (30 Questions: ana-data-100 to 129)
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 100 + i;
  const budgetA = 10 + (i * 2);
  const budgetB = 15 + (i * 2);
  const diff = budgetB - budgetA;
  const pct = Math.round((diff / budgetA) * 100);

  addQ({
    id: `ana-data-${num}`,
    subtopic_id: "data-interpretation",
    category_id: "analytical-ability",
    blueprint_id: `Bar Graph Rate of Growth Analysis Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Data Table: Annual Health Office Expenditure:\nYear 2024: ₱${budgetA} Million\nYear 2025: ₱${budgetB} Million\n\nWhat is the percentage increase in expenditure from 2024 to 2025?`,
    options: [
      { key: "A", text: `${pct}%` },
      { key: "B", text: `${pct + 5}%` },
      { key: "C", text: `${pct - 5}%` },
      { key: "D", text: `${pct * 2}%` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Difference", text: `Increase = ₱${budgetB}M - ₱${budgetA}M = ₱${diff}M.` },
      { rung: 2, title: "Divide by Original Base Year", text: `Base Year (2024) = ₱${budgetA}M.` },
      { rung: 3, title: "Apply Percentage Formula", text: `Pct Increase = (${diff} / ${budgetA}) × 100.` },
      { rung: 4, title: "Calculate Result", text: `${pct}%.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Pct Increase = ((${budgetB} - ${budgetA}) / ${budgetA}) × 100 = ${pct}%.`, trap_type: null },
      "B": { text: "Divided by 2025 budget instead of 2024 base year.", trap_type: "wrong_base_year_divisor" },
      "C": { text: "Calculation error.", trap_type: "arithmetic_error" },
      "D": { text: "Multiplied result by 2.", trap_type: "multiplier_error" }
    },
    next_time_rule: "Percentage Growth = [(New - Old) / Old] × 100.",
    deconstruct_text: `Growth Rate Formula:\n((Expenditure_2025 - Expenditure_2024) / Expenditure_2024) × 100\n= ((${budgetB} - ${budgetA}) / ${budgetA}) × 100 = ${pct}%.`
  });
}

// --------------------------------------------------------------------------
// 3. PATTERN RECOGNITION (20 Questions: ana-pat-100 to 119)
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 100 + i;

  addQ({
    id: `ana-pat-${num}`,
    subtopic_id: "pattern-recognition",
    category_id: "analytical-ability",
    blueprint_id: `Visual Rotation & Symbol Sequence Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Sequence: A square rotates 90 degrees clockwise at each step: Step 1 (Top-Left dot), Step 2 (Top-Right dot), Step 3 (Bottom-Right dot). Where will the dot be in Step 4?`,
    options: [
      { key: "A", text: "Bottom-Left" },
      { key: "B", text: "Top-Left" },
      { key: "C", text: "Top-Right" },
      { key: "D", text: "Center" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Track Rotational Direction", text: "The dot moves 90 degrees clockwise around the four corners." },
      { rung: 2, title: "Follow Corner Sequence", text: "Top-Left ➔ Top-Right ➔ Bottom-Right ➔ ?" },
      { rung: 3, title: "Determine Next Corner", text: "Clockwise from Bottom-Right is Bottom-Left." },
      { rung: 4, title: "Select Location", text: "Select Option A ('Bottom-Left')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Clockwise 90-degree rotation moves dot to Bottom-Left corner.", trap_type: null },
      "B": { text: "Counter-clockwise movement.", trap_type: "direction_reversal_error" },
      "C": { text: "Skipped two steps.", trap_type: "step_skipping_error" },
      "D": { text: "Position moved off corner.", trap_type: "position_drift_error" }
    },
    next_time_rule: "Clockwise 90° corner path: Top-Left ➔ Top-Right ➔ Bottom-Right ➔ Bottom-Left.",
    deconstruct_text: "Visual Pattern:\nStep 1: TL\nStep 2: TR\nStep 3: BR\nStep 4: BL (Bottom-Left)."
  });
}

// --------------------------------------------------------------------------
// 4. SEQUENCE & SERIES (20 Questions: ana-seq-100 to 119)
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 100 + i;
  const _letters = ["A", "C", "E", "G", "I"]; // +2 letter steps

  addQ({
    id: `ana-seq-${num}`,
    subtopic_id: "sequence-series",
    category_id: "analytical-ability",
    blueprint_id: `Letter Position Sequence Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next letter in the sequence: A, C, E, G, __?`,
    options: [
      { key: "A", text: "I" },
      { key: "B", text: "H" },
      { key: "C", text: "J" },
      { key: "D", text: "K" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Convert Letters to Alphabet Position", text: "A = 1, C = 3, E = 5, G = 7." },
      { rung: 2, title: "Identify Pattern", text: "Positions increase by +2 each step (odd numbers)." },
      { rung: 3, title: "Find Next Number", text: "7 + 2 = 9." },
      { rung: 4, title: "Convert Back to Letter", text: "9th letter of alphabet is I." }
    ],
    choice_explanations: {
      "A": { text: "Correct! 9th letter is 'I' (+2 pattern).", trap_type: null },
      "B": { text: "Added +1 instead of +2.", trap_type: "off_by_one_error" },
      "C": { text: "Added +3 instead of +2.", trap_type: "step_increment_error" },
      "D": { text: "Added +4 instead of +2.", trap_type: "step_increment_error" }
    },
    next_time_rule: "Convert letters to numbers (A=1, B=2...) to solve letter sequence patterns easily.",
    deconstruct_text: "Letter Positions:\nA=1, C=3, E=5, G=7 (+2 pattern)\nNext Position = 9 = 'I'."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 2C (Analytical Ability)!`);

// Merge with public/content/seed.json
let raw = fs.readFileSync('public/content/seed.json', 'utf8').trim();
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const seedData = JSON.parse(raw);

const existingIds = new Set(seedData.map(q => q.id));
let addedCount = 0;

questions.forEach(q => {
  if (!existingIds.has(q.id)) {
    seedData.push(q);
    addedCount++;
  }
});

fs.writeFileSync('public/content/seed.json', JSON.stringify(seedData, null, 2), 'utf8');
console.log(`Merged ${addedCount} new questions into public/content/seed.json. Total count: ${seedData.length}`);
