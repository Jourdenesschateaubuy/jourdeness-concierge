import { NextResponse } from "next/server";
import { hasValidAdminSession } from "../../../../../lib/admin-auth";
import {
  createCatalogSeries,
  getCatalogCategories,
  getCatalogSeries,
} from "../../../../../lib/catalog-repository";

const STOREFRONT_CATEGORY_NAMES = new Set([
  "臉部保養",
  "身體洗護",
  "健康補給",
  "精油香氛",
  "新品預告",
]);

export async function GET() {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "未登入後台" },
      { status: 401 }
    );
  }

  try {
    const [allCategories, allSeries] = await Promise.all([
      getCatalogCategories(),
      getCatalogSeries(),
    ]);

    const categories = allCategories.filter((category) =>
      STOREFRONT_CATEGORY_NAMES.has(category.name)
    );

    const allowedCategoryIds = new Set(
      categories.map((category) => category.id)
    );

    const series = allSeries.filter((item) =>
      allowedCategoryIds.has(item.categoryId)
    );

    return NextResponse.json({
      categories,
      series,
    });
  } catch (error) {
    console.error("Catalog series GET failed:", error);

    return NextResponse.json(
      { error: "讀取系列資料失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "未登入後台" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      categoryId?: unknown;
      name?: unknown;
    };

    const categoryId = Number(body.categoryId);
    const name = String(body.name ?? "").trim();

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: "請選擇所屬分類" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "系列名稱不能空白" },
        { status: 400 }
      );
    }

    const categories = await getCatalogCategories();

    const category = categories.find(
      (item) =>
        item.id === categoryId &&
        STOREFRONT_CATEGORY_NAMES.has(item.name)
    );

    if (!category) {
      return NextResponse.json(
        { error: "此分類不可用於前台系列" },
        { status: 400 }
      );
    }

    const series = await createCatalogSeries(categoryId, name);

    return NextResponse.json(
      {
        success: true,
        series,
      },
      { status: 201 }
    );
  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    if (code === "23505") {
      return NextResponse.json(
        { error: "這個分類已經有相同名稱的系列" },
        { status: 409 }
      );
    }

    console.error("Catalog series POST failed:", error);

    return NextResponse.json(
      { error: "新增系列失敗" },
      { status: 500 }
    );
  }
}
