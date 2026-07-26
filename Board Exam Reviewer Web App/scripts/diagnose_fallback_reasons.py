#!/usr/bin/env python3
"""
Diagnose Why 61 Free Tier Questions Triggered the Fallback Guard
"""

import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    tracker_path = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out", "progress_tracker_all.json")
    if not os.path.exists(tracker_path):
        print(f"[ERROR] tracker file not found at {tracker_path}")
        return

    with open(tracker_path, "r", encoding="utf-8") as f:
        tracker_data = json.load(f)

    fallback_indicators = [
        "Focus on the core concept being asked",
        "Always re-read the core prompt key terms before confirming your final choice.",
        "Rule out options that do not match the core rule or facts.",
        "Step 1: Deconstruct Prompt"
    ]

    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    with open(seed_path, "r", encoding="utf-8-sig") as sf:
        seed_questions = json.load(sf)

    free_tier = seed_questions[:244]

    reasons = {
        "empty_response_truncated": [],
        "json_parse_error": [],
        "connection_network_error": [],
        "hard_token_budget_exceeded": []
    }

    log_path = os.path.join(r"C:\Users\ACER\.gemini\antigravity-cli\brain\5557ee1a-9a21-4cd2-9dae-d478415192f2\.system_generated\tasks\task-1366.log")

    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8", errors="ignore") as lf:
            log_lines = lf.readlines()

        current_q = None
        for line in log_lines:
            if "Processing Microbatch:" in line:
                current_q = line.split("Processing Microbatch:")[1].strip()
            elif "Empty response received from DeepSeek API" in line and current_q:
                reasons["empty_response_truncated"].append(current_q)
            elif "JSON Extraction Error" in line and current_q:
                reasons["json_parse_error"].append(current_q)
            elif "Connection error" in line and current_q:
                reasons["connection_network_error"].append(current_q)
            elif "HARD BUDGET GUARD" in line and current_q:
                reasons["hard_token_budget_exceeded"].append(current_q)

    print("================================================================")
    print("📊 DIAGNOSTIC ROOT-CAUSE ANALYSIS FOR THE 61 FALLBACK QUESTIONS")
    print("================================================================")
    print(f"1. Empty Response / Max Tokens Truncated (DeepSeek hit 8,192 token limit before finishing JSON): {len(set(reasons['empty_response_truncated']))}")
    print(f"2. Hard Token Budget Guard (>10,000 tokens spent on single item): {len(set(reasons['hard_token_budget_exceeded']))}")
    print(f"3. Invalid JSON formatting from API output: {len(set(reasons['json_parse_error']))}")
    print(f"4. Network Connection Timeout: {len(set(reasons['connection_network_error']))}")
    print("================================================================")

if __name__ == "__main__":
    main()
