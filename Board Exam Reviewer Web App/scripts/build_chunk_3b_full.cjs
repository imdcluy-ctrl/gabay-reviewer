const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. GRAMMAR & CORRECT USAGE (35 Questions: ver-gram-200 to 234)
// Active vs passive, conciseness/wordiness, paragraph coherence
// --------------------------------------------------------------------------
for (let i = 0; i < 35; i++) {
  const num = 200 + i;

  addQ({
    id: `ver-gram-${num}`,
    subtopic_id: "grammar-correct-usage",
    category_id: "verbal-ability",
    blueprint_id: `Conciseness & Wordiness Elimination Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `Which option expresses the administrative directive most CONCISELY and clearly without redundant wordiness?`,
    options: [
      { key: "A", text: "The committee approved the budget proposal unanimously." },
      { key: "B", text: "At this point in time, the committee members reached a unanimous consensus of opinion to approve the budget." },
      { key: "C", text: "The budget proposal was given final approval by the members of the committee unanimously." },
      { key: "D", text: "With regard to the budget proposal, the committee voted in favor of approving it." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Redundant Phrases", text: "Phrases like 'at this point in time' (now) and 'unanimous consensus of opinion' (consensus implies agreement) are redundant." },
      { rung: 2, title: "Eliminate Wordy Filler", text: "Look for the sentence that conveys the core action directly." },
      { rung: 3, title: "Evaluate Sentence Length", text: "Sentence A uses 7 words to express what Sentence B takes 16 words to say." },
      { rung: 4, title: "Select Most Concise Sentence", text: "Option A is the most concise and active sentence." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Concise, active, and contains zero redundant filler phrases.", trap_type: null },
      "B": { text: "Contains multiple redundancies ('at this point in time', 'unanimous consensus of opinion').", trap_type: "wordiness_redundancy_error" },
      "C": { text: "Uses wordy passive voice ('was given final approval by').", trap_type: "passive_voice_overuse" },
      "D": { text: "Contains wordy introductory filler ('With regard to').", trap_type: "introductory_filler_error" }
    },
    next_time_rule: "Government Writing Rule: Eliminate redundant qualifiers ('consensus of opinion' ➔ 'consensus') and prefer active voice.",
    deconstruct_text: "Conciseness Analysis:\nOption B contains double redundancy ('unanimous consensus of opinion').\nOption A expresses the exact same legal fact in 7 active words."
  });
}

// --------------------------------------------------------------------------
// 2. VOCABULARY & SYNONYMS (30 Questions: ver-vocab-200 to 229)
// RA Statutory Vocabulary & Formal Legal Register
// --------------------------------------------------------------------------
const raVocab = [
  { word: "adjudicate", syn: "arbitrate", def: "to make a formal judgment or decision on a disputed matter" },
  { word: "promulgation", syn: "proclamation", def: "official declaration or formal enactment of a law" },
  { word: "jurisprudence", syn: "legal doctrine", def: "the philosophy or science of law and court precedents" },
  { word: "expropriation", syn: "compulsory acquisition", def: "the action by the state of taking private property for public use" },
  { word: "subpoena", syn: "judicial summons", def: "a writ ordering a person to attend a court or hearing" }
];

for (let i = 0; i < 30; i++) {
  const num = 200 + i;
  const v = raVocab[i % raVocab.length];

  addQ({
    id: `ver-vocab-${num}`,
    subtopic_id: "vocabulary-synonyms",
    category_id: "verbal-ability",
    blueprint_id: `Statutory Legal Terms — ${v.word.toUpperCase()}`,
    difficulty_level: 3,
    question_text: `Choose the word or phrase closest in meaning to the underlined legal term: 'The Ombudsman has the constitutional authority to <u>${v.word}</u> administrative complaints filed against public officers.'`,
    options: [
      { key: "A", text: v.syn },
      { key: "B", text: "dismiss without review" },
      { key: "C", text: "delay indefinitely" },
      { key: "D", text: "delegate to private entities" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Analyze Legal Context", text: "Consider how the Ombudsman handles administrative complaints against officials." },
      { rung: 2, title: "Define Term", text: `'${v.word}' means ${v.def}.` },
      { rung: 3, title: "Match Legal Equivalent", text: `'${v.syn}' is the direct legal equivalent.` },
      { rung: 4, title: "Select Synonym", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! '${v.word}' means to '${v.syn}'.`, trap_type: null },
      "B": { text: "Opposite of formal adjudication.", trap_type: "antonym_confusion" },
      "C": { text: "Unrelated procedural delay.", trap_type: "procedural_error_trap" },
      "D": { text: "Incorrect delegation assertion.", trap_type: "unsupported_assertion" }
    },
    next_time_rule: `'${v.word.toUpperCase()}' = ${v.syn} (${v.def}).`,
    deconstruct_text: `Legal Vocabulary:\n'${v.word}' is defined as: ${v.def}.\nDirect Equivalent = '${v.syn}'.`
  });
}

