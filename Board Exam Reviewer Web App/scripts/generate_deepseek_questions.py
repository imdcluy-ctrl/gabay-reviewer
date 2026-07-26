#!/usr/bin/env python3
"""
DeepSeek Multi-Layered Exam Item Batch Generator

This script connects to the DeepSeek API (using OpenAI Python SDK)
at base_url='https://api.deepseek.com' and model='deepseek-chat'.
It uses Pydantic JSON schemas to strictly enforce multi-layered exam item structures
and batch-generates questions into JSON/YAML files.

Usage:
    export DEEPSEEK_API_KEY="your-deepseek-api-key"
    python scripts/generate_deepseek_questions.py --category numerical-ability --count 10 --batch-size 5
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field, ValidationError

try:
    from openai import OpenAI
except ImportError:
    print("Error: 'openai' package is not installed. Run 'pip install openai' first.", file=sys.stderr)
    sys.exit(1)


# ============================================================================
# Pydantic Schemas for Multi-Layered Exam Items
# ============================================================================

class Option(BaseModel):
    key: Literal["A", "B", "C", "D"] = Field(description="Option key label")
    text: str = Field(description="Content text of the option choice")


class HintRung(BaseModel):
    rung: int = Field(ge=1, le=4, description="Step level from 1 to 4")
    title: str = Field(description="Short title for the hint level")
    text: str = Field(description="Guidance or clue text for this hint level")


class ChoiceExplanation(BaseModel):
    text: str = Field(description="Detailed explanation of why this option is correct or incorrect")
    trap_type: Optional[str] = Field(
        default=None,
        description="Cognitive trap or distractor type (e.g. 'miscalculation', 'formula_misuse'). MUST be null for correct option."
    )


class ExamItem(BaseModel):
    id: str = Field(description="Unique question identifier (e.g. num-ratio-001)")
    category: str = Field(description="Exam category (e.g. verbal-ability, analytical-ability, numerical-ability, general-information)")
    subtopic: str = Field(description="Specific subtopic within the category (e.g. Ratio and Proportion)")
    difficulty: Literal[1, 2, 3] = Field(description="Difficulty level: 1 (Easy), 2 (Medium), 3 (Hard)")
    question_text: str = Field(description="The full context and text of the question")
    options: List[Option] = Field(min_length=4, max_length=4, description="List of exactly 4 choices (A, B, C, D)")
    correct: Literal["A", "B", "C", "D"] = Field(description="The correct answer option key")
    blueprint_id: str = Field(description="Blueprint skill module ID (e.g. num-math)")
    hint_ladder: List[HintRung] = Field(min_length=4, max_length=4, description="Progressive 4-rung hint ladder")
    deconstruct_text: str = Field(description="Comprehensive step-by-step breakdown explaining the solution path")
    choice_explanations: Dict[Literal["A", "B", "C", "D"], ChoiceExplanation] = Field(
        description="Detailed explanations mapped to each choice key (A, B, C, D)"
    )
    next_time_rule: str = Field(description="Key takeaway / mental rule to remember for similar future questions (Max 140 chars)")
    status: str = Field(default="draft", description="Review status of the generated question")


class ExamItemBatch(BaseModel):
    questions: List[ExamItem] = Field(description="Array of generated multi-layered exam items")


# ============================================================================
# DeepSeek Generator Class
# ============================================================================

class DeepSeekExamGenerator:
    """
    Client for batch generating multi-layered exam questions using DeepSeek API
    via the official OpenAI Python SDK.
    """

    BASE_URL = "https://api.deepseek.com"
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(self, api_key: Optional[str] = None, model: str = DEFAULT_MODEL):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise ValueError(
                "DEEPSEEK_API_KEY environment variable is not set. "
                "Please set it or pass api_key explicitly."
            )
        
        self.model = model
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.BASE_URL
        )

    def generate_batch(self, category: str, count: int, subtopic: Optional[str] = None) -> List[ExamItem]:
        """
        Generate a single batch of exam items using DeepSeek model with strict JSON schema.
        """
        schema_json = json.dumps(ExamItemBatch.model_json_schema(), indent=2)

        subtopic_prompt = f" focusing on the subtopic '{subtopic}'" if subtopic else ""
        
        system_prompt = (
            "You are an expert Philippine Civil Service Exam test designer and reviewer.\n"
            "Your task is to construct highly realistic, high-quality multi-layered exam questions.\n"
            "You MUST output raw JSON strictly adhering to the specified JSON Schema.\n"
            "Do NOT wrap the output in markdown code blocks like ```json."
        )

        user_prompt = f"""Generate exactly {count} distinct questions for category '{category}'{subtopic_prompt}.

Strict Schema Requirements:
1. Each item must contain 4 options (A, B, C, D).
2. 'correct' must match the option key with the correct answer.
3. 'choice_explanations' for the correct option must have trap_type set to null.
4. Incorrect options must include meaningful trap_type classifications where applicable.
5. 'hint_ladder' must have exactly 4 progressive rungs (1 to 4).
6. 'next_time_rule' should be a punchy takeaway (max 140 chars).

