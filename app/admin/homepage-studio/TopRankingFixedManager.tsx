"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";

import type {
  SiteStudioRankingItem,
} from "../../../lib/site-studio-types";

type ProductOption = {
  id: number;
  displayCode?: string;
  name: string;
  cardName?: string;
  status?: string;
};

type BundleOfferOption = {
  id: number;
  name: string;
  status?: string;
};

type Props = {
  initialRankings: SiteStudioRankingItem[];
  products: ProductOption[];
  bundleOffers: BundleOfferOption[];
};

function bundleStatusLabel(
  status?: string
) {
  if (status === "active") return "上架中";
  if (status === "inactive") return "下架";
  if (status === "coming_soon") return "新品預告";
  if (status === "sold_out") return "售罄";
  return status || "未設定";
}

function normalizeRanking(
  item: SiteStudioRankingItem
): SiteStudioRankingItem {
  return {
    ...item,
    targetType:
      item.targetType === "bundle_offer"
        ? "bundle_offer"
        : "product",
    targetId:
      typeof item.targetId === "number" &&
      Number.isInteger(item.targetId) &&
      item.targetId > 0
        ? item.targetId
        : item.actionProductId,
  };
}

export default function TopRankingFixedManager({
  initialRankings,
  products,
  bundleOffers,
}: Props) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [drafts, setDrafts] =
    useState<SiteStudioRankingItem[]>(
      initialRankings
        .map(normalizeRanking)
        .sort(
          (a, b) =>
            a.rank - b.rank
        )
    );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const sortedProducts =
    useMemo(
      () =>
        products
          .slice()
          .sort((a, b) =>
            (a.cardName ||
              a.name).localeCompare(
              b.cardName ||
                b.name,
              "zh-TW"
            )
          ),
      [products]
    );

  const sortedBundles =
    useMemo(
      () =>
        bundleOffers
          .slice()
          .sort((a, b) =>
            a.name.localeCompare(
              b.name,
              "zh-TW"
            )
          ),
      [bundleOffers]
    );

  function changeType(
    rank: number,
    nextType:
      | "product"
      | "bundle_offer"
  ) {
    setDrafts((current) =>
      current.map((item) => {
        if (item.rank !== rank) {
          return item;
        }

        if (
          nextType ===
          "bundle_offer"
        ) {
          return {
            ...item,
            targetType:
              "bundle_offer",
            targetId:
              sortedBundles[0]?.id ??
              item.targetId ??
              item.actionProductId,
          };
        }

        const nextId =
          sortedProducts[0]?.id ??
          item.actionProductId;

        return {
          ...item,
          targetType: "product",
          targetId: nextId,
          actionProductId:
            nextId,
          displayProductId:
            nextId,
        };
      })
    );

    setMessage("");
    setError("");
  }

  function changeTarget(
    rank: number,
    targetId: number
  ) {
    setDrafts((current) =>
      current.map((item) => {
        if (item.rank !== rank) {
          return item;
        }

        if (
          item.targetType ===
          "bundle_offer"
        ) {
          return {
            ...item,
            targetType:
              "bundle_offer",
            targetId,
          };
        }

        return {
          ...item,
          targetType:
            "product",
          targetId,
          actionProductId:
            targetId,
          displayProductId:
            targetId,
        };
      })
    );

    setMessage("");
    setError("");
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      for (const ranking of drafts) {
        const response =
          await fetch(
            "/api/admin/site-studio",
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  kind: "ranking",
                  ranking,
                }),
            }
          );

        const payload =
          await response
            .json()
            .catch(() => null);

        if (
          !response.ok ||
          !payload?.config
        ) {
          throw new Error(
            payload?.error ||
              `TOP ${ranking.rank} 儲存失敗`
          );
        }
      }

      setMessage(
        "TOP 1–6 商品連結已儲存到首頁草稿。"
      );

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "排行榜儲存失敗"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <article
        style={
          styles.fixedCard
        }
      >
        <span
          style={styles.lockIcon}
        >
          🔒
        </span>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <strong
            style={
              styles.fixedTitle
            }
          >
            TOP 熱銷排行
          </strong>

          <p
            style={
              styles.fixedDescription
            }
          >
            TOP 1–6｜位置與版型固定
          </p>
        </div>

        <button
          type="button"
          style={styles.manageButton}
          onClick={() =>
            setOpen(
              (current) =>
                !current
            )
          }
        >
          {open
            ? "收起"
            : "管理排行"}
        </button>
      </article>

      {open ? (
        <section
          style={styles.panel}
        >
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <span
                style={
                  styles.eyebrow
                }
              >
                TOP RANKING
              </span>

              <h3
                style={
                  styles.panelTitle
                }
              >
                TOP 熱銷排行商品設定
              </h3>

              <p
                style={
                  styles.panelNote
                }
              >
                只修改每張 TOP
                卡片連結到的一般商品或組合優惠。
                圖片、標題、價格與版型維持原設定。
              </p>
            </div>
          </div>

          <div
            style={styles.rows}
          >
            {drafts.map(
              (item) => {
                const targetType =
                  item.targetType ===
                  "bundle_offer"
                    ? "bundle_offer"
                    : "product";

                const targetId =
                  item.targetId ??
                  item.actionProductId;

                const productExists =
                  sortedProducts.some(
                    (product) =>
                      product.id ===
                      targetId
                  );

                const bundleExists =
                  sortedBundles.some(
                    (offer) =>
                      offer.id ===
                      targetId
                  );

                return (
                  <div
                    key={
                      item.rank
                    }
                    style={
                      styles.row
                    }
                  >
                    <div
                      style={
                        styles.rank
                      }
                    >
                      TOP{" "}
                      {item.rank}
                    </div>

                    <label
                      style={
                        styles.field
                      }
                    >
                      <span
                        style={
                          styles.label
                        }
                      >
                        類型
                      </span>

                      <select
                        style={
                          styles.select
                        }
                        value={
                          targetType
                        }
                        onChange={(
                          event
                        ) =>
                          changeType(
                            item.rank,
                            event
                              .target
                              .value ===
                              "bundle_offer"
                              ? "bundle_offer"
                              : "product"
                          )
                        }
                      >
                        <option
                          value="product"
                        >
                          一般商品
                        </option>

                        <option
                          value="bundle_offer"
                        >
                          組合優惠
                        </option>
                      </select>
                    </label>

                    <label
                      style={{
                        ...styles.field,
                        flex: 1,
                      }}
                    >
                      <span
                        style={
                          styles.label
                        }
                      >
                        指定內容
                      </span>

                      <select
                        style={
                          styles.select
                        }
                        value={
                          targetId
                        }
                        onChange={(
                          event
                        ) =>
                          changeTarget(
                            item.rank,
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                      >
                        {targetType ===
                        "product" ? (
                          <>
                            {!productExists ? (
                              <option
                                value={
                                  targetId
                                }
                              >
                                #
                                {targetId}（目前指定）
                              </option>
                            ) : null}

                            {sortedProducts.map(
                              (
                                product
                              ) => (
                                <option
                                  key={
                                    product.id
                                  }
                                  value={
                                    product.id
                                  }
                                >
                                  {product.displayCode
                                    ? `${product.displayCode} ｜ `
                                    : ""}
                                  {product.cardName ||
                                    product.name}
                                </option>
                              )
                            )}
                          </>
                        ) : (
                          <>
                            {!bundleExists ? (
                              <option
                                value={
                                  targetId
                                }
                              >
                                組合優惠 #
                                {targetId}（目前指定）
                              </option>
                            ) : null}

                            {sortedBundles.map(
                              (
                                offer
                              ) => (
                                <option
                                  key={
                                    offer.id
                                  }
                                  value={
                                    offer.id
                                  }
                                >
                                  {offer.name}
                                  {" ｜ "}
                                  {bundleStatusLabel(
                                    offer.status
                                  )}
                                </option>
                              )
                            )}
                          </>
                        )}
                      </select>
                    </label>
                  </div>
                );
              }
            )}
          </div>

          <div
            style={
              styles.footer
            }
          >
            <div>
              {error ? (
                <span
                  style={
                    styles.error
                  }
                >
                  {error}
                </span>
              ) : null}

              {message ? (
                <span
                  style={
                    styles.success
                  }
                >
                  {message}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              style={
                styles.saveButton
              }
              disabled={saving}
              onClick={() =>
                void saveAll()
              }
            >
              {saving
                ? "儲存中..."
                : "儲存排行榜"}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}

const styles: Record<
  string,
  CSSProperties
> = {
  fixedCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 68,
    padding: "14px 16px",
    border:
      "1px solid #efd7dc",
    borderRadius: 18,
    background: "#fffafb",
  },

  lockIcon: {
    display: "grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "#f8edef",
    flexShrink: 0,
  },

  fixedTitle: {
    display: "block",
    fontSize: 16,
    color: "#3d2d31",
  },

  fixedDescription: {
    margin: "3px 0 0",
    color: "#8d747a",
    fontSize: 12,
  },

  manageButton: {
    border:
      "1px solid #e8cbd2",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#fff",
    color: "#8c2940",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  panel: {
    gridColumn: "1 / -1",
    padding: 20,
    border:
      "1px solid #efd7dc",
    borderRadius: 20,
    background: "#fff",
  },

  panelHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 16,
    marginBottom: 16,
  },

  eyebrow: {
    color: "#8c2940",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".14em",
  },

  panelTitle: {
    margin: "5px 0 0",
    color: "#3d2d31",
    fontSize: 20,
  },

  panelNote: {
    margin: "7px 0 0",
    color: "#826f74",
    fontSize: 13,
  },

  rows: {
    display: "grid",
    gap: 10,
  },

  row: {
    display: "flex",
    alignItems: "end",
    gap: 12,
    padding: 12,
    border:
      "1px solid #f0e0e4",
    borderRadius: 14,
    background: "#fffafb",
  },

  rank: {
    minWidth: 66,
    padding: "10px 8px",
    borderRadius: 10,
    background: "#8c2940",
    color: "#fff",
    textAlign: "center",
    fontWeight: 900,
  },

  field: {
    display: "grid",
    gap: 5,
    minWidth: 150,
  },

  label: {
    color: "#7c686d",
    fontSize: 12,
    fontWeight: 700,
  },

  select: {
    width: "100%",
    minHeight: 40,
    padding: "0 10px",
    border:
      "1px solid #decbd0",
    borderRadius: 10,
    background: "#fff",
    color: "#3d2d31",
  },

  footer: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
  },

  saveButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 18px",
    background: "#8c2940",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  success: {
    color: "#26734d",
    fontWeight: 700,
  },

  error: {
    color: "#b02a37",
    fontWeight: 700,
  },
};
