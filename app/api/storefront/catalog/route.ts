import { NextResponse } from "next/server";

import { getStorefrontCatalog } from "../../../../lib/catalog-repository";
import { buildFallbackStorefrontCatalog } from "../../../../lib/storefront-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const catalog = await getStorefrontCatalog();

    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "[Jourdeness] storefront catalog API failed",
      error
    );

    return NextResponse.json(
      {
        ...buildFallbackStorefrontCatalog(),
        warning: "分類資料暫時使用預設值",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
