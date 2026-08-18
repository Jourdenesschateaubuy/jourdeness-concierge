import { NextResponse } from "next/server";

import {
  deleteBundleOffer,
  getBundleOffer,
  updateBundleOffer,
  updateBundleOfferStatus,
  type BundleOfferWriteInput,
} from "../../../../../lib/bundle-offer-repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseId(rawId: string) {
  const id = Number(rawId);

  return Number.isInteger(id) && id > 0
    ? id
    : null;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
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

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid bundle offer id.",
      },
      { status: 400 }
    );
  }

  try {
    const body = (await request.json()) as {
      status?: string;
    };

    const allowedStatuses = [
      "active",
      "inactive",
      "coming_soon",
      "sold_out",
    ] as const;

    if (
      !body.status ||
      !allowedStatuses.includes(
        body.status as (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid bundle offer status.",
        },
        { status: 400 }
      );
    }

    const bundleOffer =
      await updateBundleOfferStatus(
        id,
        body.status as (typeof allowedStatuses)[number]
      );

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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update bundle offer status.",
      },
      { status: 400 }
    );
  }
}
export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid bundle offer id.",
      },
      { status: 400 }
    );
  }

  try {
    const body =
      (await request.json()) as BundleOfferWriteInput;

    const bundleOffer =
      await updateBundleOffer(id, body);

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
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update bundle offer.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id: rawId } = await context.params;
  const id = parseId(rawId);

  if (id === null) {
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
