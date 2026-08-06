import { dbQuery, withDbClient } from "./db";
import type {
  DatabaseProduct,
  ProductStatus,
} from "./product-repository";

export type StorefrontSectionType =
  | "category"
  | "homepage"
  | "campaign"
  | "custom";

export type StorefrontSection = {
  id: number;
  code: string;
  name: string;
  description?: string;
  sectionType: StorefrontSectionType;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type StorefrontSectionItem = {
  id: number;
  sectionId: number;
  productId: number;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  product: DatabaseProduct;
};

type SectionRow = {
  id: number | string;
  code: string;
  name: string;
  description: string | null;
  section_type: StorefrontSectionType;
  is_active: boolean;
  sort_order: number;
  item_count: number | string;
  created_at: Date | string;
  updated_at: Date | string;
};

type SectionItemRow = {
  item_id: number | string;
  section_id: number | string;
  product_id: number;
  item_sort_order: number;
  is_visible: boolean;
  item_created_at: Date | string;
  item_updated_at: Date | string;

  display_code: string;
  product_type: "standard" | "combo";
  sku: string | null;
  name: string;
  category: string;
  series: string;
  storefront_category: string | null;
  sale_price_amount: number | string | null;
  original_price_amount: number | string | null;
  promotion_text: string | null;
  original_price: string | null;
  price: string;
  image: string;
  description: string;
  card_name: string | null;
  card_subtitle: string | null;
  spec: string | null;
  intro: string | null;
  price_note: string | null;
  expiry_note: string | null;
  internal_expiry_date: string | null;
  features: string[] | null;
  suitable_for: string[] | null;
  usage: string | null;
  notice: string | null;
  gallery: string[] | null;
  expanded_info: DatabaseProduct["expandedInfo"] | null;
  combo_config: DatabaseProduct["comboConfig"] | null;
  status: ProductStatus;
  product_sort_order: number;
  product_created_at: Date | string;
  product_updated_at: Date | string;
};

function mapSection(row: SectionRow): StorefrontSection {
  return {
    id: Number(row.id),
    code: row.code,
    name: row.name,
    description: row.description ?? undefined,
    sectionType: row.section_type,
    isActive: row.is_active,
    sortOrder: Number(row.sort_order),
    itemCount: Number(row.item_count ?? 0),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function mapItem(row: SectionItemRow): StorefrontSectionItem {
  return {
    id: Number(row.item_id),
    sectionId: Number(row.section_id),
    productId: row.product_id,
    sortOrder: Number(row.item_sort_order),
    isVisible: row.is_visible,
    createdAt: new Date(row.item_created_at).toISOString(),
    updatedAt: new Date(row.item_updated_at).toISOString(),
    product: {
      id: row.product_id,
      displayCode: row.display_code,
      productType: row.product_type,
      sku: row.sku ?? undefined,
      name: row.name,
      category: row.category as DatabaseProduct["category"],
      series: row.series,
      storefrontCategory:
        row.storefront_category as
          | DatabaseProduct["storefrontCategory"]
          | undefined,
      salePriceAmount:
        row.sale_price_amount === null
          ? undefined
          : Number(row.sale_price_amount),
      originalPriceAmount:
        row.original_price_amount === null
          ? undefined
          : Number(row.original_price_amount),
      promotionText:
        row.promotion_text ??
        row.price_note ??
        undefined,
      originalPrice: row.original_price ?? undefined,
      price: row.price,
      image: row.image,
      description: row.description,
      cardName: row.card_name ?? undefined,
      cardSubtitle: row.card_subtitle ?? undefined,
      spec: row.spec ?? undefined,
      intro: row.intro ?? undefined,
      priceNote: row.price_note ?? undefined,
      expiryNote: row.expiry_note ?? undefined,
      internalExpiryDate:
        row.internal_expiry_date ?? undefined,
      features: row.features ?? [],
      suitableFor: row.suitable_for ?? [],
      usage: row.usage ?? undefined,
      notice: row.notice ?? undefined,
      gallery: row.gallery ?? [],
      expandedInfo: row.expanded_info ?? [],
      comboConfig: row.combo_config
        ? {
            ...row.combo_config,
            productId: row.product_id,
          }
        : undefined,
      status: row.status,
      sortOrder: row.product_sort_order,
      createdAt: new Date(
        row.product_created_at
      ).toISOString(),
      updatedAt: new Date(
        row.product_updated_at
      ).toISOString(),
    },
  };
}

export async function listStorefrontSections(options?: {
  includeInactive?: boolean;
}) {
  const includeInactive =
    options?.includeInactive ?? true;

  const result = await dbQuery<SectionRow>(`
    SELECT
      s.*,
      COUNT(i.id)::int AS item_count
    FROM storefront_sections s
    LEFT JOIN storefront_section_items i
      ON i.section_id = s.id
    ${
      includeInactive
        ? ""
        : "WHERE s.is_active = TRUE"
    }
    GROUP BY s.id
    ORDER BY s.sort_order ASC, s.id ASC
  `);

  return result.rows.map(mapSection);
}

export async function listStorefrontSectionItems(
  sectionId: number,
  options?: {
    includeHidden?: boolean;
    includeInactiveProducts?: boolean;
  }
) {
  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("商城區塊 ID 無效");
  }

  const includeHidden =
    options?.includeHidden ?? true;
  const includeInactiveProducts =
    options?.includeInactiveProducts ?? true;

  const conditions = [
    "i.section_id = $1",
    includeHidden ? null : "i.is_visible = TRUE",
    includeInactiveProducts
      ? null
      : "p.status <> 'inactive'",
  ].filter(Boolean);

  const result = await dbQuery<SectionItemRow>(
    `
      SELECT
        i.id AS item_id,
        i.section_id,
        i.product_id,
        i.sort_order AS item_sort_order,
        i.is_visible,
        i.created_at AS item_created_at,
        i.updated_at AS item_updated_at,

        p.display_code,
        p.product_type,
        p.sku,
        p.name,
        p.category,
        p.series,
        p.storefront_category,
        p.sale_price_amount,
        p.original_price_amount,
        p.promotion_text,
        p.original_price,
        p.price,
        p.image,
        p.description,
        p.card_name,
        p.card_subtitle,
        p.spec,
        p.intro,
        p.price_note,
        p.expiry_note,
        p.internal_expiry_date,
        p.features,
        p.suitable_for,
        p.usage,
        p.notice,
        p.gallery,
        p.expanded_info,
        p.combo_config,
        p.status,
        p.sort_order AS product_sort_order,
        p.created_at AS product_created_at,
        p.updated_at AS product_updated_at
      FROM storefront_section_items i
      JOIN products p ON p.id = i.product_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY
        i.sort_order ASC,
        i.id ASC
    `,
    [sectionId]
  );

  return result.rows.map(mapItem);
}

export async function addProductToStorefrontSection(
  sectionId: number,
  productId: number
) {
  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("商城區塊 ID 無效");
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("商品 ID 無效");
  }

  const result = await dbQuery<{ id: number }>(
    `
      WITH next_sort AS (
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS value
        FROM storefront_section_items
        WHERE section_id = $1
      )
      INSERT INTO storefront_section_items (
        section_id,
        product_id,
        sort_order,
        is_visible,
        updated_at
      )
      SELECT
        $1,
        $2,
        next_sort.value,
        TRUE,
        NOW()
      FROM next_sort
      ON CONFLICT (section_id, product_id)
      DO UPDATE SET
        is_visible = TRUE,
        updated_at = NOW()
      RETURNING id
    `,
    [sectionId, productId]
  );

  return result.rows[0]?.id ?? null;
}

export async function removeProductFromStorefrontSection(
  sectionId: number,
  productId: number
) {
  const result = await dbQuery<{ id: number }>(
    `
      DELETE FROM storefront_section_items
      WHERE section_id = $1
        AND product_id = $2
      RETURNING id
    `,
    [sectionId, productId]
  );

  return result.rowCount === 1;
}

export async function updateStorefrontSectionItemVisibility(
  sectionId: number,
  productId: number,
  isVisible: boolean
) {
  const result = await dbQuery<{ id: number }>(
    `
      UPDATE storefront_section_items
      SET
        is_visible = $3,
        updated_at = NOW()
      WHERE section_id = $1
        AND product_id = $2
      RETURNING id
    `,
    [sectionId, productId, isVisible]
  );

  return result.rowCount === 1;
}

export async function updateStorefrontSectionItemSortOrders(
  sectionId: number,
  orderedProductIds: number[]
) {
  if (!Number.isInteger(sectionId) || sectionId <= 0) {
    throw new Error("商城區塊 ID 無效");
  }

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      for (const [index, productId] of
        orderedProductIds.entries()) {
        if (
          !Number.isInteger(productId) ||
          productId <= 0
        ) {
          throw new Error("商城商品排序資料無效");
        }

        await client.query(
          `
            UPDATE storefront_section_items
            SET
              sort_order = $3,
              updated_at = NOW()
            WHERE section_id = $1
              AND product_id = $2
          `,
          [sectionId, productId, index + 1]
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
