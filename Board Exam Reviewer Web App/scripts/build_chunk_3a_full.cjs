const fs = require('fs');

const questions = [];

function addQ(q) {
  q.is_free = true;
  q.language = "en";
  q.content_version = 3;
  questions.push(q);
}

// --------------------------------------------------------------------------
// 1. RATIO & PROPORTION (20 Questions: num-ratio-200 to 219)
// Multi-step ratios, part-to-whole mixture chains, multi-variable proportions
// --------------------------------------------------------------------------
for (let i = 0; i < 20; i++) {
  const num = 200 + i;
  const ratioA = 2 + (i % 3);
  const ratioB = 3 + (i % 4);
  const ratioC = 4 + (i % 5);
  const totalParts = ratioA + ratioB + ratioC;
  const unitVal = 100 + (i * 25);
  const totalBudget = totalParts * unitVal;
  const valA = ratioA * unitVal;
  const valB = ratioB * unitVal;
  const valC = ratioC * unitVal;

  addQ({
    id: `num-ratio-${num}`,
    subtopic_id: "ratio-proportion",
    category_id: "numerical-ability",
    blueprint_id: `3-Way Multi-Variable Budget Proportion Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `A provincial development grant of ₱${totalBudget.toLocaleString()} is allocated among Education, Health, and Infrastructure in the ratio ${ratioA}:${ratioB}:${ratioC}. What is the share allocated to Infrastructure?`,
    options: [
      { key: "A", text: `₱${valC.toLocaleString()}` },
      { key: "B", text: `₱${valA.toLocaleString()}` },
      { key: "C", text: `₱${valB.toLocaleString()}` },
      { key: "D", text: `₱${(valC + 500).toLocaleString()}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Total Parts", text: `Sum of ratio parts = ${ratioA} + ${ratioB} + ${ratioC} = ${totalParts} parts.` },
      { rung: 2, title: "Calculate Value per Part", text: `Value per part = ₱${totalBudget.toLocaleString()} / ${totalParts} = ₱${unitVal}.` },
      { rung: 3, title: "Target Infrastructure Share", text: `Infrastructure has ${ratioC} parts.` },
      { rung: 4, title: "Multiply Parts by Value", text: `Infrastructure Share = ${ratioC} × ₱${unitVal} = ₱${valC.toLocaleString()}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Total parts = ${totalParts}. Value per part = ₱${unitVal}. Infrastructure (${ratioC} parts) = ₱${valC.toLocaleString()}.`, trap_type: null },
      "B": { text: "Selected Education share instead of Infrastructure.", trap_type: "wrong_variable_target" },
      "C": { text: "Selected Health share instead of Infrastructure.", trap_type: "wrong_variable_target" },
      "D": { text: "Added arbitrary offset to total.", trap_type: "arithmetic_offset_error" }
    },
    next_time_rule: "3-Way Ratio: Value per Part = Total / (A + B + C). Target Share = Target Parts × Value per Part.",
    deconstruct_text: `3-Way Ratio Calculation:\nSum of Parts = ${ratioA} + ${ratioB} + ${ratioC} = ${totalParts}\nUnit Value = ₱${totalBudget} / ${totalParts} = ₱${unitVal}\nInfrastructure Share = ${ratioC} × ₱${unitVal} = ₱${valC.toLocaleString()}.`
  });
}

