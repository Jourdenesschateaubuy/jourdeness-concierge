
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DatabaseProduct } from "../../../../lib/product-repository";
import type {
  GiftMode,
  Promotion,
  PromotionType,
} from "../../../../lib/promotion-repository";
import styles from "./promotion-form.module.css";

type Props = {
  promotion?: Promotion;
  products: DatabaseProduct[];
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
};

function datetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function selectedIds(
  promotion: Promotion | undefined,
  role: "eligible" | "buy" | "gift"
) {
  return new Set(
    promotion?.products
      .filter((item) => item.role === role)
      .map((item) => item.productId) ?? []
  );
}

export default function PromotionForm({
  promotion,
  products,
  action,
  submitLabel,
}: Props) {
  const [type, setType] = useState<PromotionType>(
    promotion?.type ?? "mix_match"
  );
  const [giftMode, setGiftMode] = useState<GiftMode>(
    promotion?.giftMode ?? "same_product"
  );

  const activeProducts = useMemo(
    () =>
      products
        .filter((product) => product.status !== "inactive")
        .sort((a, b) => a.name.localeCompare(b.name, "zh-TW")),
    [products]
  );

  const eligible = selectedIds(promotion, "eligible");
  const buy = selectedIds(promotion, "buy");
  const gift = selectedIds(promotion, "gift");

  const ProductPicker = ({
    name,
    defaultSelected,
    title,
    note,
  }: {
    name: string;
    defaultSelected: Set<number>;
    title: string;
    note: string;
  }) => (
    <div className={styles.picker}>
      <div className={styles.pickerHead}>
        <div>
          <strong>{title}</strong>
          <span>{note}</span>
        </div>
      </div>

      <div className={styles.productGrid}>
        {activeProducts.map((product) => (
          <label key={`${name}-${product.id}`}>
            <input
              type="checkbox"
              name={name}
              value={product.id}
              defaultChecked={defaultSelected.has(product.id)}
            />
            <span>
              <strong>{product.name}</strong>
              <small>
                #{product.id} · {product.series || product.category}
              </small>
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form action={action} className={styles.form}>
      {promotion ? (
        <input type="hidden" name="id" value={promotion.id} />
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>優惠基本資料</span>
            <h2>活動設定</h2>
          </div>
          {promotion ? <strong>優惠 #{promotion.id}</strong> : null}
        </div>

        <div className={styles.grid}>
          <label className={styles.span2}>
            <span>優惠名稱 *</span>
            <input
              name="name"
              required
              defaultValue={promotion?.name ?? ""}
              placeholder="例如：龍血洗沐任選3瓶"
            />
          </label>

          <label>
            <span>優惠類型 *</span>
            <select
              name="type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as PromotionType)
              }
            >
              <option value="mix_match">任搭組合</option>
              <option value="buy_x_get_y">買幾送幾</option>
            </select>
          </label>

          <label>
            <span>狀態</span>
            <select
              name="status"
              defaultValue={promotion?.status ?? "active"}
            >
              <option value="active">啟用</option>
              <option value="inactive">停用</option>
            </select>
          </label>

          <label className={styles.span2}>
            <span>活動說明</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={promotion?.description ?? ""}
            />
          </label>
        </div>
      </section>

      {type === "mix_match" ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <span>任搭組合</span>
              <h2>任選 N 件固定價</h2>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>需選件數 *</span>
              <input
                name="requiredQuantity"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={promotion?.requiredQuantity ?? 3}
              />
            </label>

            <label>
              <span>組合價 NT$ *</span>
              <input
                name="bundlePrice"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={promotion?.bundlePrice ?? ""}
              />
            </label>

            <label className={styles.check}>
              <input
                name="allowSameProduct"
                type="checkbox"
                defaultChecked={promotion?.allowSameProduct ?? true}
              />
              <span>允許同一商品重複選</span>
            </label>
          </div>

          <ProductPicker
            name="eligibleProductIds"
            defaultSelected={eligible}
            title="可任搭商品"
            note="勾選這個優惠可以選擇的商品。"
          />
        </section>
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <div>
                <span>買幾送幾</span>
                <h2>購買與贈品規則</h2>
              </div>
            </div>

            <div className={styles.grid}>
              <label>
                <span>買幾件 *</span>
                <input
                  name="buyQuantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={promotion?.buyQuantity ?? 1}
                />
              </label>

              <label>
                <span>送幾件 *</span>
                <input
                  name="giftQuantity"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={promotion?.giftQuantity ?? 1}
                />
              </label>

              <label>
                <span>贈品模式</span>
                <select
                  name="giftMode"
                  value={giftMode}
                  onChange={(event) =>
                    setGiftMode(event.target.value as GiftMode)
                  }
                >
                  <option value="same_product">同商品</option>
                  <option value="fixed_product">指定贈品</option>
                  <option value="gift_pool">贈品任選</option>
                </select>
              </label>

              <label className={styles.check}>
                <input
                  name="repeatable"
                  type="checkbox"
                  defaultChecked={promotion?.repeatable ?? true}
                />
                <span>達標後可以重複套用</span>
              </label>
            </div>

            <ProductPicker
              name="buyProductIds"
              defaultSelected={buy}
              title="購買商品"
              note="哪些商品的購買數量可以觸發這個優惠。"
            />

            {giftMode !== "same_product" ? (
              <ProductPicker
                name="giftProductIds"
                defaultSelected={gift}
                title={
                  giftMode === "fixed_product"
                    ? "指定贈品"
                    : "可選贈品池"
                }
                note={
                  giftMode === "fixed_product"
                    ? "通常只選一個指定贈品。"
                    : "顧客之後可從這些贈品中選擇。"
                }
              />
            ) : null}
          </section>
        </>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span>優惠優先規則</span>
            <h2>衝突與時間</h2>
          </div>
        </div>

        <div className={styles.grid}>
          <label>
            <span>優先級</span>
            <input
              name="priority"
              type="number"
              step="1"
              defaultValue={promotion?.priority ?? 50}
            />
          </label>

          <label className={styles.check}>
            <input
              name="stackable"
              type="checkbox"
              defaultChecked={promotion?.stackable ?? false}
            />
            <span>允許與其他優惠併用</span>
          </label>

          <label>
            <span>開始時間</span>
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={datetimeLocal(promotion?.startsAt)}
            />
          </label>

          <label>
            <span>結束時間</span>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={datetimeLocal(promotion?.endsAt)}
            />
          </label>
        </div>
      </section>

      <div className={styles.actions}>
        <Link href="/admin/promotions">取消</Link>
        <button type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
