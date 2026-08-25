import { NextResponse } from "next/server";

import {
  createOrder,
} from "@/lib/order-repository";

type OrderRequest = {
  orderNumber: string;

  customerName: string;

  lineId?: string;
  lineUserId?: string;
  lineDisplayName?: string;

  phone: string;

  deliveryMethod: string;
  address: string;
  note?: string;

  totalAmount?: number;

  items: Array<{
    itemType?: "product" | "bundle";

    productId?: number;
    bundleOfferId?: number;

    name: string;

    quantity: number;
    unitPrice: number;

    detail?: Record<string, unknown>;
  }>;
};

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as OrderRequest;

    if (
      !body.orderNumber ||
      !body.customerName ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "訂單資料不完整",
        },
        {
          status: 400,
        }
      );
    }

    const order =
      await createOrder({
        orderNumber:
          body.orderNumber,

        customerName:
          body.customerName,

        lineId:
          body.lineId ?? "",

        lineUserId:
          body.lineUserId ?? "",

        lineDisplayName:
          body.lineDisplayName ?? "",

        phone:
          body.phone ?? "",

        deliveryMethod:
          body.deliveryMethod ?? "",

        address:
          body.address ?? "",

        note:
          body.note ?? "",

        totalAmount:
          body.totalAmount ?? 0,

        items:
          body.items,
      });

    return NextResponse.json({
      ok: true,
      order,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "建立訂單失敗",
      },
      {
        status: 500,
      }
    );
  }
}