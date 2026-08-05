"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  CatalogCategory,
  CatalogSeries,
} from "../../../../lib/catalog-repository";
import {
  changeCategoryStatusAction,
  changeSeriesStatusAction,
  createCategoryAction,
  createSeriesAction,
  deleteCategoryAction,
  deleteSeriesAction,
  renameCategoryAction,
  renameSeriesAction,
  saveCategoryOrderAction,
  saveSeriesOrderAction,
} from "../actions";
import styles from "./category-manager.module.css";

type Props = {
  categories: CatalogCategory[];
  series: CatalogSeries[];
};

function orderLabel(index: number) {
  return String(index + 1).padStart(2, "0");
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function CategoryManager({ categories, series }: Props) {
  const router = useRouter();
  const [localCategories, setLocalCategories] = useState(categories);
  const [localSeries, setLocalSeries] = useState(series);
  const [expandedId, setExpandedId] = useState<number | null>(
    categories[0]?.id ?? null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSeriesName, setNewSeriesName] = useState("");
  const [dragCategoryId, setDragCategoryId] = useState<number | null>(null);
  const [dragSeriesId, setDragSeriesId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    setLocalSeries(series);
  }, [series]);

  const seriesByCategory = useMemo(() => {
    const map = new Map<number, CatalogSeries[]>();
    for (const item of localSeries) {
      const list = map.get(item.categoryId) ?? [];
      list.push(item);
      map.set(item.categoryId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    }
    return map;
  }, [localSeries]);

  function run(task: () => Promise<unknown>, success: string) {
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        await task();
        setMessage(success);
        router.refresh();
      } catch (taskError) {
        setError(taskError instanceof Error ? taskError.message : "操作失敗");
      }
    });
  }

  function reorderCategories(fromId: number, toId: number) {
    const from = localCategories.findIndex((item) => item.id === fromId);
    const to = localCategories.findIndex((item) => item.id === toId);
    if (from < 0 || to < 0 || from === to) return;

    const next = moveItem(localCategories, from, to).map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
    setLocalCategories(next);
    run(
      () =>
        saveCategoryOrderAction(
          next.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
        ),
      "分類順序已儲存"
    );
  }

  function reorderSeries(categoryId: number, fromId: number, toId: number) {
    const categorySeries = seriesByCategory.get(categoryId) ?? [];
    const from = categorySeries.findIndex((item) => item.id === fromId);
    const to = categorySeries.findIndex((item) => item.id === toId);
    if (from < 0 || to < 0 || from === to) return;

    const reordered = moveItem(categorySeries, from, to).map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
    const replacement = new Map(reordered.map((item) => [item.id, item]));
    setLocalSeries((current) =>
      current.map((item) => replacement.get(item.id) ?? item)
    );
    run(
      () =>
        saveSeriesOrderAction(
          reordered.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))
        ),
      "細項順序已儲存"
    );
  }

  function createCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const form = new FormData();
    form.set("name", name);
    run(async () => {
      await createCategoryAction(form);
      setNewCategoryName("");
    }, "分類已建立");
  }

  function createSeries(categoryId: number) {
    const name = newSeriesName.trim();
    if (!name) return;
    const form = new FormData();
    form.set("categoryId", String(categoryId));
    form.set("name", name);
    run(async () => {
      await createSeriesAction(form);
      setNewSeriesName("");
    }, "細項已建立");
  }

  return (
    <section className={styles.manager}>
      <div className={styles.toolbar}>
        <div>
          <span>MAIN CATEGORIES</span>
          <h2>{localCategories.length} 個主分類</h2>
          <p>拖曳卡片即可調整前台漢堡選單順序。</p>
        </div>

        <div className={styles.createRow}>
          <input
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="新增主分類名稱"
            disabled={isPending}
          />
          <button type="button" onClick={createCategory} disabled={isPending}>
            ＋ 新增分類
          </button>
        </div>
      </div>

      {message ? <p className={styles.success}>✓ {message}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.categoryList}>
        {localCategories.map((category, categoryIndex) => {
          const children = seriesByCategory.get(category.id) ?? [];
          const expanded = expandedId === category.id;

          return (
            <article
              key={category.id}
              className={`${styles.categoryCard} ${
                category.isActive ? "" : styles.inactive
              }`}
              draggable={!isPending}
              onDragStart={() => setDragCategoryId(category.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragCategoryId) reorderCategories(dragCategoryId, category.id);
                setDragCategoryId(null);
              }}
            >
              <div className={styles.categoryHead}>
                <button
                  type="button"
                  className={styles.dragHandle}
                  title="拖曳排序"
                  aria-label="拖曳排序"
                >
                  ⋮⋮
                </button>

                <span className={styles.order}>{orderLabel(categoryIndex)}</span>

                <button
                  type="button"
                  className={styles.categoryName}
                  onClick={() => setExpandedId(expanded ? null : category.id)}
                >
                  <strong>{category.name}</strong>
                  <small>
                    {children.length} 個細項・{category.productCount ?? 0} 個商品
                  </small>
                </button>

                <span
                  className={`${styles.status} ${
                    category.isActive ? styles.active : ""
                  }`}
                >
                  {category.isActive ? "啟用中" : "已停用"}
                </span>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt("新的分類名稱", category.name);
                      if (!name?.trim()) return;
                      const form = new FormData();
                      form.set("id", String(category.id));
                      form.set("name", name);
                      run(() => renameCategoryAction(form), "分類名稱已更新");
                    }}
                  >
                    改名
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const form = new FormData();
                      form.set("id", String(category.id));
                      form.set("isActive", String(!category.isActive));
                      run(
                        () => changeCategoryStatusAction(form),
                        category.isActive ? "分類已停用" : "分類已啟用"
                      );
                    }}
                  >
                    {category.isActive ? "停用" : "啟用"}
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => {
                      if (
                        !window.confirm(
                          `確定刪除「${category.name}」？\n有商品或細項時系統會阻止刪除。`
                        )
                      )
                        return;
                      const form = new FormData();
                      form.set("id", String(category.id));
                      run(() => deleteCategoryAction(form), "分類已刪除");
                    }}
                  >
                    刪除
                  </button>
                  <button
                    type="button"
                    className={styles.expandButton}
                    onClick={() => setExpandedId(expanded ? null : category.id)}
                  >
                    {expanded ? "收合" : "細項"}
                  </button>
                </div>
              </div>

              {expanded && (
                <div className={styles.seriesPanel}>
                  <div className={styles.seriesTitle}>
                    <div>
                      <strong>{category.name}・分類細項</strong>
                      <span>可新增、改名、停用、刪除及拖曳排序</span>
                    </div>
                    <div className={styles.createRow}>
                      <input
                        value={newSeriesName}
                        onChange={(event) => setNewSeriesName(event.target.value)}
                        placeholder="新增細項，例如：龍血系列"
                      />
                      <button type="button" onClick={() => createSeries(category.id)}>
                        ＋ 新增細項
                      </button>
                    </div>
                  </div>

                  <div className={styles.seriesList}>
                    <div className={`${styles.seriesRow} ${styles.allRow}`}>
                      <span className={styles.order}>01</span>
                      <strong>全部</strong>
                      <small>固定入口，不需要另外建立</small>
                    </div>

                    {children.map((item, index) => (
                      <div
                        key={item.id}
                        className={`${styles.seriesRow} ${
                          item.isActive ? "" : styles.inactive
                        }`}
                        draggable={!isPending}
                        onDragStart={() => setDragSeriesId(item.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (dragSeriesId) {
                            reorderSeries(category.id, dragSeriesId, item.id);
                          }
                          setDragSeriesId(null);
                        }}
                      >
                        <button type="button" className={styles.dragHandle}>⋮⋮</button>
                        <span className={styles.order}>{orderLabel(index + 1)}</span>
                        <strong>
                          <span style={{ color: "#8b2d40", marginRight: 8 }}>
                            {item.displayCode}
                          </span>
                          {item.name}
                        </strong>
                        <small>{item.productCount ?? 0} 個商品</small>
                        <span
                          className={`${styles.status} ${
                            item.isActive ? styles.active : ""
                          }`}
                        >
                          {item.isActive ? "啟用" : "停用"}
                        </span>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            onClick={() => {
                              const name = window.prompt(
                                "新的細項名稱",
                                item.name
                              );
                              if (!name?.trim()) return;
                              const form = new FormData();
                              form.set("id", String(item.id));
                              form.set("name", name);
                              run(() => renameSeriesAction(form), "細項名稱已更新");
                            }}
                          >
                            改名
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const form = new FormData();
                              form.set("id", String(item.id));
                              form.set("isActive", String(!item.isActive));
                              run(
                                () => changeSeriesStatusAction(form),
                                item.isActive ? "細項已停用" : "細項已啟用"
                              );
                            }}
                          >
                            {item.isActive ? "停用" : "啟用"}
                          </button>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `確定刪除「${item.name}」？\n仍有商品時系統會阻止刪除。`
                                )
                              )
                                return;
                              const form = new FormData();
                              form.set("id", String(item.id));
                              run(() => deleteSeriesAction(form), "細項已刪除");
                            }}
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className={styles.helpBox}>
        <strong>刪除安全規則</strong>
        <span>分類內仍有商品或細項時不能刪除；細項內仍有商品時也不能刪除。可先停用，再逐步整理商品。</span>
      </div>
    </section>
  );
}
