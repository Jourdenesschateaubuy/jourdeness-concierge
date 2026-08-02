import { dbQuery, withDbClient } from "./db";
import {
  DEFAULT_STOREFRONT_SERIES,
  STOREFRONT_CATEGORY_NAMES,
  type StorefrontCategoryName,
} from "./storefront-catalog";

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

export async function getCatalogCategories(options?: {
  includeInactive?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? false;

  const result = await dbQuery<CategoryRow>(`
    SELECT id, name, sort_order, is_active
    FROM catalog_categories
    ${includeInactive ? "" : "WHERE is_active = TRUE"}
    ORDER BY sort_order ASC, id ASC
  `);

  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function getCatalogSeries(options?: {
  includeInactive?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? false;

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
    ${
      includeInactive
        ? ""
        : `WHERE s.is_active = TRUE
             AND c.is_active = TRUE`
    }
    ORDER BY
      c.sort_order ASC,
      c.id ASC,
      s.sort_order ASC,
      s.id ASC
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

export async function createCatalogCategory(name: string) {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("分類名稱不能空白");
  }

  const result = await dbQuery<CategoryRow>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
        FROM catalog_categories
      )
      INSERT INTO catalog_categories (
        name,
        sort_order,
        is_active,
        updated_at
      )
      SELECT
        $1,
        next_sort.value,
        TRUE,
        NOW()
      FROM next_sort
      RETURNING
        id,
        name,
        sort_order,
        is_active
    `,
    [cleanName]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("分類建立失敗");
  }

  return {
    id: Number(row.id),
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}
export async function updateCatalogCategoryName(
  id: number,
  name: string
) {
  const cleanName = name.trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("分類 ID 無效");
  }

  if (!cleanName) {
    throw new Error("分類名稱不能空白");
  }

  const result = await dbQuery<CategoryRow>(
    `
      UPDATE catalog_categories
      SET
        name = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        sort_order,
        is_active
    `,
    [id, cleanName]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("找不到這筆分類");
  }

  return {
    id: Number(row.id),
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function updateCatalogCategoryStatus(
  id: number,
  isActive: boolean
) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("分類 ID 無效");
  }

  const result = await dbQuery<CategoryRow>(
    `
      UPDATE catalog_categories
      SET
        is_active = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        name,
        sort_order,
        is_active
    `,
    [id, isActive]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("找不到這筆分類");
  }

  return {
    id: Number(row.id),
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function updateCatalogSeriesName(
  id: number,
  name: string
) {
  const cleanName = name.trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("系列 ID 無效");
  }

  if (!cleanName) {
    throw new Error("系列名稱不能空白");
  }

  const result = await dbQuery<SeriesRow>(
    `
      UPDATE catalog_series AS series
      SET
        name = $2,
        updated_at = NOW()
      FROM catalog_categories AS category
      WHERE series.id = $1
        AND category.id = series.category_id
      RETURNING
        series.id,
        series.category_id,
        category.name AS category_name,
        series.name,
        series.sort_order,
        series.is_active
    `,
    [id, cleanName]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("找不到這筆系列");
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

export async function updateCatalogSeriesStatus(
  id: number,
  isActive: boolean
) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("系列 ID 無效");
  }

  const result = await dbQuery<SeriesRow>(
    `
      UPDATE catalog_series AS series
      SET
        is_active = $2,
        updated_at = NOW()
      FROM catalog_categories AS category
      WHERE series.id = $1
        AND category.id = series.category_id
      RETURNING
        series.id,
        series.category_id,
        category.name AS category_name,
        series.name,
        series.sort_order,
        series.is_active
    `,
    [id, isActive]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("找不到這筆系列");
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

export async function updateCatalogSeriesCategory(
  id: number,
  categoryId: number
) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("系列 ID 無效");
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("分類 ID 無效");
  }

  const result = await dbQuery<SeriesRow>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) + 1 AS value
        FROM catalog_series
        WHERE category_id = $2
      ),
      updated AS (
        UPDATE catalog_series
        SET
          category_id = $2,
          sort_order = next_sort.value,
          updated_at = NOW()
        FROM next_sort
        WHERE id = $1
        RETURNING id, category_id, name, sort_order, is_active
      )
      SELECT
        updated.id,
        updated.category_id,
        category.name AS category_name,
        updated.name,
        updated.sort_order,
        updated.is_active
      FROM updated
      JOIN catalog_categories AS category
        ON category.id = updated.category_id
    `,
    [id, categoryId]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("找不到這筆系列");
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

export async function updateCatalogSeriesSortOrder(
  categoryId: number,
  orderedIds: number[]
) {
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new Error("分類 ID 無效");
  }

  const ids = orderedIds.filter(
    (id) => Number.isInteger(id) && id > 0
  );

  await withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      for (const [sortOrder, id] of ids.entries()) {
        await client.query(
          `
            UPDATE catalog_series
            SET
              sort_order = $3,
              updated_at = NOW()
            WHERE id = $1
              AND category_id = $2
          `,
          [id, categoryId, sortOrder]
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });

  return getCatalogSeries({ includeInactive: true });
}


let storefrontCatalogEnsurePromise: Promise<
  CatalogCategory[]
> | null = null;

export async function ensureStorefrontCatalog() {
  if (storefrontCatalogEnsurePromise) {
    return storefrontCatalogEnsurePromise;
  }

  const ensureTask = withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      // 首頁會同時讀取商品、Site Studio 與分類 API。
      // 使用 PostgreSQL transaction advisory lock，避免多個請求同時建立
      // 「本月優惠」等預設分類而觸發 unique constraint 錯誤。
      await client.query(
        `
          SELECT pg_advisory_xact_lock(
            hashtext($1::text)
          )
        `,
        ["jourdeness-storefront-catalog-v1"]
      );

      const categories: CatalogCategory[] = [];

      for (const [sortOrder, name] of STOREFRONT_CATEGORY_NAMES.entries()) {
        const upserted = await client.query<CategoryRow>(
          `
            INSERT INTO catalog_categories (
              name,
              sort_order,
              is_active,
              updated_at
            )
            VALUES ($1, $2, TRUE, NOW())
            ON CONFLICT (name)
            DO UPDATE SET
              sort_order = EXCLUDED.sort_order,
              updated_at = NOW()
            RETURNING id, name, sort_order, is_active
          `,
          [name, sortOrder]
        );

        const row = upserted.rows[0];

        if (!row) {
          throw new Error(`前台分類「${name}」建立失敗`);
        }

        const category = {
          id: Number(row.id),
          name: row.name,
          sortOrder: row.sort_order,
          isActive: row.is_active,
        };

        categories.push(category);

        const seriesCount = await client.query<{
          count: string;
        }>(
          `
            SELECT COUNT(*)::text AS count
            FROM catalog_series
            WHERE category_id = $1
          `,
          [category.id]
        );

        if (Number(seriesCount.rows[0]?.count ?? 0) === 0) {
          const defaultSeries =
            DEFAULT_STOREFRONT_SERIES[
              name as StorefrontCategoryName
            ];

          for (const [seriesSortOrder, seriesName] of defaultSeries.entries()) {
            await client.query(
              `
                INSERT INTO catalog_series (
                  category_id,
                  name,
                  sort_order,
                  is_active,
                  updated_at
                )
                VALUES ($1, $2, $3, TRUE, NOW())
                ON CONFLICT DO NOTHING
              `,
              [
                category.id,
                seriesName,
                seriesSortOrder,
              ]
            );
          }
        }
      }

      await client.query("COMMIT");
      return categories;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });

  storefrontCatalogEnsurePromise = ensureTask;

  try {
    return await ensureTask;
  } finally {
    if (storefrontCatalogEnsurePromise === ensureTask) {
      storefrontCatalogEnsurePromise = null;
    }
  }
}

