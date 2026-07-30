import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  source = source.replace(before, after);
}

/* =========================================================
   1. 本月優惠／活動卡：
      組合商品也先進商品詳情，不直接開 Combo Picker
========================================================= */

replaceOnce(
`      if (product) {
        if (getComboConfig(product.id)) {
          openComboPicker(product);
        } else {
          openProductDetail(product);
        }
        return;
      }`,
`      if (product) {
        openProductDetail(product);
        return;
      }`,
  "本月優惠組合商品入口"
);

/* =========================================================
   2. 商品卡紅色按鈕：
      組合商品先看商品詳情
      一般商品才直接加入購物車
========================================================= */

replaceOnce(
`                if (isAdminMode && isAdminEditMode) {
                  setManagedProductId(product.id);
                  return;
                }

                addToCart(product);`,
`                if (isAdminMode && isAdminEditMode) {
                  setManagedProductId(product.id);
                  return;
                }

                if (selectableCombo) {
                  openProductDetail(product);
                  return;
                }

                addToCart(product);`,
  "商品卡組合商品按鈕"
);

/* =========================================================
   3. 組合商品卡按鈕文案：
      不再寫「選擇搭配」，避免誤以為會直接購買
========================================================= */

replaceOnce(
`                  : selectableCombo
                    ? \`選擇 \${product.name} 的搭配內容\`
                    : \`將 \${product.name} 加入購物車\``,
`                  : selectableCombo
                    ? \`查看 \${product.name} 商品詳情\`
                    : \`將 \${product.name} 加入購物車\``,
  "組合商品 aria label"
);

replaceOnce(
`                    : selectableCombo
                      ? "選擇搭配"
                      : "加入"`,
`                    : selectableCombo
                      ? "查看詳情"
                      : "加入"`,
  "組合商品卡按鈕文字"
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 組合商品卡改為先進商品詳情");
console.log("✅ 本月優惠組合商品也先進商品詳情");
console.log("✅ 商品卡按鈕改為「查看詳情」");
console.log("✅ 商品詳情內的「開始選擇搭配」購買流程保留");
console.log("✅ 一般商品加入購物車流程不變");
