import { NextRequest, NextResponse } from "next/server";

import {
  getSiteStudioConfig,
  getSiteStudioDraftConfig,
} from "../../../../lib/site-studio-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest
) {
  try {
    const mode =
      request.nextUrl.searchParams.get(
        "mode"
      );

    const config =
      mode === "draft"
        ? await getSiteStudioDraftConfig()
        : await getSiteStudioConfig();

    return NextResponse.json(
      {
        config,
        mode:
          mode === "draft"
            ? "draft"
            : "published",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Jourdeness] site studio API failed",
      error
    );

    return NextResponse.json(
      {
        error:
          "首頁設定載入失敗",
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}
