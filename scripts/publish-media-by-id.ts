import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const R2_BUCKET = "jourdeness-media";

function loadLocalEnv() {
  const envPath = path.join(
    process.cwd(),
    ".env.local"
  );

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/);

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

    const value =
      trimmed.slice(index + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function resolveSourcePath(
  storagePath: string
) {
  if (fs.existsSync(storagePath)) {
    return storagePath;
  }

  const uploadRoot =
    process.env.UPLOAD_ROOT?.trim();

  if (!uploadRoot) {
    return storagePath;
  }

  const legacyRoot =
    "D:\\JourdenessData\\";

  if (
    storagePath
      .toLowerCase()
      .startsWith(
        legacyRoot.toLowerCase()
      )
  ) {
    const relative =
      storagePath.slice(
        legacyRoot.length
      );

    return path.join(
      uploadRoot,
      relative
    );
  }

  return storagePath;
}

function uploadToR2({
  id,
  sourcePath,
  originalName,
  mimeType,
}: {
  id: number;
  sourcePath: string;
  originalName: string;
  mimeType: string;
}) {
  const wranglerCli =
    path.join(
      process.cwd(),
      "node_modules",
      "wrangler",
      "bin",
      "wrangler.js"
    );

  if (!fs.existsSync(wranglerCli)) {
    throw new Error(
      `找不到 Wrangler CLI：${wranglerCli}`
    );
  }

  const objectKey =
    `media/${id}`;

  const objectPath =
    `${R2_BUCKET}/${objectKey}`;

  const disposition =
    `inline; filename*=UTF-8''${encodeURIComponent(
      originalName
    )}`;

  console.log("");
  console.log("開始上傳 R2");
  console.log("Media ID :", id);
  console.log("Source   :", sourcePath);
  console.log("R2 Key   :", objectKey);
  console.log("");

  execFileSync(
    process.execPath,
    [
      wranglerCli,
      "r2",
      "object",
      "put",
      objectPath,
      "--file",
      sourcePath,
      "--content-type",
      mimeType,
      "--content-disposition",
      disposition,
      "--cache-control",
      "public, max-age=3600",
      "--remote",
    ],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    }
  );

  console.log("");
  console.log("R2 PUBLISH OK");
  console.log("Media ID :", id);
  console.log("R2 Key   :", objectKey);
}

async function main() {
  loadLocalEnv();

  const id =
    Number(process.argv[2]);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "請輸入有效的 Media ID，例如：119"
    );
  }

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
      await pool.query(
        `
          SELECT
            id,
            original_name,
            storage_path,
            mime_type
          FROM media_assets
          WHERE id = $1
            AND is_active = TRUE
          LIMIT 1
        `,
        [id]
      );

    const asset =
      result.rows[0];

    if (!asset) {
      throw new Error(
        `找不到有效的 Media ID ${id}`
      );
    }

    const sourcePath =
      resolveSourcePath(
        String(asset.storage_path)
      );

    if (!fs.existsSync(sourcePath)) {
      throw new Error(
        `NAS 來源圖片不存在：${sourcePath}`
      );
    }

    uploadToR2({
      id,
      sourcePath,
      originalName:
        String(asset.original_name),
      mimeType:
        String(
          asset.mime_type ||
          "application/octet-stream"
        ),
    });
  } finally {
    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "R2 PUBLISH FAILED"
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
    process.exit(1);
  }
);