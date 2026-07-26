#!/usr/bin/env python3
"""
DeepSeek V4 Pro Evaluation Protocol for Gabay Reviewer Homepage
User Feedback: "the visuals are too much. i want a simple to follow screen and helpful one"
Target: Comprehensive UX Critique, Score (0-100), and Ideal Simplified Homepage Blueprint
Raw Output: deepseek_v4_pro_homepage_critique_raw.json
"""

import json
import os
import sys
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

API_KEY = os.environ.get("DEEPSEEK_API_KEY", "your-deepseek-api-key-here")
API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL_NAME = "deepseek-v4-pro"

DASHBOARD_CODE_SUMMARY = """
CURRENT GABAY HOMEPAGE (Dashboard.tsx) STRUCTURE:
Stacked Components rendered on user landing:
1. OfflineBanner (Top warning bar)
2. Header (Title: GABAY - AI Exam Coach, Subtitle, Help Button)
3. GuestBanner (Alert box encouraging account signup)
4. MergePrompt (Prompt to sync guest attempts)
5. PWAInstallPrompt (Install app to home screen banner)
6. WelcomeBanner ("Maligayang pagdating, Kapatid! 👋 You've completed X questions...")
7. ExamCountdown (Countdown timer to CSE exam date)
8. ReadinessIndex (Predictive readiness percentage widget & radial gauge)
9. AdUnit (In-feed native Google ad container)
10. ErrorPatternSummary (Metacognitive error breakdown teaser)
11. ContinueCard ("Continue Studying: Numerical Ability — Resume →")
12. StreakDisplay (Daily study streak counter & 🔥 fire icons)
13. FooterDisclaimer & BottomNav
"""

PROMPT_TEXT = """You are DeepSeek V4 Pro, acting as an elite UX/UI Principal Designer and Cognitive Ergonomics Specialist for EdTech Web Apps in the Philippines.

The product owner of "Gabay Reviewer" (a Philippine Civil Service Exam review web app) gave the following feedback:
"i think the visuals are too much. i want a simple to follow screen and helpful one. im not even sure what would be a good content when the user lands on the page. evaluate our current homepage."

Review the current homepage structure below:
{summary}

Perform a rigorous UX/UI evaluation and return a JSON object matching this exact schema:
{{
  "overall_ux_score": <integer 0-100>,
  "cognitive_load_diagnosis": "<Detailed explanation of why stacking 10+ widgets creates visual fatigue and decision paralysis>",
  "key_flaws": [
    "<Flaw 1>",
    "<Flaw 2>",
    "<Flaw 3>"
  ],
  "ideal_landing_content_blueprint": [
    "Section 1: ...",
    "Section 2: ...",
    "Section 3: ..."
  ],
  "refactoring_recommendations": [
    "<Actionable step 1>",
    "<Actionable step 2>",
    "<Actionable step 3>"
  ]
}}
"""

def evaluate_homepage():
    print("🚀 Launching DeepSeek V4 Pro Homepage UX Evaluation...")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are DeepSeek V4 Pro. Respond ONLY with a valid JSON object."},
            {"role": "user", "content": PROMPT_TEXT.format(summary=DASHBOARD_CODE_SUMMARY)}
        ],
        "response_format": {"type": "json_object"},
        "max_tokens": 8192,
        "temperature": 0.2
    }

    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        print(f"HTTP Status Code: {resp.status_code}")

        raw_json_path = os.path.join(os.getcwd(), "deepseek_v4_pro_homepage_critique_raw.json")
        with open(raw_json_path, "w", encoding="utf-8") as rf:
            rf.write(resp.text)

        if resp.status_code == 200:
            result_data = resp.json()
            content = result_data["choices"][0]["message"]["content"]
            critique_obj = json.loads(content)

            print("================================================================")
            print(f"📊 DEEPSEEK V4 PRO HOMEPAGE UX SCORE: {critique_obj.get('overall_ux_score', 0)} / 100")
            print("================================================================")
            print(f"🧠 Cognitive Load Diagnosis:\n{critique_obj.get('cognitive_load_diagnosis')}\n")
            print("❌ Key Flaws:")
            for flaw in critique_obj.get("key_flaws", []):
                print(f"  - {flaw}")
            print("\n✨ Recommended Simplified Landing Blueprint:")
            for section in critique_obj.get("ideal_landing_content_blueprint", []):
                print(f"  - {section}")
            print("\n🔧 Actionable Recommendations:")
            for rec in critique_obj.get("refactoring_recommendations", []):
                print(f"  - {rec}")
            print("================================================================")
            print(f"📄 Raw Critique Saved To: {raw_json_path}")
        else:
            print(f"❌ DeepSeek API Call Failed: {resp.text}")

    except Exception as e:
        print(f"❌ Error running evaluation: {e}")

if __name__ == "__main__":
    evaluate_homepage()

