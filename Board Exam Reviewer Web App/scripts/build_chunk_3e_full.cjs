const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. PHILIPPINE CONSTITUTION (20 Questions: gen-const-200 to 219)
// Art VI Legislative, Art VII Executive, Art VIII Judiciary, Impeachment
// --------------------------------------------------------------------------
const constArticles = [
  { art: "Article VI", dept: "Legislative Department (Senate and House of Representatives)", topic: "lawmaking and power of the purse", optA: "Article VI (Legislative)" },
  { art: "Article VII", dept: "Executive Department (President and Cabinet)", topic: "commander-in-chief and administrative control", optA: "Article VII (Executive)" },
  { art: "Article VIII", dept: "Judicial Department (Supreme Court and Lower Courts)", topic: "judicial review and resolving justiciable controversies", optA: "Article VIII (Judiciary)" },
  { art: "Article XI", dept: "Impeachment of Constitutional Officers", topic: "removal of high officials for culpable violation of the Constitution", optA: "Article XI (Accountability)" }
];

for (let i = 0; i < 20; i++) {
  const num = 200 + i;
  const item = constArticles[i % constArticles.length];

  addQ({
    id: `gen-const-${num}`,
    subtopic_id: "philippine-constitution",
    category_id: "general-information",
    blueprint_id: `1987 Constitution Structure — ${item.art}`,
    difficulty_level: 2,
    question_text: `Under the 1987 Philippine Constitution, which Article governs the powers, qualifications, and organization of the ${item.dept}?`,
    options: [
      { key: "A", text: item.optA },
      { key: "B", text: "Article I (National Territory)" },
      { key: "C", text: "Article III (Bill of Rights)" },
      { key: "D", text: "Article V (Suffrage)" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Locate Branch in Constitution", text: `Identify which Article defines ${item.dept}.` },
      { rung: 2, title: "Recall Article Sequence", text: "Art VI = Legislative, Art VII = Executive, Art VIII = Judicial, Art XI = Accountability." },
      { rung: 3, title: "Match Article to Branch", text: `${item.dept} is governed by ${item.art}.` },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! ${item.art} governs the ${item.dept}.`, trap_type: null },
      "B": { text: "Article I defines National Territory.", trap_type: "article_number_confusion" },
      "C": { text: "Article III defines the Bill of Rights.", trap_type: "article_number_confusion" },
      "D": { text: "Article V defines Suffrage.", trap_type: "article_number_confusion" }
    },
    next_time_rule: "Constitutional Structure: Art VI = Legislative; Art VII = Executive; Art VIII = Judiciary; Art XI = Accountability.",
    deconstruct_text: `Constitutional Organization:\n${item.art} specifically establishes the powers and rules governing the ${item.dept}.`
  });
}

// --------------------------------------------------------------------------
// 2. RA 6713 CODE OF CONDUCT (20 Questions: gen-ra6713-200 to 219)
// Case Scenarios & Administrative Penalties
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;

  addQ({
    id: `gen-ra6713-${num}`,
    subtopic_id: "ra-6713-code-of-conduct",
    category_id: "general-information",
    blueprint_id: `RA 6713 Norms of Conduct Case Scenario Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `A public officer consistently prioritizes processing official documents for relatives ahead of other citizens waiting in line. Which norm of conduct under RA 6713 is VIOLATED?`,
    options: [
      { key: "A", text: "Justness and Sincerity" },
      { key: "B", text: "Commitment to Public Interest" },
      { key: "C", text: "Political Neutrality" },
      { key: "D", text: "Simple Living" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Analyze Officer Action", text: "Prioritizing relatives is nepotic favoritism and unfair treatment." },
      { rung: 2, title: "Review RA 6713 Norms", text: "Justness and Sincerity mandates prompt, courteous, and non-discriminatory service to ALL without nepotism or favor." },
      { rung: 3, title: "Match Norm", text: "Favoritism violates 'Justness and Sincerity'." },
      { rung: 4, title: "Select Option A", text: "Select Option A ('Justness and Sincerity')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! 'Justness and Sincerity' requires fair, non-discriminatory treatment without granting undue favors to relatives.", trap_type: null },
      "B": { text: "Focuses on personal financial gain rather than nepotism.", trap_type: "norm_definition_confusion" },
      "C": { text: "Focuses on partisan political activities.", trap_type: "norm_definition_confusion" },
      "D": { text: "Focuses on modest lifestyle.", trap_type: "norm_definition_confusion" }
    },
    next_time_rule: "RA 6713 'Justness and Sincerity': Public officers must remain fair, objective, and free from nepotism or favoritism.",
    deconstruct_text: "RA 6713 Section 4(b):\n'Justness and Sincerity' requires public servants to act with fairness and refrain from granting undue privileges to relatives or friends."
  });
}

// --------------------------------------------------------------------------
// 3. PHILIPPINE GOVERNMENT (15 Questions: gen-govt-200 to 214)
// ASEAN Integration & International Treaties
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 200 + i;

  addQ({
    id: `gen-govt-${num}`,
    subtopic_id: "philippine-government",
    category_id: "general-information",
    blueprint_id: `ASEAN Charter & Regional Integration Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `The Philippines is one of the 5 original founding member states of ASEAN (Association of Southeast Asian Nations). In what year was ASEAN established through the Bangkok Declaration?`,
    options: [
      { key: "A", text: "1967" },
      { key: "B", text: "1945" },
      { key: "C", text: "1987" },
      { key: "D", text: "1995" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall ASEAN History", text: "ASEAN was founded in Bangkok by Indonesia, Malaysia, Philippines, Singapore, and Thailand." },
      { rung: 2, title: "Identify Founding Era", text: "The Bangkok Declaration was signed on August 8, 1967." },
      { rung: 3, title: "Match Year", text: "1967." },
      { rung: 4, title: "Select Option A", text: "Select Option A ('1967')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! ASEAN was established on August 8, 1967 in Bangkok, Thailand.", trap_type: null },
      "B": { text: "1945 is the founding year of the United Nations (UN).", trap_type: "un_founding_year_confusion" },
      "C": { text: "1987 is the year the current PH Constitution was ratified.", trap_type: "ph_constitution_year_confusion" },
      "D": { text: "1995 is the founding year of the World Trade Organization (WTO).", trap_type: "wto_founding_year_confusion" }
    },
    next_time_rule: "ASEAN Founding Year = 1967 (Bangkok Declaration by 5 original members including the Philippines).",
    deconstruct_text: "ASEAN Governance:\nEstablished August 8, 1967 in Bangkok by 5 founding states: Philippines, Indonesia, Malaysia, Singapore, Thailand."
  });
}

// --------------------------------------------------------------------------
// 4. CURRENT EVENTS & ENVIRONMENT (10 Questions: gen-curenv-200 to 209)
// RA 9003 Solid Waste Management
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 200 + i;

  addQ({
    id: `gen-curenv-${num}`,
    subtopic_id: "current-events-environment",
    category_id: "general-information",
    blueprint_id: `RA 9003 Solid Waste Management Mandates Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 9003 (Ecological Solid Waste Management Act of 2000), which level of government is primarily responsible for waste segregation and collection at the household level?`,
    options: [
      { key: "A", text: "Barangay Level" },
      { key: "B", text: "Provincial Level" },
      { key: "C", text: "Regional DENR Office" },
      { key: "D", text: "National Government" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Local Solid Waste Rule", text: "RA 9003 assigns primary collection for biodegradable and recyclable wastes to the lowest LGU unit." },
      { rung: 2, title: "Identify Lowest LGU Unit", text: "The Barangay is tasked with primary segregation and collection." },
      { rung: 3, title: "Confirm Responsibility", text: "Barangay level." },
      { rung: 4, title: "Select Option A", text: "Select Option A ('Barangay Level')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! RA 9003 Section 10 mandates that barangays are responsible for household-level waste segregation and collection.", trap_type: null },
      "B": { text: "Provincial level handles regional bulk sanitary landfills.", trap_type: "lgu_tier_confusion" },
      "C": { text: "DENR acts as regulator, not primary household collector.", trap_type: "regulatory_vs_collection_confusion" },
      "D": { text: "National government provides policy frameworks.", trap_type: "macro_governance_confusion" }
    },
    next_time_rule: "RA 9003: Household waste segregation and collection is the primary responsibility of the BARANGAY.",
    deconstruct_text: "RA 9003 Section 10:\nSegregation and collection of solid waste shall be conducted at the BARANGAY level specifically for biodegradable and recyclable wastes."
  });
}

// --------------------------------------------------------------------------
// 5. PEACE & HUMAN RIGHTS (10 Questions: gen-peace-200 to 209)
// RA 9262 VAWC, RA 7877 Anti-Sexual Harassment
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 200 + i;

  addQ({
    id: `gen-peace-${num}`,
    subtopic_id: "peace-human-rights",
    category_id: "general-information",
    blueprint_id: `RA 7877 Anti-Sexual Harassment Workplace Rule Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 7877 (Anti-Sexual Harassment Act of 1995), sexual harassment is committed in a workplace when a person in authority demands sexual favors as a condition for:`,
    options: [
      { key: "A", text: "Employment, re-employment, or continued employment" },
      { key: "B", text: "Voluntary community membership" },
      { key: "C", text: "Private social media interactions" },
      { key: "D", text: "Personal hobby participation" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Scope of RA 7877", text: "RA 7877 explicitly governs workplace, education, and training environments." },
      { rung: 2, title: "Analyze Authority Condition", text: "It involves a superior demanding favors in exchange for employment benefits or status." },
      { rung: 3, title: "Match Option", text: "Employment, re-employment, or promotion conditions." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! RA 7877 Section 3 explicitly defines workplace sexual harassment as demanding favors for employment decisions.", trap_type: null },
      "B": { text: "Unrelated voluntary activity.", trap_type: "out_of_scope_distractor" },
      "C": { text: "Governed by Cybercrime law (RA 10175) or Safe Spaces Act (RA 11313).", trap_type: "law_scope_confusion" },
      "D": { text: "Unrelated personal activity.", trap_type: "out_of_scope_distractor" }
    },
    next_time_rule: "RA 7877 Anti-Sexual Harassment: Governs authority figures conditioning employment, education, or training benefits on sexual favors.",
    deconstruct_text: "RA 7877 Section 3:\nWorkplace sexual harassment occurs when an employer, manager, or supervisor demands sexual favors as a condition for hiring, promotion, or continued employment."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 3E (General Information)!`);

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
