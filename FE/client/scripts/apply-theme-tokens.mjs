import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", "src");

const pairs = [
  ["bg-[#131b2e]/95", "bg-app-card/95"],
  ["bg-[#131b2e]", "bg-app-card"],
  ["bg-[#0b1326]", "bg-app"],
  ["text-[#dae2fd]", "text-ink-heading"],
  ["text-[#adc6ff]", "text-brand-soft"],
  ["bg-[#0566d9]", "bg-brand"],
  ["hover:bg-[#004395]", "hover:bg-brand-hover"],
  ["border-[#0566d9]", "border-brand"],
  ["shadow-[#0566d9]/20", "shadow-brand/20"],
  ["focus:ring-[#0566d9]", "focus:ring-brand"],
  ["focus:border-[#0566d9]", "focus:border-brand"],
  ["text-[#798098]", "text-ink-muted"],
  ["bg-[#171f33]", "bg-app-elevated"],
  ["bg-[#222a3d]", "bg-app-inset"],
  ["bg-[#2d3449]", "bg-app-track"],
  ["text-[#4fdbc8]", "text-mint"],
  ["bg-[#4fdbc8]", "bg-mint"],
  ["border-[#4fdbc8]", "border-mint"],
  ["hover:text-[#4fdbc8]", "hover:text-mint"],
  ["hover:border-[#4fdbc8]/30", "hover:border-mint/30"],
  ["text-[#0566d9]", "text-brand"],
  ["hover:text-[#0566d9]", "hover:text-brand"],
  ["hover:border-[#0566d9]/30", "hover:border-brand/30"],
  ["border-[#0566d9]/20", "border-brand/20"],
  ["from-[#131b2e]", "from-app-card"],
  ["to-[#0566d9]/10", "to-brand/10"],
  ["bg-[#0566d9]/10", "bg-brand/10"],
  ["bg-[#0566d9]/20", "bg-brand/20"],
  ["ring-[#0566d9]", "ring-brand"],
  ["border-[#adc6ff]/10", "border-brand-soft/10"],
  ["border-[#adc6ff]/30", "border-brand-soft/30"],
  ["text-[#d8e2ff]", "text-brand-soft"],
  ["from-[#0566d9]/10", "from-brand/10"],
  ["from-[#0566d9]", "from-brand"],
];

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) acc.push(p);
  }
  return acc;
}

for (const file of walk(src)) {
  let c = fs.readFileSync(file, "utf8");
  const orig = c;
  for (const [a, b] of pairs) c = c.split(a).join(b);
  if (c !== orig) fs.writeFileSync(file, c);
}

console.log("done");
