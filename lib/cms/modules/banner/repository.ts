import {
  dbQuery,
  withDbClient,
} from "../../../db";

import {
  defaultBannerSnapshot,
  type BannerItem,
  type BannerSnapshot,
  type BannerStatus,
  type BannerVersion,
} from "./types";

function parseJson(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
}

function normalizeItem(
  value: unknown,
  index: number
): BannerItem {
  const source =
    value && typeof value === "object"
      ? (value as Partial<BannerItem>)
      : {};

  const linkType =
    source.linkType === "category" ||
    source.linkType === "product" ||
    source.linkType === "none"
      ? source.linkType
      : "url";

  return {
    id:
      String(
        source.id ||
          `banner-${index + 1}`
      ),
    name:
      String(
        source.name ||
          `Banner ${index + 1}`
      ),
    title:
      String(source.title || ""),
    subtitle:
      String(source.subtitle || ""),
    buttonLabel:
      String(source.buttonLabel || ""),
    mobileMediaId:
      Number.isInteger(
        Number(source.mobileMediaId)
      ) &&
      Number(source.mobileMediaId) > 0
        ? Number(source.mobileMediaId)
        : null,
    desktopMediaId:
      Number.isInteger(
        Number(source.desktopMediaId)
      ) &&
      Number(source.desktopMediaId) > 0
        ? Number(source.desktopMediaId)
        : null,
    mobileImage:
      String(source.mobileImage || ""),
    desktopImage:
      String(source.desktopImage || ""),
    alt:
      String(source.alt || ""),
    linkType,
    linkValue:
      String(source.linkValue || ""),
    isVisible:
      source.isVisible !== false,
  };
}

function normalizeSnapshot(
  value: unknown
): BannerSnapshot {
  const parsed =
    parseJson(value) as Partial<BannerSnapshot> | null;

  return {
    items: Array.isArray(parsed?.items)
      ? parsed!.items.map(
          (item, index) =>
            normalizeItem(item, index)
        )
      : defaultBannerSnapshot.items,
  };
}

export async function getBannerStatus(): Promise<BannerStatus> {
  const stateResult =
    await dbQuery<{
      draft_data: unknown;
      published_version_id: number | null;
      published_at: Date | string | null;
    }>(
      `
        SELECT
          draft_data,
          published_version_id,
          published_at
        FROM banner_state
        WHERE id = 1
        LIMIT 1
      `
    );

  const state = stateResult.rows[0];

  if (!state) {
    return {
      draft: defaultBannerSnapshot,
      published: defaultBannerSnapshot,
      publishedVersionNumber: null,
      publishedAt: null,
      history: [],
    };
  }

  let published =
    defaultBannerSnapshot;
  let publishedVersionNumber:
    | number
    | null = null;

  if (state.published_version_id) {
    const publishedResult =
      await dbQuery<{
        version_number: number;
        snapshot: unknown;
      }>(
        `
          SELECT
            version_number,
            snapshot
          FROM banner_versions
          WHERE id = $1
          LIMIT 1
        `,
        [state.published_version_id]
      );

    const row =
      publishedResult.rows[0];

    if (row) {
      published =
        normalizeSnapshot(row.snapshot);
      publishedVersionNumber =
        Number(row.version_number);
    }
  }

  const historyResult =
    await dbQuery<{
      id: number;
      version_number: number;
      action:
        | "migration"
        | "publish"
        | "rollback";
      source_version_number:
        | number
        | null;
      created_at: Date | string;
    }>(
      `
        SELECT
          id,
          version_number,
          action,
          source_version_number,
          created_at
        FROM banner_versions
        ORDER BY version_number DESC
        LIMIT 20
      `
    );

  const history: BannerVersion[] =
    historyResult.rows.map(
      (row) => ({
        id: Number(row.id),
        versionNumber:
          Number(row.version_number),
        action: row.action,
        sourceVersionNumber:
          row.source_version_number
            ? Number(
                row.source_version_number
              )
            : undefined,
        createdAt: new Date(
          row.created_at
        ).toISOString(),
      })
    );

  return {
    draft: normalizeSnapshot(
      state.draft_data
    ),
    published,
    publishedVersionNumber,
    publishedAt:
      state.published_at
        ? new Date(
            state.published_at
          ).toISOString()
        : null,
    history,
  };
}

