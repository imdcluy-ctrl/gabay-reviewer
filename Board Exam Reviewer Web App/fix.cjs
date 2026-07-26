const fs = require('fs');
const replace = (f, from, to) => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, c.replace(from, to));
  }
};

replace('scripts/validate-content.ts', "import path from 'path';\n", '');
replace('scripts/generate-seed.ts', "import path from 'path';\n", '');
replace('scripts/exam-preflight.ts', "import path from 'path';\n", '');
replace('src/hooks/useStudySession.ts', '}, [categoryId, profile, sessionType]);', '}, [categoryId, profile, sessionType, loadNextQuestion]);');
replace('tests/syncCoalesce.test.ts', "const attemptId = 'att-coalesce-test';", '');
replace('src/hooks/useMockExamSession.ts', '}, [sessionState]);', '}, [sessionState, finalizeSubmission]);');
replace('tests/selection.test.ts', "import type { SelectionConfig, SelectionResult } from '../src/lib/mockExamSelection';", "import type { SelectionResult } from '../src/lib/mockExamSelection';");
replace('tests/leitnerInjection.test.ts', "import { classifyErrorType, type ExamErrorType } from '../src/lib/leitnerInjection';", "import { classifyErrorType } from '../src/lib/leitnerInjection';");

console.log('Fixed warnings');
