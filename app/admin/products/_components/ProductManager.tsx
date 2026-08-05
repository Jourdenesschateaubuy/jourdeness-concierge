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
  ProductType,
} from "../../../../lib/product-repository";

import {
  changeProductStatusAction,
  deleteProductAction,
  saveProductSortOrderAction,
} from "../actions";

import styles from "../../admin.module.css";
import actionStyles from "./product-manager-actions.module.css";

type SortableProductRowProps = {
  product: DatabaseProduct;
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

const productTypeLabel: Record<ProductType, string> = {
  standard: "一般商品",
  combo: "組合商品",
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
          title={
            dragDisabled
              ? "有使用搜尋或篩選時不能拖曳排序"
              : "拖曳調整排序"
          }
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

      <td className={styles.idCell}>
        <strong>{product.displayCode}</strong>
        <small style={{ display: "block", color: "#8a8a8a" }}>
          DB #{product.id}
        </small>
      </td>

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
      <td>{product.series || "—"}</td>

      <td>
        <div className={styles.priceCell}>
          {product.originalPrice && <small>{product.originalPrice}</small>}
          <strong>{product.price}</strong>
        </div>
      </td>

      <td>
        {product.productType === "combo" ? (
          <span className={styles.comboBadge}>組合商品</span>
        ) : (
          <span className={styles.muted}>一般商品</span>
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
            {product.productType === "combo" ? "編輯方案" : "編輯"}
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
  products: DatabaseProduct[];
}) {
  const [orderedProducts, setOrderedProducts] =
    useState<DatabaseProduct[]>(products);
  const [activeType, setActiveType] = useState<ProductType>("standard");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [status, setStatus] = useState("全部");
  const [sortMessage, setSortMessage] = useState("");
  const [isSavingOrder, startSavingOrder] = useTransition();

  useEffect(() => {
    setOrderedProducts(products);
  }, [products]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const typeProducts = useMemo(
    () =>
      orderedProducts.filter(
        (product) => product.productType === activeType
      ),
    [activeType, orderedProducts]
  );

  const counts = useMemo(
    () => ({
      standard: orderedProducts.filter(
        (product) => product.productType === "standard"
      ).length,
      combo: orderedProducts.filter(
        (product) => product.productType === "combo"
      ).length,
    }),
    [orderedProducts]
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(typeProducts.map((product) => product.category))
      ).sort((a, b) => a.localeCompare(b, "zh-TW")),
    [typeProducts]
  );

  const hasActiveFilter =
    normalize(query) !== "" ||
    category !== "全部" ||
    status !== "全部";

  const filteredProducts = useMemo(() => {
    const keyword = normalize(query);

    return typeProducts.filter((product) => {
      if (category !== "全部" && product.category !== category) {
        return false;
      }
      if (status !== "全部" && product.status !== status) {
        return false;
      }
      if (!keyword) return true;

      const haystack = normalize(
        [
          product.id.toString(),
          product.displayCode,
          product.sku ?? "",
          product.name,
          product.cardName ?? "",
          product.category,
          product.series,
          product.spec ?? "",
          product.price,
          product.status,
          productTypeLabel[product.productType],
        ].join(" ")
      );

      return haystack.includes(keyword);
    });
  }, [category, query, status, typeProducts]);

  function switchType(nextType: ProductType) {
    setActiveType(nextType);
    setQuery("");
    setCategory("全部");
    setStatus("全部");
  }

  function clearFilters() {
    setQuery("");
    setCategory("全部");
    setStatus("全部");
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

    const currentTypeProducts = orderedProducts.filter(
      (product) => product.productType === activeType
    );
    const oldIndex = currentTypeProducts.findIndex(
      (product) => product.id === Number(active.id)
    );
    const newIndex = currentTypeProducts.findIndex(
      (product) => product.id === Number(over.id)
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const movedTypeProducts = arrayMove(
      currentTypeProducts,
      oldIndex,
      newIndex
    );
    let replacementIndex = 0;
    const previousProducts = orderedProducts;
    const nextProducts = orderedProducts.map((product) => {
      if (product.productType !== activeType) return product;
      const replacement = movedTypeProducts[replacementIndex];
      replacementIndex += 1;
      return replacement;
    });

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
        window.setTimeout(() => setSortMessage(""), 1800);
      } catch (error) {
        console.error("儲存商品排序失敗：", error);
        setOrderedProducts(previousProducts);
        setSortMessage("排序儲存失敗，已恢復原本順序");
        window.setTimeout(() => setSortMessage(""), 3000);
      }
    });
  }

  return (
    <section className={styles.panel}>
      <div className={actionStyles.topActions}>
        <div>
          <strong>{orderedProducts.length} 筆商品</strong>
          <span>內部 DB ID 保留；後台改用 P／C 顯示編號</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/admin/products/new?type=product">
            ＋ 新增一般商品
          </Link>
          <Link href="/admin/products/new?type=combo">
            ＋ 新增組合商品
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {(["standard", "combo"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => switchType(type)}
            style={{
              minHeight: 52,
              borderRadius: 12,
              border:
                activeType === type
                  ? "2px solid #7d2638"
                  : "1px solid #d9c9cc",
              background: activeType === type ? "#fff7f8" : "#fff",
              color: "#5f2330",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {productTypeLabel[type]}　{counts[type]}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <span>搜尋商品</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="商品編號、名稱、貨號、系列、DB ID…"
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
      </div>

      <div className={styles.resultBar}>
        <strong>{filteredProducts.length}</strong>
        <span> / {typeProducts.length} 筆{productTypeLabel[activeType]}</span>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              marginLeft: 12,
              border: "1px solid #cccccc",
              borderRadius: 6,
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
              : sortMessage || `拖曳 ☰ 調整${productTypeLabel[activeType]}順序`}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <DndContext
          id={`product-sort-${activeType}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredProducts.map((product) => product.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>排序</th>
                  <th>商品編號</th>
                  <th>商品</th>
                  <th>分類</th>
                  <th>系列</th>
                  <th>價格</th>
                  <th>類型</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <SortableProductRow
                    key={product.id}
                    product={product}
                    dragDisabled={hasActiveFilter || isSavingOrder}
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
