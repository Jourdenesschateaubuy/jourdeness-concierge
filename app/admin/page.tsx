import Link from "next/link";
import { comboProductIds } from "../../lib/storefront-core";
import { listDatabaseProducts } from "../../lib/product-repository";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = await listDatabaseProducts({ includeInactive: true });

  const comboCount = products.filter((product) =>
    comboProductIds.has(product.id)
  ).length;

  const comingSoonCount = products.filter(
    (product) => product.status === "coming_soon"
  ).length;

  const activeCount = products.filter(
    (product) => product.status === "active"
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>ADMIN CONSOLE</p>
          <h1>網站後台</h1>
          <p>商品資料目前直接來自 Neon PostgreSQL。</p>
        </div>
        <Link className={styles.primaryButton} href="/admin/products">
          進入商品管理
        </Link>
      </header>

      <section className={styles.statGrid}>
        <article className={styles.statCard}>
          <span>商品總數</span>
          <strong>{products.length}</strong>
          <small>Neon PostgreSQL</small>
        </article>

        <article className={styles.statCard}>
          <span>上架中</span>
          <strong>{activeCount}</strong>
          <small>目前可用狀態</small>
        </article>

        <article className={styles.statCard}>
          <span>組合商品</span>
          <strong>{comboCount}</strong>
          <small>目前既有組合設定</small>
        </article>

        <article className={styles.statCard}>
          <span>新品預告</span>
          <strong>{comingSoonCount}</strong>
          <small>coming_soon</small>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeading}>
          <div>
            <p className={styles.eyebrow}>PHASE 2B-4</p>
            <h2>商品資料庫管理已啟用</h2>
          </div>
          <span className={styles.statusBadge}>可編輯</span>
        </div>

        <div className={styles.checkGrid}>
          <div>
            <strong>✓ 新增商品</strong>
            <p>新商品會直接建立在 Neon，ID 自動產生。</p>
          </div>

          <div>
            <strong>✓ 編輯商品</strong>
            <p>可修改名稱、貨號、分類、系列、價格、圖片與說明。</p>
          </div>

          <div>
            <strong>✓ 商品狀態</strong>
            <p>列表可快速切換上架、下架、新品預告與售罄。</p>
          </div>

          <div>
            <strong>✓ 刪除商品</strong>
            <p>刪除前會要求再次確認，避免誤觸。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
