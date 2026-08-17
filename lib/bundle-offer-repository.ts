import { dbQuery, withDbClient } from "./db";
import type {
  DatabaseProduct,
  ProductStatus,
} from "./product-repository";

export type BundleType =
  | "fixed_bundle"
  | "mix_match"
  | "buy_get";

export type BundleItemRole =
  | "fixed"
  | "option"
  | "buy"
  | "free";

export type BundleOfferItemInput = {
  productId: number;
  role: BundleItemRole;
  quantity: number;
  sortOrder?: number;
};

export type BundleOfferPlanInput = {
  code: string;
  label: string;
  requiredQuantity?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  priceAmount: number;
  sortOrder?: number;
};

export type BundleOfferWriteInput = {
  name: string;
  bundleType: BundleType;
  unitLabel?: string;
  allowSameProduct?: boolean;
  coverImage?: string;
  status: ProductStatus;
  sortOrder?: number;
  items: BundleOfferItemInput[];
  plans: BundleOfferPlanInput[];
};

export type BundleOfferItem = BundleOfferItemInput & {
  id: number;
  product?: DatabaseProduct;
};

export type BundleOfferPlan = BundleOfferPlanInput & {
  id: number;
};

export type BundleOffer = {
  id: number;
  name: string;
  bundleType: BundleType;
  unitLabel: string;
  allowSameProduct: boolean;
  coverImage?: string;
  status: ProductStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items: BundleOfferItem[];
  plans: BundleOfferPlan[];
};

type BundleOfferRow = {
  id: number | string;
  name: string;
  bundle_type: BundleType;
  unit_label: string;
  allow_same_product: boolean;
  cover_image: string | null;
  status: ProductStatus;
  sort_order: number;
  created_at: Date | string;
  updated_at: Date | string;
};

type BundleOfferItemRow = {
  id: number | string;
  bundle_offer_id: number | string;
  product_id: number;
  role: BundleItemRole;
  quantity: number;
  sort_order: number;
};

type BundleOfferPlanRow = {
  id: number | string;
  bundle_offer_id: number | string;
  code: string;
  label: string;
  required_quantity: number | null;
  buy_quantity: number | null;
  free_quantity: number | null;
  price_amount: number;
  sort_order: number;
};

function optional(value: string | null) {
  return value ?? undefined;
}

