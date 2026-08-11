/**
 * Build static output into /public with the correct brand homepage.
 *
 * Same approach as St. Tammany Parish Concrete Pros:
 *   VERCEL_PROJECT_PRODUCTION_URL (or BRAND_HOME):
 *     new-orleans-fencing-pros → New Orleans Fencing Pros at /
 *     otherwise                → St. Tammany Parish Fencing Pros at /
 *
 * Two Vercel projects, one repo:
 *   https://st-tammany-parish-fencing-pros.vercel.app/
 *   https://new-orleans-fencing-pros.vercel.app/
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "public");

const prodUrl = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  process.env.BRAND_HOME ||
  ""
).toLowerCase();

const isNola =
  prodUrl.includes("new-orleans-fencing-pros") ||
  process.env.BRAND_HOME === "nola-fencing" ||
  process.env.BRAND_HOME === "nola";

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (
      entry.name === "public" ||
      entry.name === "scripts" ||
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === ".vercel" ||
      entry.name === ".env" ||
      entry.name === ".env.local"
    ) {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

rmrf(outDir);
copyDir(root, outDir);

// Choose homepage for this deployment
const homeSrc = isNola
  ? path.join(root, "new-orleans", "index.html")
  : path.join(root, "index.html");

fs.copyFileSync(homeSrc, path.join(outDir, "index.html"));

console.log("[select-home] production URL:", prodUrl || "(unset)");
console.log(
  "[select-home] homepage:",
  isNola ? "New Orleans Fencing Pros" : "St. Tammany Parish Fencing Pros"
);
console.log("[select-home] output:", outDir);
