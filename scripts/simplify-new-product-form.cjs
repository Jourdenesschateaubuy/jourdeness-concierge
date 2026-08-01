const fs = require("fs");

const file = "app/admin/products/_components/ProductForm.tsx";
let text = fs.readFileSync(file, "utf8");

const replacements = [
  {
    before: `          <label>
            <span>規格</span>
            <input name="spec" defaultValue={product?.spec ?? ""} />
          </label>`,
    after: `          {product ? (
            <label>
              <span>規格</span>
              <input name="spec" defaultValue={product.spec ?? ""} />
            </label>
          ) : null}`,
    name: "規格",
  },
  {
    before: `          <label>
            <span>原價</span>
            <input
              name="originalPrice"
              defaultValue={product?.originalPrice ?? ""}
              placeholder="例如：原價 $ 1,290"
            />
          </label>`,
    after: `          {product ? (
            <label>
              <span>原價</span>
              <input
                name="originalPrice"
                defaultValue={product.originalPrice ?? ""}
                placeholder="例如：原價 $ 1,290"
              />
            </label>
          ) : null}`,
    name: "原價",
  },
  {
    before: `          <label>
            <span>價格補充</span>
            <input
              name="priceNote"
              defaultValue={product?.priceNote ?? ""}
            />
          </label>`,
    after: `          {product ? (
            <label>
              <span>價格補充</span>
              <input
                name="priceNote"
                defaultValue={product.priceNote ?? ""}
              />
            </label>
          ) : null}`,
    name: "價格補充",
  },
  {
    before: `          <label>
            <span>商品卡名稱</span>
            <input
              name="cardName"
              defaultValue={product?.cardName ?? ""}
            />
          </label>

          <label>
            <span>商品卡副標</span>
            <input
              name="cardSubtitle"
              defaultValue={product?.cardSubtitle ?? ""}
            />
          </label>`,
    after: `          {product ? (
            <>
              <label>
                <span>商品卡名稱</span>
                <input
                  name="cardName"
                  defaultValue={product.cardName ?? ""}
                />
              </label>

              <label>
                <span>商品卡副標</span>
                <input
                  name="cardSubtitle"
                  defaultValue={product.cardSubtitle ?? ""}
                />
              </label>
            </>
          ) : null}`,
    name: "商品卡名稱與副標",
  },
  {
    before: `          <label className={styles.span2}>
            <span>商品資訊頁介紹</span>
            <textarea
              name="intro"
              rows={4}
              defaultValue={product?.intro ?? ""}
            />
          </label>

          <label>
            <span>效期顯示文字</span>
            <input
              name="expiryNote"
              defaultValue={product?.expiryNote ?? ""}
            />
          </label>

          <label>
            <span>內部效期日期</span>
            <input
              name="internalExpiryDate"
              type="date"
              defaultValue={product?.internalExpiryDate ?? ""}
            />
          </label>`,
    after: `          {product ? (
            <>
              <label className={styles.span2}>
                <span>商品資訊頁介紹</span>
                <textarea
                  name="intro"
                  rows={4}
                  defaultValue={product.intro ?? ""}
                />
              </label>

              <label>
                <span>效期顯示文字</span>
                <input
                  name="expiryNote"
                  defaultValue={product.expiryNote ?? ""}
                />
              </label>

              <label>
                <span>內部效期日期</span>
                <input
                  name="internalExpiryDate"
                  type="date"
                  defaultValue={product.internalExpiryDate ?? ""}
                />
              </label>
            </>
          ) : null}`,
    name: "詳細介紹與效期",
  },
  {
    before: `          <label>
            <span>排序</span>
            <input
              name="sortOrder"
              type="number"
              step="1"
              defaultValue={product?.sortOrder ?? 0}
            />
          </label>`,
    after: `          {product ? (
            <label>
              <span>排序</span>
              <input
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={product.sortOrder}
              />
            </label>
          ) : (
            <input type="hidden" name="sortOrder" value="0" />
          )}`,
    name: "排序",
  },
];

for (const replacement of replacements) {
  if (!text.includes(replacement.before)) {
    throw new Error(`找不到「${replacement.name}」欄位，未修改檔案`);
  }

  text = text.replace(replacement.before, replacement.after);
}

fs.writeFileSync(file, text, "utf8");

console.log("✓ 新增商品表單已切換為精簡模式");
console.log("✓ 既有商品的完整編輯欄位仍保留");
console.log("✓ 排序預設值仍會送出 0");
