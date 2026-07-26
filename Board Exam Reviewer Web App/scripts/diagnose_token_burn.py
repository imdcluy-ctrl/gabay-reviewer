#!/usr/bin/env python3
"""
DeepSeek V4 Pro Diagnostic Analysis on Token Burn & Hard Budget Safeguards
"""

import os
import sys
import json
import datetime
from openai import OpenAI

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    api_key = os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        env_path = os.path.join(os.getcwd(), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("DEEPSEEK_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip('"').strip("'")
                        break

    if not api_key:
        print("[ERROR] DEEPSEEK_API_KEY not found.")
        sys.exit(1)

    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

    diagnostic_prompt = r"""
You are an elite AI Systems & API Optimization Engineer.
Analyze the following incident that occurred during a Python automation run with deepseek-v4-pro:

INCIDENT REPORT:
- Problem: The initial script run attempt for a single question (ver-gram-008) generated a completion on Attempt 1 (Prompt: 5,467 tokens, Completion: 5,327 tokens, Total: 10,794 tokens).
- Root Cause: However, Python's `re` module threw a `ValueError: look-behind requires fixed-width pattern` inside a local JSON repair function `repair_json`.
- Impact: Because the local Python code crashed on regex parsing, the script treated the attempt as a failure and retried 10 times automatically. Each retry sent ~5,400 prompt tokens + ~5,000 completion tokens, burning ~100,000 tokens total for 1 question!
- Resolution Implemented: We replaced the variable-width lookbehind with a fixed-width regex. On the second test run, Attempt 1 passed instantly with ZERO retries, spending 9,981 tokens total (Prompt: 5,467 | Completion: 4,514).

USER MANDATE:
"I won't permit any token spent over 10k per question."

TASK FOR DEEPSEEK V4 PRO:
1. Explain clearly why Python local code exceptions cause unnecessary API retries if not properly distinguished from API failures.
2. Provide recommendations on how to enforce a HARD TOTAL TOKEN BUDGET GUARD in Python (e.g. limiting prompt tokens by trimming prompt template, setting max completion tokens to 3,500 instead of 8,192, and halting retries if total tokens exceed a strict threshold).
3. Calculate the exact expected token range per question once prompt trimming and max_tokens=3,500 are applied.
"""

    print("================================================================")
    print("SENDING DIAGNOSTIC CONSULTATION TO DEEPSEEK V4 PRO")
    print("MODEL: deepseek-v4-pro")
    print("================================================================")

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=[
            {"role": "system", "content": "You are DeepSeek V4 Pro acting as an expert API cost and system reliability auditor."},
            {"role": "user", "content": diagnostic_prompt}
        ],
        temperature=0.2,
        max_tokens=4096
    )

    proof_data = {
        "request_url": "https://api.deepseek.com/v1/chat/completions",
        "request_model": "deepseek-v4-pro",
        "request_timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "http_status_code": 200,
        "raw_response": response.model_dump()
    }

    proof_path = os.path.join(os.getcwd(), "deepseek_token_burn_diagnostic_raw.json")
    with open(proof_path, "w", encoding="utf-8") as f:
        json.dump(proof_data, f, indent=2, ensure_ascii=False)

    print(f"DIAGNOSTIC PROOF SAVED TO: {proof_path}")
    print("================================================================")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
