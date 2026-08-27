import {
  dbQuery,
} from "../../../db";

import type {
  MediaAsset,
  MediaListResult,
  MediaPublishStatus,
} from "./types";

type MediaRow = {
  id: number;
  original_name: string;
  title: string;
  alt_text: string;
  mime_type: string;
  byte_size: number | string;
  tags: string[] | null;
  created_at: Date | string;

  publish_status?:
    | MediaPublishStatus
    | null;

  publish_requested_at?:
    | Date
    | string
    | null;

  publish_finished_at?:
    | Date
    | string
    | null;

  publish_error?:
    | string
    | null;

  published_commit?:
    | string
    | null;
};

function mapRow(
  row: MediaRow
): MediaAsset {
  return {
    id: Number(row.id),
    originalName: row.original_name,
    title: row.title || row.original_name,
    altText: row.alt_text || "",
    mimeType: row.mime_type,
    byteSize: Number(row.byte_size || 0),
    tags: Array.isArray(row.tags)
      ? row.tags
      : [],
    createdAt: new Date(
      row.created_at
    ).toISOString(),
    fileUrl:
      `/api/studio/media/${Number(
        row.id
      )}/file`,

    publishStatus:
      row.publish_status ?? null,

    publishRequestedAt:
      row.publish_requested_at
        ? new Date(
            row.publish_requested_at
          ).toISOString()
        : null,

    publishFinishedAt:
      row.publish_finished_at
        ? new Date(
            row.publish_finished_at
          ).toISOString()
        : null,

    publishError:
      row.publish_error ?? null,

    publishedCommit:
      row.published_commit ?? null,
  };
}

export async function listMediaAssets({
  search = "",
  mimePrefix = "",
  limit = 100,
  active = true,
}: {
  search?: string;
  mimePrefix?: string;
  limit?: number;
  active?: boolean;
} = {}): Promise<MediaListResult> {
  const safeLimit = Math.max(
    1,
    Math.min(200, Math.floor(limit))
  );

  const result =
    await dbQuery<
      MediaRow & {
        total_count: number | string;
      }
    >(
      `
        SELECT
          media_assets.id,
          media_assets.original_name,
          media_assets.title,
          media_assets.alt_text,
          media_assets.mime_type,
          media_assets.byte_size,
          media_assets.tags,
          media_assets.created_at,

          latest_job.status
            AS publish_status,

          latest_job.requested_at
            AS publish_requested_at,

          latest_job.finished_at
            AS publish_finished_at,

          latest_job.error_message
            AS publish_error,

          latest_job.published_commit,

          COUNT(*) OVER()
            AS total_count

        FROM media_assets

        LEFT JOIN LATERAL (
          SELECT
            status,
            requested_at,
            finished_at,
            error_message,
            published_commit
          FROM media_publish_jobs
          WHERE media_id =
            media_assets.id
          ORDER BY requested_at DESC
          LIMIT 1
        ) latest_job
          ON TRUE

        WHERE media_assets.is_active = $4
          AND (
            $1 = ''
            OR media_assets.original_name
              ILIKE '%' || $1 || '%'
            OR media_assets.title
              ILIKE '%' || $1 || '%'
            OR media_assets.alt_text
              ILIKE '%' || $1 || '%'
            OR array_to_string(
              media_assets.tags,
              ' '
            ) ILIKE '%' || $1 || '%'
          )
          AND (
            $2 = ''
            OR media_assets.mime_type
              LIKE $2 || '%'
          )

        ORDER BY
          media_assets.created_at DESC

        LIMIT $3
      `,
      [
        search.trim(),
        mimePrefix.trim(),
        safeLimit,
        active,
      ]
    );

  return {
    assets: result.rows.map(mapRow),
    total:
      Number(
        result.rows[0]
          ?.total_count ?? 0
      ),
  };
}

export async function getMediaAsset(
  id: number
) {
  const result =
    await dbQuery<
      MediaRow & {
        storage_path: string;
      }
    >(
      `
        SELECT
          id,
          original_name,
          title,
          alt_text,
          mime_type,
          byte_size,
          tags,
          created_at,
          storage_path
        FROM media_assets
        WHERE id = $1
          AND is_active = TRUE
        LIMIT 1
      `,
      [id]
    );

  const row = result.rows[0];

  if (!row) return null;

  return {
    ...mapRow(row),
    storagePath:
      row.storage_path,
  };
}

