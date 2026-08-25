import {
  listOrdersWithItems,
} from "../../../lib/order-repository";

import OrdersClient, {
  type AdminOrder,
  type AdminOrderItem,
} from "./OrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function numberValue(
  value: unknown,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function detailValue(
  value: unknown
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

async function loadOrders() {
  try {
    const rows =
      await listOrdersWithItems();

    const orders =
      rows.map((order: any) => {
        const items: AdminOrderItem[] =
          Array.isArray(order.items)
            ? order.items.map(
                (item: any) => ({
                  itemType:
                    item.item_type === "bundle"
                      ? "bundle"
                      : "product",

                  productId:
                    item.product_id == null
                      ? null
                      : numberValue(
                          item.product_id
                        ),

                  bundleOfferId:
                    item.bundle_offer_id == null
                      ? null
                      : numberValue(
                          item.bundle_offer_id
                        ),

                  name:
                    String(
                      item.name ?? ""
                    ),

                  quantity:
                    numberValue(
                      item.quantity,
                      1
                    ),

                  unitPrice:
                    numberValue(
                      item.unit_price
                    ),

                  detail:
                    detailValue(
                      item.detail
                    ),
                })
              )
            : [];

        return {
          id:
            numberValue(order.id),

          orderTime:
            order.order_time
              ? String(order.order_time)
              : "",

          orderNumber:
            String(
              order.order_number ?? ""
            ),

          customerName:
            String(
              order.customer_name ?? ""
            ),

          lineId:
            String(
              order.line_id ?? ""
            ),

          lineUserId:
            String(
              order.line_user_id ?? ""
            ),

          lineDisplayName:
            String(
              order.line_display_name ?? ""
            ),

          phone:
            String(
              order.phone ?? ""
            ),

          deliveryMethod:
            String(
              order.delivery_method ?? ""
            ),

          address:
            String(
              order.address ?? ""
            ),

          note:
            String(
              order.note ?? ""
            ),

          totalAmount:
            numberValue(
              order.total_amount
            ),

          status:
            String(
              order.status ?? "待確認"
            ) as AdminOrder["status"],

          items,
        } satisfies AdminOrder;
      });

    return {
      orders,
      error: "",
    };
  } catch (error) {
    return {
      orders: [] as AdminOrder[],

      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

export default async function OrdersPage() {
  const { orders, error } =
    await loadOrders();

  return (
    <OrdersClient
      orders={orders}
      loadError={error}
    />
  );
}