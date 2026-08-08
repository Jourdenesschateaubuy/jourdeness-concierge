"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  addHomepageProductInlineAction,
  removeHomepageProductInlineAction,
  saveHomepageProductSortOrderAction,
} from "./actions";

export type HomepageComposerProduct = {
  id: number;
  displayCode: string;
  sku?: string;
  name: string;
  cardName?: string;
  status:
    | "active"
    | "inactive"
    | "coming_soon"
    | "sold_out";
  category: string;
  series: string;
  image: string;
  price: string;
  salePriceAmount?: number;
  originalPriceAmount?: number;
  originalPrice?: string;
};

const statusLabel: Record<
  HomepageComposerProduct["status"],
  string
> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

type DragPayload = {
  productId: number;
  source: "selected" | "catalog";
};

const DRAG_TYPE =
  "application/x-jourdeness-home-product";

function formatMoney(value?: number) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(value)
  ) {
    return "";
  }

  return `NT$${Math.round(value).toLocaleString(
    "zh-TW"
  )}`;
}

function primaryPrice(
  product: HomepageComposerProduct
) {
  return (
    formatMoney(product.salePriceAmount) ||
    product.price ||
    "未設定價格"
  );
}

function secondaryPrice(
  product: HomepageComposerProduct
) {
  return (
    formatMoney(product.originalPriceAmount) ||
    product.originalPrice ||
    ""
  );
}

