const fs = require("fs");

const file = "app/page.tsx";
let text = fs.readFileSync(file, "utf8");

const before =
'useState<"menu" | "series">("menu")';

const after =
'useState<"menu" | "product" | "series">("menu")';

if (!text.includes(before)) {
  throw new Error("找不到 adminCreateView 型別");
}

text = text.replace(before, after);

fs.writeFileSync(file, text, "utf8");

console.log("✓ adminCreateView 已加入 product");
