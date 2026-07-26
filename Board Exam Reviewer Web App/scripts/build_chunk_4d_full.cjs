const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. ALPHABETICAL FILING (20 Questions: cle-fil-300 to 319)
// Government Agency Hierarchy Filing Rules
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `cle-fil-${num}`,
    subtopic_id: "alphabetical-filing",
    category_id: "clerical-ability",
    blueprint_id: `Government Agency Filing Rule Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under government indexing rules, official government agencies are filed first by the sovereign name 'Philippines', followed by department, then bureau. How should 'Department of Agriculture' be formally indexed?`,
    options: [
      { key: "A", text: "Philippines, Agriculture (Department of)" },
      { key: "B", text: "Department of Agriculture, Philippines" },
      { key: "C", text: "Agriculture Department, Philippines" },
      { key: "D", text: "Philippines, Department of Agriculture" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Country Name Unit", text: "First unit is always 'Philippines'." },
      { rung: 2, title: "Identify Key Department Name", text: "Second unit is the distinctive name ('Agriculture')." },
      { rung: 3, title: "Transpose Generic Words", text: "Generic words like 'Department of' are transposed to the end in parentheses." },
      { rung: 4, title: "Select Formal Indexing", text: "'Philippines, Agriculture (Department of)'." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Standard indexing: Country Name ➔ Distinctive Subject Name ➔ (Generic Title).", trap_type: null },
      "B": { text: "Failed to put country name first.", trap_type: "country_prefix_omission" },
      "C": { text: "Transposed words improperly without comma indexing.", trap_type: "improper_transposition" },
      "D": { text: "Failed to transpose generic 'Department of'.", trap_type: "untransposed_generic_word_error" }
    },
    next_time_rule: "Government Agency Indexing: Country Name ➔ Distinctive Keyword ➔ (Generic Words). E.g., 'Philippines, Health (Department of)'.",
    deconstruct_text: "Government Filing Rule:\nUnit 1: Philippines\nUnit 2: Agriculture\nUnit 3: (Department of)\nIndex: 'Philippines, Agriculture (Department of)'."
  });
}

// --------------------------------------------------------------------------
// 2. CODING & SPELLING (20 Questions: cle-code-300 to 319)
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `cle-code-${num}`,
    subtopic_id: "coding-spelling",
    category_id: "clerical-ability",
    blueprint_id: `Municipal Code Verification Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Verify the matching between Region Code and Province:\nCode: NCR-039-MNL\nRecord: NCR-039-MLN\n\nIs there a mismatch?`,
    options: [
      { key: "A", text: "Yes, 'MNL' vs 'MLN' (Letter transposition error)" },
      { key: "B", text: "No, both codes match perfectly" },
      { key: "C", text: "Yes, number 039 is incorrect" },
      { key: "D", text: "Yes, NCR prefix is incorrect" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Scan Block 1", text: "NCR = NCR (Match)." },
      { rung: 2, title: "Scan Block 2", text: "039 = 039 (Match)." },
      { rung: 3, title: "Scan Block 3", text: "MNL vs MLN (MISMATCH: N and L swapped)." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Letter transposition error in last block (MNL vs MLN).", trap_type: null },
      "B": { text: "Missed the transposed letter pair.", trap_type: "omitted_error_detection" },
      "C": { text: "Falsely identified error in middle block.", trap_type: "false_location_error" },
      "D": { text: "Falsely identified error in prefix block.", trap_type: "false_location_error" }
    },
    next_time_rule: "Alphanumeric Code Inspection: Check letter order as carefully as digit order.",
    deconstruct_text: "Verification Scan:\nBlock 3: 'MNL' vs 'MLN' ➔ Letter Transposition Error."
  });
}

