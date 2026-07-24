import fs from "node:fs";

const path = "./app/page.tsx";
let source = fs.readFileSync(path, "utf8");

const pattern =
  /^\s*if \(getComboConfig\(item\.product\.id\)\) return 0;\s*$/m;

if (!pattern.test(source)) {
  console.error("❌ 目前 page.tsx 已經沒有這個阻擋條件");
  process.exit(1);
}

source = source.replace(pattern, "");

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已真正移除 getComboConfig 買送阻擋條件");
