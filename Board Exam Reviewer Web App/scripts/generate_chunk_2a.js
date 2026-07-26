const fs = require('fs');
const path = require('path');

// Chunk 2A: Numerical Ability (120 Questions)
// Range: 100-series (e.g. num-ratio-100 to num-ratio-119, num-pct-100 to num-pct-124, num-word-100 to num-word-124, num-nseries-100 to num-nseries-124, num-ops-100 to num-ops-124)

const questions = [];

// Helper to add question
function addQ(q) {
  // Validate schema invariants
  if (!q.id || !q.subtopic_id || !q.category_id || !q.question_text || !q.correct_option) {
    throw new Error(`Invalid basic fields for ${q.id}`);
  }
  if (!q.options || q.options.length !== 4) {
    throw new Error(`Options count !== 4 for ${q.id}`);
  }
  if (!q.hint_ladder || q.hint_ladder.length !== 4) {
    throw new Error(`Hint ladder rungs !== 4 for ${q.id}`);
  }
  if (!q.choice_explanations || !q.choice_explanations[q.correct_option]) {
    throw new Error(`Missing choice explanation for correct option in ${q.id}`);
  }
  if (q.choice_explanations[q.correct_option].trap_type !== null) {
    throw new Error(`Correct option trap_type must be null in ${q.id}`);
  }

  q.is_free = true;
  q.language = "en";
  q.content_version = 3;

  questions.push(q);
}

// -------------------------------------------------------------
// 1. ratio-proportion (20 Questions: num-ratio-100 to 119)
// Topics: Gear ratios, map scaling, currency exchange, mixture ratios, recipe scaling
// -------------------------------------------------------------

// num-ratio-100: Gear Ratios
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

// num-ratio-101: Currency Exchange Ratio
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

// num-ratio-102: Map Scale Computation
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

// num-ratio-103: Recipe/Material Scaling
addQ({
  id: "num-ratio-103",
  subtopic_id: "ratio-proportion",
  category_id: "numerical-ability",
  blueprint_id: "Direct Proportion — Multi-Ingredient Recipe Scaling",
  difficulty_level: 2,
  question_text: "A DSWD community kitchen recipe for 40 typhoon evacuees requires 5 kg of rice, 2 kg of canned meat, and 1.5 kg of vegetables. How many kilograms of canned meat are required to feed 140 evacuees?",
  options: [
    { key: "A", text: "6.0 kg" },
    { key: "B", text: "7.0 kg" },
    { key: "C", text: "8.5 kg" },
    { key: "D", text: "10.5 kg" }
  ],
  correct_option: "B",
  hint_ladder: [
    { rung: 1, title: "Determine Scaling Factor", text: "Scale Factor = Target Evacuees / Original Evacuees = 140 / 40." },
    { rung: 2, title: "Simplify Scale Factor", text: "140 / 40 = 3.5." },
    { rung: 3, title: "Multiply Meat Quantity", text: "Meat Needed = 2 kg × 3.5." },
    { rung: 4, title: "Calculate Result", text: "2 × 3.5 = 7.0 kg." }
  ],
  choice_explanations: {
    "A": { text: "Multiplied 2 kg by 3 instead of 3.5.", trap_type: "truncation_error" },
    "B": { text: "Correct! Scale factor = 140 / 40 = 3.5. Canned meat = 2 kg × 3.5 = 7.0 kg.", trap_type: null },
    "C": { text: "Scaled the vegetable quantity instead of canned meat.", trap_type: "wrong_variable_target" },
    "D": { text: "Scaled the rice quantity instead of canned meat.", trap_type: "wrong_variable_target" }
  },
  next_time_rule: "Find the scaling factor (New / Old) and multiply by the specific component quantity requested.",
  deconstruct_text: "Scale Factor = 140 / 40 = 3.5\nRequired Canned Meat = 2 kg × 3.5 = 7.0 kg."
});

// num-ratio-104: Population Part-to-Part Ratio Difference
addQ({
  id: "num-ratio-104",
  subtopic_id: "ratio-proportion",
  category_id: "numerical-ability",
  blueprint_id: "Ratio — Component Difference from Total",
  difficulty_level: 2,
  question_text: "In a municipality of 18,000 registered voters, the ratio of voters in Urban barangays to Rural barangays is 5:4. How many more registered voters live in Urban barangays than in Rural barangays?",
  options: [
    { key: "A", text: "1,000" },
    { key: "B", text: "2,000" },
    { key: "C", text: "8,000" },
    { key: "D", text: "10,000" }
  ],
  correct_option: "B",
  hint_ladder: [
    { rung: 1, title: "Find Total Ratio Parts", text: "Total Parts = 5 + 4 = 9 parts." },
    { rung: 2, title: "Find Value of One Part", text: "Value per Part = 18,000 / 9 = 2,000 voters." },
    { rung: 3, title: "Find Difference in Ratio Parts", text: "Difference in parts = 5 - 4 = 1 part." },
    { rung: 4, title: "Calculate Difference", text: "Difference = 1 part × 2,000 = 2,000 voters." }
  ],
  choice_explanations: {
    "A": { text: "Divided 18,000 by 18 instead of 9.", trap_type: "divisor_error" },
    "B": { text: "Correct! Total parts = 9. Each part = 2,000. Urban - Rural = (5 - 4) × 2,000 = 2,000.", trap_type: null },
    "C": { text: "Calculated Rural voters total (4 × 2,000 = 8,000) instead of the difference.", trap_type: "wrong_variable_target" },
    "D": { text: "Calculated Urban voters total (5 × 2,000 = 10,000) instead of the difference.", trap_type: "wrong_variable_target" }
  },
  next_time_rule: "To find the difference between ratio shares, multiply (Part1 - Part2) by (Total / Sum of Parts).",
  deconstruct_text: "Sum of Parts = 5 + 4 = 9\nValue of 1 Part = 18,000 / 9 = 2,000\nDifference in Parts = 5 - 4 = 1 part\nDifference in Voters = 1 × 2,000 = 2,000 voters."
});

// Write to seed.json to verify
console.log(`Generated initial ${questions.length} questions for Chunk 2A...`);
