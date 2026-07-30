import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

/* 1. 一般商品：深酒紅、4px、明顯陰影 */
source = source.replace(
`            .admin-v2-product-selected {
              outline: none !important;
              border-color: #7d2638 !important;
              box-shadow:
                inset 0 0 0 3px #7d2638,
                0 8px 22px rgba(125, 38, 56, .18) !important;
              z-index: 20 !important;
            }`,
`            .admin-v2-product-selected {
              position: relative !important;
              outline: none !important;
              border-color: #7d2638 !important;
              box-shadow:
                inset 0 0 0 4px #7d2638,
                0 0 0 2px rgba(125, 38, 56, .16),
                0 10px 28px rgba(125, 38, 56, .28) !important;
              z-index: 20 !important;
            }`
);

/* 2. 組合價／本月優惠卡也套選取 class */
const before =
`              <article className="monthly-offer-card-v380" key={\`${"${item.badge}-${item.title}"}\`}>`;

const after =
`              <article
                className={\`monthly-offer-card-v380 \${
                  product && managedProductId === product.id
                    ? "admin-v2-product-selected"
                    : ""
                }\`}
                key={\`${"${item.badge}-${item.title}"}\`}
              >`;

if (!source.includes(before)) {
  console.error("❌ 找不到組合價卡片");
  process.exit(1);
}

source = source.replace(before, after);

/* 3. 組合價卡特別確保圓角內框完整 */
const styleMarker = `            .admin-v2-selected-badge {`;

if (!source.includes(".monthly-offer-card-v380.admin-v2-product-selected")) {
  source = source.replace(
    styleMarker,
`            .monthly-offer-card-v380.admin-v2-product-selected {
              position: relative !important;
              border-color: #7d2638 !important;
              box-shadow:
                inset 0 0 0 4px #7d2638,
                0 0 0 2px rgba(125, 38, 56, .16),
                0 10px 28px rgba(125, 38, 56, .28) !important;
            }

${styleMarker}`
  );
}

fs.writeFileSync(path, source, "utf8");

console.log("✅ 一般商品改成明顯深酒紅 4px 選取框");
console.log("✅ 組合價商品也會顯示深酒紅選取框");
console.log("✅ 保留原本酒紅色 #7d2638");
console.log("✅ 不修改購物車／組合價邏輯");
