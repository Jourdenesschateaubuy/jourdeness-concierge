import { NextResponse } from "next/server";
import {
  getCatalogCategories,
  getProductCatalogCategoryAssignments,
} from "../../../../lib/catalog-repository";
import { listDatabaseProducts } from "../../../../lib/product-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [
      databaseProducts,
      catalogCategories,
      productCategoryAssignments,
    ] = await Promise.all([
      listDatabaseProducts({
        includeInactive: true,
      }),
      getCatalogCategories({
        includeInactive: true,
      }),
      getProductCatalogCategoryAssignments(),
    ]);

    const categoryNameById =
      new Map(
        catalogCategories.map(
          (category) => [
            category.id,
            category.name,
          ]
        )
      );

    const categoryNamesByProductId =
      new Map<number, string[]>();

    for (
      const assignment
      of productCategoryAssignments
    ) {
      const categoryName =
        categoryNameById.get(
          assignment.categoryId
        );

      if (!categoryName) {
        continue;
      }

      const current =
        categoryNamesByProductId.get(
          assignment.productId
        ) ?? [];

      if (
        !current.includes(
          categoryName
        )
      ) {
        current.push(
          categoryName
        );
      }

      categoryNamesByProductId.set(
        assignment.productId,
        current
      );
    }

    const products = databaseProducts
      .filter((product) => product.status !== "inactive")
      .map((product) => ({
        ...product,
        storefrontCategories:
          categoryNamesByProductId.get(
            product.id
          ) ?? [],
        category:
          product.status === "coming_soon"
            ? "新品預告"
            : product.category,
      }));

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Jourdeness] storefront products API failed", error);

    return NextResponse.json(
      { products: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
