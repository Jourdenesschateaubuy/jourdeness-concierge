import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, "backup", "page-before-promotion-sync-v3b.tsx");
const page = path.join(root, "app", "page.tsx");

if (!fs.existsSync(backup)) {
  console.error("❌ 找不到 backup/page-before-promotion-sync-v3b.tsx");
  process.exit(1);
}

fs.copyFileSync(backup, page);
console.log("✅ 已還原 Phase 3B 前的 app/page.tsx");
