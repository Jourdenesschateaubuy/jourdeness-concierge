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
    "005-storefront-category.sql"
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

    const column = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'products'
        AND column_name = 'storefront_category'
    `);

    const count = await client.query(`
      SELECT
        COUNT(*)::int AS total_products,
        COUNT(storefront_category)::int AS configured_products
      FROM products
    `);

    console.log("✅ storefront_category migration 完成");
    console.table(column.rows);
    console.table(count.rows);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("❌ storefront_category migration 失敗");
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
