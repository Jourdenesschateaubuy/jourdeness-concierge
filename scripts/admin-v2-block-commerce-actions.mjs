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

/* 1. 商品卡裡面的購買／選擇搭配按鈕
      修改模式時只選商品，不執行購買 */
replaceOnce(
`              onClick={(event) => {
                event.stopPropagation();
                addToCart(product);
              }}`,
`              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (isAdminMode && isAdminEditMode) {
                  setManagedProductId(product.id);
                  return;
                }

                addToCart(product);
              }}`,
  "商品卡購買按鈕"
);

/* 2. addToCart 再加一道全域保護 */
replaceOnce(
`  function addToCart(product: Product) {
    if (isCartDisabled(product)) return;`,
`  function addToCart(product: Product) {
    if (isAdminMode && isAdminEditMode) {
      setManagedProductId(product.id);
      return;
    }

    if (isCartDisabled(product)) return;`,
  "addToCart admin guard"
);

/* 3. Combo Picker 本身再加最後一道保護
      避免其他入口直接呼叫 openComboPicker */
replaceOnce(
`  function openComboPicker(product: Product, editingItem?: CartItem) {
    const config = getComboConfig(product.id);`,
`  function openComboPicker(product: Product, editingItem?: CartItem) {
    if (isAdminMode && isAdminEditMode && !editingItem) {
      setManagedProductId(product.id);
      return;
    }

    const config = getComboConfig(product.id);`,
  "openComboPicker admin guard"
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 修改模式下「選擇搭配」改為選取商品");
console.log("✅ addToCart 已禁止修改模式開購物流程");
console.log("✅ openComboPicker 已加入最後一道保護");
console.log("✅ 一般商城購買流程保持不變");
