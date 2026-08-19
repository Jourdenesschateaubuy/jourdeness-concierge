import { NextResponse } from "next/server";

import {
  getBundleOffer,
  updateBundleOfferCard,
  type BundleOfferCardInput,
} from "../../../../../../lib/bundle-offer-repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const validStatuses = new Set([
  "active",
  "inactive",
  "coming_soon",
  "sold_out",
]);

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

  const bundleOffer =
    await getBundleOffer(id);

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
      (await request.json()) as BundleOfferCardInput;

    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "請輸入組合優惠名稱。",
        },
        { status: 400 }
      );
    }

    if (
      typeof body.status !== "string" ||
      !validStatuses.has(body.status)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "商品狀態格式錯誤。",
        },
        { status: 400 }
      );
    }

    const bundleOffer =
      await updateBundleOfferCard(
        id,
        {
          name: body.name,
          coverImage: body.coverImage,
          cardSubtitle:
            body.cardSubtitle,
          cardOriginalPriceText:
            body.cardOriginalPriceText,
          cardPriceText:
            body.cardPriceText,
          storefrontCategory:
            body.storefrontCategory,
          series:
            body.series,
          status:
            body.status,
        }
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
            : "無法更新組合優惠商品卡。",
      },
      { status: 400 }
    );
  }
}