import fs from "node:fs";

const path = "./scripts/admin-v2-direct-product-management.mjs";

let source = fs.readFileSync(path, "utf8");

const before = 'let source = fs.readFileSync(storefrontPath, "utf8");';
const after = 'let source = fs.readFileSync(storefrontPath, "utf8").replace(/\\r\\n/g, "\\n");';

if (!source.includes(before)) {
  console.error("❌ 找不到要修正的 source 讀取行");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已修正 Windows 換行問題");
