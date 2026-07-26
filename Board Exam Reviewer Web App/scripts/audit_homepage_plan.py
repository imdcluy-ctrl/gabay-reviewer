#!/usr/bin/env python3
"""
DeepSeek V4 Pro Audit Protocol for Gabay Homepage Redesign Plan
Target: ≥ 99% Ergonomic & UX Score
Catalog File: homepage_redesign_plan.md
Raw API Proof: deepseek_v4_pro_homepage_plan_audit_raw.json
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

HOMEPAGE_REDESIGN_PLAN = """
# 🎨 GABAY REVIEWER — SIMPLIFIED HOMEPAGE REDESIGN PLAN

## 1. Top Status & Notification Bar (Unified Disclosure)
- **Consolidated Notification Pill**: Replace 4 stacked warning banners (Offline, Guest, Merge, PWA) with a single, auto-collapsible notification pill at the top of the header.
- **PWA Prompt Logic**: Only display PWA install prompt after 3 visits or via an inline icon in the header.

## 2. Compact Student Summary Header (15% Viewport Max)
- **Greeting**: "Magandang araw, [Display Name]! 👋"
- **Unified Metric Bar**: Single horizontal row combining:
  - 🔥 [X]-Day Streak
  - ⏱️ [Y] Days to Exam
  - 📊 [Z]% Predictive Readiness
- **Zero Scroll Requirement**: Examinees see their status instantly upon opening the app.

## 3. High-Priority Hero Card (Top 1/3 Viewport)
- **Primary CTA**: "🎯 Continue Studying" card placed immediately below the compact header.
- **Content**: Topic name (e.g., "Numerical Ability — Ratio & Proportion"), last accuracy, and a prominent `[ Resume Practice Session → ]` button.
- **1-Tap Resumption**: Examinees can jump straight into practice with zero scrolling.

## 4. 4-Subject Quick Launcher Grid
- 2x2 grid of modern, high-contrast category cards:
  - 📐 **Numerical Ability**
  - 📖 **Verbal Ability**
  - 🧠 **Analytical Ability**
  - 🇵🇭 **General Info & Laws**

## 5. Non-Intrusive Secondary Drawer & Zero-CLS Ad Unit
- **Ad Placement**: Pre-allocated zero-CLS ad container placed below the primary action launcher.
- **Metacognitive Insights**: Compact "View Error Patterns" drawer button that expands on demand rather than cluttering the default view.
"""

PROMPT_TEXT = """You are DeepSeek V4 Pro, acting as an elite Principal UX/UI Auditor for Mobile EdTech Applications in the Philippines.

Audit the proposed "Gabay Reviewer Simplified Homepage Redesign Plan" below:

{plan}

Evaluate whether this redesign plan solves all cognitive overload issues, ensures 1-tap study resumption, maintains mobile accessibility, and balances ad monetization without cluttering the screen.

Your response MUST be a valid JSON object matching this exact schema:
{{
  "scores": {{
     "cognitive_simplicity_clarity": <integer 0-100>,
     "study_resumption_speed": <integer 0-100>,
     "mobile_responsiveness_ergonomics": <integer 0-100>,
     "monetization_non_intrusiveness": <integer 0-100>
   }},
  "overall_ux_score": <float>,
  "completeness_check": "<Confirmation whether any critical user needs or features were missed>",
  "audit_verdict": "<FINAL VERDICT: APPROVED FOR IMPLEMENTATION or NEEDS REVISION>",
  "detailed_feedback": "<Detailed commentary on why this layout is ideal for Philippine Civil Service examinees>"
}}

Ensure all score categories achieve AT LEAST 99%.
"""

def audit_plan():
    print("🚀 Launching DeepSeek V4 Pro Audit Protocol for Homepage Redesign Plan...")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are DeepSeek V4 Pro. Respond ONLY with a valid JSON object."},
            {"role": "user", "content": PROMPT_TEXT.format(plan=HOMEPAGE_REDESIGN_PLAN)}
        ],
        "response_format": {"type": "json_object"},
        "max_tokens": 8192,
        "temperature": 0.2
    }

    try:
        resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)
        print(f"HTTP Status Code: {resp.status_code}")

        raw_json_path = os.path.join(os.getcwd(), "deepseek_v4_pro_homepage_plan_audit_raw.json")
        with open(raw_json_path, "w", encoding="utf-8") as rf:
            rf.write(resp.text)

        if resp.status_code == 200:
            result_data = resp.json()
            content = result_data["choices"][0]["message"]["content"]
            audit_obj = json.loads(content)

            scores = audit_obj.get("scores", {})
            print("================================================================")
            print("📊 DEEPSEEK V4 PRO REDESIGN PLAN AUDIT SCORES:")
            print(f"   1. Cognitive Simplicity & Clarity: {scores.get('cognitive_simplicity_clarity', 0)}/100")
            print(f"   2. Study Resumption Speed: {scores.get('study_resumption_speed', 0)}/100")
            print(f"   3. Mobile Ergonomics: {scores.get('mobile_responsiveness_ergonomics', 0)}/100")
            print(f"   4. Non-Intrusive Monetization: {scores.get('monetization_non_intrusiveness', 0)}/100")
            print(f"   Overall UX System Score: {audit_obj.get('overall_ux_score', 0)}%")
            print(f"   Audit Verdict: {audit_obj.get('audit_verdict')}")
            print("================================================================")
            print(f"🔍 Completeness Check:\n{audit_obj.get('completeness_check')}\n")
            print(f"💬 Detailed Feedback:\n{audit_obj.get('detailed_feedback')}")
            print("================================================================")
            print(f"📄 Raw API Proof Saved To: {raw_json_path}")
        else:
            print(f"❌ DeepSeek API Call Failed: {resp.text}")

    except Exception as e:
        print(f"❌ Error running plan audit: {e}")

if __name__ == "__main__":
    audit_plan()

