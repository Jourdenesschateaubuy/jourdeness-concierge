import { NextResponse } from "next/server";
import {
  handleUpload,
  type HandleUploadBody,
} from "@vercel/blob/client";
import { hasValidAdminSession } from "../../../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "未登入後台" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const response = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },

      onUploadCompleted: async () => {
        // 圖片 URL 之後會由商品表單寫入 Neon。
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Product image upload failed:", error);

    return NextResponse.json(
      { error: "圖片上傳失敗" },
      { status: 400 }
    );
  }
}