Expected JSON Schema:
{schema_json}
"""

        print(f"Sending request to DeepSeek API ({self.model}) for {count} '{category}' items...")

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=4096
        )

        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("Received empty response from DeepSeek API.")

        # Clean up code fences if present
        cleaned_content = content.strip()
        if cleaned_content.startswith("```"):
            cleaned_content = cleaned_content.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

        try:
            batch_data = ExamItemBatch.model_validate_json(cleaned_content)
            return batch_data.questions
        except ValidationError as ve:
            print(f"JSON Validation Error from DeepSeek response: {ve}", file=sys.stderr)
            # Fallback raw attempt if wrapped inside array or top level dict
            parsed_raw = json.loads(cleaned_content)
            if isinstance(parsed_raw, list):
                return [ExamItem.model_validate(q) for q in parsed_raw]
            elif isinstance(parsed_raw, dict) and "questions" in parsed_raw:
                return [ExamItem.model_validate(q) for q in parsed_raw["questions"]]
            raise ve


def save_questions(items: List[ExamItem], output_dir: str, category: str):
    """Saves generated items to individual JSON files in the output directory."""
    target_dir = os.path.join(output_dir, category)
    os.makedirs(target_dir, exist_ok=True)

    saved_files = []
    for item in items:
        file_name = f"{item.id}.json"
        file_path = os.path.join(target_dir, file_name)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(item.model_dump_json(indent=2))
        saved_files.append(file_path)

    print(f"Saved {len(saved_files)} question items to '{target_dir}'.")
    return saved_files


def main():
    parser = argparse.ArgumentParser(
        description="DeepSeek SDK Multi-Layered Exam Item Batch Generator"
    )
    parser.add_argument(
        "--category",
        type=str,
        default="numerical-ability",
        help="Exam category (e.g. numerical-ability, verbal-ability, analytical-ability, general-information)"
    )
    parser.add_argument(
        "--subtopic",
        type=str,
        default=None,
        help="Subtopic area (e.g. 'Word Problems', 'Grammar Rules')"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Total number of exam items to generate"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=5,
        help="Number of questions per DeepSeek API request (default: 5)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="content/questions",
        help="Output directory path for generated questions"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="deepseek-chat",
        help="DeepSeek model name (default: deepseek-chat)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without calling DeepSeek API using mock generated items for schema validation"
    )

    args = parser.parse_args()

    if args.dry_run:
        print("[DRY RUN] Simulating batch generation with Pydantic schema validation...")
        all_generated: List[ExamItem] = []
        for i in range(1, args.count + 1):
            item = ExamItem(
                id=f"{args.category[:3]}-sample-{i:03d}",
                category=args.category,
                subtopic=args.subtopic or "General Application",
                difficulty=2,
                question_text=f"Sample question #{i} for category {args.category}?",
                options=[
                    Option(key="A", text="Option A answer"),
                    Option(key="B", text="Option B answer"),
                    Option(key="C", text="Option C answer"),
                    Option(key="D", text="Option D answer")
                ],
                correct="B",
                blueprint_id="num-math",
                hint_ladder=[
                    HintRung(rung=1, title="Identify core variables", text="Focus on given values."),
                    HintRung(rung=2, title="Set up equation", text="Express relationship algebraically."),
                    HintRung(rung=3, title="Solve for X", text="Perform step-by-step arithmetic."),
                    HintRung(rung=4, title="Verify solution", text="Plug value back into original context.")
                ],
                deconstruct_text="Detailed solution breakdown demonstrating the step-by-step resolution path.",
                choice_explanations={
                    "A": ChoiceExplanation(text="Incorrect due to off-by-one calculation error.", trap_type="miscalculation"),
                    "B": ChoiceExplanation(text="Correct answer arrived at through proper equation setup.", trap_type=None),
                    "C": ChoiceExplanation(text="Incorrect due to inverted ratio calculation.", trap_type="inverted_ratio"),
                    "D": ChoiceExplanation(text="Incorrect distractor based on simple addition instead of multiplication.", trap_type="operation_mismatch")
                },
                next_time_rule="Always cross-verify unit proportions before performing division.",
                status="draft"
            )
            all_generated.append(item)

        saved_paths = save_questions(all_generated, args.output_dir, args.category)
        print(f"\n[DRY RUN] Complete! Generated and saved {len(saved_paths)} mock items.")
        return

    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        print("Error: DEEPSEEK_API_KEY environment variable is missing.", file=sys.stderr)
        print("Please export DEEPSEEK_API_KEY='your_api_key' before running.", file=sys.stderr)
        print("Or use --dry-run to test schema validation without an API key.", file=sys.stderr)
        sys.exit(1)

    generator = DeepSeekExamGenerator(api_key=api_key, model=args.model)

    total_needed = args.count
    batch_size = args.batch_size
    all_generated: List[ExamItem] = []

    print(f"Starting batch generation: Total={total_needed}, Batch Size={batch_size}, Category='{args.category}'")

    generated_count = 0
    while generated_count < total_needed:
        current_batch_count = min(batch_size, total_needed - generated_count)
        print(f"\nProcessing batch {len(all_generated) // batch_size + 1}: Generating {current_batch_count} items...")

        try:
            batch_items = generator.generate_batch(
                category=args.category,
                count=current_batch_count,
                subtopic=args.subtopic
            )
            all_generated.extend(batch_items)
            generated_count += len(batch_items)
            print(f"Successfully generated {len(batch_items)} items. (Total progress: {generated_count}/{total_needed})")
        except Exception as e:
            print(f"Failed to generate batch: {e}", file=sys.stderr)
            break

    if all_generated:
        saved_paths = save_questions(all_generated, args.output_dir, args.category)
        print(f"\nBatch generation complete! Total items generated and saved: {len(saved_paths)}")
    else:
        print("\nNo items were generated.", file=sys.stderr)


if __name__ == "__main__":
    main()