export async function getStorefrontCatalog(options?: {
  includeInactive?: boolean;
}) {
  await ensureStorefrontCatalog();

  const includeInactive = options?.includeInactive ?? false;

  const [allCategories, allSeries] = await Promise.all([
    getCatalogCategories({ includeInactive: true }),
    getCatalogSeries({ includeInactive: true }),
  ]);

  const categoryOrder = new Map(
    STOREFRONT_CATEGORY_NAMES.map((name, index) => [
      name,
      index,
    ])
  );

  const categories = allCategories
    .filter((category) =>
      categoryOrder.has(
        category.name as StorefrontCategoryName
      )
    )
    .filter((category) =>
      includeInactive ? true : category.isActive
    )
    .sort(
      (a, b) =>
        (categoryOrder.get(
          a.name as StorefrontCategoryName
        ) ?? 999) -
        (categoryOrder.get(
          b.name as StorefrontCategoryName
        ) ?? 999)
    )
    .map((category, index) => ({
      ...category,
      sortOrder: index,
    }));

  const categoryIds = new Set(
    categories.map((category) => category.id)
  );

  const series = allSeries
    .filter((item) => categoryIds.has(item.categoryId))
    .filter((item) =>
      includeInactive ? true : item.isActive
    )
    .sort(
      (a, b) =>
        categories.findIndex(
          (category) => category.id === a.categoryId
        ) -
          categories.findIndex(
            (category) => category.id === b.categoryId
          ) ||
        a.sortOrder - b.sortOrder ||
        a.id - b.id
    );

  return { categories, series };
}
