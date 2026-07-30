"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryConfig } from "../../../../lib/storefront-core";
import type { DatabaseProduct } from "../../../../lib/product-repository";
import styles from "./product-form.module.css";
import ProductImageUploader from "./ProductImageUploader";

type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  productType?: "product" | "combo";
};

const categories = Object.keys(categoryConfig);

function normalizeOriginalPriceInput(value: string) {
  const match = value.trim().match(/^原價\s*\$\s*([\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function normalizeSellingPriceInput(value: string) {
  const match = value.trim().match(/^產地價\s*\$\s*([\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

export default function ProductForm({
  product,
  action,
  submitLabel,
  productType = "product",
}: ProductFormProps) {
  const initialOriginalPrice = normalizeOriginalPriceInput(
    product?.originalPrice ?? ""
  );
  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean(initialOriginalPrice.trim())
  );
  const [originalPrice, setOriginalPrice] = useState(
    initialOriginalPrice
  );

  return (
    <form action={action} className={styles.form}>
      <input
        type="hidden"
        name="productType"
        value={productType}
      />

      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>基本資料</span>
            <h2>商品資訊</h2>
          </div>
          {product ? <strong>商品 ID #{product.id}</strong> : null}
        </div>

        <div className={styles.grid}>
          <label className={styles.span2}>
            <span>商品名稱 *</span>
            <input
              name="name"
              required
              defaultValue={product?.name ?? ""}
            />
          </label>

          {product ? (
            <label>
              <span>貨號</span>
              <input
                name="sku"
                defaultValue={product.sku ?? ""}
                placeholder="可留空"
              />
            </label>
          ) : null}

          <label>
            <span>系列</span>
            <input name="series" defaultValue={product?.series ?? ""} />
          </label>

          <label>
            <span>分類 *</span>
            <select
              name="category"
              required
              defaultValue={product?.category ?? "保養品"}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          {product ? (
            <label>
              <span>規格</span>
              <input name="spec" defaultValue={product.spec ?? ""} />
            </label>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>價格</span>
            <h2>售價設定</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.priceToggle}>
              <span>
                <input
                  className={styles.priceToggleBox}
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
              defaultValue={normalizeSellingPriceInput(
                product?.price ?? ""
              )}
              placeholder="例如：2160"
            />
          </label>

          {product ? (
            <label>
              <span>價格補充</span>
              <input
                name="priceNote"
                defaultValue={product.priceNote ?? ""}
              />
            </label>
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>前台內容</span>
            <h2>圖片與說明</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.span2} ${styles.imageField}`}>
            <span>商品圖片 *</span>
            <ProductImageUploader
              initialImage={product?.image ?? ""}
            />
          </div>

          {product ? (
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
          ) : null}

          <label className={styles.span2}>
            <span>商品簡介</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </label>

          {product ? (
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
          ) : null}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>刊登</span>
            <h2>商品狀態</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>狀態</span>
            <select
              name="status"
              defaultValue={product?.status ?? "active"}
            >
              <option value="active">上架中</option>
              <option value="inactive">下架</option>
              <option value="coming_soon">新品預告</option>
              <option value="sold_out">售罄</option>
            </select>
          </label>

          {product ? (
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
          )}
        </div>
      </section>

      <div className={styles.actions}>
        <Link href="/admin/products">取消</Link>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
