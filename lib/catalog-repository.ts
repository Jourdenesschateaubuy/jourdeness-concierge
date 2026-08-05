import { dbQuery, withDbClient } from "./db";

export type CatalogCategory = {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  seriesCount?: number;
};

export type CatalogSeries = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
};

type CategoryRow = {
  id: number | string;
  name: string;
  sort_order: number;
  is_active: boolean;
  product_count?: number | string;
  series_count?: number | string;
};

type SeriesRow = {
  id: number | string;
  category_id: number | string;
  category_name: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  product_count?: number | string;
};

function mapCategory(row: CategoryRow): CatalogCategory {
  return {
    id: Number(row.id),
    name: row.name,
    sortOrder: Number(row.sort_order),
    isActive: row.is_active,
    productCount: Number(row.product_count ?? 0),
    seriesCount: Number(row.series_count ?? 0),
  };
}

function mapSeries(row: SeriesRow): CatalogSeries {
  return {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    categoryName: row.category_name,
    name: row.name,
    sortOrder: Number(row.sort_order),
    isActive: row.is_active,
    productCount: Number(row.product_count ?? 0),
  };
}

export async function getCatalogCategories(options?: {
  includeInactive?: boolean;
  includeCounts?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? false;
  const includeCounts = options?.includeCounts ?? false;

  const result = await dbQuery<CategoryRow>(`
    SELECT
      c.id,
      c.name,
      c.sort_order,
      c.is_active,
      ${
        includeCounts
          ? `(SELECT COUNT(*) FROM catalog_series s WHERE s.category_id = c.id)::int AS series_count,
             (SELECT COUNT(*) FROM products p WHERE COALESCE(NULLIF(p.storefront_category, ''), p.category) = c.name)::int AS product_count`
          : `0::int AS series_count,
             0::int AS product_count`
      }
    FROM catalog_categories c
    ${includeInactive ? "" : "WHERE c.is_active = TRUE"}
    ORDER BY c.sort_order ASC, c.id ASC
  `);

  return result.rows.map(mapCategory);
}

export async function getCatalogSeries(options?: {
  includeInactive?: boolean;
  includeCounts?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? false;
  const includeCounts = options?.includeCounts ?? false;

  const result = await dbQuery<SeriesRow>(`
    SELECT
      s.id,
      s.category_id,
      c.name AS category_name,
      s.name,
      s.sort_order,
      s.is_active,
      ${
        includeCounts
          ? `(SELECT COUNT(*) FROM products p
              WHERE p.series = s.name
                AND COALESCE(NULLIF(p.storefront_category, ''), p.category) = c.name)::int AS product_count`
          : `0::int AS product_count`
      }
    FROM catalog_series s
    JOIN catalog_categories c ON c.id = s.category_id
    ${
      includeInactive
        ? ""
        : "WHERE s.is_active = TRUE AND c.is_active = TRUE"
    }
    ORDER BY c.sort_order ASC, c.id ASC, s.sort_order ASC, s.id ASC
  `);

  return result.rows.map(mapSeries);
}

export async function createCatalogCategory(name: string) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("分類名稱不能空白");

  const result = await dbQuery<CategoryRow>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
        FROM catalog_categories
      )
      INSERT INTO catalog_categories (name, sort_order, is_active, updated_at)
      SELECT $1, next_sort.value, TRUE, NOW()
      FROM next_sort
      RETURNING id, name, sort_order, is_active
    `,
    [cleanName]
  );

  if (!result.rows[0]) throw new Error("分類建立失敗");
  return mapCategory(result.rows[0]);
}

export async function updateCatalogCategoryName(id: number, name: string) {
  const cleanName = name.trim();
  if (!Number.isInteger(id) || id <= 0) throw new Error("分類 ID 無效");
  if (!cleanName) throw new Error("分類名稱不能空白");

  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      const current = await client.query<{ name: string }>(
        `SELECT name FROM catalog_categories WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const oldName = current.rows[0]?.name;
      if (!oldName) throw new Error("找不到這筆分類");

      const result = await client.query<CategoryRow>(
        `UPDATE catalog_categories
         SET name = $2, updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, sort_order, is_active`,
        [id, cleanName]
      );

      await client.query(
        `UPDATE products
         SET storefront_category = $2, updated_at = NOW()
         WHERE storefront_category = $1`,
        [oldName, cleanName]
      );

      await client.query("COMMIT");
      return mapCategory(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updateCatalogCategoryStatus(
  id: number,
  isActive: boolean
) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("分類 ID 無效");

  const result = await dbQuery<CategoryRow>(
    `UPDATE catalog_categories
     SET is_active = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, sort_order, is_active`,
    [id, isActive]
  );

  if (!result.rows[0]) throw new Error("找不到這筆分類");
  return mapCategory(result.rows[0]);
}

export async function updateCatalogCategorySortOrders(
  items: Array<{ id: number; sortOrder: number }>
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      for (const item of items) {
        if (!Number.isInteger(item.id) || item.id <= 0) {
          throw new Error("分類排序資料無效");
        }
        await client.query(
          `UPDATE catalog_categories
           SET sort_order = $2, updated_at = NOW()
           WHERE id = $1`,
          [item.id, item.sortOrder]
        );
      }
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function deleteCatalogCategory(id: number) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("分類 ID 無效");

  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      const category = await client.query<{ name: string }>(
        `SELECT name FROM catalog_categories WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const name = category.rows[0]?.name;
      if (!name) throw new Error("找不到這筆分類");

      const seriesCount = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM catalog_series WHERE category_id = $1`,
        [id]
      );
      const productCount = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM products
         WHERE COALESCE(NULLIF(storefront_category, ''), category) = $1`,
        [name]
      );

      if (Number(seriesCount.rows[0]?.count ?? 0) > 0) {
        throw new Error("此分類仍有細項，請先移除或刪除細項");
      }
      if (Number(productCount.rows[0]?.count ?? 0) > 0) {
        throw new Error("此分類仍有商品，請先將商品移到其他分類");
      }

      await client.query(`DELETE FROM catalog_categories WHERE id = $1`, [id]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function createCatalogSeries(categoryId: number, name: string) {
  const cleanName = name.trim();
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("請選擇所屬分類");
  }
  if (!cleanName) throw new Error("細項名稱不能空白");

  const result = await dbQuery<SeriesRow>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
        FROM catalog_series
        WHERE category_id = $1
      ), inserted AS (
        INSERT INTO catalog_series (
          category_id, name, sort_order, is_active, updated_at
        )
        SELECT $1, $2, next_sort.value, TRUE, NOW()
        FROM next_sort
        RETURNING id, category_id, name, sort_order, is_active
      )
      SELECT inserted.id, inserted.category_id, c.name AS category_name,
             inserted.name, inserted.sort_order, inserted.is_active
      FROM inserted
      JOIN catalog_categories c ON c.id = inserted.category_id
    `,
    [categoryId, cleanName]
  );

  if (!result.rows[0]) throw new Error("細項建立失敗");
  return mapSeries(result.rows[0]);
}

