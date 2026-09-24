import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";
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
    const result =
      await pool.query(`
        SELECT
          id,
          original_name
        FROM media_assets
        WHERE is_active = TRUE
        ORDER BY id
      `);

    const rows =
      result.rows;

    console.log("");
    console.log(
      `Active Media Assets: ${rows.length}`
    );
    console.log("");

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

    let success = 0;
    let failed = 0;

    const failures: Array<{
      id: number;
      name: string;
      error: string;
    }> = [];

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      const row =
        rows[index];

      const id =
        Number(row.id);

      const name =
        String(
          row.original_name || ""
        );

      console.log("");
      console.log(
        `========== ${index + 1}/${rows.length} ==========`
      );
      console.log(
        `Media ID: ${id}`
      );
      console.log(
        `Name    : ${name}`
      );

      try {
        execFileSync(
          process.execPath,
          [
            tsxCli,
            publishScript,
            String(id),
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

        success += 1;
      } catch (error) {
        failed += 1;

        failures.push({
          id,
          name,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });

        console.error(
          `BACKFILL FAILED: ${id}`
        );
      }
    }

    console.log("");
    console.log(
      "=================================="
    );
    console.log(
      "R2 MEDIA BACKFILL COMPLETE"
    );
    console.log(
      "=================================="
    );
    console.log(
      `Total   : ${rows.length}`
    );
    console.log(
      `Success : ${success}`
    );
    console.log(
      `Failed  : ${failed}`
    );

    if (failures.length > 0) {
      console.log("");
      console.log(
        "Failures:"
      );

      for (
        const failure
        of failures
      ) {
        console.log(
          `${failure.id} | ${failure.name}`
        );
      }
    }

    if (failed > 0) {
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error(error);
    process.exit(1);
  }
);