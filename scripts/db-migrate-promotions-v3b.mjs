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
    "004-storefront-promotion-sync.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  const client = new Client({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log("✅ Phase 3B promotion sync migration 完成");
  } catch (error) {
    console.error("❌ Phase 3B migration 失敗");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error("❌ Phase 3B migration 啟動失敗");
  console.error(error);
  process.exitCode = 1;
});
