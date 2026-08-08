"use client";

import {
  publishHomepageAction,
  rollbackHomepageAction,
} from "./actions";

function formatTaipeiDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  // Taiwan is UTC+8 and does not use daylight saving time.
  // Build the string manually so SSR and browser hydration render
  // exactly the same characters.
  const taipei = new Date(
    date.getTime() + 8 * 60 * 60 * 1000
  );

  const year = taipei.getUTCFullYear();
  const month = String(
    taipei.getUTCMonth() + 1
  ).padStart(2, "0");
  const day = String(
    taipei.getUTCDate()
  ).padStart(2, "0");
  const hour = String(
    taipei.getUTCHours()
  ).padStart(2, "0");
  const minute = String(
    taipei.getUTCMinutes()
  ).padStart(2, "0");
  const second = String(
    taipei.getUTCSeconds()
  ).padStart(2, "0");

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

type HistoryItem = {
  id: number;
  versionNumber: number;
  action: "migration" | "publish" | "rollback";
  sourceVersionNumber?: number;
  createdAt: string;
};

export default function HomepagePublishPanel({
  currentVersionNumber,
  publishedAt,
  history,
}: {
  currentVersionNumber: number | null;
  publishedAt: string | null;
  history: HistoryItem[];
}) {
  return (
    <section style={styles.panel}>
      <div style={styles.header}>
        <div>
          <span style={styles.eyebrow}>
            PUBLISH WORKFLOW
          </span>

          <h2 style={styles.title}>
            草稿 / 發布
          </h2>

          <p style={styles.subtitle}>
            左側編輯的是草稿；正式首頁只讀取已發布版本。
          </p>
        </div>

        <form
          action={publishHomepageAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "確定將目前首頁草稿發布到正式網站？"
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            style={styles.publishButton}
          >
            發布目前草稿
          </button>
        </form>
      </div>

      <div style={styles.current}>
        <span>正式版本</span>
        <strong>
          {currentVersionNumber
            ? `Version ${currentVersionNumber}`
            : "尚未發布"}
        </strong>
        <small>
          {publishedAt
            ? `${formatTaipeiDateTime(publishedAt)}（台灣時間）`
            : "請先執行 migration"}
        </small>
      </div>

      <div style={styles.history}>
        <strong>版本紀錄</strong>

        {history.length === 0 ? (
          <p style={styles.empty}>
            目前沒有版本紀錄。
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              style={styles.historyRow}
            >
              <div>
                <strong>
                  Version {item.versionNumber}
                </strong>

                <span>
                  {item.action === "migration"
                    ? "初始版本"
                    : item.action === "publish"
                      ? "發布"
                      : `Rollback${
                          item.sourceVersionNumber
                            ? `（來源 Version ${item.sourceVersionNumber}）`
                            : ""
                        }`}
                </span>

                <small>
                  {formatTaipeiDateTime(
                    item.createdAt
                  )}
                </small>
              </div>

              {item.versionNumber !==
                currentVersionNumber ? (
                <form
                  action={rollbackHomepageAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `確定將正式首頁回復到 Version ${item.versionNumber}？系統會建立一個新的 Rollback 版本。`
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input
                    type="hidden"
                    name="versionId"
                    value={item.id}
                  />

                  <button
                    type="submit"
                    style={styles.rollbackButton}
                  >
                    回復此版本
                  </button>
                </form>
              ) : (
                <span style={styles.liveBadge}>
                  目前正式版
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: "grid",
    gap: 16,
    marginBottom: 24,
    padding: 20,
    border: "1px solid rgba(140,41,64,.14)",
    borderRadius: 20,
    background: "#fffafb",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
  },

  eyebrow: {
    display: "block",
    marginBottom: 5,
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: ".16em",
  },

  title: {
    margin: 0,
    fontSize: 24,
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#75666a",
  },

  publishButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 16px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  current: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fff",
  },

  history: {
    display: "grid",
    gap: 10,
    maxHeight: 320,
    overflowY: "auto",
    paddingRight: 6,
    scrollbarGutter: "stable",
  },

  historyRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    padding: "12px 14px",
    border: "1px solid rgba(140,41,64,.08)",
    borderRadius: 14,
    background: "#fff",
  },

  rollbackButton: {
    border: "1px solid rgba(140,41,64,.2)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
  },

  liveBadge: {
    borderRadius: 999,
    padding: "6px 10px",
    background: "#edf8f1",
    color: "#26734d",
    fontSize: 12,
    fontWeight: 900,
  },

  empty: {
    margin: 0,
    color: "#75666a",
  },
};
