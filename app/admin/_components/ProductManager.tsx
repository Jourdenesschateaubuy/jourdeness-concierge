"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveProductSortOrderAction } from "../products/actions";
import type {
  DatabaseProduct,
  ProductStatus,
} from "../../../lib/product-repository";
import styles from "../admin.module.css";

type AdminProduct = DatabaseProduct & {
  isCombo: boolean;
};

type SortableProductRowProps = {
  product: AdminProduct;
  index: number;
  dragDisabled: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("zh-TW");
}

const statusLabel: Record<ProductStatus, string> = {
  active: "上架中",
  inactive: "下架",
  coming_soon: "新品預告",
  sold_out: "售罄",
};

function SortableProductRow({
  product,
  index,
  dragDisabled,
}: SortableProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    disabled: dragDisabled,
  });

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={rowStyle}
      className={isDragging ? styles.draggingRow : undefined}
    >
      <td className={styles.idCell}>#{product.id}</td>

      <td>
        <div className={styles.productCell}>
          <div className={styles.thumb}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div>
            <strong>{product.cardName ?? product.name}</strong>
            <small>{product.spec ?? product.description}</small>
          </div>
        </div>
      </td>

      <td>{product.category}</td>
      <td>{product.series}</td>

      <td>
        <div className={styles.priceCell}>
          {product.originalPrice && <small>{product.originalPrice}</small>}
          <strong>{product.price}</strong>
        </div>
      </td>

      <td>
        {product.isCombo ? (
          <span className={styles.comboBadge}>組合優惠</span>
        ) : (
          <span className={styles.muted}>—</span>
        )}
      </td>

      <td>
        <span
          className={
            product.status === "active"
              ? styles.activeBadge
              : product.status === "coming_soon"
                ? styles.comingSoonBadge
                : styles.statusBadge
          }
        >
          {statusLabel[product.status]}
        </span>
      </td>

      <td>
        <div className={styles.sortCell}>
          <button
            type="button"
            className={
              dragDisabled
                ? styles.dragHandleDisabled
                : styles.dragHandle
            }
            disabled={dragDisabled}
            aria-label={`拖曳調整 ${product.name} 的排序`}
            title={dragDisabled ? "清除搜尋與篩選後才能拖曳排序" : "拖曳排序"}
            {...attributes}
            {...listeners}
          >
            ☰
          </button>

          <span>{index + 1}</span>
        </div>
      </td>
    </tr>
  );
}

export default function ProductManager({
  products,
}: {
  products: AdminProduct[];
}) {
  const router = useRouter();

  const [orderedProducts, setOrderedProducts] =
    useState<AdminProduct[]>(products);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [comboOnly, setComboOnly] = useState(false);
  const [isSavingSort, setIsSavingSort] = useState(false);
  const [sortError, setSortError] = useState("");

  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(orderedProducts.map((product) => product.category))
      ).sort((a, b) => a.localeCompare(b, "zh-TW")),
    [orderedProducts]
  );

  const filteredProducts = useMemo(() => {
    const keyword = normalize(query);

    return orderedProducts.filter((product) => {
      if (category !== "全部" && product.category !== category) return false;
      if (status !== "全部" && product.status !== status) return false;
      if (comboOnly && !product.isCombo) return false;

      if (!keyword) return true;

      const haystack = normalize(
        [
          product.id.toString(),
          product.name,
          product.cardName ?? "",
          product.category,
          product.series,
          product.spec ?? "",
          product.price,
          product.status,
        ].join(" ")
      );

      return haystack.includes(keyword);
    });
  }, [category, comboOnly, orderedProducts, query, status]);

  const hasActiveFilter =
    query.trim() !== "" ||
    category !== "全部" ||
    status !== "全部" ||
    comboOnly;

  const dragDisabled = hasActiveFilter || isSavingSort;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (dragDisabled || !over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedProducts.findIndex(
      (product) => product.id === active.id
    );

    const newIndex = orderedProducts.findIndex(
      (product) => product.id === over.id
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previousProducts = orderedProducts;

    const reorderedProducts = arrayMove(
      orderedProducts,
      oldIndex,
      newIndex
    ).map((product, index) => ({
      ...product,
      sortOrder: index + 1,
    }));

    setOrderedProducts(reorderedProducts);
    setSortError("");
    setIsSavingSort(true);

    try {
      await saveProductSortOrderAction(
        reorderedProducts.map((product, index) => ({
          id: product.id,
          sortOrder: index + 1,
        }))
      );

      router.refresh();
    } catch (error) {
      console.error("儲存商品排序失敗：", error);
      setOrderedProducts(previousProducts);
      setSortError("排序儲存失敗，已恢復原本順序，請再試一次。");
    } finally {
      setIsSavingSort(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋商品</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="商品名稱、系列、ID…"
          />
        </label>

        <label className={styles.selectBox}>
          <span>分類</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="全部">全部分類</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.selectBox}>
          <span>狀態</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="全部">全部狀態</option>
            <option value="active">上架中</option>
            <option value="inactive">下架</option>
            <option value="coming_soon">新品預告</option>
            <option value="sold_out">售罄</option>
          </select>
        </label>

        <label className={styles.toggleBox}>
          <input
            type="checkbox"
            checked={comboOnly}
            onChange={(event) => setComboOnly(event.target.checked)}
          />
          <span>只看組合商品</span>
        </label>
      </div>

      <div className={styles.resultBar}>
        <strong>{filteredProducts.length}</strong>
        <span> / {orderedProducts.length} 筆商品</span>
        <span style={{ marginLeft: 10 }}>來源：Neon PostgreSQL</span>

        {isSavingSort && (
          <span className={styles.sortSaving}>正在儲存排序…</span>
        )}
      </div>

      {hasActiveFilter && (
        <div className={styles.sortHint}>
          清除搜尋與所有篩選條件後，即可拖曳調整商品排序。
        </div>
      )}

      {sortError && (
        <div className={styles.sortError}>
          {sortError}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => void handleDragEnd(event)}
      >
        <div className={styles.tableWrap}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>商品</th>
                <th>分類</th>
                <th>系列</th>
                <th>價格</th>
                <th>優惠</th>
                <th>狀態</th>
                <th>排序</th>
              </tr>
            </thead>

            <SortableContext
              items={filteredProducts.map((product) => product.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {filteredProducts.map((product, index) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    index={index}
                    dragDisabled={dragDisabled}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>

          {filteredProducts.length === 0 && (
            <div className={styles.emptyState}>
              <strong>找不到符合條件的商品</strong>
              <p>換一個名稱或清除篩選條件再試一次。</p>
            </div>
          )}
        </div>
      </DndContext>
    </section>
  );
}