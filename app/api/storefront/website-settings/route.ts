import { NextResponse } from "next/server";

import {
  getPublishedWebsiteSettings,
} from "../../../../lib/cms/modules/website-settings/repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings =
      await getPublishedWebsiteSettings();

    return NextResponse.json(
      { settings },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Jourdeness] website settings API failed",
      error
    );

    return NextResponse.json(
      {
        error: "網站設定載入失敗",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