// --------------------------------------------------------------------------
// 2. PERCENTAGE & INTEREST (25 Questions: num-pct-200 to 224)
// Multi-step percentage chains, compound interest with partial years
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 200 + i;
  const originalPrice = 50000 + (i * 2000);
  const _disc1 = 10;
  const _disc2 = 5;
  const priceAfter1 = originalPrice * 0.90;
  const finalPrice = priceAfter1 * 0.95;

  addQ({
    id: `num-pct-${num}`,
    subtopic_id: "percentage-interest",
    category_id: "numerical-ability",
    blueprint_id: `Successive Discount Chain Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `A government agency purchased office laptops under a promotion offering a 10% trade discount followed by an additional 5% cash prompt-payment discount. If the original catalog price per unit is ₱${originalPrice.toLocaleString()}, what is the final net price per unit?`,
    options: [
      { key: "A", text: `₱${finalPrice.toLocaleString()}` },
      { key: "B", text: `₱${(originalPrice * 0.85).toLocaleString()}` },
      { key: "C", text: `₱${priceAfter1.toLocaleString()}` },
      { key: "D", text: `₱${(finalPrice + 1000).toLocaleString()}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Apply First Discount", text: `First Discount (10%): Price1 = ₱${originalPrice.toLocaleString()} × 0.90 = ₱${priceAfter1.toLocaleString()}.` },
      { rung: 2, title: "Apply Second Discount to Reduced Price", text: `Second Discount (5%) applies to ₱${priceAfter1.toLocaleString()}, NOT the original price!` },
      { rung: 3, title: "Calculate Net Price", text: `Net Price = ₱${priceAfter1.toLocaleString()} × 0.95.` },
      { rung: 4, title: "Perform Multiplication", text: `₱${finalPrice.toLocaleString()}.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Successive discounts: ₱${originalPrice} × 0.90 × 0.95 = ₱${finalPrice.toLocaleString()}.`, trap_type: null },
      "B": { text: "Additive discount fallacy: added 10% + 5% = 15% directly from original price.", trap_type: "additive_discount_fallacy" },
      "C": { text: "Omitted second cash discount.", trap_type: "omitted_step_error" },
      "D": { text: "Calculation offset error.", trap_type: "arithmetic_error" }
    },
    next_time_rule: "Successive discounts are multiplicative (Price × (1-d1) × (1-d2)), NOT additive!",
    deconstruct_text: `Successive Discount Chain:\nStep 1: After 10% discount = ₱${originalPrice} × 0.90 = ₱${priceAfter1}\nStep 2: After 5% discount = ₱${priceAfter1} × 0.95 = ₱${finalPrice}.`
  });
}

// --------------------------------------------------------------------------
// 3. WORD PROBLEMS & ALGEBRA (25 Questions: num-word-200 to 224)
// Pipe/Tank combined work, weighted average, speed with stops
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 200 + i;
  const timeA = 6 + (i % 4);
  const timeB = 12 + (i % 4);
  // Combined time: (A * B) / (A + B)
  const combinedTime = Number(((timeA * timeB) / (timeA + timeB)).toFixed(1));

  addQ({
    id: `num-word-${num}`,
    subtopic_id: "word-problems-algebra",
    category_id: "numerical-ability",
    blueprint_id: `Pipe & Tank Combined Inflow Rate Variant ${i + 1}`,
    difficulty_level: 3,
    question_text: `A municipal water tank can be filled by Pipe A in ${timeA} hours and by Pipe B in ${timeB} hours. How many hours will it take to fill the tank if both pipes are opened simultaneously?`,
    options: [
      { key: "A", text: `${combinedTime} hours` },
      { key: "B", text: `${(timeA + timeB) / 2} hours` },
      { key: "C", text: `${timeA + timeB} hours` },
      { key: "D", text: `${timeB - timeA} hours` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Find Hourly Inflow Rates", text: `Pipe A rate = 1/${timeA} tank/hr. Pipe B rate = 1/${timeB} tank/hr.` },
      { rung: 2, title: "Combine Hourly Rates", text: `Combined Rate = 1/${timeA} + 1/${timeB}.` },
      { rung: 3, title: "Apply Shortcut Formula", text: `Combined Time T = (A × B) / (A + B) = (${timeA} × ${timeB}) / (${timeA} + ${timeB}).` },
      { rung: 4, title: "Calculate Result", text: `${combinedTime} hours.` }
    ],
    choice_explanations: {
      "A": { text: `Correct! T = (${timeA} × ${timeB}) / (${timeA} + ${timeB}) = ${combinedTime} hours.`, trap_type: null },
      "B": { text: "Simple average fallacy: averaged ${timeA} and ${timeB}.", trap_type: "simple_average_fallacy" },
      "C": { text: "Added hours together instead of rates.", trap_type: "time_addition_error" },
      "D": { text: "Subtracted hours.", trap_type: "subtraction_error" }
    },
    next_time_rule: "Combined Work Time T = (A × B) / (A + B).",
    deconstruct_text: `Work Formula:\nRate A = 1/${timeA}, Rate B = 1/${timeB}\nCombined Time T = (A × B) / (A + B) = (${timeA} × ${timeB}) / (${timeA + timeB}) = ${combinedTime} hours.`
  });
}

