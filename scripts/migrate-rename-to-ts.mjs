import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const root = "src";
const jsFiles = execSync(`find ${root} -name "*.js"`, { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

// Files that clearly contain JSX — rename to .tsx; rest to .ts
function likelyJsx(content) {
  if (!content.includes("<")) return false;
  if (/<[A-Z][A-Za-z0-9]*(\s|\/|>)/.test(content)) return true;
  if (/return\s*\(\s*</.test(content)) return true;
  if (/<\/(div|span|Box|Stack|Grid|Typography|Button)/.test(content)) return true;
  if (/className=/.test(content) && /<\w/.test(content)) return true;
  return false;
}

const plan = { ts: [], tsx: [] };
for (const f of jsFiles) {
  const c = fs.readFileSync(f, "utf8");
  (likelyJsx(c) ? plan.tsx : plan.ts).push(f);
}

for (const f of plan.ts) {
  const to = f.replace(/\.js$/, ".ts");
  fs.renameSync(f, to);
  console.log("ts ", f, "->", to);
}
for (const f of plan.tsx) {
  const to = f.replace(/\.js$/, ".tsx");
  fs.renameSync(f, to);
  console.log("tsx", f, "->", to);
}
console.log("Done. ts:", plan.ts.length, "tsx:", plan.tsx.length);
