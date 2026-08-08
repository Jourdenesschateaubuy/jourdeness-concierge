import {
  defaultWebsiteSettings,
  type WebsiteSettingsData,
  type WebsiteSettingsPublicationVersion,
  type WebsiteSettingsStatus,
} from "./types";

import {
  dbQuery,
  withDbClient,
} from "../../../db";

function normalizeSettings(
  value: unknown
): WebsiteSettingsData {
  const source =
    value &&
    typeof value === "object"
      ? (value as Partial<WebsiteSettingsData>)
      : {};

  return {
    ...defaultWebsiteSettings,
    ...source,
  };
}

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

export async function getWebsiteSettingsStatus(): Promise<WebsiteSettingsStatus> {
  const stateResult = await dbQuery<{
    draft_data: unknown;
    published_version_id: number | null;
    published_at: Date | string | null;
  }>(
    `
      SELECT
        draft_data,
        published_version_id,
        published_at
      FROM website_settings_state
      WHERE id = 1
      LIMIT 1
    `
  );

  const state = stateResult.rows[0];

  if (!state) {
    return {
      draft: defaultWebsiteSettings,
      published: defaultWebsiteSettings,
      publishedVersionNumber: null,
      publishedAt: null,
      history: [],
    };
  }

  let published =
    defaultWebsiteSettings;
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
          FROM website_settings_versions
          WHERE id = $1
          LIMIT 1
        `,
        [state.published_version_id]
      );

    const row =
      publishedResult.rows[0];

    if (row) {
      published =
        normalizeSettings(
          parseJson(row.snapshot)
        );
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
        FROM website_settings_versions
        ORDER BY version_number DESC
        LIMIT 20
      `
    );

  const history: WebsiteSettingsPublicationVersion[] =
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
    draft: normalizeSettings(
      parseJson(state.draft_data)
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

export async function saveWebsiteSettingsDraft(
  settings: WebsiteSettingsData
) {
  const normalized =
    normalizeSettings(settings);

  await dbQuery(
    `
      INSERT INTO website_settings_state (
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

export async function publishWebsiteSettingsDraft() {
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
              FROM website_settings_state
              WHERE id = 1
              FOR UPDATE
            `
          );

        const draft =
          normalizeSettings(
            parseJson(
              stateResult.rows[0]
                ?.draft_data
            )
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
              FROM website_settings_versions
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
              INSERT INTO website_settings_versions (
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
            UPDATE website_settings_state
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

export async function rollbackWebsiteSettingsToVersion(
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
              FROM website_settings_versions
              WHERE version_number = $1
              LIMIT 1
            `,
            [targetVersionNumber]
          );

        const target =
          targetResult.rows[0];

        if (!target) {
          throw new Error(
            "找不到指定 Website Settings Version。"
          );
        }

        const targetSnapshot =
          normalizeSettings(
            parseJson(
              target.snapshot
            )
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
              FROM website_settings_versions
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
              INSERT INTO website_settings_versions (
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
            UPDATE website_settings_state
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
