import os
import sys
import json
import time
import requests

def load_api_key():
    env_path = os.path.join(os.getcwd(), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DEEPSEEK_API_KEY="):
                    return line.strip().split("=", 1)[1]
    return os.environ.get("DEEPSEEK_API_KEY", "")

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    api_key = load_api_key()
    if not api_key:
        print("[ERROR] DEEPSEEK_API_KEY not found in .env file.", file=sys.stderr)
        sys.exit(1)

    plan_path = r"C:\Users\ACER\Downloads\exam reviewer plan\question-generation\ENHANCEMENT_ROUND2_PROMPT.md"
    if not os.path.exists(plan_path):
        print(f"[ERROR] Plan file not found at {plan_path}", file=sys.stderr)
        sys.exit(1)

    with open(plan_path, "r", encoding="utf-8") as f:
        plan_content = f.read()

    script_path = os.path.join(os.getcwd(), "scripts", "process_round2_all_batches.py")
    script_content = ""
    if os.path.exists(script_path):
        with open(script_path, "r", encoding="utf-8") as sf:
            script_content = sf.read()

    system_instruction = (
        "You are DeepSeek V4 Pro, the flagship AI model on the DeepSeek API platform. "
        "You are acting as an elite AI systems architect, pedagogical expert, and automation engineer. "
        "Analyze our Python microbatch automation script (process_round2_all_batches.py) and Master Prompt Specification (v7). "
        "Provide a formal evaluation of how reliably DeepSeek V4 Pro will perform this 2,910-question microbatch task (1-question at a time), "
        "score the execution plan reliability (0-100), and provide exact code and prompt recommendations so DeepSeek V4 Pro follows it 100% perfectly."
    )

    user_prompt = f"""Below is our Python Microbatch Automation Script (process_round2_all_batches.py) and our Master Prompt Specification (v7).

We are preparing to run 2,910 microbatches (1 question per API call) to enhance all questions for our Philippine Civil Service Exam Web App.

Please analyze:
1. SCORE (0-100): How reliably will DeepSeek V4 Pro perform this task under our current execution script and prompt?
2. IDENTIFY RISKS: Identify any potential API parsing bottlenecks, rate limits, schema mismatch traps, or banned phrase retries.
3. EXACT RECOMMENDATIONS: What specific updates should we make to process_round2_all_batches.py and the prompt specification so that DeepSeek V4 Pro follows and executes it 100% perfectly with ZERO failures?

--- PYTHON AUTOMATION SCRIPT (process_round2_all_batches.py) BEGINS ---
{script_content}
--- PYTHON AUTOMATION SCRIPT ENDS ---

--- MASTER PROMPT SPECIFICATION (v7) BEGINS ---
{plan_content}
--- MASTER PROMPT SPECIFICATION (v7) ENDS ---
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-v4-pro",
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 4096
    }

    url = "https://api.deepseek.com/v1/chat/completions"

    print("================================================================")
    print("📡 SENDING DIRECT API REQUEST TO DEEPSEEK V4 PRO")
    print(f"   URL: {url}")
    print(f"   MODEL: deepseek-v4-pro")
    print(f"   TIMESTAMP: {time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("================================================================")

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        res_data = response.json()

        # Save raw JSON response as proof
        proof_dir = r"C:\Users\ACER\.gemini\antigravity-cli\brain\5557ee1a-9a21-4cd2-9dae-d478415192f2"
        os.makedirs(proof_dir, exist_ok=True)
        proof_file = os.path.join(proof_dir, "deepseek_v4_pro_plan_critique_raw.json")

        with open(proof_file, "w", encoding="utf-8") as pf:
            json.dump({
                "request_url": url,
                "request_model": payload["model"],
                "request_timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "http_status_code": response.status_code,
                "raw_response": res_data
            }, pf, indent=2, ensure_ascii=False)

        print(f"\n✅ RAW API PROOF SAVED TO: {proof_file}")
        print(f"   HTTP Status Code: {response.status_code}")
        print(f"   Response ID: {res_data.get('id', 'N/A')}")
        print(f"   Model Returned: {res_data.get('model', 'N/A')}")
        usage = res_data.get("usage", {})
        print(f"   Token Usage: Prompt={usage.get('prompt_tokens', 0)} | Completion={usage.get('completion_tokens', 0)} | Total={usage.get('total_tokens', 0)}")
        print("================================================================")

        if "choices" in res_data and len(res_data["choices"]) > 0:
            critique_text = res_data["choices"][0]["message"]["content"]
            print("\n--- DEEPSEEK V4 PRO CRITIQUE OUTPUT BEGINS ---\n")
            print(critique_text)
            print("\n--- DEEPSEEK V4 PRO CRITIQUE OUTPUT ENDS ---\n")
        else:
            print("[ERROR] No choices returned in DeepSeek API response:", res_data, file=sys.stderr)

    except Exception as err:
        print(f"[FATAL ERROR] DeepSeek API Call Failed: {err}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
