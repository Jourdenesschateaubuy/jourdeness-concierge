"use client";

import { useState } from "react";

import type {
  CatalogCategory,
  CatalogSeries,
} from "../../../../lib/catalog-repository";

type Props = {
  catalogCategories: CatalogCategory[];
  catalogSeries: CatalogSeries[];
  initialPrimaryCategory?: string;
  initialCategoryIds?: number[];
  initialSeries?: string;
  mirrorPrimaryToCategory?: boolean;
};

export default function ProductCatalogFields({
  catalogCategories,
  catalogSeries,
  initialPrimaryCategory = "",
  initialCategoryIds = [],
  initialSeries = "",
  mirrorPrimaryToCategory = false,
}: Props) {
  const fallbackPrimary =
    initialPrimaryCategory.trim() ||
    catalogCategories.find(
      (category) => category.isActive
    )?.name ||
    catalogCategories[0]?.name ||
    "";

  const initialPrimaryId =
    catalogCategories.find(
      (category) =>
        category.name === fallbackPrimary
    )?.id;

  const [primaryCategory, setPrimaryCategory] =
    useState(fallbackPrimary);

  const [
    selectedCategoryIds,
    setSelectedCategoryIds,
  ] = useState<number[]>(() => {
    const ids = new Set(
      initialCategoryIds.filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0
      )
    );

    if (initialPrimaryId) {
      ids.add(initialPrimaryId);
    }

    return Array.from(ids);
  });

  const [series, setSeries] =
    useState(initialSeries);

  const primaryCategoryRecord =
    catalogCategories.find(
      (category) =>
        category.name === primaryCategory
    );

  const primaryCategoryId =
    primaryCategoryRecord?.id;

  const seriesOptions =
    catalogSeries.filter(
      (item) =>
        item.categoryId === primaryCategoryId &&
        (
          item.isActive ||
          item.name === series
        )
    );

  const hasCurrentSeries =
    seriesOptions.some(
      (item) => item.name === series
    );

  function changePrimary(
    nextPrimary: string
  ) {
    const nextCategory =
      catalogCategories.find(
        (category) =>
          category.name === nextPrimary
      );

    setPrimaryCategory(nextPrimary);

    if (nextCategory) {
      setSelectedCategoryIds(
        (current) => {
          const next = new Set(current);
          next.add(nextCategory.id);
          return Array.from(next);
        }
      );
    }

    setSeries((current) => {
      if (!current || !nextCategory) {
        return "";
      }

      const stillValid =
        catalogSeries.some(
          (item) =>
            item.categoryId ===
              nextCategory.id &&
            item.name === current
        );

      return stillValid
        ? current
        : "";
    });
  }

  function toggleCategory(
    categoryId: number,
    checked: boolean
  ) {
    if (
      categoryId === primaryCategoryId
    ) {
      return;
    }

    setSelectedCategoryIds(
      (current) => {
        const next = new Set(current);

        if (checked) {
          next.add(categoryId);
        } else {
          next.delete(categoryId);
        }

        return Array.from(next);
      }
    );
  }

  return (
    <>
      {mirrorPrimaryToCategory ? (
        <input
          type="hidden"
          name="category"
          value={primaryCategory}
        />
      ) : null}

      {primaryCategoryId ? (
        <input
          type="hidden"
          name="catalogCategoryIds"
          value={primaryCategoryId}
        />
      ) : null}

      <label>
        <span>主要分類 *</span>

        <select
          name="storefrontCategory"
          required
          value={primaryCategory}
          onChange={(event) =>
            changePrimary(
              event.target.value
            )
          }
        >
          {catalogCategories.map(
            (category) => (
              <option
                key={category.id}
                value={category.name}
                disabled={
                  !category.isActive &&
                  category.name !==
                    primaryCategory
                }
              >
                {category.name}
                {!category.isActive
                  ? "（停用）"
                  : ""}
              </option>
            )
          )}
        </select>
      </label>

      <div
        style={{
          gridColumn: "1 / -1",
          display: "grid",
          gap: 9,
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 3,
          }}
        >
          <strong
            style={{
              fontSize: 13,
            }}
          >
            前台顯示分類（可複選）
          </strong>

          <small
            style={{
              color: "#78666a",
              lineHeight: 1.5,
            }}
          >
            同一商品可出現在多個分類；主要分類會自動保留，不能取消。
          </small>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 8,
          }}
        >
          {catalogCategories.map(
            (category) => {
              const isPrimary =
                category.id ===
                primaryCategoryId;

              const checked =
                isPrimary ||
                selectedCategoryIds.includes(
                  category.id
                );

              const disabled =
                isPrimary ||
                (
                  !category.isActive &&
                  !checked
                );

              return (
                <label
                  key={category.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 42,
                    padding: "9px 11px",
                    border:
                      "1px solid #eadbd8",
                    borderRadius: 12,
                    background: checked
                      ? "#fbf1f2"
                      : "#fff",
                    cursor: disabled
                      ? "default"
                      : "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="catalogCategoryIds"
                    value={category.id}
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) =>
                      toggleCategory(
                        category.id,
                        event.target.checked
                      )
                    }
                    style={{
                      width: 17,
                      height: 17,
                      margin: 0,
                    }}
                  />

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {category.name}
                    {isPrimary
                      ? "（主要）"
                      : !category.isActive
                        ? "（停用）"
                        : ""}
                  </span>
                </label>
              );
            }
          )}
        </div>
      </div>

      <label>
        <span>商品系列</span>

        <select
          name="series"
          value={series}
          onChange={(event) =>
            setSeries(
              event.target.value
            )
          }
        >
          <option value="">
            未指定系列
          </option>

          {series &&
          !hasCurrentSeries ? (
            <option value={series}>
              {series}（舊資料）
            </option>
          ) : null}

          {seriesOptions.map(
            (item) => (
              <option
                key={item.id}
                value={item.name}
              >
                {item.name}
                {!item.isActive
                  ? "（停用）"
                  : ""}
              </option>
            )
          )}
        </select>

        <small
          style={{
            marginTop: 4,
            color: "#78666a",
            lineHeight: 1.45,
          }}
        >
          只顯示目前「主要分類」底下的系列。
        </small>
      </label>
    </>
  );
}
