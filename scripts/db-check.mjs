import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;
const connectionString = loadDatabaseUrl();

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

try {
  await client.connect();

  const countResult = await client.query(
    "SELECT COUNT(*)::int AS count FROM products"
  );

  const sampleResult = await client.query(`
    SELECT id, name, category, series, price, status
    FROM products
    ORDER BY sort_order ASC, id ASC
    LIMIT 8
  `);

  console.log(`✅ products 總數：${countResult.rows[0].count}`);
  console.table(sampleResult.rows);
} catch (error) {
  console.error("❌ 資料庫檢查失敗");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
