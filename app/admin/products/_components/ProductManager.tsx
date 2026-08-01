"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
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
  DatabaseProduct,
  ProductStatus,
} from "../../../../lib/product-repository";

import {
  changeProductStatusAction,
  deleteProductAction,
  saveProductSortOrderAction,
} from "../actions";

import styles from "../../admin.module.css";
import actionStyles from "./product-manager-actions.module.css";

type AdminProduct = DatabaseProduct & {
  isCombo: boolean;
};

type SortableProductRowProps = {
  product: AdminProduct;
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

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    position: "relative",
    zIndex: isDragging ? 2 : undefined,
  };

  return (
    <tr ref={setNodeRef} style={rowStyle}>
      <td>
        <button
          type="button"
          aria-label={`拖曳調整 ${product.name} 的排序`}
          title={dragDisabled ? "有使用搜尋或篩選時不能拖曳排序" : "拖曳調整排序"}
          disabled={dragDisabled}
          {...attributes}
          {...listeners}
          style={{
            cursor: dragDisabled ? "not-allowed" : "grab",
            border: "1px solid #d8d8d8",
            borderRadius: "6px",
            background: dragDisabled ? "#f3f3f3" : "#ffffff",
            color: dragDisabled ? "#999999" : "#333333",
            padding: "6px 9px",
            lineHeight: 1,
            touchAction: "none",
          }}
        >
          ☰
        </button>
      </td>

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

            <small>
              {product.sku ? `貨號 ${product.sku} · ` : ""}
              {product.spec ?? product.description}
            </small>
          </div>
        </div>
      </td>

      <td>{product.category}</td>

      <td>{product.series}</td>

      <td>
        <div className={styles.priceCell}>
          {product.originalPrice && (
            <small>{product.originalPrice}</small>
          )}

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
        <form action={changeProductStatusAction}>
          <input type="hidden" name="id" value={product.id} />

          <select
            className={actionStyles.statusSelect}
            name="status"
            defaultValue={product.status}
            aria-label={`${product.name} 商品狀態`}
            onChange={(event) => {
              event.currentTarget.form?.requestSubmit();
            }}
          >
            <option value="active">上架中</option>
            <option value="inactive">下架</option>
            <option value="coming_soon">新品預告</option>
            <option value="sold_out">售罄</option>
          </select>

          <noscript>
            <button type="submit">更新</button>
          </noscript>
        </form>
      </td>

      <td>
        <div className={actionStyles.rowActions}>
          <Link href={`/admin/products/${product.id}/edit`}>
            編輯
          </Link>

          <form
            action={deleteProductAction}
            onSubmit={(event) => {
              if (
                !window.confirm(
                  `確定要刪除「${product.name}」嗎？\n\n此操作會刪除資料庫中的商品資料。`
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={product.id} />
            <button type="submit">刪除</button>
          </form>
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

  const [orderedProducts, setOrderedProducts] =
    useState<AdminProduct[]>(products);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [comboOnly, setComboOnly] = useState(false);

  const [sortMessage, setSortMessage] = useState("");
  const [isSavingOrder, startSavingOrder] = useTransition();

  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(orderedProducts.map((product) => product.category))
      ).sort((a, b) => a.localeCompare(b, "zh-TW")),
    [orderedProducts]
  );

  const hasActiveFilter =
    normalize(query) !== "" ||
    category !== "全部" ||
    status !== "全部" ||
    comboOnly;

  const filteredProducts = useMemo(() => {
    const keyword = normalize(query);

    return orderedProducts.filter((product) => {
      if (category !== "全部" && product.category !== category) {
        return false;
      }

      if (status !== "全部" && product.status !== status) {
        return false;
      }

      if (comboOnly && !product.isCombo) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const haystack = normalize(
        [
          product.id.toString(),
          product.sku ?? "",
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
  }, [
    category,
    comboOnly,
    orderedProducts,
    query,
    status,
  ]);

  function clearFilters() {
    setQuery("");
    setCategory("全部");
    setStatus("全部");
    setComboOnly(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      hasActiveFilter ||
      isSavingOrder ||
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex = orderedProducts.findIndex(
      (product) => product.id === Number(active.id)
    );

    const newIndex = orderedProducts.findIndex(
      (product) => product.id === Number(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previousProducts = orderedProducts;
    const nextProducts = arrayMove(
      orderedProducts,
      oldIndex,
      newIndex
    );

    setOrderedProducts(nextProducts);
    setSortMessage("正在儲存排序…");

    const sortItems = nextProducts.map((product, index) => ({
      id: product.id,
      sortOrder: index + 1,
    }));

    startSavingOrder(async () => {
      try {
        await saveProductSortOrderAction(sortItems);
        setSortMessage("排序已儲存");

        window.setTimeout(() => {
        setSortMessage("");
        }, 1800);
      } catch (error) {
        console.error("儲存商品排序失敗：", error);

        setOrderedProducts(previousProducts);
        setSortMessage("排序儲存失敗，已恢復原本順序");

        window.setTimeout(() => {
          setSortMessage("");
        }, 3000);
      }
    });
  }
    return (
    <section className={styles.panel}>
      <div className={actionStyles.topActions}>
        <div>
          <strong>{orderedProducts.length} 筆商品</strong>
          <span>來源：Neon PostgreSQL</span>
        </div>

        <Link href="/admin/products/new">
          ＋ 新增商品
        </Link>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋商品</span>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="商品名稱、貨號、系列、ID…"
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
            onChange={(event) =>
              setComboOnly(event.target.checked)
            }
          />

          <span>只看組合商品</span>
        </label>
      </div>

      <div className={styles.resultBar}>
        <strong>{filteredProducts.length}</strong>
        <span> / {orderedProducts.length} 筆商品</span>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              marginLeft: "12px",
              border: "1px solid #cccccc",
              borderRadius: "6px",
              background: "#ffffff",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            清除篩選
          </button>
        )}

        <span
          style={{
            marginLeft: "auto",
            color: hasActiveFilter ? "#a56a00" : "#666666",
          }}
        >
          {hasActiveFilter
            ? "搜尋或篩選中，暫停拖曳排序"
            : isSavingOrder
              ? "正在儲存排序…"
              : sortMessage || "拖曳 ☰ 可調整商品順序"}
        </span>
      </div>

      <div className={styles.tableWrap}>
      <DndContext
       id="product-sort-dnd"
       sensors={sensors}
       collisionDetection={closestCenter}
       onDragEnd={handleDragEnd}
>
          <SortableContext
            items={filteredProducts.map(
              (product) => product.id
            )}
            strategy={verticalListSortingStrategy}
          >
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>排序</th>
                  <th>ID</th>
                  <th>商品</th>
                  <th>分類</th>
                  <th>系列</th>
                  <th>價格</th>
                  <th>優惠</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    dragDisabled={
                      hasActiveFilter || isSavingOrder
                    }
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <strong>找不到符合條件的商品</strong>
            <p>換一個名稱或清除篩選條件再試一次。</p>
          </div>
        )}
      </div>

      <div className={actionStyles.legend}>
        <span>狀態：</span>

        {Object.entries(statusLabel).map(([key, label]) => (
          <span key={key}>{label}</span>
        ))}
      </div>
    </section>
  );
}
