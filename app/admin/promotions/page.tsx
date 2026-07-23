
import { listPromotions } from "../../../lib/promotion-repository";
import PromotionManager from "./_components/PromotionManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await listPromotions({ includeInactive: true });

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>PROMOTIONS</p>
          <h1>優惠管理</h1>
          <p>
            優惠固定分成「任搭組合」與「買幾送幾」兩種。
            目前先管理 Neon 資料，前台優惠引擎下一階段再切換。
          </p>
        </div>
      </header>

      <PromotionManager promotions={promotions} />
    </div>
  );
}
