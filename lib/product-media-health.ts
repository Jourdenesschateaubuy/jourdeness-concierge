import {
  dbQuery,
} from "./db";

import type {
  DatabaseProduct,
} from "./product-repository";

export type ProductMediaHealthIssue = {
  productId: number;
  severity:
    | "error"
    | "warning";
  code: string;
  title: string;
  detail: string;
  suggestion: string;
};

type MediaPublishStatus =
  | "pending"
  | "processing"
  | "published"
  | "failed";

type MediaHealthRow = {
  id: number | string;
  is_active: boolean;
  publish_status:
    | MediaPublishStatus
    | null;
};

function extractMediaId(
  image:
    | string
    | undefined
    | null
) {
  const value =
    image?.trim() ?? "";

  const match =
    value.match(
      /^\/api\/studio\/media\/(\d+)\/file(?:[?#].*)?$/
    );

  if (!match) {
    return null;
  }

  const id =
    Number(match[1]);

  return Number.isInteger(id) &&
    id > 0
    ? id
    : null;
}

export function isMediaAssetImage(
  image:
    | string
    | undefined
    | null
) {
  return (
    extractMediaId(image) !==
    null
  );
}

export async function checkProductMediaHealth(
  products: DatabaseProduct[]
): Promise<
  ProductMediaHealthIssue[]
> {
  const issues:
    ProductMediaHealthIssue[] =
    [];

  const productMediaIds =
    products
      .map((product) => ({
        product,
        mediaId:
          extractMediaId(
            product.image
          ),
      }))
      .filter(
        (
          item
        ): item is {
          product: DatabaseProduct;
          mediaId: number;
        } =>
          item.mediaId !==
          null
      );

  const uniqueMediaIds =
    Array.from(
      new Set(
        productMediaIds.map(
          (item) =>
            item.mediaId
        )
      )
    );

  if (
    uniqueMediaIds.length ===
    0
  ) {
    return [];
  }

  const result =
    await dbQuery<MediaHealthRow>(
      `
        SELECT
          media_assets.id,
          media_assets.is_active,

          latest_job.status
            AS publish_status

        FROM media_assets

        LEFT JOIN LATERAL (
          SELECT
            status
          FROM media_publish_jobs
          WHERE media_id =
            media_assets.id
          ORDER BY
            requested_at DESC
          LIMIT 1
        ) latest_job
          ON TRUE

        WHERE
          media_assets.id =
          ANY($1::bigint[])
      `,
      [uniqueMediaIds]
    );

  const mediaById =
    new Map<
      number,
      MediaHealthRow
    >(
      result.rows.map(
        (row) => [
          Number(row.id),
          row,
        ]
      )
    );

  for (
    const {
      product,
      mediaId,
    }
    of productMediaIds
  ) {
    const media =
      mediaById.get(
        mediaId
      );

    if (
      !media ||
      !media.is_active
    ) {
      issues.push({
        productId:
          product.id,

        severity:
          "error",

        code:
          "media-asset-missing",

        title:
          "商品圖片 Media 關聯失效",

        detail:
          `商品目前使用 Media #${mediaId}，但 Media Library 中找不到有效的圖片資產。`,

        suggestion:
          "請到商品編輯頁重新從 Media Library 選擇商品主圖。",
      });

      continue;
    }

    switch (
      media.publish_status
    ) {
      case "published":
        break;

      case "pending":
        issues.push({
          productId:
            product.id,

          severity:
            "warning",

          code:
            "media-publish-pending",

          title:
            "商品圖片等待發布",

          detail:
            `商品主圖 Media #${mediaId} 已加入發布佇列，目前尚未完成發布。`,

          suggestion:
            "系統會由 Media Publisher 自動處理。發布完成後重新執行商品健檢即可。",
        });
        break;

      case "processing":
        issues.push({
          productId:
            product.id,

          severity:
            "warning",

          code:
            "media-publish-processing",

          title:
            "商品圖片正在發布",

          detail:
            `商品主圖 Media #${mediaId} 目前正在執行發布程序。`,

          suggestion:
            "請稍後重新執行商品健檢，確認圖片是否完成發布。",
        });
        break;

      case "failed":
        issues.push({
          productId:
            product.id,

          severity:
            "error",

          code:
            "media-publish-failed",

          title:
            "商品圖片發布失敗",

          detail:
            `商品主圖 Media #${mediaId} 最新發布工作失敗。`,

          suggestion:
            "請先到 Media Library 檢查發布錯誤，再重新加入發布佇列。",
        });
        break;

      default:
        issues.push({
          productId:
            product.id,

          severity:
            "warning",

          code:
            "media-not-published",

          title:
            "商品圖片尚未發布",

          detail:
            `商品主圖 Media #${mediaId} 尚未有正式發布紀錄。`,

          suggestion:
            "請到 Media Library 將圖片加入發布佇列；完成後商品圖片才具備正式前台發布狀態。",
        });
        break;
    }
  }

  return issues;
}
