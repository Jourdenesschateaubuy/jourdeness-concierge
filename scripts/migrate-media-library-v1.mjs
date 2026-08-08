import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

function loadEnvLocal() {
  const envPath = path.resolve(
    process.cwd(),
    ".env.local"
  );

  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(
    envPath,
    "utf8"
  );

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (
      !line ||
      line.startsWith("#")
    ) {
      continue;
    }

    const index =
      line.indexOf("=");

    if (index <= 0) continue;

    const key =
      line
        .slice(0, index)
        .trim();

    let value =
      line
        .slice(index + 1)
        .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value =
        value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] =
        value;
    }
  }
}

loadEnvLocal();

const connectionString =
  process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL 尚未設定。"
  );
}

if (
  !process.env.UPLOAD_ROOT?.trim()
) {
  console.warn(
    "警告：UPLOAD_ROOT 尚未設定。Migration 可執行，但實際上傳圖片前必須設定。"
  );
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV ===
    "production"
      ? {
          rejectUnauthorized:
            false,
        }
      : undefined,
});

async function main() {
  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS
        media_assets (
          id BIGSERIAL PRIMARY KEY,
          original_name TEXT NOT NULL,
          storage_path TEXT NOT NULL UNIQUE,
          mime_type TEXT NOT NULL,
          byte_size BIGINT NOT NULL DEFAULT 0,
          title TEXT NOT NULL DEFAULT '',
          alt_text TEXT NOT NULL DEFAULT '',
          tags TEXT[] NOT NULL DEFAULT '{}',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS
        media_assets_active_created_idx
      ON media_assets (
        is_active,
        created_at DESC
      )
    `);

    await client.query("COMMIT");

    console.log(
      "Media Library v1 migration completed."
    );

    if (
      process.env.UPLOAD_ROOT?.trim()
    ) {
      console.log(
        `UPLOAD_ROOT: ${process.env.UPLOAD_ROOT.trim()}`
      );
    }
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
