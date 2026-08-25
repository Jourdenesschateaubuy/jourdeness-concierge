import { listOrdersWithItems } from "../../../lib/order-repository";
import OrdersClient, {
  type AdminOrder,
} from "./OrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;


async function loadOrders() {
  try {
    const rows = await listOrdersWithItems();

    return {
      orders: rows.map((order) => ({
        "訂單時間":
          order.order_time ?? "",

        "訂單編號":
          order.order_number,

        "姓名":
          order.customer_name,

        "LINE ID":
          order.line_id ?? "",

        "電話":
          order.phone,

        "取貨方式":
          order.delivery_method,

        "商品內容":
          Array.isArray(order.items)
            ? order.items
                .map(
                  (item: any) =>
                    `${item.name} × ${item.quantity}`
                )
                .join("\n")
            : "",

        "備註":
          order.note ?? "",

        "狀態":
          order.status,
      })) as AdminOrder[],

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
