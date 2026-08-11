import fs from "node:fs";
import path from "node:path";
import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

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

    const index = trimmed.indexOf("=");

    if (index <= 0) {
      continue;
    }

    const key = trimmed
      .slice(0, index)
      .trim();

    const value = trimmed
      .slice(index + 1)
      .trim();

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

async function main() {
  loadLocalEnv();

  const id = Number(
    process.argv[2]
  );

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "請輸入有效的 Media ID，例如：146"
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
          storage_path
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
        `找不到 Media ID ${id}`
      );
    }

    const sourcePath =
      resolveSourcePath(
        String(
          asset.storage_path
        )
      );

    if (
      !fs.existsSync(
        sourcePath
      )
    ) {
      throw new Error(
        `來源圖片不存在：${sourcePath}`
      );
    }

    const safeName =
      path.basename(
        String(
          asset.original_name
        )
      );

    const targetDir =
      path.join(
        process.cwd(),
        "public",
        "products"
      );

    fs.mkdirSync(
      targetDir,
      {
        recursive: true,
      }
    );

    const targetPath =
      path.join(
        targetDir,
        safeName
      );

    fs.copyFileSync(
      sourcePath,
      targetPath
    );

    console.log("");
    console.log(
      "SYNC OK"
    );
    console.log(
      "Media ID :",
      id
    );
    console.log(
      "Name     :",
      safeName
    );
    console.log(
      "Source   :",
      sourcePath
    );
    console.log(
      "Target   :",
      targetPath
    );
    console.log("");
    console.log(
      `git add "public/products/${safeName}"`
    );
    console.log(
      `git commit -m "publish: add ${safeName}"`
    );
    console.log(
      "git push origin main"
    );
  } finally {
    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "SYNC FAILED"
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );

    process.exit(1);
  }
);
