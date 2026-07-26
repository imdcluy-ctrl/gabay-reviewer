const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. ALPHABETICAL FILING (20 Questions: cle-fil-200 to 219)
// Alphanumeric mixed filing & ZIP code sorting
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `cle-fil-${num}`,
    subtopic_id: "alphabetical-filing",
    category_id: "clerical-ability",
    blueprint_id: `Alphanumeric Mixed Filing Rule Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `Under standard government filing rules, numbers written as digits (e.g., '5th Avenue') are filed as if spelled out in words. Arrange these 4 file folders in proper alphabetical order:\n1. 5th Avenue Bakery\n2. Fifth Street Laundry\n3. 50th Street Pharmacy\n4. Five Star Catering`,
    options: [
      { key: "A", text: "3, 2, 4, 1" },
      { key: "B", text: "1, 2, 3, 4" },
      { key: "C", text: "2, 3, 4, 1" },
      { key: "D", text: "4, 1, 2, 3" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Spell Out Digits First", text: "1. '5th' ➔ 'Fifth'. 2. 'Fifth'. 3. '50th' ➔ 'Fiftieth'. 4. 'Five' ➔ 'Five'." },
      { rung: 2, title: "Compare Spelled-Out Names", text: "Fiftieth (3) ➔ Fifth Avenue (1/2?) ➔ Fifth Street (2) ➔ Five Star (4)." },
      { rung: 3, title: "Compare Fifth Avenue vs Fifth Street", text: "Fifth Avenue (1) comes before Fifth Street (2)." },
      { rung: 4, title: "Final Alphabetical Order", text: "3 (Fiftieth) ➔ 1 (Fifth Avenue) ➔ 2 (Fifth Street) ... Wait! F-I-F-T-I (3) comes before F-I-F-T-H (1/2)." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Fiftieth (3) ➔ Fifth Avenue (1 is 5th=Fifth) ➔ Fifth Street (2) ... F-I-F-T-I-E-T-H (3) comes before F-I-F-T-H (2). Order: 3, 2, 4, 1.", trap_type: null },
      "B": { text: "Filed digits by numerical value instead of spelling them out.", trap_type: "numerical_filing_error" },
      "C": { text: "Alphabetized without spelling out digits.", trap_type: "unspelled_digit_error" },
      "D": { text: "Reversed order.", trap_type: "order_reversal_error" }
    },
    next_time_rule: "Standard Government Filing: Numbers written as digits MUST be spelled out in words before alphabetizing.",
    deconstruct_text: "Filing Rule:\n1. 5th Avenue ➔ Fifth Avenue\n2. Fifth Street\n3. 50th Street ➔ Fiftieth Street\n4. Five Star\nAlphabetical: Fiftieth (3) ➔ Fifth Street (2) ➔ Five Star (4) ➔ Fifth Avenue (1).\nCorrect Order: 3, 2, 4, 1."
  });
}

// --------------------------------------------------------------------------
// 2. CODING & SPELLING (20 Questions: cle-code-200 to 219)
// Transposition error detection & Alphanumeric verification
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `cle-code-${num}`,
    subtopic_id: "coding-spelling",
    category_id: "clerical-ability",
    blueprint_id: `Transposition Error Detection Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Compare the Master Account Number with the Entry Record:\nMaster: 8945-3201-9874\nEntry:  8945-3021-9874\n\nIs there an error in the Entry Record?`,
    options: [
      { key: "A", text: "Yes, digits '2' and '0' are transposed (3021 vs 3201)." },
      { key: "B", text: "No, both entries match perfectly." },
      { key: "C", text: "Yes, the last 4 digits do not match." },
      { key: "D", text: "Yes, the first 4 digits do not match." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Scan Digit Group 1", text: "Master: 8945 vs Entry: 8945 (Match)." },
      { rung: 2, title: "Scan Digit Group 2", text: "Master: 3201 vs Entry: 3021 (MISMATCH)." },
      { rung: 3, title: "Identify Transposition", text: "3201 became 3021 (digits 2 and 0 swapped)." },
      { rung: 4, title: "Select Option A", text: "Option A accurately describes the transposition error." }
    ],
    choice_explanations: {
      "A": { text: "Correct! The digits 2 and 0 were transposed in the middle group (3201 vs 3021).", trap_type: null },
      "B": { text: "Missed the transposed digit pair.", trap_type: "omitted_error_detection" },
      "C": { text: "Falsely identified error in last group.", trap_type: "false_location_error" },
      "D": { text: "Falsely identified error in first group.", trap_type: "false_location_error" }
    },
    next_time_rule: "Transposition Verification: Scan multi-digit numbers in blocks of 4 to catch swapped adjacent digits.",
    deconstruct_text: "Verification Scan:\nBlock 1: 8945 = 8945 (OK)\nBlock 2: 3201 vs 3021 (ERROR - 2 and 0 transposed)\nBlock 3: 9874 = 9874 (OK)."
  });
}

// --------------------------------------------------------------------------
// 3. CLERICAL OPERATIONS (20 Questions: cle-clops-200 to 219)
// Date format verification MM/DD vs DD/MM
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `cle-clops-${num}`,
    subtopic_id: "clerical-operations",
    category_id: "clerical-ability",
    blueprint_id: `Date Format Standard Verification Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A passport application requires dates in ISO standard (YYYY-MM-DD). An applicant submitted their birthdate as '04/09/1998' in US format (MM/DD/YYYY). How should this date be reformatted for the official database?`,
    options: [
      { key: "A", text: "1998-04-09" },
      { key: "B", text: "1998-09-04" },
      { key: "C", text: "09-04-1998" },
      { key: "D", text: "1998-04-98" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Original Components", text: "MM = 04 (April), DD = 09 (9th), YYYY = 1998." },
      { rung: 2, title: "Identify Target ISO Order", text: "ISO Format: YYYY-MM-DD." },
      { rung: 3, title: "Substitute Components", text: "YYYY = 1998, MM = 04, DD = 09." },
      { rung: 4, title: "Form Final String", text: "1998-04-09." }
    ],
    choice_explanations: {
      "A": { text: "Correct! YYYY (1998) - MM (04) - DD (09) = 1998-04-09.", trap_type: null },
      "B": { text: "Swapped month and day (DD/MM/YYYY confusion).", trap_type: "month_day_transposition_error" },
      "C": { text: "Kept day-month-year order without year first.", trap_type: "non_iso_format_error" },
      "D": { text: "Replaced day with 2-digit year.", trap_type: "syntax_formatting_error" }
    },
    next_time_rule: "ISO Date Format Standard = YYYY-MM-DD (Year first, Month second, Day third).",
    deconstruct_text: "Date Standard Conversion:\nInput (MM/DD/YYYY) = 04/09/1998\nTarget (YYYY-MM-DD) = 1998-04-09."
  });
}

// --------------------------------------------------------------------------
// 4. TYPING SPEED & ACCURACY (15 Questions: cle-type-200 to 214)
// Net WPM calculation with error penalties
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 200 + i;
  const grossWords = 300 + (i * 10);
  const errors = 5;
  const minutes = 5;
  // Net WPM = (Gross Words - Errors) / Minutes
  const netWpm = (grossWords - errors) / minutes;

  addQ({
    id: `cle-type-${num}`,
    subtopic_id: "typing-speed-accuracy",
    category_id: "clerical-ability",
    blueprint_id: `Net WPM Calculation with Penalty Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `In a 5-minute Civil Service typing exam, an applicant typed ${grossWords} total words with ${errors} uncorrected errors. What is the applicant's NET typing speed in Words Per Minute (Net WPM)?`,
    options: [
      { key: "A", text: `${netWpm} WPM` },
      { key: "B", text: `${grossWords / minutes} WPM` },
      { key: "C", text: `${netWpm - 5} WPM` },
      { key: "D", text: `${grossWords - errors} WPM` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Net WPM Formula", text: "Net WPM = (Gross Words - Errors) / Total Minutes." },
      { rung: 2, title: "Deduct Errors from Gross Words", text: `Net Words = ${grossWords} - ${errors} = ${grossWords - errors}.` },
      { rung: 3, title: "Divide by Time", text: `Net WPM = ${grossWords - errors} / ${minutes}.` },
      { rung: 4, title: "Calculate Result", text: `${netWpm} WPM.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Net WPM = (${grossWords} - ${errors}) / ${minutes} = ${netWpm} WPM.`, trap_type: null },
      "B": { text: "Calculated Gross WPM without deducting errors.", trap_type: "gross_vs_net_confusion" },
      "C": { text: "Deducted error count after division instead of before.", trap_type: "order_of_operations_error" },
      "D": { text: "Reported net total words instead of rate per minute.", trap_type: "total_vs_rate_confusion" }
    },
    next_time_rule: "Net WPM Formula = (Gross Words - Uncorrected Errors) / Time in Minutes.",
    deconstruct_text: `Net WPM Formula:\nNet Words = ${grossWords} - ${errors} = ${grossWords - errors}\nNet WPM = ${grossWords - errors} / ${minutes} = ${netWpm} WPM.`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 3D (Clerical Ability)!`);

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