export async function saveBannerDraft(
  snapshot: BannerSnapshot
) {
  const normalized =
    normalizeSnapshot(snapshot);

  await dbQuery(
    `
      INSERT INTO banner_state (
        id,
        draft_data,
        updated_at
      )
      VALUES (
        1,
        $1::jsonb,
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        draft_data = EXCLUDED.draft_data,
        updated_at = NOW()
    `,
    [JSON.stringify(normalized)]
  );

  return normalized;
}

export async function publishBannerDraft() {
  return withDbClient(
    async (client) => {
      await client.query("BEGIN");

      try {
        const stateResult =
          await client.query<{
            draft_data: unknown;
          }>(
            `
              SELECT draft_data
              FROM banner_state
              WHERE id = 1
              FOR UPDATE
            `
          );

        const draft =
          normalizeSnapshot(
            stateResult.rows[0]
              ?.draft_data
          );

        const versionResult =
          await client.query<{
            next_version: number;
          }>(
            `
              SELECT
                COALESCE(
                  MAX(version_number),
                  0
                ) + 1 AS next_version
              FROM banner_versions
            `
          );

        const nextVersion =
          Number(
            versionResult.rows[0]
              ?.next_version ?? 1
          );

        const created =
          await client.query<{
            id: number;
          }>(
            `
              INSERT INTO banner_versions (
                version_number,
                action,
                snapshot,
                created_at
              )
              VALUES (
                $1,
                'publish',
                $2::jsonb,
                NOW()
              )
              RETURNING id
            `,
            [
              nextVersion,
              JSON.stringify(draft),
            ]
          );

        const versionId =
          Number(created.rows[0]?.id);

        await client.query(
          `
            UPDATE banner_state
            SET
              published_version_id = $1,
              published_at = NOW(),
              updated_at = NOW()
            WHERE id = 1
          `,
          [versionId]
        );

        await client.query("COMMIT");

        return {
          versionNumber:
            nextVersion,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  );
}

export async function rollbackBannerToVersion(
  targetVersionNumber: number
) {
  return withDbClient(
    async (client) => {
      await client.query("BEGIN");

      try {
        const targetResult =
          await client.query<{
            snapshot: unknown;
          }>(
            `
              SELECT snapshot
              FROM banner_versions
              WHERE version_number = $1
              LIMIT 1
            `,
            [targetVersionNumber]
          );

        const target =
          targetResult.rows[0];

        if (!target) {
          throw new Error(
            "找不到指定 Banner Version。"
          );
        }

        const targetSnapshot =
          normalizeSnapshot(
            target.snapshot
          );

        const nextResult =
          await client.query<{
            next_version: number;
          }>(
            `
              SELECT
                COALESCE(
                  MAX(version_number),
                  0
                ) + 1 AS next_version
              FROM banner_versions
            `
          );

        const nextVersion =
          Number(
            nextResult.rows[0]
              ?.next_version ?? 1
          );

        const created =
          await client.query<{
            id: number;
          }>(
            `
              INSERT INTO banner_versions (
                version_number,
                action,
                source_version_number,
                snapshot,
                created_at
              )
              VALUES (
                $1,
                'rollback',
                $2,
                $3::jsonb,
                NOW()
              )
              RETURNING id
            `,
            [
              nextVersion,
              targetVersionNumber,
              JSON.stringify(
                targetSnapshot
              ),
            ]
          );

        const versionId =
          Number(created.rows[0]?.id);

        await client.query(
          `
            UPDATE banner_state
            SET
              draft_data = $1::jsonb,
              published_version_id = $2,
              published_at = NOW(),
              updated_at = NOW()
            WHERE id = 1
          `,
          [
            JSON.stringify(
              targetSnapshot
            ),
            versionId,
          ]
        );

        await client.query("COMMIT");

        return {
          versionNumber:
            nextVersion,
        };
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  );
}
