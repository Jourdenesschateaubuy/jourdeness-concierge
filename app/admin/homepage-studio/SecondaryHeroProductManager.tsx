"use client";

import {
  useEffect,
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import type {
  SiteStudioHero,
} from "../../../lib/site-studio-types";

export type SecondaryHeroProductOption = {
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
  hero: SiteStudioHero;
  products: SecondaryHeroProductOption[];
};

export default function SecondaryHeroProductManager({
  hero,
  products,
}: Props) {
  const [productIds, setProductIds] =
    useState<number[]>(
      hero.productIds ?? []
    );

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    setProductIds(
      hero.productIds ?? []
    );
  }, [hero.productIds]);

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
            ): product is SecondaryHeroProductOption =>
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
    const nextHero = {
      ...hero,
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
          kind: "hero",
          slot: "secondary",
          hero: nextHero,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "副主視覺商品儲存失敗"
      );
    }

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-draft-saved"
      )
    );

    return result;
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

    setMessage("儲存中…");

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

    const reordered =
      arrayMove(
        productIds,
        oldIndex,
        newIndex
      );

    persist(
      reordered,
      "商品排序已儲存"
    );
  }

  return (
    <section
      style={styles.wrapper}
    >
      <div
        style={styles.heading}
      >
        <div>
          <div
            style={
              styles.titleRow
            }
          >
            <span
              style={
                styles.lockBadge
              }
            >
              🔒 固定區塊
            </span>

            <strong>
              副主視覺搭配商品
            </strong>
          </div>

          <p>
            這個商品區固定在副主視覺下方，
            整區不能拖動，但商品可新增、
            移除與拖曳排序。
          </p>
        </div>

        <span
          style={
            styles.countBadge
          }
        >
          {productIds.length}
          {" "}個商品
        </span>
      </div>

      <div
        style={styles.addRow}
      >
        <select
          value={
            selectedProductId
          }
          onChange={(event) =>
            setSelectedProductId(
              event.target.value
            )
          }
          style={styles.select}
          disabled={isPending}
        >
          <option value="">
            選擇要加入的商品
          </option>

          {availableProducts.map(
            (product) => (
              <option
                key={
                  product.id
                }
                value={
                  product.id
                }
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
        <div
          style={
            styles.message
          }
        >
          {isPending
            ? "儲存中…"
            : message}
        </div>
      ) : null}

      {selectedProducts.length ===
      0 ? (
        <div
          style={
            styles.empty
          }
        >
          尚未設定副主視覺搭配商品。
        </div>
      ) : (
        <DndContext
          id="secondary-hero-products"
          sensors={sensors}
          collisionDetection={
            closestCenter
          }
          onDragEnd={
            handleDragEnd
          }
        >
          <SortableContext
            items={
              productIds
            }
            strategy={
              horizontalListSortingStrategy
            }
          >
            <div
              style={
                styles.productGrid
              }
            >
              {selectedProducts.map(
                (product) => (
                  <SortableProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
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

function SortableProductCard({
  product,
  disabled,
  onRemove,
}: {
  product: SecondaryHeroProductOption;
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
        ...styles.productCard,
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
        style={
          styles.dragHandle
        }
        title="拖曳商品排序"
        aria-label={`拖曳 ${
          product.cardName ||
          product.name
        }`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        ☰
      </button>

      <div
        style={
          styles.imageBox
        }
      >
        {product.image ? (
          <img
            src={
              product.image
            }
            alt={
              product.cardName ||
              product.name
            }
            style={
              styles.image
            }
          />
        ) : (
          <span>
            無圖片
          </span>
        )}
      </div>

      <div
        style={
          styles.productInfo
        }
      >
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
        onClick={onRemove}
        disabled={disabled}
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
    gap: 14,
    marginBottom: 18,
    padding: 18,
    border:
      "2px solid rgba(140,41,64,.18)",
    borderRadius: 20,
    background:
      "#fff9fa",
  },

  heading: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 16,
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  lockBadge: {
    padding: "5px 9px",
    borderRadius: 999,
    background:
      "#efe9eb",
    color: "#755b62",
    fontSize: 11,
    fontWeight: 800,
  },

  countBadge: {
    height: "fit-content",
    padding: "5px 9px",
    borderRadius: 999,
    background:
      "#8c2940",
    color: "#fff",
    fontSize: 11,
    fontWeight: 800,
  },

  addRow: {
    display: "flex",
    gap: 10,
  },

  select: {
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 12,
    background: "#fff",
  },

  addButton: {
    border: 0,
    borderRadius: 999,
    padding: "10px 15px",
    background:
      "#8c2940",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  message: {
    color: "#75666a",
    fontSize: 12,
  },

  empty: {
    padding: 24,
    border:
      "1px dashed rgba(140,41,64,.18)",
    borderRadius: 14,
    textAlign: "center",
    color: "#8d7d81",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0,1fr))",
    gap: 10,
  },

  productCard: {
    display: "grid",
    gridTemplateColumns:
      "34px 70px minmax(0,1fr) auto",
    alignItems: "center",
    gap: 10,
    padding: 10,
    border:
      "1px solid rgba(140,41,64,.12)",
    borderRadius: 14,
    background: "#fff",
  },

  dragHandle: {
    width: 32,
    height: 38,
    border:
      "1px solid rgba(140,41,64,.14)",
    borderRadius: 9,
    background: "#fff8f9",
    color: "#8c2940",
    cursor: "grab",
    touchAction: "none",
  },

  imageBox: {
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    width: 70,
    height: 70,
    borderRadius: 10,
    background:
      "#f7f2ef",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit:
      "contain",
  },

  productInfo: {
    display: "grid",
    gap: 3,
    minWidth: 0,
  },

  removeButton: {
    border:
      "1px solid rgba(180,35,24,.18)",
    borderRadius: 999,
    padding: "7px 10px",
    background:
      "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
  },
};
