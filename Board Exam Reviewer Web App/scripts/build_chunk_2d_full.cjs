const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. ALPHABETICAL FILING (20 Questions: cle-fil-100 to 119)
// Business names, hyphenated names, prefixes, government agency names
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 100 + i;

  addQ({
    id: `cle-fil-${num}`,
    subtopic_id: "alphabetical-filing",
    category_id: "clerical-ability",
    blueprint_id: `Alphabetical Filing Rule — Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Arrange the following 4 official document records in correct alphabetical order:\n1. De la Cruz, Juan\n2. Del Rosario, Maria\n3. De Castro, Ana\n4. Dela Peña, Pedro`,
    options: [
      { key: "A", text: "3, 1, 4, 2" },
      { key: "B", text: "1, 2, 3, 4" },
      { key: "C", text: "3, 4, 1, 2" },
      { key: "D", text: "4, 3, 2, 1" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Prefixes Rule", text: "Filing rules treat prefixes (De, Del, Dela) as part of the surname." },
      { rung: 2, title: "Compare Letter by Letter", text: "De Castro (D-E-C) comes before De la Cruz (D-E-L-A-C)." },
      { rung: 3, title: "Compare Remaining Names", text: "Dela Peña (D-E-L-A-P) comes after De la Cruz, and Del Rosario (D-E-L-R) comes last." },
      { rung: 4, title: "Final Order", text: "3 (De Castro) ➔ 1 (De la Cruz) ➔ 4 (Dela Peña) ➔ 2 (Del Rosario)." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Order: De Castro (3) ➔ De la Cruz (1) ➔ Dela Peña (4) ➔ Del Rosario (2).", trap_type: null },
      "B": { text: "Ignored alphabetical order of first letters in prefix.", trap_type: "prefix_letter_comparison_error" },
      "C": { text: "Swapped Dela Peña and De la Cruz.", trap_type: "letter_position_swap_error" },
      "D": { text: "Reversed correct order.", trap_type: "order_reversal_error" }
    },
    next_time_rule: "Compare names letter-by-letter starting from the first letter of the prefix (De, Del, Dela).",
    deconstruct_text: "Filing Rule:\nCompare letter-by-letter:\n1. De Castro (d-e-c)\n2. De la Cruz (d-e-l-a-c)\n3. Dela Peña (d-e-l-a-p)\n4. Del Rosario (d-e-l-r)\nCorrect Order: 3, 1, 4, 2."
  });
}

// --------------------------------------------------------------------------
// 2. CODING & SPELLING (20 Questions: cle-code-100 to 119)
// Commonly confused words (affect/effect, principal/principle)
// --------------------------------------------------------------------------
const confusedWords = [
  { word: "affect", wrong: "effect", sent: "The new tax policy will directly __ small business owners." },
  { word: "principal", wrong: "principle", sent: "Mr. Santos is the __ architect of the municipal urban plan." },
  { word: "council", wrong: "counsel", sent: "The city __ voted unanimously to pass the ordinance." },
  { word: "adverse", wrong: "averse", sent: "Heavy rain had an __ effect on the road construction schedule." }
];

for (let i = 0; i < 20; i++) {
  const num = 100 + i;
  const item = confusedWords[i % confusedWords.length];

  addQ({
    id: `cle-code-${num}`,
    subtopic_id: "coding-spelling",
    category_id: "clerical-ability",
    blueprint_id: `Commonly Confused Words — ${item.word.toUpperCase()}`,
    difficulty_level: 2,
    question_text: `Choose the correctly spelled word to complete the sentence: '${item.sent}'`,
    options: [
      { key: "A", text: item.word },
      { key: "B", text: item.wrong },
      { key: "C", text: item.word + "ed" },
      { key: "D", text: item.wrong + "s" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Word Class", text: "Determine whether a verb, noun, or adjective is required." },
      { rung: 2, title: "Distinguish Confused Pair", text: `'${item.word}' vs '${item.wrong}'.` },
      { rung: 3, title: "Match Context Meaning", text: `The context requires '${item.word}'.` },
      { rung: 4, title: "Select Word", text: `Select Option A ('${item.word}').` }
    ],
    choice_explanations: {
      "A": { text: `Correct! '${item.word}' is the appropriate term for this context.`, trap_type: null },
      "B": { text: `Confused with homophone/paronym '${item.wrong}'.`, trap_type: "homophone_confusion" },
      "C": { text: "Incorrect inflection.", trap_type: "inflection_error" },
      "D": { text: "Incorrect plural/inflection.", trap_type: "plural_error" }
    },
    next_time_rule: `Understand the precise difference between '${item.word}' and '${item.wrong}'.`,
    deconstruct_text: `Spelling & Vocabulary Rule:\nContext specifies '${item.word}'. '${item.wrong}' has a distinct separate meaning.`
  });
}

// --------------------------------------------------------------------------
// 3. CLERICAL OPERATIONS (20 Questions: cle-clops-100 to 119)
// Invoice & payroll discrepancy
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 100 + i;
  const qty = 10 + i;
  const unitPrice = 250;
  const expectedTotal = qty * unitPrice;
  const DiscrepancyTotal = expectedTotal + 500;

  addQ({
    id: `cle-clops-${num}`,
    subtopic_id: "clerical-operations",
    category_id: "clerical-ability",
    blueprint_id: `Invoice Discrepancy Verification Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A clerk is auditing a supplier invoice for ${qty} office chairs priced at ₱${unitPrice} per unit. The invoice total lists ₱${DiscrepancyTotal.toLocaleString()}. What is the variance between the invoice total and the actual computed total?`,
    options: [
      { key: "A", text: "₱500 overcharge" },
      { key: "B", text: "₱500 undercharge" },
      { key: "C", text: "₱250 overcharge" },
      { key: "D", text: "₱0 (No variance)" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Calculate Expected Total", text: `Expected Total = ${qty} units × ₱${unitPrice} = ₱${expectedTotal.toLocaleString()}.` },
      { rung: 2, title: "Compare with Listed Invoice Total", text: `Listed Invoice Total = ₱${DiscrepancyTotal.toLocaleString()}.` },
      { rung: 3, title: "Compute Difference", text: `Difference = ₱${DiscrepancyTotal.toLocaleString()} - ₱${expectedTotal.toLocaleString()} = ₱500.` },
      { rung: 4, title: "Determine Direction of Variance", text: "Since invoice > expected, it is a ₱500 overcharge." }
    ],
    choice_explanations: {
      "A": { text: `Correct! Expected = ${qty} × 250 = ₱${expectedTotal.toLocaleString()}. Invoice lists ₱${DiscrepancyTotal.toLocaleString()}, which is ₱500 overcharge.`, trap_type: null },
      "B": { text: "Misidentified overcharge as undercharge.", trap_type: "variance_direction_error" },
      "C": { text: "Calculated one unit price as variance.", trap_type: "single_unit_variance_error" },
      "D": { text: "Failed to notice the arithmetic mismatch.", trap_type: "omitted_verification_error" }
    },
    next_time_rule: "Invoice Verification: Expected Total = Qty × Unit Price. Variance = Listed Invoice - Expected Total.",
    deconstruct_text: `Computation:\nExpected Total = ${qty} × ₱250 = ₱${expectedTotal.toLocaleString()}\nListed Invoice = ₱${DiscrepancyTotal.toLocaleString()}\nVariance = ₱${DiscrepancyTotal - expectedTotal} overcharge.`
  });
}

// --------------------------------------------------------------------------
// 4. TYPING SPEED & ACCURACY (15 Questions: cle-type-100 to 114)
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 100 + i;
  const words = 250 + (i * 10);
  const minutes = 5;
  const wpm = words / minutes;

  addQ({
    id: `cle-type-${num}`,
    subtopic_id: "typing-speed-accuracy",
    category_id: "clerical-ability",
    blueprint_id: `Words Per Minute (WPM) Calculation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A data entry clerk typed a ${words}-word government report in ${minutes} minutes. What is the clerk's gross typing speed in words per minute (WPM)?`,
    options: [
      { key: "A", text: `${wpm} WPM` },
      { key: "B", text: `${wpm - 10} WPM` },
      { key: "C", text: `${wpm + 10} WPM` },
      { key: "D", text: `${words} WPM` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify WPM Formula", text: "WPM = Total Words / Total Minutes." },
      { rung: 2, title: "Insert Values", text: `WPM = ${words} words / ${minutes} minutes.` },
      { rung: 3, title: "Perform Division", text: `${words} / ${minutes} = ${wpm}.` },
      { rung: 4, title: "Select Result", text: `Select Option A (${wpm} WPM).` }
    ],
    choice_explanations: {
      "A": { text: `Correct! WPM = ${words} / ${minutes} = ${wpm} WPM.`, trap_type: null },
      "B": { text: "Subtracted arbitrary error penalty without error count.", trap_type: "unwarranted_deduction_error" },
      "C": { text: "Added speed bonus.", trap_type: "arithmetic_error" },
      "D": { text: "Reported total words instead of per-minute rate.", trap_type: "total_vs_rate_confusion" }
    },
    next_time_rule: "Gross Typing Speed (WPM) = Total Words Typed / Total Time in Minutes.",
    deconstruct_text: `WPM Calculation:\nGross WPM = ${words} words / ${minutes} minutes = ${wpm} WPM.`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 2D (Clerical Ability)!`);

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
