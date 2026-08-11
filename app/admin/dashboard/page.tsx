import Link from "next/link";
import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../lib/catalog-repository";
import { listDatabaseProducts } from "../../../lib/product-repository";
import { ORDER_WEB_APP_URL } from "../../../lib/storefront-core";
import styles from "./dashboard.module.css";

export const dynamic = "force-dynamic";

const statusLabel = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
} as const;

type DashboardOrder = {
  "訂單時間": string;
  "訂單編號": string;
  "姓名": string;
  "LINE ID": string;
  "電話": string;
  "取貨方式": string;
  "商品內容": string;
  "備註": string;
  "狀態": string;
  _row: number;
};

async function loadDashboardOrders() {
  try {
    const response = await fetch(ORDER_WEB_APP_URL, {
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      return [] as DashboardOrder[];
    }

    const payload = (await response.json()) as {
      ok?: boolean;
      orders?: DashboardOrder[];
    };

    return payload.ok && Array.isArray(payload.orders)
      ? payload.orders
      : [];
  } catch {
    return [] as DashboardOrder[];
  }
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const [products, categories, series, orders] = await Promise.all([
    listDatabaseProducts({
      includeInactive: true,
    }),
    getCatalogCategories({
      includeInactive: true,
    }),
    getCatalogSeries({
      includeInactive: true,
    }),
    loadDashboardOrders(),
  ]);

  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  const inactiveProducts = products.filter(
    (product) => product.status === "inactive"
  ).length;

  const comingSoonProducts = products.filter(
    (product) => product.status === "coming_soon"
  ).length;

  const soldOutProducts = products.filter(
    (product) => product.status === "sold_out"
  ).length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  ).length;

  const activeSeries = series.filter(
    (item) => item.isActive
  ).length;

  const pendingOrders = orders.filter(
    (order) => order["狀態"] === "待確認"
  ).length;

  const processingOrders = orders.filter(
    (order) => order["狀態"] === "處理中"
  ).length;

  const completedOrders = orders.filter(
    (order) => order["狀態"] === "已完成"
  ).length;

  const recentProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  const latestUpdatedAt = recentProducts[0]?.updatedAt;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>JOURDENESS CMS</p>

          <h1>網站管理中心</h1>

          <p className={styles.subtitle}>
            集中管理商品、分類、系列與網站內容。
          </p>

          <div className={styles.heroSummary}>
            <span>{products.length} 個商品</span>
            <span>{categories.length} 個分類</span>
            <span>{series.length} 個系列</span>
            <span>{orders.length} 筆訂單</span>
          </div>

          {latestUpdatedAt ? (
            <small className={styles.lastUpdated}>
              最近更新：{formatUpdatedAt(latestUpdatedAt)}
            </small>
          ) : null}
        </div>

        <div className={styles.heroActions}>
          <Link
            href="/admin/products/new"
            className={styles.primaryAction}
          >
            ＋ 新增商品
          </Link>

          <Link
            href="/admin"
            className={styles.secondaryAction}
          >
            開啟網站編輯器
          </Link>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <Link
          href="/admin/products"
          className={styles.statCard}
        >
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>📦</span>
            <span className={styles.statLabel}>全部商品</span>
          </div>

          <strong>{products.length}</strong>

          <small>管理商品資料與排序</small>

          <span className={styles.cardArrow}>
            前往管理 →
          </span>
        </Link>

        <Link
          href="/admin/products"
          className={styles.statCard}
        >
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>✓</span>
            <span className={styles.statLabel}>上架商品</span>
          </div>

          <strong>{activeProducts}</strong>

          <small>目前前台正常顯示</small>

          <span className={styles.cardArrow}>
            查看商品 →
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className={styles.statCard}
        >
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>🧾</span>
            <span className={styles.statLabel}>待確認訂單</span>
          </div>

          <strong>{pendingOrders}</strong>

          <small>
            處理中 {processingOrders} · 已完成 {completedOrders}
          </small>

          <span className={styles.cardArrow}>
            開啟訂單管理 →
          </span>
        </Link>

        <Link
          href="/admin/categories"
          className={styles.statCard}
        >
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>📂</span>
            <span className={styles.statLabel}>分類</span>
          </div>

          <strong>{activeCategories}</strong>

          <small>共 {categories.length} 個分類</small>

          <span className={styles.cardArrow}>
            管理分類 →
          </span>
        </Link>

        <article className={styles.statCard}>
          <div className={styles.statCardTop}>
            <span className={styles.statIcon}>🏷</span>
            <span className={styles.statLabel}>系列</span>
          </div>

          <strong>{activeSeries}</strong>

          <small>共 {series.length} 個系列</small>

          <span className={styles.cardMuted}>
            系列管理即將開放
          </span>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span>快速入口</span>
              <h2>常用管理功能</h2>
            </div>
          </div>

          <div className={styles.moduleGrid}>
            <Link
              href="/admin/products"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>📦</span>

              <div>
                <strong>商品管理</strong>
                <small>{products.length} 個商品</small>
              </div>

              <p>新增、編輯、上下架與拖曳排序。</p>

              <span className={styles.moduleArrow}>
                開啟商品管理 →
              </span>
            </Link>

            <Link
              href="/admin/orders"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>🧾</span>

              <div>
                <strong>訂單管理</strong>
                <small>
                  待確認 {pendingOrders} · 處理中 {processingOrders}
                </small>
              </div>

              <p>查看訂單、顧客資料、商品內容與處理狀態。</p>

              <span className={styles.moduleArrow}>
                開啟訂單管理 →
              </span>
            </Link>

            <Link
              href="/admin/categories"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>📂</span>

              <div>
                <strong>分類管理</strong>
                <small>{categories.length} 個分類</small>
              </div>

              <p>新增、改名、啟用與停用分類。</p>

              <span className={styles.moduleArrow}>
                開啟分類管理 →
              </span>
            </Link>

            <Link
              href="/admin"
              className={`${styles.moduleCard} ${styles.editorCard}`}
            >
              <span className={styles.moduleIcon}>🌐</span>

              <div>
                <strong>網站編輯器</strong>
                <small>Visual Editor</small>
              </div>

              <p>直接預覽網站並點選商品進行修改。</p>

              <span className={styles.moduleArrow}>
                立即開啟 →
              </span>
            </Link>

            <Link
              href="/admin/homepage-studio"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>🏠</span>

              <div>
                <strong>首頁 Builder</strong>
                <small>Homepage Studio</small>
              </div>

              <p>管理首頁區塊、顯示狀態與排序。</p>

              <span className={styles.moduleArrow}>
                開啟首頁 Builder →
              </span>
            </Link>

            <Link
              href="/admin/website-studio/banner"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>🖼</span>

              <div>
                <strong>Banner Manager</strong>
                <small>Banner Builder</small>
              </div>

              <p>管理活動主視覺、圖片與展示順序。</p>

              <span className={styles.moduleArrow}>
                開啟 Banner Manager →
              </span>
            </Link>

            <Link
              href="/admin/website-studio/media"
              className={styles.moduleCard}
            >
              <span className={styles.moduleIcon}>🗂</span>

              <div>
                <strong>Media Library</strong>
                <small>圖片庫</small>
              </div>

              <p>集中管理網站圖片、尺寸與檔案。</p>

              <span className={styles.moduleArrow}>
                開啟 Media Library →
              </span>
            </Link>
          </div>
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span>商品狀態</span>
              <h2>目前分布</h2>
            </div>

            <Link href="/admin/products">
              查看商品
            </Link>
          </div>

          <div className={styles.statusList}>
            <div>
              <span>
                <i className={styles.statusDotActive} />
                上架中
              </span>

              <strong>{activeProducts}</strong>
            </div>

            <div>
              <span>
                <i className={styles.statusDotInactive} />
                下架
              </span>

              <strong>{inactiveProducts}</strong>
            </div>

            <div>
              <span>
                <i className={styles.statusDotComingSoon} />
                新品預告
              </span>

              <strong>{comingSoonProducts}</strong>
            </div>

            <div>
              <span>
                <i className={styles.statusDotSoldOut} />
                售罄
              </span>

              <strong>{soldOutProducts}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span>最近更新</span>
            <h2>最新修改的商品</h2>
          </div>

          <Link href="/admin/products">
            查看全部
          </Link>
        </div>

        <div className={styles.recentList}>
          {recentProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className={styles.recentItem}
            >
              <div className={styles.recentProduct}>
                <div className={styles.recentThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                  />
                </div>

                <div className={styles.recentInfo}>
                  <strong>
                    {product.cardName ?? product.name}
                  </strong>

                  <span>
                    #{product.id} · {product.category}
                  </span>
                </div>
              </div>

              <div className={styles.recentMeta}>
                <span>
                  {statusLabel[product.status]}
                </span>

                <time>
                  {formatUpdatedAt(product.updatedAt)}
                </time>
              </div>
            </Link>
          ))}

          {recentProducts.length === 0 ? (
            <p className={styles.emptyState}>
              目前沒有商品資料。
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}