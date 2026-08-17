import { NextResponse } from "next/server";

import {
  deleteBundleOffer,
  getBundleOffer,
} from "../../../../../lib/bundle-offer-repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid bundle offer id.",
      },
      { status: 400 }
    );
  }

  const bundleOffer = await getBundleOffer(id);

  if (!bundleOffer) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bundle offer not found.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    bundleOffer,
  });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid bundle offer id.",
      },
      { status: 400 }
    );
  }

  const deleted = await deleteBundleOffer(id);

  if (!deleted) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bundle offer not found.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    deletedId: id,
  });
}
