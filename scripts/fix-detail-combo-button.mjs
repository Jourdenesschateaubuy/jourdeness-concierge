import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

const before = `                  {!getComboConfig(selectedDetailProduct.id) && (
                    <button
                      type="button"
                      className="primary"
                      disabled={isCartDisabled(selectedDetailProduct)}
                      onClick={() => addToCart(selectedDetailProduct)}
                    >
                      {isComingSoon(selectedDetailProduct) ? "新品預告" : isSoldOut(selectedDetailProduct) ? "缺貨中" : "加入購物車"}
                    </button>
                  )}`;

const after = `                  <button
                    type="button"
                    className="primary"
                    disabled={isCartDisabled(selectedDetailProduct)}
                    onClick={() => addToCart(selectedDetailProduct)}
                  >
                    {isComingSoon(selectedDetailProduct)
                      ? "新品預告"
                      : isSoldOut(selectedDetailProduct)
                        ? "缺貨中"
                        : getComboConfig(selectedDetailProduct.id)
                          ? "選擇搭配"
                          : "加入購物車"}
                  </button>`;

if (!source.includes(before)) {
  console.error("❌ 找不到商品詳情主按鈕");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 一般商品保留「加入購物車」");
console.log("✅ 組合商品改顯示「選擇搭配」");
console.log("✅ 點擊後沿用既有 addToCart / Combo Picker");
console.log("✅ 商品詳情所有組合價一起生效");
