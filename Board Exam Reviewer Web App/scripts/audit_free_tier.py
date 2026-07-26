#!/usr/bin/env python3
"""
Diagnostic Audit for Free Tier Questions (q0001 - q0244)
"""

import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    if not os.path.exists(seed_path):
        print(f"[ERROR] seed.json not found at {seed_path}")
        return

    with open(seed_path, "r", encoding="utf-8-sig") as f:
        questions = json.load(f)

    free_tier = questions[:244]

    fallback_indicators = [
        "Focus on the core concept being asked",
        "Always re-read the core prompt key terms before confirming your final choice.",
        "Rule out options that do not match the core rule or facts.",
        "Step 1: Deconstruct Prompt"
    ]

    ai_enhanced = []
    fallback = []

    for q in free_tier:
        q_id = q.get("id", "unknown")
        hint_ladder = q.get("hint_ladder", [])
        dtext = q.get("deconstruct_text", "")
        next_rule = q.get("next_time_rule", "")

        is_fb = any(ind in dtext or ind in next_rule for ind in fallback_indicators)
        if not is_fb:
            for rung in hint_ladder:
                if any(ind in rung.get("text", "") for ind in fallback_indicators):
                    is_fb = True
                    break

        if is_fb:
            fallback.append(q_id)
        else:
            ai_enhanced.append(q_id)

    print("================================================================")
    print("📊 FREE TIER (q0001 - q0244) DIAGNOSTIC AUDIT RESULTS")
    print(f"   Total Free Tier Questions: {len(free_tier)}")
    print(f"   ✅ Fully AI-Enhanced by DeepSeek V4 Pro: {len(ai_enhanced)} ({len(ai_enhanced)/244*100:.1f}%)")
    print(f"   ⚠️ Fallback Scaffolded: {len(fallback)} ({len(fallback)/244*100:.1f}%)")
    print("================================================================")
    
    if fallback:
        print(f"Fallback Question IDs ({len(fallback)} total):")
        print(", ".join(fallback))

if __name__ == "__main__":
    main()
