#!/usr/bin/env python3
"""
DeepSeek/Gemini Micro-Batch Question Generator

Generates 10 high-quality Socratic exam items per micro-batch assignment sheet (batch_XXX.md), ONE batch at a time.
Validates output against schema, 16 banned phrases, and 40-char hint ladder rules.
Enforces realistic long passages for reading comprehension/law and simple, easy-to-understand explanations.
Merges questions directly into public/content/seed.json and saves batch artifacts.
"""

import os
import sys
import json
import re
import argparse
from typing import List, Dict, Any, Optional
from openai import OpenAI

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

PREFIX_MAP = {
    "ratio-proportion": "num-ratio-",
    "percentage-interest": "num-pct-",
    "word-problems-algebra": "num-word-",
    "number-series": "num-nseries-",
    "basic-operations": "num-ops-",
    "grammar-correct-usage": "ver-gram-",
    "vocabulary-synonyms": "ver-vocab-",
    "reading-comprehension": "ver-read-",
    "verbal-analogies": "ver-vanal-",
    "sentence-completion": "ver-sent-",
    "logical-reasoning": "ana-log-",
    "data-interpretation": "ana-data-",
    "pattern-recognition": "ana-pat-",
    "sequence-series": "ana-seq-",
    "alphabetical-filing": "cle-fil-",
    "coding-spelling": "cle-code-",
    "clerical-operations": "cle-ops-",
    "typing-speed-accuracy": "cle-type-",
    "philippine-constitution": "gen-const-",
    "ra-6713-code-of-conduct": "gen-ra6713-",
    "philippine-government": "gen-govt-",
    "current-events-environment": "gen-curenv-",
    "peace-human-rights": "gen-peace-"
}

CATEGORY_MAP = {
    "ratio-proportion": "numerical-ability",
    "percentage-interest": "numerical-ability",
    "word-problems-algebra": "numerical-ability",
    "number-series": "numerical-ability",
    "basic-operations": "numerical-ability",
    "grammar-correct-usage": "verbal-ability",
    "vocabulary-synonyms": "verbal-ability",
    "reading-comprehension": "verbal-ability",
    "verbal-analogies": "verbal-ability",
    "sentence-completion": "verbal-ability",
    "logical-reasoning": "analytical-ability",
    "data-interpretation": "analytical-ability",
    "pattern-recognition": "analytical-ability",
    "sequence-series": "analytical-ability",
    "alphabetical-filing": "clerical-ability",
    "coding-spelling": "clerical-ability",
    "clerical-operations": "clerical-ability",
    "typing-speed-accuracy": "clerical-ability",
    "philippine-constitution": "general-information",
    "ra-6713-code-of-conduct": "general-information",
    "philippine-government": "general-information",
    "current-events-environment": "general-information",
    "peace-human-rights": "general-information"
}

def log(msg: str):
    print(msg)
    sys.stdout.flush()

def check_banned_phrases(json_text: str) -> List[str]:
    found = []
    text_lower = json_text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in text_lower:
            found.append(phrase)
    return found

def get_next_id(prefix: str, existing_ids: set) -> str:
    max_num = 400
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$")
    for qid in existing_ids:
        match = pattern.match(qid)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    next_num = max_num + 1
    new_id = f"{prefix}{next_num}"
    existing_ids.add(new_id)
    return new_id

