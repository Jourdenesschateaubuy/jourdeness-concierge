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

neonConfig.webSocketConstructor = ws;

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
    const line of fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
  ) {
    const trimmed = line.trim();

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
      trimmed.slice(0, index).trim();

    const value =
      trimmed.slice(index + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();

  const connectionString =
    process.env.DATABASE_URL;

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
        "沒有等待發布的圖片。"
      );
      return;
    }

    const jobId =
      Number(job.id);

    const mediaId =
      Number(job.media_id);

    console.log("");
    console.log(
      `開始處理 Job ${jobId}`
    );
    console.log(
      `Media ID: ${mediaId}`
    );

    try {
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

      const publishScript =
        path.join(
          process.cwd(),
          "scripts",
          "publish-media-by-id.ts"
        );

      execFileSync(
        nodeCommand,
        [
          tsxCli,
          publishScript,
          String(mediaId),
        ],
        {
          cwd: process.cwd(),
          stdio: "inherit",
          env: process.env,
        }
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

      console.log("");
      console.log(
        "PUBLISH JOB OK"
      );
      console.log(
        `Job ${jobId} 已完成`
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
          message.slice(0, 4000),
        ]
      );

      throw error;
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("");
  console.error(
    "PUBLISHER FAILED"
  );
  console.error(
    error instanceof Error
      ? error.message
      : String(error)
  );

  process.exit(1);
});
