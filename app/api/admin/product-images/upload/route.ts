import { NextResponse } from "next/server";
import { hasValidAdminSession } from "../../../../../lib/admin-auth";
import { saveProductImage } from "../../../../../lib/upload-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return NextResponse.json(
      { error: "未登入後台" },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "沒有收到圖片檔案" },
        { status: 400 },
      );
    }

    const savedImage = await saveProductImage(file);

    return NextResponse.json({
      success: true,
      url: savedImage.publicUrl,
      fileName: savedImage.fileName,
      relativePath: savedImage.relativePath,
    });
  } catch (error) {
    console.error("Product image upload failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "圖片上傳失敗";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}