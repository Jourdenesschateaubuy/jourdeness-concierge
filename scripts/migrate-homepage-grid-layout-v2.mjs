import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const index = line.indexOf("=");
    if (index <= 0) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL 尚未設定。");
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

function normalizeSection(section) {
  const desktopColumns =
    section.desktopColumns === 3 || section.desktopColumns === 5
      ? section.desktopColumns
      : 4;

  const mobileColumns =
    section.mobileColumns === 1 ? 1 : 2;

  return {
    ...section,
    layoutType: "grid",
    desktopColumns,
    mobileColumns,
  };
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE storefront_sections
      ADD COLUMN IF NOT EXISTS
        desktop_columns INTEGER NOT NULL DEFAULT 4
    `);

    await client.query(`
      ALTER TABLE storefront_sections
      ADD COLUMN IF NOT EXISTS
        mobile_columns INTEGER NOT NULL DEFAULT 2
    `);

    await client.query(`
      UPDATE storefront_sections
      SET
        layout_type = 'grid',
        desktop_columns = CASE
          WHEN desktop_columns IN (3, 4, 5)
            THEN desktop_columns
          ELSE 4
        END,
        mobile_columns = CASE
          WHEN mobile_columns IN (1, 2)
            THEN mobile_columns
          ELSE 2
        END
      WHERE section_type = 'homepage'
    `);

    const versionTable = await client.query(`
      SELECT to_regclass('public.homepage_versions') AS name
    `);

    if (versionTable.rows[0]?.name) {
      const versions = await client.query(`
        SELECT id, snapshot
        FROM homepage_versions
        ORDER BY id ASC
        FOR UPDATE
      `);

      for (const row of versions.rows) {
        const snapshot =
          typeof row.snapshot === "string"
            ? JSON.parse(row.snapshot)
            : row.snapshot;

        const sections = Array.isArray(snapshot?.sections)
          ? snapshot.sections.map(normalizeSection)
          : [];

        await client.query(
          `
            UPDATE homepage_versions
            SET snapshot = $2::jsonb
            WHERE id = $1
          `,
          [
            row.id,
            JSON.stringify({
              ...snapshot,
              sections,
            }),
          ]
        );
      }
    }

    await client.query("COMMIT");

    console.log(
      "Homepage Grid Layout Settings v2 migration completed."
    );
    console.log(
      "All homepage sections and version snapshots now use Grid."
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
  console.error(error);
  process.exitCode = 1;
});
