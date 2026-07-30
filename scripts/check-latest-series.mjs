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
    ORDER BY s.created_at DESC, s.id DESC
    LIMIT 10
  `);

  console.table(result.rows);
} finally {
  await client.end();
}
