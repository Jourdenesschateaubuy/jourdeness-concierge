import { NextResponse } from "next/server";

import {
  getBundleOffer,
  updateBundleOfferProductInfo,
  type BundleOfferProductInfoInput,
} from "../../../../../../lib/bundle-offer-repository";

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
    productInfo: {
      spec:
        bundleOffer.spec ?? "",
      expiryNote:
        bundleOffer.expiryNote ?? "",
      intro:
        bundleOffer.intro ?? "",
      features:
        bundleOffer.features ?? [],
      expandedInfo:
        bundleOffer.expandedInfo ?? [],
      suitableFor:
        bundleOffer.suitableFor ?? [],
      usage:
        bundleOffer.usage ?? "",
      gallery:
        bundleOffer.gallery ?? [],
    },
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
      (await request.json()) as BundleOfferProductInfoInput;

    if (
      body.features !== undefined &&
      !Array.isArray(body.features)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "商品特色格式錯誤。",
        },
        { status: 400 }
      );
    }

    if (
      body.suitableFor !== undefined &&
      !Array.isArray(body.suitableFor)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "適合需求格式錯誤。",
        },
        { status: 400 }
      );
    }

    if (
      body.gallery !== undefined &&
      !Array.isArray(body.gallery)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "商品圖片格式錯誤。",
        },
        { status: 400 }
      );
    }

    if (
      body.expandedInfo !== undefined &&
      !Array.isArray(body.expandedInfo)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "了解更多格式錯誤。",
        },
        { status: 400 }
      );
    }

    const bundleOffer =
      await updateBundleOfferProductInfo(
        id,
        {
          spec:
            body.spec,
          expiryNote:
            body.expiryNote,
          intro:
            body.intro,
          features:
            body.features,
          expandedInfo:
            body.expandedInfo,
          suitableFor:
            body.suitableFor,
          usage:
            body.usage,
          gallery:
            body.gallery,
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
            : "無法更新組合優惠商品資訊。",
      },
      { status: 400 }
    );
  }
}