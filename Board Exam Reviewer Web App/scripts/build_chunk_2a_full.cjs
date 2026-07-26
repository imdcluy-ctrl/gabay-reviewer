const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// RATIO & PROPORTION (20 Questions: num-ratio-100 to 119)
// --------------------------------------------------------------------------

// 100
addQ({
  id: "num-ratio-100",
  subtopic_id: "ratio-proportion",
  category_id: "numerical-ability",
  blueprint_id: "Gear Ratios — Mechanical Advantage",
  difficulty_level: 2,
  question_text: "In a DPWH heavy equipment mechanism, a driving gear with 48 teeth is meshed with a driven gear having 16 teeth. If the driving gear rotates at 300 RPM, what is the rotational speed of the driven gear?",
  options: [
    { key: "A", text: "100 RPM" },
    { key: "B", text: "600 RPM" },
    { key: "C", text: "900 RPM" },
    { key: "D", text: "1,200 RPM" }
  ],
  correct_option: "C",
  hint_ladder: [
    { rung: 1, title: "Identify Inverse Gear Ratio Rule", text: "Fewer teeth mean a gear must spin faster to keep up with the larger meshed gear." },
    { rung: 2, title: "Calculate Gear Ratio", text: "Ratio of teeth = 48 / 16 = 3:1 ratio." },
    { rung: 3, title: "Apply Speed Formula", text: "Speed of driven gear = Driving Speed × (Driving Teeth / Driven Teeth)." },
    { rung: 4, title: "Perform Multiplication", text: "300 RPM × 3 = 900 RPM." }
  ],
  choice_explanations: {
    "A": { text: "Divided speed by teeth ratio instead of multiplying.", trap_type: "inverse_operation_error" },
    "B": { text: "Assumed a 2:1 ratio (300 × 2 = 600).", trap_type: "incorrect_ratio_simplification" },
    "C": { text: "Correct! Speed = 300 RPM × (48 / 16) = 300 × 3 = 900 RPM.", trap_type: null },
    "D": { text: "Multiplied by 4 instead of 3.", trap_type: "multiplier_error" }
  },
  next_time_rule: "Gear speed is inversely proportional to teeth count: Speed1 × Teeth1 = Speed2 × Teeth2.",
  deconstruct_text: "Gear Ratio Formula:\nSpeed_driven = Speed_driver × (Teeth_driver / Teeth_driven)\nSpeed_driven = 300 × (48 / 16)\nSpeed_driven = 300 × 3 = 900 RPM."
});

// 101
addQ({
  id: "num-ratio-101",
  subtopic_id: "ratio-proportion",
  category_id: "numerical-ability",
  blueprint_id: "Currency Exchange Proportional Scaling",
  difficulty_level: 2,
  question_text: "An OFW in Dubai sends AED 2,500 back to the Philippines. If the exchange rate is AED 1 = ₱15.60, how much will the beneficiary receive in Philippine Pesos after paying a fixed remittance fee of AED 20?",
  options: [
    { key: "A", text: "₱38,688.00" },
    { key: "B", text: "₱39,000.00" },
    { key: "C", text: "₱38,312.00" },
    { key: "D", text: "₱39,312.00" }
  ],
  correct_option: "A",
  hint_ladder: [
    { rung: 1, title: "Deduct Remittance Fee First", text: "The fee (AED 20) is deducted from the total AED sent before conversion." },
    { rung: 2, title: "Calculate Net AED", text: "Net AED = 2,500 - 20 = AED 2,480." },
    { rung: 3, title: "Multiply by Exchange Rate", text: "Net Pesos = 2,480 × ₱15.60." },
    { rung: 4, title: "Perform Multiplication", text: "2,480 × 15.60 = ₱38,688.00." }
  ],
  choice_explanations: {
    "A": { text: "Correct! Net AED = 2,480. 2,480 × 15.60 = ₱38,688.00.", trap_type: null },
    "B": { text: "Forgot to subtract the AED 20 remittance fee (2,500 × 15.60 = 39,000).", trap_type: "omitted_fee_deduction" },
    "C": { text: "Subtracted the fee in Pesos after multiplying total AED.", trap_type: "unit_confusion_subtraction" },
    "D": { text: "Added the fee instead of subtracting.", trap_type: "addition_instead_of_subtraction" }
  },
  next_time_rule: "Deduct fixed transaction fees in foreign currency before multiplying by the conversion rate.",
  deconstruct_text: "Step 1: Net Foreign Currency = AED 2,500 - AED 20 = AED 2,480\nStep 2: Convert to PHP = 2,480 × ₱15.60 = ₱38,688.00."
});

