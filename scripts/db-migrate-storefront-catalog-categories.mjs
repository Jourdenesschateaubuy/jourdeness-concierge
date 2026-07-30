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
    "006-storefront-catalog-categories.sql"
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

    const result = await client.query(`
      SELECT id, name, sort_order, is_active
      FROM catalog_categories
      WHERE name IN (
        '臉部保養',
        '身體洗護',
        '健康補給',
        '精油香氛',
        '新品預告'
      )
      ORDER BY sort_order ASC
    `);

    console.log("✅ Admin V2 前台分類已準備完成");
    console.table(result.rows);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("❌ migration 失敗");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
