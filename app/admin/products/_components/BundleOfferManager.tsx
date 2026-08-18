"use client";

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
    <div
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <label
          style={{
            flex: "1 1 320px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            搜尋組合優惠
          </div>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="優惠名稱、商品編號、商品名稱…"
            style={{
              width: "100%",
              padding: 11,
            }}
          />
        </label>

        <label
          style={{
            minWidth: 180,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            狀態
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            style={{
              width: "100%",
              padding: 11,
            }}
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

        <Link href="/admin/bundle-offers/new">
          ＋ 新增組合優惠
        </Link>
      </div>

      <div>
        <strong>{filteredOffers.length}</strong>
        <span>
          {" / "}
          {bundleOffers.length} 筆組合優惠
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>
                名稱
              </th>
              <th style={{ textAlign: "left" }}>
                類型
              </th>
              <th style={{ textAlign: "left" }}>
                組合內容
              </th>
              <th style={{ textAlign: "left" }}>
                優惠價
              </th>
              <th style={{ textAlign: "left" }}>
                狀態
              </th>
              <th style={{ textAlign: "left" }}>
                操作
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredOffers.map((offer) => {
              const plan = offer.plans[0];

              return (
                <tr key={offer.id}>
                  <td>
                    <strong>{offer.name}</strong>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.65,
                      }}
                    >
                      Bundle ID {offer.id}
                    </div>
                  </td>

                  <td>
                    {typeLabel[offer.bundleType]}
                  </td>

                  <td>
                    {offer.bundleType ===
                    "buy_get" ? (
                      <>
                        {offer.items.map((item) => (
                          <div key={item.id}>
                            {item.role === "buy"
                              ? "購買："
                              : item.role === "free"
                                ? "贈送："
                                : ""}
                            {
                              item.product
                                .displayCode
                            }
                            {"　"}
                            {item.product.name}
                            {" × "}
                            {item.quantity}
                          </div>
                        ))}
                      </>
                    ) : offer.bundleType ===
                      "mix_match" ? (
                      <>
                        {offer.items.map((item) => (
                          <div key={item.id}>
                            {
                              item.product
                                .displayCode
                            }
                            {"　"}
                            {item.product.name}
                          </div>
                        ))}

                        {plan?.requiredQuantity ? (
                          <small>
                            任選{" "}
                            {plan.requiredQuantity} 件
                          </small>
                        ) : null}
                      </>
                    ) : (
                      <>
                        {offer.items.map((item) => (
                          <div key={item.id}>
                            {
                              item.product
                                .displayCode
                            }
                            {"　"}
                            {item.product.name}
                            {" × "}
                            {item.quantity}
                          </div>
                        ))}
                      </>
                    )}
                  </td>

                  <td>
                    <strong>
                      {plan
                        ? `NT$${plan.priceAmount.toLocaleString()}`
                        : "—"}
                    </strong>
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
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      <Link
                        href={`/admin/bundle-offers/${offer.id}`}
                      >
                        編輯
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
          <div
            style={{
              padding: 28,
              textAlign: "center",
            }}
          >
            目前沒有符合條件的組合優惠。
          </div>
        ) : null}
      </div>
    </div>
  );
}
