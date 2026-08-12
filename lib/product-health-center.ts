import type {
  CatalogCategory,
  CatalogSeries,
} from "./catalog-repository";

import {
  buildProductHealthReport as buildBaseProductHealthReport,
  type ProductHealthIssue,
  type ProductHealthReport,
} from "./product-health";

import {
  checkProductMediaHealth,
  isMediaAssetImage,
} from "./product-media-health";

import type {
  DatabaseProduct,
} from "./product-repository";

export async function buildProductHealthReport(
  input: {
    products: DatabaseProduct[];
    categories: CatalogCategory[];
    series: CatalogSeries[];
  }
): Promise<ProductHealthReport> {
  const baseReport =
    await buildBaseProductHealthReport(
      input
    );

  /*
   * Media Library 圖片使用
   * /api/studio/media/{id}/file
   *
   * 舊版 product-health.ts 會把這種 API URL
   * 當成 public 本機路徑，因此可能誤判
   * missing-image。
   *
   * 這裡先移除這類 false positive。
   */
  const productById =
    new Map(
      input.products.map(
        (product) => [
          product.id,
          product,
        ]
      )
    );

  const baseIssues =
    baseReport.issues.filter(
      (issue) => {
        if (
          issue.code !==
          "missing-image"
        ) {
          return true;
        }

        if (
          issue.productId ===
          undefined
        ) {
          return true;
        }

        const product =
          productById.get(
            issue.productId
          );

        if (!product) {
          return true;
        }

        /*
         * Media Asset 圖片改交給
         * product-media-health.ts
         * 檢查，不使用舊本機圖片規則。
         */
        return !isMediaAssetImage(
          product.image
        );
      }
    );

  /*
   * Media Asset 關聯與發布狀態
   */
  const mediaIssues =
    await checkProductMediaHealth(
      input.products
    );

  const mappedMediaIssues:
    ProductHealthIssue[] =
    mediaIssues
      .map(
        (
          mediaIssue
        ):
          | ProductHealthIssue
          | null => {
          const product =
            productById.get(
              mediaIssue.productId
            );

          if (!product) {
            return null;
          }

          return {
            id:
              `${product.id}-${mediaIssue.code}`,

            severity:
              mediaIssue.severity,

            code:
              mediaIssue.code,

            title:
              mediaIssue.title,

            detail:
              mediaIssue.detail,

            suggestion:
              mediaIssue.suggestion,

            productId:
              product.id,

            productName:
              product.name,

            displayCode:
              product.displayCode,

            editHref:
              `/admin/products/${product.id}/edit?from=health`,
          };
        }
      )
      .filter(
        (
          issue
        ): issue is ProductHealthIssue =>
          issue !== null
      );

  const issues = [
    ...baseIssues,
    ...mappedMediaIssues,
  ];

  /*
   * 錯誤優先，接著警告，
   * 同類依商品編號排序。
   */
  issues.sort(
    (a, b) => {
      if (
        a.severity !==
        b.severity
      ) {
        return (
          a.severity ===
          "error"
            ? -1
            : 1
        );
      }

      return (
        a.displayCode ?? ""
      ).localeCompare(
        b.displayCode ?? "",
        "zh-TW",
        {
          numeric: true,
        }
      );
    }
  );

  const affectedProductIds =
    new Set(
      issues
        .map(
          (issue) =>
            issue.productId
        )
        .filter(
          (
            productId
          ): productId is number =>
            productId !==
            undefined
        )
    );

  return {
    ...baseReport,

    healthyProducts:
      Math.max(
        input.products.length -
          affectedProductIds.size,
        0
      ),

    affectedProducts:
      affectedProductIds.size,

    errorCount:
      issues.filter(
        (issue) =>
          issue.severity ===
          "error"
      ).length,

    warningCount:
      issues.filter(
        (issue) =>
          issue.severity ===
          "warning"
      ).length,

    issues,
  };
}
