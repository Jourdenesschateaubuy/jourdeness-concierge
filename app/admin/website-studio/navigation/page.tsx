import Link from "next/link";

import NavigationEditor from "./NavigationEditor";

import {
  getNavigationStatus,
} from "../../../../lib/cms/modules/navigation/repository";

import {
  publishNavigationAction,
  rollbackNavigationAction,
  saveNavigationDraftAction,
} from "./actions";

export const dynamic = "force-dynamic";

function formatDate(
  value: string | null
) {
  if (!value) return "尚未發布";

  return new Intl.DateTimeFormat(
    "zh-TW",
    {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Taipei",
    }
  ).format(new Date(value));
}

export default async function NavigationBuilderPage() {
  const status =
    await getNavigationStatus();

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
            GLOBAL MODULE
          </span>

          <h1 style={styles.title}>
            Navigation Builder
          </h1>

          <p style={styles.subtitle}>
            管理手機網站導覽列。修改先進 Draft；
            正式網站只讀 Published Version。
          </p>
        </div>

        <form
          action={
            publishNavigationAction
          }
        >
          <button
            type="submit"
            style={styles.publishButton}
          >
            發布 Navigation
          </button>
        </form>
      </header>

      <section style={styles.statusBar}>
        <strong>
          正式版本：
          {status.publishedVersionNumber
            ? ` Version ${status.publishedVersionNumber}`
            : " 尚未發布"}
        </strong>

        <span>
          {formatDate(
            status.publishedAt
          )}
        </span>
      </section>

      <section style={styles.history}>
        <h2>版本紀錄</h2>

        <div style={styles.historyList}>
          {status.history.length === 0 ? (
            <div style={styles.empty}>
              尚無版本紀錄
            </div>
          ) : (
            status.history.map(
              (version) => (
                <article
                  key={version.id}
                  style={styles.versionRow}
                >
                  <div>
                    <strong>
                      Version{" "}
                      {
                        version.versionNumber
                      }
                    </strong>

                    <span>
                      {" "}
                      {version.action ===
                      "rollback"
                        ? `Rollback（來源 Version ${version.sourceVersionNumber}）`
                        : "發布"}
                    </span>
                  </div>

                  <form
                    action={
                      rollbackNavigationAction
                    }
                  >
                    <input
                      type="hidden"
                      name="versionNumber"
                      value={
                        version.versionNumber
                      }
                    />

                    <button
                      type="submit"
                      style={styles.rollbackButton}
                    >
                      回復此版本
                    </button>
                  </form>
                </article>
              )
            )
          )}
        </div>
      </section>

      <NavigationEditor
        initialItems={
          status.draft.items
        }
        saveAction={
          saveNavigationDraftAction
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
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "flex-start",
    marginBottom: 18,
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
    maxWidth: 760,
    color: "#75666a",
    lineHeight: 1.7,
  },

  publishButton: {
    border: 0,
    borderRadius: 999,
    padding: "11px 16px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  statusBar: {
    display: "flex",
    gap: 12,
    marginBottom: 18,
    padding: "13px 16px",
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fffafb",
  },

  history: {
    marginBottom: 18,
    padding: 18,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 20,
    background: "#fffafb",
  },

  historyList: {
    display: "grid",
    gap: 8,
    maxHeight: 240,
    overflowY: "auto",
  },

  versionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    padding: "11px 12px",
    border:
      "1px solid rgba(140,41,64,.08)",
    borderRadius: 12,
    background: "#fff",
  },

  rollbackButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  empty: {
    padding: 20,
    color: "#837478",
  },
};
