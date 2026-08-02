import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../lib/catalog-repository";
import CategoryManager from "./_components/CategoryManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, series] = await Promise.all([
    getCatalogCategories({
      includeInactive: true,
    }),
    getCatalogSeries({
      includeInactive: true,
    }),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            CATALOG · NEON POSTGRES
          </p>

          <h1>分類管理</h1>

          <p>
            管理商品分類、啟用狀態與顯示順序。
          </p>
        </div>

        <span className={styles.statusBadge}>
          可編輯
        </span>
      </header>

      <CategoryManager
        categories={categories}
        series={series}
      />
    </div>
  );
}