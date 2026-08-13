"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import type {
  SiteStudioSection,
} from "../../../lib/site-studio-types";

export type SectionProductOption = {
  id: number;
  displayCode: string;
  name: string;
  cardName: string;
  status: string;
  image: string;
  category: string;
  series: string;
};

type Props = {
  section: SiteStudioSection;
  products: SectionProductOption[];
  onSaved?: (
    section: SiteStudioSection
  ) => void;
};

export default function SiteStudioSectionProductManager({
  section,
  products,
  onSaved,
}: Props) {
  const [productIds, setProductIds] =
    useState<number[]>(
      section.productIds ?? []
    );

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    })
  );

  const selectedProducts =
    useMemo(
      () =>
        productIds
          .map((id) =>
            products.find(
              (product) =>
                product.id === id
            )
          )
          .filter(
            (
              product
            ): product is SectionProductOption =>
              Boolean(product)
          ),
      [productIds, products]
    );

  const availableProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            !productIds.includes(
              product.id
            )
        ),
      [productIds, products]
    );

  async function save(
    nextProductIds: number[]
  ) {
    const nextSection = {
      ...section,
      productIds:
        nextProductIds,
    };

    const response = await fetch(
      "/api/admin/site-studio",
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          kind: "section",
          section: nextSection,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "商品編排儲存失敗"
      );
    }

    onSaved?.(
      nextSection
    );

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-draft-saved"
      )
    );
  }

  function persist(
    nextProductIds: number[],
    successMessage: string
  ) {
    const previous =
      productIds;

    setProductIds(
      nextProductIds
    );

    setMessage(
      "儲存中…"
    );

    startTransition(async () => {
      try {
        await save(
          nextProductIds
        );

        setMessage(
          successMessage
        );
      } catch (error) {
        setProductIds(
          previous
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "儲存失敗，已恢復原設定"
        );
      }
    });
  }

  function addProduct() {
    const productId =
      Number(
        selectedProductId
      );

    if (
      !Number.isInteger(
        productId
      ) ||
      productId <= 0 ||
      productIds.includes(
        productId
      )
    ) {
      return;
    }

    persist(
      [
        ...productIds,
        productId,
      ],
      "商品已加入"
    );

    setSelectedProductId(
      ""
    );
  }

  function removeProduct(
    productId: number
  ) {
    persist(
      productIds.filter(
        (id) =>
          id !== productId
      ),
      "商品已移除"
    );
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } =
      event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      productIds.indexOf(
        Number(active.id)
      );

    const newIndex =
      productIds.indexOf(
        Number(over.id)
      );

    if (
      oldIndex < 0 ||
      newIndex < 0
    ) {
      return;
    }

    persist(
      arrayMove(
        productIds,
        oldIndex,
        newIndex
      ),
      "商品排序已儲存"
    );
  }

  return (
    <section
      style={styles.wrapper}
    >
      <div style={styles.heading}>
        <div>
          <strong>
            編排商品
          </strong>

          <p>
            選擇首頁要展示的商品，
            並拖曳調整商品順序。
          </p>
        </div>

        <span
          style={styles.countBadge}
        >
          {productIds.length}
          {" "}個商品
        </span>
      </div>

      <div style={styles.addRow}>
        <select
          value={
            selectedProductId
          }
          onChange={(event) =>
            setSelectedProductId(
              event.target.value
            )
          }
          disabled={isPending}
          style={styles.select}
        >
          <option value="">
            選擇要加入的商品
          </option>

          {availableProducts.map(
            (product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.displayCode}
                {"｜"}
                {product.cardName ||
                  product.name}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={addProduct}
          disabled={
            isPending ||
            !selectedProductId
          }
          style={styles.addButton}
        >
          ＋ 加入商品
        </button>
      </div>

      {message ? (
        <small
          style={styles.message}
        >
          {isPending
            ? "儲存中…"
            : message}
        </small>
      ) : null}

      {selectedProducts.length ===
      0 ? (
        <div style={styles.empty}>
          此區塊目前沒有商品。
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragEnd={
            handleDragEnd
          }
        >
          <SortableContext
            items={productIds}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div
              style={
                styles.productList
              }
            >
              {selectedProducts.map(
                (product) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    disabled={
                      isPending
                    }
                    onRemove={() =>
                      removeProduct(
                        product.id
                      )
                    }
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function SortableProductRow({
  product,
  disabled,
  onRemove,
}: {
  product: SectionProductOption;
  disabled: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    disabled,
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        ...styles.productRow,
        transform:
          CSS.Transform.toString(
            transform
          ),
        transition,
        opacity:
          isDragging
            ? 0.55
            : 1,
      }}
    >
      <button
        type="button"
        style={styles.dragHandle}
        disabled={disabled}
        title="拖曳商品排序"
        {...attributes}
        {...listeners}
      >
        ☰
      </button>

      <div style={styles.imageBox}>
        {product.image ? (
          <img
            src={product.image}
            alt={
              product.cardName ||
              product.name
            }
            style={styles.image}
          />
        ) : (
          <span>無圖片</span>
        )}
      </div>

      <div style={styles.info}>
        <small>
          {product.displayCode}
        </small>

        <strong>
          {product.cardName ||
            product.name}
        </strong>

        <span>
          {product.series ||
            product.category}
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        style={
          styles.removeButton
        }
      >
        移除
      </button>
    </article>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  wrapper: {
    display: "grid",
    gap: 12,
    marginTop: 12,
    padding: 14,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 14,
    background: "#fff",
  },

  heading: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 12,
  },

  countBadge: {
    height: "fit-content",
    padding: "4px 9px",
    borderRadius: 999,
    background: "#8c2940",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
  },

  addRow: {
    display: "flex",
    gap: 8,
  },

  select: {
    flex: 1,
    minWidth: 0,
    padding: "9px 11px",
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    background: "#fff",
  },

  addButton: {
    border: 0,
    borderRadius: 999,
    padding: "9px 13px",
    background: "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  message: {
    color: "#75666a",
  },

  empty: {
    padding: 20,
    border:
      "1px dashed rgba(140,41,64,.18)",
    borderRadius: 12,
    color: "#8d7d81",
    textAlign: "center",
  },

  productList: {
    display: "grid",
    gap: 8,
  },

  productRow: {
    display: "grid",
    gridTemplateColumns:
      "34px 62px minmax(0,1fr) auto",
    alignItems: "center",
    gap: 10,
    padding: 9,
    border:
      "1px solid rgba(140,41,64,.1)",
    borderRadius: 12,
    background: "#fffafb",
  },

  dragHandle: {
    width: 32,
    height: 36,
    border:
      "1px solid rgba(140,41,64,.14)",
    borderRadius: 9,
    background: "#fff",
    color: "#8c2940",
    cursor: "grab",
    touchAction: "none",
  },

  imageBox: {
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    width: 62,
    height: 62,
    borderRadius: 9,
    background: "#f4efec",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  info: {
    display: "grid",
    gap: 3,
    minWidth: 0,
  },

  removeButton: {
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "7px 10px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
  },
};
