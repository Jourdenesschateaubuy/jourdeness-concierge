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

function runGit(
  args: string[]
) {
  execFileSync(
    "git",
    args,
    {
      cwd: process.cwd(),
      stdio: "inherit",
    }
  );
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
        String(asset.storage_path)
      );

    if (!fs.existsSync(sourcePath)) {
      throw new Error(
        `來源圖片不存在：${sourcePath}`
      );
    }

    const safeName =
      path.basename(
        String(asset.original_name)
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
    console.log("MEDIA SYNC OK");
    console.log("Media ID :", id);
    console.log("Name     :", safeName);
    console.log("Target   :", targetPath);
    console.log("");

    const gitPath =
      `public/products/${safeName}`;

    runGit([
      "add",
      "--",
      gitPath,
    ]);

    const status =
      execFileSync(
        "git",
        [
          "diff",
          "--cached",
          "--quiet",
          "--exit-code",
        ],
        {
          cwd: process.cwd(),
        }
      );

    void status;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 1
    ) {
      // staged changes exist
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }

  const publishId =
    Number(process.argv[2]);

  const pool2 =
    new Pool({
      connectionString:
        process.env.DATABASE_URL!,
    });

  try {
    const result =
      await pool2.query(
        `
        SELECT original_name
        FROM media_assets
        WHERE id = $1
        LIMIT 1
        `,
        [publishId]
      );

    const safeName =
      path.basename(
        String(
          result.rows[0]
            ?.original_name ?? publishId
        )
      );

    const staged =
      execFileSync(
        "git",
        [
          "diff",
          "--cached",
          "--name-only",
        ],
        {
          cwd: process.cwd(),
          encoding: "utf8",
        }
      ).trim();

    if (!staged) {
      console.log(
        "沒有新的檔案變更，不需要發布。"
      );
      return;
    }

    runGit([
      "commit",
      "-m",
      `publish: media ${publishId} ${safeName}`,
    ]);

    runGit([
      "push",
      "origin",
      "main",
    ]);

    console.log("");
    console.log(
      "PUBLISH OK"
    );
    console.log(
      "Vercel 將自動開始部署。"
    );
  } finally {
    await pool2.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "PUBLISH FAILED"
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );
    process.exit(1);
  }
);
