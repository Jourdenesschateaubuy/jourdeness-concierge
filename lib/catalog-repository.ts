import { dbQuery } from "./db";

export type CatalogCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogSeries = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

type CategoryRow = {
  id: number | string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type SeriesRow = {
  id: number | string;
  category_id: number | string;
  category_name: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export async function getCatalogCategories() {
  const result = await dbQuery<CategoryRow>(`
    SELECT id, name, sort_order, is_active
    FROM catalog_categories
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, id ASC
  `);

  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function getCatalogSeries() {
  const result = await dbQuery<SeriesRow>(`
    SELECT
      s.id,
      s.category_id,
      c.name AS category_name,
      s.name,
      s.sort_order,
      s.is_active
    FROM catalog_series AS s
    JOIN catalog_categories AS c
      ON c.id = s.category_id
    WHERE s.is_active = TRUE
      AND c.is_active = TRUE
    ORDER BY c.sort_order ASC, c.id ASC, s.sort_order ASC, s.id ASC
  `);

  return result.rows.map((row) => ({
    id: Number(row.id),
    categoryId: Number(row.category_id),
    categoryName: row.category_name,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function createCatalogSeries(
  categoryId: number,
  name: string
) {
  const cleanName = name.trim();

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("請選擇所屬分類");
  }

  if (!cleanName) {
    throw new Error("系列名稱不能空白");
  }

  const result = await dbQuery<SeriesRow>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
        FROM catalog_series
        WHERE category_id = $1
      ),
      inserted AS (
        INSERT INTO catalog_series (
          category_id,
          name,
          sort_order,
          is_active,
          updated_at
        )
        SELECT
          $1,
          $2,
          next_sort.value,
          TRUE,
          NOW()
        FROM next_sort
        RETURNING
          id,
          category_id,
          name,
          sort_order,
          is_active
      )
      SELECT
        inserted.id,
        inserted.category_id,
        category.name AS category_name,
        inserted.name,
        inserted.sort_order,
        inserted.is_active
      FROM inserted
      JOIN catalog_categories AS category
        ON category.id = inserted.category_id
    `,
    [categoryId, cleanName]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("系列建立失敗");
  }

  return {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    categoryName: row.category_name,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}
