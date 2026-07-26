#!/usr/bin/env python3
"""
DeepSeek V4 Pro Consultation: Subtle & Non-Intrusive Ad Monetization Plan Review
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

    ads_monetization_plan = """
# 🏛️ GABAY CIVIL SERVICE REVIEWER WEB APP: SUBTLE & NON-INTRUSIVE AD MONETIZATION PLAN

## 1. CONTEXT & APPLICATION ARCHITECTURE
- **App Name**: GABAY — Philippine Civil Service Exam Reviewer Web App
- **Target Audience**: 200,000+ annual Filipino Civil Service examinees (mobile-first, 375px viewport target, high-stakes study environment).
- **Tech Stack**: React 18, Vite, TypeScript, Dexie.js (IndexedDB local database), Tailwind/Vanilla CSS, Progressive Web App (PWA).
- **Core User Flow**: 
  1. Dashboard (Daily streak, readiness index, study goals)
  2. Category List (Verbal, Numerical, Analytical, General Info, Clerical)
  3. Study Session (Answering question -> Hint Ladder -> Submit -> Result Feedback -> Worked Solution / Deconstruction Card -> Next Question)
  4. Mock Exam Simulation (170 timed questions, section breakdown)
  5. Anxiety Hub & Performance Analytics
- **Primary Business Goal**: Generate steady passive ad revenue to cover hosting and API costs without requiring immediate DTI/BIR sole proprietorship registration, while preserving 100% focused, distraction-free study experience for examinees.

---

## 2. MONETIZATION PLATFORM SELECTION
- **Primary Network**: Google AdSense (Responsive In-Feed & Display Units).
- **Alternative / Backup Networks**: Ezoic (for higher ECPM once traffic reaches 10k monthly visitors) or Mediavine / EthicalAds.
- **AdSense SPA Integration Strategy**: Custom React component (`<AdUnit />`) that dynamically triggers `(window.adsbygoogle = window.adsbygoogle || []).push({})` on route changes without full page reloads.

---

## 3. STRICT NON-INTRUSIVE PLACEMENT MATRIX

### ❌ STRICTLY FORBIDDEN (Zero-Tolerance Distraction Rules):
1. **NO Ads During Active Question Answering**: Zero ads inside the active question card, stem, or choice buttons while the timer is running.
2. **NO Interstitial Popups / Overlays**: No popups that interrupt active study sessions or mock exams.
3. **NO Sticky Bottom Overlays Blocking Navigation**: Never overlap or crowd the sticky bottom action bar (`qv-actions-sticky` Submit button).
4. **NO Auto-Playing Video or Audio Ads**: Only silent display and native responsive in-feed cards.

---

### ✅ APPROVED SUBTLE AD LOCATIONS:

#### Location A: Dashboard Feed Card (Native Card Format)
- **Position**: Below the Daily Goal and Readiness Index cards on the main Dashboard.
- **Format**: Responsive In-Feed / Native Card (looks like a sponsored study tip or resource card).
- **Dimension**: 320x100 / Fluid Responsive.

#### Location B: Post-Question Deconstruction Footer (After Answer Submission)
- **Position**: Placed at the very bottom of the `DeconstructionCard` *after* the user submits their answer and reads the worked solution and Mental Trick.
- **Format**: Fluid Native Banner (320x50 or 300x100).
- **UX Benefit**: User is in a relaxed reading/reviewing state after answering; does not interfere with problem-solving.

#### Location C: Category Selection List (In-Feed Slot)
- **Position**: Inserted as an in-feed card every 5 subtopics in the Category Selection list (`CategoryList.tsx`).
- **Format**: Native Horizontal Card matching the Category Card styling.

#### Location D: Session Complete Screen
- **Position**: Center-bottom of the `Session Complete` summary card (after finishing a 20-question practice set or mock exam).
- **Format**: 300x250 Medium Rectangle or Responsive Banner.
- **UX Benefit**: User has completed their study goal and is celebrating/reviewing stats; prime engagement window.

---

## 4. TECHNICAL IMPLEMENTATION SPECIFICATION (React Component)

```tsx
// src/components/AdUnit.tsx
import React, { useEffect, useRef } from 'react';

interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({ slotId, format = 'auto', layoutKey, className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense load error:', e);
    }
  }, [slotId]);

  return (
    <div className={`ad-container ${className}`} style={{ margin: '1rem 0', textAlign: 'center', minHeight: '60px' }}>
      <span className="ad-label" style={{ fontSize: '0.65rem', color: '#888', display: 'block', marginBottom: '4px' }}>
        SPONSORED ADVERTISEMENT
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
};
```

---

## 5. REVENUE & POLICY SAFEGUARDS
1. **Ad Blocker Resilience**: If an ad blocker is detected, the container gracefully collapses with `minHeight: 0` without breaking the layout or throwing UI errors.
2. **AdSense SPA Route Refreshing**: Re-initialize ad slots safely on SPA navigation without causing duplicate ad requests or policy violations.
3. **Google AdSense Publisher Policy Compliance**: Clear "SPONSORED" label, no misleading placement near action buttons, 0 risk of accidental clicks.

---

## REQUEST FOR DEEPSEEK V4 PRO REVIEW:
Please evaluate this Subtle & Non-Intrusive Ad Monetization Plan across all relevant domains:
1. **Scannability & Mobile UX Compatibility (375px Viewport)** (Score 0-100)
2. **Revenue Optimization & ECPM Efficiency** (Score 0-100)
3. **Study Focus & Zero-Distraction Safeguards** (Score 0-100)
4. **Google AdSense Policy & SPA Technical Compliance** (Score 0-100)
5. **Overall Monetization Plan Score** (Score 0-100)

Provide specific, actionable recommendations to reach 99%+ readiness in all domains.
"""

    print("================================================================")
    print("SENDING AD MONETIZATION PLAN TO DEEPSEEK V4 PRO FOR AUDIT")
    print("MODEL: deepseek-v4-pro")
    print("================================================================")

    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=[
            {"role": "system", "content": "You are DeepSeek V4 Pro acting as an expert Web Monetization & Mobile UX Auditor specializing in Google AdSense for Single Page Applications (SPAs) and educational tech."},
            {"role": "user", "content": ads_monetization_plan}
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

    proof_path = os.path.join(os.getcwd(), "deepseek_v4_pro_ads_plan_review_raw.json")
    with open(proof_path, "w", encoding="utf-8") as f:
        json.dump(proof_data, f, indent=2, ensure_ascii=False)

    print(f"✅ RAW API PROOF SAVED TO: {proof_path}")
    print("================================================================")
    print(response.choices[0].message.content)

if __name__ == "__main__":
    main()
