import fs from "node:fs";

const file = "lib/product-repository.ts";
let source = fs.readFileSync(file, "utf8");

const marker = "export async function updateDatabaseProduct";
const markerIndex = source.indexOf(marker);

if (markerIndex === -1) {
  throw new Error("找不到 updateDatabaseProduct");
}

const before = source.slice(0, markerIndex);
let updatePart = source.slice(markerIndex);

if (updatePart.includes("input.storefrontCategory || null")) {
  console.log("✅ UPDATE storefrontCategory 已經存在，不需要修改");
  process.exit(0);
}

const eol = source.includes("\r\n") ? "\r\n" : "\n";

const pattern =
  /([ \t]*)input\.category,\r?\n[ \t]*input\.series,\r?\n[ \t]*input\.originalPrice \|\| null,\r?\n[ \t]*input\.price,/;

if (!pattern.test(updatePart)) {
  throw new Error("找不到 UPDATE 參數陣列");
}

updatePart = updatePart.replace(
  pattern,
  (_, indent) =>
    [
      `${indent}input.category,`,
      `${indent}input.series,`,
      `${indent}input.storefrontCategory || null,`,
      `${indent}input.originalPrice || null,`,
      `${indent}input.price,`,
    ].join(eol)
);

fs.writeFileSync(file, before + updatePart, "utf8");

console.log("✅ UPDATE storefrontCategory 參數已補上");
