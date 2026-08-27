import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";

import {
  execFileSync,
} from "node:child_process";

import fs from "node:fs";
import path from "node:path";
import ws from "ws";

neonConfig.webSocketConstructor =
  ws;

function loadLocalEnv() {
  const envPath =
    path.join(
      process.cwd(),
      ".env.local"
    );

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (
    const line
    of fs
      .readFileSync(
        envPath,
        "utf8"
      )
      .split(/\r?\n/)
  ) {
    const trimmed =
      line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const index =
      trimmed.indexOf("=");

    if (index <= 0) {
      continue;
    }

    const key =
      trimmed
        .slice(0, index)
        .trim();

    const value =
      trimmed
        .slice(index + 1)
        .trim();

    if (!process.env[key]) {
      process.env[key] =
        value;
    }
  }
}

async function ensureCleanupJobsTable(
  pool: Pool
) {
  await pool.query(
    `
      CREATE TABLE IF NOT EXISTS media_cleanup_jobs (
        id BIGSERIAL PRIMARY KEY,
        media_id BIGINT NOT NULL,
        original_name TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        status TEXT NOT NULL
          DEFAULT 'pending',
        requested_at TIMESTAMPTZ
          NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ,
        error_message TEXT,
        CONSTRAINT
          media_cleanup_jobs_status_check
        CHECK (
          status IN (
            'pending',
            'processing',
            'deleted',
            'blocked',
            'failed'
          )
        )
      )
    `
  );

  await pool.query(
    `
      CREATE INDEX IF NOT EXISTS
        media_cleanup_jobs_status_requested_idx
      ON media_cleanup_jobs (
        status,
        requested_at
      )
    `
  );
}

function runTsScript(
  scriptName: string,
  argument: number
) {
  const nodeCommand =
    process.execPath;

  const tsxCli =
    path.join(
      process.cwd(),
      "node_modules",
      "tsx",
      "dist",
      "cli.mjs"
    );

  const scriptPath =
    path.join(
      process.cwd(),
      "scripts",
      scriptName
    );

  execFileSync(
    nodeCommand,
    [
      tsxCli,
      scriptPath,
      String(argument),
    ],
    {
      cwd:
        process.cwd(),
      stdio:
        "inherit",
      env:
        process.env,
    }
  );
}

async function processCleanupJob(
  pool: Pool
) {
  const claim =
    await pool.query(
      `
        UPDATE media_cleanup_jobs
        SET
          status = 'processing',
          started_at = NOW(),
          error_message = NULL
        WHERE id = (
          SELECT id
          FROM media_cleanup_jobs
          WHERE status = 'pending'
          ORDER BY requested_at ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING
          id,
          media_id
      `
    );

  const job =
    claim.rows[0];

  if (!job) {
    return false;
  }

  const jobId =
    Number(job.id);

  const mediaId =
    Number(job.media_id);

  console.log("");
  console.log(
    `開始永久清理 Job ${jobId}`
  );
  console.log(
    `Media ID: ${mediaId}`
  );

  try {
    runTsScript(
      "cleanup-media-by-job.ts",
      jobId
    );

    await pool.query(
      `
        UPDATE media_cleanup_jobs
        SET
          status = 'deleted',
          finished_at = NOW(),
          error_message = NULL
        WHERE id = $1
      `,
      [jobId]
    );

    console.log(
      `Cleanup Job ${jobId} 已完成`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const blocked =
      message.includes(
        "MEDIA_CLEANUP_BLOCKED"
      );

    await pool.query(
      `
        UPDATE media_cleanup_jobs
        SET
          status = $2,
          finished_at = NOW(),
          error_message = $3
        WHERE id = $1
      `,
      [
        jobId,
        blocked
          ? "blocked"
          : "failed",
        message.slice(
          0,
          4000
        ),
      ]
    );

    throw error;
  }

  return true;
}

async function processPublishJob(
  pool: Pool
) {
  const claim =
    await pool.query(
      `
        UPDATE media_publish_jobs
        SET
          status = 'processing',
          started_at = NOW(),
          error_message = NULL
        WHERE id = (
          SELECT id
          FROM media_publish_jobs
          WHERE status = 'pending'
          ORDER BY requested_at ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING
          id,
          media_id
      `
    );

  const job =
    claim.rows[0];

  if (!job) {
    console.log(
      "沒有等待發布或清理的圖片。"
    );
    return;
  }

  const jobId =
    Number(job.id);

  const mediaId =
    Number(job.media_id);

  console.log("");
  console.log(
    `開始處理 Publish Job ${jobId}`
  );
  console.log(
    `Media ID: ${mediaId}`
  );

  try {
    runTsScript(
      "publish-media-by-id.ts",
      mediaId
    );

    await pool.query(
      `
        UPDATE media_publish_jobs
        SET
          status = 'published',
          finished_at = NOW(),
          error_message = NULL
        WHERE id = $1
      `,
      [jobId]
    );

    console.log(
      `Publish Job ${jobId} 已完成`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    await pool.query(
      `
        UPDATE media_publish_jobs
        SET
          status = 'failed',
          finished_at = NOW(),
          error_message = $2
        WHERE id = $1
      `,
      [
        jobId,
        message.slice(
          0,
          4000
        ),
      ]
    );

    throw error;
  }
}

async function main() {
  loadLocalEnv();

  const connectionString =
    process.env
      .DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL 尚未設定"
    );
  }

  const pool =
    new Pool({
      connectionString,
    });

  try {
    await ensureCleanupJobsTable(
      pool
    );

    const cleaned =
      await processCleanupJob(
        pool
      );

    if (cleaned) {
      return;
    }

    await processPublishJob(
      pool
    );
  } finally {
    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "MEDIA WORKER FAILED"
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );

    process.exit(1);
  }
);
