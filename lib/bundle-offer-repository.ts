import { dbQuery, withDbClient } from "./db";
import type {
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

export type BundleOfferPlanGiftInput = {
  productId?: number;
  name: string;
  quantity: number;
  unitLabel: string;
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
  gifts?: BundleOfferPlanGiftInput[];
};

export type BundleOfferProductInfoInput = {
  spec?: string;
  expiryNote?: string;
  intro?: string;
  features?: string[];
  expandedInfo?: Array<{
    title: string;
    content: string;
  }>;
  suitableFor?: string[];
  usage?: string;
  gallery?: string[];
};

export type BundleOfferCardInput = {
  name: string;
  coverImage?: string;
  cardSubtitle?: string;
  cardOriginalPriceText?: string;
  cardPriceText?: string;
  storefrontCategory?: string;
  series?: string;
  status: ProductStatus;
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

export type BundleOfferItemProduct = {
  id: number;
  displayCode: string;
  name: string;
  image: string;
  price: string;
  status: ProductStatus;
};

export type BundleOfferItem = BundleOfferItemInput & {
  id: number;
  product: BundleOfferItemProduct;
};

export type BundleOfferPlanGift =
  BundleOfferPlanGiftInput & {
    id: number;
  };

export type BundleOfferPlan =
  Omit<BundleOfferPlanInput, "gifts"> & {
    id: number;
    gifts: BundleOfferPlanGift[];
  };

export type BundleOffer = {
  id: number;
  name: string;
  bundleType: BundleType;
  unitLabel: string;
  allowSameProduct: boolean;
  coverImage?: string;
  cardSubtitle?: string;
  cardOriginalPriceText?: string;
  cardPriceText?: string;
  storefrontCategory?: string;
  series?: string;
  spec?: string;
  expiryNote?: string;
  intro?: string;
  features: string[];
  expandedInfo: Array<{
    title: string;
    content: string;
  }>;
  suitableFor: string[];
  usage?: string;
  gallery: string[];
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
  card_subtitle: string | null;
  card_original_price_text: string | null;
  card_price_text: string | null;
  storefront_category: string | null;
  series: string | null;
  spec: string | null;
  expiry_note: string | null;
  intro: string | null;
  features: string[] | null;
  expanded_info: Array<{
    title: string;
    content: string;
  }> | null;
  suitable_for: string[] | null;
  usage: string | null;
  gallery: string[] | null;
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

  product_display_code: string;
  product_name: string;
  product_image: string;
  product_price: string;
  product_status: ProductStatus;
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

type BundleOfferPlanGiftRow = {
  id: number | string;
  bundle_offer_plan_id: number | string;
  product_id: number | null;
  name: string;
  quantity: number;
  unit_label: string;
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
    cardSubtitle: optional(row.card_subtitle),
    cardOriginalPriceText: optional(row.card_original_price_text),
    cardPriceText: optional(row.card_price_text),
    storefrontCategory: optional(row.storefront_category),
    series: optional(row.series),
    spec: optional(row.spec),
    expiryNote: optional(row.expiry_note),
    intro: optional(row.intro),
    features: row.features ?? [],
    expandedInfo: row.expanded_info ?? [],
    suitableFor: row.suitable_for ?? [],
    usage: optional(row.usage),
    gallery: row.gallery ?? [],
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
    product: {
      id: row.product_id,
      displayCode: row.product_display_code,
      name: row.product_name,
      image: row.product_image,
      price: row.product_price,
      status: row.product_status,
    },
  };
}

function rowToBundlePlanGift(
  row: BundleOfferPlanGiftRow
): BundleOfferPlanGift {
  return {
    id: Number(row.id),
    productId:
      row.product_id ?? undefined,
    name: row.name,
    quantity: row.quantity,
    unitLabel: row.unit_label,
    sortOrder: row.sort_order,
  };
}

function rowToBundlePlan(
  row: BundleOfferPlanRow,
  gifts: BundleOfferPlanGift[] = []
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
    gifts,
  };
}

async function validateProducts(
  productIds: number[]
) {
  const uniqueIds = Array.from(new Set(productIds));

  if (!uniqueIds.length) {
    throw new Error(
      "組合優惠至少需要選擇一個商品。"
    );
  }

  const result = await dbQuery<{
    id: number;
  }>(
    `
      SELECT id
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
}

async function loadBundleOfferRelations(
  bundleOfferId: number
) {
  const [itemsResult, plansResult] =
    await Promise.all([
      dbQuery<BundleOfferItemRow>(
        `
          SELECT
            item.id,
            item.bundle_offer_id,
            item.product_id,
            item.role,
            item.quantity,
            item.sort_order,

            product.display_code AS product_display_code,
            product.name AS product_name,
            product.image AS product_image,
            product.price AS product_price,
            product.status AS product_status

          FROM bundle_offer_items AS item
          JOIN products AS product
            ON product.id = item.product_id

          WHERE item.bundle_offer_id = $1

          ORDER BY
            item.sort_order ASC,
            item.id ASC
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

  const planIds =
    plansResult.rows.map(
      (plan) => Number(plan.id)
    );

  const giftRows =
    planIds.length > 0
      ? (
          await dbQuery<BundleOfferPlanGiftRow>(
            `
              SELECT *
              FROM bundle_offer_plan_gifts
              WHERE bundle_offer_plan_id =
                ANY($1::bigint[])
              ORDER BY
                bundle_offer_plan_id ASC,
                sort_order ASC,
                id ASC
            `,
            [planIds]
          )
        ).rows
      : [];

  const giftsByPlanId =
    new Map<number, BundleOfferPlanGift[]>();

  for (const row of giftRows) {
    const planId =
      Number(row.bundle_offer_plan_id);

    const gifts =
      giftsByPlanId.get(planId) ?? [];

    gifts.push(rowToBundlePlanGift(row));

    giftsByPlanId.set(planId, gifts);
  }

  return {
    items:
      itemsResult.rows.map(rowToBundleItem),

    plans:
      plansResult.rows.map((row) =>
        rowToBundlePlan(
          row,
          giftsByPlanId.get(Number(row.id)) ?? []
        )
      ),
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
  await validateProducts([
    ...input.items.map(
      (item) => item.productId
    ),
    ...input.plans.flatMap((plan) =>
      (plan.gifts ?? []).flatMap((gift) =>
        gift.productId == null
          ? []
          : [gift.productId]
      )
    ),
  ]);

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
        const planResult =
          await client.query<{
            id: number | string;
          }>(
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
              RETURNING id
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

        const planId =
          Number(planResult.rows[0].id);

        for (const gift of plan.gifts ?? []) {
          await client.query(
            `
              INSERT INTO bundle_offer_plan_gifts (
                bundle_offer_plan_id,
                product_id,
                name,
                quantity,
                unit_label,
                sort_order,
                updated_at
              )
              VALUES (
                $1,$2,$3,$4,$5,$6,NOW()
              )
            `,
            [
              planId,
              gift.productId ?? null,
              gift.name,
              gift.quantity,
              gift.unitLabel,
              gift.sortOrder ?? 0,
            ]
          );
        }
      }

      await client.query("COMMIT");

      return getBundleOffer(bundleOfferId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updateBundleOffer(
  id: number,
  input: BundleOfferWriteInput
) {
  await validateProducts([
    ...input.items.map(
      (item) => item.productId
    ),
    ...input.plans.flatMap((plan) =>
      (plan.gifts ?? []).flatMap((gift) =>
        gift.productId == null
          ? []
          : [gift.productId]
      )
    ),
  ]);

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const offerResult =
        await client.query<BundleOfferRow>(
          `
            UPDATE bundle_offers
            SET
              bundle_type = $2,
              unit_label = $3,
              allow_same_product = $4,
              sort_order = $5,
              updated_at = NOW()
            WHERE id = $1
            RETURNING *
          `,
          [
            id,
            input.bundleType,
            input.unitLabel || "組",
            input.allowSameProduct ?? false,
            input.sortOrder ?? 0,
          ]
        );

      if (!offerResult.rows[0]) {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `
          DELETE FROM bundle_offer_items
          WHERE bundle_offer_id = $1
        `,
        [id]
      );

      const planCodes = input.plans.map(
        (plan) => plan.code
      );

      await client.query(
        `
          DELETE FROM bundle_offer_plans
          WHERE bundle_offer_id = $1
            AND NOT (code = ANY($2::text[]))
        `,
        [id, planCodes]
      );

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
            id,
            item.productId,
            item.role,
            item.quantity,
            item.sortOrder ?? 0,
          ]
        );
      }

      for (const plan of input.plans) {
        const planResult =
          await client.query<{
            id: number | string;
          }>(
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
              ON CONFLICT (bundle_offer_id, code)
              DO UPDATE SET
                label = EXCLUDED.label,
                required_quantity = EXCLUDED.required_quantity,
                buy_quantity = EXCLUDED.buy_quantity,
                free_quantity = EXCLUDED.free_quantity,
                price_amount = EXCLUDED.price_amount,
                sort_order = EXCLUDED.sort_order,
                updated_at = NOW()
              RETURNING id
            `,
            [
              id,
              plan.code,
              plan.label,
              plan.requiredQuantity ?? null,
              plan.buyQuantity ?? null,
              plan.freeQuantity ?? null,
              plan.priceAmount,
              plan.sortOrder ?? 0,
            ]
          );

        const planId =
          Number(planResult.rows[0].id);

        if (plan.gifts !== undefined) {
          await client.query(
            `
              DELETE FROM bundle_offer_plan_gifts
              WHERE bundle_offer_plan_id = $1
            `,
            [planId]
          );

          for (const gift of plan.gifts) {
            await client.query(
              `
                INSERT INTO bundle_offer_plan_gifts (
                  bundle_offer_plan_id,
                  product_id,
                  name,
                  quantity,
                  unit_label,
                  sort_order,
                  updated_at
                )
                VALUES (
                  $1,$2,$3,$4,$5,$6,NOW()
                )
              `,
              [
                planId,
                gift.productId ?? null,
                gift.name,
                gift.quantity,
                gift.unitLabel,
                gift.sortOrder ?? 0,
              ]
            );
          }
        }
      }

      await client.query("COMMIT");

      return getBundleOffer(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}
export async function updateBundleOfferStatus(
  id: number,
  status: ProductStatus
) {
  const result = await dbQuery<BundleOfferRow>(
    `
      UPDATE bundle_offers
      SET
        status = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getBundleOffer(id);
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

export async function updateBundleOfferCard(
  id: number,
  input: BundleOfferCardInput
) {
  const name = input.name.trim();
  const storefrontCategory =
    input.storefrontCategory?.trim() || null;

  if (!name) {
    throw new Error("請輸入組合優惠名稱。");
  }

  if (input.status === "active" && !storefrontCategory) {
    throw new Error(
      "上架中的組合優惠必須設定前台主分類。"
    );
  }

  const result = await dbQuery<BundleOfferRow>(
    `
      UPDATE bundle_offers
      SET
        name = $2,
        cover_image = $3,
        card_subtitle = $4,
        card_original_price_text = $5,
        card_price_text = $6,
        storefront_category = $7,
        series = $8,
        status = $9,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      name,
      input.coverImage?.trim() || null,
      input.cardSubtitle?.trim() || null,
      input.cardOriginalPriceText?.trim() || null,
      input.cardPriceText?.trim() || null,
      storefrontCategory,
      input.series?.trim() || null,
      input.status,
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getBundleOffer(id);
}

export async function updateBundleOfferProductInfo(
  id: number,
  input: BundleOfferProductInfoInput
) {
  const features = Array.from(
    new Set(
      (input.features ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  const suitableFor = Array.from(
    new Set(
      (input.suitableFor ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  const gallery = Array.from(
    new Set(
      (input.gallery ?? [])
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 8);

  const expandedInfo =
    (input.expandedInfo ?? [])
      .map((item) => ({
        title: item.title.trim(),
        content: item.content.trim(),
      }))
      .filter(
        (item) =>
          item.title || item.content
      );

  const result = await dbQuery<BundleOfferRow>(
    `
      UPDATE bundle_offers
      SET
        spec = $2,
        expiry_note = $3,
        intro = $4,
        features = $5::jsonb,
        expanded_info = $6::jsonb,
        suitable_for = $7::jsonb,
        usage = $8,
        gallery = $9::jsonb,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      input.spec?.trim() || null,
      input.expiryNote?.trim() || null,
      input.intro?.trim() || null,
      JSON.stringify(features),
      JSON.stringify(expandedInfo),
      JSON.stringify(suitableFor),
      input.usage?.trim() || null,
      JSON.stringify(gallery),
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getBundleOffer(id);
}
