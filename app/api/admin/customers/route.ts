import { hasValidAdminSession } from "../../../../lib/admin-auth";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createCustomer,
} from "@/lib/customer-repository";

export async function POST(
  request: NextRequest
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const customer =
      await createCustomer({
        customerName:
          String(
            body.customerName ?? ""
          ),

        phone:
          String(
            body.phone ?? ""
          ),

        lineDisplayName:
          String(
            body.lineDisplayName ?? ""
          ),

        lineId:
          String(
            body.lineId ?? ""
          ),

        note:
          String(
            body.note ?? ""
          ),
      });

    return NextResponse.json({
      ok: true,
      customer,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "建立客戶失敗",
      },
      {
        status: 400,
      }
    );
  }
}
