import Link from "next/link";

import {
  createHomepageSectionAction,
} from "./actions";
import HomepagePreview from "./HomepagePreview";
import HomepagePublishPanel from "./HomepagePublishPanel";
import HomepageSectionSorter from "./HomepageSectionSorter";

import {
  listStorefrontSectionItems,
  listStorefrontSections,
} from "../../../lib/storefront-section-repository";
import {
  getHomepagePublicationStatus,
} from "../../../lib/cms/modules/homepage/publication";
import {
  listDatabaseProducts,
} from "../../../lib/product-repository";

export const dynamic = "force-dynamic";

export default async function HomepageStudioPage() {
  const [
    allSections,
    publicationStatus,
    allProducts,
  ] = await Promise.all([
    listStorefrontSections({
      includeInactive: true,
    }),
    getHomepagePublicationStatus(),
    listDatabaseProducts({
      includeInactive: true,
    }),
  ]);

  const homepageSections = allSections.filter(
    (section) => section.sectionType === "homepage"
  );

  const groups = await Promise.all(
    homepageSections.map(async (section) => ({
      section,
      items: await listStorefrontSectionItems(section.id, {
        includeHidden: true,
        includeInactiveProducts: true,
      }),
    }))
  );

  const enabledCount = homepageSections.filter(
    (section) => section.isActive
  ).length;

  const totalItems = groups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.eyebrow}>
            HOMEPAGE STUDIO
          </span>

          <h1 style={styles.title}>
            首頁管理
          </h1>

          <p style={styles.subtitle}>
            新增、編輯、啟用、排序與管理首頁商品區塊。
            Code 由系統自動產生，建立後固定作為區塊識別碼。
          </p>
        </div>

        <div style={styles.headerActions}>
          <details style={styles.createDetails}>
            <summary style={styles.primaryButton}>
              ＋ 新增首頁區塊
            </summary>

            <form
              action={createHomepageSectionAction}
              style={styles.createForm}
            >
              <input
                name="name"
                placeholder="區塊名稱，例如：新品推薦"
                style={styles.input}
                required
              />

              <input
                name="description"
                placeholder="區塊描述"
                style={styles.input}
              />

              <select
                name="desktopColumns"
                defaultValue="4"
                style={styles.input}
              >
                <option value="3">桌機每列 3 個</option>
                <option value="4">桌機每列 4 個</option>
                <option value="5">桌機每列 5 個</option>
              </select>

              <select
                name="mobileColumns"
                defaultValue="2"
                style={styles.input}
              >
                <option value="1">手機每列 1 個</option>
                <option value="2">手機每列 2 個</option>
              </select>

              <input
                name="maxItems"
                type="number"
                min="1"
                max="24"
                defaultValue="8"
                placeholder="最多顯示商品數"
                style={styles.input}
              />

              <select
                name="backgroundStyle"
                defaultValue="default"
                style={styles.input}
              >
                <option value="default">預設背景</option>
                <option value="soft">柔和米色</option>
                <option value="white">純白背景</option>
              </select>

              <small style={styles.codeNote}>
                Code 會由系統自動建立，無須手動輸入。
              </small>

              <button
                type="submit"
                style={styles.submitButton}
              >
                建立
              </button>
            </form>
          </details>

          <Link
            href="/admin/storefront"
            style={styles.secondaryButton}
          >
            商城配置
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            style={styles.primaryButton}
          >
            開啟正式首頁
          </Link>
        </div>
      </header>

      <HomepagePublishPanel
        currentVersionNumber={
          publicationStatus.currentVersionNumber
        }
        publishedAt={
          publicationStatus.publishedAt
        }
        history={
          publicationStatus.history
        }
      />

      <section style={styles.summaryGrid}>
        <SummaryCard
          label="首頁區塊"
          value={homepageSections.length}
        />

        <SummaryCard
          label="啟用中區塊"
          value={enabledCount}
        />

        <SummaryCard
          label="區塊商品數"
          value={totalItems}
        />

        <SummaryCard
          label="停用區塊"
          value={homepageSections.length - enabledCount}
          warning={
            homepageSections.length - enabledCount > 0
          }
        />
      </section>

      <div style={styles.workspace}>
        <div>
          {groups.length > 0 ? (
            <HomepageSectionSorter
              initialGroups={groups.map(({ section, items }) => ({
                section,
                itemCount: items.length,
                visibleItemCount: items.filter(
                  (item) => item.isVisible
                ).length,
                productIds: items.map(
                  (item) => item.productId
                ),
              }))}
              products={allProducts.map((product) => ({
                id: product.id,
                displayCode: product.displayCode,
                sku: product.sku,
                name: product.name,
                cardName: product.cardName,
                status: product.status,
                category: String(
                  product.storefrontCategory ||
                    product.category ||
                    "未分類"
                ),
                series: product.series || "",
                image: product.image || "",
                price: product.price || "",
                salePriceAmount:
                  product.salePriceAmount,
                originalPriceAmount:
                  product.originalPriceAmount,
                originalPrice:
                  product.originalPrice,
              }))}
            />
          ) : (
            <section style={styles.emptyState}>
              <strong>
                目前尚未建立首頁商品區塊
              </strong>

              <p>
                點選「＋ 新增首頁區塊」建立第一個區塊，
                Code 將由系統自動產生。
              </p>
            </section>
          )}
        </div>

        <HomepagePreview />
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.summaryCard,
        ...(warning
          ? styles.summaryCardWarning
          : {}),
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "min(1600px, calc(100% - 48px))",
    margin: "0 auto",
    padding: "40px 0 80px",
    color: "#3d2d31",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 28,
  },

  headerActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  eyebrow: {
    display: "block",
    marginBottom: 8,
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.18em",
  },

  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.1,
  },

  subtitle: {
    maxWidth: 760,
    margin: "12px 0 0",
    color: "#75666a",
    lineHeight: 1.7,
  },

  primaryButton: {
    borderRadius: 999,
    padding: "10px 16px",
    color: "#fff",
    textDecoration: "none",
    background: "#8c2940",
  },

  secondaryButton: {
    border: "1px solid rgba(140, 41, 64, 0.22)",
    borderRadius: 999,
    padding: "10px 16px",
    color: "#8c2940",
    textDecoration: "none",
    background: "#fff",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 24,
  },

  summaryCard: {
    display: "grid",
    gap: 8,
    padding: 20,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(140, 41, 64, 0.12)",
    borderRadius: 18,
    background: "#fff",
  },

  summaryCardWarning: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(180, 35, 24, 0.3)",
    background: "#fff7f6",
  },

  workspace: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 430px)",
    gap: 24,
    alignItems: "start",
  },

  createDetails: {
    position: "relative",
  },

  createForm: {
    position: "absolute",
    right: 0,
    top: "48px",
    zIndex: 20,
    display: "grid",
    gap: 10,
    width: 320,
    padding: 16,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid rgba(140,41,64,0.15)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },

  input: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(140,41,64,0.2)",
    background: "#fff",
  },

  codeNote: {
    color: "#837478",
    lineHeight: 1.5,
  },

  submitButton: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: "#8c2940",
    color: "#fff",
    fontWeight: 800,
  },

  emptyState: {
    display: "grid",
    justifyItems: "center",
    gap: 10,
    padding: 42,
    border:
      "1px dashed rgba(140, 41, 64, 0.25)",
    borderRadius: 20,
    color: "#75666a",
    textAlign: "center",
    background: "#fffafb",
  },
};
