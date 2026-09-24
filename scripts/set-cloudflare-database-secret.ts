import fs from "node:fs";
import path from "node:path";
import {
  spawnSync,
} from "node:child_process";

const envPath =
  path.join(
    process.cwd(),
    ".env.local"
  );

const lines =
  fs.readFileSync(
    envPath,
    "utf8"
  ).split(/\r?\n/);

let databaseUrl = "";

for (const line of lines) {
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

  if (key !== "DATABASE_URL") {
    continue;
  }

  databaseUrl =
    trimmed.slice(index + 1).trim();

  if (
    (
      databaseUrl.startsWith('"') &&
      databaseUrl.endsWith('"')
    ) ||
    (
      databaseUrl.startsWith("'") &&
      databaseUrl.endsWith("'")
    )
  ) {
    databaseUrl =
      databaseUrl.slice(1, -1);
  }

  break;
}

if (!databaseUrl) {
  throw new Error(
    "在 .env.local 找不到 DATABASE_URL"
  );
}

const wrangler =
  path.join(
    process.cwd(),
    "node_modules",
    "wrangler",
    "bin",
    "wrangler.js"
  );

console.log(
  "DATABASE_URL 已找到，準備寫入 Cloudflare Secret。"
);

const result =
  spawnSync(
    process.execPath,
    [
      wrangler,
      "secret",
      "put",
      "DATABASE_URL",
    ],
    {
      cwd: process.cwd(),
      input: databaseUrl + "\n",
      stdio: [
        "pipe",
        "inherit",
        "inherit",
      ],
      env: process.env,
    }
  );

if (result.status !== 0) {
  process.exit(
    result.status ?? 1
  );
}

console.log(
  "DATABASE_URL Secret 設定完成。"
);