"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  CSSProperties,
} from "react";

import {
  useRouter,
} from "next/navigation";

export type OrderStatus =
  | "待確認"
  | "處理中"
  | "已完成"
  | "已取消";

export type AdminOrderItem = {
  itemType:
    | "product"
    | "bundle";

  productId:
    | number
    | null;

  bundleOfferId:
    | number
    | null;

  name: string;

  quantity: number;
  unitPrice: number;

  detail:
    Record<string, unknown>;
};

export type AdminOrder = {
  id: number;

  orderTime: string;
  orderNumber: string;

  customerName: string;

  lineId: string;
  lineUserId: string;
  lineDisplayName: string;

  phone: string;

  deliveryMethod: string;
  address: string;

  note: string;

  totalAmount: number;

  status: OrderStatus;

  items: AdminOrderItem[];
};

type Props = {
  orders: AdminOrder[];
  loadError?: string;
};

type StatusFilter =
  | "全部"
  | OrderStatus;

type BundleSelection = {
  role: string;
  name: string;
  quantity: number;
};

type BundleGift = {
  name: string;
  quantity: number;
  unitLabel: string;
};

const STATUS_OPTIONS:
  OrderStatus[] = [
    "待確認",
    "處理中",
    "已完成",
    "已取消",
  ];

const FILTER_OPTIONS:
  StatusFilter[] = [
    "全部",
    ...STATUS_OPTIONS,
  ];