// --------------------------------------------------------------------------
// 3. CLERICAL OPERATIONS (20 Questions: cle-clops-300 to 319)
// Record Cross-Matching Discrepancies
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `cle-clops-${num}`,
    subtopic_id: "clerical-operations",
    category_id: "clerical-ability",
    blueprint_id: `Record Cross-Matching Verification Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Cross-reference Form A with Form B:\nForm A Name: Santos, Maria Clara\nForm B Name: Santos, Maria Clara\nForm A Tax ID: 123-456-789\nForm B Tax ID: 123-456-798\n\nIs there a discrepancy between the records?`,
    options: [
      { key: "A", text: "Yes, Tax ID numbers do not match (789 vs 798)." },
      { key: "B", text: "No, both forms are completely identical." },
      { key: "C", text: "Yes, the names do not match." },
      { key: "D", text: "Yes, Form B is missing." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Check Name Fields", text: "Form A: Santos, Maria Clara = Form B: Santos, Maria Clara (Match)." },
      { rung: 2, title: "Check Tax ID Fields", text: "Form A: 123-456-789 vs Form B: 123-456-798 (MISMATCH)." },
      { rung: 3, title: "Identify Transposition", text: "Last digits swapped: 89 vs 98." },
      { rung: 4, title: "Select Option A", text: "Option A accurately describes the Tax ID mismatch." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Tax ID last 2 digits transposed (789 vs 798).", trap_type: null },
      "B": { text: "Missed the Tax ID discrepancy.", trap_type: "omitted_error_detection" },
      "C": { text: "Falsely identified error in name field.", trap_type: "false_location_error" },
      "D": { text: "Falsely asserted missing form.", trap_type: "false_statement_distractor" }
    },
    next_time_rule: "Record Verification: Cross-match every numerical identification field line-by-line.",
    deconstruct_text: "Cross-Match Analysis:\nName: Match\nTax ID: Mismatch (789 vs 798)."
  });
}

// --------------------------------------------------------------------------
// 4. TYPING SPEED & ACCURACY (15 Questions: cle-type-300 to 314)
// Accuracy Percentage Computations
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 300 + i;
  const totalTyped = 400 + (i * 10);
  const errors = 8;
  const correctTyped = totalTyped - errors;
  const accuracyPct = Number(((correctTyped / totalTyped) * 100).toFixed(1));

  addQ({
    id: `cle-type-${num}`,
    subtopic_id: "typing-speed-accuracy",
    category_id: "clerical-ability",
    blueprint_id: `Typing Accuracy Percentage Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A court stenographer typed ${totalTyped} total words with ${errors} typing errors. What is the stenographer's typing ACCURACY percentage?`,
    options: [
      { key: "A", text: `${accuracyPct}%` },
      { key: "B", text: `${Number(((errors / totalTyped) * 100).toFixed(1))}%` },
      { key: "C", text: `${accuracyPct - 5}%` },
      { key: "D", text: "100%" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Correct Words Typed", text: `Correct Words = ${totalTyped} - ${errors} = ${correctTyped} words.` },
      { rung: 2, title: "Form Accuracy Ratio", text: `Accuracy = (${correctTyped} / ${totalTyped}) × 100.` },
      { rung: 3, title: "Calculate Percentage", text: `${accuracyPct}%.` },
      { rung: 4, title: "Select Result", text: `Select Option A (${accuracyPct}%).` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Accuracy = ((${totalTyped} - ${errors}) / ${totalTyped}) × 100 = ${accuracyPct}%.`, trap_type: null },
      "B": { text: "Calculated error rate percentage instead of accuracy percentage.", trap_type: "error_vs_accuracy_confusion" },
      "C": { text: "Arithmetic calculation error.", trap_type: "arithmetic_error" },
      "D": { text: "Ignored errors completely.", trap_type: "omitted_error_step" }
    },
    next_time_rule: "Typing Accuracy % = [(Total Words - Errors) / Total Words] × 100.",
    deconstruct_text: `Accuracy Formula:\nCorrect Words = ${totalTyped} - ${errors} = ${correctTyped}\nAccuracy % = (${correctTyped} / ${totalTyped}) × 100 = ${accuracyPct}%.`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 4D (Clerical Ability)!`);

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
