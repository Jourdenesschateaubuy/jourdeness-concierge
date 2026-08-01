import { NextResponse } from "next/server";

import { hasValidAdminSession } from "../../../../../lib/admin-auth";
import {
  getDatabaseProduct,
  updateDatabaseProduct,
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
  if (!Array.isArray(value)) {
    return null;
  }

  if (
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
    if (
      !item ||
      typeof item !== "object"
    ) {
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

    if (!title && !content) {
      continue;
    }

    result.push({
      title,
      content,
    });
  }

  return result;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      {
        error: "尚未登入管理後台",
      },
      {
        status: 401,
      }
    );
  }

  const productId =
    await readProductId(context);

  if (!productId) {
    return NextResponse.json(
      {
        error: "商品編號不正確",
      },
      {
        status: 400,
      }
    );
  }

  const product =
    await getDatabaseProduct(productId);

  if (!product) {
    return NextResponse.json(
      {
        error: "找不到商品",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    product,
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      {
        error: "尚未登入管理後台",
      },
      {
        status: 401,
      }
    );
  }

  const productId =
    await readProductId(context);

  if (!productId) {
    return NextResponse.json(
      {
        error: "商品編號不正確",
      },
      {
        status: 400,
      }
    );
  }

  const existingProduct =
    await getDatabaseProduct(productId);

  if (!existingProduct) {
    return NextResponse.json(
      {
        error: "找不到商品",
      },
      {
        status: 404,
      }
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
      {
        status: 400,
      }
    );
  }

  const nextProduct = {
    ...existingProduct,
  } as Record<string, unknown>;

  for (const field of editableStringFields) {
    if (!(field in body)) continue;

    const value = body[field];

    if (field === "status") {
      if (
        typeof value !== "string" ||
        !validStatuses.has(value)
      ) {
        return NextResponse.json(
          {
            error: "商品狀態不正確",
          },
          {
            status: 400,
          }
        );
      }

      nextProduct[field] = value;
      continue;
    }

    if (value === null) {
      nextProduct[field] = null;
      continue;
    }

    if (typeof value !== "string") {
      return NextResponse.json(
        {
          error: `${field} 的資料格式不正確`,
        },
        {
          status: 400,
        }
      );
    }

    nextProduct[field] = value.trim();
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
        {
          status: 400,
        }
      );
    }

    nextProduct[field] =
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
        {
          status: 400,
        }
      );
    }

    nextProduct.expandedInfo =
      expandedInfo;
  }

  if (
    !String(nextProduct.name ?? "").trim()
  ) {
    return NextResponse.json(
      {
        error: "商品名稱不能空白",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !String(nextProduct.price ?? "").trim()
  ) {
    return NextResponse.json(
      {
        error: "商品售價不能空白",
      },
      {
        status: 400,
      }
    );
  }

  const previousImage =
    typeof existingProduct.image === "string"
      ? existingProduct.image
      : "";

  const nextImage =
    typeof nextProduct.image === "string"
      ? nextProduct.image
      : "";

  await updateDatabaseProduct(
    productId,
    nextProduct as Parameters<
      typeof updateDatabaseProduct
    >[1]
  );

  const updatedProduct =
    await getDatabaseProduct(productId);

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
}
