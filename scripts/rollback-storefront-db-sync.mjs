import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backup = path.join(root, "backup", "page-before-storefront-db-sync.tsx");
const page = path.join(root, "app", "page.tsx");
const client = path.join(root, "app", "storefront-client.tsx");

if (!fs.existsSync(backup)) {
  console.error("❌ 找不到 backup/page-before-storefront-db-sync.tsx");
  process.exit(1);
}

fs.copyFileSync(backup, page);

if (fs.existsSync(client)) {
  fs.rmSync(client);
}

console.log("✅ 已還原 Phase 2B-5 前的 app/page.tsx");
console.log("請重新執行：npm run build");
