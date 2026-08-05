import { NextResponse } from "next/server";
import { getCatalogCategories, getCatalogSeries } from "../../../../lib/catalog-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [categories, series] = await Promise.all([
      getCatalogCategories(),
      getCatalogSeries(),
    ]);

    return NextResponse.json(
      { categories, series },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("[Jourdeness] catalog API failed", error);
    return NextResponse.json(
      { categories: [], series: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
