import { ORDER_WEB_APP_URL } from "../../../lib/storefront-core";
import OrdersClient, {
  type GoogleSheetOrder,
} from "./OrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type OrdersPayload = {
  ok?: boolean;
  orders?: GoogleSheetOrder[];
  message?: string;
};

async function loadOrders() {
  try {
    const response = await fetch(ORDER_WEB_APP_URL, {
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        orders: [] as GoogleSheetOrder[],
        error: `HTTP ${response.status}`,
      };
    }

    const payload =
      (await response.json()) as OrdersPayload;

    if (!payload.ok) {
      return {
        orders: [] as GoogleSheetOrder[],
        error:
          payload.message ||
          "Google Sheet 回傳失敗",
      };
    }

    return {
      orders: Array.isArray(payload.orders)
        ? payload.orders
        : [],
      error: "",
    };
  } catch (error) {
    return {
      orders: [] as GoogleSheetOrder[],
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
