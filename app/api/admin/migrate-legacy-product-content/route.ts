import { NextResponse } from "next/server";

import {
  listDatabaseProducts,
  updateDatabaseProductPartial,
} from "../../../../lib/product-repository";

import {
  productContentOverrides,
  productContentOverridesV362,
  productContentOverridesV376,
  productContentOverridesV377,
} from "../../../../lib/storefront-core";

function legacyContent(productId: number) {
  return {
    ...(productContentOverrides[productId] ?? {}),
    ...(productContentOverridesV362[productId] ?? {}),
    ...(productContentOverridesV376[productId] ?? {}),
    ...(productContentOverridesV377[productId] ?? {}),
  };
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function pickText(
  current: string | undefined,
  legacy: string | undefined
) {
  return hasText(current)
    ? current
    : hasText(legacy)
      ? legacy
      : undefined;
}

function pickList(
  current: string[] | undefined,
  legacy: string[] | undefined
) {
  return current?.length
    ? current
    : legacy?.length
      ? legacy
      : [];
}

function pickExpanded(
  current:
    | Array<{ title: string; content: string }>
    | undefined,
  legacy:
    | Array<{ title: string; content: string }>
    | undefined
) {
  return current?.length
    ? current
    : legacy?.length
      ? legacy
      : [];
}

async function buildMigration(apply: boolean) {
  if (process.env.NODE_ENV !== "development") {
    return {
      ok: false,
      message: "此搬家工具只能在 development 執行。",
    };
  }

  const products = await listDatabaseProducts({
    includeInactive: true,
  });

  const report: Array<{
    id: number;
    name: string;
    changedFields: string[];
  }> = [];

  for (const product of products) {
    if (![1, 59, 61].includes(product.id)) {
      continue;
    }
    const legacy = legacyContent(product.id);
    const changedFields: string[] = [];
    const spec = pickText(
      product.spec,
      legacy.spec
    );

    const intro = pickText(
      product.intro,
      legacy.intro
    );
    const expiryNote = pickText(
      product.expiryNote,
      legacy.expiryNote
    );

    const usage = pickText(
      product.usage,
      legacy.usage
    );
    const features = pickList(
      product.features,
      legacy.features
    );

    const suitableFor = pickList(
      product.suitableFor,
      legacy.suitableFor
    );

    const gallery = pickList(
      product.gallery,
      legacy.gallery
    );

    const expandedInfo = pickExpanded(
      product.expandedInfo,
      legacy.expandedInfo
    );
    if (
      !hasText(product.spec) &&
      hasText(legacy.spec)
    ) {
      changedFields.push("規格／組合內容");
    }

    if (
      !hasText(product.intro) &&
      hasText(legacy.intro)
    ) {
      changedFields.push("商品簡介");
    }
    if (
      !hasText(product.expiryNote) &&
      hasText(legacy.expiryNote)
    ) {
      changedFields.push("效期");
    }

    if (
      !product.features?.length &&
      legacy.features?.length
    ) {
      changedFields.push(
        `商品特色 ${legacy.features.length} 條`
      );
    }

    if (
      !product.suitableFor?.length &&
      legacy.suitableFor?.length
    ) {
      changedFields.push(
        `適合需求 ${legacy.suitableFor.length} 個`
      );
    }

    if (
      !hasText(product.usage) &&
      hasText(legacy.usage)
    ) {
      changedFields.push("使用方式");
    }
    if (
      !product.gallery?.length &&
      legacy.gallery?.length
    ) {
      changedFields.push(
        `更多商品圖片 ${legacy.gallery.length} 張`
      );
    }

    if (
      !product.expandedInfo?.length &&
      legacy.expandedInfo?.length
    ) {
      changedFields.push(
        `了解更多 ${legacy.expandedInfo.length} 段`
      );
    }

    if (changedFields.length === 0) {
      continue;
    }

    report.push({
      id: product.id,
      name: product.name,
      changedFields,
    });

    if (!apply) continue;

    await updateDatabaseProductPartial(product.id, {
      spec,
      intro,
      expiryNote,
      features,
      suitableFor,
      usage,
      gallery,
      expandedInfo,
    });
  }

  return {
    ok: true,
    mode: apply ? "APPLY" : "PREVIEW",
    affectedProducts: report.length,
    report,
  };
}

export async function GET() {
  return NextResponse.json(
    await buildMigration(false)
  );
}

export async function POST() {
  return NextResponse.json(
    await buildMigration(true)
  );
}
