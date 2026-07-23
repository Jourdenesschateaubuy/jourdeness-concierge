import Link from "next/link";
import {
  categoryConfig,
  comboProductIds,
  products,
} from "../../lib/storefront-core";
import styles from "./admin.module.css";

const visibleMainCategories = [
  "本月優惠",
  "臉部保養",
  "身體洗護",
  "健康補給",
  "精油香氛",
  "新品預告",
] as const;

export default function AdminDashboardPage() {
  const comboCount = products.filter((product) =>
    comboProductIds.has(product.id)
  ).length;
  const comingSoonCount = products.filter(
    (product) => product.category === "新品預告"
  ).length;
  const categoryCount = visibleMainCategories.filter(
    (category) => category in categoryConfig
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>ADMIN CONSOLE</p>
          <h1>網站後台</h1>
          <p>
            現在先直接讀取商城正在使用的商品主資料，確認後台與前台資料能正確對上。
          </p>
        </div>
        <Link className={styles.primaryButton} href="/admin/products">
          進入商品管理
        </Link>
      </header>

      <section className={styles.statGrid}>
        <article className={styles.statCard}>
          <span>目前商品</span>
          <strong>{products.length}</strong>
          <small>storefront-core.ts</small>
        </article>
        <article className={styles.statCard}>
          <span>主要分類</span>
          <strong>{categoryCount}</strong>
          <small>目前前台主導覽</small>
        </article>
        <article className={styles.statCard}>
          <span>組合商品</span>
          <strong>{comboCount}</strong>
          <small>任搭／組合價設定</small>
        </article>
        <article className={styles.statCard}>
          <span>新品預告</span>
          <strong>{comingSoonCount}</strong>
          <small>目前資料狀態</small>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.eyebrow}>PHASE 2A</p>
            <h2>這一版先驗證後台骨架</h2>
          </div>
          <span className={styles.statusBadge}>唯讀模式</span>
        </div>

        <div className={styles.checkGrid}>
          <div>
            <strong>✓ 後台入口</strong>
            <p>/admin 與正式商城分開，不干擾原本購物流程。</p>
          </div>
          <div>
            <strong>✓ 真實商品資料</strong>
            <p>直接讀取前台目前使用的 products，不另外複製一份假資料。</p>
          </div>
          <div>
            <strong>✓ 商品搜尋／篩選</strong>
            <p>商品管理頁可依名稱、系列與分類快速尋找。</p>
          </div>
          <div>
            <strong>下一刀：資料庫寫入</strong>
            <p>確認畫面正常後，再接編輯、刪除、狀態與持久資料庫。</p>
          </div>
        </div>
      </section>

      <section className={styles.warningPanel}>
        <strong>目前不開放修改是刻意的。</strong>
        <p>
          Vercel 部署環境不能把程式檔當成可靠的永久資料庫。第二階段 2B
          會把商品 CRUD 接到真正可持久保存的資料層，再讓前台同步讀取。
        </p>
      </section>
    </div>
  );
}
