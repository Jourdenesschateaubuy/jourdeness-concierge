import type { MainCategory, Product } from "./storefront-core";
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
  status: ProductStatus;
  sortOrder: number;
};

type ProductRow = {
  id: number;
  sku: string | null;
  name: string;
  category: string;
  series: string;
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

export async function createDatabaseProduct(input: ProductWriteInput) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query("LOCK TABLE products IN EXCLUSIVE MODE");

      const idResult = await client.query<{ id: number }>(
        `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM products`
      );
      const id = Number(idResult.rows[0]?.id ?? 1);

      const result = await client.query<ProductRow>(
        `
          INSERT INTO products (
            id, sku, name, category, series, original_price, price, image,
            description, card_name, card_subtitle, spec, intro, price_note,
            expiry_note, internal_expiry_date, status, sort_order, updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW()
          )
          RETURNING *
        `,
        [
          id,
          input.sku || null,
          input.name,
          input.category,
          input.series,
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
        original_price = $6,
        price = $7,
        image = $8,
        description = $9,
        card_name = $10,
        card_subtitle = $11,
        spec = $12,
        intro = $13,
        price_note = $14,
        expiry_note = $15,
        internal_expiry_date = $16,
        status = $17,
        sort_order = $18,
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

export async function deleteDatabaseProduct(id: number) {
  const result = await dbQuery<{ id: number }>(
    `DELETE FROM products WHERE id = $1 RETURNING id`,
    [id]
  );

  return result.rowCount === 1;
}
