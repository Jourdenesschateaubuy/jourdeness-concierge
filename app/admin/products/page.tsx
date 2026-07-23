import { comboProductIds } from "../../../lib/storefront-core";
import { listDatabaseProducts } from "../../../lib/product-repository";
import ProductManager from "../_components/ProductManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const databaseProducts = await listDatabaseProducts({
    includeInactive: true,
  });

  const adminProducts = databaseProducts.map((product) => ({
    ...product,
    isCombo: comboProductIds.has(product.id),
  }));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>PRODUCTS · NEON POSTGRES</p>
          <h1>商品管理</h1>
          <p>
            目前商品資料已直接讀取 Neon PostgreSQL。這一版先確認資料庫讀取、
            搜尋、分類與狀態顯示都正常。
          </p>
        </div>
        <span className={styles.statusBadge}>資料庫唯讀</span>
      </header>

      <ProductManager products={adminProducts} />
    </div>
  );
}
