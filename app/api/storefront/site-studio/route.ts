import { NextResponse } from "next/server";
import { getSiteStudioConfig } from "../../../../lib/site-studio-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getSiteStudioConfig();
    return NextResponse.json(
      { config },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error) {
    console.error("[Jourdeness] site studio API failed", error);
    return NextResponse.json(
      { error: "首頁設定讀取失敗" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
