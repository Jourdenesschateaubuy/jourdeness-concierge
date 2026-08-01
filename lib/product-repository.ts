import type { ComboConfig, MainCategory, Product } from "./storefront-core";
import { dbQuery, withDbClient } from "./db";

export type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

export type DatabaseProduct = Product & {
  sku?: string;
  status: ProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductWriteInput = {
  sku?: string;
  name: string;
  category: string;
  series: string;
  storefrontCategory?: string;
  originalPrice?: string;
  price: string;
  image: string;
  description: string;
  cardName?: string;
  cardSubtitle?: string;
  spec?: string;
  intro?: string;
  priceNote?: string;
  expiryNote?: string;
  internalExpiryDate?: string;
  features: string[];
  suitableFor: string[];
  usage?: string;
  notice?: string;
  gallery: string[];
  expandedInfo: NonNullable<Product["expandedInfo"]>;
  comboConfig?: ComboConfig;
  status: ProductStatus;
  sortOrder: number;
};

type ProductRow = {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  series: string;
  storefront_category: string | null;
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
  expanded_info: Product["expandedInfo"] | null;
  combo_config: ComboConfig | null;
  status: ProductStatus;
  sort_order: number;
  created_at: Date | string;
  updated_at: Date | string;
};

function optional(value: string | null) {
  return value ?? undefined;
}

function rowToProduct(row: ProductRow): DatabaseProduct {
  return {
    id: row.id,
    sku: optional(row.sku),
    name: row.name,
    category: row.category as MainCategory,
    series: row.series,
    storefrontCategory: optional(row.storefront_category) as MainCategory | undefined,
    originalPrice: optional(row.original_price),
    price: row.price,
    image: row.image,
    description: row.description,
    cardName: optional(row.card_name),
    cardSubtitle: optional(row.card_subtitle),
    spec: optional(row.spec),
    intro: optional(row.intro),
    priceNote: optional(row.price_note),
    expiryNote: optional(row.expiry_note),
    internalExpiryDate: optional(row.internal_expiry_date),
    features: row.features ?? [],
    suitableFor: row.suitable_for ?? [],
    usage: optional(row.usage),
    notice: optional(row.notice),
    gallery: row.gallery ?? [],
    expandedInfo: row.expanded_info ?? [],
    comboConfig: row.combo_config
      ? {
          ...row.combo_config,
          productId: row.id,
        }
      : undefined,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function listDatabaseProducts(options?: {
  includeInactive?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? true;

  const result = await dbQuery<ProductRow>(
    `
      SELECT *
      FROM products
      ${includeInactive ? "" : "WHERE status <> 'inactive'"}
      ORDER BY sort_order ASC, id ASC
    `
  );

  return result.rows.map(rowToProduct);
}

export async function getDatabaseProduct(id: number) {
  const result = await dbQuery<ProductRow>(
    `SELECT * FROM products WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

export async function createDatabaseProduct(
  input: ProductWriteInput,
  productType: "product" | "combo" = "product"
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query("LOCK TABLE products IN EXCLUSIVE MODE");

      const idResult = await client.query<{ id: number }>(
        `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM products`
      );
      const id = Number(idResult.rows[0]?.id ?? 1);

      const comboConfig =
        input.comboConfig ??
        (productType === "combo"
          ? {
              productId: id,
              type: "mix_match" as const,
              unitLabel: "件",
              allowSameProduct: true,
              options: [],
              plans: [],
            }
          : undefined);

      const result = await client.query<ProductRow>(
        `
          INSERT INTO products (
            id, sku, name, category, series, storefront_category, original_price, price, image,
            description, card_name, card_subtitle, spec, intro, price_note,
            expiry_note, internal_expiry_date,
            features, suitable_for, usage, notice, gallery, expanded_info, combo_config,
            status, sort_order, updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
            $18::jsonb,$19::jsonb,$20,$21,$22::jsonb,$23::jsonb,$24::jsonb,$25,$26,NOW()
          )
          RETURNING *
        `,
        [
          id,
          input.sku || null,
          input.name,
          input.category,
          input.series,
          input.storefrontCategory || null,
          input.originalPrice || null,
          input.price,
          input.image,
          input.description,
          input.cardName || null,
          input.cardSubtitle || null,
          input.spec || null,
          input.intro || null,
          input.priceNote || null,
          input.expiryNote || null,
          input.internalExpiryDate || null,
          JSON.stringify(input.features ?? []),
          JSON.stringify(input.suitableFor ?? []),
          input.usage || null,
          input.notice || null,
          JSON.stringify(input.gallery ?? []),
          JSON.stringify(input.expandedInfo ?? []),
          comboConfig ? JSON.stringify(comboConfig) : null,
          input.status,
          input.sortOrder,
        ]
      );

      await client.query("COMMIT");
      return rowToProduct(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updateDatabaseProduct(
  id: number,
  input: ProductWriteInput
) {
  const result = await dbQuery<ProductRow>(
    `
      UPDATE products
      SET
        sku = $2,
        name = $3,
        category = $4,
        series = $5,
        storefront_category = COALESCE($6, storefront_category),
        original_price = $7,
        price = $8,
        image = $9,
        description = $10,
        card_name = $11,
        card_subtitle = $12,
        spec = $13,
        intro = $14,
        price_note = $15,
        expiry_note = $16,
        internal_expiry_date = $17,
        features = $18::jsonb,
        suitable_for = $19::jsonb,
        usage = $20,
        notice = $21,
        gallery = $22::jsonb,
        expanded_info = $23::jsonb,
        combo_config = COALESCE($24::jsonb, combo_config),
        status = $25,
        sort_order = $26,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      input.sku || null,
      input.name,
      input.category,
      input.series,
      input.storefrontCategory || null,
      input.originalPrice || null,
      input.price,
      input.image,
      input.description,
      input.cardName || null,
      input.cardSubtitle || null,
      input.spec || null,
      input.intro || null,
      input.priceNote || null,
      input.expiryNote || null,
      input.internalExpiryDate || null,
      JSON.stringify(input.features ?? []),
      JSON.stringify(input.suitableFor ?? []),
      input.usage || null,
      input.notice || null,
      JSON.stringify(input.gallery ?? []),
      JSON.stringify(input.expandedInfo ?? []),
      input.comboConfig ? JSON.stringify(input.comboConfig) : null,
      input.status,
      input.sortOrder,
    ]
  );

  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

export async function updateProductStatus(
  id: number,
  status: ProductStatus
) {
  const result = await dbQuery<ProductRow>(
    `
      UPDATE products
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status]
  );

  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}
export async function updateProductSortOrders(
  items: Array<{
    id: number;
    sortOrder: number;
  }>
) {
  if (items.length === 0) return;

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      for (const item of items) {
        if (
          !Number.isInteger(item.id) ||
          item.id <= 0 ||
          !Number.isInteger(item.sortOrder)
        ) {
          throw new Error("商品排序資料無效。");
        }

        await client.query(
          `
            UPDATE products
            SET
              sort_order = $2,
              updated_at = NOW()
            WHERE id = $1
          `,
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

export async function deleteDatabaseProduct(id: number) {
  const result = await dbQuery<{ id: number }>(
    `DELETE FROM products WHERE id = $1 RETURNING id`,
    [id]
  );

  return result.rowCount === 1;
}
