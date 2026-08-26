import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../lib/catalog-repository";
import {
  listDatabaseProducts,
} from "../../../lib/product-repository";
import CategoryManager from "./_components/CategoryManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, series, products] =
    await Promise.all([
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

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>CATALOG STRUCTURE</p>
          <h1>分類與細項管理</h1>
          <p>依 01、02、03 排列前台分類；系列自動分配 S-xxx 編號，可新增、改名、停用、拖曳與安全刪除。</p>
        </div>
        <span className={styles.statusBadge}>可編輯</span>
      </header>

      <CategoryManager
        categories={categories}
        series={series}
        products={products.map((product) => ({
          id: product.id,
          displayCode: product.displayCode,
          name: product.name,
          category: product.category,
          storefrontCategory:
            product.storefrontCategory ?? "",
          series: product.series,
          status: product.status,
        }))}
      />
    </div>
  );
}
