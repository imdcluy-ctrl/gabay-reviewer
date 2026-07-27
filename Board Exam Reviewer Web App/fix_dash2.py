import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf8') as f:
    lines = f.readlines()

# Remove lines containing old imports
new_lines = []
for line in lines:
    if "SnapshotScoreCard" in line and "from" in line:
        continue
    if "calculateSnapshotScore" in line and "from" in line:
        continue
    if "QOTDWidget" in line and "from" in line:
        continue
    new_lines.append(line)

content = ''.join(new_lines)

# Add new imports after CATEGORIES import
content = content.replace(
    "import { CATEGORIES } from '../lib/constants';",
    "import { CATEGORIES } from '../lib/constants';\nimport { collectReadinessData } from '../lib/readinessData';"
)

# Add SWUpdateBadge import
content = content.replace(
    "import { SoundToggle } from '../components/SoundToggle';",
    "import { SoundToggle } from '../components/SoundToggle';\nimport { SWUpdateBadge } from '../components/SWUpdateBadge';"
)

# Remove old Predictive memo block
old_block_start = "  // Predictive CSE Score"
old_block_end = "  }, [attempts, questions, currentStreak, daysToExam]);\n"
idx_start = content.find(old_block_start)
idx_end = content.find(old_block_end, idx_start)
if idx_start != -1 and idx_end != -1:
    content = content[:idx_start] + content[idx_end + len(old_block_end):]

# Add readiness state before "const isGuest"
readiness_code = '''  const [readiness, setReadiness] = React.useState(null);
  const [readinessLoading, setReadinessLoading] = React.useState(true);

  React.useEffect(() => {
    if (!profile?.id) return;
    setReadinessLoading(true);
    import("../lib/readinessData").then(m => m.collectReadinessData(profile.id)).then(inputs => {
      import("../lib/readinessScore").then(m => {
        setReadiness(m.calculateReadiness(inputs));
        setReadinessLoading(false);
      });
    });
  }, [profile?.id]);

  const isGuest = !profile?.auth_user_id;
'''
content = content.replace("  const isGuest = !profile?.auth_user_id;\n", readiness_code)

# Replace SECTION 2.25 block
old_render = '        {/* SECTION 2.25: Predictive Score Card */}\n        {snapshotResult && snapshotResult.trend !== "insufficient_data" && (\n          <SnapshotScoreCard result={snapshotResult} />\n        )}'
new_render = '{readiness && readiness.confidence !== "very_low" && !readinessLoading && (\n          <div className="readiness-card-wrapper">\n            <div className="card readiness-card">\n              <div className="readiness-header">\n                <h3>Your Practice Snapshot</h3>\n              </div>\n              <div className="readiness-score-row">\n                <div className="readiness-score-main">\n                  <span className="readiness-score-val">{readiness.score}%</span>\n                  <span className="readiness-score-ci">\u00b1{readiness.confidenceInterval}%</span>\n                </div>\n                <div className="readiness-score-status">\n                  <span className="readiness-pass-badge" style={{\n                    background: readiness.score >= 80 ? "#22C55E" : "#F97316",\n                  }}>\n                    {readiness.score >= 80 ? "STRONG" : "GROWING"}\n                  </span>\n                </div>\n              </div>\n              <p className="readiness-message">{readiness.message}</p>\n              {readiness.weakestCategory && (\n                <div className="readiness-focus">\n                  <span>Focus area: <strong>{readiness.weakestCategory}</strong></span>\n                </div>\n              )}\n            </div>\n          </div>\n        )}\n        {readinessLoading && (\n          <div className="readiness-card-wrapper">\n            <div className="card readiness-card">\n              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Analyzing your practice data...</p>\n            </div>\n          </div>\n        )}'
content = content.replace(old_render, new_render)

# Add SWUpdateBadge next to SoundToggle
content = content.replace("<SoundToggle />", "<SWUpdateBadge /><SoundToggle />")

with open('src/pages/Dashboard.tsx', 'w', encoding='utf8') as f:
    f.write(content)

print("Done")
