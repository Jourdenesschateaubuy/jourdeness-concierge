import Link from "next/link";

import MediaLibraryClient from "./MediaLibraryClient";

import {
  listMediaAssets,
} from "../../../../lib/cms/modules/media/repository";

export const dynamic =
  "force-dynamic";

export default async function MediaLibraryPage() {
  const result =
    await listMediaAssets({
      limit: 200,
    });

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <Link
            href="/admin/website-studio"
            style={styles.back}
          >
            ← Website Studio
          </Link>

          <span style={styles.eyebrow}>
            SHARED INFRASTRUCTURE
          </span>

          <h1 style={styles.title}>
            Media Library
          </h1>

          <p style={styles.subtitle}>
            管理網站共用圖片資產。Media 本身不是發布內容，
            因此不走 Draft / Publish / Rollback；
            Banner、Homepage 等 Module 之後只引用 Media Asset。
          </p>
        </div>
      </header>

      <MediaLibraryClient
        initialAssets={
          result.assets
        }
      />
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    width:
      "min(1500px, calc(100% - 48px))",
    margin: "0 auto",
    padding: "38px 0 80px",
    color: "#3d2d31",
  },

  header: {
    marginBottom: 22,
  },

  back: {
    display: "inline-block",
    marginBottom: 12,
    color: "#8c2940",
    textDecoration: "none",
    fontWeight: 800,
  },

  eyebrow: {
    display: "block",
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  title: {
    margin: "5px 0 0",
    fontSize: 38,
  },

  subtitle: {
    maxWidth: 820,
    color: "#75666a",
    lineHeight: 1.7,
  },
};
