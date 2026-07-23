import { NextResponse } from "next/server";
import { listDatabaseProducts } from "../../../../lib/product-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const databaseProducts = await listDatabaseProducts({
      includeInactive: true,
    });

    const products = databaseProducts
      .filter((product) => product.status !== "inactive")
      .map((product) => ({
        ...product,
        category:
          product.status === "coming_soon"
            ? "新品預告"
            : product.category,
      }));

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Jourdeness] storefront products API failed", error);

    return NextResponse.json(
      { products: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
