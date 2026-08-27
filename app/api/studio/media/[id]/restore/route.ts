import {
  NextResponse,
} from "next/server";

import {
  restoreMediaAsset,
} from "../../../../../../lib/cms/modules/media/repository";

export const dynamic =
  "force-dynamic";

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

  await restoreMediaAsset(id);

  return NextResponse.json({
    ok: true,
  });
}
