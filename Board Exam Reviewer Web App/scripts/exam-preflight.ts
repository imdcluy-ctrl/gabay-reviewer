import fs from 'fs';
import * as yaml from 'js-yaml';
import { glob } from 'glob';

async function runExamPreflightCLI() {
  console.log('🔍 Running Mock Exam Pool Pre-flight Check against Real Content Files...\n');

  const files = await glob('content/questions/**/*.yaml');
  const questions: any[] = [];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const doc = yaml.load(content);
    if (doc) questions.push(doc);
  }

  console.log(`Loaded ${questions.length} question files from content/questions/.\n`);

  const exams = [
    {
      id: 'cse-professional-v1',
      title: 'CSE-PPT Professional (170 Qs)',
      sections: [
        { section_id: 'verbal', name: 'Verbal Ability', needed: 60, categories: ['verbal-analogy', 'vocabulary', 'reading-comprehension', 'grammar', 'verbal-ability'] },
        { section_id: 'analytical', name: 'Analytical Ability', needed: 40, categories: ['logical-reasoning', 'data-interpretation', 'pattern-recognition', 'analytical-ability'] },
        { section_id: 'numerical', name: 'Numerical Ability', needed: 40, categories: ['arithmetic', 'algebra', 'word-problems', 'data-sufficiency', 'numerical-ability', 'ratio-proportion', 'percentage-interest'] },
        { section_id: 'general', name: 'General Information', needed: 30, categories: ['philippine-constitution', 'current-events', 'environment', 'abstract-reasoning', 'general-info'] },
      ],
    },
    {
      id: 'cse-subprofessional-v1',
      title: 'CSE-PPT Sub-Professional (165 Qs)',
      sections: [
        { section_id: 'verbal', name: 'Verbal Ability', needed: 60, categories: ['verbal-analogy', 'vocabulary', 'reading-comprehension', 'grammar', 'verbal-ability'] },
        { section_id: 'clerical', name: 'Clerical Ability', needed: 35, categories: ['clerical-operations', 'filing', 'spelling', 'clerical-ability'] },
        { section_id: 'numerical', name: 'Numerical Ability', needed: 40, categories: ['arithmetic', 'algebra', 'word-problems', 'data-sufficiency', 'numerical-ability', 'ratio-proportion', 'percentage-interest'] },
        { section_id: 'general', name: 'General Information', needed: 30, categories: ['philippine-constitution', 'current-events', 'environment', 'general-info'] },
      ],
    },
  ];

  let totalOk = true;

  for (const exam of exams) {
    console.log(`📋 Pre-flight for: ${exam.title}`);
    for (const s of exam.sections) {
      const catSet = new Set(s.categories);
      const available = questions.filter(q => catSet.has(q.category)).length;
      const isSatisfied = available >= s.needed;
      const statusIcon = isSatisfied ? '✅' : '⚠️';

      if (!isSatisfied) totalOk = false;

      console.log(`  ${statusIcon} ${s.name}: ${available}/${s.needed} questions available`);
    }
    console.log('');
  }

  if (totalOk) {
    console.log('🎉 ALL EXAM SECTIONS HAVE SUFFICIENT CONTENT FOR MOCK EXAMS!\n');
  } else {
    console.log('ℹ️ Pre-flight summary: Pilot question pool is currently being expanded. Full 170-item exams will require parallel content track (§11).\n');
  }
}

runExamPreflightCLI();
