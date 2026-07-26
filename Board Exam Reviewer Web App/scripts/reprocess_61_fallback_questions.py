#!/usr/bin/env python3
"""
Surgical Reprocessor for the remaining 17 Fallback Free Tier Questions using DeepSeek V4 Flash with JSON Mode
"""

import json
import os
import re
import sys
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# API Credentials
API_KEY = os.environ.get("DEEPSEEK_API_KEY", "your-deepseek-api-key-here")
API_URL = "https://api.deepseek.com/v1/chat/completions"
MODEL_NAME = "deepseek-v4-flash"

# Remaining 17 Fallback Question IDs
FALLBACK_IDS = [
    "num-ratio-010", "num-ratio-008", "num-ratio-001", "num-ratio-019", "num-ratio-023",
    "num-pct-012", "num-pct-014", "num-ops-001", "num-ops-002", "num-ops-006",
    "num-ops-009", "num-ops-017", "ver-vanal-001", "ana-log-009", "cle-fil-006",
    "ver-gram-035", "ver-vocab-013"
]

SYSTEM_PROMPT = """You are GABAY, an expert AI Exam Coach for the Philippine Civil Service Examination (CSE).
Your task is to enhance a review question with rich Socratic hints, worked solution steps, option trap explanations, and a next-time rule.

OUTPUT FORMAT: Return ONLY a valid JSON object matching this exact schema:
{
  "hint_ladder": [
    { "rung": 1, "title": "...", "text": "..." },
    { "rung": 2, "title": "...", "text": "..." },
    { "rung": 3, "title": "...", "text": "..." },
    { "rung": 4, "title": "...", "text": "..." }
  ],
  "deconstruct_text": "Step 1: ...\\nStep 2: ...\\nStep 3: ...\\n💡 Mental Trick: ...",
  "choice_explanations": {
    "A": { "text": "...", "trap_type": "..." },
    "B": { "text": "...", "trap_type": null },
    "C": { "text": "...", "trap_type": "..." },
    "D": { "text": "...", "trap_type": "..." }
  },
  "next_time_rule": "⚠️ **Watch-Out Zone**: ..."
}

REQUIREMENTS:
- Rung 4 of hint_ladder MUST include an Ate/Kuya Taglish study tip ("💡 Ate/Kuya Tip: ...").
- Be concise, direct, and pedagogical. Do NOT include unescaped newlines in JSON strings.
"""

def repair_json(text):
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def process_17_questions():
    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    with open(seed_path, "r", encoding="utf-8-sig") as f:
        questions = json.load(f)

    q_map = {q["id"]: idx for idx, q in enumerate(questions)}

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    success_count = 0

    print("================================================================")
    print(f"🚀 REPROCESSING REMAINING {len(FALLBACK_IDS)} FALLBACK QUESTIONS WITH {MODEL_NAME}")
    print("================================================================")

    for i, q_id in enumerate(FALLBACK_IDS, 1):
        if q_id not in q_map:
            print(f"[{i}/{len(FALLBACK_IDS)}] Question ID {q_id} not found in seed.json. Skipping.")
            continue

        q_idx = q_map[q_id]
        q_obj = questions[q_idx]

        prompt_payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Enhance this question:\n{json.dumps(q_obj, indent=2)}"}
            ],
            "response_format": {"type": "json_object"},
            "max_tokens": 4096,
            "temperature": 0.2
        }

        print(f"[{i}/{len(FALLBACK_IDS)}] Enhancing {q_id} via {MODEL_NAME}...", end=" ", flush=True)

        try:
            resp = requests.post(API_URL, headers=headers, json=prompt_payload, timeout=45)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                repaired = repair_json(content)
                enhancements = json.loads(repaired)

                # Merge into question
                q_obj["hint_ladder"] = enhancements.get("hint_ladder", q_obj.get("hint_ladder"))
                q_obj["deconstruct_text"] = enhancements.get("deconstruct_text", q_obj.get("deconstruct_text"))
                q_obj["choice_explanations"] = enhancements.get("choice_explanations", q_obj.get("choice_explanations"))
                q_obj["next_time_rule"] = enhancements.get("next_time_rule", q_obj.get("next_time_rule"))

                questions[q_idx] = q_obj
                success_count += 1
                tokens = data.get("usage", {}).get("total_tokens", 0)
                print(f"✅ DONE ({tokens} tokens)")
            else:
                print(f"⚠️ API Error {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            print(f"❌ Error: {e}")

        # Save progress every item
        with open(seed_path, "w", encoding="utf-8") as sf:
            json.dump(questions, sf, indent=2, ensure_ascii=False)

    print("================================================================")
    print(f"🎉 FINAL REPROCESSING COMPLETE: {success_count} / {len(FALLBACK_IDS)} AI-Enhanced!")
    print(f"   Seed file updated at: {seed_path}")
    print("================================================================")

if __name__ == "__main__":
    process_17_questions()

