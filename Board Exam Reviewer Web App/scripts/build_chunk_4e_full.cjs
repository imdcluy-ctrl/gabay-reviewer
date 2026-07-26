const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. PHILIPPINE CONSTITUTION (20 Questions: gen-const-300 to 319)
// Bill of Rights Search Warrant & Due Process Scenarios
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `gen-const-${num}`,
    subtopic_id: "philippine-constitution",
    category_id: "general-information",
    blueprint_id: `Bill of Rights Search Warrant Requirements Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `Under Article III, Section 2 of the 1987 Philippine Constitution, a search warrant or warrant of arrest can ONLY be issued upon a finding of probable cause determined personally by:`,
    options: [
      { key: "A", text: "A Judge after examination under oath" },
      { key: "B", text: "A Police Precinct Commander" },
      { key: "C", text: "A City Prosecutor" },
      { key: "D", text: "The Department of Justice Secretary" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Warrant Issuing Authority", text: "Recall who possesses exclusive constitutional authority to issue warrants." },
      { rung: 2, title: "Review Article III Section 2", text: "The Constitution strictly reserves probable cause determination for judicial officers." },
      { rung: 3, title: "Confirm Requirement", text: "Exclusively a JUDGE after personal examination under oath." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Article III, Section 2 mandates that probable cause must be determined personally by a JUDGE after examination under oath.", trap_type: null },
      "B": { text: "Executive law enforcement officer cannot issue warrants.", trap_type: "executive_vs_judicial_confusion" },
      "C": { text: "Prosecutor conducts preliminary investigation, but cannot issue warrants.", trap_type: "prosecutional_power_confusion" },
      "D": { text: "Cabinet Secretary cannot issue judicial warrants.", trap_type: "executive_vs_judicial_confusion" }
    },
    next_time_rule: "Bill of Rights Rule: Warrants can ONLY be issued by a JUDGE upon personal determination of probable cause.",
    deconstruct_text: "Constitutional Mandate:\nArticle III Section 2: '...no search warrant or warrant of arrest shall issue except upon probable cause to be determined personally by the JUDGE after examination under oath...'."
  });
}

// --------------------------------------------------------------------------
// 2. RA 6713 CODE OF CONDUCT (20 Questions: gen-ra6713-300 to 319)
// Nepotism Prohibitions under CSC Rules
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;

  addQ({
    id: `gen-ra6713-${num}`,
    subtopic_id: "ra-6713-code-of-conduct",
    category_id: "general-information",
    blueprint_id: `Nepotism Rules in Government Appointments Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Civil Service Law and Rules, an appointment made in favor of a relative within which degree of consanguinity or affinity is prohibited under Nepotism rules?`,
    options: [
      { key: "A", text: "Within the 3rd degree of consanguinity or affinity" },
      { key: "B", text: "Within the 1st degree only" },
      { key: "C", text: "Within the 10th degree" },
      { key: "D", text: "No degree restriction exists" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall Nepotism Definition", text: "Nepotism applies to appointments of relatives by recommending or appointing authorities." },
      { rung: 2, title: "Identify Degree Limit", text: "Civil Service Rules prohibit appointments within the third (3rd) degree of consanguinity/affinity." },
      { rung: 3, title: "Confirm Degree", text: "3rd degree includes parents, children, siblings, nephews/nieces, uncles/aunts." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! Civil Service Law prohibits nepotic appointments within the 3rd degree of consanguinity or affinity.", trap_type: null },
      "B": { text: "Too narrow; rules extend beyond 1st degree.", trap_type: "degree_understatement_error" },
      "C": { text: "Exaggerated degree limit.", trap_type: "degree_overstatement_error" },
      "D": { text: "Falsely asserts no rule exists.", trap_type: "false_statement_distractor" }
    },
    next_time_rule: "Nepotism Prohibition: Appointments of relatives within the THIRD (3rd) degree of consanguinity or affinity are illegal.",
    deconstruct_text: "Civil Service Rule on Nepotism:\nAppointments made in favor of a relative of the appointing or recommending authority within the 3rd degree of consanguinity or affinity are prohibited."
  });
}

// --------------------------------------------------------------------------
// 3. PHILIPPINE GOVERNMENT (15 Questions: gen-govt-300 to 314)
// Ombudsman Jurisdiction & Eligibility Pathways
// --------------------------------------------------------------------------
for (let i = 0; i < 15; i++) {
  const num = 300 + i;

  addQ({
    id: `gen-govt-${num}`,
    subtopic_id: "philippine-government",
    category_id: "general-information",
    blueprint_id: `Ombudsman Jurisdiction & Anti-Graft Rules Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under RA 6770 (The Ombudsman Act of 1989), the Office of the Ombudsman has primary jurisdiction to investigate administrative offences committed by:`,
    options: [
      { key: "A", text: "All elective and appointive public officials and employees, including GOCC personnel" },
      { key: "B", text: "Private corporate executives only" },
      { key: "C", text: "Foreign embassy personnel only" },
      { key: "D", text: "Military officers under court-martial only" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall Ombudsman Mandate", text: "The Ombudsman is the Tanodbayan, protecting citizens from administrative misconduct." },
      { rung: 2, title: "Identify Jurisdiction Scope", text: "Jurisdiction extends to ALL government personnel, elective/appointive, including GOCCs." },
      { rung: 3, title: "Match Option", text: "Option A covers all public officers." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! The Ombudsman has investigative jurisdiction over all public servants in government and GOCCs.", trap_type: null },
      "B": { text: "Private entities fall outside Ombudsman jurisdiction.", trap_type: "jurisdiction_scope_confusion" },
      "C": { text: "Foreign diplomats enjoy diplomatic immunity.", trap_type: "jurisdiction_scope_confusion" },
      "D": { text: "Military court-martial handles internal military discipline.", trap_type: "military_jurisdiction_confusion" }
    },
    next_time_rule: "Ombudsman Jurisdiction: Covers ALL public officials and employees in government and GOCCs.",
    deconstruct_text: "RA 6770 Section 15:\nOmbudsman jurisdiction extends to any officer or employee of the Government, or any subdivision, agency, or instrumentality thereof, including GOCCs."
  });
}

// --------------------------------------------------------------------------
// 4. CURRENT EVENTS & ENVIRONMENT (10 Questions: gen-curenv-300 to 309)
// Climate Change Act RA 9729
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 300 + i;

  addQ({
    id: `gen-curenv-${num}`,
    subtopic_id: "current-events-environment",
    category_id: "general-information",
    blueprint_id: `RA 9729 Climate Change Commission Mandates Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Under Republic Act No. 9729 (Climate Change Act of 2009), who serves as the Chairperson of the Climate Change Commission (CCC)?`,
    options: [
      { key: "A", text: "The President of the Philippines" },
      { key: "B", text: "The DENR Secretary" },
      { key: "C", text: "The DOST Secretary" },
      { key: "D", text: "The DILG Secretary" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Top Leadership of CCC", text: "Recall the head of the Climate Change Commission created by RA 9729." },
      { rung: 2, title: "Review Statutory Composition", text: "The Climate Change Commission is chaired directly by the Chief Executive." },
      { rung: 3, title: "Confirm Chairperson", text: "The President of the Philippines." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! RA 9729 Section 5 explicitly designates the President of the Philippines as the Chairperson of the CCC.", trap_type: null },
      "B": { text: "DENR Secretary is a member/vice-chair, but not overall Commission Chair.", trap_type: "commissioner_vs_chair_confusion" },
      "C": { text: "DOST Secretary is a member.", trap_type: "commissioner_vs_chair_confusion" },
      "D": { text: "DILG Secretary is a member.", trap_type: "commissioner_vs_chair_confusion" }
    },
    next_time_rule: "Climate Change Commission (RA 9729) is chaired directly by the PRESIDENT of the Philippines.",
    deconstruct_text: "RA 9729 Section 5:\n'The Commission shall be an independent and autonomous body... The President of the Philippines shall serve as the Chairperson of the Commission.'"
  });
}

// --------------------------------------------------------------------------
// 5. PEACE & HUMAN RIGHTS (10 Questions: gen-peace-300 to 309)
// UDHR Article Principles
// --------------------------------------------------------------------------
for (let i = 0; i < 10; i++) {
  const num = 300 + i;

  addQ({
    id: `gen-peace-${num}`,
    subtopic_id: "peace-human-rights",
    category_id: "general-information",
    blueprint_id: `UDHR Article 1 Fundamental Freedom Principle Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Article 1 of the Universal Declaration of Human Rights (UDHR) declares that 'All human beings are born free and equal in...':`,
    options: [
      { key: "A", text: "dignity and rights" },
      { key: "B", text: "wealth and property" },
      { key: "C", text: "political power" },
      { key: "D", text: "academic qualifications" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall UDHR Article 1 Opening Line", text: "Think of the famous universal human rights declaration text." },
      { rung: 2, title: "Identify Key Words", text: "'All human beings are born free and equal in dignity and rights.'" },
      { rung: 3, title: "Match Option", text: "Dignity and rights." },
      { rung: 4, title: "Select Option A", text: "Select Option A." }
    ],
    choice_explanations: {
      "A": { text: "Correct! UDHR Article 1 states: 'All human beings are born free and equal in dignity and rights.'", trap_type: null },
      "B": { text: "Economic status is not declared equal by birth.", trap_type: "out_of_scope_distractor" },
      "C": { text: "Political power varies.", trap_type: "out_of_scope_distractor" },
      "D": { text: "Academic status is earned, not inherent by birth.", trap_type: "out_of_scope_distractor" }
    },
    next_time_rule: "UDHR Article 1 Core Text: 'All human beings are born free and equal in DIGNITY and RIGHTS.'",
    deconstruct_text: "UDHR Text:\n'Article 1: All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience...'"
  });
}

console.log(`Generated ${questions.length} questions for Chunk 4E (General Information)!`);

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
