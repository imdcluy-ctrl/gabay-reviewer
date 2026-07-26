#!/usr/bin/env python3
"""
Reset Fallback Scaffold Questions in Progress Tracker for Re-running DeepSeek V4 Pro
"""

import os
import sys
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    audit_path = os.path.join(os.getcwd(), "question_enhancement_audit_report.json")
    tracker_path = os.path.join(os.getcwd(), "content", "questions", "enhance-round2-out", "progress_tracker_all.json")

    if not os.path.exists(audit_path):
        print(f"[ERROR] audit report not found at {audit_path}")
        return

    if not os.path.exists(tracker_path):
        print(f"[ERROR] tracker not found at {tracker_path}")
        return

    with open(audit_path, "r", encoding="utf-8") as f:
        audit_data = json.load(f)

    with open(tracker_path, "r", encoding="utf-8") as f:
        tracker_data = json.load(f)

    fallback_ids = set(audit_data.get("fallback_question_ids", []))
    print(f"Total fallback question IDs identified: {len(fallback_ids)}")

    initial_tracker_count = len(tracker_data)
    keys_to_remove = []

    for file_key, info in tracker_data.items():
        q_id = info.get("question_id")
        if q_id in fallback_ids:
            keys_to_remove.append(file_key)

    for k in keys_to_remove:
        del tracker_data[k]

    with open(tracker_path, "w", encoding="utf-8") as f:
        json.dump(tracker_data, f, indent=2, ensure_ascii=False)

    print("================================================================")
    print("PROGRESS TRACKER CLEANUP COMPLETE")
    print(f"Initial tracker entries: {initial_tracker_count}")
    print(f"Verified DeepSeek AI Enhanced (Kept): {len(tracker_data)}")
    print(f"Fallback entries reset for re-run: {len(keys_to_remove)}")
    print("================================================================")

if __name__ == "__main__":
    main()
