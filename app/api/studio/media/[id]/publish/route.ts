import {
  NextResponse,
} from "next/server";

import {
  dbQuery,
} from "../../../../../../lib/db";

import {
  getMediaAsset,
} from "../../../../../../lib/cms/modules/media/repository";

export const dynamic = "force-dynamic";

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
        error: "Media ID 無效。",
      },
      {
        status: 400,
      }
    );
  }

  const asset =
    await getMediaAsset(mediaId);

  if (!asset) {
    return NextResponse.json(
      {
        error: "找不到這張 Media Asset。",
      },
      {
        status: 404,
      }
    );
  }

  const existing =
    await dbQuery<{
      id: string;
      status: string;
    }>(
      `
      SELECT
        id,
        status
      FROM media_publish_jobs
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
      jobId: existing.rows[0].id,
      status: existing.rows[0].status,
      message:
        existing.rows[0].status ===
        "processing"
          ? "這張圖片正在發布中。"
          : "這張圖片已在等待發布。",
    });
  }

  const created =
    await dbQuery<{
      id: string;
      status: string;
    }>(
      `
      INSERT INTO media_publish_jobs (
        media_id,
        status
      )
      VALUES (
        $1,
        'pending'
      )
      RETURNING
        id,
        status
      `,
      [mediaId]
    );

  return NextResponse.json({
    ok: true,
    jobId: created.rows[0].id,
    status: created.rows[0].status,
    message:
      "已加入正式網站發布佇列。",
  });
}
