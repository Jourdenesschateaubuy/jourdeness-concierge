
import { dbQuery, withDbClient } from "./db";

export type PromotionType = "mix_match" | "buy_x_get_y";
export type PromotionStatus = "active" | "inactive";
export type GiftMode = "same_product" | "fixed_product" | "gift_pool";
export type PromotionProductRole = "eligible" | "buy" | "gift";

export type PromotionProductRef = {
  productId: number;
  name: string;
  role: PromotionProductRole;
  sortOrder: number;
};

export type Promotion = {
  id: number;
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  description?: string;

  requiredQuantity?: number;
  bundlePrice?: number;
  allowSameProduct: boolean;

  buyQuantity?: number;
  giftQuantity?: number;
  giftMode?: GiftMode;
  repeatable: boolean;

  priority: number;
  stackable: boolean;
  startsAt?: string;
  endsAt?: string;

  products: PromotionProductRef[];
  createdAt: string;
  updatedAt: string;
};

export type PromotionWriteInput = {
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  description?: string;

  requiredQuantity?: number;
  bundlePrice?: number;
  allowSameProduct: boolean;

  buyQuantity?: number;
  giftQuantity?: number;
  giftMode?: GiftMode;
  repeatable: boolean;

  priority: number;
  stackable: boolean;
  startsAt?: string;
  endsAt?: string;

  eligibleProductIds: number[];
  buyProductIds: number[];
  giftProductIds: number[];
};

