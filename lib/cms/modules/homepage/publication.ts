import { dbQuery, withDbClient } from "../../../db";
import {
  listStorefrontSectionItems,
  listStorefrontSections,
} from "../../../storefront-section-repository";
import {
  normalizeHistoryLimit,
  toIsoDate,
  type CmsPublicationVersion,
} from "../../core/publication-types";
import {
  parseJsonSnapshot,
  serializeSnapshot,
} from "../../core/snapshot";

export type PublishedHomepageSection = {
  id: number;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  layoutType: "grid";
  desktopColumns: 3 | 4 | 5;
  mobileColumns: 1 | 2;
  maxItems: number;
  backgroundStyle: "default" | "soft" | "white";
  productIds: number[];
};

export type HomepagePublicationSnapshot = {
  sections: PublishedHomepageSection[];
};

export type HomepagePublicationVersion =
  CmsPublicationVersion;

type VersionRow = {
  id: number | string;
  version_number: number | string;
  action: HomepagePublicationVersion["action"];
  source_version_number: number | string | null;
  created_at: Date | string;
  snapshot?: HomepagePublicationSnapshot | string;
};

type StateRow = {
  current_version_id: number | string;
  version_number: number | string;
  published_at: Date | string;
  snapshot: HomepagePublicationSnapshot | string;
};

function parseSnapshot(
  value: HomepagePublicationSnapshot | string
): HomepagePublicationSnapshot {
  const parsed =
    parseJsonSnapshot<HomepagePublicationSnapshot>(
      value
    );

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
    : [];

  return {
    sections: sections.map((section) => ({
      ...section,
      layoutType: "grid",
      desktopColumns:
        section.desktopColumns === 3 || section.desktopColumns === 5
          ? section.desktopColumns
          : 4,
      mobileColumns:
        section.mobileColumns === 1 ? 1 : 2,
      maxItems: Math.max(1, Number(section.maxItems ?? 8)),
      backgroundStyle:
        section.backgroundStyle === "soft" ||
        section.backgroundStyle === "white"
          ? section.backgroundStyle
          : "default",
    })),
  };
}

export async function buildHomepageDraftSnapshot():
  Promise<HomepagePublicationSnapshot> {
  const sections = (
    await listStorefrontSections({
      includeInactive: false,
    })
  ).filter(
    (section) =>
      section.sectionType === "homepage" &&
      section.isActive
  );

  const snapshotSections = await Promise.all(
    sections.map(async (section) => {
      const items = await listStorefrontSectionItems(
        section.id,
        {
          includeHidden: false,
          includeInactiveProducts: false,
        }
      );

      return {
        id: section.id,
        code: section.code,
        name: section.name,
        description: section.description,
        sortOrder: section.sortOrder,
        layoutType: "grid" as const,
        desktopColumns: section.desktopColumns,
        mobileColumns: section.mobileColumns,
        maxItems: section.maxItems,
        backgroundStyle: section.backgroundStyle,
        productIds: items
          .filter(
            (item) =>
              item.isVisible &&
              item.product.status === "active"
          )
          .map((item) => item.productId)
          .slice(0, section.maxItems),
      };
    })
  );

  return {
    sections: snapshotSections.sort(
      (a, b) => a.sortOrder - b.sortOrder
    ),
  };
}

export async function getPublishedHomepageSnapshot():
  Promise<{
    snapshot: HomepagePublicationSnapshot;
    versionNumber: number | null;
    publishedAt: string | null;
  } | null> {
  const result = await dbQuery<StateRow>(
    `
      SELECT
        s.current_version_id,
        v.version_number,
        v.created_at AS published_at,
        v.snapshot
      FROM homepage_publish_state s
      JOIN homepage_versions v
        ON v.id = s.current_version_id
      WHERE s.id = 1
      LIMIT 1
    `
  );

  const row = result.rows[0];

  if (!row) return null;

  return {
    snapshot: parseSnapshot(row.snapshot),
    versionNumber: Number(row.version_number),
    publishedAt: toIsoDate(
      row.published_at
    ),
  };
}

