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

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

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

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS storefront_sections (
        id BIGSERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        section_type TEXT NOT NULL DEFAULT 'category'
          CHECK (
            section_type IN (
              'category',
              'homepage',
              'campaign',
              'custom'
            )
          ),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS storefront_section_items (
        id BIGSERIAL PRIMARY KEY,
        section_id BIGINT NOT NULL
          REFERENCES storefront_sections(id)
          ON DELETE CASCADE,
        product_id INTEGER NOT NULL
          REFERENCES products(id)
          ON DELETE CASCADE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_visible BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (section_id, product_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
        storefront_section_items_section_sort_idx
      ON storefront_section_items (
        section_id,
        sort_order,
        id
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
        storefront_section_items_product_idx
      ON storefront_section_items (product_id)
    `);

    const categoryTableResult = await client.query(`
      SELECT to_regclass('public.catalog_categories') AS table_name
    `);

    const hasCatalogCategories =
      Boolean(categoryTableResult.rows[0]?.table_name);

    if (hasCatalogCategories) {
      await client.query(`
        INSERT INTO storefront_sections (
          code,
          name,
          description,
          section_type,
          is_active,
          sort_order,
          updated_at
        )
        SELECT
          'category-' || c.id::text,
          c.name,
          '由既有商城分類自動建立',
          'category',
          c.is_active,
          c.sort_order,
          NOW()
        FROM catalog_categories c
        ON CONFLICT (code)
        DO UPDATE SET
          name = EXCLUDED.name,
          is_active = EXCLUDED.is_active,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `);
    }

    await client.query(`
      INSERT INTO storefront_section_items (
        section_id,
        product_id,
        sort_order,
        is_visible,
        updated_at
      )
      SELECT
        s.id,
        p.id,
        p.sort_order,
        p.status <> 'inactive',
        NOW()
      FROM products p
      JOIN storefront_sections s
        ON s.section_type = 'category'
       AND s.name =
         COALESCE(
           NULLIF(BTRIM(p.storefront_category), ''),
           p.category
         )
      ON CONFLICT (section_id, product_id)
      DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `);

    const sectionCount = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM storefront_sections
    `);

    const itemCount = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM storefront_section_items
    `);

    await client.query("COMMIT");

    console.log("Storefront Data Model v2 migration completed.");
    console.log(
      `Sections: ${sectionCount.rows[0]?.count ?? 0}`
    );
    console.log(
      `Section items: ${itemCount.rows[0]?.count ?? 0}`
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
  console.error("Storefront migration failed:");
  console.error(error);
  process.exitCode = 1;
});
