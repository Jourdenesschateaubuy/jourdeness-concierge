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
    SELECT
      s.id,
      s.name AS series,
      c.name AS category,
      s.is_active,
      s.created_at
    FROM catalog_series AS s
    JOIN catalog_categories AS c
      ON c.id = s.category_id
    WHERE s.name = '測試系列-可刪除'
      AND c.name = '臉部保養'
  `);

  console.table(result.rows);

  console.log(
    result.rows.length === 1
      ? "✅ 測試系列已正確寫入 Neon"
      : `⚠ 找到 ${result.rows.length} 筆`
  );
} finally {
  await client.end();
}