// 102
addQ({
  id: "num-ratio-102",
  subtopic_id: "ratio-proportion",
  category_id: "numerical-ability",
  blueprint_id: "Map Scale — Area Scaling",
  difficulty_level: 3,
  question_text: "On a DENR land map drawn to a scale of 1:20,000, a protected forest reserve measures 5 cm by 4 cm. What is the actual area of the reserve in hectares? (Note: 1 hectare = 10,000 m²)",
  options: [
    { key: "A", text: "80 hectares" },
    { key: "B", text: "40 hectares" },
    { key: "C", text: "400 hectares" },
    { key: "D", text: "800 hectares" }
  ],
  correct_option: "A",
  hint_ladder: [
    { rung: 1, title: "Convert Map Lengths to Actual Meters", text: "Multiply cm dimensions by scale factor (20,000) then convert to meters." },
    { rung: 2, title: "Find Actual Dimensions", text: "5 cm × 20,000 = 100,000 cm = 1,000 m. 4 cm × 20,000 = 80,000 cm = 800 m." },
    { rung: 3, title: "Calculate Actual Area in m²", text: "Area = 1,000 m × 800 m = 800,000 m²." },
    { rung: 4, title: "Convert m² to Hectares", text: "800,000 m² / 10,000 = 80 hectares." }
  ],
  choice_explanations: {
    "A": { text: "Correct! Dimensions = 1,000 m × 800 m = 800,000 m². 800,000 / 10,000 = 80 ha.", trap_type: null },
    "B": { text: "Divided by 20,000 m² instead of 10,000 m².", trap_type: "unit_conversion_divisor_error" },
    "C": { text: "Scaled the map area directly without squaring the scale ratio.", trap_type: "linear_vs_area_scaling_confusion" },
    "D": { text: "Missed a zero in hectare conversion.", trap_type: "decimal_point_shift_error" }
  },
  next_time_rule: "Convert map linear dimensions to actual meters BEFORE calculating area.",
  deconstruct_text: "Step 1: Length = 5 cm × 20,000 = 100,000 cm = 1,000 m\nStep 2: Width = 4 cm × 20,000 = 80,000 cm = 800 m\nStep 3: Area = 1,000 m × 800 m = 800,000 m²\nStep 4: Hectares = 800,000 / 10,000 = 80 hectares."
});