export default function HomepageProductComposer({
  sectionId,
  sectionName,
  initialProductIds,
  products,
  onPreviewProductIds,
}: {
  sectionId: number;
  sectionName: string;
  initialProductIds: number[];
  products: HomepageComposerProduct[];
  onPreviewProductIds?: (
    productIds: number[]
  ) => void;
}) {
  const router = useRouter();

  const [productIds, setProductIds] =
    useState(initialProductIds);
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("全部");
  const [series, setSeries] =
    useState("全部");
  const [status, setStatus] =
    useState("全部");
  const [previewProductId, setPreviewProductId] =
    useState<number | null>(null);
  const [message, setMessage] =
    useState("");
  const [isPending, startTransition] =
    useTransition();

  function previewIds(
    nextIds: number[]
  ) {
    onPreviewProductIds?.(nextIds);
  }

  function notifySavedDraft() {
    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-draft-saved"
      )
    );
  }

  useEffect(() => {
    setProductIds(initialProductIds);
  }, [initialProductIds]);

  const productMap = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          product,
        ])
      ),
    [products]
  );

  const selectedProducts = useMemo(
    () =>
      productIds
        .map((id) => productMap.get(id))
        .filter(
          (
            product
          ): product is HomepageComposerProduct =>
            Boolean(product)
        ),
    [productIds, productMap]
  );

  const categories = useMemo(
    () => [
      "全部",
      ...Array.from(
        new Set(
          products
            .map((product) =>
              product.category.trim()
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        a.localeCompare(b, "zh-TW")
      ),
    ],
    [products]
  );

  const seriesOptions = useMemo(
    () => [
      "全部",
      ...Array.from(
        new Set(
          products
            .filter((product) =>
              category === "全部"
                ? true
                : product.category ===
                  category
            )
            .map((product) =>
              product.series.trim()
            )
            .filter(Boolean)
        )
      ).sort((a, b) =>
        a.localeCompare(b, "zh-TW")
      ),
    ],
    [products, category]
  );

  const filteredCatalog = useMemo(() => {
    const needle = search
      .trim()
      .toLocaleLowerCase("zh-TW");

    return products
      .filter((product) =>
        category === "全部"
          ? true
          : product.category === category
      )
      .filter((product) =>
        series === "全部"
          ? true
          : product.series === series
      )
      .filter((product) =>
        status === "全部"
          ? true
          : product.status === status
      )
      .filter((product) => {
        if (!needle) return true;

        return [
          product.displayCode,
          product.sku,
          product.name,
          product.cardName,
          product.category,
          product.series,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("zh-TW")
          .includes(needle);
      })
      .sort((a, b) => {
        const selectedA =
          productIds.includes(a.id);
        const selectedB =
          productIds.includes(b.id);

        if (selectedA !== selectedB) {
          return selectedA ? 1 : -1;
        }

        const statusRank = (
          value: HomepageComposerProduct["status"]
        ) =>
          value === "active"
            ? 0
            : value === "coming_soon"
              ? 1
              : value === "sold_out"
                ? 2
                : 3;

        const rankDifference =
          statusRank(a.status) -
          statusRank(b.status);

        if (rankDifference !== 0) {
          return rankDifference;
        }

        return a.name.localeCompare(
          b.name,
          "zh-TW"
        );
      });
  }, [
    products,
    productIds,
    category,
    series,
    status,
    search,
  ]);

  const previewProduct =
    previewProductId === null
      ? null
      : productMap.get(previewProductId) ??
        null;

  function setDragPayload(
    event: React.DragEvent,
    payload: DragPayload
  ) {
    event.dataTransfer.effectAllowed =
      "move";
    event.dataTransfer.setData(
      DRAG_TYPE,
      JSON.stringify(payload)
    );
  }

  function readDragPayload(
    event: React.DragEvent
  ): DragPayload | null {
    try {
      const raw =
        event.dataTransfer.getData(
          DRAG_TYPE
        );

      if (!raw) return null;

      const parsed =
        JSON.parse(raw) as DragPayload;

      if (
        !Number.isInteger(
          parsed.productId
        ) ||
        (parsed.source !== "selected" &&
          parsed.source !== "catalog")
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  function persistOrder(
    nextIds: number[],
    successMessage =
      "商品順序已儲存"
  ) {
    const previous = productIds;
    setProductIds(nextIds);
    previewIds(nextIds);
    setMessage("儲存中…");

    startTransition(async () => {
      try {
        await saveHomepageProductSortOrderAction(
          sectionId,
          nextIds
        );

        setMessage(successMessage);
        notifySavedDraft();
        router.refresh();
      } catch (error) {
        setProductIds(previous);
        previewIds(previous);

        setMessage(
          error instanceof Error
            ? error.message
            : "商品排序失敗"
        );
      }
    });
  }

  function addProduct(
    productId: number,
    insertBeforeId?: number
  ) {
    if (productIds.includes(productId)) {
      if (
        insertBeforeId &&
        productId !== insertBeforeId
      ) {
        reorderProduct(
          productId,
          insertBeforeId
        );
      }

      return;
    }

    const previous = productIds;
    let next = [...productIds, productId];

    if (insertBeforeId) {
      const without =
        next.filter(
          (id) => id !== productId
        );

      const targetIndex =
        without.indexOf(insertBeforeId);

      next =
        targetIndex >= 0
          ? [
              ...without.slice(
                0,
                targetIndex
              ),
              productId,
              ...without.slice(
                targetIndex
              ),
            ]
          : next;
    }

    setProductIds(next);
    previewIds(next);
    setMessage("加入商品中…");

    startTransition(async () => {
      try {
        await addHomepageProductInlineAction(
          sectionId,
          productId
        );

        await saveHomepageProductSortOrderAction(
          sectionId,
          next
        );

        setMessage("商品已加入草稿");
        notifySavedDraft();
        router.refresh();
      } catch (error) {
        setProductIds(previous);
        previewIds(previous);

        setMessage(
          error instanceof Error
            ? error.message
            : "加入商品失敗"
        );
      }
    });
  }

  function reorderProduct(
    productId: number,
    targetProductId: number
  ) {
    if (
      productId === targetProductId
    ) {
      return;
    }

    const from =
      productIds.indexOf(productId);
    const to =
      productIds.indexOf(
        targetProductId
      );

    if (from < 0 || to < 0) return;

    const next = [...productIds];
    const [moved] =
      next.splice(from, 1);

    next.splice(to, 0, moved);

    persistOrder(next);
  }

  function removeProduct(
    productId: number
  ) {
    if (
      !productIds.includes(productId)
    ) {
      return;
    }

    const previous = productIds;
    const next =
      productIds.filter(
        (id) => id !== productId
      );

    setProductIds(next);
    previewIds(next);
    setMessage("移除商品中…");

    startTransition(async () => {
      try {
        await removeHomepageProductInlineAction(
          sectionId,
          productId
        );

        if (next.length > 0) {
          await saveHomepageProductSortOrderAction(
            sectionId,
            next
          );
        }

        setMessage(
          "商品已從草稿移除"
        );
        notifySavedDraft();
        router.refresh();
      } catch (error) {
        setProductIds(previous);
        previewIds(previous);

        setMessage(
          error instanceof Error
            ? error.message
            : "移除商品失敗"
        );
      }
    });
  }

  return (
    <div style={styles.composer}>
      <div style={styles.heading}>
        <div>
          <strong>
            商品編排・{sectionName}
          </strong>
          <span>
            左側找商品；右側是目前首頁商品順序。
          </span>
        </div>

        <strong style={styles.message}>
          {isPending
            ? "儲存中…"
            : message}
        </strong>
      </div>

      <div style={styles.filters}>
        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="搜尋商品名稱、Code、SKU、系列"
          style={styles.search}
        />

        <select
          value={category}
          onChange={(event) => {
            setCategory(
              event.target.value
            );
            setSeries("全部");
          }}
          style={styles.select}
        >
          {categories.map(
            (value) => (
              <option
                key={value}
                value={value}
              >
                分類：{value}
              </option>
            )
          )}
        </select>

        <select
          value={series}
          onChange={(event) =>
            setSeries(
              event.target.value
            )
          }
          style={styles.select}
        >
          {seriesOptions.map(
            (value) => (
              <option
                key={value}
                value={value}
              >
                系列：{value}
              </option>
            )
          )}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
          style={styles.select}
        >
          <option value="全部">
            狀態：全部
          </option>
          <option value="active">
            狀態：上架中
          </option>
          <option value="coming_soon">
            狀態：新品預告
          </option>
          <option value="sold_out">
            狀態：售罄
          </option>
          <option value="inactive">
            狀態：下架
          </option>
        </select>
      </div>

      <div style={styles.columns}>
        <section style={styles.catalog}>
          <div style={styles.columnHeader}>
            <strong>商品庫</strong>
            <span>
              找到 {filteredCatalog.length} 個
            </span>
          </div>

          <div style={styles.catalogList}>
            {filteredCatalog
              .slice(0, 120)
              .map((product) => {
                const selected =
                  productIds.includes(
                    product.id
                  );

                return (
                  <article
                    key={product.id}
                    draggable={
                      !selected &&
                      !isPending
                    }
                    onMouseEnter={() =>
                      setPreviewProductId(
                        product.id
                      )
                    }
                    onFocus={() =>
                      setPreviewProductId(
                        product.id
                      )
                    }
                    onDragStart={(
                      event
                    ) =>
                      setDragPayload(
                        event,
                        {
                          productId:
                            product.id,
                          source:
                            "catalog",
                        }
                      )
                    }
                    style={{
                      ...styles.catalogItem,
                      ...(selected
                        ? styles.catalogItemSelected
                        : {}),
                    }}
                  >
                    <ProductThumb
                      product={product}
                    />

                    <ProductIdentity
                      product={product}
                    />

                    <ProductPrice
                      product={product}
                    />

                    <StatusBadge
                      status={product.status}
                    />

                    <button
                      type="button"
                      disabled={
                        selected ||
                        isPending
                      }
                      onClick={() =>
                        addProduct(
                          product.id
                        )
                      }
                      style={{
                        ...styles.addButton,
                        ...(selected
                          ? styles.addButtonDisabled
                          : {}),
                      }}
                    >
                      {selected
                        ? "✓ 已加入"
                        : "＋ 加入"}
                    </button>
                  </article>
                );
              })}
          </div>
        </section>

        <section
          style={styles.selected}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect =
              "move";
          }}
          onDrop={(event) => {
            event.preventDefault();

            const payload =
              readDragPayload(event);

            if (
              payload?.source ===
              "catalog"
            ) {
              addProduct(
                payload.productId
              );
            }
          }}
        >
          <div style={styles.columnHeader}>
            <strong>
              首頁區塊商品
            </strong>
            <span>
              {selectedProducts.length} 個
            </span>
          </div>

          {selectedProducts.length ===
          0 ? (
            <div style={styles.empty}>
              把左側商品拖進來，或按「＋ 加入」。
            </div>
          ) : (
            <div style={styles.selectedList}>
              {selectedProducts.map(
                (product, index) => (
                  <article
                    key={product.id}
                    draggable={!isPending}
                    onMouseEnter={() =>
                      setPreviewProductId(
                        product.id
                      )
                    }
                    onFocus={() =>
                      setPreviewProductId(
                        product.id
                      )
                    }
                    onDragStart={(
                      event
                    ) =>
                      setDragPayload(
                        event,
                        {
                          productId:
                            product.id,
                          source:
                            "selected",
                        }
                      )
                    }
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect =
                        "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();

                      const payload =
                        readDragPayload(
                          event
                        );

                      if (!payload) return;

                      if (
                        payload.source ===
                        "catalog"
                      ) {
                        addProduct(
                          payload.productId,
                          product.id
                        );
                      } else {
                        reorderProduct(
                          payload.productId,
                          product.id
                        );
                      }
                    }}
                    style={styles.selectedItem}
                  >
                    <span style={styles.order}>
                      ☰ {index + 1}
                    </span>

                    <ProductThumb
                      product={product}
                    />

                    <ProductIdentity
                      product={product}
                    />

                    <ProductPrice
                      product={product}
                    />

                    <StatusBadge
                      status={product.status}
                    />

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        removeProduct(
                          product.id
                        )
                      }
                      style={styles.removeButton}
                    >
                      移除
                    </button>
                  </article>
                )
              )}
            </div>
          )}

          <div
            style={styles.removeDrop}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect =
                "move";
            }}
            onDrop={(event) => {
              event.preventDefault();

              const payload =
                readDragPayload(event);

              if (
                payload?.source ===
                "selected"
              ) {
                removeProduct(
                  payload.productId
                );
              }
            }}
          >
            拖到這裡即可移除
          </div>
        </section>
      </div>

      {previewProduct ? (
        <aside style={styles.quickPreview}>
          <ProductThumb
            product={previewProduct}
            large
          />

          <div style={styles.quickPreviewBody}>
            <span style={styles.previewEyebrow}>
              QUICK PREVIEW
            </span>

            <strong>
              {previewProduct.cardName ||
                previewProduct.name}
            </strong>

            <small>
              {previewProduct.displayCode}
              {previewProduct.sku
                ? ` ・ SKU ${previewProduct.sku}`
                : ""}
            </small>

            <small>
              {previewProduct.category}
              {previewProduct.series
                ? ` ・ ${previewProduct.series}`
                : ""}
            </small>
          </div>

          <ProductPrice
            product={previewProduct}
            large
          />

          <StatusBadge
            status={previewProduct.status}
          />
        </aside>
      ) : null}

      <small style={styles.draftNote}>
        商品編排會自動寫入 Homepage Draft；正式首頁仍要「發布目前草稿」才更新。
      </small>
    </div>
  );
}

