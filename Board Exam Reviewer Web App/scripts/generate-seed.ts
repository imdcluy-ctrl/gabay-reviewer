import fs from 'fs';
import * as yaml from 'js-yaml';
import { glob } from 'glob';
import { validateContent } from './validate-content';

async function generateSeed() {
  console.log('Validating YAML content files...');
  const { errors, warnings } = await validateContent();

  warnings.forEach(w => console.warn('⚠️ WARNING:', w));
  if (errors.length > 0) {
    errors.forEach(e => console.error('❌ ERROR:', e));
    console.error(`\nCannot generate seed: ${errors.length} validation error(s) found.`);
    process.exit(1);
  }

  // Load content version
  let contentVersion = 1;
  if (fs.existsSync('content/meta.json')) {
    const meta = JSON.parse(fs.readFileSync('content/meta.json', 'utf8'));
    contentVersion = meta.version || 1;
  }

  const files = await glob('content/questions/**/*.yaml');
  const questions: any[] = [];

  for (const filePath of files) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const doc = yaml.load(fileContent) as any;

    const transformedQuestion = {
      id: doc.id,
      subtopic_id: doc.subtopic,
      category_id: doc.category,
      question_text: doc.question_text,
      options: doc.options,
      correct_option: doc.correct,
      difficulty_level: doc.difficulty || 2,
      hint_ladder: doc.hint_ladder,
      choice_explanations: doc.choice_explanations,
      next_time_rule: doc.next_time_rule,
      blueprint_id: doc.blueprint_id,
      deconstruct_text: doc.deconstruct_text,
      is_free: doc.is_free !== undefined ? doc.is_free : true,
      language: doc.language || 'en',
      content_version: contentVersion,
    };

    questions.push(transformedQuestion);
  }

  const outputJson = JSON.stringify(questions, null, 2);

  // Write to both content/seed.json and public/content/seed.json
  fs.writeFileSync('content/seed.json', outputJson, 'utf8');
  if (!fs.existsSync('public/content')) {
    fs.mkdirSync('public/content', { recursive: true });
  }
  fs.writeFileSync('public/content/seed.json', outputJson, 'utf8');

  console.log(`\n✅ Generated seed.json with ${questions.length} questions.`);
}

generateSeed();