// Generate 15 more num-ratio (103 to 117)
for (let i = 3; i <= 17; i++) {
  const num = 100 + i;
  const a = (i * 3) + 2;
  const b = (i * 2) + 1;
  const totalVal = (a + b) * 50;
  const diff = (a - b) * 50;

  addQ({
    id: `num-ratio-${num}`,
    subtopic_id: "ratio-proportion",
    category_id: "numerical-ability",
    blueprint_id: `Part-to-Part Ratio Application Variant ${i}`,
    difficulty_level: 2,
    question_text: `A municipal budget of ₱${totalVal.toLocaleString()} is allocated between Agriculture and Health in a ratio of ${a}:${b}. What is the difference between the Agriculture budget and the Health budget?`,
    options: [
      { key: "A", text: `₱${diff.toLocaleString()}` },
      { key: "B", text: `₱${(diff + 500).toLocaleString()}` },
      { key: "C", text: `₱${(a * 50).toLocaleString()}` },
      { key: "D", text: `₱${(b * 50).toLocaleString()}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Sum of Ratio Parts", text: `Sum = ${a} + ${b} = ${a + b} parts.` },
      { rung: 2, title: "Find Per-Part Value", text: `Value per Part = ₱${totalVal.toLocaleString()} / ${a + b} = ₱50.` },
      { rung: 3, title: "Find Difference in Parts", text: `Difference = ${a} - ${b} = ${a - b} parts.` },
      { rung: 4, title: "Multiply to Find Difference", text: `Difference = ${a - b} × ₱50 = ₱${diff.toLocaleString()}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Total parts = ${a + b}. Each part = ₱50. Difference = ${a - b} × ₱50 = ₱${diff.toLocaleString()}.`, trap_type: null },
      "B": { text: "Added an arbitrary offset.", trap_type: "calculation_offset_error" },
      "C": { text: "Calculated Agriculture share only.", trap_type: "wrong_variable_target" },
      "D": { text: "Calculated Health share only.", trap_type: "wrong_variable_target" }
    },
    next_time_rule: "Difference = (Part1 - Part2) × (Total / Sum of Parts).",
    deconstruct_text: `Sum of Parts = ${a} + ${b} = ${a + b}\nPer-part Value = ${totalVal} / ${a + b} = 50\nDifference = (${a} - ${b}) × 50 = ${diff}.`
  });
}

// --------------------------------------------------------------------------
// PERCENTAGE & INTEREST (25 Questions: num-pct-100 to 124)
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 100 + i;
  const principal = 10000 + (i * 2000);
  const rate = 4 + (i % 5);
  const years = 2 + (i % 3);
  const interest = (principal * rate * years) / 100;
  const totalAmount = principal + interest;

  addQ({
    id: `num-pct-${num}`,
    subtopic_id: "percentage-interest",
    category_id: "numerical-ability",
    blueprint_id: `Simple Interest & Savings Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `A Barangay Cooperative deposited ₱${principal.toLocaleString()} in a land bank account earning ${rate}% simple interest per year. What will be the total amount in the account after ${years} years?`,
    options: [
      { key: "A", text: `₱${totalAmount.toLocaleString()}` },
      { key: "B", text: `₱${interest.toLocaleString()}` },
      { key: "C", text: `₱${(principal + (interest / 2)).toLocaleString()}` },
      { key: "D", text: `₱${(totalAmount + 1000).toLocaleString()}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Simple Interest Formula", text: "Interest = Principal × Rate × Time (I = P × r × t)." },
      { rung: 2, title: "Calculate Total Interest", text: `I = ₱${principal.toLocaleString()} × ${rate / 100} × ${years} = ₱${interest.toLocaleString()}.` },
      { rung: 3, title: "Add Interest to Principal", text: "Total Amount = Principal + Interest." },
      { rung: 4, title: "Perform Addition", text: `Total = ₱${principal.toLocaleString()} + ₱${interest.toLocaleString()} = ₱${totalAmount.toLocaleString()}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Interest = P × r × t = ${interest}. Total = ${principal} + ${interest} = ₱${totalAmount.toLocaleString()}.`, trap_type: null },
      "B": { text: "Reported only the interest earned, not total amount.", trap_type: "wrong_variable_target" },
      "C": { text: "Calculated interest for half the time.", trap_type: "time_period_halving_error" },
      "D": { text: "Added an extraneous fee.", trap_type: "addition_error" }
    },
    next_time_rule: "Total Amount = Principal + Simple Interest (P + P·r·t).",
    deconstruct_text: `Interest I = P × r × t = ${principal} × ${rate / 100} × ${years} = ${interest}\nTotal Amount = ${principal} + ${interest} = ${totalAmount}.`
  });
}

// --------------------------------------------------------------------------
// WORD PROBLEMS & ALGEBRA (25 Questions: num-word-100 to 124)
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 100 + i;
  const speedA = 40 + (i * 2);
  const speedB = 60 + (i * 2);
  const totalDist = (speedA + speedB) * 2; // 2 hours

  addQ({
    id: `num-word-${num}`,
    subtopic_id: "word-problems-algebra",
    category_id: "numerical-ability",
    blueprint_id: `Opposing Motion Distance Problem Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Two DOH ambulances leave a central hospital at the same time traveling in opposite directions along a highway. One travels at ${speedA} km/h and the other at ${speedB} km/h. How many hours will it take for them to be ${totalDist} km apart?`,
    options: [
      { key: "A", text: "2 hours" },
      { key: "B", text: "3 hours" },
      { key: "C", text: "4 hours" },
      { key: "D", text: "1.5 hours" }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Combined Speed", text: "When traveling in opposite directions, add their speeds together." },
      { rung: 2, title: "Sum the Speeds", text: `Combined Speed = ${speedA} + ${speedB} = ${speedA + speedB} km/h.` },
      { rung: 3, title: "Apply Time Formula", text: `Time = Distance / Combined Speed = ${totalDist} / ${speedA + speedB}.` },
      { rung: 4, title: "Perform Division", text: `${totalDist} / ${speedA + speedB} = 2 hours.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Combined Speed = ${speedA + speedB} km/h. Time = ${totalDist} / ${speedA + speedB} = 2 hours.`, trap_type: null },
      "B": { text: "Subtracted speeds instead of adding.", trap_type: "opposing_motion_subtraction_error" },
      "C": { text: "Used only the speed of one vehicle.", trap_type: "single_vehicle_speed_error" },
      "D": { text: "Divided distance by 2 before applying speed.", trap_type: "half_distance_error" }
    },
    next_time_rule: "Opposing directions: Combined Speed = Speed1 + Speed2. Time = Total Distance / Combined Speed.",
    deconstruct_text: `Combined Relative Speed = ${speedA} + ${speedB} = ${speedA + speedB} km/h\nTime = Distance / Combined Speed = ${totalDist} / ${speedA + speedB} = 2 hours.`
  });
}

// --------------------------------------------------------------------------
// NUMBER SERIES (25 Questions: num-nseries-100 to 124)
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 100 + i;
  const start = 3 + i;
  const diff = 4 + (i % 3);
  const s1 = start;
  const s2 = s1 + diff;
  const s3 = s2 + (diff * 2);
  const s4 = s3 + (diff * 3);
  const s5 = s4 + (diff * 4); // Next term

  addQ({
    id: `num-nseries-${num}`,
    subtopic_id: "number-series",
    category_id: "numerical-ability",
    blueprint_id: `Increasing Difference Series Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next number in the series: ${s1}, ${s2}, ${s3}, ${s4}, __?`,
    options: [
      { key: "A", text: `${s5}` },
      { key: "B", text: `${s5 - diff}` },
      { key: "C", text: `${s5 + diff}` },
      { key: "D", text: `${s4 + diff}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find First Differences", text: `Differences between terms are +${diff}, +${diff * 2}, +${diff * 3}.` },
      { rung: 2, title: "Identify Pattern of Differences", text: `The difference increases by +${diff} each step.` },
      { rung: 3, title: "Determine Next Difference", text: `Next difference = +${diff * 4}.` },
      { rung: 4, title: "Add to Last Term", text: `${s4} + ${diff * 4} = ${s5}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Differences increase by +${diff}: +${diff}, +${diff * 2}, +${diff * 3}, +${diff * 4}. Next term = ${s4} + ${diff * 4} = ${s5}.`, trap_type: null },
      "B": { text: "Reused previous step difference.", trap_type: "constant_difference_fallacy" },
      "C": { text: "Added extra multiplier to difference.", trap_type: "over_increment_error" },
      "D": { text: "Added initial step difference.", trap_type: "linear_constant_fallacy" }
    },
    next_time_rule: "Check second-level differences when first-level differences increase steadily.",
    deconstruct_text: `Differences: ${s2 - s1}, ${s3 - s2}, ${s4 - s3} (+${diff}, +${diff*2}, +${diff*3})\nNext difference = +${diff*4}\nNext term = ${s4} + ${diff*4} = ${s5}.`
  });
}

// --------------------------------------------------------------------------
// BASIC OPERATIONS (25 Questions: num-ops-100 to 124)
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 100 + i;
  const num1 = 12 + i;
  const num2 = 18 + i;

  // Compute GCD & LCM
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  const g = gcd(num1, num2);
  const l = (num1 * num2) / g;

  addQ({
    id: `num-ops-${num}`,
    subtopic_id: "basic-operations",
    category_id: "numerical-ability",
    blueprint_id: `LCM Computation Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Two Barangay patrol cars start their rounds from the municipal hall at the same time. Car A completes a round every ${num1} minutes, and Car B completes a round every ${num2} minutes. After how many minutes will both cars meet at the municipal hall again?`,
    options: [
      { key: "A", text: `${l} minutes` },
      { key: "B", text: `${g} minutes` },
      { key: "C", text: `${num1 * num2} minutes` },
      { key: "D", text: `${l + g} minutes` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify LCM Requirement", text: "When two recurring events coincide again, find the Least Common Multiple (LCM)." },
      { rung: 2, title: "Find Prime Factors", text: `Find prime factors of ${num1} and ${num2}.` },
      { rung: 3, title: "Apply LCM Formula", text: `LCM(A, B) = (A × B) / GCD(A, B). GCD is ${g}.` },
      { rung: 4, title: "Calculate LCM", text: `LCM = (${num1} × ${num2}) / ${g} = ${l} minutes.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! LCM(${num1}, ${num2}) = ${l} minutes.`, trap_type: null },
      "B": { text: "Calculated GCD instead of LCM.", trap_type: "gcd_lcm_confusion" },
      "C": { text: "Simply multiplied both numbers without dividing by GCD.", trap_type: "unsimplified_product_error" },
      "D": { text: "Added GCD to LCM.", trap_type: "extraneous_addition_error" }
    },
    next_time_rule: "Recurring coincidence time = Least Common Multiple (LCM) of individual cycle times.",
    deconstruct_text: `LCM Formula = (Num1 × Num2) / GCD(Num1, Num2)\nGCD(${num1}, ${num2}) = ${g}\nLCM = (${num1} × ${num2}) / ${g} = ${l} minutes.`
  });
}

console.log(`Successfully generated ${questions.length} questions for Chunk 2A!`);

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
