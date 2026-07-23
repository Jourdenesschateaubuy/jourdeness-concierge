
import { listDatabaseProducts } from "../../../../lib/product-repository";
import { createPromotionAction } from "../actions";
import PromotionForm from "../_components/PromotionForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  const products = await listDatabaseProducts({ includeInactive: true });

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>NEW PROMOTION</p>
          <h1>新增優惠</h1>
          <p>建立任搭組合或買幾送幾。</p>
        </div>
      </header>

      <PromotionForm
        products={products}
        action={createPromotionAction}
        submitLabel="建立優惠"
      />
    </div>
  );
}
