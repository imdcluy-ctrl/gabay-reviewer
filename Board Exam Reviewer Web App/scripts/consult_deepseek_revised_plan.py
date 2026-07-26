#!/usr/bin/env python3
"""
DeepSeek V4 Pro Consultation: Revised Master Enhancement & Monetization Plan Review
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

    revised_master_plan = """
# 🏛️ REVISED MASTER ENHANCEMENT & SUBTLE MONETIZATION PLAN (v8.0)
## Incorporating DeepSeek V4 Pro Analysis & Production Feedback

---

## 1. CORE PIPELINE ARCHITECTURE & SAFEGUARDS

### A. Compact Prompt Footprint (~1,800 Tokens)
- Prompt template compacted from 5,400 tokens down to 1,890 tokens.
- Leaves 6,000–8,192 tokens of completion headroom for DeepSeek's internal reasoning thinking process.
- Guarantees total attempt size stays ~5,400–7,500 tokens (well below the 10,000 token budget).

### B. Hard Token Budget Guard (≤ 10,000 Tokens/Question)
- Cumulative token tracking per question across attempts.
- If cumulative tokens exceed 10,000 tokens, retries halt immediately and activate a deterministic 4-rung scaffold fallback without spending additional tokens.

### C. Defensive Type Safety & Resilient Parsing
- `merge_enhanced_fields` standardizes string choice explanations into uniform `{ text, trap_type }` objects.
- `extract_json_array_v2` uses outer bracket-balancing to isolate `[...]` array items and handle markdown fences or emojis.
- `soft_fix_character_budgets` smoothly clips paragraph overruns (>270 chars) and Watch-Out Zone lines (>90 chars).

---

## 2. SUBTLE & NON-INTRUSIVE MONETIZATION ARCHITECTURE

### A. Strict Anti-Distraction Rules (Zero-Tolerance)
1. **NO Ads During Active Answering**: 0 ads inside active question stem, hint ladder, or choice buttons.
2. **NO Sticky Bottom Overlays**: Never obscure the sticky Submit button bar (`qv-actions-sticky`).
3. **NO Interstitial Popups**: Zero full-screen popups during practice or mock exam sessions.

### B. Approved Non-Intrusive Placements
1. **Dashboard Feed Card**: Native responsive banner below Daily Streak card.
2. **Post-Question Worked Solution Footer**: Displayed at the very bottom of `DeconstructionCard` *after* answer submission.
3. **Category Selection List**: In-feed slot inserted every 5 subtopics.
4. **Session Complete Screen**: 300x250 Medium Rectangle on final summary card.

---

## REQUEST FOR DEEPSEEK V4 PRO SCORING & AUDIT:
Please evaluate this Revised Master Plan (v8.0) across all 5 relevant domains:
1. **Scannability & 375px Mobile UX Compatibility** (Score 0-100)
2. **Revenue Optimization & ECPM Efficiency** (Score 0-100)
3. **Study Focus & Anti-Distraction Safeguards** (Score 0-100)
4. **AdSense & SPA Technical Compliance** (Score 0-100)
5. **Overall System Readiness Score** (Score 0-100)

Provide specific scores and actionable recommendations to ensure 99%+ readiness in all domains.
"""

    print("================================================================")
    print("SENDING REVISED MASTER PLAN TO DEEPSEEK V4 PRO FOR AUDIT")
    print("MODEL: deepseek-v4-pro")
    print("================================================================")

    try:
        response = client.chat.completions.create(
            model="deepseek-v4-pro",
            messages=[
                {"role": "system", "content": "You are DeepSeek V4 Pro acting as an expert Systems & Web Monetization Auditor."},
                {"role": "user", "content": revised_master_plan}
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

        proof_path = os.path.join(os.getcwd(), "deepseek_v4_pro_revised_plan_review_raw.json")
        with open(proof_path, "w", encoding="utf-8") as f:
            json.dump(proof_data, f, indent=2, ensure_ascii=False)

        print(f"✅ RAW API PROOF SAVED TO: {proof_path}")
        print("================================================================")
        print(response.choices[0].message.content)

    except Exception as e:
        print(f"[API ERROR] {e}")
        # Save error proof file
        error_proof = {
            "request_url": "https://api.deepseek.com/v1/chat/completions",
            "request_model": "deepseek-v4-pro",
            "request_timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "error_details": str(e)
        }
        proof_path = os.path.join(os.getcwd(), "deepseek_v4_pro_revised_plan_review_raw.json")
        with open(proof_path, "w", encoding="utf-8") as f:
            json.dump(error_proof, f, indent=2, ensure_ascii=False)
        print(f"📄 ERROR PROOF SAVED TO: {proof_path}")

if __name__ == "__main__":
    main()
