import { NextResponse } from "next/server";

import {
  createBundleOffer,
  listBundleOffers,
  type BundleOfferWriteInput,
} from "../../../../lib/bundle-offer-repository";

export async function GET() {
  const bundleOffers = await listBundleOffers();

  return NextResponse.json({
    ok: true,
    bundleOffers,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as BundleOfferWriteInput;

  const bundleOffer = await createBundleOffer(body);

  return NextResponse.json({
    ok: true,
    bundleOffer,
  });
}
