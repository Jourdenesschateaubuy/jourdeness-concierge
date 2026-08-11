/**
 * Jourdeness storefront-core.ts image reference migration
 *
 * Default:
 *   npx tsx .\scripts\migrate-storefront-core-image-refs.ts
 *   -> DRY RUN only
 *
 * Apply:
 *   npx tsx .\scripts\migrate-storefront-core-image-refs.ts --apply
 *
 * Safety:
 * - Only edits lib/storefront-core.ts
 * - Creates lib/storefront-core.ts.before-media-ref-migration.bak before APPLY
 * - Only replaces uniquely matched active Media Asset references
 * - Missing or ambiguous references are preserved unchanged
 * - Does not modify database records, move files, or delete files
 */

import fs from "node:fs/promises";
import path from "node:path";

type MediaAssetRow = {
  id: number;
  original_name: string;
  storage_path: string;
  is_active: boolean;
};

type Resolution = {
  legacyUrl: string;
  fileName: string;
  status: "matched" | "missing" | "ambiguous";
  mediaUrl?: string;
  assetIds: number[];
};

function loadEnvLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!process.env[key]) {
    process.env[key] = value;
  }
}

async function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = await fs.readFile(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    loadEnvLine(line);
  }
}

function decodeLegacyFileName(legacyUrl: string) {
  const raw = legacyUrl.slice("/products/".length);

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function buildAssetIndex(assets: MediaAssetRow[]) {
  const byFileName = new Map<string, MediaAssetRow[]>();

  for (const asset of assets) {
    if (!asset.is_active) continue;

    const key = asset.original_name.toLowerCase();
    const current = byFileName.get(key) ?? [];
    current.push(asset);
    byFileName.set(key, current);
  }

  return byFileName;
}

function resolveLegacyUrl(
  legacyUrl: string,
  assetsByFileName: Map<string, MediaAssetRow[]>
): Resolution {
  const fileName = decodeLegacyFileName(legacyUrl);
  const matches =
    assetsByFileName.get(fileName.toLowerCase()) ?? [];

  if (matches.length === 1) {
    const assetId = Number(matches[0].id);

    return {
      legacyUrl,
      fileName,
      status: "matched",
      mediaUrl: `/api/studio/media/${assetId}/file`,
      assetIds: [assetId],
    };
  }

  if (matches.length === 0) {
    return {
      legacyUrl,
      fileName,
      status: "missing",
      assetIds: [],
    };
  }

  return {
    legacyUrl,
    fileName,
    status: "ambiguous",
    assetIds: matches.map((item) => Number(item.id)),
  };
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log("");
  console.log("====================================================");
  console.log(
    apply
      ? " Jourdeness storefront-core Image Refs - APPLY"
      : " Jourdeness storefront-core Image Refs - DRY RUN"
  );
  console.log(
    apply
      ? " 只替換可唯一對應的 /products/...；缺失/模糊引用保留"
      : " 不會修改任何檔案"
  );
  console.log("====================================================");
  console.log("");

  await loadEnvLocal();

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("找不到 DATABASE_URL，請確認 .env.local。");
  }

  const sourcePath = path.resolve(
    process.cwd(),
    "lib",
    "storefront-core.ts"
  );

  const backupPath =
    `${sourcePath}.before-media-ref-migration.bak`;

  const source = await fs.readFile(sourcePath, "utf8");

  // Match all literal /products/... references inside double quotes.
  const regex = /"\/products\/[^"]+"/g;
  const rawMatches = source.match(regex) ?? [];

  const uniqueLegacyUrls = Array.from(
    new Set(
      rawMatches.map((item) => item.slice(1, -1))
    )
  ).sort((a, b) =>
    a.localeCompare(b, "zh-Hant")
  );

  const { dbQuery } = await import("../lib/db");

  const mediaResult = await dbQuery<MediaAssetRow>(
    `
      SELECT
        id,
        original_name,
        storage_path,
        is_active
      FROM media_assets
      WHERE is_active = TRUE
      ORDER BY id ASC
    `
  );

  const assetsByFileName =
    buildAssetIndex(mediaResult.rows);

  const resolutions = uniqueLegacyUrls.map(
    (legacyUrl) =>
      resolveLegacyUrl(
        legacyUrl,
        assetsByFileName
      )
  );

  const matched = resolutions.filter(
    (item) => item.status === "matched"
  );

  const missing = resolutions.filter(
    (item) => item.status === "missing"
  );

  const ambiguous = resolutions.filter(
    (item) => item.status === "ambiguous"
  );

  let totalReplacementOccurrences = 0;

  for (const item of matched) {
    totalReplacementOccurrences += rawMatches.filter(
      (raw) => raw.slice(1, -1) === item.legacyUrl
    ).length;
  }

  console.log("--------------- SUMMARY ----------------");
  console.log(
    `storefront-core.ts /products/ 總引用次數： ${rawMatches.length}`
  );
  console.log(
    `唯一 /products/ 圖片數：                   ${uniqueLegacyUrls.length}`
  );
  console.log(
    `可安全配對 Media Asset：                  ${matched.length}`
  );
  console.log(
    `找不到 Media Asset：                      ${missing.length}`
  );
  console.log(
    `同名多筆需人工確認：                      ${ambiguous.length}`
  );
  console.log(
    `本次預計替換引用次數：                    ${totalReplacementOccurrences}`
  );
  console.log("----------------------------------------");
  console.log("");

  if (missing.length > 0) {
    console.log("⚠ 找不到 Media Asset，將保留原值：");

    for (const item of missing) {
      console.log(`  - ${item.legacyUrl}`);
    }

    console.log("");
  }

  if (ambiguous.length > 0) {
    console.log("⚠ 同名多筆，將保留原值：");

    for (const item of ambiguous) {
      console.log(
        `  - ${item.legacyUrl} -> Media IDs: ${item.assetIds.join(", ")}`
      );
    }

    console.log("");
  }

  console.log("✓ 前 20 筆可安全替換預覽：");

  for (const item of matched.slice(0, 20)) {
    console.log(`  ${item.legacyUrl}`);
    console.log(`    -> ${item.mediaUrl}`);
  }

  if (matched.length > 20) {
    console.log(
      `  ...其餘 ${matched.length - 20} 張省略`
    );
  }

  console.log("");

  if (!apply) {
    console.log("DRY RUN 完成：storefront-core.ts 沒有被修改。");
    console.log("");
    console.log("確認 Summary 後正式執行：");
    console.log(
      "npx tsx .\\scripts\\migrate-storefront-core-image-refs.ts --apply"
    );
    console.log("");
    return;
  }

  if (ambiguous.length > 0) {
    throw new Error(
      "仍有同名多筆 Media Asset。為安全起見停止 APPLY。"
    );
  }

  if (matched.length === 0) {
    console.log("沒有可安全替換的引用。");
    return;
  }

  await fs.copyFile(sourcePath, backupPath);

  let nextSource = source;

  for (const item of matched) {
    nextSource = nextSource.split(item.legacyUrl).join(
      item.mediaUrl!
    );
  }

  await fs.writeFile(sourcePath, nextSource, "utf8");

  const remainingMatches =
    nextSource.match(/"\/products\/[^"]+"/g) ?? [];

  const remainingUnique = Array.from(
    new Set(
      remainingMatches.map(
        (item) => item.slice(1, -1)
      )
    )
  );

  console.log("============== APPLY RESULT ==============");
  console.log(
    `已建立備份： ${backupPath}`
  );
  console.log(
    `成功替換唯一圖片： ${matched.length}`
  );
  console.log(
    `成功替換引用次數： ${totalReplacementOccurrences}`
  );
  console.log(
    `仍保留 /products/ 唯一圖片： ${remainingUnique.length}`
  );
  console.log(
    `仍保留 /products/ 引用次數： ${remainingMatches.length}`
  );
  console.log("==========================================");
  console.log("");

  if (remainingUnique.length > 0) {
    console.log("剩餘 legacy 圖片（預期是 missing）：");

    for (const legacyUrl of remainingUnique.sort()) {
      console.log(`  - ${legacyUrl}`);
    }

    console.log("");
  }

  console.log(
    "完成。請執行 npm run dev，測試首頁與 fallback 商品顯示。"
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "Migration 失敗：",
    error instanceof Error
      ? error.message
      : error
  );
  console.error("");
  process.exitCode = 1;
});