function rowToBundleOfferBase(
  row: BundleOfferRow
): Omit<BundleOffer, "items" | "plans"> {
  return {
    id: Number(row.id),
    name: row.name,
    bundleType: row.bundle_type,
    unitLabel: row.unit_label,
    allowSameProduct: row.allow_same_product,
    coverImage: optional(row.cover_image),
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function rowToBundleItem(
  row: BundleOfferItemRow
): BundleOfferItem {
  return {
    id: Number(row.id),
    productId: row.product_id,
    role: row.role,
    quantity: row.quantity,
    sortOrder: row.sort_order,
  };
}

function rowToBundlePlan(
  row: BundleOfferPlanRow
): BundleOfferPlan {
  return {
    id: Number(row.id),
    code: row.code,
    label: row.label,
    requiredQuantity:
      row.required_quantity ?? undefined,
    buyQuantity:
      row.buy_quantity ?? undefined,
    freeQuantity:
      row.free_quantity ?? undefined,
    priceAmount: row.price_amount,
    sortOrder: row.sort_order,
  };
}

async function validateStandardProducts(
  productIds: number[]
) {
  const uniqueIds = Array.from(new Set(productIds));

  if (!uniqueIds.length) {
    throw new Error(
      "組合優惠至少需要選擇一個一般商品。"
    );
  }

  const result = await dbQuery<{
    id: number;
    product_type: string;
  }>(
    `
      SELECT id, product_type
      FROM products
      WHERE id = ANY($1::int[])
    `,
    [uniqueIds]
  );

  if (result.rows.length !== uniqueIds.length) {
    throw new Error(
      "組合優惠包含不存在的商品。"
    );
  }

  const invalid = result.rows.filter(
    (row) => row.product_type !== "standard"
  );

  if (invalid.length) {
    throw new Error(
      "組合優惠只能引用一般商品，不能引用其他組合商品。"
    );
  }
}

async function loadBundleOfferRelations(
  bundleOfferId: number
) {
  const [itemsResult, plansResult] = await Promise.all([
    dbQuery<BundleOfferItemRow>(
      `
        SELECT *
        FROM bundle_offer_items
        WHERE bundle_offer_id = $1
        ORDER BY sort_order ASC, id ASC
      `,
      [bundleOfferId]
    ),
    dbQuery<BundleOfferPlanRow>(
      `
        SELECT *
        FROM bundle_offer_plans
        WHERE bundle_offer_id = $1
        ORDER BY sort_order ASC, id ASC
      `,
      [bundleOfferId]
    ),
  ]);

  return {
    items: itemsResult.rows.map(rowToBundleItem),
    plans: plansResult.rows.map(rowToBundlePlan),
  };
}

export async function listBundleOffers() {
  const result = await dbQuery<BundleOfferRow>(
    `
      SELECT *
      FROM bundle_offers
      ORDER BY sort_order ASC, id ASC
    `
  );

  return Promise.all(
    result.rows.map(async (row) => {
      const relations =
        await loadBundleOfferRelations(Number(row.id));

      return {
        ...rowToBundleOfferBase(row),
        ...relations,
      };
    })
  );
}

export async function getBundleOffer(id: number) {
  const result = await dbQuery<BundleOfferRow>(
    `
      SELECT *
      FROM bundle_offers
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const relations =
    await loadBundleOfferRelations(Number(row.id));

  return {
    ...rowToBundleOfferBase(row),
    ...relations,
  };
}

export async function createBundleOffer(
  input: BundleOfferWriteInput
) {
  await validateStandardProducts(
    input.items.map((item) => item.productId)
  );

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const offerResult =
        await client.query<BundleOfferRow>(
          `
            INSERT INTO bundle_offers (
              name,
              bundle_type,
              unit_label,
              allow_same_product,
              cover_image,
              status,
              sort_order,
              updated_at
            )
            VALUES (
              $1,$2,$3,$4,$5,$6,$7,NOW()
            )
            RETURNING *
          `,
          [
            input.name,
            input.bundleType,
            input.unitLabel || "件",
            input.allowSameProduct ?? false,
            input.coverImage || null,
            input.status,
            input.sortOrder ?? 0,
          ]
        );

      const offer = offerResult.rows[0];
      const bundleOfferId = Number(offer.id);

      for (const item of input.items) {
        await client.query(
          `
            INSERT INTO bundle_offer_items (
              bundle_offer_id,
              product_id,
              role,
              quantity,
              sort_order
            )
            VALUES ($1,$2,$3,$4,$5)
          `,
          [
            bundleOfferId,
            item.productId,
            item.role,
            item.quantity,
            item.sortOrder ?? 0,
          ]
        );
      }

      for (const plan of input.plans) {
        await client.query(
          `
            INSERT INTO bundle_offer_plans (
              bundle_offer_id,
              code,
              label,
              required_quantity,
              buy_quantity,
              free_quantity,
              price_amount,
              sort_order,
              updated_at
            )
            VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,NOW()
            )
          `,
          [
            bundleOfferId,
            plan.code,
            plan.label,
            plan.requiredQuantity ?? null,
            plan.buyQuantity ?? null,
            plan.freeQuantity ?? null,
            plan.priceAmount,
            plan.sortOrder ?? 0,
          ]
        );
      }

      await client.query("COMMIT");

      return getBundleOffer(bundleOfferId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function deleteBundleOffer(id: number) {
  const result = await dbQuery<{ id: number }>(
    `
      DELETE FROM bundle_offers
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows.length > 0;
}
