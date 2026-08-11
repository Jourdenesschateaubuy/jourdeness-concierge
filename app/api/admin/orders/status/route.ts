import { NextResponse } from "next/server";
import { ORDER_WEB_APP_URL } from "../../../../../lib/storefront-core";

const ALLOWED_STATUSES = new Set([
  "待確認",
  "處理中",
  "已完成",
  "已取消",
]);

export async function POST(request: Request) {
  try {
    const adminKey =
      process.env.ORDER_ADMIN_UPDATE_KEY;

    if (!adminKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "尚未設定 ORDER_ADMIN_UPDATE_KEY。",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const row = Number(body.row);
    const orderNumber = String(
      body.orderNumber || ""
    ).trim();
    const status = String(
      body.status || ""
    ).trim();

    if (!Number.isInteger(row) || row < 2) {
      return NextResponse.json(
        {
          ok: false,
          message: "無效的訂單列號。",
        },
        { status: 400 }
      );
    }

    if (!orderNumber) {
      return NextResponse.json(
        {
          ok: false,
          message: "缺少訂單編號。",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        {
          ok: false,
          message: "不允許的訂單狀態。",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      ORDER_WEB_APP_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          action: "updateStatus",
          adminKey,
          row,
          orderNumber,
          status,
        }),
        cache: "no-store",
        redirect: "follow",
      }
    );

    const raw = await response.text();

    let payload: {
      ok?: boolean;
      message?: string;
      [key: string]: unknown;
    };

    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Google Apps Script 未回傳 JSON。",
          raw: raw.slice(0, 300),
        },
        { status: 502 }
      );
    }

    if (!response.ok || !payload.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            payload.message ||
            `Google Apps Script HTTP ${response.status}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}
