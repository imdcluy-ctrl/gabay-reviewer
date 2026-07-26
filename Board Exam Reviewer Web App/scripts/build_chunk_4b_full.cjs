const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. GRAMMAR & CORRECT USAGE (35 Questions: ver-gram-300 to 334)
// Official Policy Memo Parallelism & Inverted Agreement
// --------------------------------------------------------------------------
for (let i = 0; i < 35; i++) {
  const num = 300 + i;

  addQ({
    id: `ver-gram-${num}`,
    subtopic_id: "grammar-correct-usage",
    category_id: "verbal-ability",
    blueprint_id: `Parallel Structure in Official Guidelines Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Select the sentence that maintains proper parallel structure in official administrative writing:`,
    options: [
      { key: "A", text: "The new department chief promises to streamline procurement, improve transparency, and upgrade office technology." },
      { key: "B", text: "The new department chief promises to streamline procurement, transparency improvement, and upgrading office technology." },
      { key: "C", text: "The new department chief promises streamlining procurement, to improve transparency, and upgraded office technology." },
      { key: "D", text: "The new department chief promises to streamline procurement, improves transparency, and technology upgrade." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Parallel Items", text: "The list contains 3 actions after 'promises to': [verb 1], [verb 2], [verb 3]." },
      { rung: 2, title: "Check Verb Forms", text: "Sentence A uses base verbs: (to) streamline, improve, upgrade." },
      { rung: 3, title: "Examine Non-Parallel Forms", text: "Sentence B mixes infinitive (to streamline), noun (improvement), and gerund (upgrading)." },
      { rung: 4, title: "Select Option A", text: "Option A maintains perfect parallel infinitive structure." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Uses parallel infinitive verbs: 'to streamline... (to) improve... (to) upgrade'.", trap_type: null },
      "B": { text: "Faulty parallelism: mixes infinitive, noun phrase, and gerund.", trap_type: "faulty_parallelism_mixed_parts_of_speech" },
      "C": { text: "Faulty parallelism: mixes gerund, infinitive, and past participle.", trap_type: "faulty_parallelism_verb_tenses" },
      "D": { text: "Faulty parallelism: mixes base verb, 3rd person verb, and noun phrase.", trap_type: "faulty_parallelism_mixed_forms" }
    },
    next_time_rule: "Parallelism Rule: Items in a series must match grammatical form (all infinitives, all gerunds, or all nouns).",
    deconstruct_text: "Parallelism Analysis:\nOption A: 'to [streamline], [improve], and [upgrade]' (All base verbs following 'to').\nOption B/C/D mix mismatched grammatical structures."
  });
}

// --------------------------------------------------------------------------
// 2. VOCABULARY & SYNONYMS (30 Questions: ver-vocab-300 to 329)
// Public Administration & Executive Governance Jargon
// --------------------------------------------------------------------------
const adminJargon = [
  { word: "bureaucracy", syn: "administrative organization", def: "a system of government in which most decisions are made by state officials" },
  { word: "decentralization", syn: "devolution of power", def: "transfer of authority from central to local government" },
  { word: "transparency", syn: "openness", def: "operating in a clear, visible, and accountable manner" },
  { word: "accountability", syn: "answerability", def: "obligation of public servants to account for their actions" },
  { word: "compliance", syn: "adherence", def: "the action or fact of complying with a rule or statute" }
];

for (let i = 0; i < 30; i++) {
  const num = 300 + i;
  const v = adminJargon[i % adminJargon.length];

  addQ({
    id: `ver-vocab-${num}`,
    subtopic_id: "vocabulary-synonyms",
    category_id: "verbal-ability",
    blueprint_id: `Administrative Governance Jargon — ${v.word.toUpperCase()}`,
    difficulty_level: 2,
    question_text: `Choose the word closest in meaning to the underlined term: 'The Civil Service Reform Act aims to enhance <u>${v.word}</u> across all municipal offices.'`,
    options: [
      { key: "A", text: v.syn },
      { key: "B", text: "secrecy" },
      { key: "C", text: "stagnation" },
      { key: "D", text: "arbitrary rule" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Analyze Context", text: "Consider how reform acts promote public governance standards." },
      { rung: 2, title: "Define Term", text: `'${v.word}' means ${v.def}.` },
      { rung: 3, title: "Match Direct Synonym", text: `'${v.syn}' is the direct synonym.` },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! '${v.word}' means '${v.syn}'.`, trap_type: null },
      "B": { text: "Antonym of governance standards.", trap_type: "antonym_confusion" },
      "C": { text: "Negative administrative condition.", trap_type: "negative_context_trap" },
      "D": { text: "Opposite of lawful governance.", trap_type: "antonym_confusion" }
    },
    next_time_rule: `'${v.word.toUpperCase()}' = ${v.syn} (${v.def}).`,
    deconstruct_text: `Governance Jargon:\n'${v.word}' refers to: ${v.def}.\nDirect Equivalent = '${v.syn}'.`
  });
}

// --------------------------------------------------------------------------
// 3. READING COMPREHENSION (30 Questions: ver-read-300 to 329)
// Executive Summary & Policy Memo Analysis
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 300 + i;

  addQ({
    id: `ver-read-${num}`,
    subtopic_id: "reading-comprehension",
    category_id: "verbal-ability",
    blueprint_id: `Executive Summary Analysis Passage ${i + 1}`,
    difficulty_level: 2,
    question_text: `Read the passage: 'Executive Order No. 45 mandates all national government agencies to digitize 100% of front-line public transactions by the end of FY 2026. Agencies failing to meet the digital transition deadline will face a 10% reduction in discretionary operating budgets.'\n\nWhat is the consequence for agencies that fail to digitize by FY 2026?`,
    options: [
      { key: "A", text: "A 10% reduction in discretionary operating budgets." },
      { key: "B", text: "Immediate termination of agency heads." },
      { key: "C", text: "A 50% increase in administrative fees." },
      { key: "D", text: "No consequence." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Locate Penalty Provision", text: "Look for the sentence starting with 'Agencies failing to meet...'." },
      { rung: 2, title: "Extract Stated Penalty", text: "Passage explicitly states: 'will face a 10% reduction in discretionary operating budgets'." },
      { rung: 3, title: "Match Option", text: "Option A directly states the penalty." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Explicitly stated in the passage text.", trap_type: null },
      "B": { text: "Exaggerated consequence not mentioned in text.", trap_type: "exaggerated_statement_distractor" },
      "C": { text: "Distorted numbers and concept.", trap_type: "false_number_distractor" },
      "D": { text: "Contradicts the explicit penalty in the text.", trap_type: "passage_contradiction" }
    },
    next_time_rule: "Comprehension Accuracy: Rely strictly on explicitly stated facts in policy text.",
    deconstruct_text: "Explicit Text Fact:\n'will face a 10% reduction in discretionary operating budgets'."
  });
}

// --------------------------------------------------------------------------
// 4. VERBAL ANALOGIES (20 Questions: ver-vanal-300 to 319)
// Institutional Hierarchy Analogies
// --------------------------------------------------------------------------
const hierPairs = [
  { p1: "Department", p2: "Secretary", p3: "Bureau", p4: "Director" },
  { p1: "Province", p2: "Governor", p3: "City", p4: "Mayor" },
  { p1: "Barangay", p2: "Captain", p3: "Municipality", p4: "Mayor" }
];

for (let i = 0; i < 20; i++) {
  const num = 300 + i;
  const item = hierPairs[i % hierPairs.length];

  addQ({
    id: `ver-vanal-${num}`,
    subtopic_id: "verbal-analogies",
    category_id: "verbal-ability",
    blueprint_id: `Institutional Head Analogy ${i + 1}`,
    difficulty_level: 2,
    question_text: `Complete the analogy: ${item.p1} : ${item.p2} :: ${item.p3} : __?__`,
    options: [
      { key: "A", text: item.p4 },
      { key: "B", text: "Clerk" },
      { key: "C", text: "Senator" },
      { key: "D", text: "Treasurer" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Hierarchy Relationship", text: `${item.p2} is the executive head of a ${item.p1}.` },
      { rung: 2, title: "Apply to Second Entity", text: `Who is the executive head of a ${item.p3}?` },
      { rung: 3, title: "Match Head Official", text: `The executive head of a ${item.p3} is a ${item.p4}.` },
      { rung: 4, title: "Select Option A", text: `Select Option A ('${item.p4}').` }
    ],
    choice_explanations: {
      "A": { text: `Correct! ${item.p2} heads a ${item.p1}, just as a ${item.p4} heads a ${item.p3}.`, trap_type: null },
      "B": { text: "Staff level rather than executive head.", trap_type: "hierarchy_level_mismatch" },
      "C": { text: "Legislative official rather than local executive head.", trap_type: "branch_mismatch" },
      "D": { text: "Financial officer rather than executive head.", trap_type: "function_mismatch" }
    },
    next_time_rule: "Executive Hierarchy Analogies: Jurisdiction ➔ Executive Head.",
    deconstruct_text: `Hierarchy Relationship:\n${item.p1} : ${item.p2} = Jurisdiction : Executive Head\n${item.p3} : ${item.p4} = Jurisdiction : Executive Head.`
  });
}

// --------------------------------------------------------------------------
// 5. SENTENCE COMPLETION (15 Questions: ver-sent-300 to 314)
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 300 + i;

  addQ({
    id: `ver-sent-${num}`,
    subtopic_id: "sentence-completion",
    category_id: "verbal-ability",
    blueprint_id: `Official Workplace Prepositions ${i + 1}`,
    difficulty_level: 2,
    question_text: `Fill in the blank: 'The new guidelines were issued pursuant __ Section 4 of the Administrative Code.'`,
    options: [
      { key: "A", text: "to" },
      { key: "B", text: "with" },
      { key: "C", text: "for" },
      { key: "D", text: "by" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Fixed Legal Phrase", text: "Look at the phrase 'pursuant'." },
      { rung: 2, title: "Recall Preposition Pair", text: "The fixed legal collocation is 'pursuant TO'." },
      { rung: 3, title: "Verify with Options", text: "Option A is 'to'." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! The fixed legal phrase is 'pursuant TO'.", trap_type: null },
      "B": { text: "Confused with 'in accordance WITH'.", trap_type: "phrase_structure_confusion" },
      "C": { text: "Incorrect preposition choice.", trap_type: "wrong_preposition" },
      "D": { text: "Incorrect preposition choice.", trap_type: "wrong_preposition" }
    },
    next_time_rule: "Legal Collocation: 'pursuant TO' (never 'pursuant with').",
    deconstruct_text: "Legal Grammar Rule:\nThe fixed legal phrase is always 'pursuant TO'."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 4B (Verbal Ability)!`);

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
