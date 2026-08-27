import {
  NextResponse,
} from "next/server";

import {
  dbQuery,
} from "../../../../../../lib/db";

import {
  getMediaAssetForFile,
  getMediaAssetUsage,
} from "../../../../../../lib/cms/modules/media/repository";

export const dynamic =
  "force-dynamic";

async function ensureCleanupJobsTable() {
  await dbQuery(
    `
      CREATE TABLE IF NOT EXISTS media_cleanup_jobs (
        id BIGSERIAL PRIMARY KEY,
        media_id BIGINT NOT NULL,
        original_name TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        status TEXT NOT NULL
          DEFAULT 'pending',
        requested_at TIMESTAMPTZ
          NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        error_message TEXT,
        CONSTRAINT
          media_cleanup_jobs_status_check
        CHECK (
          status IN (
            'pending',
            'processing',
            'deleted',
            'blocked',
            'failed'
          )
        )
      )
    `
  );

  await dbQuery(
    `
      CREATE INDEX IF NOT EXISTS
        media_cleanup_jobs_status_requested_idx
      ON media_cleanup_jobs (
        status,
        requested_at
      )
    `
  );
}

export async function POST(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const params =
    await context.params;

  const mediaId =
    Number(params.id);

  if (
    !Number.isInteger(mediaId) ||
    mediaId <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "Media ID 無效。",
      },
      {
        status: 400,
      }
    );
  }

  const asset =
    await getMediaAssetForFile(
      mediaId
    );

  if (!asset) {
    return NextResponse.json(
      {
        error:
          "找不到這張 Media Asset。",
      },
      {
        status: 404,
      }
    );
  }

  const state =
    await dbQuery<{
      is_active: boolean;
    }>(
      `
        SELECT is_active
        FROM media_assets
        WHERE id = $1
        LIMIT 1
      `,
      [mediaId]
    );

  if (
    state.rows[0]?.is_active !==
    false
  ) {
    return NextResponse.json(
      {
        error:
          "請先將圖片移到回收桶，再進行永久清理。",
      },
      {
        status: 409,
      }
    );
  }

  /*
   * 永久刪除前，後端重新做一次
   * Usage Guard。
   */
  const usage =
    await getMediaAssetUsage(
      mediaId
    );

  if (usage.inUse) {
    return NextResponse.json(
      {
        error:
          "此圖片仍被網站使用，禁止永久刪除。",
        usage,
      },
      {
        status: 409,
      }
    );
  }

  await ensureCleanupJobsTable();

  const existing =
    await dbQuery<{
      id: string;
      status: string;
    }>(
      `
        SELECT
          id,
          status
        FROM media_cleanup_jobs
        WHERE media_id = $1
          AND status IN (
            'pending',
            'processing'
          )
        ORDER BY requested_at DESC
        LIMIT 1
      `,
      [mediaId]
    );

  if (existing.rows[0]) {
    return NextResponse.json({
      ok: true,
      jobId:
        existing.rows[0].id,
      status:
        existing.rows[0].status,
      message:
        existing.rows[0]
          .status ===
        "processing"
          ? "這張圖片正在永久清理中。"
          : "這張圖片已在永久清理佇列。",
    });
  }

  const created =
    await dbQuery<{
      id: string;
      status: string;
    }>(
      `
        INSERT INTO media_cleanup_jobs (
          media_id,
          original_name,
          storage_path,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          'pending'
        )
        RETURNING
          id,
          status
      `,
      [
        mediaId,
        asset.originalName,
        asset.storagePath,
      ]
    );

  return NextResponse.json({
    ok: true,
    jobId:
      created.rows[0].id,
    status:
      created.rows[0].status,
    message:
      "已加入永久清理佇列。公司電腦執行清理後，圖片才會真正刪除。",
  });
}