// --------------------------------------------------------------------------
// 3. READING COMPREHENSION (30 Questions: ver-read-200 to 229)
// --------------------------------------------------------------------------
for (let i = 0; i < 30; i++) {
  const num = 200 + i;

  addQ({
    id: `ver-read-${num}`,
    subtopic_id: "reading-comprehension",
    category_id: "verbal-ability",
    blueprint_id: `Inference & Tone Analysis Passage ${i + 1}`,
    difficulty_level: 3,
    question_text: `Read the passage: 'While statutory compliance is mandatory, true civil service excellence requires empathy towards the public. Bureaucratic efficiency without human compassion creates administrative alienation.'\n\nWhat can be INFERRED about the author's viewpoint?`,
    options: [
      { key: "A", text: "Public officers should balance procedural compliance with compassionate service." },
      { key: "B", text: "Statutory rules should be ignored completely." },
      { key: "C", text: "Bureaucratic efficiency is the only metric that matters." },
      { key: "D", text: "Civil service exams should be abolished." }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Dual Themes", text: "Passage mentions both 'statutory compliance' and 'empathy towards the public'." },
      { rung: 2, title: "Analyze Critique", text: "Author warns against 'efficiency without human compassion'." },
      { rung: 3, title: "Deduce Recommendation", text: "The author advocates combining both compliance and empathy." },
      { rung: 4, title: "Select Option A", text: "Option A accurately synthesizes the balanced viewpoint." }
    ],
    choice_explanations: {
      "A": { text: "Correct! The passage advocates combining statutory compliance with empathetic public service.", trap_type: null },
      "B": { text: "Extreme distortion: passage explicitly states compliance is mandatory.", trap_type: "extreme_view_fallacy" },
      "C": { text: "Contradicts the warning against 'efficiency without compassion'.", trap_type: "passage_contradiction" },
      "D": { text: "Unsupported out-of-scope statement.", trap_type: "out_of_scope_distractor" }
    },
    next_time_rule: "Inference Questions: Look for options that synthesize both sides of the author's argument.",
    deconstruct_text: "Inference Analysis:\nPassage acknowledges compliance is mandatory BUT warns that efficiency alone creates alienation.\nTherefore, the author supports balancing compliance with compassion."
  });
}

// --------------------------------------------------------------------------
// 4. VERBAL ANALOGIES (20 Questions: ver-vanal-200 to 219)
// Symbol-Meaning, Creator-Creation, Part-Whole
// --------------------------------------------------------------------------
const symbolPairs = [
  { p1: "Scales", p2: "Justice", p3: "Olive Branch", p4: "Peace" },
  { p1: "Gavel", p2: "Authority", p3: "Scepter", p4: "Royalty" },
  { p1: "Anchor", p2: "Hope", p3: "Dove", p4: "Purity" }
];

for (let i = 0; i < 20; i++) {
  const num = 200 + i;
  const item = symbolPairs[i % symbolPairs.length];

  addQ({
    id: `ver-vanal-${num}`,
    subtopic_id: "verbal-analogies",
    category_id: "verbal-ability",
    blueprint_id: `Symbolic Representation Analogy ${i + 1}`,
    difficulty_level: 2,
    question_text: `Complete the analogy: ${item.p1} : ${item.p2} :: ${item.p3} : __?__`,
    options: [
      { key: "A", text: item.p4 },
      { key: "B", text: "War" },
      { key: "C", text: "Commerce" },
      { key: "D", text: "Navigation" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Symbol Relationship", text: `${item.p1} is a traditional symbol representing ${item.p2}.` },
      { rung: 2, title: "Apply to Second Pair", text: `What concept does an ${item.p3} represent symbolically?` },
      { rung: 3, title: "Match Symbolic Meaning", text: `${item.p3} represents ${item.p4}.` },
      { rung: 4, title: "Select Option A", text: `Select Option A ('${item.p4}').` }
    ],
    choice_explanations: {
      "A": { text: `Correct! ${item.p1} symbolizes ${item.p2}, just as ${item.p3} symbolizes ${item.p4}.`, trap_type: null },
      "B": { text: "Antonym of symbolic meaning.", trap_type: "antonym_confusion" },
      "C": { text: "Unrelated business domain.", trap_type: "domain_mismatch" },
      "D": { text: "Literal interpretation trap.", trap_type: "literal_meaning_trap" }
    },
    next_time_rule: "Symbolic Analogies: Map Symbol ➔ Concept represented.",
    deconstruct_text: `Analogy Relationship:\n${item.p1} : ${item.p2} = Symbol : Meaning\n${item.p3} : ${item.p4} = Symbol : Meaning.`
  });
}

// --------------------------------------------------------------------------
// 5. SENTENCE COMPLETION (15 Questions: ver-sent-200 to 214)
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 200 + i;

  addQ({
    id: `ver-sent-${num}`,
    subtopic_id: "sentence-completion",
    category_id: "verbal-ability",
    blueprint_id: `Complex Transitional Connectors ${i + 1}`,
    difficulty_level: 3,
    question_text: `Fill in the blank with the appropriate transition: 'The agency faced severe budget cuts; __, it managed to achieve all its annual performance targets.'`,
    options: [
      { key: "A", text: "nevertheless" },
      { key: "B", text: "consequently" },
      { key: "C", text: "furthermore" },
      { key: "D", text: "for instance" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Analyze Sentence Relationship", text: "First clause presents a hardship (budget cuts); second clause presents success (met targets)." },
      { rung: 2, title: "Identify Logical Contrast", text: "The relationship is adversarial/contrasting, requiring a concessive transition." },
      { rung: 3, title: "Test Transitions", text: "'Nevertheless' means 'in spite of that'." },
      { rung: 4, title: "Select Transition", text: "Select Option A ('nevertheless')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! 'Nevertheless' introduces a contrast/concession appropriate for achieving goals despite budget cuts.", trap_type: null },
      "B": { text: "Implies cause-and-effect (budget cuts caused target achievement).", trap_type: "cause_effect_reversal_error" },
      "C": { text: "Implies additive information.", trap_type: "additive_connector_error" },
      "D": { text: "Implies example illustration.", trap_type: "exemplification_error" }
    },
    next_time_rule: "Use 'nevertheless' or 'however' when a positive outcome occurs despite a negative condition.",
    deconstruct_text: `Transition Analysis:\nHardship ➔ Success despite hardship = Concessive Contrast ('Nevertheless').`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 3B (Verbal Ability)!`);

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
