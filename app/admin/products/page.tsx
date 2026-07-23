import { comboProductIds, products } from "../../../lib/storefront-core";
import ProductManager from "../_components/ProductManager";
import styles from "../admin.module.css";

export default function AdminProductsPage() {
  const adminProducts = products.map((product) => ({
    ...product,
    isCombo: comboProductIds.has(product.id),
  }));

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>PRODUCTS</p>
          <h1>商品管理</h1>
          <p>
            目前直接讀取正式商城的商品主資料。這一版先確認搜尋、分類與資料顯示。
          </p>
        </div>
        <span className={styles.statusBadge}>唯讀模式</span>
      </header>

      <ProductManager products={adminProducts} />
    </div>
  );
}
