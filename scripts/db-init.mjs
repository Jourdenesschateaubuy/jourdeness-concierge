import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

const connectionString = loadDatabaseUrl();
const schemaPath = path.resolve(process.cwd(), "db", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

try {
  await client.connect();
  await client.query(schema);
  console.log("✅ products 資料表已建立／確認完成");
} catch (error) {
  console.error("❌ 建立資料表失敗");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
