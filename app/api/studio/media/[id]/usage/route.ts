import {
  NextResponse,
} from "next/server";

import {
  getMediaAssetUsage,
} from "../../../../../../lib/cms/modules/media/repository";

export const dynamic =
  "force-dynamic";

export async function GET(
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

  try {
    const usage =
      await getMediaAssetUsage(
        id
      );

    return NextResponse.json(
      usage
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "無法檢查圖片使用狀態。",
      },
      {
        status: 500,
      }
    );
  }
}
