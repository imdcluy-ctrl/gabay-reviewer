import fs from 'fs';
import * as yaml from 'js-yaml';
import { glob } from 'glob';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

export async function validateContent(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  const files = await glob('content/questions/**/*.yaml');

  if (files.length === 0) {
    warnings.push('No YAML content files found in content/questions/');
  }

  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const doc = yaml.load(fileContent) as any;

      if (!doc || typeof doc !== 'object') {
        errors.push(`${filePath}: Invalid YAML structure`);
        continue;
      }

      // Check required top-level fields
      const requiredFields = [
        'id',
        'subtopic',
        'category',
        'difficulty',
        'question_text',
        'options',
        'correct',
        'blueprint_id',
        'hint_ladder',
        'deconstruct_text',
        'choice_explanations',
        'next_time_rule',
        'status',
      ];

      for (const field of requiredFields) {
        if (doc[field] === undefined || doc[field] === null || doc[field] === '') {
          errors.push(`${filePath}: Missing required field '${field}'`);
        }
      }

      // ID uniqueness
      if (doc.id) {
        if (seenIds.has(doc.id)) {
          errors.push(`${filePath}: Duplicate question ID '${doc.id}'`);
        } else {
          seenIds.add(doc.id);
        }
      }

      // Options validation
      if (Array.isArray(doc.options)) {
        if (doc.options.length !== 4) {
          errors.push(`${filePath}: Expected exactly 4 options, got ${doc.options.length}`);
        }
        const optionKeys = doc.options.map(o => o.key);
        if (!['A', 'B', 'C', 'D'].every(k => optionKeys.includes(k))) {
          errors.push(`${filePath}: Option keys must be A, B, C, D`);
        }
      } else if (doc.options) {
        errors.push(`${filePath}: 'options' field must be an array`);
      }

      // Correct option matches option key
      if (doc.correct && !['A', 'B', 'C', 'D'].includes(doc.correct)) {
        errors.push(`${filePath}: 'correct' must be A, B, C, or D (got '${doc.correct}')`);
      }

      // §6.4 Pedagogical Heuristics: Next-Time Rule length check [ERR]
      if (doc.next_time_rule) {
        if (typeof doc.next_time_rule !== 'string' || doc.next_time_rule.trim().length === 0) {
          errors.push(`${filePath}: next_time_rule must be non-empty string`);
        } else if (doc.next_time_rule.length > 140) {
          errors.push(`${filePath}: next_time_rule length (${doc.next_time_rule.length} chars) exceeds 140 char limit`);
        }
      }

      // Hint ladder validation & answer leakage check [WARN]
      if (Array.isArray(doc.hint_ladder)) {
        if (doc.hint_ladder.length !== 4) {
          warnings.push(`${filePath}: 'hint_ladder' expected 4 rungs (got ${doc.hint_ladder.length})`);
        }

        const correctOptObj = Array.isArray(doc.options) ? doc.options.find((o: any) => o.key === doc.correct) : null;
        const correctText = correctOptObj ? String(correctOptObj.text).toLowerCase().trim() : '';

        doc.hint_ladder.forEach((rung: any, idx: number) => {
          if (!rung.title || !rung.text) {
            errors.push(`${filePath}: Hint rung ${idx + 1} missing title or text`);
          } else if (correctText && rung.text.toLowerCase().includes(correctText)) {
            warnings.push(`${filePath}: Hint rung ${idx + 1} appears to contain the correct answer text verbatim`);
          }
        });
      } else if (doc.hint_ladder) {
        errors.push(`${filePath}: 'hint_ladder' must be an array`);
      }

      // Choice explanations & trap_type validation [ERR/WARN]
      if (doc.choice_explanations && typeof doc.choice_explanations === 'object') {
        let hasTrapType = false;

        ['A', 'B', 'C', 'D'].forEach(key => {
          const exp = doc.choice_explanations[key];
          if (!exp || !exp.text) {
            warnings.push(`${filePath}: Missing choice explanation text for option '${key}'`);
          } else {
            if (key === doc.correct && exp.trap_type !== null && exp.trap_type !== undefined) {
              errors.push(`${filePath}: Correct option '${key}' must have trap_type: null`);
            }
            if (key !== doc.correct && exp.trap_type) {
              hasTrapType = true;
            }
          }
        });

        if (!hasTrapType) {
          errors.push(`${filePath}: At least one incorrect option must have a non-empty 'trap_type'`);
        }
      } else if (doc.choice_explanations) {
        errors.push(`${filePath}: 'choice_explanations' must be an object map`);
      }

      // Difficulty validation
      if (doc.difficulty && ![1, 2, 3].includes(doc.difficulty)) {
        errors.push(`${filePath}: 'difficulty' must be 1, 2, or 3`);
      }

      // Status validation
      if (doc.status && !['draft', 'reviewed', 'live'].includes(doc.status)) {
        errors.push(`${filePath}: 'status' must be 'draft', 'reviewed', or 'live'`);
      }
    } catch (err: any) {
      errors.push(`${filePath}: Failed to parse YAML: ${err.message}`);
    }
  }

  return { errors, warnings };
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('validate-content.ts')) {
  validateContent().then(({ errors, warnings }) => {
    console.log('--- Content Validation Report ---');
    warnings.forEach(w => console.warn('⚠️ WARNING:', w));
    errors.forEach(e => console.error('❌ ERROR:', e));

    if (errors.length > 0) {
      console.error(`\nValidation failed with ${errors.length} error(s).`);
      process.exit(1);
    } else {
      console.log(`\n✅ Validation passed with ${warnings.length} warning(s).`);
      process.exit(0);
    }
  });
}
