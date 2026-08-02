import { NextResponse } from "next/server";

import { hasValidAdminSession } from "../../../../../lib/admin-auth";
import {
  createCatalogSeries,
  getStorefrontCatalog,
  updateCatalogCategoryStatus,
  updateCatalogSeriesCategory,
  updateCatalogSeriesName,
  updateCatalogSeriesSortOrder,
  updateCatalogSeriesStatus,
} from "../../../../../lib/catalog-repository";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  return hasValidAdminSession();
}

async function readCatalog() {
  return getStorefrontCatalog({
    includeInactive: true,
  });
}

function errorResponse(
  error: unknown,
  fallback: string,
  status = 400
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

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    return NextResponse.json(await readCatalog());
  } catch (error) {
    console.error(
      "[Jourdeness Studio] catalog GET failed",
      error
    );
    return errorResponse(
      error,
      "分類與系列讀取失敗",
      500
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      entity?: "series";
      categoryId?: number;
      name?: string;
    };

    const createdSeries =
      await createCatalogSeries(
        Number(body.categoryId),
        body.name ?? ""
      );

    return NextResponse.json({
      ...(await readCatalog()),
      createdSeries,
      message: "系列已新增",
    });
  } catch (error) {
    console.error(
      "[Jourdeness Studio] catalog POST failed",
      error
    );
    return errorResponse(error, "新增系列失敗");
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    if (body.entity === "category") {
      const id = Number(body.id);

      if (body.action === "status") {
        await updateCatalogCategoryStatus(
          id,
          Boolean(body.isActive)
        );
      } else {
        throw new Error(
          "前台主分類名稱固定，只能啟用或停用"
        );
      }
    } else if (body.entity === "series") {
      const id = Number(body.id);

      if (body.action === "rename") {
        await updateCatalogSeriesName(
          id,
          String(body.name ?? "")
        );
      } else if (body.action === "status") {
        await updateCatalogSeriesStatus(
          id,
          Boolean(body.isActive)
        );
      } else if (body.action === "category") {
        await updateCatalogSeriesCategory(
          id,
          Number(body.categoryId)
        );
      } else if (body.action === "sort") {
        await updateCatalogSeriesSortOrder(
          Number(body.categoryId),
          Array.isArray(body.orderedIds)
            ? body.orderedIds.map(Number)
            : []
        );
      } else {
        throw new Error("不支援的系列操作");
      }
    } else {
      throw new Error("資料類型不正確");
    }

    return NextResponse.json({
      success: true,
      ...(await readCatalog()),
    });
  } catch (error) {
    console.error(
      "[Jourdeness Studio] catalog PATCH failed",
      error
    );
    return errorResponse(error, "更新失敗");
  }
}
