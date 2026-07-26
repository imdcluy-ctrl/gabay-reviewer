#!/usr/bin/env python3
"""
Deep Diagnostic Audit: Identify AI-Enhanced vs Fallback Scaffold Questions in public/content/seed.json
"""

import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def audit_questions():
    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    if not os.path.exists(seed_path):
        print(f"[ERROR] seed.json not found at {seed_path}")
        return

    with open(seed_path, "r", encoding="utf-8-sig") as f:
        questions = json.load(f)

    ai_enhanced = []
    fallback_scaffold = []
    missing_enhanced_fields = []

    fallback_indicators = [
        "Focus on the core concept being asked",
        "Always re-read the core prompt key terms before confirming your final choice.",
        "Rule out options that do not match the core rule or facts.",
        "Step 1: Deconstruct Prompt"
    ]

    for q in questions:
        q_id = q.get("id", "unknown")
        hint_ladder = q.get("hint_ladder", [])
        dtext = q.get("deconstruct_text", "")
        next_rule = q.get("next_time_rule", "")

        if not hint_ladder or not dtext or not next_rule:
            missing_enhanced_fields.append(q_id)
            continue

        # Check if question uses fallback scaffold indicators
        is_fallback = any(ind in dtext or ind in next_rule for ind in fallback_indicators)
        if not is_fallback:
            # Check hint ladder for fallback indicators
            for rung in hint_ladder:
                if any(ind in rung.get("text", "") for ind in fallback_indicators):
                    is_fallback = True
                    break

        if is_fallback:
            fallback_scaffold.append(q)
        else:
            ai_enhanced.append(q)

    print("================================================================")
    print("DIAGNOSTIC AUDIT RESULTS FOR public/content/seed.json")
    print(f"Total Questions in Bank: {len(questions)}")
    print(f"Fully AI-Enhanced by DeepSeek V4 Pro: {len(ai_enhanced)} ({len(ai_enhanced)/len(questions)*100:.1f}%)")
    print(f"Fallback Scaffolded Questions: {len(fallback_scaffold)} ({len(fallback_scaffold)/len(questions)*100:.1f}%)")
    print(f"Missing Enhanced Fields: {len(missing_enhanced_fields)}")
    print("================================================================")

    # Save detailed breakdown
    report = {
        "total_questions": len(questions),
        "ai_enhanced_count": len(ai_enhanced),
        "fallback_scaffold_count": len(fallback_scaffold),
        "missing_fields_count": len(missing_enhanced_fields),
        "fallback_question_ids": [q["id"] for q in fallback_scaffold],
        "missing_question_ids": missing_enhanced_fields
    }

    report_path = os.path.join(os.getcwd(), "question_enhancement_audit_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"Full Audit Report Saved To: {report_path}")

if __name__ == "__main__":
    audit_questions()
