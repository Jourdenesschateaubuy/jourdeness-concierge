import fs from "node:fs";
import path from "node:path";
import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const root = process.cwd();

const migrationPath = path.join(
  root,
  "db",
  "migrations",
  "015-product-catalog-categories.sql"
);

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const envPath = path.join(
    root,
    ".env.local"
  );

  if (!fs.existsSync(envPath)) {
    throw new Error(
      "找不到 .env.local"
    );
  }

  const text = fs.readFileSync(
    envPath,
    "utf8"
  );

  const line = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(
      (item) =>
        item.startsWith(
          "DATABASE_URL="
        )
    );

  if (!line) {
    throw new Error(
      ".env.local 找不到 DATABASE_URL"
    );
  }

  let value = line
    .slice(
      "DATABASE_URL=".length
    )
    .trim();

  if (
    (value.startsWith('"') &&
      value.endsWith('"')) ||
    (value.startsWith("'") &&
      value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!value) {
    throw new Error(
      "DATABASE_URL 是空白"
    );
  }

  return value;
}

async function main() {
  console.log(
    "===== PRODUCT CATALOG CATEGORIES MIGRATION ====="
  );

  if (
    !fs.existsSync(
      migrationPath
    )
  ) {
    throw new Error(
      "找不到 015 migration"
    );
  }

  const sql =
    fs.readFileSync(
      migrationPath,
      "utf8"
    );

  const pool = new Pool({
    connectionString:
      loadDatabaseUrl(),
    max: 1,
    connectionTimeoutMillis:
      15000,
  });

  const client =
    await pool.connect();

  try {
    console.log(
      "✅ Database connected"
    );

    console.log("");
    console.log(
      "===== BEFORE ====="
    );

    const beforeProducts =
      await client.query(`
        SELECT
          COUNT(*)::int AS count
        FROM products
      `);

    const beforeEligible =
      await client.query(`
        SELECT
          COUNT(*)::int AS count
        FROM products
        WHERE COALESCE(
          NULLIF(
            TRIM(
              storefront_category
            ),
            ''
          ),
          NULLIF(
            TRIM(category),
            ''
          )
        ) IS NOT NULL
      `);

    const beforeTable =
      await client.query(`
        SELECT
          to_regclass(
            'public.product_catalog_categories'
          ) AS table_name
      `);

    console.log(
      "Products       =",
      beforeProducts.rows[0]
        .count
    );

    console.log(
      "Categorized    =",
      beforeEligible.rows[0]
        .count
    );

    console.log(
      "Relation table =",
      beforeTable.rows[0]
        .table_name ??
        "not created"
    );

    console.log("");
    console.log(
      "===== BEGIN TRANSACTION ====="
    );

    await client.query(
      "BEGIN"
    );

    console.log(
      "===== APPLY 015 ====="
    );

    await client.query(sql);

    console.log(
      "✅ SQL executed"
    );

    console.log("");
    console.log(
      "===== VERIFY ====="
    );

    const relationCount =
      await client.query(`
        SELECT
          COUNT(*)::int
            AS relations,
          COUNT(
            DISTINCT product_id
          )::int
            AS products
        FROM
          product_catalog_categories
      `);

    const missing =
      await client.query(`
        WITH effective AS (
          SELECT
            p.id,
            COALESCE(
              NULLIF(
                TRIM(
                  p.storefront_category
                ),
                ''
              ),
              NULLIF(
                TRIM(
                  p.category
                ),
                ''
              )
            )
              AS category_name
          FROM products p
        )
        SELECT
          COUNT(*)::int
            AS count
        FROM effective e
        LEFT JOIN
          catalog_categories c
          ON
            c.name =
            e.category_name
        LEFT JOIN
          product_catalog_categories pc
          ON
            pc.product_id =
            e.id
          AND
            pc.category_id =
            c.id
        WHERE
          e.category_name
            IS NOT NULL
          AND
          pc.product_id
            IS NULL
      `);

    console.log(
      "Relation rows   =",
      relationCount.rows[0]
        .relations
    );

    console.log(
      "Products linked =",
      relationCount.rows[0]
        .products
    );

    console.log(
      "Missing links   =",
      missing.rows[0]
        .count
    );

    if (
      missing.rows[0]
        .count !== 0
    ) {
      throw new Error(
        `仍有 ${
          missing.rows[0]
            .count
        } 件商品未建立分類關聯`
      );
    }

    const duplicateCheck =
      await client.query(`
        SELECT COUNT(*)::int
          AS count
        FROM (
          SELECT
            product_id,
            category_id,
            COUNT(*)
          FROM
            product_catalog_categories
          GROUP BY
            product_id,
            category_id
          HAVING COUNT(*) > 1
        ) duplicate_rows
      `);

    console.log(
      "Duplicate links =",
      duplicateCheck.rows[0]
        .count
    );

    if (
      duplicateCheck.rows[0]
        .count !== 0
    ) {
      throw new Error(
        "發現重複商品分類關聯"
      );
    }

    await client.query(
      "COMMIT"
    );

    console.log("");
    console.log(
      "✅ MIGRATION COMMITTED"
    );

    console.log("");
    console.log(
      "===== CATEGORY COUNTS ====="
    );

    const categoryStats =
      await client.query(`
        SELECT
          c.name,
          COUNT(
            pc.product_id
          )::int
            AS product_count
        FROM
          catalog_categories c
        LEFT JOIN
          product_catalog_categories pc
          ON
            pc.category_id =
            c.id
        GROUP BY
          c.id,
          c.name,
          c.sort_order
        ORDER BY
          c.sort_order ASC,
          c.id ASC
      `);

    for (
      const row
      of categoryStats.rows
    ) {
      console.log(
        `${row.name}: ${row.product_count}`
      );
    }

    console.log("");
    console.log(
      "===== FINAL TABLE CHECK ====="
    );

    const finalCheck =
      await client.query(`
        SELECT
          to_regclass(
            'public.product_catalog_categories'
          ) AS table_name
      `);

    console.log(
      "product_catalog_categories =",
      finalCheck.rows[0]
        .table_name
    );

    console.log("");
    console.log(
      "✅ 015 MIGRATION COMPLETE"
    );
  }
  catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      );

      console.error("");
      console.error(
        "✅ ROLLBACK completed"
      );
    }
    catch {
      console.error(
        "⚠️ ROLLBACK 無法確認"
      );
    }

    throw error;
  }
  finally {
    client.release();

    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "❌ MIGRATION FAILED"
    );

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    process.exitCode = 1;
  }
);
