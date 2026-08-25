"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminOrder = {
  "訂單時間": string;
  "訂單編號": string;
  "姓名": string;
  "LINE ID": string;
  "電話": string;
  "取貨方式": string;
  "商品內容": string;
  "備註": string;
  "狀態": string;
};

type Props = {
  orders: AdminOrder[];
  loadError?: string;
};

const STATUS_OPTIONS = [
  "全部",
  "待確認",
  "處理中",
  "已完成",
  "已取消",
] as const;

function formatOrderTime(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  // 訂單時間依日期字串解析後，以台灣時間顯示。
  // 手動組字串，避免 Server / Browser 的 Intl 格式差異造成 hydration error。
  const taipeiTime = new Date(
    date.getTime() + 8 * 60 * 60 * 1000
  );

  const pad = (number: number) =>
    String(number).padStart(2, "0");

  return [
    taipeiTime.getUTCFullYear(),
    pad(taipeiTime.getUTCMonth() + 1),
    pad(taipeiTime.getUTCDate()),
  ].join("/") +
    " " +
    [
      pad(taipeiTime.getUTCHours()),
      pad(taipeiTime.getUTCMinutes()),
      pad(taipeiTime.getUTCSeconds()),
    ].join(":");
}

function statusTone(status: string) {
  switch (status) {
    case "已完成":
      return {
        background: "#edf8f0",
        color: "#297343",
        borderColor: "#cce8d4",
      };
    case "已取消":
      return {
        background: "#fff1f1",
        color: "#9a3232",
        borderColor: "#f0caca",
      };
    case "處理中":
      return {
        background: "#fff8e8",
        color: "#8a6113",
        borderColor: "#ead8a6",
      };
    default:
      return {
        background: "#f8eef1",
        color: "#8c2940",
        borderColor: "#ead2d8",
      };
  }
}