export async function updateCatalogSeriesName(id: number, name: string) {
  const cleanName = name.trim();
  if (!Number.isInteger(id) || id <= 0) throw new Error("細項 ID 無效");
  if (!cleanName) throw new Error("細項名稱不能空白");

  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      const current = await client.query<{
        name: string;
        category_id: number;
        category_name: string;
      }>(
        `SELECT s.name, s.category_id, c.name AS category_name
         FROM catalog_series s
         JOIN catalog_categories c ON c.id = s.category_id
         WHERE s.id = $1 FOR UPDATE`,
        [id]
      );
      const row = current.rows[0];
      if (!row) throw new Error("找不到這筆細項");

      const result = await client.query<SeriesRow>(
        `WITH updated AS (
           UPDATE catalog_series
           SET name = $2, updated_at = NOW()
           WHERE id = $1
           RETURNING id, category_id, name, sort_order, is_active
         )
         SELECT updated.id, updated.category_id, c.name AS category_name,
                updated.name, updated.sort_order, updated.is_active
         FROM updated
         JOIN catalog_categories c ON c.id = updated.category_id`,
        [id, cleanName]
      );

      await client.query(
        `UPDATE products
         SET series = $3, updated_at = NOW()
         WHERE series = $2
           AND COALESCE(NULLIF(storefront_category, ''), category) = $1`,
        [row.category_name, row.name, cleanName]
      );

      await client.query("COMMIT");
      return mapSeries(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updateCatalogSeriesStatus(id: number, isActive: boolean) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("細項 ID 無效");

  const result = await dbQuery<SeriesRow>(
    `WITH updated AS (
       UPDATE catalog_series
       SET is_active = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, category_id, name, sort_order, is_active
     )
     SELECT updated.id, updated.category_id, c.name AS category_name,
            updated.name, updated.sort_order, updated.is_active
     FROM updated
     JOIN catalog_categories c ON c.id = updated.category_id`,
    [id, isActive]
  );

  if (!result.rows[0]) throw new Error("找不到這筆細項");
  return mapSeries(result.rows[0]);
}

export async function updateCatalogSeriesSortOrders(
  items: Array<{ id: number; sortOrder: number }>
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      for (const item of items) {
        if (!Number.isInteger(item.id) || item.id <= 0) {
          throw new Error("細項排序資料無效");
        }
        await client.query(
          `UPDATE catalog_series
           SET sort_order = $2, updated_at = NOW()
           WHERE id = $1`,
          [item.id, item.sortOrder]
        );
      }
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function deleteCatalogSeries(id: number) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("細項 ID 無效");

  return withDbClient(async (client) => {
    await client.query("BEGIN");
    try {
      const series = await client.query<{
        name: string;
        category_name: string;
      }>(
        `SELECT s.name, c.name AS category_name
         FROM catalog_series s
         JOIN catalog_categories c ON c.id = s.category_id
         WHERE s.id = $1 FOR UPDATE`,
        [id]
      );
      const row = series.rows[0];
      if (!row) throw new Error("找不到這筆細項");

      const productCount = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM products
         WHERE series = $1
           AND COALESCE(NULLIF(storefront_category, ''), category) = $2`,
        [row.name, row.category_name]
      );

      if (Number(productCount.rows[0]?.count ?? 0) > 0) {
        throw new Error("此細項仍有商品，請先將商品移到其他細項");
      }

      await client.query(`DELETE FROM catalog_series WHERE id = $1`, [id]);
      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}


// 相容 Website Studio 舊 API：移動細項到另一個主分類。
export async function updateCatalogSeriesCategory(
  id: number,
  categoryId: number
) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("細項 ID 無效");
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("分類 ID 無效");
  }

  const result = await dbQuery<SeriesRow>(
    `WITH next_sort AS (
       SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
       FROM catalog_series
       WHERE category_id = $2
     ), updated AS (
       UPDATE catalog_series
       SET category_id = $2,
           sort_order = next_sort.value,
           updated_at = NOW()
       FROM next_sort
       WHERE id = $1
       RETURNING id, category_id, name, sort_order, is_active
     )
     SELECT updated.id, updated.category_id, c.name AS category_name,
            updated.name, updated.sort_order, updated.is_active
     FROM updated
     JOIN catalog_categories c ON c.id = updated.category_id`,
    [id, categoryId]
  );

  if (!result.rows[0]) throw new Error("找不到這筆細項");
  return mapSeries(result.rows[0]);
}

// 相容 Website Studio 舊 API：依指定 ID 順序更新單一分類內細項。
export async function updateCatalogSeriesSortOrder(
  categoryId: number,
  orderedIds: number[]
) {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("分類 ID 無效");
  }

  const items = orderedIds.map((id, index) => ({
    id,
    sortOrder: index + 1,
  }));

  return updateCatalogSeriesSortOrders(items);
}


// 相容既有 API：一次取得前台分類與細項。
export async function getStorefrontCatalog(options?: {
  includeInactive?: boolean;
  includeCounts?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? true;
  const includeCounts = options?.includeCounts ?? false;

  const [categories, series] = await Promise.all([
    getCatalogCategories({ includeInactive, includeCounts }),
    getCatalogSeries({ includeInactive, includeCounts }),
  ]);

  return { categories, series };
}
