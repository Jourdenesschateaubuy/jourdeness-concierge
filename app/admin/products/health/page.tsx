import Link from "next/link";

import {
  getCatalogCategories,
  getCatalogSeries,
} from "../../../../lib/catalog-repository";

import {
  buildProductHealthReport,
} from "../../../../lib/product-health-center";

import {
  listDatabaseProducts,
} from "../../../../lib/product-repository";

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
  const [products, categories, series] =
    await Promise.all([
      listDatabaseProducts({
        includeInactive: true,
      }),
      getCatalogCategories({
        includeInactive: true,
        includeCounts: true,
      }),
      getCatalogSeries({
        includeInactive: true,
        includeCounts: true,
      }),
    ]);

  const report =
    await buildProductHealthReport({
      products,
      categories,
      series,
    });

  const errors =
    report.issues.filter(
      (issue) =>
        issue.severity === "error"
    );

  const warnings =
    report.issues.filter(
      (issue) =>
        issue.severity === "warning"
    );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            PRODUCT DATA HEALTH
          </p>

          <h1>
            商品資料健檢中心
          </h1>

          <p>
            系統會檢查商品編號、分類、系列、圖片、
            Media 發布狀態、價格與組合商品設定，
            協助找出需要修正或進一步確認的商品資料。
          </p>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <Link href="/admin/products">
            ← 返回商品管理
          </Link>

          <a
            href={`/admin/products/health?refresh=${Date.now()}`}
            className={
              styles.primaryAction
            }
          >
            重新健檢
          </a>
        </div>
      </header>

      <section
        className={
          styles.summaryGrid
        }
        aria-label="健檢摘要"
      >
        <article
          className={
            styles.summaryCard
          }
        >
          <span>
            商品總數
          </span>

          <strong>
            {report.totalProducts}
          </strong>

          <small>
            包含啟用、停用、即將上市與售罄商品
          </small>
        </article>

        <article
          className={`${styles.summaryCard} ${styles.healthyCard}`}
        >
          <span>
            資料正常
          </span>

          <strong>
            {report.healthyProducts}
          </strong>

          <small>
            目前未偵測到錯誤或警告的商品
          </small>
        </article>

        <article
          className={`${styles.summaryCard} ${styles.errorCard}`}
        >
          <span>
            錯誤
          </span>

          <strong>
            {report.errorCount}
          </strong>

          <small>
            建議優先修正，可能影響商城正常顯示
          </small>
        </article>

        <article
          className={`${styles.summaryCard} ${styles.warningCard}`}
        >
          <span>
            警告
          </span>

          <strong>
            {report.warningCount}
          </strong>

          <small>
            資料仍可使用，但建議進一步確認
          </small>
        </article>
      </section>

      <section
        className={
          styles.checkPanel
        }
      >
        <div>
          <span>
            健檢時間
          </span>

          <strong>
            {formatGeneratedAt(
              report.generatedAt
            )}
          </strong>
        </div>

        <div>
          <span>
            需要處理的商品
          </span>

          <strong>
            {
              report.affectedProducts
            }
          </strong>
        </div>

        <div>
          <span>
            本機圖片
          </span>

          <strong>
            {report.localImagesChecked -
              report.localImagesMissing}
            /
            {
              report.localImagesChecked
            }
          </strong>

          <small>
            已確認存在 / 已檢查
          </small>
        </div>

        <div>
          <span>
            遠端圖片
          </span>

          <strong>
            {
              report.remoteImagesSkipped
            }
          </strong>

          <small>
            遠端網址不進行本機檔案檢查
          </small>
        </div>

        <div>
          <span>
            售罄商品
          </span>

          <strong>
            {
              report.statusCounts
                .sold_out
            }
          </strong>

          <small>
            商品狀態設定為售罄
          </small>
        </div>
      </section>

      {report.issues.length ===
      0 ? (
        <section
          className={
            styles.allClear
          }
        >
          <span>
            ✓
          </span>

          <div>
            <h2>
              所有商品資料目前正常
            </h2>

            <p>
              商品編號、分類、系列、圖片、
              Media 發布狀態、價格與組合商品設定，
              目前均未發現需要處理的問題。
            </p>
          </div>
        </section>
      ) : (
        <div
          className={
            styles.issueSections
          }
        >
          <section
            className={
              styles.issueSection
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <div>
                <p>
                  ERRORS
                </p>

                <h2>
                  需要優先修正
                </h2>
              </div>

              <span
                className={
                  styles.errorCount
                }
              >
                {errors.length}
              </span>
            </div>

            {errors.length ===
            0 ? (
              <p
                className={
                  styles.emptyMessage
                }
              >
                目前沒有錯誤。
              </p>
            ) : (
              <div
                className={
                  styles.issueList
                }
              >
                {errors.map(
                  (issue) => (
                    <article
                      className={
                        styles.issueCard
                      }
                      key={
                        issue.id
                      }
                    >
                      <div
                        className={
                          styles.issueMeta
                        }
                      >
                        <span
                          className={
                            styles.errorBadge
                          }
                        >
                          錯誤
                        </span>

                        {issue.displayCode ? (
                          <strong>
                            {
                              issue.displayCode
                            }
                          </strong>
                        ) : null}

                        {issue.productId ? (
                          <small>
                            DB #
                            {
                              issue.productId
                            }
                          </small>
                        ) : null}
                      </div>

                      <h3>
                        {issue.title}
                      </h3>

                      {issue.productName ? (
                        <p
                          className={
                            styles.productName
                          }
                        >
                          {
                            issue.productName
                          }
                        </p>
                      ) : null}

                      <p>
                        {issue.detail}
                      </p>

                      <div
                        className={
                          styles.suggestion
                        }
                      >
                        <strong>
                          建議處理方式
                        </strong>

                        <span>
                          {
                            issue.suggestion
                          }
                        </span>
                      </div>

                      {issue.editHref ? (
                        <Link
                          href={
                            issue.editHref
                          }
                        >
                          前往商品編輯 →
                        </Link>
                      ) : null}
                    </article>
                  )
                )}
              </div>
            )}
          </section>

          <section
            className={
              styles.issueSection
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <div>
                <p>
                  WARNINGS
                </p>

                <h2>
                  建議進一步確認
                </h2>
              </div>

              <span
                className={
                  styles.warningCount
                }
              >
                {warnings.length}
              </span>
            </div>

            {warnings.length ===
            0 ? (
              <p
                className={
                  styles.emptyMessage
                }
              >
                目前沒有警告。
              </p>
            ) : (
              <div
                className={
                  styles.issueList
                }
              >
                {warnings.map(
                  (issue) => (
                    <article
                      className={
                        styles.issueCard
                      }
                      key={
                        issue.id
                      }
                    >
                      <div
                        className={
                          styles.issueMeta
                        }
                      >
                        <span
                          className={
                            styles.warningBadge
                          }
                        >
                          警告
                        </span>

                        {issue.displayCode ? (
                          <strong>
                            {
                              issue.displayCode
                            }
                          </strong>
                        ) : null}

                        {issue.productId ? (
                          <small>
                            DB #
                            {
                              issue.productId
                            }
                          </small>
                        ) : null}
                      </div>

                      <h3>
                        {issue.title}
                      </h3>

                      {issue.productName ? (
                        <p
                          className={
                            styles.productName
                          }
                        >
                          {
                            issue.productName
                          }
                        </p>
                      ) : null}

                      <p>
                        {issue.detail}
                      </p>

                      <div
                        className={
                          styles.suggestion
                        }
                      >
                        <strong>
                          建議處理方式
                        </strong>

                        <span>
                          {
                            issue.suggestion
                          }
                        </span>
                      </div>

                      {issue.editHref ? (
                        <Link
                          href={
                            issue.editHref
                          }
                        >
                          前往商品編輯 →
                        </Link>
                      ) : null}
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <section
        className={
          styles.scopePanel
        }
      >
        <h2>
          目前健檢範圍
        </h2>

        <div>
          <span>
            商品編號是否缺漏、重複，以及 P- / C- 前綴是否正確
          </span>

          <span>
            商品分類與系列是否存在，以及兩者是否正確匹配
          </span>

          <span>
            商品主圖實體檔案是否存在
          </span>

          <span>
            Media Library 圖片是否存在且已完成正式發布
          </span>

          <span>
            一般商品與組合商品設定是否符合商品類型
          </span>

          <span>
            組合商品選項、方案、商品連結與價格設定是否完整
          </span>

          <span>
            商品卡價格與結構化價格是否一致
          </span>

          <span>
            原價與售價的邏輯是否合理
          </span>

          <span>
            商品狀態是否為啟用、停用、即將上市或售罄
          </span>
        </div>
      </section>
    </main>
  );
}