// --------------------------------------------------------------------------
// 4. NUMBER SERIES (25 Questions: num-nseries-200 to 224)
// Prime-based, square/cube, interleaved series
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 200 + i;
  const base = 2 + (i % 4);
  const n1 = Math.pow(base, 2);
  const n2 = Math.pow(base + 1, 2);
  const n3 = Math.pow(base + 2, 2);
  const n4 = Math.pow(base + 3, 2);
  const n5 = Math.pow(base + 4, 2); // Next term

  addQ({
    id: `num-nseries-${num}`,
    subtopic_id: "number-series",
    category_id: "numerical-ability",
    blueprint_id: `Perfect Squares Series Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Find the next number in the series: ${n1}, ${n2}, ${n3}, ${n4}, __?`,
    options: [
      { key: "A", text: `${n5}` },
      { key: "B", text: `${n4 + (n4 - n3)}` },
      { key: "C", text: `${n5 + 5}` },
      { key: "D", text: `${n4 * 2}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Identify Exponential Pattern", text: `Notice that terms are consecutive squares: ${base}², ${base+1}², ${base+2}², ${base+3}².` },
      { rung: 2, title: "Determine Next Base Number", text: `Next base number is ${base + 4}.` },
      { rung: 3, title: "Square the Base Number", text: `(${base + 4})² = ${n5}.` },
      { rung: 4, title: "Select Result", text: `Select Option A (${n5}).` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Sequence of consecutive squares: ${base}², ${base+1}², ${base+2}², ${base+3}², ${base+4}² = ${n5}.`, trap_type: null },
      "B": { text: "Applied constant difference to non-linear square series.", trap_type: "linear_constant_fallacy" },
      "C": { text: "Over-incremented square value.", trap_type: "arithmetic_error" },
      "D": { text: "Doubled last term.", trap_type: "doubling_fallacy" }
    },
    next_time_rule: "Recognize perfect squares (1, 4, 9, 16, 25, 36, 49, 64, 81, 100...) in exponential series.",
    deconstruct_text: `Exponential Pattern:\n${base}² = ${n1}\n${base+1}² = ${n2}\n${base+2}² = ${n3}\n${base+3}² = ${n4}\nNext term = (${base+4})² = ${n5}.`
  });
}

// --------------------------------------------------------------------------
// 5. BASIC OPERATIONS (25 Questions: num-ops-200 to 224)
// Scientific notation, order of operations MDAS, fractions/decimals
// --------------------------------------------------------------------------
for (let i = 0; i < 25; i++) {
  const num = 200 + i;
  const a = 12 + i;
  const b = 4;
  const c = 3 + (i % 3);
  const result = a + (b * c);

  addQ({
    id: `num-ops-${num}`,
    subtopic_id: "basic-operations",
    category_id: "numerical-ability",
    blueprint_id: `Order of Operations (PEMDAS/MDAS) Variant ${i + 1}`,
    difficulty_level: 2,
    question_text: `Evaluate the expression following standard Order of Operations (PEMDAS/MDAS): ${a} + ${b} × ${c} = __?`,
    options: [
      { key: "A", text: `${result}` },
      { key: "B", text: `${(a + b) * c}` },
      { key: "C", text: `${result + 2}` },
      { key: "D", text: `${a * b + c}` }
    ],
    correct_option: "A",
    hint_ladder: [
      { rung: 1, title: "Recall MDAS Rule", text: "Multiplication and Division MUST be performed BEFORE Addition and Subtraction." },
      { rung: 2, title: "Perform Multiplication First", text: `Multiply ${b} × ${c} = ${b * c}.` },
      { rung: 3, title: "Perform Addition Second", text: `Add ${a} + ${b * c} = ${result}.` },
      { rung: 4, title: "Select Final Value", text: `Select Option A (${result}).` }
    ],
    choice_explanations: {
      "A": { text: `Correct! Multiplication first (${b} × ${c} = ${b * c}), then addition (${a} + ${b * c} = ${result}).`, trap_type: null },
      "B": { text: "Left-to-right evaluation fallacy: added before multiplying.", trap_type: "left_to_right_evaluation_error" },
      "C": { text: "Arithmetic addition error.", trap_type: "arithmetic_error" },
      "D": { text: "Multiplied wrong pair of numbers.", trap_type: "operation_reordering_error" }
    },
    next_time_rule: "PEMDAS/MDAS Order: Multiplication and Division precede Addition and Subtraction.",
    deconstruct_text: `Order of Operations:\nStep 1 (Multiply): ${b} × ${c} = ${b * c}\nStep 2 (Add): ${a} + ${b * c} = ${result}.`
  });
}

console.log(`Generated ${questions.length} questions for Chunk 3A (Numerical Ability)!`);

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
