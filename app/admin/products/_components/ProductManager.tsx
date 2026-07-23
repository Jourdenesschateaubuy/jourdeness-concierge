"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  DatabaseProduct,
  ProductStatus,
} from "../../../../lib/product-repository";
import {
  changeProductStatusAction,
  deleteProductAction,
} from "../actions";
import styles from "../../admin.module.css";
import actionStyles from "./product-manager-actions.module.css";

type AdminProduct = DatabaseProduct & {
  isCombo: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("zh-TW");
}

const statusLabel: Record<ProductStatus, string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

export default function ProductManager({
  products,
}: {
  products: AdminProduct[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [comboOnly, setComboOnly] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(
        (a, b) => a.localeCompare(b, "zh-TW")
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const keyword = normalize(query);

    return products.filter((product) => {
      if (category !== "全部" && product.category !== category) return false;
      if (status !== "全部" && product.status !== status) return false;
      if (comboOnly && !product.isCombo) return false;

      if (!keyword) return true;

      const haystack = normalize(
        [
          product.id.toString(),
          product.sku ?? "",
          product.name,
          product.cardName ?? "",
          product.category,
          product.series,
          product.spec ?? "",
          product.price,
          product.status,
        ].join(" ")
      );

      return haystack.includes(keyword);
    });
  }, [category, comboOnly, products, query, status]);

  return (
    <section className={styles.panel}>
      <div className={actionStyles.topActions}>
        <div>
          <strong>{products.length} 筆商品</strong>
          <span>來源：Neon PostgreSQL</span>
        </div>
        <Link href="/admin/products/new">＋ 新增商品</Link>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋商品</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="商品名稱、貨號、系列、ID…"
          />
        </label>

        <label className={styles.selectBox}>
          <span>分類</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="全部">全部分類</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectBox}>
          <span>狀態</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="全部">全部狀態</option>
            <option value="active">上架中</option>
            <option value="inactive">下架</option>
            <option value="coming_soon">新品預告</option>
            <option value="sold_out">售罄</option>
          </select>
        </label>

        <label className={styles.toggleBox}>
          <input
            type="checkbox"
            checked={comboOnly}
            onChange={(event) => setComboOnly(event.target.checked)}
          />
          <span>只看組合商品</span>
        </label>
      </div>

      <div className={styles.resultBar}>
        <strong>{filteredProducts.length}</strong>
        <span> / {products.length} 筆商品</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>商品</th>
              <th>分類</th>
              <th>系列</th>
              <th>價格</th>
              <th>優惠</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className={styles.idCell}>#{product.id}</td>

                <td>
                  <div className={styles.productCell}>
                    <div className={styles.thumb}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div>
                      <strong>{product.cardName ?? product.name}</strong>
                      <small>
                        {product.sku ? `貨號 ${product.sku} · ` : ""}
                        {product.spec ?? product.description}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{product.category}</td>
                <td>{product.series}</td>

                <td>
                  <div className={styles.priceCell}>
                    {product.originalPrice && (
                      <small>{product.originalPrice}</small>
                    )}
                    <strong>{product.price}</strong>
                  </div>
                </td>

                <td>
                  {product.isCombo ? (
                    <span className={styles.comboBadge}>組合優惠</span>
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </td>

                <td>
                  <form action={changeProductStatusAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <select
                      className={actionStyles.statusSelect}
                      name="status"
                      defaultValue={product.status}
                      aria-label={`${product.name} 商品狀態`}
                      onChange={(event) => {
                        event.currentTarget.form?.requestSubmit();
                      }}
                    >
                      <option value="active">上架中</option>
                      <option value="inactive">下架</option>
                      <option value="coming_soon">新品預告</option>
                      <option value="sold_out">售罄</option>
                    </select>
                    <noscript>
                      <button type="submit">更新</button>
                    </noscript>
                  </form>
                </td>

                <td>
                  <div className={actionStyles.rowActions}>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      編輯
                    </Link>

                    <form
                      action={deleteProductAction}
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            `確定要刪除「${product.name}」嗎？\n\n此操作會刪除資料庫中的商品資料。`
                          )
                        ) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit">刪除</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <strong>找不到符合條件的商品</strong>
            <p>換一個名稱或清除篩選條件再試一次。</p>
          </div>
        )}
      </div>

      <div className={actionStyles.legend}>
        <span>狀態：</span>
        {Object.entries(statusLabel).map(([key, label]) => (
          <span key={key}>{label}</span>
        ))}
      </div>
    </section>
  );
}
