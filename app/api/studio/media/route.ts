import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  createMediaAsset,
  listMediaAssets,
} from "../../../../lib/cms/modules/media/repository";

export const dynamic = "force-dynamic";

const MAX_BYTES =
  12 * 1024 * 1024;

function uploadRoot() {
  const value =
    process.env.UPLOAD_ROOT?.trim();

  if (!value) {
    throw new Error(
      "UPLOAD_ROOT 尚未設定。Media Library 會沿用本機檔案儲存，不會改用雲端。"
    );
  }

  return value;
}

function safeExtension(
  fileName: string
) {
  const ext =
    path.extname(fileName)
      .toLowerCase()
      .replace(
        /[^a-z0-9.]/g,
        ""
      );

  if (
    [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(
      ext
    )
  ) {
    return ext;
  }

  return "";
}

export async function GET(
  request: Request
) {
  const url =
    new URL(request.url);

  const result =
    await listMediaAssets({
      search:
        url.searchParams.get(
          "search"
        ) || "",
      mimePrefix:
        url.searchParams.get(
          "mime"
        ) || "",
      limit: Number(
        url.searchParams.get(
          "limit"
        ) || 120
      ),
      active:
        url.searchParams.get(
          "status"
        ) !== "trash",
    });

  return NextResponse.json(
    result
  );
}

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "請選擇圖片檔案。",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Media Library v1 目前只接受圖片。",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error:
            "圖片不可超過 12MB。",
        },
        {
          status: 400,
        }
      );
    }

    const ext =
      safeExtension(file.name);

    if (!ext) {
      return NextResponse.json(
        {
          error:
            "目前支援 JPG、PNG、WEBP、GIF。",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    const directory =
      path.join(
        uploadRoot(),
        "media",
        String(
          now.getFullYear()
        ),
        String(
          now.getMonth() + 1
        ).padStart(2, "0")
      );

    await mkdir(
      directory,
      {
        recursive: true,
      }
    );

    const fileName =
      `${crypto.randomUUID()}${ext}`;

    const storagePath =
      path.join(
        directory,
        fileName
      );

    const bytes =
      Buffer.from(
        await file.arrayBuffer()
      );

    await writeFile(
      storagePath,
      bytes
    );

    const tags =
      String(
        formData.get("tags") || ""
      )
        .split(",")
        .map((value) =>
          value.trim()
        )
        .filter(Boolean)
        .slice(0, 20);

    const asset =
      await createMediaAsset({
        originalName: file.name,
        storagePath,
        mimeType:
          file.type ||
          "application/octet-stream",
        byteSize:
          file.size,
        title:
          String(
            formData.get(
              "title"
            ) || ""
          ).trim() ||
          file.name,
        altText:
          String(
            formData.get(
              "altText"
            ) || ""
          ).trim(),
        tags,
      });

    return NextResponse.json(
      asset,
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "圖片上傳失敗。",
      },
      {
        status: 500,
      }
    );
  }
}
