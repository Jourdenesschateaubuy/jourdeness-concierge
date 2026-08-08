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

    if (!process.env[key]) process.env[key] = value;
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

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE storefront_sections
      ADD COLUMN IF NOT EXISTS layout_type TEXT NOT NULL DEFAULT 'grid'
    `);

    await client.query(`
      ALTER TABLE storefront_sections
      ADD COLUMN IF NOT EXISTS max_items INTEGER NOT NULL DEFAULT 8
    `);

    await client.query(`
      ALTER TABLE storefront_sections
      ADD COLUMN IF NOT EXISTS background_style TEXT NOT NULL DEFAULT 'default'
    `);

    await client.query(`
      UPDATE storefront_sections
      SET
        layout_type = CASE
          WHEN layout_type IN ('grid', 'carousel') THEN layout_type
          ELSE 'grid'
        END,
        max_items = GREATEST(1, LEAST(24, COALESCE(max_items, 8))),
        background_style = CASE
          WHEN background_style IN ('default', 'soft', 'white')
            THEN background_style
          ELSE 'default'
        END
      WHERE section_type = 'homepage'
    `);

    await client.query("COMMIT");
    console.log("Homepage section layout settings migration completed.");
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
