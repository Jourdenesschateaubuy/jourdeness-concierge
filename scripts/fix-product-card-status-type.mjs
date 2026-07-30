import fs from "node:fs";

const path =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

let source = fs.readFileSync(path, "utf8");

const before =
  'onChange={(event) => setStatus(event.target.value)}';

const after =
  'onChange={(event) => setStatus(event.target.value as "active" | "inactive" | "coming_soon" | "sold_out")}';

if (!source.includes(before)) {
  console.error("❌ 找不到 status onChange");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 商品狀態 TypeScript 型別已修正");
