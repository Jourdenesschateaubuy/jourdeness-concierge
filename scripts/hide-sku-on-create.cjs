const fs = require("fs");

const file = "app/admin/products/_components/ProductForm.tsx";
let text = fs.readFileSync(file, "utf8");

const before = `          <label>
            <span>貨號</span>
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              placeholder="可留空"
            />
          </label>`;

const after = `          {product ? (
            <label>
              <span>貨號</span>
              <input
                name="sku"
                defaultValue={product.sku ?? ""}
                placeholder="可留空"
              />
            </label>
          ) : null}`;

if (!text.includes(before)) {
  throw new Error("找不到貨號欄位，未修改檔案");
}

text = text.replace(before, after);

fs.writeFileSync(file, text, "utf8");

console.log("✓ 新增商品畫面已隱藏貨號欄位");
console.log("✓ 資料庫與既有商品資料未修改");
