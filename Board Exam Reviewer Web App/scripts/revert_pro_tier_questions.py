#!/usr/bin/env python3
"""
Revert Pro Tier Questions (q0245 - q2910) to Rich Pre-Scaffold Version
While Keeping Free Tier Questions (q0001 - q0244) Intact
"""

import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def main():
    seed_path = os.path.join(os.getcwd(), "public", "content", "seed.json")
    original_batch_dir = os.path.join(r"C:\Users\ACER\Downloads\exam reviewer plan\question-generation\enhance-round2-all-batches")

    if not os.path.exists(seed_path):
        print(f"[ERROR] seed.json not found at {seed_path}")
        return

    if not os.path.exists(original_batch_dir):
        print(f"[ERROR] Original batch directory not found at {original_batch_dir}")
        return

    with open(seed_path, "r", encoding="utf-8-sig") as f:
        current_seed = json.load(f)

    # 1. Keep Free Tier questions (indices 0 to 243 -> q0001 to q0244)
    free_tier_questions = current_seed[:244]
    print(f"Preserving Free Tier questions (q0001 - q0244): {len(free_tier_questions)} questions.")

    # 2. Load original rich Pro Tier questions (q0245 to q2910)
    restored_pro_questions = []
    restored_count = 0
    missing_files = []

    all_files = sorted(os.listdir(original_batch_dir))
    for fname in all_files:
        if not fname.endswith(".json") or not fname.startswith("q"):
            continue
        try:
            seq_num = int(fname.split("_")[0][1:])
        except ValueError:
            continue

        if seq_num >= 245:
            fpath = os.path.join(original_batch_dir, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as pf:
                    data = json.load(pf)
                    # Extract single question object or list
                    if isinstance(data, list) and len(data) > 0:
                        q_obj = data[0]
                    else:
                        q_obj = data

                    # Standardize choice explanations if string dict
                    exps = q_obj.get("choice_explanations", {})
                    for key, val in list(exps.items()):
                        if isinstance(val, str):
                            exps[key] = {"text": val, "trap_type": None}
                    q_obj["choice_explanations"] = exps

                    restored_pro_questions.append(q_obj)
                    restored_count += 1
            except Exception as e:
                print(f"[WARN] Error reading {fname}: {e}")
                missing_files.append(fname)

    print(f"Restored Pro Tier questions (q0245 - q2910): {restored_count} questions.")

    # Combine Free Tier + Restored Pro Tier
    combined_bank = free_tier_questions + restored_pro_questions
    print(f"Total Combined Question Bank Size: {len(combined_bank)} questions.")

    # Save updated seed.json
    with open(seed_path, "w", encoding="utf-8") as sf:
        json.dump(combined_bank, sf, indent=2, ensure_ascii=False)

    print("================================================================")
    print("SUCCESS: Pro Tier questions reverted to rich original version!")
    print(f"Seed file updated at: {seed_path}")
    print("================================================================")

if __name__ == "__main__":
    main()
