import { NextResponse } from "next/server";

import { getSiteStudioConfig } from "../../../../lib/site-studio-repository";
import { DEFAULT_SITE_STUDIO_CONFIG } from "../../../../lib/site-studio-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getSiteStudioConfig();

    return NextResponse.json(
      { config },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Jourdeness] storefront site-studio API failed",
      error
    );

    return NextResponse.json(
      {
        config: DEFAULT_SITE_STUDIO_CONFIG,
        warning: "首頁設定暫時使用預設值",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
