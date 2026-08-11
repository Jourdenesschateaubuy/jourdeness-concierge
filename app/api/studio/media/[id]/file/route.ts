import {
  readFile,
} from "node:fs/promises";
import path from "node:path";

import {
  NextResponse,
} from "next/server";

import {
  getMediaAsset,
} from "../../../../../../lib/cms/modules/media/repository";

export const dynamic = "force-dynamic";

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
    return new NextResponse(
      "Not found",
      {
        status: 404,
      }
    );
  }

  const asset =
    await getMediaAsset(id);

  if (!asset) {
    return new NextResponse(
      "Not found",
      {
        status: 404,
      }
    );
  }

  try {
    let data: Buffer;

    try {
      data = await readFile(
        asset.storagePath
      );
    } catch {
      const safeFileName =
        path.basename(
          asset.originalName
        );

      const fallbackPath =
        path.join(
          process.cwd(),
          "public",
          "products",
          safeFileName
        );

      data = await readFile(
        fallbackPath
      );
    }

    return new NextResponse(
      Uint8Array.from(data),
      {
        headers: {
          "Content-Type":
            asset.mimeType,
          "Cache-Control":
            "private, max-age=3600",
          "Content-Disposition":
            `inline; filename*=UTF-8''${encodeURIComponent(
              asset.originalName
            )}`,
        },
      }
    );
  } catch {
    return new NextResponse(
      "File missing",
      {
        status: 404,
      }
    );
  }
}
