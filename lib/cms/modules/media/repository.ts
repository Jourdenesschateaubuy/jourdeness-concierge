import {
  dbQuery,
} from "../../../db";

import type {
  MediaAsset,
  MediaListResult,
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
  };
}

export async function listMediaAssets({
  search = "",
  mimePrefix = "",
  limit = 100,
}: {
  search?: string;
  mimePrefix?: string;
  limit?: number;
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
          id,
          original_name,
          title,
          alt_text,
          mime_type,
          byte_size,
          tags,
          created_at,
          COUNT(*) OVER() AS total_count
        FROM media_assets
        WHERE is_active = TRUE
          AND (
            $1 = ''
            OR original_name ILIKE '%' || $1 || '%'
            OR title ILIKE '%' || $1 || '%'
            OR alt_text ILIKE '%' || $1 || '%'
            OR array_to_string(tags, ' ') ILIKE '%' || $1 || '%'
          )
          AND (
            $2 = ''
            OR mime_type LIKE $2 || '%'
          )
        ORDER BY created_at DESC
        LIMIT $3
      `,
      [
        search.trim(),
        mimePrefix.trim(),
        safeLimit,
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
      "找不到 Media Asset。"
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
