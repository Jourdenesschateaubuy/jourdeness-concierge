import { hasValidAdminSession } from "../../../../lib/admin-auth";
import { NextResponse } from "next/server";

import {
  createBundleOffer,
  listBundleOffers,
  type BundleOfferWriteInput,
} from "../../../../lib/bundle-offer-repository";

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  const bundleOffers = await listBundleOffers();

  return NextResponse.json({
    ok: true,
    bundleOffers,
  });
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as BundleOfferWriteInput;

  const bundleOffer = await createBundleOffer(body);

  return NextResponse.json({
    ok: true,
    bundleOffer,
  });
}