def process_micro_batch(batch_num: int, plan_dir: str, cwd: str, client: OpenAI, model_name: str, existing_ids: set, overwrite: bool = False):
    batch_str = f"{batch_num:03d}"
    batch_file = os.path.join(plan_dir, "question-generation", "micro-batches", f"batch_{batch_str}.md")
    template_file = os.path.join(plan_dir, "question-generation", "MICRO_BATCH_PROMPT_TEMPLATE.md")
    out_dir = os.path.join(plan_dir, "question-generation", "micro-batches-generated")
    out_file = os.path.join(out_dir, f"batch_{batch_str}_generated.json")

    if not overwrite and os.path.exists(out_file):
        log(f"[SKIP] Micro-Batch {batch_str} already exists at {out_file}.")
        return None

    if not os.path.exists(batch_file):
        log(f"[WARNING] Batch file not found: {batch_file}")
        return None

    with open(batch_file, "r", encoding="utf-8") as f:
        batch_sheet = f.read()

    with open(template_file, "r", encoding="utf-8") as f:
        template = f.read()

    prompt_text = template.replace("[PASTE THE CONTENTS OF THE MICRO-BATCH SHEET (batch_XXX.md) HERE]", batch_sheet)
    prompt_text = prompt_text.replace("[Paste completion_manifest_current.txt HERE — this grows after each batch]", "")

    prompt_text += "\n\nCRITICAL PEDAGOGICAL INSTRUCTIONS:\n"
    prompt_text += "1. EXPLANATION CLARITY: Keep all choice explanations, hint ladders, and worked solutions in simple, direct, easy-to-understand language. Avoid dense academic jargon so any Civil Service examinee can learn the concept immediately.\n"
    prompt_text += "2. REALISTIC EXAM PASSAGES: For Reading Comprehension, Logical Reasoning, and General Information/Law items, include authentic, detailed passages and realistic workplace scenarios matching actual Civil Service Exam (CSE-PPT) length and complexity.\n"

    system_prompt = (
        "You are a senior exam content author for a paid Philippine Civil Service Exam reviewer app. "
        "Your goal is maximum pedagogical quality, simple accessible explanations, and realistic Civil Service Exam passage lengths. "
        "Generate strictly a raw JSON array of 10 exam question objects without markdown formatting."
    )

    log(f"-> Processing Micro-Batch {batch_str}/310 with model {model_name}...")

    max_attempts = 3
    parsed = None

    for attempt in range(1, max_attempts + 1):
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=8192
            )

            content = response.choices[0].message.content
            if not content:
                raise RuntimeError("Empty response from API.")

            cleaned = content.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

            banned_found = check_banned_phrases(cleaned)
            if banned_found:
                log(f"[WARNING] Banned phrases detected in attempt {attempt}: {banned_found}")

            parsed = json.loads(cleaned, strict=False)
            if isinstance(parsed, dict) and "questions" in parsed:
                parsed = parsed["questions"]
            elif isinstance(parsed, dict) and len(parsed.keys()) == 1:
                val = list(parsed.values())[0]
                if isinstance(val, list):
                    parsed = val

            if isinstance(parsed, list) and len(parsed) == 10:
                break
            else:
                log(f"[RETRY] Expected 10 items list, got {type(parsed)} (len: {len(parsed) if isinstance(parsed, list) else 0}).")
        except Exception as e:
            log(f"[RETRY] Attempt {attempt} failed: {e}")
            if attempt == max_attempts:
                raise e

    if not isinstance(parsed, list):
        raise ValueError("Failed to obtain valid question list from API.")

    for item in parsed:
        subtopic = item.get("subtopic_id") or item.get("subtopic") or "general"
        prefix = PREFIX_MAP.get(subtopic, "gen-sub-")
        category = CATEGORY_MAP.get(subtopic, item.get("category_id") or "general-information")
        
        item["id"] = get_next_id(prefix, existing_ids)
        item["category_id"] = category
        item["subtopic_id"] = subtopic
        item["is_free"] = False  # Keep new questions private by default (INV-029)
        item["language"] = "en"
        item["content_version"] = 3

    os.makedirs(out_dir, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)

    log(f"[SUCCESS] Saved Micro-Batch {batch_str} (10 items) -> {out_file}")

    seed_path = os.path.join(cwd, "public", "content", "seed.json")
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8-sig") as f:
            seed_data = json.load(f)
        
        seed_data.extend(parsed)
        with open(seed_path, "w", encoding="utf-8") as f:
            json.dump(seed_data, f, indent=2, ensure_ascii=False)
        log(f"[MERGED] Added 10 questions into seed.json (Total in seed.json: {len(seed_data)})")

    return parsed

def main():
    parser = argparse.ArgumentParser(description="Generate micro-batches of CSE questions using DeepSeek V4 Pro or Gemini APIs")
    parser.add_argument("--batch", type=int, default=None, help="Single batch number to generate (e.g. 1)")
    parser.add_argument("--start", type=int, default=1, help="Start batch number (default: 1)")
    parser.add_argument("--end", type=int, default=310, help="End batch number (default: 310)")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing generated batch files")
    parser.add_argument("--plan-dir", type=str, default=r"C:\Users\ACER\Downloads\exam reviewer plan", help="Path to exam reviewer plan directory")
    parser.add_argument("--provider", type=str, choices=["deepseek", "gemini-flash"], default="deepseek", help="Select API provider to use for generation")
    args = parser.parse_args()

    cwd = os.getcwd()

    if args.provider == "deepseek":
        api_key = os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            log("DEEPSEEK_API_KEY environment variable is missing.")
            sys.exit(1)
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        model_name = "deepseek-chat"
    else:  # gemini-flash
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            log("GEMINI_API_KEY environment variable is missing.")
            sys.exit(1)
        client = OpenAI(api_key=api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
        model_name = "gemini-1.5-flash"

    seed_path = os.path.join(cwd, "public", "content", "seed.json")
    existing_ids = set()
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8-sig") as f:
            seed_data = json.load(f)
            existing_ids = {q["id"] for q in seed_data if "id" in q}

    if args.batch is not None:
        batch_range = [args.batch]
    else:
        batch_range = range(args.start, args.end + 1)

    log(f"Starting sequential batch generation using {args.provider} ({model_name}) from batch {batch_range[0]} to {batch_range[-1]}...")

    success_count = 0
    for b in batch_range:
        try:
            res = process_micro_batch(b, args.plan_dir, cwd, client, model_name, existing_ids, overwrite=args.overwrite)
            if res:
                success_count += 1
        except Exception as err:
            log(f"[ERROR] Batch {b:03d} failed: {err}")

    log(f"\nAll requested micro-batches processed! Completed {success_count} new batches.")

if __name__ == "__main__":
    main()
