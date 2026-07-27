const fs = require("fs");
let c = fs.readFileSync("src/pages/Dashboard.tsx", "utf8");

// Aggressive: remove entire old block from "// Predictive CSE Score" to the closing bracket
// Find and nuke the entire old block
const start = c.indexOf("  // Predictive CSE Score");
if (start !== -1) {
  // Find the end - the next comment or empty line with variable declaration
  const after = c.indexOf(");  // <<", start);  // try specific pattern first
  if (after === -1) {
    // Try to find the closing of the useEffect or useMemo
    const idx = c.indexOf("\n\n  // Readiness", start);
    if (idx !== -1) {
      // The new code was inserted but the old wasn"t removed
      // Remove from start to the new code
      const newCodeStart = c.indexOf("  // Readiness");
      if (newCodeStart > start) {
        c = c.substring(0, start) + c.substring(newCodeStart);
      }
    }
  }
}

fs.writeFileSync("src/pages/Dashboard.tsx", c, "utf8");
console.log("Removed old block");
