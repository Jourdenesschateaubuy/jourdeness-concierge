import Link from "next/link";

import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../lib/catalog-repository";
import {
  listDatabaseProducts,
  type DatabaseProduct,
} from "../../../lib/product-repository";

export const dynamic = "force-dynamic";

const statusLabels: Record<DatabaseProduct["status"], string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

function effectiveCategory(product: DatabaseProduct) {
  return product.storefrontCategory?.trim() || product.category;
}

export default async function StorefrontConfigurationPage() {
  const [categories, series, products] = await Promise.all([
    getCatalogCategories({
      includeInactive: true,
      includeCounts: true,
    }),
    getCatalogSeries({
      includeInactive: true,
      includeCounts: true,
    }),
    listDatabaseProducts({
      includeInactive: true,
    }),
  ]);

  const uncategorizedProducts = products.filter(
    (product) =>
      product.status === "active" &&
      !product.storefrontCategory?.trim()
  );

  const inactiveCategoryNames = new Set(
    categories
      .filter((category) => !category.isActive)
      .map((category) => category.name)
  );

  const productsInInactiveCategories = products.filter((product) =>
    inactiveCategoryNames.has(effectiveCategory(product))
  );

  const activeProductCount = products.filter(
    (product) => product.status === "active"
  ).length;

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.eyebrow}>STOREFRONT CONFIGURATION</span>
          <h1 style={styles.title}>商城配置</h1>
          <p style={styles.subtitle}>
            先看清楚每個商品目前出現在哪裡，再進入加入、移除與拖曳排序。
          </p>
        </div>

        <Link href="/admin/products" style={styles.secondaryButton}>
          返回商品管理
        </Link>
      </header>

      <section style={styles.summaryGrid}>
        <SummaryCard label="商城分類" value={categories.length} />
        <SummaryCard label="商品總數" value={products.length} />
        <SummaryCard label="上架商品" value={activeProductCount} />
        <SummaryCard
          label="未設定前台分類"
          value={uncategorizedProducts.length}
          warning={uncategorizedProducts.length > 0}
        />
      </section>

      {uncategorizedProducts.length > 0 ? (
        <WarningSection
          title="已上架但未設定前台主分類"
          description="這些商品可能只依賴舊 category 欄位或舊 ID 規則，未來應移入正式商城配置。"
          products={uncategorizedProducts}
        />
      ) : null}

      {productsInInactiveCategories.length > 0 ? (
        <WarningSection
          title="停用分類仍有商品"
          description="分類已停用，但仍有商品指向該分類；前台可能出現位置不一致。"
          products={productsInInactiveCategories}
        />
      ) : null}

      <section style={styles.catalogList}>
        {categories.map((category) => {
          const categoryProducts = products
            .filter(
              (product) =>
                effectiveCategory(product) === category.name
            )
            .sort(
              (left, right) =>
                left.sortOrder - right.sortOrder ||
                left.id - right.id
            );

          const categorySeries = series.filter(
            (item) => item.categoryId === category.id
          );

          return (
            <article key={category.id} style={styles.categoryCard}>
              <div style={styles.categoryHeader}>
                <div>
                  <div style={styles.categoryTitleRow}>
                    <h2 style={styles.categoryTitle}>
                      {category.name}
                    </h2>
                    <span
                      style={
                        category.isActive
                          ? styles.activeBadge
                          : styles.inactiveBadge
                      }
                    >
                      {category.isActive ? "啟用中" : "已停用"}
                    </span>
                  </div>

                  <p style={styles.categoryMeta}>
                    {categoryProducts.length} 項商品・
                    {categorySeries.length} 個系列
                  </p>
                </div>

                <Link
                  href="/admin/categories"
                  style={styles.textLink}
                >
                  管理分類
                </Link>
              </div>

              {categorySeries.length > 0 ? (
                <div style={styles.seriesRow}>
                  {categorySeries.map((item) => (
                    <span
                      key={item.id}
                      style={
                        item.isActive
                          ? styles.seriesChip
                          : styles.seriesChipInactive
                      }
                    >
                      {item.name}
                      {!item.isActive ? "（停用）" : ""}
                    </span>
                  ))}
                </div>
              ) : null}

              {categoryProducts.length > 0 ? (
                <div style={styles.productTable}>
                  <div style={styles.tableHeader}>
                    <span>排序</span>
                    <span>商品</span>
                    <span>系列</span>
                    <span>狀態</span>
                    <span />
                  </div>

                  {categoryProducts.map((product) => (
                    <div key={product.id} style={styles.tableRow}>
                      <strong>{product.sortOrder}</strong>

                      <div style={styles.productIdentity}>
                        <span style={styles.productCode}>
                          {product.displayCode}
                        </span>
                        <strong>{product.name}</strong>
                      </div>

                      <span>{product.series || "未設定"}</span>

                      <span
                        style={
                          product.status === "active"
                            ? styles.activeBadge
                            : styles.neutralBadge
                        }
                      >
                        {statusLabels[product.status]}
                      </span>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        style={styles.textLink}
                      >
                        編輯商品
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  此分類目前沒有商品。
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.summaryCard,
        ...(warning ? styles.summaryCardWarning : {}),
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WarningSection({
  title,
  description,
  products,
}: {
  title: string;
  description: string;
  products: DatabaseProduct[];
}) {
  return (
    <section style={styles.warningSection}>
      <div>
        <span style={styles.warningEyebrow}>需要處理</span>
        <h2 style={styles.warningTitle}>{title}</h2>
        <p style={styles.warningText}>{description}</p>
      </div>

      <div style={styles.warningList}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}/edit`}
            style={styles.warningItem}
          >
            <span>{product.displayCode}</span>
            <strong>{product.name}</strong>
            <small>{statusLabels[product.status]}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "min(1420px, calc(100% - 48px))",
    margin: "0 auto",
    padding: "40px 0 80px",
    color: "#3d2d31",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "flex-start",
    marginBottom: 28,
  },
  eyebrow: {
    display: "block",
    marginBottom: 8,
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.18em",
  },
  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "12px 0 0",
    color: "#75666a",
    lineHeight: 1.7,
  },
  secondaryButton: {
    border: "1px solid rgba(140, 41, 64, 0.22)",
    borderRadius: 999,
    padding: "10px 16px",
    color: "#8c2940",
    textDecoration: "none",
    background: "#fff",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 24,
  },
  summaryCard: {
    display: "grid",
    gap: 8,
    padding: 20,
    border: "1px solid rgba(140, 41, 64, 0.12)",
    borderRadius: 18,
    background: "#fff",
  },
  summaryCardWarning: {
    borderColor: "rgba(180, 35, 24, 0.3)",
    background: "#fff7f6",
  },
  catalogList: {
    display: "grid",
    gap: 18,
  },
  categoryCard: {
    padding: 22,
    border: "1px solid rgba(140, 41, 64, 0.12)",
    borderRadius: 20,
    background: "#fff",
  },
  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
  },
  categoryTitleRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  categoryTitle: {
    margin: 0,
    fontSize: 24,
  },
  categoryMeta: {
    margin: "8px 0 0",
    color: "#7c6d71",
  },
  activeBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 9px",
    background: "#edf8f1",
    color: "#26734d",
    fontSize: 12,
    fontWeight: 800,
  },
  inactiveBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 9px",
    background: "#fff1f0",
    color: "#b42318",
    fontSize: 12,
    fontWeight: 800,
  },
  neutralBadge: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 9px",
    background: "#f4f1f2",
    color: "#65575b",
    fontSize: 12,
    fontWeight: 800,
  },
  seriesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  seriesChip: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#f7f0f2",
    color: "#7e2940",
    fontSize: 12,
  },
  seriesChipInactive: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#f2efef",
    color: "#8c7d80",
    fontSize: 12,
    textDecoration: "line-through",
  },
  productTable: {
    display: "grid",
    gap: 1,
    marginTop: 18,
    overflow: "hidden",
    border: "1px solid rgba(140, 41, 64, 0.1)",
    borderRadius: 14,
    background: "rgba(140, 41, 64, 0.08)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "72px minmax(260px, 1.8fr) minmax(150px, 1fr) 110px 90px",
    gap: 12,
    padding: "11px 14px",
    background: "#f8f3f4",
    color: "#75666a",
    fontSize: 12,
    fontWeight: 800,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "72px minmax(260px, 1.8fr) minmax(150px, 1fr) 110px 90px",
    gap: 12,
    alignItems: "center",
    padding: "13px 14px",
    background: "#fff",
  },
  productIdentity: {
    display: "grid",
    gap: 4,
  },
  productCode: {
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 800,
  },
  textLink: {
    color: "#8c2940",
    fontWeight: 800,
    textDecoration: "none",
  },
  emptyState: {
    marginTop: 18,
    padding: 20,
    border: "1px dashed rgba(140, 41, 64, 0.2)",
    borderRadius: 14,
    color: "#7c6d71",
    textAlign: "center",
    background: "#fffafb",
  },
  warningSection: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 0.8fr) minmax(0, 1.4fr)",
    gap: 22,
    marginBottom: 20,
    padding: 22,
    border: "1px solid rgba(180, 35, 24, 0.22)",
    borderRadius: 18,
    background: "#fff7f6",
  },
  warningEyebrow: {
    color: "#b42318",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.1em",
  },
  warningTitle: {
    margin: "6px 0 8px",
    fontSize: 22,
  },
  warningText: {
    margin: 0,
    color: "#7d625f",
    lineHeight: 1.6,
  },
  warningList: {
    display: "grid",
    gap: 8,
  },
  warningItem: {
    display: "grid",
    gridTemplateColumns: "90px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 12,
    color: "#4a3438",
    textDecoration: "none",
    background: "#fff",
  },
};

