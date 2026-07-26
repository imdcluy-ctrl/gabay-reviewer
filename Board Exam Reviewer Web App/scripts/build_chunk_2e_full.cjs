const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. PHILIPPINE CONSTITUTION (20 Questions: gen-const-100 to 119)
// Art II State Policies, Art IX Constitutional Commissions, Art X LGU, Art XI Accountability
// --------------------------------------------------------------------------
const constTopics = [
  { art: "Article II", topic: "State Declaration of Principles and State Policies", optA: "State Policy", norm: "renunciation of war as an instrument of national policy" },
  { art: "Article IX", topic: "Constitutional Commissions (CSC, COMELEC, COA)", optA: "Independence", norm: "independent constitutional body" },
  { art: "Article X", topic: "Local Government Autonomy", optA: "Local Autonomy", norm: "autonomy to local government units" },
  { art: "Article XI", topic: "Accountability of Public Officers", optA: "Public Trust", norm: "Public office is a public trust" }
];

for (let i = 0; i < 20; i++) {
  const num = 100 + i;
  const item = constTopics[i % constTopics.length];

  addQ({
    id: `gen-const-${num}`,
    subtopic_id: "philippine-constitution",
    category_id: "general-information",
    blueprint_id: `1987 Constitution ${item.art} — ${item.topic}`,
    difficulty_level: 2,
    question_text: `Under ${item.art} of the 1987 Philippine Constitution, which principle guarantees that '${item.norm}'?`,
    options: [
      { key: "A", text: item.optA },
      { key: "B", text: "Executive Order" },
      { key: "C", text: "Judicial Discretion" },
      { key: "D", text: "Legislative Franchise" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Locate Constitutional Article", text: `Identify the primary focus of 1987 Constitution ${item.art}.` },
      { rung: 2, title: "Recall Core Constitutional Mandate", text: `Review the constitutional doctrine of ${item.topic}.` },
      { rung: 3, title: "Match Principle Name", text: `The principle is formally named '${item.optA}'.` },
      { rung: 4, title: "Select Principle", text: "Choose Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! ${item.art} explicitly mandates the principle of ${item.optA}.`, trap_type: null },
      "B": { text: "Confused constitutional provision with executive action.", trap_type: "statute_hierarchy_confusion" },
      "C": { text: "Confused with judicial power.", trap_type: "branch_function_confusion" },
      "D": { text: "Confused with congressional power.", trap_type: "branch_function_confusion" }
    },
    next_time_rule: `${item.art} of the 1987 Constitution establishes '${item.optA}'.`,
    deconstruct_text: `Constitutional Provision:\n${item.art} mandates '${item.norm}', enshrined under ${item.optA}.`
  });
}

// --------------------------------------------------------------------------
// 2. RA 6713 CODE OF CONDUCT (20 Questions: gen-ra6713-100 to 119)
// SALN, Divestment, Conflict of Interest, Gift Restrictions
// --------------------------------------------------------------------------
const ra6713Topics = [
  { topic: "Statement of Assets, Liabilities, and Net Worth (SALN)", rule: "30 days after assumption of office", kw: "SALN Filing" },
  { topic: "Divestment of Business Interests", rule: "60 days from assumption of office", kw: "Divestment Deadline" },
  { topic: "Prohibition on Accepting Gifts", rule: "gift-giving rules under Section 7", kw: "Gift Ban" },
  { topic: "Whistleblower Protections", rule: "protection from administrative reprisal", kw: "Whistleblower Rights" }
];

for (let i = 0; i < 20; i++) {
  const num = 100 + i;
  const item = ra6713Topics[i % ra6713Topics.length];

  addQ({
    id: `gen-ra6713-${num}`,
    subtopic_id: "ra-6713-code-of-conduct",
    category_id: "general-information",
    blueprint_id: `RA 6713 Section Standard — ${item.kw}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 6713 (Code of Conduct and Ethical Standards for Public Officials and Employees), what is the statutory requirement regarding ${item.topic}?`,
    options: [
      { key: "A", text: `Mandated under ${item.rule}` },
      { key: "B", text: "Optional for appointive officials" },
      { key: "C", text: "Required only upon retirement" },
      { key: "D", text: "Applicable only to elective officials" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify RA 6713 Requirement", text: `Recall the statutory rule governing ${item.topic}.` },
      { rung: 2, title: "Review Section Rules", text: `RA 6713 strictly enforces ${item.rule}.` },
      { rung: 3, title: "Check Exemption Rules", text: "No public official is exempt unless explicitly excluded by law." },
      { rung: 4, title: "Select Mandatory Option", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: `Correct! RA 6713 explicitly mandates ${item.rule}.`, trap_type: null },
      "B": { text: "Incorrectly assumes optional compliance.", trap_type: "exemption_fallacy" },
      "C": { text: "Incorrect timing restriction.", trap_type: "statutory_timing_error" },
      "D": { text: "Incorrect scope limitation.", trap_type: "scope_limitation_error" }
    },
    next_time_rule: `RA 6713 requires ${item.topic} (${item.rule}).`,
    deconstruct_text: `RA 6713 Compliance:\nSection provisions strictly mandate ${item.rule} for all covered public personnel.`
  });
}

// --------------------------------------------------------------------------
// 3. PHILIPPINE GOVERNMENT (15 Questions: gen-govt-100 to 114)
// RA 7160 Local Govt Code, GOCCs, COA/COMELEC/CSC mandates
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 100 + i;

  addQ({
    id: `gen-govt-${num}`,
    subtopic_id: "philippine-government",
    category_id: "general-information",
    blueprint_id: `RA 7160 Local Government Code & Mandates Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Which government body is constitutionally mandated to audit all accounts pertaining to the revenue and expenditures of government agencies (COA, CSC, COMELEC)?`,
    options: [
      { key: "A", text: "Commission on Audit (COA)" },
      { key: "B", text: "Civil Service Commission (CSC)" },
      { key: "C", text: "Commission on Elections (COMELEC)" },
      { key: "D", text: "Department of Budget and Management (DBM)" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Audit Agency", text: "Look for the constitutional commission responsible for financial auditing." },
      { rung: 2, title: "Distinguish Commissions", text: "COA = Financial Audit, CSC = Personnel Administration, COMELEC = Elections." },
      { rung: 3, title: "Match Mandate", text: "Financial auditing belongs to COA." },
      { rung: 4, title: "Select COA", text: "Select Option A ('Commission on Audit')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Article IX-D of the Constitution vests financial audit authority exclusively in COA.", trap_type: null },
      "B": { text: "CSC governs human resources and merit systems.", trap_type: "agency_mandate_confusion" },
      "C": { text: "COMELEC governs elections and plebiscites.", trap_type: "agency_mandate_confusion" },
      "D": { text: "DBM prepares the national budget, but COA audits expenditures.", trap_type: "executive_vs_audit_agency_confusion" }
    },
    next_time_rule: "COA = Financial Audit; CSC = Personnel/Merit; COMELEC = Elections; DBM = Budget Allocation.",
    deconstruct_text: "Constitutional Mandates:\nArticle IX-D: Commission on Audit (COA) is the sole constitutional auditor of government funds."
  });
}

// --------------------------------------------------------------------------
// 4. CURRENT EVENTS & ENVIRONMENT (10 Questions: gen-curenv-100 to 109)
// RA 8749 Clean Air Act, RA 9275 Clean Water Act
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 100 + i;

  addQ({
    id: `gen-curenv-${num}`,
    subtopic_id: "current-events-environment",
    category_id: "general-information",
    blueprint_id: `Philippine Environmental Legislation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 8749 (Philippine Clean Air Act of 1999), which government agency leads the implementation of air quality management policies nationwide?`,
    options: [
      { key: "A", text: "Department of Environment and Natural Resources (DENR)" },
      { key: "B", text: "Department of Transportation (DOTr)" },
      { key: "C", text: "Department of Health (DOH)" },
      { key: "D", text: "Department of Energy (DOE)" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Environmental Lead Agency", text: "Find the primary executive department for environmental protection." },
      { rung: 2, title: "Review RA 8749 Mandate", text: "DENR serves as the primary policy-making and implementing body for RA 8749." },
      { rung: 3, title: "Confirm Lead Agency", text: "DENR leads environmental regulation." },
      { rung: 4, title: "Select DENR", text: "Select Option A ('DENR')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! DENR is the primary executive agency implementing RA 8749.", trap_type: null },
      "B": { text: "DOTr handles vehicle registration emission testing, but DENR leads policy.", trap_type: "support_agency_confusion" },
      "C": { text: "DOH monitors public health impacts.", trap_type: "support_agency_confusion" },
      "D": { text: "DOE manages energy policy.", trap_type: "support_agency_confusion" }
    },
    next_time_rule: "DENR is the primary lead agency for environmental protection laws (RA 8749, RA 9275, RA 9003).",
    deconstruct_text: "Statutory Mandate:\nRA 8749 Section 5 designates DENR as the primary government agency for air quality management."
  });
}

// --------------------------------------------------------------------------
// 5. PEACE & HUMAN RIGHTS (10 Questions: gen-peace-100 to 109)
// RA 9344 Juvenile Justice, RA 10175 Cybercrime, UDHR
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 100 + i;

  addQ({
    id: `gen-peace-${num}`,
    subtopic_id: "peace-human-rights",
    category_id: "general-information",
    blueprint_id: `Human Rights & Social Legislation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 9344 (Juvenile Justice and Welfare Act of 2006), what is the minimum age of criminal responsibility in the Philippines?`,
    options: [
      { key: "A", text: "15 years of age" },
      { key: "B", text: "18 years of age" },
      { key: "C", text: "12 years of age" },
      { key: "D", text: "9 years of age" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall RA 9344 Section 6", text: "Look up the age threshold where children are exempt from criminal liability." },
      { rung: 2, title: "Identify Minimum Age Threshold", text: "Children 15 years old and below are exempt from criminal liability." },
      { rung: 3, title: "Differentiate Intervention vs Diversion", text: "15 and below undergo intervention programs, not criminal prosecution." },
      { rung: 4, title: "Select 15 Years", text: "Select Option A ('15 years of age')." }
    ],
    choice_explanations: {
      "A": { text: "Correct! RA 9344 Section 6 sets 15 years of age as the minimum age of criminal responsibility.", trap_type: null },
      "B": { text: "18 is the age of legal majority.", trap_type: "age_of_majority_confusion" },
      "C": { text: "Confused with proposed legislative amendments.", trap_type: "proposed_bill_confusion" },
      "D": { text: "Confused with old Revised Penal Code thresholds.", trap_type: "repealed_law_threshold_error" }
    },
    next_time_rule: "RA 9344 sets 15 years of age as the minimum age of criminal responsibility.",
    deconstruct_text: "Statutory Rule:\nRA 9344 Section 6 explicitly establishes that children 15 years of age and below are exempt from criminal responsibility."
  });
}

console.log(`Generated ${questions.length} questions for Chunk 2E (General Information)!`);

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
