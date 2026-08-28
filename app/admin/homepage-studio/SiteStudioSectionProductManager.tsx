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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import type {
  SiteStudioSection,
  SiteStudioSectionItem,
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

export type SectionBundleOfferOption = {
  id: number;
  name: string;
  status: string;
  image: string;
  priceText: string;
  category: string;
  series: string;
};

type ContentTypeFilter =
  | "all"
  | "product"
  | "bundle_offer";

type SectionContentOption = {
  key: string;
  targetType:
    | "product"
    | "bundle_offer";
  targetId: number;
  displayCode: string;
  title: string;
  image: string;
  meta: string;
  status: string;
};

type Props = {
  section: SiteStudioSection;
  products: SectionProductOption[];
  bundleOffers:
    SectionBundleOfferOption[];
  onSaved?: (
    section: SiteStudioSection
  ) => void;
};

function itemKey(
  item: SiteStudioSectionItem
) {
  return (
    item.targetType +
    ":" +
    item.targetId
  );
}

function initialItems(
  section: SiteStudioSection
): SiteStudioSectionItem[] {
  if (
    Array.isArray(section.items)
  ) {
    return section.items;
  }

  return (
    section.productIds ?? []
  ).map(
    (targetId) => ({
      targetType:
        "product" as const,
      targetId,
    })
  );
}

export default function SiteStudioSectionProductManager({
  section,
  products,
  bundleOffers,
  onSaved,
}: Props) {
  const [items, setItems] =
    useState<
      SiteStudioSectionItem[]
    >(
      initialItems(section)
    );

  const [
    selectedContentKey,
    setSelectedContentKey,
  ] = useState("");

  const [
    contentType,
    setContentType,
  ] =
    useState<ContentTypeFilter>(
      "all"
    );

  const [message, setMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    setItems(
      initialItems(section)
    );
  }, [
    section.items,
    section.productIds,
  ]);

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

  const catalogOptions =
    useMemo<
      SectionContentOption[]
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
              product.category,
            status:
              product.status,
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
            status:
              offer.status,
          })
        ),
      ],
      [
        products,
        bundleOffers,
      ]
    );

  const optionMap =
    useMemo(
      () =>
        new Map(
          catalogOptions.map(
            (option) => [
              option.key,
              option,
            ]
          )
        ),
      [catalogOptions]
    );

  const selectedKeys =
    useMemo(
      () =>
        new Set(
          items.map(itemKey)
        ),
      [items]
    );

  const selectedContent =
    useMemo(
      () =>
        items.map((item) => {
          const key =
            itemKey(item);

          return (
            optionMap.get(key) ?? {
              key,
              targetType:
                item.targetType,
              targetId:
                item.targetId,
              displayCode:
                item.targetType ===
                "bundle_offer"
                  ? "Bundle #" +
                    item.targetId
                  : "Product #" +
                    item.targetId,
              title:
                "找不到目前內容資料",
              image: "",
              meta:
                "可直接移除此項目",
              status:
                "inactive",
            }
          );
        }),
      [
        items,
        optionMap,
      ]
    );

  const availableContent =
    useMemo(
      () =>
        catalogOptions
          .filter(
            (option) =>
              !selectedKeys.has(
                option.key
              )
          )
          .filter(
            (option) =>
              contentType === "all"
                ? true
                : option.targetType ===
                  contentType
          ),
      [
        catalogOptions,
        selectedKeys,
        contentType,
      ]
    );

  useEffect(() => {
    if (
      selectedContentKey &&
      !availableContent.some(
        (option) =>
          option.key ===
          selectedContentKey
      )
    ) {
      setSelectedContentKey(
        ""
      );
    }
  }, [
    selectedContentKey,
    availableContent,
  ]);

  async function save(
    nextItems:
      SiteStudioSectionItem[]
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

    const nextSection:
      SiteStudioSection = {
        ...section,
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
          body: JSON.stringify({
            kind: "section",
            section:
              nextSection,
          }),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "首頁內容編排儲存失敗"
      );
    }

    const savedSection =
      Array.isArray(
        result?.config?.sections
      )
        ? result.config.sections.find(
            (
              candidate:
                SiteStudioSection
            ) =>
              candidate.key ===
              section.key
          )
        : null;

    onSaved?.(
      savedSection ??
        nextSection
    );

    window.dispatchEvent(
      new CustomEvent(
        "jourdeness-homepage-draft-saved"
      )
    );
  }

  function persist(
    nextItems:
      SiteStudioSectionItem[],
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
      optionMap.get(
        selectedContentKey
      );

    if (
      !option ||
      selectedKeys.has(
        option.key
      )
    ) {
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
      "首頁內容已移除"
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

    const keys =
      items.map(itemKey);

    const oldIndex =
      keys.indexOf(
        String(active.id)
      );

    const newIndex =
      keys.indexOf(
        String(over.id)
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
      "首頁內容排序已儲存"
    );
  }

  return (
    <section
      style={styles.wrapper}
    >
      <div style={styles.heading}>
        <div>
          <strong>
            編排首頁內容
          </strong>

          <p>
            一般商品與組合優惠可以放在同一個區塊，
            並拖曳調整顯示順序。
          </p>
        </div>

        <span
          style={styles.countBadge}
        >
          {items.length}
          {" "}個內容
        </span>
      </div>

      <div style={styles.addRow}>
        <select
          value={contentType}
          onChange={(event) =>
            setContentType(
              event.target
                .value as
                ContentTypeFilter
            )
          }
          disabled={isPending}
          style={
            styles.typeSelect
          }
        >
          <option value="all">
            類型：全部
          </option>

          <option value="product">
            類型：一般商品
          </option>

          {bundleOffers.length >
          0 ? (
            <option
              value="bundle_offer"
            >
              類型：組合優惠
            </option>
          ) : null}
        </select>

        <select
          value={
            selectedContentKey
          }
          onChange={(event) =>
            setSelectedContentKey(
              event.target.value
            )
          }
          disabled={isPending}
          style={styles.select}
        >
          <option value="">
            選擇要加入的內容
          </option>

          {availableContent.map(
            (option) => (
              <option
                key={option.key}
                value={option.key}
              >
                {option.targetType ===
                "bundle_offer"
                  ? "[組合優惠] "
                  : "[一般商品] "}
                {option.displayCode}
                {"｜"}
                {option.title}
                {option.meta
                  ? "｜" +
                    option.meta
                  : ""}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={addContent}
          disabled={
            isPending ||
            !selectedContentKey
          }
          style={
            styles.addButton
          }
        >
          ＋ 加入
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

      {selectedContent.length ===
      0 ? (
        <div style={styles.empty}>
          此區塊目前沒有內容。
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
            items={items.map(
              itemKey
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div
              style={
                styles.productList
              }
            >
              {selectedContent.map(
                (content) => (
                  <SortableContentRow
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
    </section>
  );
}

function SortableContentRow({
  content,
  disabled,
  onRemove,
}: {
  content:
    SectionContentOption;
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
    id: content.key,
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
        style={
          styles.dragHandle
        }
        disabled={disabled}
        title="拖曳排序"
        {...attributes}
        {...listeners}
      >
        ☰
      </button>

      <div
        style={styles.imageBox}
      >
        {content.image ? (
          <img
            src={content.image}
            alt={content.title}
            style={styles.image}
          />
        ) : (
          <span>無圖片</span>
        )}
      </div>

      <div style={styles.info}>
        <div
          style={
            styles.identityRow
          }
        >
          <span
            style={
              content.targetType ===
              "bundle_offer"
                ? styles.bundleBadge
                : styles.productBadge
            }
          >
            {content.targetType ===
            "bundle_offer"
              ? "組合優惠"
              : "一般商品"}
          </span>

          <small>
            {
              content.displayCode
            }
          </small>
        </div>

        <strong>
          {content.title}
        </strong>

        <span>
          {content.meta}
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
    display: "grid",
    gridTemplateColumns:
      "160px minmax(0,1fr) auto",
    gap: 8,
  },

  typeSelect: {
    minWidth: 0,
    padding: "9px 11px",
    border:
      "1px solid rgba(140,41,64,.18)",
    borderRadius: 10,
    background: "#fff",
  },

  select: {
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
    color: "#9b8f8b",
    fontSize: 10,
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },

  info: {
    display: "grid",
    gap: 4,
    minWidth: 0,
  },

  identityRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  productBadge: {
    padding: "3px 7px",
    borderRadius: 999,
    background: "#eef3fb",
    color: "#365b8c",
    fontSize: 10,
    fontWeight: 800,
  },

  bundleBadge: {
    padding: "3px 7px",
    borderRadius: 999,
    background: "#fff0e4",
    color: "#9a5b27",
    fontSize: 10,
    fontWeight: 800,
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
