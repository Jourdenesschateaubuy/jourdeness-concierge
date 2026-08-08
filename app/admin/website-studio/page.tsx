import Link from "next/link";

export const dynamic = "force-dynamic";

const modules = [
  {
    title: "Homepage Builder",
    description:
      "首頁區塊、商品編排、Draft、Preview、Publish 與 Rollback。",
    href: "/admin/homepage-studio",
    status: "available",
  },
  {
    title: "Website Settings",
    description:
      "品牌、聯絡、社群與全站基本資料。",
    href: "/admin/website-studio/settings",
    status: "available",
  },
  {
    title: "Navigation Builder",
    description:
      "手機導覽列、選單順序、顯示狀態與連結。",
    href: "/admin/website-studio/navigation",
    status: "available",
  },
  {
    title: "Banner Builder",
    description:
      "首頁 Banner、圖片、文字、連結與顯示狀態。",
    href: "/admin/website-studio/banner",
    status: "available",
  },
  {
    title: "Media Library",
    description:
      "集中管理網站圖片資產、Alt、標籤與共用選圖。",
    href: "/admin/website-studio/media",
    status: "available",
  },
  {
    title: "Footer Builder",
    description:
      "客服、社群、公司資訊與 Footer 連結。",
    href: "#",
    status: "planned",
  },
  {
    title: "Publish Center",
    description:
      "未來集中管理各 Module 的 Draft、Publish、History 與 Rollback。",
    href: "#",
    status: "planned",
  },
];

export default function WebsiteStudioPage() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <span style={styles.eyebrow}>
          JOURDENESS WEBSITE STUDIO
        </span>

        <h1 style={styles.title}>
          Website Studio
        </h1>

        <p style={styles.subtitle}>
          Website Studio 是 CMS 的總入口。
          Homepage Builder 已完成，後續功能將以獨立 Module
          接入共用 CMS Core，而不是繼續塞進 Homepage。
        </p>
      </header>

      <section style={styles.architecture}>
        <strong>CMS Core v1</strong>
        <span>
          Publication Types ・ Snapshot Helpers ・ Module Boundary
        </span>
      </section>

      <section style={styles.grid}>
        {modules.map((module) => {
          const available =
            module.status === "available";

          const card = (
            <article
              style={{
                ...styles.card,
                ...(available
                  ? styles.availableCard
                  : {}),
              }}
            >
              <div style={styles.cardTop}>
                <strong>{module.title}</strong>

                <span
                  style={
                    available
                      ? styles.liveBadge
                      : styles.plannedBadge
                  }
                >
                  {available
                    ? "可使用"
                    : "規劃中"}
                </span>
              </div>

              <p>{module.description}</p>

              <span style={styles.cardAction}>
                {available
                  ? "開啟 Module →"
                  : "Coming Next"}
              </span>
            </article>
          );

          return available ? (
            <Link
              key={module.title}
              href={module.href}
              style={styles.link}
            >
              {card}
            </Link>
          ) : (
            <div key={module.title}>
              {card}
            </div>
          );
        })}
      </section>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width: "min(1280px, calc(100% - 48px))",
    margin: "0 auto",
    padding: "42px 0 80px",
    color: "#3d2d31",
  },

  header: {
    marginBottom: 22,
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".16em",
  },

  title: {
    margin: "8px 0 0",
    fontSize: 42,
  },

  subtitle: {
    maxWidth: 800,
    margin: "12px 0 0",
    color: "#75666a",
    lineHeight: 1.7,
  },

  architecture: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
    padding: "14px 16px",
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 16,
    background: "#fffafb",
    color: "#75666a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  link: {
    color: "inherit",
    textDecoration: "none",
  },

  card: {
    minHeight: 175,
    padding: 20,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 18,
    background: "#fff",
    opacity: 0.7,
  },

  availableCard: {
    border:
      "1px solid rgba(140,41,64,.2)",
    opacity: 1,
    boxShadow:
      "0 12px 30px rgba(70,44,52,.06)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  liveBadge: {
    borderRadius: 999,
    padding: "4px 8px",
    background: "#edf8f1",
    color: "#26734d",
    fontSize: 11,
    fontWeight: 900,
  },

  plannedBadge: {
    borderRadius: 999,
    padding: "4px 8px",
    background: "#f3f0f0",
    color: "#867b7d",
    fontSize: 11,
    fontWeight: 900,
  },

  cardAction: {
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 900,
  },
};
