/**
 * Jourdeness Cleanup - Missing Legacy Product Image References
 *
 * Default:
 *   npx tsx .\scripts\cleanup-missing-legacy-image-refs.ts
 *   -> DRY RUN only
 *
 * Apply:
 *   npx tsx .\scripts\cleanup-missing-legacy-image-refs.ts --apply
 *
 * Scope is intentionally limited to:
 *   P-0022 /products/patch 1.png
 *   P-0023 /products/patch 5.png
 *   P-0054 /products/lip tint.jpg
 *   P-0055 /products/lip balm.jpg
 *
 * Safety:
 * - Does not delete or move files.
 * - Does not touch Media Library.
 * - Only updates the four named products.
 * - Removes only the confirmed-missing legacy refs listed above.
 * - Runs APPLY inside one DB transaction.
 */

import fs from "node:fs/promises";
import path from "node:path";

type ProductRow = {
  id: number;
  display_code: string;
  name: string;
  image: string;
  gallery: string[] | null;
};

type CleanupTarget = {
  displayCode: string;
  missingRef: string;
};

const TARGETS: CleanupTarget[] = [
  {
    displayCode: "P-0022",
    missingRef: "/products/patch 1.png",
  },
  {
    displayCode: "P-0023",
    missingRef: "/products/patch 5.png",
  },
  {
    displayCode: "P-0054",
    missingRef: "/products/lip tint.jpg",
  },
  {
    displayCode: "P-0055",
    missingRef: "/products/lip balm.jpg",
  },
];

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

async function main() {
  const apply = process.argv.includes("--apply");

  console.log("");
  console.log("==============================================");
  console.log(
    apply
      ? " Jourdeness Missing Legacy Ref Cleanup - APPLY"
      : " Jourdeness Missing Legacy Ref Cleanup - DRY RUN"
  );
  console.log(
    apply
      ? " 只清除四個已確認不存在的 legacy 圖片引用"
      : " 不會修改資料庫"
  );
  console.log("==============================================");
  console.log("");

  await loadEnvLocal();

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("找不到 DATABASE_URL，請確認 .env.local。");
  }

  const { dbQuery, withDbClient } = await import("../lib/db");

  const result = await dbQuery<ProductRow>(
    `
      SELECT
        id,
        display_code,
        name,
        image,
        gallery
      FROM products
      WHERE display_code = ANY($1::text[])
      ORDER BY id ASC
    `,
    [TARGETS.map((target) => target.displayCode)]
  );

  const rowsByCode = new Map(
    result.rows.map((row) => [row.display_code, row])
  );

  const plans = TARGETS.map((target) => {
    const product = rowsByCode.get(target.displayCode);

    if (!product) {
      return {
        target,
        product: null,
        nextImage: null,
        nextGallery: null,
        imageWillChange: false,
        galleryWillChange: false,
        changed: false,
        warning: "找不到商品",
      };
    }

    const currentGallery = Array.isArray(product.gallery)
      ? product.gallery
      : [];

    const imageWillChange =
      product.image === target.missingRef;

    // If the missing legacy ref is the current image, clear it.
    // This preserves the current "no image" state instead of inventing a replacement.
    const nextImage = imageWillChange
      ? ""
      : product.image;

    const nextGallery = currentGallery.filter(
      (item) => item !== target.missingRef
    );

    const galleryWillChange =
      JSON.stringify(nextGallery) !== JSON.stringify(currentGallery);

    return {
      target,
      product,
      nextImage,
      nextGallery,
      imageWillChange,
      galleryWillChange,
      changed: imageWillChange || galleryWillChange,
      warning: null,
    };
  });

  console.log("--------------- CLEANUP PLAN ----------------");

  for (const plan of plans) {
    console.log("");
    console.log(
      `${plan.target.displayCode}  ${plan.product?.name ?? "(找不到商品)"}`
    );
    console.log(`  缺失引用：${plan.target.missingRef}`);

    if (!plan.product) {
      console.log("  狀態：⚠ 找不到商品，略過");
      continue;
    }

    console.log(
      `  image：${plan.imageWillChange ? "會清空缺失引用" : "不變"}`
    );
    console.log(
      `  gallery：${plan.galleryWillChange ? "會移除缺失引用" : "不變"}`
    );
  }

  const changedPlans = plans.filter(
    (plan) => plan.product && plan.changed
  );

  const missingProducts = plans.filter(
    (plan) => !plan.product
  );

  console.log("");
  console.log("---------------------------------------------");
  console.log(`預計更新商品數： ${changedPlans.length}`);
  console.log(`找不到商品數：   ${missingProducts.length}`);
  console.log("---------------------------------------------");
  console.log("");

  if (!apply) {
    console.log("DRY RUN 完成：資料庫沒有被修改。");
    console.log("");
    console.log("確認後正式執行：");
    console.log(
      "npx tsx .\\scripts\\cleanup-missing-legacy-image-refs.ts --apply"
    );
    console.log("");
    return;
  }

  if (missingProducts.length > 0) {
    throw new Error(
      "有指定商品找不到，為安全起見停止 APPLY。"
    );
  }

  await withDbClient(async (client) => {
    await client.query("BEGIN");

    try {
      for (const plan of changedPlans) {
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
            plan.product!.id,
            plan.nextImage,
            JSON.stringify(plan.nextGallery ?? []),
          ]
        );

        console.log(
          `✓ ${plan.product!.display_code} ${plan.product!.name}`
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
  console.log("============== APPLY RESULT ==============");
  console.log(`成功更新商品： ${changedPlans.length}`);
  console.log(
    `仍使用 /products/ 的商品數： ${remaining.rows[0]?.count ?? "?"}`
  );
  console.log("==========================================");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "Cleanup 失敗：",
    error instanceof Error ? error.message : error
  );
  console.error("");
  process.exitCode = 1;
});
