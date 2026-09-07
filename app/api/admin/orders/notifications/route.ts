import { NextResponse } from "next/server";

import {
  getOrderNotificationSnapshot,
} from "../../../../../lib/order-repository";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    const url =
      new URL(request.url);

    const parsedAfterId =
      Number(
        url.searchParams.get("afterId") ?? "0"
      );

    const afterId =
      Number.isInteger(parsedAfterId) &&
      parsedAfterId >= 0
        ? parsedAfterId
        : 0;

    const snapshot =
      await getOrderNotificationSnapshot(
        afterId
      );

    return NextResponse.json({
      ok: true,
      ...snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "無法取得新訂單通知。",
      },
      {
        status: 500,
      }
    );
  }
}
