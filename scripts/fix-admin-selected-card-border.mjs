import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

const before = `            .admin-v2-product-selected {
              outline: 3px solid #7d2638 !important;
              outline-offset: 2px !important;
              z-index: 20 !important;
            }`;

const after = `            .admin-v2-product-selected {
              outline: none !important;
              border-color: #7d2638 !important;
              box-shadow:
                inset 0 0 0 3px #7d2638,
                0 8px 22px rgba(125, 38, 56, .18) !important;
              z-index: 20 !important;
            }`;

if (!source.includes(before)) {
  console.error("❌ 找不到目前的已選取紅框樣式");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已選取紅框改為卡片內框");
console.log("✅ 不再受 Grid / overflow 裁切");
console.log("✅ 保留右上角「已選取」標籤");
console.log("✅ 不修改任何點擊與組合價邏輯");