function ProductIdentity({
  product,
}: {
  product: HomepageComposerProduct;
}) {
  return (
    <div style={styles.productText}>
      <strong>
        {product.cardName ||
          product.name}
      </strong>

      <small>
        {product.displayCode}
        {product.sku
          ? ` ・ SKU ${product.sku}`
          : ""}
      </small>

      <small>
        {product.series ||
          product.category}
      </small>
    </div>
  );
}

function ProductPrice({
  product,
  large = false,
}: {
  product: HomepageComposerProduct;
  large?: boolean;
}) {
  const original =
    secondaryPrice(product);

  return (
    <div
      style={{
        ...styles.priceBlock,
        ...(large
          ? styles.priceBlockLarge
          : {}),
      }}
    >
      {original ? (
        <small style={styles.originalPrice}>
          {original}
        </small>
      ) : null}

      <strong>
        {primaryPrice(product)}
      </strong>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: HomepageComposerProduct["status"];
}) {
  return (
    <span
      style={
        status === "active"
          ? styles.statusActive
          : status === "coming_soon"
            ? styles.statusComingSoon
            : status === "sold_out"
              ? styles.statusSoldOut
              : styles.statusMuted
      }
    >
      {statusLabel[status]}
    </span>
  );
}

function ProductThumb({
  product,
  large = false,
}: {
  product: HomepageComposerProduct;
  large?: boolean;
}) {
  const size = large ? 78 : 50;

  return product.image ? (
    <img
      src={product.image}
      alt=""
      style={{
        ...styles.thumb,
        width: size,
        height: size,
      }}
    />
  ) : (
    <span
      style={{
        ...styles.thumbPlaceholder,
        width: size,
        height: size,
      }}
    >
      無圖
    </span>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  composer: {
    display: "grid",
    gap: 14,
    marginTop: 20,
    paddingTop: 20,
    borderTop:
      "1px solid rgba(140,41,64,.1)",
  },

  heading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },

  message: {
    color: "#8c2940",
    fontSize: 12,
  },

  filters: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 1.6fr) repeat(3, minmax(130px, .8fr))",
    gap: 8,
    padding: 10,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "#fffafb",
  },

  search: {
    minWidth: 0,
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#fff",
  },

  select: {
    minWidth: 0,
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    padding: "10px 11px",
    background: "#fff",
  },

  columns: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.05fr) minmax(0, .95fr)",
    gap: 14,
  },

  catalog: {
    minWidth: 0,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 16,
    background: "#fffafb",
    overflow: "hidden",
  },

  selected: {
    minWidth: 0,
    padding: 10,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 16,
    background: "#fff",
  },

  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "11px 12px",
    color: "#66575b",
  },

  catalogList: {
    display: "grid",
    gap: 1,
    maxHeight: 480,
    overflowY: "auto",
    background:
      "rgba(140,41,64,.06)",
  },

  catalogItem: {
    display: "grid",
    gridTemplateColumns:
      "50px minmax(150px,1fr) minmax(110px,.5fr) auto auto",
    gap: 10,
    alignItems: "center",
    padding: 10,
    background: "#fff",
    cursor: "grab",
  },

  catalogItemSelected: {
    opacity: 0.58,
    cursor: "default",
  },

  selectedList: {
    display: "grid",
    gap: 8,
  },

  selectedItem: {
    display: "grid",
    gridTemplateColumns:
      "54px 50px minmax(130px,1fr) minmax(100px,.45fr) auto auto",
    gap: 10,
    alignItems: "center",
    padding: 9,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 12,
    background: "#fffafb",
    cursor: "grab",
  },

  order: {
    color: "#8c2940",
    fontWeight: 900,
  },

  productText: {
    display: "grid",
    minWidth: 0,
    gap: 3,
  },

  thumb: {
    objectFit: "cover",
    borderRadius: 9,
    background: "#f4efec",
  },

  thumbPlaceholder: {
    display: "grid",
    placeItems: "center",
    borderRadius: 9,
    background: "#f4efec",
    color: "#9b8f8b",
    fontSize: 10,
  },

  priceBlock: {
    display: "grid",
    gap: 2,
    minWidth: 95,
    textAlign: "right",
  },

  priceBlockLarge: {
    textAlign: "left",
  },

  originalPrice: {
    color: "#9d9093",
    textDecoration: "line-through",
  },

  statusActive: {
    borderRadius: 999,
    padding: "4px 7px",
    background: "#edf8f1",
    color: "#26734d",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusComingSoon: {
    borderRadius: 999,
    padding: "4px 7px",
    background: "#fff3f6",
    color: "#9d3150",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusSoldOut: {
    borderRadius: 999,
    padding: "4px 7px",
    background: "#fff4e8",
    color: "#915f21",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusMuted: {
    borderRadius: 999,
    padding: "4px 7px",
    background: "#f3f0f0",
    color: "#867b7d",
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  addButton: {
    border:
      "1px solid rgba(140,41,64,.22)",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  addButtonDisabled: {
    cursor: "not-allowed",
    opacity: 0.65,
  },

  removeButton: {
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
    fontWeight: 800,
  },

  empty: {
    display: "grid",
    placeItems: "center",
    minHeight: 180,
    padding: 24,
    border:
      "1px dashed rgba(140,41,64,.24)",
    borderRadius: 12,
    color: "#86777b",
    textAlign: "center",
  },

  removeDrop: {
    marginTop: 10,
    padding: 10,
    border:
      "1px dashed rgba(180,35,24,.22)",
    borderRadius: 12,
    background: "#fff9f8",
    color: "#a55c52",
    textAlign: "center",
    fontSize: 12,
  },

  quickPreview: {
    display: "grid",
    gridTemplateColumns:
      "78px minmax(0,1fr) auto auto",
    gap: 14,
    alignItems: "center",
    padding: 14,
    border:
      "1px solid rgba(140,41,64,.14)",
    borderRadius: 16,
    background: "#fffafb",
  },

  quickPreviewBody: {
    display: "grid",
    gap: 4,
  },

  previewEyebrow: {
    color: "#8c2940",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  draftNote: {
    color: "#806f73",
    lineHeight: 1.5,
  },
};
