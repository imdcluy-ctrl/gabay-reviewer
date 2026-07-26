#!/usr/bin/env python3
"""
Sequential Batch Enhancement Runner for DeepSeek V4 Pro

Runs a specified range of enhancement batches (e.g., --start 8 --end 41) sequentially,
saving each enhanced batch and merging into public/content/seed.json.

Usage:
    python scripts/process_all_enhancement_batches.py --start 8 --end 41
"""

import argparse
import sys
import os
from process_enhancement_batch import enhance_single_batch

def main():
    parser = argparse.ArgumentParser(description="Run multiple enhancement batches sequentially with DeepSeek V4 Pro")
    parser.add_argument("--start", type=int, default=8, help="Starting batch number (e.g. 8)")
    parser.add_argument("--end", type=int, default=41, help="Ending batch number (e.g. 41)")
    parser.add_argument("--batches", nargs="+", type=int, default=None, help="Explicit list of batch numbers to run (e.g. --batches 9 10 14 26 37)")
    parser.add_argument(
        "--plan-dir",
        type=str,
        default=r"C:\Users\ACER\Downloads\exam reviewer plan",
        help="Path to exam reviewer plan directory"
    )
    args = parser.parse_args()

    batch_list = args.batches if args.batches else list(range(args.start, args.end + 1))

    print(f"============================================================")
    print(f" DeepSeek V4 Pro Batch Enhancement Pipeline")
    print(f" Target Batches ({len(batch_list)}): {batch_list}")
    print(f"============================================================")

    successful_batches = []
    failed_batches = []

    for b in batch_list:
        print(f"\n---> Starting Batch {b:02d}...")
        try:
            items, banned_count = enhance_single_batch(b, args.plan_dir)
            successful_batches.append(b)
            print(f"[SUCCESS] Completed Batch {b:02d} ({len(items)} questions, {banned_count} banned phrases)")
        except Exception as e:
            print(f"[ERROR] Batch {b:02d} failed: {e}", file=sys.stderr)
            failed_batches.append(b)

    print("\n============================================================")
    print(f" Pipeline Execution Summary:")
    print(f" Successful Batches ({len(successful_batches)}): {successful_batches}")
    if failed_batches:
        print(f" Failed Batches ({len(failed_batches)}): {failed_batches}")
    print("============================================================")

if __name__ == "__main__":
    main()
