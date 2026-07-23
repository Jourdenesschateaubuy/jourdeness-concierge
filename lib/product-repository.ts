import type { MainCategory, Product } from "./storefront-core";
import { dbQuery } from "./db";

export type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

export type DatabaseProduct = Product & {
  status: ProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: number;
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
