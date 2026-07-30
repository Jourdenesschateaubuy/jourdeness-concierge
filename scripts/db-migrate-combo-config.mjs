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
    "003-combo-config.sql"
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
      SELECT
        id,
        name,
        combo_config->>'type' AS combo_type,
        combo_config->>'unitLabel' AS unit_label,
        jsonb_array_length(
          COALESCE(combo_config->'options', '[]'::jsonb)
        ) AS option_count,
        jsonb_array_length(
          COALESCE(combo_config->'plans', '[]'::jsonb)
        ) AS plan_count
      FROM products
      WHERE id IN (1, 51, 54, 55, 67, 108, 119)
      ORDER BY id
    `);

    console.log("✅ Combo Config migration 完成");
    console.table(result.rows);

    const configuredCount = result.rows.filter(
      (row) => row.combo_type
    ).length;

    if (configuredCount === 7) {
      console.log("✅ 7 組既有組合價都已搬入資料庫");
    } else {
      console.warn(
        `⚠ 找到 ${configuredCount}/7 組設定，可能有商品 ID 不存在`
      );
    }
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("❌ Combo Config migration 失敗");
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
