import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function getUploadRoot(): string {
  const uploadRoot = process.env.UPLOAD_ROOT?.trim();

  if (!uploadRoot) {
    throw new Error("缺少 UPLOAD_ROOT 環境變數");
  }

  return path.resolve(uploadRoot);
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { path: pathSegments } = await context.params;

    if (!pathSegments?.length) {
      return NextResponse.json(
        { error: "缺少檔案路徑" },
        { status: 400 },
      );
    }

    const uploadRoot = getUploadRoot();
    const requestedPath = path.resolve(
      uploadRoot,
      ...pathSegments,
    );

    const relativePath = path.relative(
      uploadRoot,
      requestedPath,
    );

    if (
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      return NextResponse.json(
        { error: "無效的檔案路徑" },
        { status: 403 },
      );
    }

    const extension = path
      .extname(requestedPath)
      .toLowerCase();

    const contentType = CONTENT_TYPES[extension];

    if (!contentType) {
      return NextResponse.json(
        { error: "不支援的檔案格式" },
        { status: 415 },
      );
    }

    const fileBuffer = await readFile(requestedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control":
          "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Upload file read failed:", error);

    return NextResponse.json(
      { error: "找不到圖片" },
      { status: 404 },
    );
  }
}