/**
 * 僅供圖片檔案讀取使用。
 *
 * 即使 Media Asset 已經從 Library 移除，
 * 舊商品、TOP、首頁若仍引用該 Media ID，
 * 圖片仍然可以正常顯示。
 */
export async function getMediaAssetForFile(
  id: number
) {
  const result =
    await dbQuery<
      MediaRow & {
        storage_path: string;
      }
    >(
      `
        SELECT
          id,
          original_name,
          title,
          alt_text,
          mime_type,
          byte_size,
          tags,
          created_at,
          storage_path
        FROM media_assets
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

  const row =
    result.rows[0];

  if (!row) {
    return null;
  }

  return {
    ...mapRow(row),
    storagePath:
      row.storage_path,
  };
}

export async function createMediaAsset({
  originalName,
  storagePath,
  mimeType,
  byteSize,
  title,
  altText,
  tags,
}: {
  originalName: string;
  storagePath: string;
  mimeType: string;
  byteSize: number;
  title: string;
  altText: string;
  tags: string[];
}) {
  const result =
    await dbQuery<MediaRow>(
      `
        INSERT INTO media_assets (
          original_name,
          storage_path,
          mime_type,
          byte_size,
          title,
          alt_text,
          tags,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::text[],
          TRUE,
          NOW(),
          NOW()
        )
        RETURNING
          id,
          original_name,
          title,
          alt_text,
          mime_type,
          byte_size,
          tags,
          created_at
      `,
      [
        originalName,
        storagePath,
        mimeType,
        byteSize,
        title,
        altText,
        tags,
      ]
    );

  return mapRow(result.rows[0]);
}

export async function updateMediaAsset(
  id: number,
  patch: {
    title?: string;
    altText?: string;
    tags?: string[];
  }
) {
  const current =
    await getMediaAsset(id);

  if (!current) {
    throw new Error(
      "找不到指定的 Media Asset。"
    );
  }

  const result =
    await dbQuery<MediaRow>(
      `
        UPDATE media_assets
        SET
          title = $2,
          alt_text = $3,
          tags = $4::text[],
          updated_at = NOW()
        WHERE id = $1
          AND is_active = TRUE
        RETURNING
          id,
          original_name,
          title,
          alt_text,
          mime_type,
          byte_size,
          tags,
          created_at
      `,
      [
        id,
        patch.title ??
          current.title,
        patch.altText ??
          current.altText,
        patch.tags ??
          current.tags,
      ]
    );

  return mapRow(result.rows[0]);
}

export async function archiveMediaAsset(
  id: number
) {
  await dbQuery(
    `
      UPDATE media_assets
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

export async function restoreMediaAsset(
  id: number
) {
  await dbQuery(
    `
      UPDATE media_assets
      SET
        is_active = TRUE,
        updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

export type MediaUsageReference = {
  kind:
    | "product"
    | "bundle"
    | "site-studio";
  label: string;
};

function collectSiteStudioReferences(
  value: unknown,
  mediaUrl: string,
  contentKey: string
): MediaUsageReference[] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return [];
  }

  const config =
    value as Record<
      string,
      unknown
    >;

  const references:
    MediaUsageReference[] = [];

  function objectUsesMedia(
    target: unknown
  ) {
    try {
      return JSON.stringify(
        target
      ).includes(mediaUrl);
    } catch {
      return false;
    }
  }

  const hero =
    config.hero as
      | Record<
          string,
          unknown
        >
      | undefined;

  if (
    hero &&
    objectUsesMedia(hero)
  ) {
    references.push({
      kind: "site-studio",
      label:
        contentKey ===
        "homepage_draft"
          ? "首頁主視覺（草稿）"
          : "首頁主視覺",
    });
  }

  const secondaryHero =
    config.secondaryHero as
      | Record<
          string,
          unknown
        >
      | undefined;

  if (
    secondaryHero &&
    objectUsesMedia(
      secondaryHero
    )
  ) {
    references.push({
      kind: "site-studio",
      label:
        contentKey ===
        "homepage_draft"
          ? "第二主視覺（草稿）"
          : "第二主視覺",
    });
  }

  const rankings =
    Array.isArray(
      config.rankings
    )
      ? config.rankings
      : [];

  for (
    const ranking
    of rankings
  ) {
    if (
      !ranking ||
      typeof ranking !==
        "object" ||
      !objectUsesMedia(
        ranking
      )
    ) {
      continue;
    }

    const row =
      ranking as Record<
        string,
        unknown
      >;

    const rank =
      Number(row.rank);

    references.push({
      kind: "site-studio",
      label:
        Number.isFinite(rank)
          ? `排行榜 TOP ${rank}${
              contentKey ===
              "homepage_draft"
                ? "（草稿）"
                : ""
            }`
          : contentKey ===
            "homepage_draft"
          ? "排行榜（草稿）"
          : "排行榜",
    });
  }

  const sections =
    Array.isArray(
      config.sections
    )
      ? config.sections
      : [];

  for (
    const section
    of sections
  ) {
    if (
      !section ||
      typeof section !==
        "object" ||
      !objectUsesMedia(
        section
      )
    ) {
      continue;
    }

    const row =
      section as Record<
        string,
        unknown
      >;

    const title =
      String(
        row.title ||
          row.name ||
          row.key ||
          "首頁區塊"
      );

    references.push({
      kind: "site-studio",
      label:
        contentKey ===
        "homepage_draft"
          ? `首頁區塊：${title}（草稿）`
          : `首頁區塊：${title}`,
    });
  }

  if (
    references.length === 0 &&
    objectUsesMedia(config)
  ) {
    references.push({
      kind: "site-studio",
      label:
        contentKey ===
        "homepage_draft"
          ? "Website Studio 首頁草稿"
          : "Website Studio 正式首頁",
    });
  }

  return references;
}

export async function getMediaAssetUsage(
  id: number
) {
  const mediaUrl =
    `/api/studio/media/${id}/file`;

  const references:
    MediaUsageReference[] =
      [];

  const products =
    await dbQuery<{
      id: number;
      name: string | null;
      sku: string | null;
    }>(
      `
        SELECT
          id,
          to_jsonb(products)
            ->> 'name'
            AS name,
          to_jsonb(products)
            ->> 'sku'
            AS sku
        FROM products
        WHERE
          to_jsonb(products)::text
          LIKE '%' || $1 || '%'
        ORDER BY id
        LIMIT 100
      `,
      [mediaUrl]
    );

  for (
    const product
    of products.rows
  ) {
    const name =
      product.name ||
      `Product #${product.id}`;

    const sku =
      product.sku
        ? `（${product.sku}）`
        : "";

    references.push({
      kind: "product",
      label:
        `商品：${name}${sku}`,
    });
  }

  const bundles =
    await dbQuery<{
      id: number;
      name: string | null;
      title: string | null;
    }>(
      `
        SELECT
          id,
          to_jsonb(bundle_offers)
            ->> 'name'
            AS name,
          to_jsonb(bundle_offers)
            ->> 'title'
            AS title
        FROM bundle_offers
        WHERE
          to_jsonb(bundle_offers)::text
          LIKE '%' || $1 || '%'
        ORDER BY id
        LIMIT 100
      `,
      [mediaUrl]
    );

  for (
    const bundle
    of bundles.rows
  ) {
    references.push({
      kind: "bundle",
      label:
        `組合優惠：${
          bundle.name ||
          bundle.title ||
          `Bundle #${bundle.id}`
        }`,
    });
  }

  const studio =
    await dbQuery<{
      content_key: string;
      value: unknown;
    }>(
      `
        SELECT
          content_key,
          value
        FROM site_studio_content
        WHERE
          value::text
          LIKE '%' || $1 || '%'
        ORDER BY content_key
      `,
      [mediaUrl]
    );

  for (
    const row
    of studio.rows
  ) {
    references.push(
      ...collectSiteStudioReferences(
        row.value,
        mediaUrl,
        row.content_key
      )
    );
  }

  const deduped =
    Array.from(
      new Map(
        references.map(
          (reference) => [
            `${reference.kind}:${reference.label}`,
            reference,
          ]
        )
      ).values()
    );

  return {
    mediaId: id,
    mediaUrl,
    inUse:
      deduped.length > 0,
    references: deduped,
  };
}
