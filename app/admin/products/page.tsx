import { comboProductIds } from "../../../lib/storefront-core";
import { listDatabaseProducts } from "../../../lib/product-repository";
import ProductManager from "./_components/ProductManager";
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
            商品資料已連接 Neon PostgreSQL，可新增、編輯、切換狀態與刪除。
          </p>
        </div>
        <span className={styles.statusBadge}>可編輯</span>
      </header>

      <ProductManager products={adminProducts} />
    </div>
  );
}
