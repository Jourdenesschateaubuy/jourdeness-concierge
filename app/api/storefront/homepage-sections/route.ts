import { NextResponse } from "next/server";

import {
  buildHomepageDraftSnapshot,
  getPublishedHomepageSnapshot,
} from "../../../../lib/homepage-publish-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const draftMode =
      url.searchParams.get("mode") === "draft";

    if (draftMode) {
      const draft =
        await buildHomepageDraftSnapshot();

      return NextResponse.json(
        {
          mode: "draft",
          versionNumber: null,
          sections: draft.sections,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const published =
      await getPublishedHomepageSnapshot();

    if (!published) {
      return NextResponse.json(
        {
          error:
            "尚未建立正式首頁版本，請先執行 migration。",
          mode: "published",
          versionNumber: null,
          sections: [],
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        mode: "published",
        versionNumber:
          published.versionNumber,
        publishedAt:
          published.publishedAt,
        sections:
          published.snapshot.sections,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "首頁動態區塊讀取失敗：",
      error
    );

    return NextResponse.json(
      {
        error: "首頁動態區塊讀取失敗",
        sections: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
