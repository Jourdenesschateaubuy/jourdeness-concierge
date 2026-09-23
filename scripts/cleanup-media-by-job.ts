import fs from "node:fs";
import path from "node:path";

import {
  execFileSync,
} from "node:child_process";

import {
  Pool,
  neonConfig,
} from "@neondatabase/serverless";

import ws from "ws";

neonConfig.webSocketConstructor =
  ws;


const R2_BUCKET = "jourdeness-media";
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

function resolveSourcePath(
  storagePath: string
) {
  if (
    fs.existsSync(
      storagePath
    )
  ) {
    return storagePath;
  }

  const uploadRoot =
    process.env
      .UPLOAD_ROOT
      ?.trim();

  if (!uploadRoot) {
    return storagePath;
  }

  const legacyRoot =
    "D:\\JourdenessData\\";

  if (
    storagePath
      .toLowerCase()
      .startsWith(
        legacyRoot
          .toLowerCase()
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

function assertInsideUploadRoot(
  targetPath: string
) {
  const uploadRoot =
    process.env
      .UPLOAD_ROOT
      ?.trim();

  if (!uploadRoot) {
    throw new Error(
      "UPLOAD_ROOT 尚未設定"
    );
  }

  const root =
    path.resolve(
      uploadRoot
    );

  const target =
    path.resolve(
      targetPath
    );

  const relative =
    path.relative(
      root,
      target
    );

  if (
    !relative ||
    relative.startsWith(
      ".."
    ) ||
    path.isAbsolute(
      relative
    )
  ) {
    throw new Error(
      `拒絕刪除 UPLOAD_ROOT 外的檔案：${target}`
    );
  }
}

function runGit(
  args: string[]
) {
  execFileSync(
    "git",
    args,
    {
      cwd:
        process.cwd(),
      stdio:
        "inherit",
    }
  );
}

function isGitTracked(
  gitPath: string
) {
  try {
    execFileSync(
      "git",
      [
        "ls-files",
        "--error-unmatch",
        "--",
        gitPath,
      ],
      {
        cwd:
          process.cwd(),
        stdio:
          "ignore",
      }
    );

    return true;
  } catch {
    return false;
  }
}


function deleteFromR2(
  id: number
) {
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

  console.log("");
  console.log("開始刪除 R2");
  console.log("Media ID :", id);
  console.log("R2 Key   :", objectKey);
  console.log("");

  execFileSync(
    process.execPath,
    [
      wranglerCli,
      "r2",
      "object",
      "delete",
      objectPath,
      "--remote",
    ],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    }
  );

  console.log("");
  console.log("R2 DELETE OK");
  console.log("Media ID :", id);
  console.log("R2 Key   :", objectKey);
}
async function main() {
  loadLocalEnv();

  const jobId =
    Number(
      process.argv[2]
    );

  if (
    !Number.isInteger(jobId) ||
    jobId <= 0
  ) {
    throw new Error(
      "Cleanup Job ID 無效。"
    );
  }

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
    const jobResult =
      await pool.query(
        `
          SELECT
            id,
            media_id,
            original_name,
            storage_path
          FROM media_cleanup_jobs
          WHERE id = $1
          LIMIT 1
        `,
        [jobId]
      );

    const job =
      jobResult.rows[0];

    if (!job) {
      throw new Error(
        `找不到 Cleanup Job ${jobId}`
      );
    }

    const mediaId =
      Number(
        job.media_id
      );

    const mediaUrl =
      `/api/studio/media/${mediaId}/file`;

    const assetResult =
      await pool.query(
        `
          SELECT
            id,
            original_name,
            storage_path,
            is_active
          FROM media_assets
          WHERE id = $1
          LIMIT 1
        `,
        [mediaId]
      );

    const asset =
      assetResult.rows[0];

    if (!asset) {
      console.log(
        `Media ID ${mediaId} 已不存在。`
      );
      return;
    }

    if (
      asset.is_active ===
      true
    ) {
      throw new Error(
        "MEDIA_CLEANUP_BLOCKED: 圖片已被還原到 Media Library。"
      );
    }

    /*
     * Worker 在真正刪除前
     * 再做一次 Usage Guard。
     */
    const usageResult =
      await pool.query(
        `
          SELECT
            EXISTS (
              SELECT 1
              FROM products
              WHERE
                to_jsonb(products)::text
                LIKE '%' || $1 || '%'
            )
            OR EXISTS (
              SELECT 1
              FROM bundle_offers
              WHERE
                to_jsonb(bundle_offers)::text
                LIKE '%' || $1 || '%'
            )
            OR EXISTS (
              SELECT 1
              FROM site_studio_content
              WHERE
                value::text
                LIKE '%' || $1 || '%'
            )
            AS in_use
        `,
        [mediaUrl]
      );

    if (
      usageResult.rows[0]
        ?.in_use
    ) {
      throw new Error(
        "MEDIA_CLEANUP_BLOCKED: 圖片在清理前重新被網站引用。"
      );
    }

    const originalName =
      String(
        asset.original_name ||
        job.original_name
      );

    const safeName =
      path.basename(
        originalName
      );

    const storagePath =
      resolveSourcePath(
        String(
          asset.storage_path ||
          job.storage_path
        )
      );

    /*
     * 先清理 R2。
     * NAS 是 source of truth，因此保留到 R2 成功刪除之後。
     */
    deleteFromR2(mediaId);
    /*
     * NAS 實體檔只能刪
     * UPLOAD_ROOT 內的路徑。
     */
    if (
      fs.existsSync(
        storagePath
      )
    ) {
      assertInsideUploadRoot(
        storagePath
      );

      fs.unlinkSync(
        storagePath
      );

      console.log(
        "NAS FILE REMOVED:",
        storagePath
      );
    } else {
      console.log(
        "NAS FILE ALREADY MISSING:",
        storagePath
      );
    }

    /*
     * public/products 可能有：
     * 1. 另一個 Media Asset 共用同檔名
     * 2. 舊網站直接引用 /products/xxx
     *
     * 任何一種存在，就保留 public 檔。
     */
    const sameNameResult =
      await pool.query(
        `
          SELECT COUNT(*)::int
            AS count
          FROM media_assets
          WHERE id <> $1
            AND LOWER(
              original_name
            ) =
            LOWER($2)
        `,
        [
          mediaId,
          originalName,
        ]
      );

    const sameNameCount =
      Number(
        sameNameResult
          .rows[0]
          ?.count ?? 0
      );

    const publicUrl =
      `/products/${safeName}`;

    const encodedPublicUrl =
      `/products/${encodeURIComponent(
        safeName
      )}`;

    const publicReference =
      await pool.query(
        `
          SELECT
            EXISTS (
              SELECT 1
              FROM products
              WHERE
                to_jsonb(products)::text
                LIKE '%' || $1 || '%'
                OR
                to_jsonb(products)::text
                LIKE '%' || $2 || '%'
            )
            OR EXISTS (
              SELECT 1
              FROM bundle_offers
              WHERE
                to_jsonb(bundle_offers)::text
                LIKE '%' || $1 || '%'
                OR
                to_jsonb(bundle_offers)::text
                LIKE '%' || $2 || '%'
            )
            OR EXISTS (
              SELECT 1
              FROM site_studio_content
              WHERE
                value::text
                LIKE '%' || $1 || '%'
                OR
                value::text
                LIKE '%' || $2 || '%'
            )
            AS in_use
        `,
        [
          publicUrl,
          encodedPublicUrl,
        ]
      );

    const keepPublic =
      sameNameCount > 0 ||
      Boolean(
        publicReference
          .rows[0]
          ?.in_use
      );

    const gitPath =
      `public/products/${safeName}`;

    const publicPath =
      path.join(
        process.cwd(),
        "public",
        "products",
        safeName
      );

    if (keepPublic) {
      console.log(
        "PUBLIC FILE PRESERVED:",
        gitPath
      );
    } else {
      const tracked =
        isGitTracked(
          gitPath
        );

      if (tracked) {
        runGit([
          "rm",
          "--ignore-unmatch",
          "--",
          gitPath,
        ]);

        try {
          execFileSync(
            "git",
            [
              "commit",
              "-m",
              `cleanup: media ${mediaId} ${safeName}`,
              "--",
              gitPath,
            ],
            {
              cwd:
                process.cwd(),
              stdio:
                "inherit",
            }
          );
        } catch {
          // 沒有新的 staged change
        }

        /*
         * 即使前一次已 commit
         * 但 push 曾失敗，重試時
         * 仍會再次 push。
         */
        const currentBranch =
          execFileSync(
            "git",
            [
              "branch",
              "--show-current",
            ],
            {
              cwd: process.cwd(),
              encoding: "utf8",
            }
          ).trim();

        if (!currentBranch) {
          throw new Error(
            "無法取得目前 Git branch。"
          );
        }

        console.log(
          "GIT PUSH BRANCH:",
          currentBranch
        );

        runGit([
          "push",
          "origin",
          currentBranch,
        ]);
      } else if (
        fs.existsSync(
          publicPath
        )
      ) {
        fs.unlinkSync(
          publicPath
        );

        console.log(
          "UNTRACKED PUBLIC FILE REMOVED:",
          publicPath
        );
      }
    }

    /*
     * media_publish_jobs 有 FK，
     * 沒有 ON DELETE CASCADE，
     * 因此必須先刪發布歷程。
     */
    await pool.query(
      "BEGIN"
    );

    try {
      await pool.query(
        `
          DELETE FROM media_publish_jobs
          WHERE media_id = $1
        `,
        [mediaId]
      );

      await pool.query(
        `
          DELETE FROM media_assets
          WHERE id = $1
        `,
        [mediaId]
      );

      await pool.query(
        "COMMIT"
      );
    } catch (error) {
      await pool.query(
        "ROLLBACK"
      );

      throw error;
    }

    console.log("");
    console.log(
      "MEDIA CLEANUP OK"
    );
    console.log(
      "Media ID:",
      mediaId
    );
  } finally {
    await pool.end();
  }
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "MEDIA CLEANUP FAILED"
    );
    console.error(
      error instanceof Error
        ? error.message
        : String(error)
    );

    process.exit(1);
  }
);
