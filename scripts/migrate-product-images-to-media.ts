/**
 * Jourdeness Legacy Product Images -> Media Library
 * DRY RUN ONLY
 *
 * This version DOES NOT INSERT / UPDATE / DELETE anything.
 */

import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

type MediaAssetRow = {
  id: number;
  original_name: string;
  storage_path: string;
  mime_type: string;
  byte_size: number | string;
  is_active: boolean;
};

type LocalImage = {
  fullPath: string;
  fileName: string;
  byteSize: number;
};

type ProductImageRow = {
  id: number;
  display_code: string;
  name: string;
  image: string;
  gallery: string[] | null;
};

type ResolvedLegacyRef = {
  legacyUrl: string;
  fileName: string;
  assetId?: number;
  mediaUrl?: string;
  status: "matched" | "missing" | "ambiguous";
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

function normalizeWindowsPath(value: string) {
  return path
    .resolve(value)
    .replace(/\//g, "\\")
    .toLowerCase();
}

async function collectImages(
  directory: string
): Promise<LocalImage[]> {
  const output: LocalImage[] = [];

  async function walk(currentDirectory: string) {
    const entries = await fs.readdir(currentDirectory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(
        currentDirectory,
        entry.name
      );

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path
        .extname(entry.name)
        .toLowerCase();

      if (!IMAGE_EXTENSIONS.has(extension)) {
        continue;
      }

      const stat = await fs.stat(fullPath);

      output.push({
        fullPath,
        fileName: entry.name,
        byteSize: stat.size,
      });
    }
  }

  await walk(directory);

  return output.sort((a, b) =>
    a.fileName.localeCompare(
      b.fileName,
      "zh-Hant"
    )
  );
}

async function fileExists(filePath: string) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function isLegacyProductUrl(value: string) {
  return value.startsWith("/products/");
}

function decodeLegacyFileName(legacyUrl: string) {
  const raw = legacyUrl.slice("/products/".length);

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function resolveLegacyRef(
  legacyUrl: string,
  assetsByFileName: Map<string, MediaAssetRow[]>
): ResolvedLegacyRef {
  const fileName = decodeLegacyFileName(legacyUrl);
  const matches =
    assetsByFileName.get(fileName.toLowerCase()) ?? [];

  const activeMatches = matches.filter(
    (asset) => asset.is_active
  );

  if (activeMatches.length === 1) {
    const assetId = Number(activeMatches[0].id);

    return {
      legacyUrl,
      fileName,
      assetId,
      mediaUrl: `/api/studio/media/${assetId}/file`,
      status: "matched",
    };
  }

  if (activeMatches.length === 0) {
    return {
      legacyUrl,
      fileName,
      status: "missing",
    };
  }

  return {
    legacyUrl,
    fileName,
    status: "ambiguous",
  };
}

async function main() {
  console.log("");
  console.log("==============================================");
  const apply = process.argv.includes("--apply");

  console.log(
    apply
      ? " Jourdeness Media Migration - APPLY"
      : " Jourdeness Media Migration - DRY RUN"
  );
  console.log(
    apply
      ? " 會新增缺少的 Media Asset；不搬檔、不刪檔、不改既有 Asset"
      : " 不會新增、修改或刪除任何資料"
  );
  console.log("==============================================");
  console.log("");

  await loadEnvLocal();

  const uploadRoot =
    process.env.UPLOAD_ROOT?.trim();

  const databaseUrl =
    process.env.DATABASE_URL?.trim();

  if (!uploadRoot) {
    throw new Error(
      "找不到 UPLOAD_ROOT，請確認 .env.local。"
    );
  }

  if (!databaseUrl) {
    throw new Error(
      "找不到 DATABASE_URL，請確認 .env.local。"
    );
  }

  const productsDirectory =
    path.join(uploadRoot, "products");

  console.log(`UPLOAD_ROOT：${uploadRoot}`);
  console.log(`掃描資料夾：${productsDirectory}`);
  console.log("");

  const localImages =
    await collectImages(productsDirectory);

  // Load DATABASE_URL before importing the DB module.
  const { dbQuery } =
    await import("../lib/db");

  const { createMediaAsset } =
    await import(
      "../lib/cms/modules/media/repository"
    );

  const result =
    await dbQuery<MediaAssetRow>(
      `
        SELECT
          id,
          original_name,
          storage_path,
          mime_type,
          byte_size,
          is_active
        FROM media_assets
        ORDER BY id ASC
      `
    );

  const databaseAssets = result.rows;

  const activeAssets =
    databaseAssets.filter(
      (asset) => asset.is_active
    );

  const assetsByStoragePath =
    new Map<string, MediaAssetRow>();

  const assetsByFileName =
    new Map<string, MediaAssetRow[]>();

  for (const asset of databaseAssets) {
    assetsByStoragePath.set(
      normalizeWindowsPath(asset.storage_path),
      asset
    );

    const key =
      asset.original_name.toLowerCase();

    const sameName =
      assetsByFileName.get(key) ?? [];

    sameName.push(asset);

    assetsByFileName.set(key, sameName);
  }

  const alreadyRegistered: LocalImage[] = [];
  const pendingImport: LocalImage[] = [];

  const sameNameDifferentPath: Array<{
    image: LocalImage;
    assets: MediaAssetRow[];
  }> = [];

  for (const image of localImages) {
    const storageKey =
      normalizeWindowsPath(image.fullPath);

    if (
      assetsByStoragePath.has(storageKey)
    ) {
      alreadyRegistered.push(image);
      continue;
    }

    const sameName =
      assetsByFileName.get(
        image.fileName.toLowerCase()
      ) ?? [];

    if (sameName.length > 0) {
      sameNameDifferentPath.push({
        image,
        assets: sameName,
      });
      continue;
    }

    pendingImport.push(image);
  }

  const missingDatabaseFiles: MediaAssetRow[] = [];

  for (const asset of activeAssets) {
    if (!(await fileExists(asset.storage_path))) {
      missingDatabaseFiles.push(asset);
    }
  }

  console.log("--------------- SUMMARY ----------------");
  console.log(
    `products 圖片總數：        ${localImages.length}`
  );
  console.log(
    `Media Asset 總紀錄：       ${databaseAssets.length}`
  );
  console.log(
    `啟用中的 Media Asset：     ${activeAssets.length}`
  );
  console.log(
    `storage_path 已登記：      ${alreadyRegistered.length}`
  );
  console.log(
    `同檔名但路徑不同：         ${sameNameDifferentPath.length}`
  );
  console.log(
    `待加入 Media Library：     ${pendingImport.length}`
  );
  console.log(
    `DB 有紀錄但實體檔不存在： ${missingDatabaseFiles.length}`
  );
  console.log("----------------------------------------");
  console.log("");

  const productResult =
    await dbQuery<ProductImageRow>(
      `
        SELECT
          id,
          display_code,
          name,
          image,
          gallery
        FROM products
        WHERE
          image LIKE '/products/%'
          OR gallery::text LIKE '%/products/%'
        ORDER BY id ASC
      `
    );

  const productRows = productResult.rows;

  let legacyImageRefs = 0;
  let legacyGalleryRefs = 0;
  let matchedRefs = 0;
  let missingRefs = 0;
  let ambiguousRefs = 0;

  const productPlans: Array<{
    id: number;
    displayCode: string;
    name: string;
    image?: ResolvedLegacyRef;
    gallery: ResolvedLegacyRef[];
  }> = [];

  for (const product of productRows) {
    const imageRef =
      isLegacyProductUrl(product.image)
        ? resolveLegacyRef(
            product.image,
            assetsByFileName
          )
        : undefined;

    if (imageRef) {
      legacyImageRefs++;
      if (imageRef.status === "matched") matchedRefs++;
      if (imageRef.status === "missing") missingRefs++;
      if (imageRef.status === "ambiguous") ambiguousRefs++;
    }

    const galleryRefs = (
      Array.isArray(product.gallery)
        ? product.gallery
        : []
    )
      .filter((item) =>
        isLegacyProductUrl(item)
      )
      .map((item) =>
        resolveLegacyRef(
          item,
          assetsByFileName
        )
      );

    legacyGalleryRefs += galleryRefs.length;

    for (const ref of galleryRefs) {
      if (ref.status === "matched") matchedRefs++;
      if (ref.status === "missing") missingRefs++;
      if (ref.status === "ambiguous") ambiguousRefs++;
    }

    productPlans.push({
      id: product.id,
      displayCode: product.display_code,
      name: product.name,
      image: imageRef,
      gallery: galleryRefs,
    });
  }

  console.log("======= PRODUCT REFERENCE DRY RUN =======");
  console.log(
    `仍使用舊 /products/ 的商品數： ${productRows.length}`
  );
  console.log(
    `舊 image 引用數：               ${legacyImageRefs}`
  );
  console.log(
    `舊 gallery 引用數：             ${legacyGalleryRefs}`
  );
  console.log(
    `可安全配對 Media Asset：        ${matchedRefs}`
  );
  console.log(
    `找不到 Media Asset：            ${missingRefs}`
  );
  console.log(
    `同名多筆、需人工確認：          ${ambiguousRefs}`
  );
  console.log("=========================================");
  console.log("");

  const problemPlans = productPlans
    .map((plan) => ({
      ...plan,
      issues: [
        ...(plan.image &&
        plan.image.status !== "matched"
          ? [plan.image]
          : []),
        ...plan.gallery.filter(
          (ref) => ref.status !== "matched"
        ),
      ],
    }))
    .filter((plan) => plan.issues.length > 0);

  if (problemPlans.length > 0) {
    console.log(
      "⚠ 無法自動安全轉換的商品（最多顯示 30 筆）："
    );

    for (const plan of problemPlans.slice(0, 30)) {
      console.log(
        `  - #${plan.id} ${plan.displayCode} ${plan.name}`
      );

      for (const ref of plan.issues) {
        console.log(
          `      ${ref.status.toUpperCase()}: ${ref.legacyUrl}`
        );
      }
    }

    if (problemPlans.length > 30) {
      console.log(
        `  ...其餘 ${problemPlans.length - 30} 筆省略`
      );
    }

    console.log("");
  }

  const previewPlans = productPlans
    .filter(
      (plan) =>
        plan.image ||
        plan.gallery.length > 0
    )
    .slice(0, 20);

  if (previewPlans.length > 0) {
    console.log(
      "✓ 前 20 個商品的轉換預覽："
    );

    for (const plan of previewPlans) {
      console.log(
        `  - #${plan.id} ${plan.displayCode} ${plan.name}`
      );

      if (plan.image) {
        console.log(
          `      image: ${plan.image.legacyUrl}`
        );
        console.log(
          `          -> ${
            plan.image.mediaUrl ??
            `[${plan.image.status}]`
          }`
        );
      }

      for (const ref of plan.gallery) {
        console.log(
          `      gallery: ${ref.legacyUrl}`
        );
        console.log(
          `            -> ${
            ref.mediaUrl ??
            `[${ref.status}]`
          }`
        );
      }
    }

    console.log("");
  }

  if (sameNameDifferentPath.length > 0) {
    console.log(
      "⚠ 同檔名但 storage_path 不同（先不要自動匯入）："
    );

    for (
      const item of sameNameDifferentPath.slice(0, 20)
    ) {
      console.log(`  - ${item.image.fileName}`);

      for (const asset of item.assets) {
        console.log(
          `      DB #${asset.id}: ${asset.storage_path}`
        );
      }

      console.log(
        `      FILE: ${item.image.fullPath}`
      );
    }

    if (sameNameDifferentPath.length > 20) {
      console.log(
        `  ...其餘 ${
          sameNameDifferentPath.length - 20
        } 筆省略`
      );
    }

    console.log("");
  }

  if (pendingImport.length > 0) {
    console.log(
      "✓ 待加入 Media Library 的前 20 張："
    );

    for (
      const image of pendingImport.slice(0, 20)
    ) {
      console.log(
        `  - ${image.fileName} (${image.byteSize} bytes)`
      );
    }

    if (pendingImport.length > 20) {
      console.log(
        `  ...其餘 ${
          pendingImport.length - 20
        } 張省略`
      );
    }

    console.log("");
  }

  if (missingDatabaseFiles.length > 0) {
    console.log(
      "⚠ DB 有紀錄但找不到實體檔："
    );

    for (
      const asset of missingDatabaseFiles.slice(0, 20)
    ) {
      console.log(
        `  - #${asset.id} ${asset.original_name}`
      );
      console.log(
        `    ${asset.storage_path}`
      );
    }

    if (missingDatabaseFiles.length > 20) {
      console.log(
        `  ...其餘 ${
          missingDatabaseFiles.length - 20
        } 筆省略`
      );
    }

    console.log("");
  }

  if (!apply) {
    console.log(
      "DRY RUN 完成：Media Library 與商品資料庫都沒有被修改。"
    );
    console.log("");
    console.log(
      "這一版目前只檢查 Product image / gallery 是否能安全對應 Media Library。"
    );
    console.log(
      "請先確認 PRODUCT REFERENCE DRY RUN 的 matched / missing / ambiguous 數字。"
    );
    console.log("");
    return;
  }

  throw new Error(
    "這一版是 Product Reference Migration 的 Dry Run 版本，請不要使用 --apply。"
  );

  if (missingDatabaseFiles.length > 0) {
    throw new Error(
      "偵測到 DB 紀錄但實體檔不存在，為安全起見停止 APPLY。"
    );
  }

  console.log(
    `準備新增 ${pendingImport.length} 筆 Media Asset...`
  );
  console.log("");

  let created = 0;
  let failed = 0;

  for (
    let index = 0;
    index < pendingImport.length;
    index++
  ) {
    const image = pendingImport[index];

    try {
      const ext = path.extname(
        image.fileName
      ).toLowerCase();

      const mimeType =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
            ? "image/webp"
            : ext === ".gif"
              ? "image/gif"
              : "image/jpeg";

      const asset =
        await createMediaAsset({
          originalName: image.fileName,
          storagePath: image.fullPath,
          mimeType,
          byteSize: image.byteSize,
          title: image.fileName,
          altText: "",
          tags: [
            "legacy-product",
            "product",
          ],
        });

      created++;

      console.log(
        `[${String(index + 1).padStart(
          3,
          "0"
        )}/${pendingImport.length}] ✓ #${asset.id} ${image.fileName}`
      );
    } catch (error) {
      failed++;

      console.error(
        `[${String(index + 1).padStart(
          3,
          "0"
        )}/${pendingImport.length}] ✗ ${image.fileName}`
      );
      console.error(String(error));
    }
  }

  console.log("");
  console.log("============= APPLY RESULT =============");
  console.log(`預計新增： ${pendingImport.length}`);
  console.log(`成功新增： ${created}`);
  console.log(`失敗：     ${failed}`);
  console.log(
    `同檔名跳過：${sameNameDifferentPath.length}`
  );
  console.log("========================================");
  console.log("");

  if (failed > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    "APPLY 完成。請回到 Media Library 重新整理確認。"
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "DRY RUN 失敗：",
    error instanceof Error
      ? error.message
      : error
  );
  console.error("");
  process.exitCode = 1;
});

