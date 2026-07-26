import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as yaml from 'js-yaml';

// Define the schema for output instructions
const SCHEMA = `
You must generate an array of JSON objects. Each object represents a Civil Service Exam question.
DO NOT wrap the output in markdown code blocks like \`\`\`json. Only return the raw JSON array.
Each object must strictly adhere to the following schema:
{
  "id": "string (e.g. num-ratio-001)",
  "category": "string (verbal-ability, analytical-ability, numerical-ability, general-information)",
  "subtopic": "string (e.g. Ratio and Proportion)",
  "difficulty": "number (1, 2, or 3)",
  "question_text": "string",
  "options": [
    { "key": "A", "text": "string" },
    { "key": "B", "text": "string" },
    { "key": "C", "text": "string" },
    { "key": "D", "text": "string" }
  ],
  "correct": "string ('A', 'B', 'C', or 'D')",
  "blueprint_id": "string (e.g. num-math)",
  "hint_ladder": [
    { "rung": 1, "title": "string", "text": "string" },
    { "rung": 2, "title": "string", "text": "string" },
    { "rung": 3, "title": "string", "text": "string" },
    { "rung": 4, "title": "string", "text": "string" }
  ],
  "deconstruct_text": "string (Detailed step-by-step breakdown of how to solve it)",
  "choice_explanations": {
    "A": { "text": "string", "trap_type": "string or null (MUST be null for the correct answer, and string for at least one incorrect)" },
    "B": { "text": "string", "trap_type": "string or null" },
    "C": { "text": "string", "trap_type": "string or null" },
    "D": { "text": "string", "trap_type": "string or null" }
  },
  "next_time_rule": "string (Max 140 chars. A heuristic rule to remember)",
  "status": "draft"
}
`;

async function generateQuestions(category: string, count: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
You are an expert civil service exam reviewer.
Generate ${count} highly realistic questions for the "${category}" category of the Philippine Civil Service Exam (Professional Level).
Ensure high pedagogical quality, realistic distractors (traps), and clear hint ladders.
${SCHEMA}
  `;

  console.log(`Requesting ${count} questions for ${category}...`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const outputText = response.text;
    if (!outputText) throw new Error('No output from Gemini');

    const items = JSON.parse(outputText);

    if (!Array.isArray(items)) {
      throw new Error('Response is not an array.');
    }

    const outDir = path.join(process.cwd(), 'content', 'questions', category);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    let saved = 0;
    for (const item of items) {
      if (!item.id) continue;
      const doc = yaml.dump(item, { sortKeys: false, lineWidth: -1 });
      const filename = `${item.id}.yaml`;
      fs.writeFileSync(path.join(outDir, filename), doc, 'utf8');
      saved++;
    }

    console.log(`✅ Successfully generated and saved ${saved} questions in ${category}.`);
  } catch (error) {
    console.error('Error generating questions:', error);
  }
}

const args = process.argv.slice(2);
const category = args[0] || 'numerical-ability';
const count = parseInt(args[1] || '5', 10);

generateQuestions(category, count);
