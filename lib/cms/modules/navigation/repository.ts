import {
  dbQuery,
  withDbClient,
} from "../../../db";

import {
  defaultNavigation,
  type NavigationSnapshot,
  type NavigationStatus,
  type NavigationVersion,
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

function normalizeSnapshot(
  value: unknown
): NavigationSnapshot {
  const source =
    parseJson(value) as Partial<NavigationSnapshot> | null;

  const items =
    Array.isArray(source?.items)
      ? source!.items
          .filter(
            (item) =>
              item &&
              typeof item === "object"
          )
          .map((item, index) => ({
            id:
              String(
                (item as any).id ||
                  `item-${index + 1}`
              ),
            label:
              String(
                (item as any).label ||
                  `選單 ${index + 1}`
              ),
            linkType:
              (
                ["url", "category", "homepage", "none"] as const
              ).includes(
                (item as any).linkType
              )
                ? (item as any).linkType
                : "url",
            linkValue:
              String(
                (item as any).linkValue || ""
              ),
            isVisible:
              (item as any).isVisible !== false,
          }))
      : defaultNavigation.items;

  return {
    items,
  };
}

export async function getNavigationStatus(): Promise<NavigationStatus> {
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
        FROM navigation_state
        WHERE id = 1
        LIMIT 1
      `
    );

  const state = stateResult.rows[0];

  if (!state) {
    return {
      draft: defaultNavigation,
      published: defaultNavigation,
      publishedVersionNumber: null,
      publishedAt: null,
      history: [],
    };
  }

  let published =
    defaultNavigation;
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
          FROM navigation_versions
          WHERE id = $1
          LIMIT 1
        `,
        [state.published_version_id]
      );

    const row =
      publishedResult.rows[0];

    if (row) {
      published =
        normalizeSnapshot(
          row.snapshot
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
        FROM navigation_versions
        ORDER BY version_number DESC
        LIMIT 20
      `
    );

  const history: NavigationVersion[] =
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

export async function saveNavigationDraft(
  snapshot: NavigationSnapshot
) {
  const normalized =
    normalizeSnapshot(snapshot);

  await dbQuery(
    `
      INSERT INTO navigation_state (
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

export async function publishNavigationDraft() {
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
              FROM navigation_state
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
              FROM navigation_versions
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
              INSERT INTO navigation_versions (
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
            UPDATE navigation_state
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

export async function rollbackNavigationToVersion(
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
              FROM navigation_versions
              WHERE version_number = $1
              LIMIT 1
            `,
            [targetVersionNumber]
          );

        const target =
          targetResult.rows[0];

        if (!target) {
          throw new Error(
            "找不到指定 Navigation Version。"
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
              FROM navigation_versions
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
              INSERT INTO navigation_versions (
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
            UPDATE navigation_state
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

