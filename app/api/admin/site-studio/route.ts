import { NextResponse } from "next/server";

import { hasValidAdminSession } from "../../../../lib/admin-auth";
import {
  getSiteStudioDraftConfig,
  publishSiteStudioDraft,
  resetSiteStudioDraft,
  saveSiteStudioSections,
  updateSiteStudioHero,
  updateSiteStudioRanking,
  updateSiteStudioSection,
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
      { error: "未授權" },
      { status: 401 }
    );
  }

  const config =
    await getSiteStudioDraftConfig();

  return NextResponse.json({
    config,
    mode: "draft",
  });
}

export async function PATCH(
  request: Request
) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "未授權" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;

  try {
    body =
      (await request.json()) as Record<
        string,
        unknown
      >;
  } catch {
    return NextResponse.json(
      { error: "請求格式錯誤" },
      { status: 400 }
    );
  }

  if (body.kind === "hero") {
    const slot =
      body.slot as HeroSlot;

    const hero =
      body.hero as SiteStudioHero;

    if (
      (slot !== "primary" &&
        slot !== "secondary") ||
      !hero
    ) {
      return NextResponse.json(
        { error: "主視覺資料無效" },
        { status: 400 }
      );
    }

    const config =
      await updateSiteStudioHero(
        slot,
        hero
      );

    return NextResponse.json({
      config,
      message: "主視覺草稿已儲存",
    });
  }

  if (body.kind === "ranking") {
    const ranking =
      body.ranking as SiteStudioRankingItem;

    if (
      !ranking ||
      !Number.isInteger(
        ranking.rank
      )
    ) {
      return NextResponse.json(
        { error: "排行資料無效" },
        { status: 400 }
      );
    }

    const config =
      await updateSiteStudioRanking(
        ranking
      );

    return NextResponse.json({
      config,
      message: "排行草稿已儲存",
    });
  }

  if (body.kind === "sections") {
    const sections =
      body.sections as SiteStudioSection[];

    if (
      !Array.isArray(sections)
    ) {
      return NextResponse.json(
        { error: "首頁區塊資料無效" },
        { status: 400 }
      );
    }

    const config =
      await saveSiteStudioSections(
        sections
      );

    return NextResponse.json({
      config,
      message:
        "首頁區塊草稿已儲存",
    });
  }

  if (body.kind === "section") {
    const section =
      body.section as SiteStudioSection;

    if (!section?.key) {
      return NextResponse.json(
        { error: "首頁區塊資料無效" },
        { status: 400 }
      );
    }

    const config =
      await updateSiteStudioSection(
        section
      );

    return NextResponse.json({
      config,
      message:
        "首頁區塊草稿已儲存",
    });
  }

  if (body.kind === "publish") {
    const config =
      await publishSiteStudioDraft();

    return NextResponse.json({
      config,
      message: "首頁已發布",
    });
  }

  if (body.kind === "reset-draft") {
    const config =
      await resetSiteStudioDraft();

    return NextResponse.json({
      config,
      message:
        "草稿已還原為目前正式首頁",
    });
  }

  return NextResponse.json(
    { error: "不支援的操作" },
    { status: 400 }
  );
}
