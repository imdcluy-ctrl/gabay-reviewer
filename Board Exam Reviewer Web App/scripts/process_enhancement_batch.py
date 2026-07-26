#!/usr/bin/env python3
"""
Single Batch Enhancement Processor via DeepSeek API (deepseek-chat / DeepSeek V4 Pro)

Processes a single enhancement batch JSON file using the ENHANCEMENT_PROMPT template,
validates output against schema rules and the 16 banned phrases, and saves the enhanced batch.

Usage:
    python scripts/process_enhancement_batch.py --batch 1
"""

import os
import sys
import json
import argparse
from typing import List, Dict, Any, Tuple
from openai import OpenAI

# 16 Banned Phrases List
BANNED_PHRASES = [
    "This option represents a",
    "representing a cognitive error where the student",
    "misinterprets the specific provisions of the law",
    "confuses administrative periods",
    "incorrectly attributes official authority",
    "arising from an incorrect arithmetic operation",
    "arising from an incorrect scaling factor",
    "Professional and academic multiple-choice assessments require",
    "applying logical principles, category rules, or analytical procedures",
    "to determine the single correct answer",
    "Review the solution step by step",
    "Think carefully about",
    "Consider the options",
    "Choose the best answer",
    "Incorrect option. Selecting",
    "Incorrect choice. Selecting"
]


def check_banned_phrases(json_text: str) -> List[str]:
    """Scans JSON string for any occurrences of banned phrases."""
    found = []
    text_lower = json_text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in text_lower:
            found.append(phrase)
    return found


def enhance_single_batch(batch_number: int, base_dir: str):
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        print("Error: DEEPSEEK_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    batch_filename = f"enhance_batch_{batch_number:02d}.json"
    batch_path = os.path.join(base_dir, "question-generation", "enhance-batches", batch_filename)
    prompt_path = os.path.join(base_dir, "question-generation", "ENHANCEMENT_PROMPT.md")

    if not os.path.exists(batch_path):
        print(f"Error: Batch file not found: {batch_path}", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(prompt_path):
        print(f"Error: Prompt template not found: {prompt_path}", file=sys.stderr)
        sys.exit(1)

    with open(batch_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    # Process in sub-chunks of 3 questions to prevent API output token truncation
    chunk_size = 3
    all_enhanced_items = []
    total_banned_found = []

    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

    for idx in range(0, len(raw_items), chunk_size):
        chunk_items = raw_items[idx : idx + chunk_size]
        input_questions_json = json.dumps(chunk_items, indent=2)
        prompt_text = prompt_template.replace("[PASTE enhance_batch_XX.json CONTENTS HERE]", input_questions_json)

        print(f"Sub-batch call ({idx + 1}-{idx + len(chunk_items)} of {len(raw_items)})...")

        max_attempts = 3
        parsed = None
        banned_found = []

        for attempt in range(1, max_attempts + 1):
            try:
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "system", "content": "You are a senior exam content editor for a paid Philippine Civil Service Exam reviewer app. Return strictly raw JSON arrays of the enhanced question objects without markdown formatting."},
                        {"role": "user", "content": prompt_text}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=8192
                )

                content = response.choices[0].message.content
                if not content:
                    raise RuntimeError("Received empty response from DeepSeek API.")

                cleaned = content.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

                # Check for banned phrases
                banned_found = check_banned_phrases(cleaned)
                if banned_found:
                    print(f"[WARNING] Found {len(banned_found)} banned phrases in sub-batch output:", file=sys.stderr)
                    for bp in banned_found:
                        print(f"  - {bp}", file=sys.stderr)

                # Attempt JSON parse (strict=False permits unescaped newlines/control chars in long strings)
                parsed = json.loads(cleaned, strict=False)
                break  # Success!
            except (json.JSONDecodeError, RuntimeError, ValueError) as err:
                print(f"[RETRY] Sub-batch call attempt {attempt} failed ({err}). Retrying...", file=sys.stderr)
                if attempt == max_attempts:
                    raise err

        if isinstance(parsed, dict) and "questions" in parsed:
            parsed = parsed["questions"]
        elif isinstance(parsed, dict) and len(parsed.keys()) == 1:
            # Handle if wrapped under single key like {"items": [...]}
            val = list(parsed.values())[0]
            if isinstance(val, list):
                parsed = val

        if not isinstance(parsed, list):
            raise ValueError(f"Expected JSON list from API, got {type(parsed)}")

        all_enhanced_items.extend(parsed)
        total_banned_found.extend(banned_found)

    enhanced_items = all_enhanced_items
    banned_found = total_banned_found

    # Save enhanced batch output
    out_dir = os.path.join(process_cwd(), "content", "questions", "enhanced")
    os.makedirs(out_dir, exist_ok=True)
    out_batch_file = os.path.join(out_dir, f"enhance_batch_{batch_number:02d}_enhanced.json")

    with open(out_batch_file, "w", encoding="utf-8") as f:
        json.dump(enhanced_items, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Enhanced batch saved to: {out_batch_file}")

    # Merge into public/content/seed.json locally
    seed_path = os.path.join(process_cwd(), "public", "content", "seed.json")
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8-sig") as f:
            seed_data = json.load(f)

        enhanced_map = {item["id"]: item for item in enhanced_items if "id" in item}
        updated_count = 0
        for i, item in enumerate(seed_data):
            if item.get("id") in enhanced_map:
                seed_data[i] = enhanced_map[item["id"]]
                updated_count += 1

        with open(seed_path, "w", encoding="utf-8") as f:
            json.dump(seed_data, f, indent=2, ensure_ascii=False)

        print(f"[SUCCESS] Merged {updated_count} enhanced questions directly into 'public/content/seed.json'.")
    else:
        print(f"Note: seed.json not found at {seed_path}")

    # Track progress
    tracker_path = os.path.join(out_dir, "enhancement_tracker.json")
    tracker = {}
    if os.path.exists(tracker_path):
        with open(tracker_path, "r", encoding="utf-8") as f:
            tracker = json.load(f)

    tracker[f"batch_{batch_number:02d}"] = {
        "status": "completed",
        "question_count": len(enhanced_items),
        "banned_phrases_count": len(banned_found),
        "file": out_batch_file
    }

    with open(tracker_path, "w", encoding="utf-8") as f:
        json.dump(tracker, f, indent=2)

    return enhanced_items, len(banned_found)


def process_cwd():
    return os.getcwd()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process single enhancement batch with DeepSeek V4 Pro")
    parser.add_argument("--batch", type=int, default=1, help="Batch number (1 to 41)")
    parser.add_argument(
        "--plan-dir",
        type=str,
        default=r"C:\Users\ACER\Downloads\exam reviewer plan",
        help="Path to exam reviewer plan directory"
    )
    args = parser.parse_args()
    enhance_single_batch(args.batch, args.plan_dir)
