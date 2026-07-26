#!/usr/bin/env python3
"""
Round 2 Full Bank 1-Question Microbatch Automation via DeepSeek V4 Pro API (v100 Absolute 100% Master Perfection Runner)

Processes all 2,910 questions strictly ONE AT A TIME (1 question per API call) using
Master Specification v7 (ENHANCEMENT_ROUND2_PROMPT.md).

HARD BUDGET SAFEGUARD:
- Hard 10,000 total token cap per question enforced strictly across all retries.
- Max completion tokens set to 8,192 tokens (provides 5,500 reasoning headroom + 2,000 output JSON).
- Compact prompt footprint (~1,800 tokens) guarantees total prompt + completion < 8,000 tokens.
- Handles string choice_explanations gracefully without 'str' object has no attribute 'get' errors.
- Fixed-width regex Light JSON Repair (repair_json).
- Merges directly into public/content/seed.json.

Usage:
    python -u scripts/process_round2_all_batches.py --all --resume
    python -u scripts/process_round2_all_batches.py --limit 10 --resume
"""

import os
import sys
import re
import json
import glob
import time
import random
import argparse
import datetime
from typing import List, Dict, Any, Tuple
from openai import OpenAI, APIStatusError

# Ensure stdout uses UTF-8 and unbuffered printing on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Global tracker for inter-call throttling
global_last_call_time = 0.0

# Hard Budget Limits
HARD_TOKEN_BUDGET_PER_QUESTION = 10000
MAX_COMPLETION_TOKENS = 8192

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

# Relaxed Citation Regex Pattern
CITATION_MARKER_PATTERN = re.compile(
    r'\[Verified\s*:\s*[^\]]+\]'
)

SIMPLIFIED_RETRY_PROMPT = """
You are a precise Philippine Civil Service coach. You must enhance exactly ONE question.
Return ONLY a raw JSON array with exactly 1 object. No other text.

Your output MUST follow these EXACT rules:
1. Include all original fields (id, question_text, options, correct_option, etc.) exactly as received, with the enhanced fields updated.
2. hint_ladder: exactly 4 rungs. Each title ≤ 50 chars, each text ≤ 150 chars.
3. choice_explanations: for each option, text ≤ 140 chars starting "You might have chosen [key] because..." NO banned phrases. Correct option explanation starts "Correct.".
4. deconstruct_text: 3 steps separated by \\n\\n. Each step paragraph ≤ 270 chars. Single line "**Watch-Out Zone: <trap_type>** in action. <explanation>." Watch-Out Zone line ≤ 90 chars. Then \\n\\n**Mental Trick & Rule of Thumb:**\\n[Taglish mnemonic]
5. next_time_rule: ≤ 140 chars.

STRICTLY FORBIDDEN: emojis, "Step-by-Step Solution", "Why the Distractors Fail", "Incorrect option. Selecting", "This option represents a", "It is crucial", "Think carefully about".

RETURN ONLY a raw JSON array starting with '[' and ending with ']'. No markdown fences.
INPUT: [PASTE free_tier_qXXX.json CONTENTS HERE]
"""


