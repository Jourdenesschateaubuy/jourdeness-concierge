import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, "backup", "page-before-storefront-api-sync.tsx");
const page = path.join(root, "app", "page.tsx");

if (!fs.existsSync(backup)) {
  console.error("❌ 找不到 backup/page-before-storefront-api-sync.tsx");
  process.exit(1);
}

fs.copyFileSync(backup, page);
console.log("✅ 已還原 Phase 2B-5 V2 前的 app/page.tsx");
