import { createProductAction } from "../actions";
import ProductForm from "../_components/ProductForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>NEW PRODUCT</p>
          <h1>新增商品</h1>
          <p>建立新的商品主資料。商品 ID 會由資料庫自動產生。</p>
        </div>
      </header>

      <ProductForm
        action={createProductAction}
        submitLabel="建立商品"
      />
    </div>
  );
}
