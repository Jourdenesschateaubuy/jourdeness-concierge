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

    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index <= 0) continue;

    const key = line
      .slice(0, index)
      .trim();

    let value = line
      .slice(index + 1)
      .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
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

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

const DEFAULT_NAVIGATION = {
  items: [
    {
      id: "home",
      label: "首頁",
      linkType: "homepage",
      linkValue: "/",
      isVisible: true,
    },
    {
      id: "products",
      label: "商品",
      linkType: "url",
      linkValue: "/#products",
      isVisible: true,
    },
    {
      id: "brand",
      label: "品牌故事",
      linkType: "url",
      linkValue: "/#brand",
      isVisible: true,
    },
  ],
};

async function main() {
  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS
        navigation_versions (
          id BIGSERIAL PRIMARY KEY,
          version_number INTEGER NOT NULL UNIQUE,
          action TEXT NOT NULL,
          source_version_number INTEGER,
          snapshot JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS
        navigation_state (
          id INTEGER PRIMARY KEY,
          draft_data JSONB NOT NULL,
          published_version_id BIGINT
            REFERENCES navigation_versions(id),
          published_at TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await client.query(
      `
        INSERT INTO navigation_state (
          id,
          draft_data,
          updated_at
        )
        VALUES (
          1,
          $1::jsonb,
          NOW()
        )
        ON CONFLICT (id)
        DO NOTHING
      `,
      [
        JSON.stringify(
          DEFAULT_NAVIGATION
        ),
      ]
    );

    await client.query("COMMIT");

    console.log(
      "Navigation Builder v1 migration completed."
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
  process.exitCode = 1;
});
