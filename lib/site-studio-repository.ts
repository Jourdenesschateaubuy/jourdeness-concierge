import { dbQuery } from "./db";
import {
  DEFAULT_SITE_STUDIO_CONFIG,
  normalizeSiteStudioConfig,
  type SiteStudioConfig,
  type SiteStudioHero,
  type SiteStudioRankingItem,
  type SiteStudioSection,
} from "./site-studio-types";

type SiteContentRow = {
  value: SiteStudioConfig | string;
};

async function ensureSiteStudioTable() {
  await dbQuery(`
    CREATE TABLE IF NOT EXISTS site_studio_content (
      content_key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function parseStoredValue(
  value: SiteContentRow["value"]
) {
  if (typeof value === "string") {
    try {
      return JSON.parse(
        value
      ) as Partial<SiteStudioConfig>;
    } catch {
      return null;
    }
  }

  return value;
}

async function readConfig(
  contentKey: string
) {
  await ensureSiteStudioTable();

  const result =
    await dbQuery<SiteContentRow>(
      `
        SELECT value
        FROM site_studio_content
        WHERE content_key = $1
        LIMIT 1
      `,
      [contentKey]
    );

  const existing = result.rows[0];

  if (!existing) {
    return null;
  }

  return normalizeSiteStudioConfig(
    parseStoredValue(existing.value)
  );
}

async function writeConfig(
  contentKey: string,
  config: SiteStudioConfig
) {
  await ensureSiteStudioTable();

  const normalized =
    normalizeSiteStudioConfig(config);

  await dbQuery(
    `
      INSERT INTO site_studio_content (
        content_key,
        value,
        updated_at
      )
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (content_key)
      DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `,
    [
      contentKey,
      JSON.stringify(normalized),
    ]
  );

  return normalized;
}

/*
 * 正式前台版本
 */
export async function getSiteStudioConfig() {
  const existing =
    await readConfig("homepage");

  if (existing) {
    return existing;
  }

  const created =
    await writeConfig(
      "homepage",
      DEFAULT_SITE_STUDIO_CONFIG
    );

  return created;
}

/*
 * 後台編輯中的 Draft。
 *
 * 第一次沒有 Draft 時，
 * 自動從目前正式首頁複製一份。
 */
export async function getSiteStudioDraftConfig() {
  const existing =
    await readConfig("homepage_draft");

  if (existing) {
    return existing;
  }

  const published =
    await getSiteStudioConfig();

  return writeConfig(
    "homepage_draft",
    published
  );
}

export async function saveSiteStudioConfig(
  config: SiteStudioConfig
) {
  return writeConfig(
    "homepage",
    config
  );
}

export async function saveSiteStudioDraftConfig(
  config: SiteStudioConfig
) {
  return writeConfig(
    "homepage_draft",
    config
  );
}

/*
 * 發布：
 * 將目前 Draft 完整複製成正式首頁。
 */
export async function publishSiteStudioDraft() {
  const draft =
    await getSiteStudioDraftConfig();

  return saveSiteStudioConfig(draft);
}

/*
 * 放棄目前 Draft，
 * 重新以正式首頁建立草稿。
 */
export async function resetSiteStudioDraft() {
  const published =
    await getSiteStudioConfig();

  return saveSiteStudioDraftConfig(
    published
  );
}

/*
 * 以下所有後台編輯操作，
 * 現在都只修改 Draft。
 */

export async function updateSiteStudioHero(
  slot: "primary" | "secondary",
  hero: SiteStudioHero
) {
  const current =
    await getSiteStudioDraftConfig();

  const next = {
    ...current,
    ...(slot === "primary"
      ? {
          hero: {
            ...hero,
            slot:
              "primary" as const,
          },
        }
      : {
          secondaryHero: {
            ...hero,
            slot:
              "secondary" as const,
          },
        }),
  };

  return saveSiteStudioDraftConfig(
    next
  );
}

export async function updateSiteStudioRanking(
  ranking: SiteStudioRankingItem
) {
  const current =
    await getSiteStudioDraftConfig();

  return saveSiteStudioDraftConfig({
    ...current,
    rankings:
      current.rankings.map(
        (item) =>
          item.rank === ranking.rank
            ? ranking
            : item
      ),
  });
}

export async function saveSiteStudioSections(
  sections: SiteStudioSection[]
) {
  const current =
    await getSiteStudioDraftConfig();

  return saveSiteStudioDraftConfig({
    ...current,
    sections,
  });
}

export async function updateSiteStudioSection(
  section: SiteStudioSection
) {
  const current =
    await getSiteStudioDraftConfig();

  return saveSiteStudioDraftConfig({
    ...current,
    sections:
      current.sections.map(
        (item) =>
          item.key === section.key
            ? section
            : item
      ),
  });
}
