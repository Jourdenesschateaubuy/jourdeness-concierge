import fs from "node:fs";

const file = "app/page.tsx";
let source = fs.readFileSync(file, "utf8");

const duplicate = 'import type { FormEvent } from "react";';

if (!source.includes(duplicate)) {
  console.log("沒有找到額外的 FormEvent import，不需要修改");
  process.exit(0);
}

source = source.replace(duplicate + "\r\n", "");
source = source.replace(duplicate + "\n", "");

fs.writeFileSync(file, source, "utf8");

console.log("✅ 已移除重複 FormEvent import");
