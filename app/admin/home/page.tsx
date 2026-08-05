import { listDatabaseProducts } from "../../../lib/product-repository";
import { getSiteStudioConfig } from "../../../lib/site-studio-repository";
import HomeManager from "./_components/HomeManager";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [config, products] = await Promise.all([
    getSiteStudioConfig(),
    listDatabaseProducts({ includeInactive: true }),
  ]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>HOMEPAGE BUILDER</p>
          <h1>首頁版面管理</h1>
          <p>新增視覺圖片或商品區塊，拖曳區塊與商品順序；熱銷排行榜維持固定。</p>
        </div>
        <span className={styles.statusBadge}>可編輯</span>
      </header>

      <HomeManager initialSections={config.sections} products={products} />
    </div>
  );
}
