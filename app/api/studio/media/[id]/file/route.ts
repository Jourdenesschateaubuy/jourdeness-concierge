import {
  readFile,
} from "node:fs/promises";

import {
  NextResponse,
} from "next/server";

import {
  getMediaAsset,
} from "../../../../../../lib/cms/modules/media/repository";

import {
  resolveStoredFilePath,
} from "../../../../../../lib/upload-storage";

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
    const filePath =
resolveStoredFilePath(
  asset.storagePath
);

const data =
await readFile(
  filePath
);

    return new NextResponse(
      data,
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

