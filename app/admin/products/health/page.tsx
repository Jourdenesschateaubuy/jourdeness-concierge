import Link from "next/link";

import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../../lib/catalog-repository";
import { buildProductHealthReport } from "../../../../lib/product-health";
import { listDatabaseProducts } from "../../../../lib/product-repository";

import styles from "./product-health.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatGeneratedAt(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export default async function ProductHealthPage() {
  const [products, categories, series] = await Promise.all([
    listDatabaseProducts({ includeInactive: true }),
    getCatalogCategories({
      includeInactive: true,
      includeCounts: true,
    }),
    getCatalogSeries({
      includeInactive: true,
      includeCounts: true,
    }),
  ]);

  const report = await buildProductHealthReport({
    products,
    categories,
    series,
  });

  const errors = report.issues.filter(
    (issue) => issue.severity === "error"
  );
  const warnings = report.issues.filter(
    (issue) => issue.severity === "warning"
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>PRODUCT DATA HEALTH</p>
          <h1>商品資料健檢</h1>
          <p>
            自動檢查商品編號、類型、組合內容、價格、分類、系列與本機圖片。
            此頁只讀取資料，不會自動修改資料庫。
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/admin/products">回商品管理</Link>
          <a
            href={`/admin/products/health?refresh=${Date.now()}`}
            className={styles.primaryAction}
          >
            重新檢查
          </a>
        </div>
      </header>

      <section className={styles.summaryGrid} aria-label="健檢摘要">
        <article className={styles.summaryCard}>
          <span>全部商品</span>
          <strong>{report.totalProducts}</strong>
          <small>包含上架、下架、新品與售罄</small>
        </article>

        <article className={`${styles.summaryCard} ${styles.healthyCard}`}>
          <span>目前正常</span>
          <strong>{report.healthyProducts}</strong>
          <small>沒有被本次規則標記的商品</small>
        </article>

        <article className={`${styles.summaryCard} ${styles.errorCard}`}>
          <span>錯誤</span>
          <strong>{report.errorCount}</strong>
          <small>建議先處理，可能影響前台或組合計算</small>
        </article>

        <article className={`${styles.summaryCard} ${styles.warningCard}`}>
          <span>警告</span>
          <strong>{report.warningCount}</strong>
          <small>資料仍可使用，但需要人工確認</small>
        </article>
      </section>

      <section className={styles.checkPanel}>
        <div>
          <span>檢查時間</span>
          <strong>{formatGeneratedAt(report.generatedAt)}</strong>
        </div>
        <div>
          <span>受影響商品</span>
          <strong>{report.affectedProducts}</strong>
        </div>
        <div>
          <span>本機圖片</span>
          <strong>
            {report.localImagesChecked - report.localImagesMissing}/
            {report.localImagesChecked}
          </strong>
        </div>
        <div>
          <span>遠端圖片</span>
          <strong>{report.remoteImagesSkipped}</strong>
          <small>不下載，只略過檔案存在檢查</small>
        </div>
        <div>
          <span>售罄／補貨中</span>
          <strong>{report.statusCounts.sold_out}</strong>
          <small>前台會顯示「補貨中」</small>
        </div>
      </section>

      {report.issues.length === 0 ? (
        <section className={styles.allClear}>
          <span>✓</span>
          <div>
            <h2>目前沒有發現問題</h2>
            <p>商品編號、組合內容、分類、系列、價格與本機圖片都通過檢查。</p>
          </div>
        </section>
      ) : (
        <div className={styles.issueSections}>
          <section className={styles.issueSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p>ERRORS</p>
                <h2>需要優先處理</h2>
              </div>
              <span className={styles.errorCount}>{errors.length}</span>
            </div>

            {errors.length === 0 ? (
              <p className={styles.emptyMessage}>目前沒有錯誤。</p>
            ) : (
              <div className={styles.issueList}>
                {errors.map((issue) => (
                  <article className={styles.issueCard} key={issue.id}>
                    <div className={styles.issueMeta}>
                      <span className={styles.errorBadge}>錯誤</span>
                      {issue.displayCode ? <strong>{issue.displayCode}</strong> : null}
                      {issue.productId ? <small>DB #{issue.productId}</small> : null}
                    </div>
                    <h3>{issue.title}</h3>
                    {issue.productName ? (
                      <p className={styles.productName}>{issue.productName}</p>
                    ) : null}
                    <p>{issue.detail}</p>
                    <div className={styles.suggestion}>
                      <strong>建議處理</strong>
                      <span>{issue.suggestion}</span>
                    </div>
                    {issue.editHref ? (
                      <Link href={issue.editHref}>開啟商品修改 →</Link>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.issueSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p>WARNINGS</p>
                <h2>需要人工確認</h2>
              </div>
              <span className={styles.warningCount}>{warnings.length}</span>
            </div>

            {warnings.length === 0 ? (
              <p className={styles.emptyMessage}>目前沒有警告。</p>
            ) : (
              <div className={styles.issueList}>
                {warnings.map((issue) => (
                  <article className={styles.issueCard} key={issue.id}>
                    <div className={styles.issueMeta}>
                      <span className={styles.warningBadge}>警告</span>
                      {issue.displayCode ? <strong>{issue.displayCode}</strong> : null}
                      {issue.productId ? <small>DB #{issue.productId}</small> : null}
                    </div>
                    <h3>{issue.title}</h3>
                    {issue.productName ? (
                      <p className={styles.productName}>{issue.productName}</p>
                    ) : null}
                    <p>{issue.detail}</p>
                    <div className={styles.suggestion}>
                      <strong>建議處理</strong>
                      <span>{issue.suggestion}</span>
                    </div>
                    {issue.editHref ? (
                      <Link href={issue.editHref}>開啟商品修改 →</Link>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <section className={styles.scopePanel}>
        <h2>本次檢查範圍</h2>
        <div>
          <span>P／C 商品編號缺漏、重複與類型不一致</span>
          <span>一般商品誤帶組合設定、組合商品缺方案</span>
          <span>組合內容商品失效、自我連結與方案價格</span>
          <span>商品卡價格與正式組合方案是否一致</span>
          <span>分類、系列與所屬分類是否一致</span>
          <span>原價與售價的基本合理性</span>
          <span>UPLOAD_ROOT 與 public 內的本機圖片是否存在</span>
          <span>售罄商品數量與「補貨中」狀態覆蓋</span>
        </div>
      </section>
    </main>
  );
}