type PromotionRow = {
  id: string | number;
  name: string;
  type: PromotionType;
  status: PromotionStatus;
  description: string | null;
  required_quantity: number | null;
  bundle_price: number | null;
  allow_same_product: boolean;
  buy_quantity: number | null;
  gift_quantity: number | null;
  gift_mode: GiftMode | null;
  repeatable: boolean;
  priority: number;
  stackable: boolean;
  starts_at: string | Date | null;
  ends_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type ProductRefRow = {
  promotion_id: string | number;
  product_id: number;
  name: string;
  role: PromotionProductRole;
  sort_order: number;
};

function iso(value: string | Date | null) {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

async function attachProducts(rows: PromotionRow[]) {
  if (rows.length === 0) return [] as Promotion[];

  const ids = rows.map((row) => Number(row.id));

  const refs = await dbQuery<ProductRefRow>(
    `
      SELECT
        pp.promotion_id,
        pp.product_id,
        p.name,
        pp.role,
        pp.sort_order
      FROM promotion_products pp
      JOIN products p ON p.id = pp.product_id
      WHERE pp.promotion_id = ANY($1::bigint[])
      ORDER BY pp.promotion_id, pp.role, pp.sort_order, pp.product_id
    `,
    [ids]
  );

  const byPromotion = new Map<number, PromotionProductRef[]>();

  for (const ref of refs.rows) {
    const id = Number(ref.promotion_id);
    const list = byPromotion.get(id) ?? [];
    list.push({
      productId: ref.product_id,
      name: ref.name,
      role: ref.role,
      sortOrder: ref.sort_order,
    });
    byPromotion.set(id, list);
  }

  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    type: row.type,
    status: row.status,
    description: row.description ?? undefined,

    requiredQuantity: row.required_quantity ?? undefined,
    bundlePrice: row.bundle_price ?? undefined,
    allowSameProduct: row.allow_same_product,

    buyQuantity: row.buy_quantity ?? undefined,
    giftQuantity: row.gift_quantity ?? undefined,
    giftMode: row.gift_mode ?? undefined,
    repeatable: row.repeatable,

    priority: row.priority,
    stackable: row.stackable,
    startsAt: iso(row.starts_at),
    endsAt: iso(row.ends_at),

    products: byPromotion.get(Number(row.id)) ?? [],
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

export async function listPromotions(options?: {
  includeInactive?: boolean;
}) {
  const includeInactive = options?.includeInactive ?? true;

  const result = await dbQuery<PromotionRow>(
    `
      SELECT *
      FROM promotions
      ${includeInactive ? "" : "WHERE status = 'active'"}
      ORDER BY priority DESC, id ASC
    `
  );

  return attachProducts(result.rows);
}

export async function getPromotion(id: number) {
  const result = await dbQuery<PromotionRow>(
    `SELECT * FROM promotions WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (!result.rows[0]) return null;

  const [promotion] = await attachProducts(result.rows);
  return promotion ?? null;
}

function validateInput(input: PromotionWriteInput) {
  if (!input.name.trim()) throw new Error("優惠名稱不能空白");

  if (input.type === "mix_match") {
    if (!input.requiredQuantity || input.requiredQuantity <= 0) {
      throw new Error("任搭組合必須設定需要選幾件");
    }
    if (input.bundlePrice == null || input.bundlePrice < 0) {
      throw new Error("任搭組合必須設定組合價");
    }
    if (input.eligibleProductIds.length === 0) {
      throw new Error("任搭組合至少要選一個適用商品");
    }
  }

  if (input.type === "buy_x_get_y") {
    if (!input.buyQuantity || input.buyQuantity <= 0) {
      throw new Error("買幾送幾必須設定購買數量");
    }
    if (!input.giftQuantity || input.giftQuantity <= 0) {
      throw new Error("買幾送幾必須設定贈送數量");
    }
    if (input.buyProductIds.length === 0) {
      throw new Error("買幾送幾至少要選一個購買商品");
    }

    if (
      input.giftMode !== "same_product" &&
      input.giftProductIds.length === 0
    ) {
      throw new Error("指定贈品／贈品任選至少要選一個贈品");
    }
  }
}

async function replacePromotionProducts(
  client: import("pg").PoolClient,
  promotionId: number,
  input: PromotionWriteInput
) {
  await client.query(
    `DELETE FROM promotion_products WHERE promotion_id = $1`,
    [promotionId]
  );

  const refs: Array<{
    role: PromotionProductRole;
    ids: number[];
  }> = [];

  if (input.type === "mix_match") {
    refs.push({ role: "eligible", ids: input.eligibleProductIds });
  } else {
    refs.push({ role: "buy", ids: input.buyProductIds });

    if (input.giftMode !== "same_product") {
      refs.push({ role: "gift", ids: input.giftProductIds });
    }
  }

  for (const ref of refs) {
    for (let index = 0; index < ref.ids.length; index += 1) {
      await client.query(
        `
          INSERT INTO promotion_products (
            promotion_id,
            product_id,
            role,
            sort_order
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `,
        [promotionId, ref.ids[index], ref.role, index]
      );
    }
  }
}

export async function createPromotion(input: PromotionWriteInput) {
  validateInput(input);

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const result = await client.query<{ id: string | number }>(
        `
          INSERT INTO promotions (
            name,
            type,
            status,
            description,
            required_quantity,
            bundle_price,
            allow_same_product,
            buy_quantity,
            gift_quantity,
            gift_mode,
            repeatable,
            priority,
            stackable,
            starts_at,
            ends_at,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()
          )
          RETURNING id
        `,
        [
          input.name,
          input.type,
          input.status,
          input.description || null,
          input.type === "mix_match" ? input.requiredQuantity ?? null : null,
          input.type === "mix_match" ? input.bundlePrice ?? null : null,
          input.allowSameProduct,
          input.type === "buy_x_get_y" ? input.buyQuantity ?? null : null,
          input.type === "buy_x_get_y" ? input.giftQuantity ?? null : null,
          input.type === "buy_x_get_y" ? input.giftMode ?? null : null,
          input.repeatable,
          input.priority,
          input.stackable,
          input.startsAt || null,
          input.endsAt || null,
        ]
      );

      const id = Number(result.rows[0].id);

      await replacePromotionProducts(client, id, input);

      await client.query("COMMIT");
      return getPromotion(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updatePromotion(
  id: number,
  input: PromotionWriteInput
) {
  validateInput(input);

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const result = await client.query(
        `
          UPDATE promotions
          SET
            name = $2,
            type = $3,
            status = $4,
            description = $5,
            required_quantity = $6,
            bundle_price = $7,
            allow_same_product = $8,
            buy_quantity = $9,
            gift_quantity = $10,
            gift_mode = $11,
            repeatable = $12,
            priority = $13,
            stackable = $14,
            starts_at = $15,
            ends_at = $16,
            updated_at = NOW()
          WHERE id = $1
          RETURNING id
        `,
        [
          id,
          input.name,
          input.type,
          input.status,
          input.description || null,
          input.type === "mix_match" ? input.requiredQuantity ?? null : null,
          input.type === "mix_match" ? input.bundlePrice ?? null : null,
          input.allowSameProduct,
          input.type === "buy_x_get_y" ? input.buyQuantity ?? null : null,
          input.type === "buy_x_get_y" ? input.giftQuantity ?? null : null,
          input.type === "buy_x_get_y" ? input.giftMode ?? null : null,
          input.repeatable,
          input.priority,
          input.stackable,
          input.startsAt || null,
          input.endsAt || null,
        ]
      );

      if (result.rowCount !== 1) {
        throw new Error("找不到這筆優惠");
      }

      await replacePromotionProducts(client, id, input);

      await client.query("COMMIT");
      return getPromotion(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function updatePromotionStatus(
  id: number,
  status: PromotionStatus
) {
  const result = await dbQuery(
    `
      UPDATE promotions
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `,
    [id, status]
  );

  return result.rowCount === 1;
}

export async function deletePromotion(id: number) {
  const result = await dbQuery(
    `DELETE FROM promotions WHERE id = $1 RETURNING id`,
    [id]
  );

  return result.rowCount === 1;
}
