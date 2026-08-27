"use client";

import {  useState } from "react";
import Link from "next/link";

import type {
  CatalogCategory,
  CatalogSeries,
} from "../../../../lib/catalog-repository";
import type { DatabaseProduct } from "../../../../lib/product-repository";

import ProductImageUploader from "./ProductImageUploader";
import ProductCatalogFields from "./ProductCatalogFields";
import styles from "./product-form.module.css";

type ProductFormProps = {
  product?: DatabaseProduct;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  catalogCategories: CatalogCategory[];
  catalogSeries: CatalogSeries[];
  initialCategoryIds?: number[];
};

type Tab = "card" | "detail" | "manage";


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


export default function ProductForm({
  product,
  action,
  submitLabel,
  catalogCategories,
  catalogSeries,
  initialCategoryIds,
}: ProductFormProps) {
  const [tab, setTab] = useState<Tab>("card");

  const initialOriginalPrice = String(
    product?.originalPriceAmount ??
      normalizeOriginalPriceInput(product?.originalPrice ?? "")
  );

  const [showOriginalPrice, setShowOriginalPrice] = useState(
    Boolean(initialOriginalPrice.trim())
  );
  const [originalPrice, setOriginalPrice] = useState(initialOriginalPrice);

  const [status, setStatus] = useState(
    product?.status ?? "active"
  );


  return (
    <form action={action} className={styles.form}>

      {product ? (
        <input type="hidden" name="id" value={product.id} />
      ) : null}

      <div
        className={styles.tabs}
        style={{
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        }}
      >
        <button
          type="button"
          className={tab === "card" ? styles.activeTab : ""}
          onClick={() => setTab("card")}
        >
          商品卡
        </button>


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

            {(
              <label>
                <span>售價（NT$）*</span>
                <input
                  name="price"
                  required
                  inputMode="numeric"
                  defaultValue={String(
                    product?.salePriceAmount ??
                      normalizeSellingPriceInput(product?.price ?? "")
                  )}
                  placeholder="例如：2160"
                />
              </label>
            )}

            <label className={styles.span2}>
              <span>促銷／價格補充文字</span>
              <input
                name="priceNote"
                defaultValue={
                  product?.promotionText ?? product?.priceNote ?? ""
                }
                placeholder="例如：實際優惠依 LINE 小幫手確認"
              />
            </label>
          </div>
        </section>
      </div>


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
            {product ? (
              <>
                <label>
                  <span>商品編號</span>
                  <input value={product.displayCode} readOnly />
                </label>

                <label>
                  <span>商品類型</span>
                  <input
                    value={
                      "一般商品"
                    }
                    readOnly
                  />
                </label>
              </>
            ) : (
              <div className={`${styles.span2} ${styles.positionNote}`}>
                建立後系統會自動分配 P-xxxx 商品編號。內部資料庫 ID 不會重新編號。
              </div>
            )}
            <ProductCatalogFields
              catalogCategories={catalogCategories}
              catalogSeries={catalogSeries}
              initialPrimaryCategory={
                product?.storefrontCategory ?? ""
              }
              initialCategoryIds={initialCategoryIds}
              initialSeries={product?.series ?? ""}
              mirrorPrimaryToCategory
            />

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
                value={status}
                onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "active"
                    | "inactive"
                    | "coming_soon"
                    | "sold_out"
                )
              }
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
          {status === "active" ? (
            <>
              上架中的商品必須設定「前台分類」；儲存後會出現在該商城分類與系列中。
            </>
          ) : (
            <>
              目前狀態不是「上架中」，商品不會以一般販售商品顯示在正式商城。
            </>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/products">取消</Link>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
