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
  const envPath = path.resolve(
    process.cwd(),
    ".env.local"
  );

  const content =
    fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index <= 0) continue;

    process.env[line.slice(0, index)] =
      line.slice(index + 1);
  }
}

loadEnvLocal();


const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
});


async function main() {
  const migrationPath =
    path.resolve(
      process.cwd(),
      "db",
      "migrations",
      "013-orders.sql"
    );

  const sql =
    fs.readFileSync(
      migrationPath,
      "utf8"
    );


  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(sql);

    await client.query("COMMIT");

    console.log(
      "Orders migration completed."
    );

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
  process.exit(1);
});