export async function getHomepagePublicationHistory(
  limit = 12
): Promise<HomepagePublicationVersion[]> {
  const safeLimit =
    normalizeHistoryLimit(limit);

  const result = await dbQuery<VersionRow>(
    `
      SELECT
        id,
        version_number,
        action,
        source_version_number,
        created_at
      FROM homepage_versions
      ORDER BY version_number DESC
      LIMIT $1
    `,
    [safeLimit]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    versionNumber: Number(row.version_number),
    action: row.action,
    sourceVersionNumber:
      row.source_version_number === null
        ? undefined
        : Number(row.source_version_number),
    createdAt: toIsoDate(
      row.created_at
    ),
  }));
}

export async function getHomepagePublicationStatus() {
  const published = await getPublishedHomepageSnapshot();
  const history = await getHomepagePublicationHistory(12);

  return {
    currentVersionNumber:
      published?.versionNumber ?? null,
    publishedAt:
      published?.publishedAt ?? null,
    history,
  };
}

export async function publishHomepageDraft() {
  const snapshot =
    await buildHomepageDraftSnapshot();

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const versionResult =
        await client.query<VersionRow>(
          `
            INSERT INTO homepage_versions (
              version_number,
              snapshot,
              action,
              source_version_number
            )
            SELECT
              COALESCE(
                MAX(version_number),
                0
              ) + 1,
              $1::jsonb,
              'publish',
              NULL
            FROM homepage_versions
            RETURNING
              id,
              version_number,
              action,
              source_version_number,
              created_at
          `,
          [serializeSnapshot(snapshot)]
        );

      const version = versionResult.rows[0];

      if (!version) {
        throw new Error("首頁發布版本建立失敗");
      }

      await client.query(
        `
          INSERT INTO homepage_publish_state (
            id,
            current_version_id,
            updated_at
          )
          VALUES (1, $1, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            current_version_id =
              EXCLUDED.current_version_id,
            updated_at = NOW()
        `,
        [Number(version.id)]
      );

      await client.query("COMMIT");

      return {
        id: Number(version.id),
        versionNumber:
          Number(version.version_number),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function rollbackHomepageToVersion(
  targetVersionId: number
) {
  if (
    !Number.isInteger(targetVersionId) ||
    targetVersionId <= 0
  ) {
    throw new Error("版本 ID 無效");
  }

  return withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      const targetResult =
        await client.query<VersionRow>(
          `
            SELECT
              id,
              version_number,
              action,
              source_version_number,
              created_at,
              snapshot
            FROM homepage_versions
            WHERE id = $1
            LIMIT 1
            FOR UPDATE
          `,
          [targetVersionId]
        );

      const target = targetResult.rows[0];

      if (!target?.snapshot) {
        throw new Error("找不到指定首頁版本");
      }

      const nextResult =
        await client.query<VersionRow>(
          `
            INSERT INTO homepage_versions (
              version_number,
              snapshot,
              action,
              source_version_number
            )
            SELECT
              COALESCE(
                MAX(version_number),
                0
              ) + 1,
              $1::jsonb,
              'rollback',
              $2
            FROM homepage_versions
            RETURNING
              id,
              version_number,
              action,
              source_version_number,
              created_at
          `,
          [
            serializeSnapshot(
              parseSnapshot(target.snapshot)
            ),
            Number(target.version_number),
          ]
        );

      const next = nextResult.rows[0];

      if (!next) {
        throw new Error("Rollback 版本建立失敗");
      }

      await client.query(
        `
          INSERT INTO homepage_publish_state (
            id,
            current_version_id,
            updated_at
          )
          VALUES (1, $1, NOW())
          ON CONFLICT (id)
          DO UPDATE SET
            current_version_id =
              EXCLUDED.current_version_id,
            updated_at = NOW()
        `,
        [Number(next.id)]
      );

      await client.query("COMMIT");

      return {
        id: Number(next.id),
        versionNumber:
          Number(next.version_number),
        sourceVersionNumber:
          Number(target.version_number),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}
