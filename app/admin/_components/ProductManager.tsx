"use client";

import { useMemo, useState } from "react";
import type {
  DatabaseProduct,
  ProductStatus,
} from "../../../lib/product-repository";
import styles from "../admin.module.css";

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
      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋商品</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="商品名稱、系列、ID…"
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
        <span style={{ marginLeft: 10 }}>來源：Neon PostgreSQL</span>
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
              <th>排序</th>
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
                      <small>{product.spec ?? product.description}</small>
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
                  <span
                    className={
                      product.status === "active"
                        ? styles.activeBadge
                        : product.status === "coming_soon"
                          ? styles.comingSoonBadge
                          : styles.statusBadge
                    }
                  >
                    {statusLabel[product.status]}
                  </span>
                </td>
                <td>{product.sortOrder}</td>
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
    </section>
  );
}
