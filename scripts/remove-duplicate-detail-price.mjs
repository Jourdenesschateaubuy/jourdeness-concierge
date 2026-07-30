import fs from "node:fs";

const path = "./app/page.tsx";
let source = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const before = `              <section className="detail-buybox-v21">
                <div>
                  <p>回購群專屬價</p>
                  {hasKnownOriginalPrice(selectedDetailProduct) && (
                    <span className="original-price">{selectedDetailProduct.originalPrice}</span>
                  )}
                  <strong className={\`price \${hasInquiryPrice(selectedDetailProduct) ? "inquiry" : ""}\`}>
                    {displayPrice(selectedDetailProduct)}
                  </strong>
                  <em>{getPriceNote(selectedDetailProduct)}</em>
                </div>

                <button
                  className="detail-add-button detail-buybox-button-v21"
                  disabled={isCartDisabled(selectedDetailProduct)}
                  onClick={() => addToCart(selectedDetailProduct)}
                >
                  {isComingSoon(selectedDetailProduct) ? "新品預告" : isSoldOut(selectedDetailProduct) ? "缺貨中" : getComboConfig(selectedDetailProduct.id) ? "選擇搭配" : "加入購物車"}
                </button>
              </section>
`;

if (!source.includes(before)) {
  console.error("❌ 找不到回購群專屬價區塊");
  process.exit(1);
}

source = source.replace(before, "");

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已移除所有商品的「回購群專屬價」重複區塊");
console.log("✅ 前方主要價格與加入購物車區保留");
console.log("✅ 此修改套用所有商品詳情，不需逐一商品修改");
