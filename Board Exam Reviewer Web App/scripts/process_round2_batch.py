#!/usr/bin/env python3
"""
Round 2 Sequential 1-Question Microbatch Automation via DeepSeek V4 Pro API

Processes all 244 questions strictly ONE AT A TIME (1 question per API call) using
Claude's voice & writing style rules from ENHANCEMENT_ROUND2_PROMPT.md.

Auto-retries on failures, logs token consumption, tracks completed progress,
and merges directly into public/content/seed.json.

Usage:
    python -u scripts/process_round2_batch.py --all
    python -u scripts/process_round2_batch.py --limit 5
"""

import os
import sys
import json
import glob
import time
import argparse
from typing import List, Dict, Any, Tuple
from openai import OpenAI

# Ensure stdout uses UTF-8 and unbuffered printing on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# 18 Banned Phrases List from ENHANCEMENT_ROUND2_PROMPT.md
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
    "Incorrect choice. Selecting",
    "Step-by-Step Solution",
    "Why the Distractors Fail"
]


def load_env_api_key():
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        env_path = os.path.join(os.getcwd(), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("DEEPSEEK_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip('"').strip("'")
                        break
    return api_key


def check_banned_phrases(json_text: str) -> List[str]:
    found = []
    text_lower = json_text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in text_lower:
            found.append(phrase)
    return found


def merge_into_seed(enhanced_item: Dict[str, Any]):
    """Merges a single enhanced question directly into public/content/seed.json"""
    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    if not os.path.exists(seed_path):
        print(f"[WARN] seed.json not found at {seed_path}", flush=True)
        return

    with open(seed_path, "r", encoding="utf-8-sig") as f:
        seed_data = json.load(f)

    target_id = enhanced_item.get("id")
    if not target_id:
        return

    updated = False
    for i, item in enumerate(seed_data):
        if item.get("id") == target_id:
            seed_data[i] = enhanced_item
            updated = True
            break

    if not updated:
        seed_data.append(enhanced_item)

    # Write back with BOM for consistency
    with open(seed_path, "w", encoding="utf-8") as f:
        f.write('\uFEFF' + json.dumps(seed_data, indent=2, ensure_ascii=False))

    print(f"[MERGE] Merged question '{target_id}' into public/content/seed.json", flush=True)


def process_single_microbatch(filename: str, plan_dir: str, client: OpenAI, prompt_template: str, max_retries: int = 3) -> Dict[str, Any]:
    batch_path = os.path.join(plan_dir, "question-generation", "enhance-round2-batches", filename)
    if not os.path.exists(batch_path):
        raise FileNotFoundError(f"Batch file not found: {batch_path}")

    with open(batch_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    input_json = json.dumps(raw_items, indent=2)
    prompt_text = prompt_template.replace("[PASTE free_tier_qXXX.json CONTENTS HERE]", input_json)

    system_instruction = (
        "You are an expert personal mentor and pedagogical editor for a premium Philippine Civil Service Exam reviewer app. "
        "Explain concepts in simple, accessible, and intuitive terms using Claude's warm, clear, and highly engaging writing style. "
        "Return strictly a raw JSON array containing exactly 1 enhanced question object without markdown code blocks."
    )

    for attempt in range(1, max_retries + 1):
        try:
            print(f"[API CALL] Sending request to DeepSeek V4 Pro for {filename} (Attempt {attempt}/{max_retries})...", flush=True)
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=0.3,
                max_tokens=4096,
                timeout=60
            )

            content = response.choices[0].message.content
            if not content:
                raise RuntimeError("Empty response received from DeepSeek API.")

            usage = getattr(response, "usage", None)
            if usage:
                print(f"[TOKENS USED] Prompt: {usage.prompt_tokens} | Completion: {usage.completion_tokens} | Total: {usage.total_tokens}", flush=True)

            cleaned = content.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

            banned_found = check_banned_phrases(cleaned)
            if banned_found:
                print(f"[WARNING] Found {len(banned_found)} banned phrase(s):", file=sys.stderr, flush=True)
                for bp in banned_found:
                    print(f"   - {bp}", file=sys.stderr, flush=True)

            parsed = json.loads(cleaned, strict=False)
            if isinstance(parsed, dict) and len(parsed.keys()) == 1:
                val = list(parsed.values())[0]
                if isinstance(val, list):
                    parsed = val

            if not isinstance(parsed, list) or len(parsed) == 0:
                raise ValueError(f"Expected non-empty JSON list from API, got {type(parsed)}")

            enhanced_question = parsed[0]

            # Save individual output
            out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, filename.replace(".json", "_enhanced.json"))

            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(parsed, f, indent=2, ensure_ascii=False)

            # Auto-merge into seed.json
            merge_into_seed(enhanced_question)

            return enhanced_question

        except Exception as err:
            print(f"[ERROR] Attempt {attempt} failed for {filename}: {err}", file=sys.stderr, flush=True)
            if attempt == max_retries:
                raise err
            time.sleep(2)


def main():
    parser = argparse.ArgumentParser(description="Round 2 Sequential 1-Question Microbatch Automation via DeepSeek V4 Pro API")
    parser.add_argument("--file", type=str, help="Specific batch filename (e.g. free_tier_q001_ver-gram-008.json)")
    parser.add_argument("--all", action="store_true", help="Process all files in enhance-round2-batches")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of files to process")
    parser.add_argument("--resume", action="store_true", help="Skip already completed files in progress tracker")
    parser.add_argument(
        "--plan-dir",
        type=str,
        default=r"C:\Users\ACER\Downloads\exam reviewer plan",
        help="Path to exam reviewer plan directory"
    )
    args = parser.parse_args()

    api_key = load_env_api_key()
    if not api_key:
        print("[ERROR] DEEPSEEK_API_KEY is not set in environment or .env file.", file=sys.stderr, flush=True)
        sys.exit(1)

    prompt_path = os.path.join(args.plan_dir, "question-generation", "ENHANCEMENT_ROUND2_PROMPT.md")
    if not os.path.exists(prompt_path):
        print(f"[ERROR] Prompt file not found at {prompt_path}", file=sys.stderr, flush=True)
        sys.exit(1)

    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

    batch_dir = os.path.join(args.plan_dir, "question-generation", "enhance-round2-batches")

    if args.file:
        files = [args.file]
    elif args.all or args.limit > 0:
        all_paths = sorted(glob.glob(os.path.join(batch_dir, "free_tier_q*.json")))
        files = [os.path.basename(p) for p in all_paths]
        if args.limit > 0:
            files = files[:args.limit]
    else:
        print("Please specify --file <filename>, --all, or --limit <N>", file=sys.stderr, flush=True)
        sys.exit(1)

    # Tracker setup
    out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
    os.makedirs(out_dir, exist_ok=True)
    tracker_file = os.path.join(out_dir, "progress_tracker.json")

    tracker = {}
    if os.path.exists(tracker_file):
        try:
            with open(tracker_file, "r", encoding="utf-8") as f:
                tracker = json.load(f)
        except Exception:
            tracker = {}

    print(f"================================================================", flush=True)
    print(f"🚀 Starting DeepSeek V4 Pro 1-Question Microbatch Automation", flush=True)
    print(f"   Target Questions: {len(files)} | Tone: Claude Writing Style & Voice", flush=True)
    print(f"================================================================", flush=True)

    success_count = 0
    fail_count = 0

    for idx, f in enumerate(files, 1):
        if args.resume and tracker.get(f, {}).get("status") == "completed":
            print(f"[{idx}/{len(files)}] Skipping {f} (already completed).", flush=True)
            continue

        print(f"\n---> [{idx}/{len(files)}] Processing Microbatch: {f}...", flush=True)
        try:
            enhanced_item = process_single_microbatch(f, args.plan_dir, client, prompt_template)
            success_count += 1
            tracker[f] = {
                "status": "completed",
                "question_id": enhanced_item.get("id"),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            with open(tracker_file, "w", encoding="utf-8") as tr_f:
                json.dump(tracker, tr_f, indent=2)
            print(f"[SUCCESS {idx}/{len(files)}] Successfully processed and merged {f}", flush=True)
        except Exception as e:
            fail_count += 1
            print(f"[FAILED {idx}/{len(files)}] Could not process {f}: {e}", file=sys.stderr, flush=True)
            tracker[f] = {"status": "failed", "error": str(e)}
            with open(tracker_file, "w", encoding="utf-8") as tr_f:
                json.dump(tracker, tr_f, indent=2)

    print(f"\n================================================================", flush=True)
    print(f"🎉 Microbatch Automation Run Complete!", flush=True)
    print(f"   Successfully Processed & Merged: {success_count}/{len(files)}", flush=True)
    if fail_count > 0:
        print(f"   Failed: {fail_count}/{len(files)}", flush=True)
    print(f"================================================================", flush=True)


if __name__ == "__main__":
    main()
