import { NextResponse } from "next/server";

import { hasValidAdminSession } from "../../../../lib/admin-auth";
import {
  getSiteStudioConfig,
  updateSiteStudioHero,
  updateSiteStudioRanking,
  updateSiteStudioSection,
  saveSiteStudioSections,
} from "../../../../lib/site-studio-repository";
import type {
  HeroSlot,
  SiteStudioHero,
  SiteStudioRankingItem,
  SiteStudioSection,
} from "../../../../lib/site-studio-types";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  return hasValidAdminSession();
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  const config = await getSiteStudioConfig();
  return NextResponse.json({ config });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "尚未登入管理後台" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "送出的設定格式不正確" },
      { status: 400 }
    );
  }

  if (body.kind === "hero") {
    const slot = body.slot as HeroSlot;
    const hero = body.hero as SiteStudioHero;

    if ((slot !== "primary" && slot !== "secondary") || !hero) {
      return NextResponse.json(
        { error: "主視覺資料不完整" },
        { status: 400 }
      );
    }

    const config = await updateSiteStudioHero(slot, hero);
    return NextResponse.json({ config, message: "主視覺已儲存" });
  }

  if (body.kind === "ranking") {
    const ranking = body.ranking as SiteStudioRankingItem;

    if (!ranking || !Number.isInteger(ranking.rank)) {
      return NextResponse.json(
        { error: "排行榜資料不完整" },
        { status: 400 }
      );
    }

    const config = await updateSiteStudioRanking(ranking);
    return NextResponse.json({ config, message: "排行榜已儲存" });
  }

  if (body.kind === "sections") {
    const sections = body.sections as SiteStudioSection[];

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: "首頁區塊資料不完整" },
        { status: 400 }
      );
    }

    const config = await saveSiteStudioSections(sections);
    return NextResponse.json({ config, message: "首頁版面已儲存" });
  }

  if (body.kind === "section") {
    const section = body.section as SiteStudioSection;

    if (!section?.key) {
      return NextResponse.json(
        { error: "首頁區塊資料不完整" },
        { status: 400 }
      );
    }

    const config = await updateSiteStudioSection(section);
    return NextResponse.json({ config, message: "首頁區塊已儲存" });
  }

  return NextResponse.json(
    { error: "不支援的設定類型" },
    { status: 400 }
  );
}
