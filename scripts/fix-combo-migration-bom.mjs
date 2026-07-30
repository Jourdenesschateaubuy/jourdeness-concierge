import fs from "node:fs";

const path = "./scripts/db-migrate-combo-config.mjs";

let source = fs.readFileSync(path, "utf8");

const before =
  'const sql = fs.readFileSync(migrationPath, "utf8");';

const after =
  'const sql = fs.readFileSync(migrationPath, "utf8").replace(/^\\uFEFF/, "");';

if (!source.includes(before)) {
  console.error("❌ 找不到 migration SQL 讀取位置");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已處理 UTF-8 BOM");
