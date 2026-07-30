import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

const client = new Client({
  connectionString: loadDatabaseUrl(),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

try {
  await client.connect();

  const result = await client.query(`
    DELETE FROM catalog_series
    WHERE id = 49
      AND name = '玫瑰系列'
    RETURNING id, name
  `);

  console.table(result.rows);

  console.log(
    result.rows.length === 1
      ? "✅ 測試系列已刪除"
      : "⚠ 沒有刪除任何資料"
  );
} finally {
  await client.end();
}
