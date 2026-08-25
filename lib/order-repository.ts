import {
  dbQuery,
  withDbClient,
} from "./db";

export type OrderItemInput = {
  itemType?: "product" | "bundle";

  productId?: number;
  bundleOfferId?: number;

  name: string;
  quantity: number;
  unitPrice: number;

  detail?: Record<string, unknown>;
};

export type CreateOrderInput = {
  orderNumber: string;

  orderTime?: string;

  customerName: string;

  lineId?: string;
  lineUserId?: string;
  lineDisplayName?: string;

  phone: string;

  deliveryMethod: string;
  address: string;
  note?: string;

  totalAmount?: number;

  status?: string;

  items: OrderItemInput[];
};

export async function createOrder(
  input: CreateOrderInput
) {
  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const totalAmount =
        Number.isFinite(input.totalAmount)
          ? Math.max(
              0,
              Math.round(input.totalAmount ?? 0)
            )
          : 0;

      const orderResult =
        await client.query(
          `
            INSERT INTO orders (
              order_number,
              order_time,
              customer_name,
              line_id,
              line_user_id,
              line_display_name,
              phone,
              delivery_method,
              address,
              note,
              total_amount,
              status
            )
            VALUES (
              $1,
              COALESCE($2::timestamptz, NOW()),
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              $9,
              $10,
              $11,
              $12
            )
            RETURNING *
          `,
          [
            input.orderNumber,
            input.orderTime ?? null,
            input.customerName,
            input.lineId ?? "",
            input.lineUserId ?? "",
            input.lineDisplayName ?? "",
            input.phone,
            input.deliveryMethod,
            input.address,
            input.note ?? "",
            totalAmount,
            input.status ?? "待確認",
          ]
        );

      const order = orderResult.rows[0];

      for (const item of input.items) {
        await client.query(
          `
            INSERT INTO order_items (
              order_id,
              item_type,
              product_id,
              bundle_offer_id,
              name,
              quantity,
              unit_price,
              detail
            )
            VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8
            )
          `,
          [
            order.id,
            item.itemType ?? "product",
            item.productId ?? null,
            item.bundleOfferId ?? null,
            item.name,
            item.quantity,
            item.unitPrice,
            item.detail ?? {},
          ]
        );
      }

      await client.query("COMMIT");

      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function listOrders() {
  const result =
    await dbQuery(
      `
        SELECT *
        FROM orders
        ORDER BY created_at DESC
      `
    );

  return result.rows;
}

export async function listOrdersWithItems() {
  const result =
    await dbQuery(
      `
        SELECT
          orders.*,

          COALESCE(
            json_agg(
              json_build_object(
                'item_type', order_items.item_type,
                'product_id', order_items.product_id,
                'bundle_offer_id', order_items.bundle_offer_id,
                'name', order_items.name,
                'quantity', order_items.quantity,
                'unit_price', order_items.unit_price,
                'detail', order_items.detail
              )
              ORDER BY order_items.id
            )
            FILTER (
              WHERE order_items.id IS NOT NULL
            ),
            '[]'::json
          ) AS items

        FROM orders

        LEFT JOIN order_items
          ON orders.id = order_items.order_id

        GROUP BY orders.id

        ORDER BY orders.created_at DESC
      `
    );

  return result.rows;
}

export async function updateOrderStatus(
  orderNumber: string,
  status: string
) {
  const result =
    await dbQuery(
      `
        UPDATE orders

        SET
          status = $1,
          updated_at = NOW()

        WHERE order_number = $2

        RETURNING *
      `,
      [
        status,
        orderNumber,
      ]
    );

  return result.rows[0] ?? null;
}

export async function deleteOrder(
  id: number
) {
  await dbQuery(
    `
      DELETE FROM orders
      WHERE id = $1
    `,
    [id]
  );
}