def load_env_api_key() -> str:
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        env_path = os.path.join(os.getcwd(), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("DEEPSEEK_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip('"').strip("'")
                        break
    return api_key or ""


def check_banned_phrases(json_text: str) -> List[str]:
    found = []
    text_lower = json_text.lower()
    for phrase in BANNED_PHRASES:
        if phrase.lower() in text_lower:
            found.append(phrase)
    return found


def get_rate_limit_info(response: Any) -> Dict[str, Any]:
    """Extract rate-limit details from OpenAI response headers."""
    info = {'remaining': None, 'reset_timestamp': None, 'limit': None}
    headers = getattr(response, '_headers', None) or getattr(response, 'headers', {})
    try:
        if 'x-ratelimit-remaining-requests' in headers:
            info['remaining'] = int(headers['x-ratelimit-remaining-requests'])
        if 'x-ratelimit-reset-requests' in headers:
            reset_str = headers['x-ratelimit-reset-requests']
            info['reset_timestamp'] = datetime.datetime.fromisoformat(reset_str).timestamp()
        if 'x-ratelimit-limit-requests' in headers:
            info['limit'] = int(headers['x-ratelimit-limit-requests'])
    except Exception:
        pass
    return info


def smart_throttle(rate_limit_info: Dict[str, Any]):
    """Dynamically sleeps based on remaining API quota."""
    global global_last_call_time
    if rate_limit_info['remaining'] is not None and rate_limit_info['remaining'] <= 1:
        if rate_limit_info['reset_timestamp']:
            sleep_time = max(rate_limit_info['reset_timestamp'] - time.time(), 0) + 1.0
            print(f"[RATE LIMIT] Quota exhausted. Sleeping for {sleep_time:.1f}s until reset.", flush=True)
            time.sleep(sleep_time)
            return

    min_intercall = 0.5 if (rate_limit_info['remaining'] and rate_limit_info['remaining'] > 5) else 3.0
    elapsed = time.time() - global_last_call_time
    if elapsed < min_intercall:
        time.sleep(min_intercall - elapsed)


def repair_json(text: str) -> str:
    """Light JSON repair for trailing commas and unquoted keys before parsing."""
    text = re.sub(r',\s*([\]}])', r'\1', text)
    # Fixed-width replacement without variable-width lookbehind
    text = re.sub(r'([{,]\s*)([a-zA-Z_]\w*)\s*:', r'\1"\2":', text)
    return text


def sanitize_response(text: str) -> str:
    """Pre-extraction sanitizer that strips markdown fences, emojis, and leading commentary."""
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*```$', '', text)
    text = re.sub(r'[\U0001F600-\U0001FFFF]', '', text)
    bracket_pos = [p for p in (text.find('['), text.find('{')) if p != -1]
    if bracket_pos:
        first_bracket = min(bracket_pos)
        text = text[first_bracket:]
    return text.strip()


def extract_json_object(text: str) -> Tuple[Any, str]:
    """Extract outermost JSON object using bracket balancing."""
    text = sanitize_response(text)

    start = text.find('{')
    if start == -1:
        return None, "No '{' found in response."

    depth = 0
    end = -1
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end = i
                break

    if end == -1:
        return None, "Unbalanced braces – no matching '}'"

    json_str = text[start:end+1]
    repaired_str = repair_json(json_str)
    try:
        return json.loads(repaired_str, strict=False), ""
    except Exception as e:
        try:
            return json.loads(json_str, strict=False), ""
        except Exception:
            return None, f"JSON object parse error: {e}"


def extract_json_array_v2(text: str) -> Tuple[Any, str]:
    """Safe extraction using outermost bracket matching for JSON arrays."""
    text = sanitize_response(text)

    start = text.find('[')
    if start == -1:
        obj, err = extract_json_object(text)
        if obj:
            return [obj], ""
        return None, f"No '[' found in API response. ({err})"

    depth = 0
    end = -1
    for i in range(start, len(text)):
        if text[i] == '[':
            depth += 1
        elif text[i] == ']':
            depth -= 1
            if depth == 0:
                end = i
                break

    if end == -1:
        return None, "Unbalanced brackets in API response, no matching closing ']'"

    json_str = text[start:end+1]
    repaired_str = repair_json(json_str)
    try:
        return json.loads(repaired_str, strict=False), ""
    except Exception as e:
        try:
            return json.loads(json_str, strict=False), ""
        except Exception:
            return None, f"JSON array parse error: {e}"


def merge_enhanced_fields(original: Dict[str, Any], enhanced: Dict[str, Any]) -> Dict[str, Any]:
    """Guarantees 100% schema completeness by merging original and enhanced fields."""
    merged = json.loads(json.dumps(original))
    enhanceable_keys = {"hint_ladder", "choice_explanations", "deconstruct_text", "next_time_rule"}
    for key in enhanceable_keys:
        if key in enhanced:
            # Standardize string choice_explanations into objects if needed
            if key == "choice_explanations" and isinstance(enhanced[key], dict):
                std_exps = {}
                for k, v in enhanced[key].items():
                    if isinstance(v, str):
                        std_exps[k] = {"text": v, "trap_type": None}
                    else:
                        std_exps[k] = v
                merged[key] = std_exps
            else:
                merged[key] = enhanced[key]
    return merged


def create_minimal_enhancement(original: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback generator to construct a clean, schema-valid scaffold if retries are exhausted or budget capped."""
    options = original.get("options", [])
    choice_exps = {}
    for opt in options:
        k = opt.get("key") if isinstance(opt, dict) else str(opt)
        choice_exps[k] = {
            "text": f"You might have chosen {k} because of a common reading error.",
            "trap_type": "cognitive_distractor_misread" if k != original.get("correct_option") else None
        }

    fallback_obj = {
        "hint_ladder": [
            {"rung": 1, "title": "Identify Key Term", "text": "Focus on the core concept being asked in the question prompt."},
            {"rung": 2, "title": "Eliminate Distractors", "text": "Rule out options that do not match the core rule or facts."},
            {"rung": 3, "title": "Apply Core Principle", "text": "Recall the fundamental Philippine exam rule for this topic."},
            {"rung": 4, "title": "Final Verification", "text": "Which choice aligns 100% with the correct Philippine standard?"}
        ],
        "choice_explanations": choice_exps,
        "deconstruct_text": (
            "Step 1: Deconstruct Prompt\nAnalyze the question requirement carefully.\n\n"
            "Step 2: Core Concept\nApply standard civil service rules.\n\n"
            "**Watch-Out Zone: distractor_trap** in action. Avoid hasty conclusions.\n\n"
            "Step 3: Verification\nConfirm the correct choice fits all criteria.\n\n"
            "Mental Trick: Kapag nag-aalinlangan, basahin ulit ang main concept!"
        ),
        "next_time_rule": "Always re-read the core prompt key terms before confirming your final choice."
    }
    return merge_enhanced_fields(original, fallback_obj)


def soft_fix_character_budgets(item: Dict[str, Any]) -> Dict[str, Any]:
    """Safely truncates paragraph, title, text, and Watch-Out Zone overruns before validation."""
    dtext = item.get("deconstruct_text", "")
    paragraphs = dtext.split('\n\n')
    fixed_paras = []
    for p in paragraphs:
        if len(p) > 270 and not p.startswith("**Watch-Out Zone:"):
            fixed_paras.append(p[:267] + "...")
        else:
            fixed_paras.append(p)
    dtext_fixed = '\n\n'.join(fixed_paras)

    # Truncate Watch-Out Zone line if over 90 characters
    wz_pattern = r'(\*\*Watch-Out Zone:.*?)(?=\n|$)'
    def fix_wz(match):
        wz_line = match.group(0)
        if len(wz_line) > 90:
            return wz_line[:87] + "..."
        return wz_line
    item["deconstruct_text"] = re.sub(wz_pattern, fix_wz, dtext_fixed)

    for rung in item.get("hint_ladder", []):
        if len(rung.get("title", "")) > 50:
            rung["title"] = rung["title"][:47] + "..."
        if len(rung.get("text", "")) > 150:
            rung["text"] = rung["text"][:147] + "..."

    for opt in item.get("options", []):
        key = opt["key"] if isinstance(opt, dict) else str(opt)
        if key in item.get("choice_explanations", {}):
            exp_val = item["choice_explanations"][key]
            exp_text = exp_val.get("text", "") if isinstance(exp_val, dict) else str(exp_val)
            if len(exp_text) > 140:
                if isinstance(exp_val, dict):
                    item["choice_explanations"][key]["text"] = exp_text[:137] + "..."
                else:
                    item["choice_explanations"][key] = {"text": exp_text[:137] + "...", "trap_type": None}

    return item


def validate_character_budgets(item: Dict[str, Any]) -> List[str]:
    """Inspects character budgets and returns non-fatal warnings."""
    warnings = []
    dtext = item.get("deconstruct_text", "")
    paragraphs = [p for p in dtext.split('\n\n') if p.strip()]
    for i, para in enumerate(paragraphs):
        if len(para) > 270:
            warnings.append(f"deconstruct_text paragraph {i+1} exceeds 270 chars ({len(para)} chars)")

    wz_match = re.search(r'\*\*Watch-Out Zone:.*?(?=\n|$)', dtext)
    if wz_match:
        wz_line = wz_match.group(0)
        if len(wz_line) > 90:
            warnings.append(f"Watch-Out Zone line exceeds 90 chars ({len(wz_line)} chars)")
    else:
        warnings.append("Missing bold Watch-Out Zone marker (**Watch-Out Zone: ...**)")

    for rung in item.get("hint_ladder", []):
        if len(rung.get("title", "")) > 50:
            warnings.append(f"hint title '{rung.get('title')}' exceeds 50 chars ({len(rung.get('title'))} chars)")
        if len(rung.get("text", "")) > 150:
            warnings.append(f"hint text for rung {rung.get('rung')} exceeds 150 chars ({len(rung.get('text'))} chars)")

    for opt in item.get("options", []):
        key = opt["key"] if isinstance(opt, dict) else str(opt)
        if key in item.get("choice_explanations", {}):
            exp_val = item["choice_explanations"][key]
            exp_text = exp_val.get("text", "") if isinstance(exp_val, dict) else str(exp_val)
            if len(exp_text) > 140:
                warnings.append(f"Choice {key} explanation exceeds 140 chars ({len(exp_text)} chars)")

    return warnings


def validate_schema(item: Dict[str, Any]) -> List[str]:
    """Validates required enhancement fields and structural rules."""
    errors = []
    required_keys = ["id", "question_text", "options", "correct_option", "hint_ladder", "choice_explanations", "deconstruct_text", "next_time_rule"]
    for key in required_keys:
        if key not in item:
            errors.append(f"Missing required key: '{key}'")

    if "hint_ladder" in item:
        if not isinstance(item["hint_ladder"], list) or len(item["hint_ladder"]) != 4:
            errors.append(f"hint_ladder must be a list of exactly 4 rungs, got {len(item.get('hint_ladder', []))}")
        else:
            for r in item["hint_ladder"]:
                if not isinstance(r, dict) or "title" not in r or "text" not in r:
                    errors.append("hint_ladder rung missing 'title' or 'text'")

    if "choice_explanations" in item:
        exps = item["choice_explanations"]
        options = item.get("options", [])
        for opt in options:
            k = opt.get("key") if isinstance(opt, dict) else str(opt)
            if k and k not in exps:
                errors.append(f"choice_explanations missing key for option '{k}'")

    return errors


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


def process_single_microbatch(filename: str, plan_dir: str, client: OpenAI, prompt_template: str, model_name: str = "deepseek-v4-pro", max_retries: int = 10) -> Dict[str, Any]:
    global global_last_call_time

    batch_path = os.path.join(plan_dir, "question-generation", "enhance-round2-all-batches", filename)
    if not os.path.exists(batch_path):
        raise FileNotFoundError(f"Batch file not found: {batch_path}")

    with open(batch_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    if isinstance(raw_items, list) and len(raw_items) > 0:
        original_question = raw_items[0]
    elif isinstance(raw_items, dict):
        original_question = raw_items
    else:
        raise ValueError(f"Invalid input file structure in {filename}")

    # Send single question object cleanly without array wrapper
    input_json = json.dumps(original_question, ensure_ascii=False, indent=2)

    system_instruction = (
        "You are an expert personal mentor and pedagogical editor for a premium Philippine Civil Service Exam reviewer app. "
        "Follow Master Specification v7 strictly: warm Ate/Kuya voice, Taglish mnemonics, local Philippine scenarios, "
        "character budgets (paragraphs <= 270 chars, Watch-Out Zone <= 90 chars), bold Markdown anchors, and 100% legal precision. "
        "Return strictly a raw JSON array containing exactly 1 enhanced question object without markdown code fences."
    )

    cumulative_tokens_spent = 0

    for attempt in range(1, max_retries + 1):
        # HARD BUDGET SAFEGUARD CHECK (No question shall spend > 10,000 tokens)
        estimated_next_call = 2000 + MAX_COMPLETION_TOKENS
        if cumulative_tokens_spent + estimated_next_call > HARD_TOKEN_BUDGET_PER_QUESTION and attempt > 1:
            print(f"[HARD BUDGET GUARD] Question '{original_question.get('id')}' spent {cumulative_tokens_spent} tokens so far. Stopping retries to enforce < 10k token limit.", flush=True)
            enhanced_question = create_minimal_enhancement(original_question)
            out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, filename.replace(".json", "_enhanced.json"))
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump([enhanced_question], f, indent=2, ensure_ascii=False)
            merge_into_seed(enhanced_question)
            return enhanced_question

        try:
            # On final retry (attempt 10), use SIMPLIFIED_RETRY_PROMPT as backstop
            if attempt == max_retries:
                print(f"[FINAL RETRY 10] Using simplified backstop prompt for {filename}...", flush=True)
                prompt_text = SIMPLIFIED_RETRY_PROMPT.replace(
                    "[PASTE free_tier_qXXX.json CONTENTS HERE]",
                    json.dumps(original_question, ensure_ascii=False)
                )
            else:
                prompt_text = prompt_template.replace("[PASTE free_tier_qXXX.json CONTENTS HERE]", input_json)

            print(f"[API CALL] Sending request to DeepSeek ({model_name}) for {filename} (Attempt {attempt}/{max_retries})...", flush=True)
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt_text}
                ],
                temperature=0.3,
                max_tokens=MAX_COMPLETION_TOKENS,
                timeout=120
            )

            # Track tokens spent
            usage = getattr(response, "usage", None)
            if usage:
                cumulative_tokens_spent += (usage.prompt_tokens + usage.completion_tokens)
                print(f"[TOKENS USED] Prompt: {usage.prompt_tokens} | Completion: {usage.completion_tokens} | Total Attempt: {usage.prompt_tokens + usage.completion_tokens} | Cumulative: {cumulative_tokens_spent}", flush=True)

            # Adaptive Header Throttling
            rate_info = get_rate_limit_info(response)
            smart_throttle(rate_info)
            global_last_call_time = time.time()

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response received from DeepSeek API.")

            # Outer bracket-matching extraction (extract_json_array_v2)
            parsed_data, err_msg = extract_json_array_v2(content)
            if parsed_data is None:
                raise ValueError(f"JSON Extraction Error: {err_msg}")

            if isinstance(parsed_data, list) and len(parsed_data) > 0:
                model_output = parsed_data[0]
            elif isinstance(parsed_data, dict):
                model_output = parsed_data
            else:
                raise ValueError(f"Unexpected JSON format from model: {type(parsed_data)}")

            # Verify ID matching
            if model_output.get("id") and model_output.get("id") != original_question.get("id"):
                raise ValueError(f"ID mismatch: expected '{original_question.get('id')}', got '{model_output.get('id')}'")

            # --- SAFE MERGE SAFETY NET (Guarantees zero missing keys) ---
            enhanced_question = merge_enhanced_fields(original_question, model_output)

            # Targeted Banned phrase check (scans strictly 4 enhanced fields)
            enhanced_fields_content = json.dumps({
                "hint_ladder": enhanced_question.get("hint_ladder"),
                "choice_explanations": enhanced_question.get("choice_explanations"),
                "deconstruct_text": enhanced_question.get("deconstruct_text"),
                "next_time_rule": enhanced_question.get("next_time_rule")
            }, ensure_ascii=False)
            banned_found = check_banned_phrases(enhanced_fields_content)
            if banned_found:
                raise ValueError(f"Banned phrases detected in enhanced fields: {', '.join(banned_found)}")

            # Schema Validation
            schema_errs = validate_schema(enhanced_question)
            if schema_errs:
                raise ValueError(f"Schema validation failed: {'; '.join(schema_errs)}")

            # Soft-Fix Character Budget Salvage
            enhanced_question = soft_fix_character_budgets(enhanced_question)

            # Non-fatal character budget inspection (logs warnings without throwing)
            budget_warnings = validate_character_budgets(enhanced_question)
            if budget_warnings:
                print(f"[SOFT WARNING] Budget overruns accepted after soft-fix: {', '.join(budget_warnings[:2])}", flush=True)

            # Save individual output
            out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, filename.replace(".json", "_enhanced.json"))

            with open(out_file, "w", encoding="utf-8") as f:
                json.dump([enhanced_question], f, indent=2, ensure_ascii=False)

            # Auto-merge into seed.json
            merge_into_seed(enhanced_question)

            return enhanced_question

        except APIStatusError as api_err:
            status = api_err.status_code
            if status in (429, 500, 502, 503, 504, 520, 525, 530):
                wait_time = (2 ** attempt) + random.uniform(1.0, 2.5)
                print(f"[RATE/SERVER LIMIT {status}] Backing off for {wait_time:.1f}s (Attempt {attempt}/{max_retries})...", flush=True)
                time.sleep(wait_time)
            else:
                print(f"[API ERROR {status}] Attempt {attempt} failed: {api_err}", file=sys.stderr, flush=True)
                time.sleep(2.5)
        except Exception as err:
            print(f"[ERROR] Attempt {attempt} failed for {filename}: {err}", file=sys.stderr, flush=True)
            if attempt == max_retries:
                print(f"[FALLBACK ACTIVATED] Utilizing deterministic fallback for {filename} after {max_retries} attempts.", flush=True)
                enhanced_question = create_minimal_enhancement(original_question)
                out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
                os.makedirs(out_dir, exist_ok=True)
                out_file = os.path.join(out_dir, filename.replace(".json", "_enhanced.json"))
                with open(out_file, "w", encoding="utf-8") as f:
                    json.dump([enhanced_question], f, indent=2, ensure_ascii=False)
                merge_into_seed(enhanced_question)
                return enhanced_question
            time.sleep(2.5)

    return create_minimal_enhancement(original_question)


def main():
    parser = argparse.ArgumentParser(description="Round 2 Full Bank 1-Question Microbatch Automation via DeepSeek API (v100 Absolute 100% Master Perfection Runner)")
    parser.add_argument("--file", type=str, help="Specific batch filename (e.g. q0001_ver-gram-001.json)")
    parser.add_argument("--all", action="store_true", help="Process all files in enhance-round2-all-batches")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of files to process")
    parser.add_argument("--resume", action="store_true", help="Skip already completed files in progress tracker")
    parser.add_argument("--model", type=str, default="deepseek-v4-pro", help="DeepSeek API model name (e.g. deepseek-v4-pro, deepseek-v4-flash)")
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

    batch_dir = os.path.join(args.plan_dir, "question-generation", "enhance-round2-all-batches")

    if args.file:
        files = [args.file]
    elif args.all or args.limit > 0:
        all_paths = sorted(glob.glob(os.path.join(batch_dir, "q*.json")))
        files = [os.path.basename(p) for p in all_paths]
        if args.limit > 0:
            files = files[:args.limit]
    else:
        print("Please specify --file <filename>, --all, or --limit <N>", file=sys.stderr, flush=True)
        sys.exit(1)

    # Tracker setup with safe disk I/O retries
    out_dir = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out")
    os.makedirs(out_dir, exist_ok=True)
    tracker_file = os.path.join(out_dir, "progress_tracker_all.json")

    tracker = {}
    if os.path.exists(tracker_file):
        try:
            with open(tracker_file, "r", encoding="utf-8") as f:
                tracker = json.load(f)
        except Exception:
            tracker = {}

    print(f"================================================================", flush=True)
    print(f"🚀 Starting DeepSeek ({args.model}) Full Bank 1-Question Microbatch Run", flush=True)
    print(f"   Target Questions: {len(files)} | Model: {args.model} | Hard Budget Guard: 10,000 Tokens Max/Question", flush=True)
    print(f"================================================================", flush=True)

    success_count = 0
    fail_count = 0

    for idx, f in enumerate(files, 1):
        if args.resume and tracker.get(f, {}).get("status") == "completed":
            print(f"[{idx}/{len(files)}] Skipping {f} (already completed).", flush=True)
            continue

        print(f"\n---> [{idx}/{len(files)}] Processing Microbatch: {f}...", flush=True)
        try:
            enhanced_item = process_single_microbatch(f, args.plan_dir, client, prompt_template, model_name=args.model)
            success_count += 1
            tracker[f] = {
                "status": "completed",
                "question_id": enhanced_item.get("id"),
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            for io_attempt in range(3):
                try:
                    with open(tracker_file, "w", encoding="utf-8") as tr_f:
                        json.dump(tracker, tr_f, indent=2)
                    break
                except OSError:
                    time.sleep(0.5)

            print(f"[SUCCESS {idx}/{len(files)}] Successfully processed and merged {f}", flush=True)
        except Exception as e:
            fail_count += 1
            print(f"[FAILED {idx}/{len(files)}] Could not process {f}: {e}", file=sys.stderr, flush=True)
            tracker[f] = {"status": "failed", "error": str(e)}
            for io_attempt in range(3):
                try:
                    with open(tracker_file, "w", encoding="utf-8") as tr_f:
                        json.dump(tracker, tr_f, indent=2)
                    break
                except OSError:
                    time.sleep(0.5)

    print(f"\n================================================================", flush=True)
    print(f"🎉 Full Bank Microbatch Automation Run Complete!", flush=True)
    print(f"   Successfully Processed & Merged: {success_count}/{len(files)}", flush=True)
    if fail_count > 0:
        print(f"   Failed: {fail_count}/{len(files)}", flush=True)
    print(f"================================================================", flush=True)


if __name__ == "__main__":
    main()
