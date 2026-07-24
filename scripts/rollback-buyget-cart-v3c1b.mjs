import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "page.tsx");
const backupPath = path.join(root, "backup", "page-before-buyget-v3c1b.txt");

if (!fs.existsSync(backupPath)) {
  console.error("❌ 找不到 backup/page-before-buyget-v3c1b.txt");
  process.exit(1);
}

fs.copyFileSync(backupPath, pagePath);
console.log("✅ app/page.tsx 已還原到 Phase 3C-1B 前");
