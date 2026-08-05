import { listDatabaseProducts } from "../../../lib/product-repository";
import ProductManager from "./_components/ProductManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const databaseProducts = await listDatabaseProducts({
    includeInactive: true,
  });

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>PRODUCTS · NEON POSTGRES</p>
          <h1>商品管理</h1>
          <p>
            一般商品使用 P 編號，組合商品使用 C 編號；資料庫內部 ID 保留不變。
          </p>
        </div>
        <span className={styles.statusBadge}>可編輯</span>
      </header>

      <ProductManager products={databaseProducts} />
    </div>
  );
}
