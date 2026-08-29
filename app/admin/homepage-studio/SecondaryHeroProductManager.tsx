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

export type SecondaryHeroBundleOfferOption = {
  id: number;
  name: string;
  status: string;
  image: string;
  priceText: string;
  category: string;
  series: string;
};

type Props = {
  hero: SiteStudioHero;
  products:
    SecondaryHeroProductOption[];
  bundleOffers:
    SecondaryHeroBundleOfferOption[];
};

type SecondaryHeroItem =
  NonNullable<
    SiteStudioHero["items"]
  >[number];

type SecondaryHeroContentOption = {
  key: string;
  targetType:
    | "product"
    | "bundle_offer";
  targetId: number;
  displayCode: string;
  title: string;
  image: string;
  meta: string;
};

function itemKey(
  item: SecondaryHeroItem
) {
  return (
    item.targetType +
    ":" +
    item.targetId
  );
}

function initialItems(
  hero: SiteStudioHero
): SecondaryHeroItem[] {
  if (
    Array.isArray(hero.items)
  ) {
    return hero.items;
  }

  return (
    hero.productIds ?? []
  ).map(
    (targetId) => ({
      targetType:
        "product" as const,
      targetId,
    })
  );
}

export default function SecondaryHeroProductManager({
  hero,
  products,
  bundleOffers,
}: Props) {
  const [
    items,
    setItems,
  ] =
    useState<
      SecondaryHeroItem[]
    >(
      () =>
        initialItems(hero)
    );

  const [
    selectedContentKey,
    setSelectedContentKey,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  useEffect(() => {
    setItems(
      initialItems(hero)
    );
  }, [
    hero.items,
    hero.productIds,
  ]);

  const sensors =
    useSensors(
      useSensor(
        PointerSensor,
        {
          activationConstraint: {
            distance: 6,
          },
        }
      ),
      useSensor(
        TouchSensor,
        {
          activationConstraint: {
            delay: 180,
            tolerance: 6,
          },
        }
      )
    );

  const catalog =
    useMemo<
      SecondaryHeroContentOption[]
    >(
      () => [
        ...products.map(
          (product) => ({
            key:
              "product:" +
              product.id,
            targetType:
              "product" as const,
            targetId:
              product.id,
            displayCode:
              product.displayCode,
            title:
              product.cardName ||
              product.name,
            image:
              product.image,
            meta:
              product.series ||
              product.category ||
              "商品",
          })
        ),

        ...bundleOffers.map(
          (offer) => ({
            key:
              "bundle_offer:" +
              offer.id,
            targetType:
              "bundle_offer" as const,
            targetId:
              offer.id,
            displayCode:
              "Bundle #" +
              offer.id,
            title:
              offer.name,
            image:
              offer.image,
            meta:
              offer.priceText ||
              offer.series ||
              offer.category ||
              "組合優惠",
          })
        ),
      ],
      [
        products,
        bundleOffers,
      ]
    );

  const selectedContent =
    useMemo(
      () =>
        items
          .map(
            (item) =>
              catalog.find(
                (option) =>
                  option.key ===
                  itemKey(item)
              )
          )
          .filter(
            (
              option
            ): option is SecondaryHeroContentOption =>
              Boolean(option)
          ),
      [
        items,
        catalog,
      ]
    );

  const availableContent =
    useMemo(
      () => {
        const selectedKeys =
          new Set(
            items.map(
              itemKey
            )
          );

        return catalog.filter(
          (option) =>
            !selectedKeys.has(
              option.key
            )
        );
      },
      [
        items,
        catalog,
      ]
    );

  async function save(
    nextItems:
      SecondaryHeroItem[]
  ) {
    const nextProductIds =
      nextItems
        .filter(
          (item) =>
            item.targetType ===
            "product"
        )
        .map(
          (item) =>
            item.targetId
        );

    const nextHero:
      SiteStudioHero = {
        ...hero,
        productIds:
          nextProductIds,
        items:
          nextItems,
      };

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
              kind: "hero",
              slot:
                "secondary",
              hero:
                nextHero,
            }),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "副主視覺搭配內容儲存失敗"
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
    nextItems:
      SecondaryHeroItem[],
    successMessage: string
  ) {
    const previous =
      items;

    setItems(
      nextItems
    );

    setMessage(
      "儲存中…"
    );

    startTransition(
      async () => {
        try {
          await save(
            nextItems
          );

          setMessage(
            successMessage
          );
        } catch (error) {
          setItems(
            previous
          );

          setMessage(
            error instanceof Error
              ? error.message
              : "儲存失敗，已恢復原設定"
          );
        }
      }
    );
  }

  function addContent() {
    const option =
      availableContent.find(
        (candidate) =>
          candidate.key ===
          selectedContentKey
      );

    if (!option) {
      return;
    }

    persist(
      [
        ...items,
        {
          targetType:
            option.targetType,
          targetId:
            option.targetId,
        },
      ],
      option.targetType ===
      "bundle_offer"
        ? "組合優惠已加入"
        : "商品已加入"
    );

    setSelectedContentKey(
      ""
    );
  }

  function removeContent(
    key: string
  ) {
    persist(
      items.filter(
        (item) =>
          itemKey(item) !==
          key
      ),
      "搭配內容已移除"
    );
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const {
      active,
      over,
    } =
      event;

    if (
      !over ||
      active.id ===
        over.id
    ) {
      return;
    }

    const activeKey =
      String(active.id);

    const overKey =
      String(over.id);

    const oldIndex =
      items.findIndex(
        (item) =>
          itemKey(item) ===
          activeKey
      );

    const newIndex =
      items.findIndex(
        (item) =>
          itemKey(item) ===
          overKey
      );

    if (
      oldIndex < 0 ||
      newIndex < 0
    ) {
      return;
    }

    persist(
      arrayMove(
        items,
        oldIndex,
        newIndex
      ),
      "搭配內容排序已儲存"
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
              副主視覺搭配內容
            </strong>
          </div>

          {isOpen ? (
            <p>
              這個內容區固定在副主視覺下方，
              可加入一般商品或組合優惠，
              並可移除與拖曳排序。
            </p>
          ) : null}
        </div>

        <div
          style={
            styles.headingActions
          }
        >
          <span
            style={
              styles.countBadge
            }
          >
            {items.length}
            {" "}個內容
          </span>

          <button
            type="button"
            style={
              styles.manageButton
            }
            onClick={() =>
              setIsOpen(
                (current) =>
                  !current
              )
            }
          >
            {isOpen
              ? "收合"
              : "管理內容"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div
            style={
              styles.addRow
            }
          >
            <select
              value={
                selectedContentKey
              }
              onChange={
                (event) =>
                  setSelectedContentKey(
                    event.target.value
                  )
              }
              style={
                styles.select
              }
              disabled={
                isPending
              }
            >
              <option value="">
                選擇商品或組合優惠
              </option>

              {availableContent.map(
                (option) => (
                  <option
                    key={
                      option.key
                    }
                    value={
                      option.key
                    }
                  >
                    {option.targetType ===
                    "bundle_offer"
                      ? "[組合] "
                      : "[商品] "}
                    {option.displayCode}
                    {"｜"}
                    {option.title}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                addContent
              }
              disabled={
                isPending ||
                !selectedContentKey
              }
              style={
                styles.addButton
              }
            >
              ＋ 加入內容
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

          {selectedContent.length ===
          0 ? (
            <div
              style={
                styles.empty
              }
            >
              尚未設定副主視覺搭配內容。
            </div>
          ) : (
            <DndContext
              id="secondary-hero-content"
              sensors={
                sensors
              }
              collisionDetection={
                closestCenter
              }
              onDragEnd={
                handleDragEnd
              }
            >
              <SortableContext
                items={
                  items.map(
                    itemKey
                  )
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
                  {selectedContent.map(
                    (content) => (
                      <SortableContentCard
                        key={
                          content.key
                        }
                        content={
                          content
                        }
                        disabled={
                          isPending
                        }
                        onRemove={() =>
                          removeContent(
                            content.key
                          )
                        }
                      />
                    )
                  )}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      ) : null}
    </section>
  );
}

function SortableContentCard({
  content,
  disabled,
  onRemove,
}: {
  content:
    SecondaryHeroContentOption;
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
  } =
    useSortable({
      id:
        content.key,
      disabled,
    });

  return (
    <article
      ref={
        setNodeRef
      }
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
        title="拖曳內容排序"
        aria-label={
          "拖曳 " +
          content.title
        }
        disabled={
          disabled
        }
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
        {content.image ? (
          <img
            src={
              content.image
            }
            alt={
              content.title
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
          {content.displayCode}
        </small>

        <strong>
          {content.title}
        </strong>

        <span>
          {content.meta}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onRemove
        }
        disabled={
          disabled
        }
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

  headingActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  manageButton: {
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
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





