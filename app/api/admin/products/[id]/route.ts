import { NextResponse } from "next/server";

import { hasValidAdminSession } from "../../../../../lib/admin-auth";
import {
  getDatabaseProduct,
  updateDatabaseProductPartial,
  type ProductPartialUpdate,
} from "../../../../../lib/product-repository";
import { deleteUploadedImage } from "../../../../../lib/upload-storage";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ExpandedInfoItem = {
  title: string;
  content: string;
};

const editableStringFields = [
  "name",
  "sku",
  "originalPrice",
  "price",
  "priceNote",
  "status",
  "category",
  "storefrontCategory",
  "series",
  "image",
  "spec",
  "description",
  "intro",
  "cardName",
  "cardSubtitle",
  "expiryNote",
  "usage",
  "notice",
] as const;

const editableStringArrayFields = [
  "features",
  "suitableFor",
  "gallery",
] as const;

const validStatuses = new Set([
  "active",
  "inactive",
  "coming_soon",
  "sold_out",
]);

async function readProductId(context: RouteContext) {
  const params = await context.params;
  const productId = Number(params.id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    return null;
  }

  return productId;
}

function cleanStringArray(value: unknown) {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string")
  ) {
    return null;
  }

  return Array.from(
    new Set(
      value
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function cleanExpandedInfo(
  value: unknown
): ExpandedInfoItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const result: ExpandedInfoItem[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const record =
      item as Record<string, unknown>;

    if (
      typeof record.title !== "string" ||
      typeof record.content !== "string"
    ) {
      return null;
    }

    const title = record.title.trim();
    const content = record.content.trim();

    if (!title && !content) continue;

    result.push({ title, content });
  }

  return result;
}

function normalizeMoneyValue(
  value: string,
  kind: "original" | "selling"
) {
  const clean = value.trim();

  if (!clean) return "";

  const label =
    kind === "original"
      ? "(?:原價)?"
      : "(?:產地價|售價|活動價|組合價)?";

  const match = clean.match(
    new RegExp(
      `^${label}\\s*\\$?\\s*([\\d,]+)$`
    )
  );

  return match?.[1]?.replace(/,/g, "") ?? clean;
}

function errorResponse(
  error: unknown,
  fallback: string,
  status = 500
) {
  const message =
    error instanceof Error
      ? error.message
      : fallback;

  return NextResponse.json(
    { error: message },
    { status }
  );
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    const productId =
      await readProductId(context);

    if (!productId) {
      return NextResponse.json(
        { error: "商品編號不正確" },
        { status: 400 }
      );
    }

    const product =
      await getDatabaseProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: "找不到商品" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error(
      "[Jourdeness Studio] product GET failed",
      error
    );
    return errorResponse(
      error,
      "商品讀取失敗"
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    const productId =
      await readProductId(context);

    if (!productId) {
      return NextResponse.json(
        { error: "商品編號不正確" },
        { status: 400 }
      );
    }

    const existingProduct =
      await getDatabaseProduct(productId);

    if (!existingProduct) {
      return NextResponse.json(
        { error: "找不到商品" },
        { status: 404 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return NextResponse.json(
        {
          error:
            "送出的商品資料格式不正確",
        },
        { status: 400 }
      );
    }

    const patch: ProductPartialUpdate = {};

    for (const field of editableStringFields) {
      if (!(field in body)) continue;

      const value = body[field];

      if (field === "status") {
        if (
          typeof value !== "string" ||
          !validStatuses.has(value)
        ) {
          return NextResponse.json(
            { error: "商品狀態不正確" },
            { status: 400 }
          );
        }

        patch.status =
          value as ProductPartialUpdate["status"];
        continue;
      }

      if (
        value !== null &&
        typeof value !== "string"
      ) {
        return NextResponse.json(
          {
            error: `${field} 的資料格式不正確`,
          },
          { status: 400 }
        );
      }

      const cleanValue =
        typeof value === "string"
          ? value.trim()
          : "";

      if (field === "originalPrice") {
        patch.originalPrice =
          normalizeMoneyValue(
            cleanValue,
            "original"
          );
      } else if (field === "price") {
        patch.price = normalizeMoneyValue(
          cleanValue,
          "selling"
        );
      } else {
        (
          patch as Record<string, unknown>
        )[field] = cleanValue;
      }
    }

    for (
      const field of editableStringArrayFields
    ) {
      if (!(field in body)) continue;

      const value = cleanStringArray(
        body[field]
      );

      if (!value) {
        return NextResponse.json(
          {
            error: `${field} 的資料格式不正確`,
          },
          { status: 400 }
        );
      }

      (
        patch as Record<string, unknown>
      )[field] =
        field === "gallery"
          ? value.slice(0, 8)
          : value;
    }

    if ("expandedInfo" in body) {
      const expandedInfo =
        cleanExpandedInfo(body.expandedInfo);

      if (!expandedInfo) {
        return NextResponse.json(
          {
            error:
              "expandedInfo 的資料格式不正確",
          },
          { status: 400 }
        );
      }

      patch.expandedInfo = expandedInfo;
    }

    const nextName =
      typeof patch.name === "string"
        ? patch.name
        : existingProduct.name;

    const nextPrice =
      typeof patch.price === "string"
        ? patch.price
        : existingProduct.price;

    if (!nextName.trim()) {
      return NextResponse.json(
        { error: "商品名稱不能空白" },
        { status: 400 }
      );
    }

    if (!nextPrice.trim()) {
      return NextResponse.json(
        { error: "商品售價不能空白" },
        { status: 400 }
      );
    }

    const previousImage =
      existingProduct.image ?? "";
    const nextImage =
      typeof patch.image === "string"
        ? patch.image
        : previousImage;

    const updatedProduct =
      await updateDatabaseProductPartial(
        productId,
        patch
      );

    if (!updatedProduct) {
      throw new Error("商品儲存後找不到資料");
    }

    if (
      previousImage &&
      nextImage &&
      previousImage !== nextImage
    ) {
      try {
        await deleteUploadedImage(
          previousImage
        );
      } catch (error) {
        console.error(
          "[Jourdeness Studio] 舊商品圖片刪除失敗：",
          error
        );
      }
    }

    return NextResponse.json({
      product: updatedProduct,
      message: "商品已儲存",
    });
  } catch (error) {
    console.error(
      "[Jourdeness Studio] product PATCH failed",
      error
    );

    return errorResponse(
      error,
      "商品儲存失敗"
    );
  }
}
