import { NextResponse } from "next/server";
import { updateOrderStatus } from "../../../../../lib/order-repository";

const ALLOWED_STATUSES = new Set([
  "待確認",
  "處理中",
  "已完成",
  "已取消",
]);

export async function POST(request: Request) {

  try {

    const body = await request.json();


    const orderNumber =
      String(body.orderNumber || "").trim();


    const status =
      String(body.status || "").trim();


    if (!orderNumber) {

      return NextResponse.json(
        {
          ok: false,
          message: "缺少訂單編號。",
        },
        {
          status: 400,
        }
      );

    }


    if (!ALLOWED_STATUSES.has(status)) {

      return NextResponse.json(
        {
          ok: false,
          message: "不允許的訂單狀態。",
        },
        {
          status: 400,
        }
      );

    }


    const order =
      await updateOrderStatus(
        orderNumber,
        status
      );


    if (!order) {

      return NextResponse.json(
        {
          ok: false,
          message: "找不到訂單。",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json(
      {
        ok: true,
        order,
      }
    );


  } catch (error) {

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );

  }

}
