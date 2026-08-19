"use client";
import styles from "../../admin.module.css";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

type BundleOfferForManager = {
  id: number;
  name: string;
  bundleType: "fixed_bundle" | "mix_match" | "buy_get";
  unitLabel: string;
  allowSameProduct: boolean;
  coverImage?: string;
  status: ProductStatus;
  sortOrder: number;

  items: Array<{
    id: number;
    productId: number;
    role: "fixed" | "option" | "buy" | "free";
    quantity: number;
    sortOrder?: number;

    product: {
      id: number;
      displayCode: string;
      name: string;
      image: string;
      price: string;
      status: ProductStatus;
    };
  }>;

  plans: Array<{
    id: number;
    code: string;
    label: string;
    requiredQuantity?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    priceAmount: number;
    sortOrder?: number;
  }>;
};

type Props = {
  bundleOffers: BundleOfferForManager[];
};

const typeLabel = {
  fixed_bundle: "固定組合",
  mix_match: "任選組合",
  buy_get: "買送活動",
} as const;

const statusLabel: Record<ProductStatus, string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

export default function BundleOfferManager({
  bundleOffers,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("全部");
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const filteredOffers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return bundleOffers.filter((offer) => {
      if (
        status !== "全部" &&
        offer.status !== status
      ) {
        return false;
      }

      if (!keyword) return true;

      const text = [
        offer.id,
        offer.name,
        typeLabel[offer.bundleType],
        statusLabel[offer.status],
        ...offer.items.flatMap((item) => [
          item.product.displayCode,
          item.product.name,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [bundleOffers, query, status]);

  async function handleStatusChange(
    id: number,
    nextStatus: ProductStatus
  ) {
    setUpdatingStatusId(id);

    try {
      const response = await fetch(
        `/api/admin/bundle-offers/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "更新組合優惠狀態失敗。"
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "更新組合優惠狀態失敗。"
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }
  async function handleDelete(
    id: number,
    name: string
  ) {
    const confirmed = window.confirm(
      `確定要刪除「${name}」嗎？\n\n此操作會刪除這筆組合優惠。`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/admin/bundle-offers/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(
          result?.error || "刪除組合優惠失敗。"
        );
      }

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "刪除組合優惠失敗。"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋組合優惠</span>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="優惠名稱、商品編號、商品名稱…"
          />
        </label>

        <label className={styles.selectBox}>
          <span>狀態</span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <option value="全部">全部狀態</option>
            <option value="active">上架中</option>
            <option value="inactive">下架</option>
            <option value="coming_soon">
              新品預告
            </option>
            <option value="sold_out">售罄</option>
          </select>
        </label>

        <Link
          href="/admin/bundle-offers/new"
          className={styles.primaryAction}
        >
          ＋ 新增組合優惠
        </Link>
      </div>

      <div className={styles.resultBar}>
        <strong>{filteredOffers.length}</strong>

        <span>
          {" / "}
          {bundleOffers.length} 筆組合優惠
        </span>

        {(query || status !== "全部") ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatus("全部");
            }}
            style={{
              marginLeft: 12,
              border: "1px solid #ddd0d3",
              borderRadius: 8,
              background: "#fff",
              color: "#765a60",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            清除篩選
          </button>
        ) : null}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.productTable}>
          <thead>
            <tr>
              <th>組合優惠</th>
              <th>類型</th>
              <th>組合內容</th>
              <th>優惠價</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            {filteredOffers.map((offer) => {
              const plan = offer.plans[0];

              return (
                <tr key={offer.id}>
                  <td>
                    <div className={styles.productCell}>
                      <div
                        className={styles.thumb}
                        style={{
                          width: 76,
                          height: 80,
                          overflow: "hidden",
                          display: "grid",
                          placeItems: "center",
                          background: "#faf6f4",
                        }}
                      >
                        {offer.coverImage ? (
                          <img
                            src={offer.coverImage}
                            alt={offer.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              color: "#a18c90",
                              textAlign: "center",
                              lineHeight: 1.4,
                            }}
                          >
                            尚無
                            <br />
                            圖片
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                          display: "grid",
                          gap: 5,
                        }}
                      >
                        <strong
                          style={{
                            color: "#35282a",
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          {offer.name}
                        </strong>

                        <small
                          style={{
                            color: "#a08e91",
                            fontSize: 11,
                          }}
                        >
                          Bundle ID {offer.id}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 28,
                        padding: "4px 9px",
                        borderRadius: 999,
                        background: "#f7eff1",
                        color: "#7d2638",
                        fontWeight: 700,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {typeLabel[offer.bundleType]}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "grid",
                        gap: 6,
                        minWidth: 310,
                        lineHeight: 1.55,
                      }}
                    >
                      {offer.bundleType === "buy_get" ? (
                        <>
                          {offer.items.map((item) => (
                            <div key={item.id}>
                              <span
                                style={{
                                  display: "inline-block",
                                  minWidth: 40,
                                  marginRight: 7,
                                  color:
                                    item.role === "free"
                                      ? "#9a6d20"
                                      : "#7d2638",
                                  fontWeight: 700,
                                  fontSize: 11,
                                }}
                              >
                                {item.role === "buy"
                                  ? "購買"
                                  : item.role === "free"
                                    ? "贈送"
                                    : ""}
                              </span>

                              <span
                                style={{
                                  color: "#98868a",
                                  marginRight: 8,
                                  fontSize: 11,
                                }}
                              >
                                {item.product.displayCode}
                              </span>

                              {item.product.name}

                              <span
                                style={{
                                  marginLeft: 6,
                                  color: "#98868a",
                                }}
                              >
                                × {item.quantity}
                              </span>
                            </div>
                          ))}

                          {plan ? (
                            <small
                              style={{
                                color: "#9b898c",
                                marginTop: 2,
                              }}
                            >
                              買 {plan.buyQuantity ?? 0}
                              {" · "}
                              送 {plan.freeQuantity ?? 0}
                            </small>
                          ) : null}
                        </>
                      ) : offer.bundleType === "mix_match" ? (
                        <>
                          {offer.items.map((item) => (
                            <div key={item.id}>
                              <span
                                style={{
                                  color: "#98868a",
                                  marginRight: 8,
                                  fontSize: 11,
                                }}
                              >
                                {item.product.displayCode}
                              </span>

                              {item.product.name}
                            </div>
                          ))}

                          {plan?.requiredQuantity ? (
                            <small
                              style={{
                                color: "#7d2638",
                                fontWeight: 700,
                                marginTop: 2,
                              }}
                            >
                              任選 {plan.requiredQuantity} 件
                            </small>
                          ) : null}
                        </>
                      ) : (
                        <>
                          {offer.items.map((item) => (
                            <div key={item.id}>
                              <span
                                style={{
                                  color: "#98868a",
                                  marginRight: 8,
                                  fontSize: 11,
                                }}
                              >
                                {item.product.displayCode}
                              </span>

                              {item.product.name}

                              <span
                                style={{
                                  marginLeft: 6,
                                  color: "#98868a",
                                }}
                              >
                                × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className={styles.priceCell}>
                      <strong
                        style={{
                          fontSize: 15,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {plan
                          ? `NT$${plan.priceAmount.toLocaleString()}`
                          : "—"}
                      </strong>

                      {plan?.label ? (
                        <span
                          style={{
                            color: "#a08e91",
                            fontSize: 11,
                          }}
                        >
                          {plan.label}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td>
                    <select
                      value={offer.status}
                      disabled={
                        updatingStatusId === offer.id
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          offer.id,
                          event.target.value as ProductStatus
                        )
                      }
                      style={{
                        minWidth: 105,
                        minHeight: 38,
                        padding: "0 10px",
                        border: "1px solid #ded3d5",
                        borderRadius: 9,
                        background: "#fff",
                        color: "#4a393c",
                      }}
                    >
                      <option value="active">
                        上架中
                      </option>

                      <option value="inactive">
                        下架
                      </option>

                      <option value="coming_soon">
                        新品預告
                      </option>

                      <option value="sold_out">
                        售罄
                      </option>
                    </select>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Link
                        href={`/admin/bundle-offers/${offer.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 36,
                          padding: "0 12px",
                          borderRadius: 9,
                          border: "1px solid #d5b8bf",
                          background: "#fff",
                          color: "#7d2638",
                          fontWeight: 700,
                          fontSize: 12,
                          textDecoration: "none",
                        }}
                      >
                        編輯組合
                      </Link>

<Link
                        href={`/admin/bundle-offers/${offer.id}/card`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 36,
                          padding: "0 12px",
                          borderRadius: 9,
                          border: "1px solid #d5b8bf",
                          background: "#fff",
                          color: "#7d2638",
                          fontWeight: 700,
                          fontSize: 12,
                          textDecoration: "none",
                        }}
                      >
                        編輯商品卡
                      </Link>

                      <button
                        type="button"
                        disabled={
                          deletingId === offer.id
                        }
                        onClick={() =>
                          handleDelete(
                            offer.id,
                            offer.name
                          )
                        }
                        style={{
                          minHeight: 36,
                          padding: "0 12px",
                          borderRadius: 9,
                          border: "1px solid #e2d6d8",
                          background: "#faf7f7",
                          color: "#806d71",
                          cursor:
                            deletingId === offer.id
                              ? "wait"
                              : "pointer",
                        }}
                      >
                        {deletingId === offer.id
                          ? "刪除中…"
                          : "刪除"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOffers.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>
              找不到符合條件的組合優惠
            </strong>

            <p>
              換一個名稱，或清除搜尋與狀態篩選後再試一次。
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
