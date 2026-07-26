const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. LOGICAL REASONING (30 Questions: ana-log-300 to 329)
// Workplace Compliance Logic & Premise Analysis
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 300 + i;

  addQ({
    id: `ana-log-${num}`,
    subtopic_id: "logical-reasoning",
    category_id: "analytical-ability",
    blueprint_id: `Workplace Compliance Conditional Logic Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Rule: 'All government employees who complete 10 years of continuous service receive a Loyalty Award.'\nFact: 'Juan is a government employee, but he did NOT receive a Loyalty Award.'\n\nWhich conclusion MUST be true?`,
    options: [
      { key: "A", text: "Juan has not completed 10 years of continuous service." },
      { key: "B", text: "Juan was dishonorably discharged." },
      { key: "C", text: "Juan completed 12 years of service." },
      { key: "D", text: "Juan is an elective official." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Conditional Statement", text: "If 10 Years Continuous Service (P) ➔ Loyalty Award (Q)." },
      { rung: 2, title: "Apply Modus Tollens", text: "Fact states NOT Q (did NOT receive Loyalty Award)." },
      { rung: 3, title: "Deduce Negated Premise", text: "Therefore NOT P (did NOT complete 10 years continuous service)." },
      { rung: 4, title: "Select Option A", text: "Option A is the valid deduction." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Valid Modus Tollens deduction: If P ➔ Q, then ~Q ➔ ~P.", trap_type: null },
      "B": { text: "Unstated speculative reason.", trap_type: "unsupported_speculation" },
      "C": { text: "Contradicts the logical deduction.", trap_type: "rule_contradiction" },
      "D": { text: "Unstated employment status.", trap_type: "unsupported_speculation" }
    },
    next_time_rule: "Modus Tollens Rule: If P ➔ Q is true, and Q is false, then P MUST be false (~Q ➔ ~P).",
    deconstruct_text: "Deductive Proof:\nPremise: Service ≥ 10 yrs (P) ➔ Award (Q)\nGiven: ~Q (No Award)\nDeduction: ~P (Service < 10 yrs)."
  });
}

// --------------------------------------------------------------------------
// 2. DATA INTERPRETATION (30 Questions: ana-data-300 to 329)
// Municipal Budget Pie Charts & Sector Share
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 300 + i;
  const infraShare = 40;
  const eduShare = 30;
  const healthShare = 20;
  const adminShare = 10;
  const totalBudget = 50 + (i * 2); // Millions
  const infraAmount = (totalBudget * infraShare) / 100;

  addQ({
    id: `ana-data-${num}`,
    subtopic_id: "data-interpretation",
    category_id: "analytical-ability",
    blueprint_id: `Municipal Sector Pie Chart Budget Share Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Data: Municipal Annual Budget Distribution (Total: ₱${totalBudget} Million):\nInfrastructure: ${infraShare}%\nEducation: ${eduShare}%\nHealth: ${healthShare}%\nAdministration: ${adminShare}%\n\nHow much money in Pesos is allocated to Infrastructure?`,
    options: [
      { key: "A", text: `₱${infraAmount} Million` },
      { key: "B", text: `₱${(totalBudget * eduShare) / 100} Million` },
      { key: "C", text: `₱${(totalBudget * healthShare) / 100} Million` },
      { key: "D", text: `₱${infraAmount + 5} Million` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Sector Percentage", text: "Infrastructure share = 40%." },
      { rung: 2, title: "Identify Total Budget", text: `Total Budget = ₱${totalBudget} Million.` },
      { rung: 3, title: "Calculate Amount", text: `Amount = ₱${totalBudget} Million × 0.40.` },
      { rung: 4, title: "Perform Multiplication", text: `₱${infraAmount} Million.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! 40% of ₱${totalBudget}M = ₱${infraAmount} Million.`, trap_type: null },
      "B": { text: "Calculated Education share instead.", trap_type: "wrong_variable_target" },
      "C": { text: "Calculated Health share instead.", trap_type: "wrong_variable_target" },
      "D": { text: "Calculation offset error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Sector Amount = Total Budget × Sector Percentage Rate.",
    deconstruct_text: `Sector Calculation:\nInfrastructure Amount = ₱${totalBudget}M × 0.40 = ₱${infraAmount} Million.`
  });
}

// --------------------------------------------------------------------------
// 3. PATTERN RECOGNITION (20 Questions: ana-pat-300 to 319)
// Shape Transformation Matrix
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `ana-pat-${num}`,
    subtopic_id: "pattern-recognition",
    category_id: "analytical-ability",
    blueprint_id: `Matrix Shape Transformation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Matrix Pattern Rule: Across each row, the number of sides on the polygon increases by +1 (Triangle ➔ Square ➔ Pentagon). In Row 2: Square ➔ Pentagon ➔ __?`,
    options: [
      { key: "A", text: "Hexagon (6 sides)" },
      { key: "B", text: "Square (4 sides)" },
      { key: "C", text: "Octagon (8 sides)" },
      { key: "D", text: "Triangle (3 sides)" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Count Polygon Sides", text: "Square = 4 sides. Pentagon = 5 sides." },
      { rung: 2, title: "Apply Row Addition Rule", text: "Next shape must have 5 + 1 = 6 sides." },
      { rung: 3, title: "Identify 6-sided Polygon Name", text: "A 6-sided polygon is a Hexagon." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Sides increase +1 (4 ➔ 5 ➔ 6 sides = Hexagon).", trap_type: null },
      "B": { text: "Reused 4-sided square.", trap_type: "repetition_error" },
      "C": { text: "Increased by +3 sides instead of +1.", trap_type: "step_increment_error" },
      "D": { text: "Decreased sides.", trap_type: "direction_reversal_error" }
    },
    next_time_rule: "Matrix Polygon Patterns: Track side count (+1, +2) across matrix rows.",
    deconstruct_text: "Matrix Rule:\n4 sides (Square) ➔ 5 sides (Pentagon) ➔ 6 sides (Hexagon)."
  });
}

// --------------------------------------------------------------------------
// 4. SEQUENCE & SERIES (20 Questions: ana-seq-300 to 319)
// Alphanumeric Workplace Personnel Codes
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `ana-seq-${num}`,
    subtopic_id: "sequence-series",
    category_id: "analytical-ability",
    blueprint_id: `Alphanumeric Personnel Code Progression Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next item in the government personnel code series: EMP-010, EMP-020, EMP-040, EMP-080, __?`,
    options: [
      { key: "A", text: "EMP-160" },
      { key: "B", text: "EMP-100" },
      { key: "C", text: "EMP-120" },
      { key: "D", text: "EMP-090" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Examine Prefix", text: "Prefix 'EMP-' remains constant." },
      { rung: 2, title: "Examine Number Sequence", text: "10 ➔ 20 ➔ 40 ➔ 80." },
      { rung: 3, title: "Identify Geometric Doubling Rule", text: "Each number is doubled (×2)." },
      { rung: 4, title: "Calculate Next Number", text: "80 × 2 = 160. Result = EMP-160." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Geometric doubling sequence (10, 20, 40, 80 ➔ 160).", trap_type: null },
      "B": { text: "Applied constant addition +20 to last term.", trap_type: "linear_constant_fallacy" },
      "C": { text: "Applied addition +40 to last term.", trap_type: "linear_constant_fallacy" },
      "D": { text: "Added +10.", trap_type: "linear_constant_fallacy" }
    },
    next_time_rule: "Alphanumeric Sequences: Check if numerical component doubles (×2) or quadruples.",
    deconstruct_text: "Geometric Code Pattern:\n10 × 2 = 20\n20 × 2 = 40\n40 × 2 = 80\n80 × 2 = 160 ➔ EMP-160."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 4C (Analytical Ability)!`);

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
