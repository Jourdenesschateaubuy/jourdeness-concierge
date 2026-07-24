import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, "backup", "page-before-buyget-v3c1a.tsx");
const page = path.join(root, "app", "page.tsx");

if (!fs.existsSync(backup)) {
  console.error("❌ 找不到 backup/page-before-buyget-v3c1a.tsx");
  process.exit(1);
}

fs.copyFileSync(backup, page);
console.log("✅ app/page.tsx 已還原到 Phase 3C-1A 前");
