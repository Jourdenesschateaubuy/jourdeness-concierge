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

function parseStoredValue(value: SiteContentRow["value"]) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Partial<SiteStudioConfig>;
    } catch {
      return null;
    }
  }

  return value;
}

export async function getSiteStudioConfig() {
  await ensureSiteStudioTable();

  const result = await dbQuery<SiteContentRow>(
    `
      SELECT value
      FROM site_studio_content
      WHERE content_key = 'homepage'
      LIMIT 1
    `
  );

  const existing = result.rows[0];

  if (!existing) {
    await dbQuery(
      `
        INSERT INTO site_studio_content (content_key, value, updated_at)
        VALUES ('homepage', $1::jsonb, NOW())
        ON CONFLICT (content_key) DO NOTHING
      `,
      [JSON.stringify(DEFAULT_SITE_STUDIO_CONFIG)]
    );

    return DEFAULT_SITE_STUDIO_CONFIG;
  }

  return normalizeSiteStudioConfig(parseStoredValue(existing.value));
}

export async function saveSiteStudioConfig(config: SiteStudioConfig) {
  await ensureSiteStudioTable();

  const normalized = normalizeSiteStudioConfig(config);

  await dbQuery(
    `
      INSERT INTO site_studio_content (content_key, value, updated_at)
      VALUES ('homepage', $1::jsonb, NOW())
      ON CONFLICT (content_key)
      DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `,
    [JSON.stringify(normalized)]
  );

  return normalized;
}

export async function updateSiteStudioHero(
  slot: "primary" | "secondary",
  hero: SiteStudioHero
) {
  const current = await getSiteStudioConfig();
  const next = {
    ...current,
    ...(slot === "primary"
      ? { hero: { ...hero, slot: "primary" as const } }
      : {
          secondaryHero: {
            ...hero,
            slot: "secondary" as const,
          },
        }),
  };

  return saveSiteStudioConfig(next);
}

export async function updateSiteStudioRanking(
  ranking: SiteStudioRankingItem
) {
  const current = await getSiteStudioConfig();

  return saveSiteStudioConfig({
    ...current,
    rankings: current.rankings.map((item) =>
      item.rank === ranking.rank ? ranking : item
    ),
  });
}

export async function updateSiteStudioSection(
  section: SiteStudioSection
) {
  const current = await getSiteStudioConfig();

  return saveSiteStudioConfig({
    ...current,
    sections: current.sections.map((item) =>
      item.key === section.key ? section : item
    ),
  });
}