function asRecord(
  value: unknown
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

function stringValue(
  value: unknown
) {
  return typeof value === "string"
    ? value
    : "";
}

function numberValue(
  value: unknown,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function bundleSelections(
  detail: Record<string, unknown>
): BundleSelection[] {
  if (!Array.isArray(detail.selections)) {
    return [];
  }

  return detail.selections
    .map((raw) => {
      const row = asRecord(raw);

      const name =
        stringValue(row.name).trim();

      const quantity =
        numberValue(row.quantity);

      if (
        !name ||
        quantity <= 0
      ) {
        return null;
      }

      return {
        role:
          stringValue(row.role),

        name,

        quantity,
      };
    })
    .filter(
      (
        item
      ): item is BundleSelection =>
        item !== null
    );
}

function bundleGifts(
  detail: Record<string, unknown>
): BundleGift[] {
  if (!Array.isArray(detail.gifts)) {
    return [];
  }

  return detail.gifts
    .map((raw) => {
      const row = asRecord(raw);

      const name =
        stringValue(row.name).trim();

      const quantity =
        numberValue(row.quantity);

      if (
        !name ||
        quantity <= 0
      ) {
        return null;
      }

      return {
        name,

        quantity,

        unitLabel:
          stringValue(row.unitLabel),
      };
    })
    .filter(
      (
        item
      ): item is BundleGift =>
        item !== null
    );
}

function roleLabel(
  role: string
) {
  switch (role) {
    case "buy":
      return "購買";

    case "free":
      return "活動贈品";

    case "option":
      return "任選";

    case "fixed":
      return "組合內容";

    default:
      return "內容";
  }
}

function formatMoney(
  value: number
) {
  const safe =
    Number.isFinite(value)
      ? Math.round(value)
      : 0;

  return (
    "NT$" +
    safe.toLocaleString(
      "zh-TW"
    )
  );
}

function formatOrderTime(
  value: string
) {
  if (!value) return "";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  // Taiwan does not use daylight saving time.
  // Convert to UTC+8 manually so SSR and browser
  // always render exactly the same text.
  const taipeiDate =
    new Date(
      date.getTime() +
        8 * 60 * 60 * 1000
    );

  const pad =
    (number: number) =>
      String(number).padStart(2, "0");

  const year =
    taipeiDate.getUTCFullYear();

  const month =
    pad(
      taipeiDate.getUTCMonth() + 1
    );

  const day =
    pad(
      taipeiDate.getUTCDate()
    );

  const hour =
    pad(
      taipeiDate.getUTCHours()
    );

  const minute =
    pad(
      taipeiDate.getUTCMinutes()
    );

  const second =
    pad(
      taipeiDate.getUTCSeconds()
    );

  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}
function calculatedTotal(
  order: AdminOrder
) {
  return order.items.reduce(
    (total, item) =>
      total +
      item.unitPrice *
        item.quantity,
    0
  );
}

function orderTotal(
  order: AdminOrder
) {
  return order.totalAmount > 0
    ? order.totalAmount
    : calculatedTotal(order);
}

function statusTone(
  status: OrderStatus
): CSSProperties {
  switch (status) {
    case "已完成":
      return {
        background:
          "#edf8f0",
        color:
          "#297343",
        borderColor:
          "#cce8d4",
      };

    case "已取消":
      return {
        background:
          "#fff1f1",
        color:
          "#9a3232",
        borderColor:
          "#f0caca",
      };

    case "處理中":
      return {
        background:
          "#fff8e8",
        color:
          "#8a6113",
        borderColor:
          "#ead8a6",
      };

    default:
      return {
        background:
          "#f8eef1",
        color:
          "#8c2940",
        borderColor:
          "#ead2d8",
      };
  }
}

export default function OrdersClient({
  orders,
  loadError = "",
}: Props) {
  const router =
    useRouter();

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "全部"
    );

  const [
    selectedOrderNumber,
    setSelectedOrderNumber,
  ] =
    useState<
      string | null
    >(
      orders[0]
        ?.orderNumber ??
        null
    );

  const [
    autoRefreshEnabled,
    setAutoRefreshEnabled,
  ] =
    useState(true);

  const [
    lastRefreshAt,
    setLastRefreshAt,
  ] =
    useState<Date | null>(
      null
    );

  const [
    savingStatus,
    setSavingStatus,
  ] =
    useState(false);

  useEffect(() => {
    setLastRefreshAt(
      new Date()
    );
  }, []);

  useEffect(() => {
    if (
      !autoRefreshEnabled
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setLastRefreshAt(
            new Date()
          );

          router.refresh();
        },
        30000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    autoRefreshEnabled,
    router,
  ]);

  const statusCounts =
    useMemo(() => {
      return {
        全部:
          orders.length,

        待確認:
          orders.filter(
            (order) =>
              order.status ===
              "待確認"
          ).length,

        處理中:
          orders.filter(
            (order) =>
              order.status ===
              "處理中"
          ).length,

        已完成:
          orders.filter(
            (order) =>
              order.status ===
              "已完成"
          ).length,

        已取消:
          orders.filter(
            (order) =>
              order.status ===
              "已取消"
          ).length,
      };
    }, [orders]);

  const filteredOrders =
    useMemo(() => {
      const normalized =
        query
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          if (
            statusFilter !==
              "全部" &&
            order.status !==
              statusFilter
          ) {
            return false;
          }

          if (!normalized) {
            return true;
          }

          const itemText =
            order.items
              .map(
                (item) =>
                  [
                    item.name,
                    JSON.stringify(
                      item.detail
                    ),
                  ].join(" ")
              )
              .join(" ");

          const haystack =
            [
              order.orderNumber,
              order.customerName,
              order.lineId,
              order.lineDisplayName,
              order.lineUserId,
              order.phone,
              order.deliveryMethod,
              order.address,
              order.note,
              itemText,
            ]
              .join(" ")
              .toLowerCase();

          return haystack.includes(
            normalized
          );
        }
      );
    }, [
      orders,
      query,
      statusFilter,
    ]);

  const selected =
    filteredOrders.find(
      (order) =>
        order.orderNumber ===
        selectedOrderNumber
    ) ??
    filteredOrders[0] ??
    null;

  function manualRefresh() {
    setLastRefreshAt(
      new Date()
    );

    router.refresh();
  }

  async function handleStatusUpdate(
    order: AdminOrder,
    newStatus: OrderStatus
  ) {
    if (
      savingStatus ||
      newStatus ===
        order.status
    ) {
      return;
    }

    try {
      setSavingStatus(true);

      const response =
        await fetch(
          "/api/admin/orders/status",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                orderNumber:
                  order.orderNumber,

                status:
                  newStatus,
              }),
          }
        );

      const result =
        await response.json();

      if (!result.ok) {
        alert(
          result.message ||
            "訂單狀態更新失敗。"
        );

        return;
      }

      setLastRefreshAt(
        new Date()
      );

      router.refresh();
    } catch {
      alert(
        "訂單狀態更新失敗。"
      );
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>
            ORDER MANAGER
          </p>

          <h1 style={styles.title}>
            訂單管理
          </h1>

          <p style={styles.subtitle}>
            查看訂單、客戶資料、商品內容與處理狀態
          </p>
        </div>

        <div style={styles.summary}>
          <strong>
            {orders.length}
          </strong>

          <span>
            筆訂單
          </span>
        </div>
      </section>

      {loadError ? (
        <div style={styles.errorBox}>
          訂單讀取失敗：
          {loadError}
        </div>
      ) : null}

      <section style={styles.stats}>
        {FILTER_OPTIONS.map(
          (item) => {
            const active =
              statusFilter ===
              item;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setStatusFilter(
                    item
                  )
                }
                style={{
                  ...styles.statCard,

                  ...(active
                    ? styles.statCardActive
                    : {}),
                }}
              >
                <span>
                  {item}
                </span>

                <strong>
                  {
                    statusCounts[
                      item
                    ]
                  }
                </strong>
              </button>
            );
          }
        )}
      </section>

      <section style={styles.toolbar}>
        <label style={styles.searchWrap}>
          <span>
            搜尋
          </span>

          <input
            value={query}
            onChange={(
              event
            ) =>
              setQuery(
                event.target
                  .value
              )
            }
            placeholder="訂單編號、姓名、電話、LINE、商品"
            style={styles.input}
          />
        </label>

        <div style={styles.refreshControls}>
          <button
            type="button"
            onClick={
              manualRefresh
            }
            style={
              styles.refreshButton
            }
          >
            立即更新
          </button>

          <label style={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={
                autoRefreshEnabled
              }
              onChange={(
                event
              ) =>
                setAutoRefreshEnabled(
                  event.target
                    .checked
                )
              }
            />

            <span>
              每 30 秒自動更新
            </span>
          </label>

          <small style={styles.lastRefreshText}>
            最後更新：
            {lastRefreshAt
              ? lastRefreshAt.toLocaleTimeString(
                  "zh-TW",
                  {
                    hour12:
                      false,
                  }
                )
              : "—"}
          </small>
        </div>

        <div style={styles.resultCount}>
          顯示{" "}
          {
            filteredOrders.length
          }{" "}
          筆
        </div>
      </section>

      <section style={styles.workspace}>
        <div style={styles.listPanel}>
          {filteredOrders.length ===
          0 ? (
            <div style={styles.emptyState}>
              目前沒有符合條件的訂單
            </div>
          ) : (
            filteredOrders.map(
              (order) => {
                const active =
                  selected
                    ?.orderNumber ===
                  order.orderNumber;

                const preview =
                  order.items
                    .slice(0, 2)
                    .map(
                      (item) =>
                        `${item.name} × ${item.quantity}`
                    )
                    .join("、");

                return (
                  <button
                    type="button"
                    key={
                      order.orderNumber
                    }
                    onClick={() =>
                      setSelectedOrderNumber(
                        order.orderNumber
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
                      <strong style={styles.orderNumber}>
                        {order.orderNumber}
                      </strong>

                      <span
                        style={{
                          ...styles.statusBadge,
                          ...statusTone(
                            order.status
                          ),
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={styles.customerLine}>
                      <b>
                        {order.customerName ||
                          "未填姓名"}
                      </b>

                      <span>
                        {order.phone ||
                          order.lineDisplayName ||
                          order.lineId ||
                          "無聯絡資料"}
                      </span>
                    </div>

                    <p style={styles.orderTime}>
                      {formatOrderTime(
                        order.orderTime
                      )}
                    </p>

                    <p style={styles.productPreview}>
                      {preview ||
                        "無商品明細"}
                    </p>

                    {order.items.length >
                    2 ? (
                      <small style={styles.moreItems}>
                        另有{" "}
                        {order.items.length -
                          2}{" "}
                        項
                      </small>
                    ) : null}

                    <div style={styles.cardTotal}>
                      {formatMoney(
                        orderTotal(
                          order
                        )
                      )}
                    </div>
                  </button>
                );
              }
            )
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
                    {selected.orderNumber}
                  </h2>

                  <p style={styles.detailTime}>
                    {formatOrderTime(
                      selected.orderTime
                    )}
                  </p>
                </div>

                <details
                  style={styles.statusMenuWrap}
                >
                  <summary
                    aria-label="變更訂單狀態"
                    aria-disabled={savingStatus}
                    onClick={(event) => {
                      if (savingStatus) {
                        event.preventDefault();
                      }
                    }}
                    style={{
                      ...styles.statusMenuSummary,
                      ...statusTone(
                        selected.status
                      ),
                      ...(savingStatus
                        ? styles.statusMenuSummaryDisabled
                        : {}),
                    }}
                  >
                    <span>
                      {selected.status}
                    </span>

                    <span
                      aria-hidden="true"
                      style={styles.statusMenuChevron}
                    >
                      ▾
                    </span>
                  </summary>

                  <div
                    style={styles.statusMenu}
                    role="menu"
                    aria-label="訂單狀態"
                  >
                    {STATUS_OPTIONS.map(
                      (item) => {
                        const active =
                          item === selected.status;

                        return (
                          <button
                            key={item}
                            type="button"
                            role="menuitem"
                            disabled={
                              savingStatus ||
                              active
                            }
                            onClick={(event) => {
                              event.currentTarget
                                .closest("details")
                                ?.removeAttribute("open");

                              void handleStatusUpdate(
                                selected,
                                item
                              );
                            }}
                            style={{
                              ...styles.statusMenuOption,
                              ...statusTone(item),
                              ...(active
                                ? styles.statusMenuOptionActive
                                : {}),
                            }}
                          >
                            <span>
                              {active ? "✓" : ""}
                            </span>

                            <strong>
                              {item}
                            </strong>
                          </button>
                        );
                      }
                    )}
                  </div>
                </details>
              </div>

              <section style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>
                  客戶資料
                </h3>

                <div style={styles.detailGrid}>
                  <DetailItem
                    label="姓名"
                    value={
                      selected.customerName
                    }
                  />

                  <DetailItem
                    label="電話"
                    value={
                      selected.phone
                    }
                  />

                  <DetailItem
                    label="LINE ID"
                    value={
                      selected.lineId
                    }
                  />

                  <DetailItem
                    label="LINE 顯示名稱"
                    value={
                      selected.lineDisplayName
                    }
                  />

                  <DetailItem
                    label="LINE User ID"
                    value={
                      selected.lineUserId
                    }
                  />

                  <DetailItem
                    label="配送方式"
                    value={
                      selected.deliveryMethod
                    }
                  />
                </div>
              </section>

              <section style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>
                  配送地址
                </h3>

                <div style={styles.addressBox}>
                  {selected.address ||
                    "未填寫"}
                </div>
              </section>

              <section style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>
                  商品明細
                </h3>

                <div style={styles.itemList}>
                  {selected.items.map(
                    (
                      item,
                      index
                    ) => (
                      <OrderItemCard
                        key={
                          `${selected.orderNumber}-${index}`
                        }
                        item={item}
                      />
                    )
                  )}
                </div>
              </section>

              <section style={styles.totalBox}>
                <span>
                  訂單總額
                </span>

                <strong>
                  {formatMoney(
                    orderTotal(
                      selected
                    )
                  )}
                </strong>
              </section>

              <section style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>
                  客戶備註
                </h3>

                <div style={styles.noteBox}>
                  {selected.note ||
                    "無備註"}
                </div>
              </section>

              <div style={styles.readOnlyNotice}>
                訂單內容採歷史快照保存。後台目前僅允許變更訂單狀態，避免誤改客戶原始訂購內容。
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              請從左側選擇一筆訂單
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
      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

function OrderItemCard({
  item,
}: {
  item: AdminOrderItem;
}) {
  const detail =
    item.detail ?? {};

  const selections =
    bundleSelections(
      detail
    );

  const gifts =
    bundleGifts(
      detail
    );

  const planLabel =
    stringValue(
      detail.bundlePlanLabel
    );

  const planId =
    numberValue(
      detail.bundlePlanId
    );

  const subtotal =
    item.unitPrice *
    item.quantity;

  return (
    <article style={styles.itemCard}>
      <div style={styles.itemHeader}>
        <div>
          <small style={styles.itemType}>
            {item.itemType ===
            "bundle"
              ? "組合優惠"
              : "一般商品"}
          </small>

          <h4 style={styles.itemName}>
            {item.name}
          </h4>
        </div>

        <strong style={styles.itemSubtotal}>
          {formatMoney(
            subtotal
          )}
        </strong>
      </div>

      <div style={styles.priceLine}>
        {item.quantity} ×{" "}
        {formatMoney(
          item.unitPrice
        )}
      </div>

      {item.itemType ===
      "bundle" ? (
        <>
          <div style={styles.bundleMeta}>
            <b>
              方案：
            </b>

            <span>
              {planLabel ||
                (planId > 0
                  ? `方案 #${planId}`
                  : "—")}
            </span>
          </div>

          {selections.length >
          0 ? (
            <div style={styles.bundleBlock}>
              <b>
                組合內容
              </b>

              {selections.map(
                (
                  selection,
                  index
                ) => (
                  <div
                    key={
                      `${selection.role}-${selection.name}-${index}`
                    }
                    style={styles.bundleLine}
                  >
                    <span>
                      {roleLabel(
                        selection.role
                      )}
                    </span>

                    <strong>
                      {
                        selection.name
                      }
                    </strong>

                    <em>
                      ×{" "}
                      {
                        selection.quantity
                      }
                    </em>
                  </div>
                )
              )}
            </div>
          ) : null}

          {gifts.length >
          0 ? (
            <div style={styles.giftBlock}>
              <b>
                額外贈品
              </b>

              {gifts.map(
                (
                  gift,
                  index
                ) => (
                  <div
                    key={
                      `${gift.name}-${index}`
                    }
                    style={styles.bundleLine}
                  >
                    <span>
                      贈
                    </span>

                    <strong>
                      {gift.name}
                    </strong>

                    <em>
                      ×{" "}
                      {gift.quantity}
                      {gift.unitLabel}
                    </em>
                  </div>
                )
              )}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

const styles:
  Record<
    string,
    CSSProperties
  > = {
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
    marginBottom: 22,
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
    gap: 7,
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

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(110px, 1fr))",
    gap: 10,
    marginBottom: 16,
  },

  statCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
    padding: "0 15px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#eadfe1",
    borderRadius: 14,
    background: "#fff",
    color: "#5f5054",
    cursor: "pointer",
  },

  statCardActive: {
    borderColor: "#8c2940",
    color: "#8c2940",
    boxShadow:
      "0 0 0 2px rgba(140,41,64,.06)",
  },

  toolbar: {
    display: "grid",
    gridTemplateColumns:
      "minmax(280px, 1fr) minmax(360px, auto) auto",
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

  input: {
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
    border: "1px solid #8c2940",
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
    gridTemplateColumns:
      "minmax(330px, .85fr) minmax(500px, 1.15fr)",
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
    boxShadow:
      "0 0 0 2px rgba(140,41,64,.08)",
  },

  orderCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },

  orderNumber: {
    fontSize: 13,
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
  },

  moreItems: {
    display: "block",
    marginTop: 4,
    color: "#8a7a7e",
  },

  cardTotal: {
    marginTop: 12,
    paddingTop: 10,
    borderTop:
      "1px solid #f0e7e9",
    color: "#8c2940",
    fontWeight: 900,
    textAlign: "right",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 26,
    padding: "3px 9px",
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
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
    borderBottom:
      "1px solid #f0e7e9",
  },

  detailLabel: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  detailTitle: {
    margin: "5px 0 3px",
    fontSize: 21,
  },

  detailTime: {
    margin: 0,
    color: "#88777b",
    fontSize: 12,
  },

  statusMenuWrap: {
    position: "relative",
    flexShrink: 0,
  },

  statusMenuSummary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
    minHeight: 36,
    minWidth: 112,
    padding: "4px 11px 4px 13px",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
    listStyle: "none",
    userSelect: "none",
  },

  statusMenuSummaryDisabled: {
    opacity: 0.55,
    cursor: "wait",
  },

  statusMenuChevron: {
    fontSize: 11,
    lineHeight: 1,
    opacity: 0.7,
  },

  statusMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    zIndex: 30,
    display: "grid",
    gap: 6,
    minWidth: 150,
    padding: 8,
    border: "1px solid #eadfe1",
    borderRadius: 14,
    background: "#fff",
    boxShadow:
      "0 14px 34px rgba(77,48,57,.14)",
  },

  statusMenuOption: {
    display: "grid",
    gridTemplateColumns: "16px 1fr",
    gap: 7,
    alignItems: "center",
    width: "100%",
    minHeight: 38,
    padding: "7px 10px",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 10,
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
  },

  statusMenuOptionActive: {
    cursor: "default",
    boxShadow:
      "inset 0 0 0 1px rgba(0,0,0,.03)",
  },

  detailSection: {
    marginTop: 20,
  },

  sectionTitle: {
    margin: "0 0 10px",
    fontSize: 15,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },

  detailItem: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    background: "#faf6f4",
    overflow: "hidden",
  },

  addressBox: {
    padding: 14,
    borderRadius: 12,
    background: "#faf6f4",
    lineHeight: 1.7,
  },

  itemList: {
    display: "grid",
    gap: 10,
  },

  itemCard: {
    border: "1px solid #eee2e4",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  },

  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  itemType: {
    color: "#8c2940",
    fontWeight: 800,
  },

  itemName: {
    margin: "4px 0 0",
    fontSize: 15,
  },

  itemSubtotal: {
    color: "#8c2940",
    whiteSpace: "nowrap",
  },

  priceLine: {
    marginTop: 7,
    color: "#78686c",
    fontSize: 12,
  },

  bundleMeta: {
    display: "flex",
    gap: 5,
    marginTop: 12,
    padding: "9px 10px",
    borderRadius: 9,
    background: "#faf6f4",
    fontSize: 12,
  },

  bundleBlock: {
    display: "grid",
    gap: 6,
    marginTop: 10,
    padding: 11,
    borderRadius: 10,
    background: "#f8f4f2",
  },

  giftBlock: {
    display: "grid",
    gap: 6,
    marginTop: 8,
    padding: 11,
    borderRadius: 10,
    background: "#fff8e8",
  },

  bundleLine: {
    display: "grid",
    gridTemplateColumns:
      "70px minmax(0,1fr) auto",
    gap: 8,
    alignItems: "center",
    fontSize: 12,
  },

  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 20,
    padding: "16px 18px",
    borderRadius: 14,
    background: "#8c2940",
    color: "#fff",
  },

  noteBox: {
    padding: 14,
    borderRadius: 12,
    background: "#faf6f4",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
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
    border:
      "1px dashed #d9cdd0",
    borderRadius: 16,
    background: "#fff",
    color: "#7c6b70",
    textAlign: "center",
  },
};