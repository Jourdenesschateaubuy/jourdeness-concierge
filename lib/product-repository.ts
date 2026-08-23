import type { MainCategory, Product } from "./storefront-core";
import { dbQuery, withDbClient } from "./db";
import { extractPrimaryMoneyAmount } from "./product-pricing";

export type ProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

export type DatabaseProduct = Product & {
  displayCode: string;
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
  salePriceAmount?: number;
  originalPriceAmount?: number;
  promotionText?: string;
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
  status: ProductStatus;
  sortOrder: number;
};

type ProductRow = {
  id: number;
  display_code: string;
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
    displayCode: row.display_code,
    sku: optional(row.sku),
    name: row.name,
    category: row.category as MainCategory,
    series: row.series,
    storefrontCategory: optional(row.storefront_category) as MainCategory | undefined,
    salePriceAmount:
      row.sale_price_amount === null
        ? undefined
        : Number(row.sale_price_amount),
    originalPriceAmount:
      row.original_price_amount === null
        ? undefined
        : Number(row.original_price_amount),
    promotionText: optional(row.promotion_text) ?? optional(row.price_note),
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

export async function createDatabaseProduct(
  input: ProductWriteInput
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      await client.query("LOCK TABLE products IN EXCLUSIVE MODE");

      const idResult = await client.query<{ id: number }>(
        `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM products`
      );
      const id = Number(idResult.rows[0]?.id ?? 1);

      const displayCodeResult =
        await client.query<{ sequence_value: string }>(
          `SELECT nextval('product_standard_code_seq')::text AS sequence_value`
        );

      const displayCodeNumber = Number(
        displayCodeResult.rows[0]?.sequence_value ?? 1
      );

      const displayCode = `P-${String(displayCodeNumber).padStart(
        4,
        "0"
      )}`;

      const salePriceAmount =
        input.salePriceAmount ??
        extractPrimaryMoneyAmount(input.price) ??
        null;

      const originalPriceAmount =
        input.originalPriceAmount ??
        extractPrimaryMoneyAmount(input.originalPrice) ??
        null;

      const promotionText =
        input.promotionText || input.priceNote || null;

      const result = await client.query<ProductRow>(
        `
          INSERT INTO products (
            id, display_code,
            sku, name, category, series, storefront_category,
            sale_price_amount, original_price_amount, promotion_text,
            original_price, price, image, description,
            card_name, card_subtitle, spec, intro, price_note,
            expiry_note, internal_expiry_date,
            features, suitable_for, usage, notice, gallery,
            expanded_info, status, sort_order, updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
            $18,$19,$20,$21,$22::jsonb,$23::jsonb,$24,$25,$26::jsonb,
            $27::jsonb,$28,$29,NOW()
          )
          RETURNING *
        `,
        [
          id,
          displayCode,
          input.sku || null,
          input.name,
          input.category,
          input.series,
          input.storefrontCategory || null,
          salePriceAmount,
          originalPriceAmount,
          promotionText,
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
  const salePriceAmount =
    input.salePriceAmount ??
    extractPrimaryMoneyAmount(input.price) ??
    null;

  const originalPriceAmount =
    input.originalPriceAmount ??
    extractPrimaryMoneyAmount(input.originalPrice) ??
    null;

  const promotionText =
    input.promotionText || input.priceNote || null;

  const result = await dbQuery<ProductRow>(
    `
      UPDATE products
      SET
        sku = $2,
        name = $3,
        category = $4,
        series = $5,
        storefront_category = COALESCE($6, storefront_category),
        sale_price_amount = $7,
        original_price_amount = $8,
        promotion_text = $9,
        original_price = $10,
        price = $11,
        image = $12,
        description = $13,
        card_name = $14,
        card_subtitle = $15,
        spec = $16,
        intro = $17,
        price_note = $18,
        expiry_note = $19,
        internal_expiry_date = $20,
        features = $21::jsonb,
        suitable_for = $22::jsonb,
        usage = $23,
        notice = $24,
        gallery = $25::jsonb,
        expanded_info = $26::jsonb,
        status = $27,
        sort_order = $28,
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
      salePriceAmount,
      originalPriceAmount,
      promotionText,
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
      input.status,
      input.sortOrder,
    ]
  );

  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

export type ProductPartialUpdateInput = Omit<
  Partial<ProductWriteInput>,
  "salePriceAmount" | "originalPriceAmount" | "promotionText"
> & {
  salePriceAmount?: number | null;
  originalPriceAmount?: number | null;
  promotionText?: string | null;
};

export async function updateDatabaseProductPartial(
  id: number,
  patch: ProductPartialUpdateInput
) {
  const existing = await getDatabaseProduct(id);

  if (!existing) {
    return null;
  }

  const input: ProductWriteInput = {
    sku: patch.sku !== undefined ? patch.sku : existing.sku,
    name: patch.name !== undefined ? patch.name : existing.name,
    category:
      patch.category !== undefined
        ? patch.category
        : existing.category,
    series:
      patch.series !== undefined
        ? patch.series
        : existing.series,
    storefrontCategory:
      patch.storefrontCategory !== undefined
        ? patch.storefrontCategory
        : existing.storefrontCategory,
    salePriceAmount:
      patch.salePriceAmount === null
        ? undefined
        : patch.salePriceAmount !== undefined
          ? patch.salePriceAmount
          : existing.salePriceAmount,
    originalPriceAmount:
      patch.originalPriceAmount === null
        ? undefined
        : patch.originalPriceAmount !== undefined
          ? patch.originalPriceAmount
          : existing.originalPriceAmount,
    promotionText:
      patch.promotionText === null
        ? undefined
        : patch.promotionText !== undefined
          ? patch.promotionText
          : existing.promotionText,
    originalPrice:
      patch.originalPrice !== undefined
        ? patch.originalPrice
        : existing.originalPrice,
    price: patch.price !== undefined ? patch.price : existing.price,
    image: patch.image !== undefined ? patch.image : existing.image,
    description:
      patch.description !== undefined
        ? patch.description
        : existing.description,
    cardName:
      patch.cardName !== undefined
        ? patch.cardName
        : existing.cardName,
    cardSubtitle:
      patch.cardSubtitle !== undefined
        ? patch.cardSubtitle
        : existing.cardSubtitle,
    spec: patch.spec !== undefined ? patch.spec : existing.spec,
    intro: patch.intro !== undefined ? patch.intro : existing.intro,
    priceNote:
      patch.priceNote !== undefined
        ? patch.priceNote
        : existing.priceNote,
    expiryNote:
      patch.expiryNote !== undefined
        ? patch.expiryNote
        : existing.expiryNote,
    internalExpiryDate:
      patch.internalExpiryDate !== undefined
        ? patch.internalExpiryDate
        : existing.internalExpiryDate,
    features:
      patch.features !== undefined
        ? patch.features
        : existing.features ?? [],
    suitableFor:
      patch.suitableFor !== undefined
        ? patch.suitableFor
        : existing.suitableFor ?? [],
    usage: patch.usage !== undefined ? patch.usage : existing.usage,
    notice: patch.notice !== undefined ? patch.notice : existing.notice,
    gallery:
      patch.gallery !== undefined
        ? patch.gallery
        : existing.gallery ?? [],
    expandedInfo:
      patch.expandedInfo !== undefined
        ? patch.expandedInfo
        : existing.expandedInfo ?? [],
    status:
      patch.status !== undefined
        ? patch.status
        : existing.status,
    sortOrder:
      patch.sortOrder !== undefined
        ? patch.sortOrder
        : existing.sortOrder,
  };

  return updateDatabaseProduct(id, input);
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
