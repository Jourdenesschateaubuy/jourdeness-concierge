import {
  NextResponse,
} from "next/server";

import {
  archiveMediaAsset,
  updateMediaAsset,
} from "../../../../../lib/cms/modules/media/repository";

export const dynamic = "force-dynamic";

type MediaPatchBody = {
  title?: unknown;
  altText?: unknown;
  tags?: unknown;
};

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const params =
    await context.params;

  const id =
    Number(params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
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

  const body =
    (await request.json()) as MediaPatchBody;

  const asset =
    await updateMediaAsset(
      id,
      {
        title:
          typeof body.title ===
          "string"
            ? body.title.trim()
            : undefined,
        altText:
          typeof body.altText ===
          "string"
            ? body.altText.trim()
            : undefined,
        tags:
          Array.isArray(
            body.tags
          )
            ? body.tags
                .map((value) =>
                  String(value)
                )
                .map(
                  (
                    value: string
                  ) =>
                    value.trim()
                )
                .filter(
                  (
                    value: string
                  ) =>
                    Boolean(value)
                )
                .slice(0, 20)
            : undefined,
      }
    );

  return NextResponse.json(
    asset
  );
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const params =
    await context.params;

  const id =
    Number(params.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
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

  await archiveMediaAsset(id);

  return NextResponse.json({
    ok: true,
  });
}
