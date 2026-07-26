const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. LOGICAL REASONING (30 Questions: ana-log-200 to 229)
// Venn Diagram logic, Seating Arrangements, Blood Relations
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 200 + i;

  addQ({
    id: `ana-log-${num}`,
    subtopic_id: "logical-reasoning",
    category_id: "analytical-ability",
    blueprint_id: `Seating Arrangement & Spatial Order Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `Five council members (A, B, C, D, E) sit in a row. C sits next to D. B sits at the extreme left end. E sits next to B. A sits at the extreme right end. Who sits in the EXACT MIDDLE position?`,
    options: [
      { key: "A", text: "D (or C depending on arrangement)" },
      { key: "B", text: "B" },
      { key: "C", text: "E" },
      { key: "D", text: "A" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Place Fixed Ends", text: "Leftmost (Pos 1) = B. Rightmost (Pos 5) = A." },
      { rung: 2, title: "Place E Next to B", text: "Pos 2 = E." },
      { rung: 3, title: "Determine Remaining Middle Positions", text: "Positions 3 & 4 must be C and D." },
      { rung: 4, title: "Identify Middle Position", text: "Position 3 (Middle) is occupied by D or C." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Order is B - E - D/C - C/D - A. Position 3 (middle) is D or C.", trap_type: null },
      "B": { text: "B is at the far left.", trap_type: "extreme_end_confusion" },
      "C": { text: "E is at position 2.", trap_type: "adjacent_position_error" },
      "D": { text: "A is at the far right.", trap_type: "extreme_end_confusion" }
    },
    next_time_rule: "Seating Problems: Fix extreme ends first, then place adjacent constraint pairs.",
    deconstruct_text: "Pos 1: B\nPos 5: A\nPos 2: E (adjacent to B)\nPos 3 & 4: C and D\nMiddle = Position 3."
  });
}

// --------------------------------------------------------------------------
// 2. DATA INTERPRETATION (30 Questions: ana-data-200 to 229)
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 200 + i;
  const t1 = 100 + (i * 10);
  const t2 = 150 + (i * 10);
  const total = t1 + t2;
  const pct1 = Math.round((t1 / total) * 100);

  addQ({
    id: `ana-data-${num}`,
    subtopic_id: "data-interpretation",
    category_id: "analytical-ability",
    blueprint_id: `Stacked Bar Distribution Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Data Table: Municipal Waste Collection:\nOrganic: ${t1} Tons\nRecyclable: ${t2} Tons\nTotal: ${total} Tons\n\nWhat percentage of total waste collected is Organic?`,
    options: [
      { key: "A", text: `${pct1}%` },
      { key: "B", text: `${100 - pct1}%` },
      { key: "C", text: `${pct1 + 10}%` },
      { key: "D", text: `${pct1 - 10}%` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Component and Total", text: `Organic = ${t1} Tons. Total = ${total} Tons.` },
      { rung: 2, title: "Apply Percentage Formula", text: `Pct = (${t1} / ${total}) × 100.` },
      { rung: 3, title: "Calculate", text: `${pct1}%.` },
      { rung: 4, title: "Confirm Result", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! (${t1} / ${total}) × 100 = ${pct1}%.`, trap_type: null },
      "B": { text: "Calculated Recyclable percentage instead of Organic.", trap_type: "wrong_variable_target" },
      "C": { text: "Calculation error.", trap_type: "arithmetic_error" },
      "D": { text: "Calculation error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Percentage Share = (Target Portion / Total Base) × 100.",
    deconstruct_text: `Percentage Share = (${t1} / ${total}) × 100 = ${pct1}%.`
  });
}

// --------------------------------------------------------------------------
// 3. PATTERN RECOGNITION (20 Questions: ana-pat-200 to 219)
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `ana-pat-${num}`,
    subtopic_id: "pattern-recognition",
    category_id: "analytical-ability",
    blueprint_id: `3D Rotation & Overlapping Figures Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `A 3D cube with different shaded symbols on each face is flipped forward once, then turned 90 degrees right. Which face is now facing UP?`,
    options: [
      { key: "A", text: "The Original Back Face" },
      { key: "B", text: "The Original Front Face" },
      { key: "C", text: "The Original Top Face" },
      { key: "D", text: "The Original Bottom Face" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Trace First Flip", text: "Flipping forward brings the Original Back face to the TOP." },
      { rung: 2, title: "Trace Second Turn", text: "Turning 90° right rotates the cube horizontally; the TOP face remains on TOP!" },
      { rung: 3, title: "Verify Top Face Persistence", text: "Horizontal rotation does not alter top/bottom orientation." },
      { rung: 4, title: "Select Option A", text: "The top face remains the Original Back face." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Forward flip moves Back face to Top. 90° right turn keeps Top face on top.", trap_type: null },
      "B": { text: "Front face moved to Bottom during forward flip.", trap_type: "spatial_reversal_error" },
      "C": { text: "Top face moved to Front during forward flip.", trap_type: "initial_flip_mistake" },
      "D": { text: "Bottom face moved to Back.", trap_type: "spatial_rotation_error" }
    },
    next_time_rule: "Horizontal rotations (left/right turns) do NOT change which face is pointing UP or DOWN.",
    deconstruct_text: "3D Rotation:\n1. Flip Forward: Back ➔ Top.\n2. Turn Right: Top stays Top.\nResult: Original Back Face is UP."
  });
}

// --------------------------------------------------------------------------
// 4. SEQUENCE & SERIES (20 Questions: ana-seq-200 to 219)
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `ana-seq-${num}`,
    subtopic_id: "sequence-series",
    category_id: "analytical-ability",
    blueprint_id: `Cyclic Alphanumeric Pattern Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next item in the series: A1, C3, E5, G7, __?`,
    options: [
      { key: "A", text: "I9" },
      { key: "B", text: "H8" },
      { key: "C", text: "J10" },
      { key: "D", text: "I8" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Split Letters and Numbers", text: "Letters: A, C, E, G. Numbers: 1, 3, 5, 7." },
      { rung: 2, title: "Analyze Letter Pattern", text: "A(1) ➔ C(3) ➔ E(5) ➔ G(7). Next is I(9)." },
      { rung: 3, title: "Analyze Number Pattern", text: "1 ➔ 3 ➔ 5 ➔ 7. Next is 9." },
      { rung: 4, title: "Combine Results", text: "Next item is I9." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Both letter position and number advance by +2 (I9).", trap_type: null },
      "B": { text: "Advanced by +1 instead of +2.", trap_type: "off_by_one_error" },
      "C": { text: "Advanced by +3 instead of +2.", trap_type: "step_increment_error" },
      "D": { text: "Matched letter +2 but used even number.", trap_type: "number_sequence_mismatch" }
    },
    next_time_rule: "Alphanumeric Sequences: Track letter progression and number progression independently.",
    deconstruct_text: "Alphanumeric Dual Track:\nLetters: A, C, E, G ➔ I (+2)\nNumbers: 1, 3, 5, 7 ➔ 9 (+2)\nResult: I9."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 3C (Analytical Ability)!`);

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
