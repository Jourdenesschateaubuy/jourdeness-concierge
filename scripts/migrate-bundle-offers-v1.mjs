import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";

import ws from "ws";

neonConfig.webSocketConstructor = ws;

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found.");
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const index = line.indexOf("=");
    if (index <= 0) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

async function main() {
  const migrationPath = path.resolve(
    process.cwd(),
    "db",
    "migrations",
    "007-bundle-offers.sql"
  );

  if (!fs.existsSync(migrationPath)) {
    throw new Error("007-bundle-offers.sql not found.");
  }

  const sql = fs.readFileSync(migrationPath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(sql);

    const verification = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'bundle_offers',
          'bundle_offer_items',
          'bundle_offer_plans'
        )
      ORDER BY table_name
    `);

    if (verification.rows.length !== 3) {
      throw new Error(
        `Bundle table verification failed: found ${verification.rows.length}/3 tables.`
      );
    }

    await client.query("COMMIT");

    console.log("Bundle offers migration completed.");
    console.table(verification.rows);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
