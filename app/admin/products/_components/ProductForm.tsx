"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { categoryConfig } from "../../../../lib/storefront-core";
import type { ComboConfig } from "../../../../lib/storefront-core";
import type { DatabaseProduct } from "../../../../lib/product-repository";

import ComboConfigEditor from "./ComboConfigEditor";
import ProductImageUploader from "./ProductImageUploader";
import styles from "./product-form.module.css";

type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  productType?: "product" | "combo";
};

type Tab = "card" | "combo" | "detail" | "manage";

const categories = Object.keys(categoryConfig);

function normalizeOriginalPriceInput(value: string) {
  const match = value.trim().match(/^原價\s*\$\s*([\d,]+)$/);
  return match ? match[1].replace(/,/g, "") : value;
}

function normalizeSellingPriceInput(value: string) {
  const match = value
    .trim()
    .match(/^(?:產地價|活動價|售價)\s*\$\s*([\d,]+)$/);

  return match ? match[1].replace(/,/g, "") : value;
}

function createEmptyComboConfig(productId: number): ComboConfig {
  return {
    productId,
    type: "mix_match",
    unitLabel: "件",
    allowSameProduct: true,
    options: [],
    plans: [],
  };
}

export default function ProductForm({
  product,
  action,
  submitLabel,
  productType = "product",
}: ProductFormProps) {
  const isCombo = productType === "combo";
  const [tab, setTab] = useState<Tab>("card");

  const initialOriginalPrice = normalizeOriginalPriceInput(
    product?.originalPrice ?? ""
  );

  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean(initialOriginalPrice.trim())
  );
  const [originalPrice, setOriginalPrice] = useState(initialOriginalPrice);

  const defaultStorefrontCategory =
    product?.storefrontCategory ??
    (isCombo && categories.includes("本月優惠")
      ? "本月優惠"
      : categories[0] ?? "臉部保養");

  const [storefrontCategory, setStorefrontCategory] = useState(
    defaultStorefrontCategory
  );

  const comboConfig = useMemo(
    () =>
      product?.comboConfig ??
      createEmptyComboConfig(product?.id ?? 0),
    [product]
  );

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="productType" value={productType} />

      {product ? (
        <input type="hidden" name="id" value={product.id} />
      ) : null}

      <input
        type="hidden"
        name="category"
        value={isCombo ? "組合價" : storefrontCategory}
      />

      <div
        className={styles.tabs}
        style={{
          gridTemplateColumns: isCombo
            ? "repeat(4, minmax(0, 1fr))"
            : "repeat(3, minmax(0, 1fr))",
        }}
      >
        <button
          type="button"
          className={tab === "card" ? styles.activeTab : ""}
          onClick={() => setTab("card")}
        >
          商品卡
        </button>

        {isCombo ? (
          <button
            type="button"
            className={tab === "combo" ? styles.activeTab : ""}
            onClick={() => setTab("combo")}
          >
            組合內容
          </button>
        ) : null}

        <button
          type="button"
          className={tab === "detail" ? styles.activeTab : ""}
          onClick={() => setTab("detail")}
        >
          商品資訊
        </button>

        <button
          type="button"
          className={tab === "manage" ? styles.activeTab : ""}
          onClick={() => setTab("manage")}
        >
          管理設定
        </button>
      </div>

      <div hidden={tab !== "card"} className={styles.panel}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <span>商品卡</span>
              <h2>客人第一眼看到的內容</h2>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={`${styles.span2} ${styles.imageField}`}>
              <span>商品圖片 *</span>
              <ProductImageUploader initialImage={product?.image ?? ""} />
            </div>

            <label className={styles.span2}>
              <span>商品名稱 *</span>
              <input
                name="name"
                required
                defaultValue={product?.name ?? ""}
              />
            </label>

            <label>
              <span>商品卡名稱</span>
              <input
                name="cardName"
                defaultValue={product?.cardName ?? ""}
                placeholder="留白時使用商品名稱"
              />
            </label>

            <label>
              <span>商品卡副標</span>
              <input
                name="cardSubtitle"
                defaultValue={product?.cardSubtitle ?? ""}
                placeholder="例如：30mL・保濕修護"
              />
            </label>

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

            <div />

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

            <label className={styles.span2}>
              <span>價格補充</span>
              <input
                name="priceNote"
                defaultValue={product?.priceNote ?? ""}
                placeholder="例如：實際優惠依 LINE 小幫手確認"
              />
            </label>
          </div>
        </section>
      </div>

      {isCombo ? (
        <div hidden={tab !== "combo"} className={styles.panel}>
          <ComboConfigEditor
            productId={product?.id ?? 0}
            initialConfig={comboConfig}
          />
        </div>
      ) : null}

      <div hidden={tab !== "detail"} className={styles.panel}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <span>商品資訊</span>
              <h2>商品詳情頁內容</h2>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>規格／組合內容</span>
              <input
                name="spec"
                defaultValue={product?.spec ?? ""}
                placeholder="例如：30mL／瓶"
              />
            </label>

            <label>
              <span>效期顯示文字</span>
              <input
                name="expiryNote"
                defaultValue={product?.expiryNote ?? ""}
              />
            </label>

            <label className={styles.span2}>
              <span>商品簡介</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={product?.description ?? ""}
              />
            </label>

            <label className={styles.span2}>
              <span>商品資訊頁介紹</span>
              <textarea
                name="intro"
                rows={5}
                defaultValue={product?.intro ?? ""}
              />
            </label>

            <label className={styles.span2}>
              <span>使用方式</span>
              <textarea
                name="usage"
                rows={4}
                defaultValue={product?.usage ?? ""}
              />
            </label>

            <label className={styles.span2}>
              <span>注意事項／配送提醒</span>
              <textarea
                name="notice"
                rows={4}
                defaultValue={product?.notice ?? ""}
              />
            </label>
          </div>
        </section>
      </div>

      <div hidden={tab !== "manage"} className={styles.panel}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <span>管理設定</span>
              <h2>商品放置位置與狀態</h2>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>前台主分類 *</span>
              <select
                name="storefrontCategory"
                required
                value={storefrontCategory}
                onChange={(event) =>
                  setStorefrontCategory(event.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>系列</span>
              <input
                name="series"
                defaultValue={product?.series ?? ""}
                placeholder="例如：龍血系列"
              />
            </label>

            <label>
              <span>貨號</span>
              <input
                name="sku"
                defaultValue={product?.sku ?? ""}
                placeholder="可留空"
              />
            </label>

            <label>
              <span>商品狀態</span>
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

            <label>
              <span>排列順序</span>
              <input
                name="sortOrder"
                type="number"
                step="1"
                min="0"
                defaultValue={product?.sortOrder ?? 0}
              />
            </label>

            <label>
              <span>內部效期日期</span>
              <input
                name="internalExpiryDate"
                type="date"
                defaultValue={product?.internalExpiryDate ?? ""}
              />
            </label>
          </div>
        </section>

        <div className={styles.positionNote}>
          建立後，商品卡會出現在所選前台主分類與系列中。
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/products">取消</Link>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
