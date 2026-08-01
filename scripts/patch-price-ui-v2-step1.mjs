import fs from "node:fs";

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;

  if (count !== 1) {
    throw new Error(`${label}：預期找到 1 處，實際找到 ${count} 處`);
  }

  return source.replace(before, after);
}

// --------------------------------------------------
// 1. ProductForm.tsx
// --------------------------------------------------

const productFormPath =
  "app/admin/products/_components/ProductForm.tsx";

let productForm = fs.readFileSync(productFormPath, "utf8");

productForm = replaceOnce(
  productForm,
  `import Link from "next/link";`,
  `"use client";

import { useState } from "react";
import Link from "next/link";`,
  "ProductForm：加入 useState"
);

productForm = replaceOnce(
  productForm,
  `}: ProductFormProps) {
  return (`,
  `}: ProductFormProps) {
  const initialOriginalPrice = product?.originalPrice ?? "";
  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean(initialOriginalPrice.trim())
  );
  const [originalPrice, setOriginalPrice] = useState(
    initialOriginalPrice
  );

  return (`,
  "ProductForm：加入原價狀態"
);

productForm = replaceOnce(
  productForm,
  `          {product ? (
            <label>
              <span>原價</span>
              <input
                name="originalPrice"
                defaultValue={product.originalPrice ?? ""}
                placeholder="例如：原價 $ 1,290"
              />
            </label>
          ) : null}

          <label>
            <span>目前售價／活動價 *</span>
            <input
              name="price"
              required
              defaultValue={product?.price ?? ""}
              placeholder="例如：產地價 $ 890"
            />
          </label>`,
  `          <label>
            <span>
              <input
                type="checkbox"
                checked={showOriginalPrice}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setShowOriginalPrice(checked);

                  if (!checked) {
                    setOriginalPrice("");
                  }
                }}
              />
              顯示原價
            </span>
          </label>

          <label>
            <span>原價（NT$）</span>
            <input
              name="originalPrice"
              value={showOriginalPrice ? originalPrice : ""}
              disabled={!showOriginalPrice}
              inputMode="numeric"
              onChange={(event) =>
                setOriginalPrice(event.target.value)
              }
              placeholder="例如：2980"
            />
            {!showOriginalPrice ? (
              <input type="hidden" name="originalPrice" value="" />
            ) : null}
          </label>

          <label>
            <span>售價（NT$）*</span>
            <input
              name="price"
              required
              inputMode="numeric"
              defaultValue={product?.price ?? ""}
              placeholder="例如：2160"
            />
          </label>`,
  "ProductForm：更新價格欄位"
);

fs.writeFileSync(productFormPath, productForm, "utf8");

// --------------------------------------------------
// 2. ProductCardEditForm.tsx
// --------------------------------------------------

const cardFormPath =
  "app/admin/products/_components/ProductCardEditForm.tsx";

let cardForm = fs.readFileSync(cardFormPath, "utf8");

cardForm = replaceOnce(
  cardForm,
  `  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ?? ""
  );
  const [price, setPrice] = useState(product.price ?? "");`,
  `  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice ?? ""
  );
  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean((product.originalPrice ?? "").trim())
  );
  const [price, setPrice] = useState(product.price ?? "");`,
  "ProductCardEditForm：加入原價顯示狀態"
);

cardForm = replaceOnce(
  cardForm,
  `            <div className={styles.twoColumns}>
              <label>
                <span>原價</span>
                <input
                  name="originalPrice"
                  value={originalPrice}
                  onChange={(event) =>
                    setOriginalPrice(event.target.value)
                  }
                  placeholder="例如：原價 $2,980"
                />
              </label>

              <label>
                <span>售價／活動價</span>
                <input
                  name="price"
                  required
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="例如：產地價 $2,160"
                />
              </label>
            </div>`,
  `            <label>
              <span>
                <input
                  type="checkbox"
                  checked={showOriginalPrice}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setShowOriginalPrice(checked);

                    if (!checked) {
                      setOriginalPrice("");
                    }
                  }}
                />
                顯示原價
              </span>
            </label>

            <div className={styles.twoColumns}>
              <label>
                <span>原價（NT$）</span>
                <input
                  name="originalPrice"
                  value={showOriginalPrice ? originalPrice : ""}
                  disabled={!showOriginalPrice}
                  inputMode="numeric"
                  onChange={(event) =>
                    setOriginalPrice(event.target.value)
                  }
                  placeholder="例如：2980"
                />
                {!showOriginalPrice ? (
                  <input type="hidden" name="originalPrice" value="" />
                ) : null}
              </label>

              <label>
                <span>售價（NT$）</span>
                <input
                  name="price"
                  required
                  inputMode="numeric"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  placeholder="例如：2160"
                />
              </label>
            </div>`,
  "ProductCardEditForm：更新價格欄位"
);

fs.writeFileSync(cardFormPath, cardForm, "utf8");

console.log("✓ ProductForm 價格欄位修改完成");
console.log("✓ ProductCardEditForm 價格欄位修改完成");
console.log("✓ 已加入顯示／隱藏原價控制");
console.log("✓ 尚未修改前台價格格式");

