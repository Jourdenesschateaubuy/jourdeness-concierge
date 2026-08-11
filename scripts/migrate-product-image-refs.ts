/**
 * Jourdeness Product Image Reference Migration
 *
 * Dry run:
 *   npx tsx .\scripts\migrate-product-image-refs.ts
 *
 * Apply:
 *   npx tsx .\scripts\migrate-product-image-refs.ts --apply
 *
 * Safety:
 * - Does not move or delete image files.
 * - Does not modify Media Assets.
 * - Only updates products.image and products.gallery.
 * - Only uniquely matched /products/... references are converted.
 * - Missing references are preserved unchanged.
 * - Apply runs inside one transaction.
 */

import fs from "node:fs/promises";
import path from "node:path";

type MediaAssetRow = {
  id: number;
  original_name: string;
  is_active: boolean;
};

type ProductRow = {
  id: number;
  display_code: string;
  name: string;
  image: string;
  gallery: string[] | null;
};

type Resolution = {
  legacyUrl: string;
  status: "matched" | "missing" | "ambiguous";
  mediaUrl?: string;
};

function loadEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;

  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) return;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!process.env[key]) process.env[key] = value;
}

async function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const content = await fs.readFile(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    loadEnvLine(line);
  }
}

function isLegacyUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/products/");
}

function fileNameFromLegacyUrl(url: string) {
  const raw = url.slice("/products/".length);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function resolveRef(
  legacyUrl: string,
  byName: Map<string, MediaAssetRow[]>
): Resolution {
  const fileName = fileNameFromLegacyUrl(legacyUrl);
  const matches = byName.get(fileName.toLowerCase()) ?? [];

  if (matches.length === 1) {
    const id = Number(matches[0].id);
    return {
      legacyUrl,
      status: "matched",
      mediaUrl: `/api/studio/media/${id}/file`,
    };
  }

  if (matches.length === 0) {
    return {
      legacyUrl,
      status: "missing",
    };
  }

  return {
    legacyUrl,
    status: "ambiguous",
  };
}

async function main() {
  const apply = process.argv.includes("--apply");

  await loadEnvLocal();

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("找不到 DATABASE_URL，請確認 .env.local。");
  }

  const { dbQuery, withDbClient } = await import("../lib/db");

  const mediaResult = await dbQuery<MediaAssetRow>(
    `
      SELECT id, original_name, is_active
      FROM media_assets
      WHERE is_active = TRUE
      ORDER BY id
    `
  );

  const productResult = await dbQuery<ProductRow>(
    `
      SELECT id, display_code, name, image, gallery
      FROM products
      WHERE
        image LIKE '/products/%'
        OR gallery::text LIKE '%/products/%'
      ORDER BY id
    `
  );

  const byName = new Map<string, MediaAssetRow[]>();

  for (const asset of mediaResult.rows) {
    const key = asset.original_name.toLowerCase();
    const current = byName.get(key) ?? [];
    current.push(asset);
    byName.set(key, current);
  }

  let imageRefs = 0;
  let galleryRefs = 0;
  let matched = 0;
  let missing = 0;
  let ambiguous = 0;

  const plans = productResult.rows.map((product) => {
    let nextImage = product.image;

    const imageResolution = isLegacyUrl(product.image)
      ? resolveRef(product.image, byName)
      : null;

    if (imageResolution) {
      imageRefs++;

      if (imageResolution.status === "matched" && imageResolution.mediaUrl) {
        matched++;
        nextImage = imageResolution.mediaUrl;
      } else if (imageResolution.status === "missing") {
        missing++;
      } else {
        ambiguous++;
      }
    }

    const currentGallery = Array.isArray(product.gallery)
      ? product.gallery
      : [];

    const issues: Resolution[] = [];

    const nextGallery = currentGallery.map((item) => {
      if (!isLegacyUrl(item)) return item;

      galleryRefs++;

      const resolution = resolveRef(item, byName);

      if (resolution.status === "matched" && resolution.mediaUrl) {
        matched++;
        return resolution.mediaUrl;
      }

      if (resolution.status === "missing") {
        missing++;
      } else {
        ambiguous++;
      }

      issues.push(resolution);
      return item;
    });

    if (
      imageResolution &&
      imageResolution.status !== "matched"
    ) {
      issues.push(imageResolution);
    }

    const changed =
      nextImage !== product.image ||
      JSON.stringify(nextGallery) !== JSON.stringify(currentGallery);

    return {
      product,
      nextImage,
      nextGallery,
      issues,
      changed,
    };
  });

  const changedPlans = plans.filter((plan) => plan.changed);
  const issuePlans = plans.filter((plan) => plan.issues.length > 0);

  console.log("");
  console.log("======= PRODUCT IMAGE REF MIGRATION =======");
  console.log(`模式：                         ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`仍含 /products/ 的商品數：    ${productResult.rows.length}`);
  console.log(`舊 image 引用數：             ${imageRefs}`);
  console.log(`舊 gallery 引用數：           ${galleryRefs}`);
  console.log(`可安全轉換引用：              ${matched}`);
  console.log(`找不到 Media Asset：          ${missing}`);
  console.log(`同名多筆需人工確認：          ${ambiguous}`);
  console.log(`可更新商品數：                ${changedPlans.length}`);
  console.log("===========================================");
  console.log("");

  if (issuePlans.length > 0) {
    console.log("保留原值的問題引用：");

    for (const plan of issuePlans) {
      console.log(
        `- #${plan.product.id} ${plan.product.display_code} ${plan.product.name}`
      );

      for (const issue of plan.issues) {
        console.log(
          `  ${issue.status.toUpperCase()}: ${issue.legacyUrl}`
        );
      }
    }

    console.log("");
  }

  if (!apply) {
    console.log("DRY RUN 完成：資料庫沒有被修改。");
    console.log("");
    console.log("正式執行：");
    console.log(
      "npx tsx .\\scripts\\migrate-product-image-refs.ts --apply"
    );
    console.log("");
    return;
  }

  if (ambiguous > 0) {
    throw new Error(
      "仍有同名多筆 Media Asset，為安全起見停止 APPLY。"
    );
  }

  await withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      for (let index = 0; index < changedPlans.length; index++) {
        const plan = changedPlans[index];

        await client.query(
          `
            UPDATE products
            SET
              image = $2,
              gallery = $3::jsonb,
              updated_at = NOW()
            WHERE id = $1
          `,
          [
            plan.product.id,
            plan.nextImage,
            JSON.stringify(plan.nextGallery),
          ]
        );

        console.log(
          `[${String(index + 1).padStart(3, "0")}/${changedPlans.length}] ✓ ${plan.product.display_code} ${plan.product.name}`
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });

  const remaining = await dbQuery<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM products
      WHERE
        image LIKE '/products/%'
        OR gallery::text LIKE '%/products/%'
    `
  );

  console.log("");
  console.log("============= APPLY RESULT =============");
  console.log(`成功更新商品：               ${changedPlans.length}`);
  console.log(`成功轉換引用：               ${matched}`);
  console.log(`缺少引用保留：               ${missing}`);
  console.log(`模糊引用保留：               ${ambiguous}`);
  console.log(
    `仍含 /products/ 的商品數：  ${remaining.rows[0]?.count ?? "?"}`
  );
  console.log("========================================");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "Migration 失敗：",
    error instanceof Error ? error.message : error
  );
  console.error("");
  process.exitCode = 1;
});
