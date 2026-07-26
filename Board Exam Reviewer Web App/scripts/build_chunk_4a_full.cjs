const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. RATIO & PROPORTION (20 Questions: num-ratio-300 to 319)
// Workplace Livelihood & Disaster Relief Ratios
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 300 + i;
  const ratioRice = 5 + (i % 2);
  const ratioWater = 3 + (i % 2);
  const totalParts = ratioRice + ratioWater;
  const unitKits = 40 + (i * 10);
  const totalKits = totalParts * unitKits;
  const riceKits = ratioRice * unitKits;

  addQ({
    id: `num-ratio-${num}`,
    subtopic_id: "ratio-proportion",
    category_id: "numerical-ability",
    blueprint_id: `Disaster Relief Kit Allocation Ratio Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A DSWD logistics hub packs ${totalKits} emergency relief packs containing Rice Kits and Water Kits in the ratio of ${ratioRice}:${ratioWater}. How many Rice Kits were packed?`,
    options: [
      { key: "A", text: `${riceKits}` },
      { key: "B", text: `${unitKits * ratioWater}` },
      { key: "C", text: `${totalKits / 2}` },
      { key: "D", text: `${riceKits + 50}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Sum of Ratio Parts", text: `Sum of parts = ${ratioRice} + ${ratioWater} = ${totalParts} parts.` },
      { rung: 2, title: "Find Value per Part", text: `Per-part value = ${totalKits} / ${totalParts} = ${unitKits} kits.` },
      { rung: 3, title: "Multiply by Rice Ratio Share", text: `Rice Kits = ${ratioRice} × ${unitKits}.` },
      { rung: 4, title: "Calculate Result", text: `${riceKits} Rice Kits.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Total parts = ${totalParts}. Value per part = ${unitKits}. Rice Kits (${ratioRice} parts) = ${riceKits}.`, trap_type: null },
      "B": { text: "Calculated Water Kits instead of Rice Kits.", trap_type: "wrong_variable_target" },
      "C": { text: "Assumed equal 1:1 split.", trap_type: "equal_split_fallacy" },
      "D": { text: "Calculation offset error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Part-to-Whole Ratio: Target Component = (Target Ratio / Total Ratio Sum) × Total Units.",
    deconstruct_text: `Ratio Formula:\nSum of Parts = ${ratioRice} + ${ratioWater} = ${totalParts}\nPer Part = ${totalKits} / ${totalParts} = ${unitKits}\nRice Kits = ${ratioRice} × ${unitKits} = ${riceKits}.`
  });
}

// --------------------------------------------------------------------------
// 2. PERCENTAGE & INTEREST (25 Questions: num-pct-300 to 324)
// GSIS/PhilHealth Salary Deduction Scenarios
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 300 + i;
  const grossSalary = 30000 + (i * 1000);
  const gsisRate = 9;
  const philhealthRate = 2;
  const totalRate = gsisRate + philhealthRate;
  const totalDeduction = (grossSalary * totalRate) / 100;
  const netPay = grossSalary - totalDeduction;

  addQ({
    id: `num-pct-${num}`,
    subtopic_id: "percentage-interest",
    category_id: "numerical-ability",
    blueprint_id: `Civil Service Salary Deduction & Net Pay Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A government employee receives a monthly gross salary of ₱${grossSalary.toLocaleString()}. Mandatory monthly deductions consist of ${gsisRate}% for GSIS and ${philhealthRate}% for PhilHealth. What is the employee's net monthly take-home pay after these deductions?`,
    options: [
      { key: "A", text: `₱${netPay.toLocaleString()}` },
      { key: "B", text: `₱${totalDeduction.toLocaleString()}` },
      { key: "C", text: `₱${(grossSalary - (grossSalary * 0.09)).toLocaleString()}` },
      { key: "D", text: `₱${(netPay - 500).toLocaleString()}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Sum Mandatory Deduction Percentages", text: `Total Deduction Rate = ${gsisRate}% + ${philhealthRate}% = ${totalRate}%.` },
      { rung: 2, title: "Calculate Total Deduction Amount", text: `Deduction = ₱${grossSalary.toLocaleString()} × ${totalRate / 100} = ₱${totalDeduction.toLocaleString()}.` },
      { rung: 3, title: "Subtract Deduction from Gross Salary", text: `Net Pay = Gross Salary - Deduction.` },
      { rung: 4, title: "Calculate Net Pay", text: `₱${grossSalary.toLocaleString()} - ₱${totalDeduction.toLocaleString()} = ₱${netPay.toLocaleString()}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Total deduction rate = 11%. Net Pay = ₱${grossSalary} × 0.89 = ₱${netPay.toLocaleString()}.`, trap_type: null },
      "B": { text: "Reported total deductions instead of net take-home pay.", trap_type: "wrong_variable_target" },
      "C": { text: "Omitted PhilHealth deduction (deducted GSIS only).", trap_type: "omitted_deduction_step" },
      "D": { text: "Calculation error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Net Pay = Gross Salary × (1 - Total Mandatory Deduction Rates).",
    deconstruct_text: `Salary Computation:\nTotal Deduction Rate = 9% + 2% = 11%\nDeduction Amount = ₱${grossSalary} × 0.11 = ₱${totalDeduction}\nNet Take-Home Pay = ₱${grossSalary} - ₱${totalDeduction} = ₱${netPay.toLocaleString()}.`
  });
}

// --------------------------------------------------------------------------
// 3. WORD PROBLEMS & ALGEBRA (25 Questions: num-word-300 to 324)
// Government Procurement & Budget Allocation Word Problems
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 300 + i;
  const deskCost = 1500;
  const chairCost = 500;
  const numDesks = 10 + i;
  const numChairs = numDesks * 2;
  const totalCost = (numDesks * deskCost) + (numChairs * chairCost);

  addQ({
    id: `num-word-${num}`,
    subtopic_id: "word-problems-algebra",
    category_id: "numerical-ability",
    blueprint_id: `Procurement Furniture System Equation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A municipal hall bought office desks at ₱${deskCost.toLocaleString()} each and chairs at ₱${chairCost.toLocaleString()} each. The office ordered twice as many chairs as desks. If the total procurement invoice was ₱${totalCost.toLocaleString()}, how many desks were purchased?`,
    options: [
      { key: "A", text: `${numDesks} desks` },
      { key: "B", text: `${numChairs} desks` },
      { key: "C", text: `${numDesks + 5} desks` },
      { key: "D", text: `${numDesks * 3} desks` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Set Up Variable", text: "Let x = number of desks. Then 2x = number of chairs." },
      { rung: 2, title: "Form Total Cost Equation", text: `1,500(x) + 500(2x) = ₱${totalCost.toLocaleString()}.` },
      { rung: 3, title: "Simplify Combined Equation", text: `1,500x + 1,000x = 2,500x = ₱${totalCost.toLocaleString()}.` },
      { rung: 4, title: "Solve for x", text: `x = ${totalCost} / 2,500 = ${numDesks} desks.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! 2,500x = ${totalCost} ➔ x = ${numDesks} desks.`, trap_type: null },
      "B": { text: "Reported number of chairs (${numChairs}) instead of desks.", trap_type: "wrong_variable_target" },
      "C": { text: "Calculation offset error.", trap_type: "arithmetic_error" },
      "D": { text: "Reported total furniture items.", trap_type: "total_items_confusion" }
    },
    next_time_rule: "Cost Equation: Set x for base item, express dependent item as multiple of x, then solve Total = Cost_A(x) + Cost_B(k*x).",
    deconstruct_text: `Algebraic Setup:\nLet x = desks, 2x = chairs\nCost = 1500(x) + 500(2x) = 2500x = ${totalCost}\nx = ${totalCost} / 2500 = ${numDesks} desks.`
  });
}

// --------------------------------------------------------------------------
// 4. NUMBER SERIES (25 Questions: num-nseries-300 to 324)
// Alternating Operations Series
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 300 + i;
  const start = 10 + i;
  const s1 = start;
  const s2 = s1 * 2; // ×2
  const s3 = s2 - 3; // -3
  const s4 = s3 * 2; // ×2
  const s5 = s4 - 3; // -3 (Next term)

  addQ({
    id: `num-nseries-${num}`,
    subtopic_id: "number-series",
    category_id: "numerical-ability",
    blueprint_id: `Alternating Multiply-Subtract Pattern Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next number in the series: ${s1}, ${s2}, ${s3}, ${s4}, __?`,
    options: [
      { key: "A", text: `${s5}` },
      { key: "B", text: `${s4 * 2}` },
      { key: "C", text: `${s4 + 3}` },
      { key: "D", text: `${s3 * 2}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Examine Step 1 to Step 2", text: `${s1} ➔ ${s2} is ×2.` },
      { rung: 2, title: "Examine Step 2 to Step 3", text: `${s2} ➔ ${s3} is -3.` },
      { rung: 3, title: "Identify Alternating Rule", text: "The sequence alternates: (×2), (-3), (×2), (-3)." },
      { rung: 4, title: "Apply (-3) to Last Term", text: `${s4} - 3 = ${s5}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Alternating pattern (×2, -3): ${s4} - 3 = ${s5}.`, trap_type: null },
      "B": { text: "Applied ×2 when the next alternating step was -3.", trap_type: "pattern_step_reversal" },
      "C": { text: "Added 3 instead of subtracting 3.", trap_type: "sign_reversal_error" },
      "D": { text: "Reused previous term.", trap_type: "repetition_fallacy" }
    },
    next_time_rule: "Alternating Pattern: Identify paired operators (e.g. ×2 then -3) and apply in strict turn.",
    deconstruct_text: `Alternating Rule:\n${s1} × 2 = ${s2}\n${s2} - 3 = ${s3}\n${s3} × 2 = ${s4}\n${s4} - 3 = ${s5}.`
  });
}

// --------------------------------------------------------------------------
// 5. BASIC OPERATIONS (25 Questions: num-ops-300 to 324)
// Average & Weighted Mean Scenarios
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 300 + i;
  const score1 = 80 + (i % 5);
  const score2 = 85 + (i % 5);
  const score3 = 90 + (i % 5);
  const sum = score1 + score2 + score3;
  const avg = Math.round(sum / 3);

  addQ({
    id: `num-ops-${num}`,
    subtopic_id: "basic-operations",
    category_id: "numerical-ability",
    blueprint_id: `Civil Service Evaluation Average Score Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A civil service applicant scored ${score1}, ${score2}, and ${score3} on three performance rating modules. What is the applicant's average score?`,
    options: [
      { key: "A", text: `${avg}` },
      { key: "B", text: `${sum}` },
      { key: "C", text: `${avg - 5}` },
      { key: "D", text: `${avg + 5}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Average Formula", text: "Average = Sum of Scores / Number of Scores." },
      { rung: 2, title: "Sum the Scores", text: `${score1} + ${score2} + ${score3} = ${sum}.` },
      { rung: 3, title: "Divide by 3", text: `${sum} / 3 = ${avg}.` },
      { rung: 4, title: "Select Result", text: `Select Option A (${avg}).` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Sum = ${sum}. Average = ${sum} / 3 = ${avg}.`, trap_type: null },
      "B": { text: "Reported sum instead of average.", trap_type: "total_vs_average_confusion" },
      "C": { text: "Arithmetic subtraction error.", trap_type: "arithmetic_error" },
      "D": { text: "Arithmetic addition error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Average = Total Sum / Count of Items.",
    deconstruct_text: `Average Computation:\nSum = ${score1} + ${score2} + ${score3} = ${sum}\nAverage = ${sum} / 3 = ${avg}.`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 4A (Numerical Ability)!`);

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
