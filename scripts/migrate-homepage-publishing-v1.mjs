import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

function loadEnvLocal() {
  const envPath = path.resolve(
    process.cwd(),
    ".env.local"
  );

  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(
    envPath,
    "utf8"
  );

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) continue;

    const key = line
      .slice(0, separatorIndex)
      .trim();

    let value = line
      .slice(separatorIndex + 1)
      .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const connectionString =
  process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL 尚未設定。請先確認專案根目錄的 .env.local。"
  );
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function buildCurrentSnapshot(client) {
  const sectionsResult = await client.query(`
    SELECT
      id,
      code,
      name,
      description,
      sort_order
    FROM storefront_sections
    WHERE section_type = 'homepage'
      AND is_active = TRUE
    ORDER BY sort_order ASC, id ASC
  `);

  const sections = [];

  for (const section of sectionsResult.rows) {
    const items = await client.query(
      `
        SELECT i.product_id
        FROM storefront_section_items i
        JOIN products p
          ON p.id = i.product_id
        WHERE i.section_id = $1
          AND i.is_visible = TRUE
          AND p.status = 'active'
        ORDER BY i.sort_order ASC, i.id ASC
      `,
      [section.id]
    );

    sections.push({
      id: Number(section.id),
      code: section.code,
      name: section.name,
      description:
        section.description ?? undefined,
      sortOrder: Number(section.sort_order),
      productIds: items.rows.map(
        (row) => Number(row.product_id)
      ),
    });
  }

  return { sections };
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS
        homepage_versions (
          id BIGSERIAL PRIMARY KEY,
          version_number INTEGER
            UNIQUE NOT NULL,
          snapshot JSONB NOT NULL,
          action TEXT NOT NULL
            CHECK (
              action IN (
                'migration',
                'publish',
                'rollback'
              )
            ),
          source_version_number INTEGER,
          created_at TIMESTAMPTZ
            NOT NULL DEFAULT NOW()
        )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS
        homepage_publish_state (
          id SMALLINT PRIMARY KEY
            CHECK (id = 1),
          current_version_id BIGINT NOT NULL
            REFERENCES homepage_versions(id)
            ON DELETE RESTRICT,
          updated_at TIMESTAMPTZ
            NOT NULL DEFAULT NOW()
        )
    `);

    const stateResult = await client.query(`
      SELECT current_version_id
      FROM homepage_publish_state
      WHERE id = 1
      LIMIT 1
    `);

    if (!stateResult.rows[0]) {
      const snapshot =
        await buildCurrentSnapshot(client);

      const versionResult =
        await client.query(
          `
            INSERT INTO homepage_versions (
              version_number,
              snapshot,
              action,
              source_version_number
            )
            VALUES (
              1,
              $1::jsonb,
              'migration',
              NULL
            )
            RETURNING id
          `,
          [JSON.stringify(snapshot)]
        );

      const versionId =
        Number(versionResult.rows[0]?.id);

      if (!versionId) {
        throw new Error(
          "初始首頁發布版本建立失敗"
        );
      }

      await client.query(
        `
          INSERT INTO homepage_publish_state (
            id,
            current_version_id,
            updated_at
          )
          VALUES (1, $1, NOW())
        `,
        [versionId]
      );

      console.log(
        "Initial published snapshot created as version 1."
      );
    }

    await client.query("COMMIT");

    const state = await client.query(`
      SELECT
        v.version_number,
        v.action,
        v.created_at
      FROM homepage_publish_state s
      JOIN homepage_versions v
        ON v.id = s.current_version_id
      WHERE s.id = 1
    `);

    console.log(
      "Homepage publishing migration completed."
    );
    console.log(
      "Current published version:",
      state.rows[0]?.version_number ?? "none"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    "Homepage publishing migration failed:"
  );
  console.error(error);
  process.exitCode = 1;
});
