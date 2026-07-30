import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

async function main() {
  const connectionString = loadDatabaseUrl();

  const migrationPath = path.resolve(
    process.cwd(),
    "db",
    "migrations",
    "004-catalog-taxonomy.sql"
  );

  const sql = fs.readFileSync(migrationPath, "utf8").replace(/^\uFEFF/, "");

  const client = new Client({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await client.connect();

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    const categories = await client.query(`
      SELECT
        c.id,
        c.name,
        c.is_active,
        COUNT(s.id)::int AS series_count
      FROM catalog_categories AS c
      LEFT JOIN catalog_series AS s
        ON s.category_id = c.id
      GROUP BY c.id, c.name, c.is_active
      ORDER BY c.name
    `);

    const series = await client.query(`
      SELECT
        s.id,
        c.name AS category,
        s.name AS series,
        s.is_active
      FROM catalog_series AS s
      JOIN catalog_categories AS c
        ON c.id = s.category_id
      ORDER BY c.name, s.name
    `);

    console.log("✅ Catalog taxonomy migration 完成");

    console.log("");
    console.log("分類：");
    console.table(categories.rows);

    console.log("");
    console.log("系列：");
    console.table(series.rows);

    console.log(
      `✅ 共建立 ${categories.rows.length} 個分類、${series.rows.length} 個系列`
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("❌ Catalog taxonomy migration 失敗");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error("❌ migration 啟動失敗");
  console.error(error);
  process.exitCode = 1;
});
