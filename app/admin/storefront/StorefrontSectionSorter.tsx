"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
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

import type { StorefrontSectionItem } from "../../../lib/storefront-section-repository";
import {
  removeProductFromSectionAction,
  saveSectionSortOrderAction,
  toggleProductVisibilityAction,
} from "./actions";

const statusLabels: Record<
  StorefrontSectionItem["product"]["status"],
  string
> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

export default function StorefrontSectionSorter({
  sectionId,
  initialItems,
}: {
  sectionId: number;
  initialItems: StorefrontSectionItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 6,
      },
    })
  );

  const ids = useMemo(
    () => items.map((item) => item.productId),
    [items]
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const previousItems = items;
    const oldIndex = items.findIndex(
      (item) => item.productId === Number(active.id)
    );
    const newIndex = items.findIndex(
      (item) => item.productId === Number(over.id)
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        sortOrder: index + 1,
      })
    );

    setItems(reordered);
    setMessage("排序儲存中…");

    startTransition(async () => {
      try {
        await saveSectionSortOrderAction(
          sectionId,
          reordered.map((item) => item.productId)
        );
        setMessage("排序已儲存");
      } catch (error) {
        setItems(previousItems);
        setMessage(
          error instanceof Error
            ? `排序失敗：${error.message}`
            : "排序失敗，已恢復原順序"
        );
      }
    });
  }

  return (
    <div>
      <div style={styles.statusBar} aria-live="polite">
        <span>按住 ☰ 拖曳排序</span>
        <strong>{isPending ? "儲存中…" : message}</strong>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHead}>
          <span>排序</span>
          <span>商品</span>
          <span>系列</span>
          <span>商品狀態</span>
          <span>區塊顯示</span>
          <span>操作</span>
        </div>

        <DndContext
          id={`storefront-section-${sectionId}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={ids}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableProductRow
                key={item.id}
                sectionId={sectionId}
                item={item}
                disabled={isPending}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableProductRow({
  sectionId,
  item,
  disabled,
}: {
  sectionId: number;
  item: StorefrontSectionItem;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.productId,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.row,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 2 : 1,
        position: "relative",
      }}
    >
      <div style={styles.orderCell}>
        <button
          type="button"
          aria-label={`拖曳 ${item.product.name}`}
          title="拖曳排序"
          style={styles.dragHandle}
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          ☰
        </button>
        <strong>{item.sortOrder}</strong>
      </div>

      <div style={styles.identity}>
        <small style={styles.code}>
          {item.product.displayCode}
        </small>
        <strong>{item.product.name}</strong>
      </div>

      <span>{item.product.series || "未設定"}</span>

      <Badge ok={item.product.status === "active"}>
        {statusLabels[item.product.status]}
      </Badge>

      <Badge ok={item.isVisible}>
        {item.isVisible ? "顯示" : "隱藏"}
      </Badge>

      <div style={styles.actions}>
        <form action={toggleProductVisibilityAction}>
          <input
            type="hidden"
            name="sectionId"
            value={sectionId}
          />
          <input
            type="hidden"
            name="productId"
            value={item.productId}
          />
          <input
            type="hidden"
            name="nextVisible"
            value={String(!item.isVisible)}
          />
          <button
            type="submit"
            style={styles.secondaryAction}
            disabled={disabled}
          >
            {item.isVisible ? "隱藏" : "顯示"}
          </button>
        </form>

        <form action={removeProductFromSectionAction}>
          <input
            type="hidden"
            name="sectionId"
            value={sectionId}
          />
          <input
            type="hidden"
            name="productId"
            value={item.productId}
          />
          <button
            type="submit"
            style={styles.dangerAction}
            disabled={disabled}
          >
            移除
          </button>
        </form>

        <Link
          href={`/admin/products/${item.product.id}/edit`}
          style={styles.link}
        >
          編輯
        </Link>
      </div>
    </div>
  );
}

function Badge({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <span style={ok ? styles.goodBadge : styles.badBadge}>
      {children}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
    marginBottom: 8,
    color: "#75666a",
    fontSize: 12,
  },
  table: {
    display: "grid",
    gap: 1,
    overflow: "hidden",
    border: "1px solid rgba(140,41,64,.1)",
    borderRadius: 14,
    background: "rgba(140,41,64,.08)",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns:
      "92px minmax(240px,1.7fr) minmax(140px,1fr) 110px 100px 220px",
    gap: 12,
    padding: "11px 14px",
    background: "#f8f3f4",
    color: "#75666a",
    fontSize: 12,
    fontWeight: 800,
  },
  row: {
    display: "grid",
    gridTemplateColumns:
      "92px minmax(240px,1.7fr) minmax(140px,1fr) 110px 100px 220px",
    gap: 12,
    alignItems: "center",
    padding: "13px 14px",
    background: "#fff",
  },
  orderCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  dragHandle: {
    width: 34,
    height: 34,
    border: "1px solid rgba(140,41,64,.18)",
    borderRadius: 9,
    background: "#fffafb",
    color: "#8c2940",
    cursor: "grab",
    touchAction: "none",
    fontSize: 16,
  },
  identity: {
    display: "grid",
    gap: 4,
  },
  code: {
    color: "#8c2940",
    fontWeight: 800,
  },
  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  secondaryAction: {
    border: "1px solid rgba(140,41,64,.22)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#fff",
    color: "#8c2940",
    cursor: "pointer",
  },
  dangerAction: {
    border: "1px solid rgba(180,35,24,.2)",
    borderRadius: 999,
    padding: "7px 11px",
    background: "#fff7f6",
    color: "#b42318",
    cursor: "pointer",
  },
  link: {
    color: "#8c2940",
    fontWeight: 800,
    textDecoration: "none",
  },
  goodBadge: {
    display: "inline-flex",
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 9px",
    background: "#edf8f1",
    color: "#26734d",
    fontSize: 12,
    fontWeight: 800,
  },
  badBadge: {
    display: "inline-flex",
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 9px",
    background: "#fff1f0",
    color: "#b42318",
    fontSize: 12,
    fontWeight: 800,
  },
};
