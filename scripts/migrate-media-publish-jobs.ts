import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString =
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL 尚未設定");
  }

  const pool = new Pool({
    connectionString,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_publish_jobs (
        id BIGSERIAL PRIMARY KEY,
        media_id BIGINT NOT NULL REFERENCES media_assets(id),
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN (
            'pending',
            'processing',
            'published',
            'failed'
          )),
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        error_message TEXT,
        published_commit TEXT
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
        media_publish_jobs_status_idx
      ON media_publish_jobs(status, requested_at)
    `);

    console.log("MEDIA PUBLISH JOB TABLE OK");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
