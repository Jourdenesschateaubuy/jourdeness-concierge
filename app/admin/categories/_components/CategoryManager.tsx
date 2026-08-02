"use client";

import { useState } from "react";
import type {
  CatalogCategory,
  CatalogSeries,
} from "../../../../lib/catalog-repository";

import {
  changeCategoryStatusAction,
  createCategoryAction,
  renameCategoryAction,
} from "../actions";

import styles from "../../admin.module.css";

type CategoryManagerProps = {
  categories: CatalogCategory[];
  series: CatalogSeries[];
};

export default function CategoryManager({
  categories,
  series,
}: CategoryManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const seriesCountByCategory = new Map<number, number>();

  for (const item of series) {
    seriesCountByCategory.set(
      item.categoryId,
      (seriesCountByCategory.get(item.categoryId) ?? 0) + 1
    );
  }

  return (
    <section className={styles.panel}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <strong>{categories.length} 個分類</strong>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(!isCreateOpen)}
        >
          {isCreateOpen ? "取消新增" : "＋ 新增分類"}
        </button>
      </div>

      {isCreateOpen && (
        <form
          action={createCategoryAction}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="輸入分類名稱"
            required
          />

          <button type="submit">
            建立分類
          </button>
        </form>
      )}

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>分類名稱</th>
            <th>系列數量</th>
            <th>狀態</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>#{category.id}</td>

              <td>
                <strong>{category.name}</strong>
              </td>

              <td>
                {seriesCountByCategory.get(category.id) ?? 0}
              </td>

              <td>
                {category.isActive ? "啟用" : "停用"}
              </td>

              <td>{category.sortOrder}</td>

              <td>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <form action={changeCategoryStatusAction}>
                    <input
                      type="hidden"
                      name="id"
                      value={category.id}
                    />

                    <input
                      type="hidden"
                      name="isActive"
                      value={(!category.isActive).toString()}
                    />

                    <button type="submit">
                      {category.isActive ? "停用" : "啟用"}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt(
                        "新的分類名稱",
                        category.name
                      );

                      if (!name) return;

                      const form = new FormData();

                      form.append(
                        "id",
                        String(category.id)
                      );

                      form.append("name", name);

                      renameCategoryAction(form);
                    }}
                  >
                    改名
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}