import { NextResponse } from "next/server";
import { listBundleOffers } from "../../../../lib/bundle-offer-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const bundleOffers = await listBundleOffers();

    const activeBundleOffers = bundleOffers
      .filter((offer) => offer.status === "active")
      .sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          a.id - b.id
      );

    return NextResponse.json(
      {
        bundleOffers: activeBundleOffers,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "[Jourdeness] storefront bundle offers API failed",
      error
    );

    return NextResponse.json(
      {
        bundleOffers: [],
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
