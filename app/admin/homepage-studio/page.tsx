import HomepagePreview from "./HomepagePreview";
import HomepageDraftPublishBar from "./HomepageDraftPublishBar";
import SiteStudioSectionManager from "./SiteStudioSectionManager";
import SecondaryHeroProductManager from "./SecondaryHeroProductManager";

import {
  getSiteStudioDraftConfig,
} from "../../../lib/site-studio-repository";
import {
  listDatabaseProducts,
} from "../../../lib/product-repository";

export const dynamic = "force-dynamic";

export default async function HomepageStudioPage() {
  const [
    config,
    allProducts,
  ] = await Promise.all([
    getSiteStudioDraftConfig(),
    listDatabaseProducts({
      includeInactive: true,
    }),
  ]);

  const sections = config.sections
    .slice()
    .sort(
      (a, b) =>
        (a.sortOrder ?? 999) -
        (b.sortOrder ?? 999)
    );

  const editableSections = sections.filter(
    (section) =>
      section.key !== "ranking"
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
            管理首頁區塊、商品、顯示狀態與排序。
          </p>
        </div>
        <HomepageDraftPublishBar />
      </header>

      <section style={styles.fixedSection}>
        <div style={styles.sectionHeading}>
          <div>
            <span style={styles.sectionEyebrow}>
              FIXED STRUCTURE
            </span>

            <h2 style={styles.sectionTitle}>
              固定首頁區塊
            </h2>
          </div>

          <small style={styles.sectionNote}>
            固定區塊不參與一般首頁排序。
          </small>
        </div>

        <div style={styles.fixedGrid}>
          <FixedCard
            title="首頁主視覺"
            description="750 × 900 px｜圖片固定"
          />

          <FixedCard
            title="TOP 熱銷排行"
            description="TOP 1–6｜位置與版型固定"
          />

          <FixedCard
            title="首頁副主視覺"
            description={`750 × 900 px｜搭配 ${
              config.secondaryHero.productIds?.length ?? 0
            } 個商品`}
          />
        </div>
      </section>
      <div style={styles.workspace}>
        <div>
          <section style={styles.managerSection}>
            <div style={styles.sectionHeading}>
              <div>
                <span style={styles.sectionEyebrow}>
                  MANAGED SECTIONS
                </span>

                <h2 style={styles.sectionTitle}>
                  首頁內容區塊
                </h2>
              </div>

              <small style={styles.sectionNote}>
                目前直接讀取首頁正式設定，不再使用另一套 Homepage Section 資料。
              </small>
            </div>

            <SecondaryHeroProductManager
              hero={
                config.secondaryHero
              }
              products={
                allProducts.map(
                  (product) => ({
                    id: product.id,
                    displayCode:
                      product.displayCode,
                    name: product.name,
                    cardName:
                      product.cardName || "",
                    status:
                      product.status,
                    image:
                      product.image || "",
                    category: String(
                      product.storefrontCategory ||
                        product.category ||
                        "未分類"
                    ),
                    series:
                      product.series || "",
                  })
                )
              }
            />

            <SiteStudioSectionManager
              initialSections={
                editableSections
              }
              products={
                allProducts.map(
                  (product) => ({
                    id: product.id,
                    displayCode:
                      product.displayCode,
                    name: product.name,
                    cardName:
                      product.cardName || "",
                    status:
                      product.status,
                    image:
                      product.image || "",
                    category: String(
                      product.storefrontCategory ||
                        product.category ||
                        "未分類"
                    ),
                    series:
                      product.series || "",
                  })
                )
              }
            />
          </section>
        </div>

        <HomepagePreview />
      </div>
    </main>
  );
}

function FixedCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article style={styles.fixedCard}>
      <span style={styles.lockIcon}>
        🔒
      </span>

      <div>
        <strong style={styles.fixedTitle}>
          {title}
        </strong>

        <p style={styles.fixedDescription}>
          {description}
        </p>
      </div>

      <span style={styles.fixedBadge}>
        固定
      </span>
    </article>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width:
      "min(1600px, calc(100% - 48px))",
    margin: "0 auto",
    padding: "40px 0 80px",
    color: "#3d2d31",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 28,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  eyebrow: {
    display: "block",
    marginBottom: 8,
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".18em",
  },

  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.1,
  },

  subtitle: {
    maxWidth: 780,
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

  fixedSection: {
    marginBottom: 16,
  },

  managerSection: {
    display: "grid",
    gap: 14,
  },

  sectionHeading: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 12,
  },

  sectionEyebrow: {
    display: "block",
    marginBottom: 4,
    color: "#9b777f",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  sectionTitle: {
    margin: 0,
    fontSize: 22,
  },

  sectionNote: {
    color: "#8d7d81",
    lineHeight: 1.5,
  },

  fixedGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  fixedCard: {
    display: "grid",
    gridTemplateColumns:
      "32px minmax(0,1fr) auto",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 18,
    background: "#fffafb",
  },

  lockIcon: {
    display: "grid",
    placeItems: "center",
    width: 38,
    height: 38,
    borderRadius: 12,
    background:
      "rgba(140,41,64,.08)",
  },

  fixedTitle: {
    fontSize: 16,
  },

  fixedDescription: {
    margin: "5px 0 0",
    color: "#75666a",
    fontSize: 13,
    lineHeight: 1.5,
  },

  fixedBadge: {
    padding: "5px 9px",
    borderRadius: 999,
    background: "#efe9eb",
    color: "#755b62",
    fontSize: 11,
    fontWeight: 800,
  },
  workspace: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(340px, 430px)",
    gap: 24,
    alignItems: "start",
  },
};





