export default function OrdersClient({
  orders,
  loadError = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]>("全部");
  const [selectedOrderNumber, setSelectedOrderNumber] =
    useState<string | null>(orders[0]?.["訂單編號"] ?? null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] =
    useState(true);
  const [lastRefreshAt, setLastRefreshAt] =
    useState<Date | null>(null);


  async function handleStatusUpdate(
    order: AdminOrder,
    newStatus: string
  ) {
    try {
      const response = await fetch(
        "/api/admin/orders/status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber:
              order["訂單編號"],
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!result.ok) {
        alert(
          result.message ||
          "更新失敗"
        );
        return;
      }

      router.refresh();

    } catch (error) {
      alert("更新狀態失敗");
    }
  }
  useEffect(() => {
    setLastRefreshAt(new Date());
  }, []);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchStatus =
        status === "全部" || order["狀態"] === status;

      if (!matchStatus) return false;
      if (!normalized) return true;

      const haystack = [
        order["訂單編號"],
        order["姓名"],
        order["LINE ID"],
        order["電話"],
        order["商品內容"],
        order["備註"],
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [orders, query, status]);

  const selected =
    filteredOrders.find(
      (order) =>
        order["訂單編號"] === selectedOrderNumber
    ) ??
    filteredOrders[0] ??
    null;


  useEffect(() => {
    if (!autoRefreshEnabled) {
      return;
    }

    const timer = window.setInterval(() => {
      setLastRefreshAt(new Date());
      router.refresh();
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoRefreshEnabled, router]);

  function manualRefresh() {
    setLastRefreshAt(new Date());
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>ORDER MANAGER</p>
          <h1 style={styles.title}>訂單管理</h1>
          <p style={styles.subtitle}>
            商城訂單管理 · 即時更新訂單狀態
          </p>
        </div>

        <div style={styles.summary}>
          <strong>{orders.length}</strong>
          <span>筆訂單</span>
        </div>
      </section>

      {loadError ? (
        <div style={styles.errorBox}>
          訂單讀取失敗：{loadError}
        </div>
      ) : null}

      <section style={styles.toolbar}>
        <label style={styles.searchWrap}>
          <span>搜尋</span>
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="訂單編號、姓名、電話、商品…"
            style={styles.input}
          />
        </label>

        <label style={styles.filterWrap}>
          <span>狀態</span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  (typeof STATUS_OPTIONS)[number]
              )
            }
            style={styles.select}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div style={styles.refreshControls}>
          <button
            type="button"
            onClick={manualRefresh}
            style={styles.refreshButton}
          >
            立即重新整理
          </button>

          <label style={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(event) =>
                setAutoRefreshEnabled(
                  event.target.checked
                )
              }
            />
            <span>每 30 秒自動更新</span>
          </label>

          <small style={styles.lastRefreshText}>
            最近更新：
            {lastRefreshAt
              ? lastRefreshAt.toLocaleTimeString(
                  "zh-TW",
                  {
                    hour12: false,
                  }
                )
              : "—"}
          </small>
        </div>

        <div style={styles.resultCount}>
          顯示 {filteredOrders.length} 筆
        </div>
      </section>

      <section style={styles.workspace}>
        <div style={styles.listPanel}>
          {filteredOrders.length === 0 ? (
            <div style={styles.emptyState}>
              沒有符合條件的訂單。
            </div>
          ) : (
            filteredOrders.map((order) => {
              const active =
                selected?.["訂單編號"] ===
                order["訂單編號"];

              return (
                <button
                  type="button"
                  key={order["訂單編號"]}
                  onClick={() =>
                    setSelectedOrderNumber(
                      order["訂單編號"]
                    )
                  }
                  style={{
                    ...styles.orderCard,
                    ...(active
                      ? styles.orderCardActive
                      : {}),
                  }}
                >
                  <div style={styles.orderCardTop}>
                    <strong>
                      {order["訂單編號"] || "未命名訂單"}
                    </strong>

                    <span
                      style={{
                        ...styles.statusBadge,
                        ...statusTone(order["狀態"]),
                      }}
                    >
                      {order["狀態"] || "待確認"}
                    </span>
                  </div>

                  <div style={styles.customerLine}>
                    <b>{order["姓名"] || "未填姓名"}</b>
                    <span>{order["電話"] || "未填電話"}</span>
                  </div>

                  <p style={styles.orderTime}>
                    {formatOrderTime(order["訂單時間"])}
                  </p>

                  <p style={styles.productPreview}>
                    {order["商品內容"] || "沒有商品內容"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <aside style={styles.detailPanel}>
          {selected ? (
            <>
              <div style={styles.detailHeader}>
                <div>
                  <span style={styles.detailLabel}>
                    ORDER DETAIL
                  </span>
                  <h2 style={styles.detailTitle}>
                    {selected["訂單編號"]}
                  </h2>
                </div>

                <select
                  value={
                    selected["狀態"] || "待確認"
                  }
                  onChange={(event) =>
                    void handleStatusUpdate(
                      selected,
                      event.target.value
                    )
                  }
                  aria-label="變更訂單狀態"
                  title="點擊變更訂單狀態"
                  style={{
                    ...styles.statusBadge,
                    ...statusTone(selected["狀態"]),
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  <option value="待確認">
                    待確認
                  </option>
                  <option value="處理中">
                    處理中
                  </option>
                  <option value="已完成">
                    已完成
                  </option>
                  <option value="已取消">
                    已取消
                  </option>
                </select>
              </div>

              <div style={styles.detailGrid}>
                <DetailItem
                  label="下單時間"
                  value={formatOrderTime(
                    selected["訂單時間"]
                  )}
                />
                <DetailItem
                  label="顧客姓名"
                  value={selected["姓名"]}
                />
                <DetailItem
                  label="電話"
                  value={selected["電話"]}
                />
                <DetailItem
                  label="LINE ID"
                  value={selected["LINE ID"]}
                />
                <DetailItem
                  label="取貨方式"
                  value={selected["取貨方式"]}
                />
              </div>

              <section style={styles.detailSection}>
                <h3>商品內容</h3>
                <pre style={styles.pre}>
                  {selected["商品內容"] || "—"}
                </pre>
              </section>

              <section style={styles.detailSection}>
                <h3>配送／備註</h3>
                <p style={styles.note}>
                  {selected["備註"] || "—"}
                </p>
              </section>

              <div style={styles.readOnlyNotice}>
                點擊右上角狀態按鈕，即可直接變更訂單狀態。
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              選擇一筆訂單查看詳細資料。
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.detailItem}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#fbf7f5",
    color: "#33282b",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "flex-end",
    marginBottom: 24,
  },
  eyebrow: {
    margin: 0,
    color: "#8c2940",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: "0.16em",
  },
  title: {
    margin: "6px 0 4px",
    fontSize: 34,
  },
  subtitle: {
    margin: 0,
    color: "#7a6a6e",
  },
  summary: {
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    padding: "12px 18px",
    border: "1px solid #eadfe1",
    borderRadius: 16,
    background: "#fff",
  },
  errorBox: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 12,
    background: "#fff0f0",
    color: "#972f2f",
    border: "1px solid #efcccc",
  },
  toolbar: {
    display: "grid",
    gridTemplateColumns:
      "minmax(260px, 1fr) 180px minmax(260px, auto) auto",
    gap: 12,
    alignItems: "end",
    marginBottom: 18,
  },
  searchWrap: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 800,
  },
  filterWrap: {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 800,
  },
  input: {
    minHeight: 44,
    border: "1px solid #dbcfd2",
    borderRadius: 10,
    padding: "0 12px",
    background: "#fff",
  },
  select: {
    minHeight: 44,
    border: "1px solid #dbcfd2",
    borderRadius: 10,
    padding: "0 12px",
    background: "#fff",
  },
  refreshControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 44,
    flexWrap: "wrap",
  },
  refreshButton: {
    minHeight: 40,
    padding: "0 14px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#8c2940",
    borderRadius: 10,
    background: "#fff",
    color: "#8c2940",
    fontWeight: 800,
    cursor: "pointer",
  },
  autoRefreshToggle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#5f5054",
    whiteSpace: "nowrap",
  },
  lastRefreshText: {
    color: "#8a7a7e",
    fontSize: 11,
    whiteSpace: "nowrap",
  },
  resultCount: {
    minHeight: 44,
    display: "grid",
    placeItems: "center",
    color: "#75666a",
    fontSize: 13,
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "minmax(340px, 0.9fr) minmax(420px, 1.1fr)",
    gap: 18,
    alignItems: "start",
  },
  listPanel: {
    display: "grid",
    gap: 10,
  },
  orderCard: {
    width: "100%",
    textAlign: "left",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eadfe1",
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    cursor: "pointer",
  },
  orderCardActive: {
    borderColor: "#8c2940",
    boxShadow: "0 0 0 2px rgba(140,41,64,.08)",
  },
  orderCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  customerLine: {
    display: "flex",
    gap: 10,
    alignItems: "baseline",
    marginTop: 10,
  },
  orderTime: {
    margin: "6px 0",
    color: "#88777b",
    fontSize: 12,
  },
  productPreview: {
    margin: 0,
    color: "#5f5054",
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: "pre-line",
    overflow: "hidden",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 26,
    padding: "3px 9px",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  detailPanel: {
    position: "sticky",
    top: 88,
    border: "1px solid #eadfe1",
    borderRadius: 20,
    padding: 22,
    background: "#fff",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottom: "1px solid #f0e7e9",
  },
  detailLabel: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.14em",
  },
  detailTitle: {
    margin: "5px 0 0",
    fontSize: 22,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 18,
  },
  detailItem: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    background: "#faf6f4",
  },
  detailSection: {
    marginTop: 18,
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    font: "inherit",
    lineHeight: 1.7,
    margin: 0,
    padding: 14,
    background: "#faf6f4",
    borderRadius: 12,
  },
  note: {
    margin: 0,
    padding: 14,
    lineHeight: 1.7,
    background: "#faf6f4",
    borderRadius: 12,
  },
  readOnlyNotice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    background: "#f8eef1",
    color: "#7d2638",
    fontSize: 12,
    lineHeight: 1.6,
  },
  emptyState: {
    padding: 24,
    border: "1px dashed #d9cdd0",
    borderRadius: 16,
    background: "#fff",
    color: "#7c6b70",
    textAlign: "center",
  },
};
