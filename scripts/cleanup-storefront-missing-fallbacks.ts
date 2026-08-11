/**
 * Jourdeness storefront-core missing fallback cleanup — DRY RUN
 *
 * Run:
 *   npx tsx .\scripts\cleanup-storefront-missing-fallbacks.ts
 *
 * READ ONLY:
 * - Does not modify storefront-core.ts
 * - Does not modify database
 * - Does not move/delete files
 *
 * Purpose:
 * Classify the remaining /products/... references that no longer have
 * real files / Media Assets, so we can safely decide what to remove next.
 */

import fs from "node:fs/promises";
import path from "node:path";

const MISSING_LEGACY_URLS = [
  "/products/龍血求麗睡眠精油滾珠.jpg",
  "/products/龍血求麗睡眠精油滾珠.png",
  "/products/薰衣草萬用精油滾珠.jpg",
  "/products/薰衣草萬用精油滾珠.png",
  "/products/dragon roller.png",
  "/products/lav-washtoothpaste.jpg",
  "/products/lavender roller.png",
  "/products/lip balm.jpg",
  "/products/lip balm.png",
  "/products/lip combo.jpg",
  "/products/lip tint.jpg",
  "/products/lip tint.png",
  "/products/patch 1.png",
  "/products/patch 5.png",
  "/products/toothpaste bd.png",
  "/products/toothpaste lav.png",
  "/products/toothpaste_bd.png",
  "/products/toothpaste_lav.png",
  "/products/toothpaste-bd.png",
  "/products/toothpaste-lav.png",
];

type Hit = {
  lineNumber: number;
  category:
    | "primary-image"
    | "gallery"
    | "productImageFallbacks"
    | "other";
  url: string;
  line: string;
};

function classifyLine(
  line: string,
  lineNumber: number,
  fallbackStart: number | null
): Hit["category"] {
  if (
    fallbackStart !== null &&
    lineNumber >= fallbackStart
  ) {
    return "productImageFallbacks";
  }

  if (/^\s*image\s*:/.test(line)) {
    return "primary-image";
  }

  if (/^\s*gallery\s*:/.test(line)) {
    return "gallery";
  }

  return "other";
}

async function main() {
  const sourcePath = path.resolve(
    process.cwd(),
    "lib",
    "storefront-core.ts"
  );

  const source = await fs.readFile(
    sourcePath,
    "utf8"
  );

  const lines = source.split(/\r?\n/);

  const fallbackStartIndex = lines.findIndex(
    (line) =>
      line.includes(
        "export const productImageFallbacks"
      )
  );

  const fallbackStart =
    fallbackStartIndex >= 0
      ? fallbackStartIndex + 1
      : null;

  const hits: Hit[] = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const line = lines[index];
    const lineNumber = index + 1;

    for (const url of MISSING_LEGACY_URLS) {
      if (!line.includes(url)) {
        continue;
      }

      hits.push({
        lineNumber,
        category: classifyLine(
          line,
          lineNumber,
          fallbackStart
        ),
        url,
        line: line.trim(),
      });
    }
  }

  const counts = {
    primaryImage: hits.filter(
      (hit) =>
        hit.category === "primary-image"
    ).length,
    gallery: hits.filter(
      (hit) => hit.category === "gallery"
    ).length,
    productImageFallbacks: hits.filter(
      (hit) =>
        hit.category ===
        "productImageFallbacks"
    ).length,
    other: hits.filter(
      (hit) => hit.category === "other"
    ).length,
  };

  const foundUrls = new Set(
    hits.map((hit) => hit.url)
  );

  const notFoundInSource =
    MISSING_LEGACY_URLS.filter(
      (url) => !foundUrls.has(url)
    );

  console.log("");
  console.log(
    "=================================================="
  );
  console.log(
    " Jourdeness Missing storefront-core Refs - DRY RUN"
  );
  console.log(
    " 不會修改任何檔案或資料庫"
  );
  console.log(
    "=================================================="
  );
  console.log("");

  console.log(
    "---------------- SUMMARY ----------------"
  );
  console.log(
    `指定 missing URL 數：             ${MISSING_LEGACY_URLS.length}`
  );
  console.log(
    `實際命中引用次數：                ${hits.length}`
  );
  console.log(
    `primary image 引用：              ${counts.primaryImage}`
  );
  console.log(
    `gallery 引用：                    ${counts.gallery}`
  );
  console.log(
    `productImageFallbacks 引用：      ${counts.productImageFallbacks}`
  );
  console.log(
    `其他引用：                        ${counts.other}`
  );
  console.log(
    `指定 URL 但目前 source 已無引用： ${notFoundInSource.length}`
  );
  console.log(
    "-----------------------------------------"
  );
  console.log("");

  console.log(
    "=== PRIMARY IMAGE（不能直接刪整行，需另定策略） ==="
  );

  const primaryHits = hits.filter(
    (hit) =>
      hit.category === "primary-image"
  );

  if (primaryHits.length === 0) {
    console.log("（無）");
  } else {
    for (const hit of primaryHits) {
      console.log(
        `L${hit.lineNumber}  ${hit.line}`
      );
    }
  }

  console.log("");
  console.log(
    "=== GALLERY（可評估移除缺失項目） ==="
  );

  const galleryHits = hits.filter(
    (hit) => hit.category === "gallery"
  );

  if (galleryHits.length === 0) {
    console.log("（無）");
  } else {
    for (const hit of galleryHits) {
      console.log(
        `L${hit.lineNumber}  ${hit.line}`
      );
    }
  }

  console.log("");
  console.log(
    "=== productImageFallbacks（可評估移除不存在候選） ==="
  );

  const fallbackHits = hits.filter(
    (hit) =>
      hit.category ===
      "productImageFallbacks"
  );

  if (fallbackHits.length === 0) {
    console.log("（無）");
  } else {
    for (const hit of fallbackHits) {
      console.log(
        `L${hit.lineNumber}  ${hit.line}`
      );
    }
  }

  console.log("");
  console.log(
    "=== OTHER（需要人工確認上下文） ==="
  );

  const otherHits = hits.filter(
    (hit) => hit.category === "other"
  );

  if (otherHits.length === 0) {
    console.log("（無）");
  } else {
    for (const hit of otherHits) {
      console.log(
        `L${hit.lineNumber}  ${hit.line}`
      );
    }
  }

  if (notFoundInSource.length > 0) {
    console.log("");
    console.log(
      "=== 指定為 missing，但目前 storefront-core.ts 已找不到 ==="
    );

    for (const url of notFoundInSource) {
      console.log(`- ${url}`);
    }
  }

  console.log("");
  console.log(
    "DRY RUN 完成：沒有修改 storefront-core.ts。"
  );
  console.log("");
  console.log(
    "下一步應依分類結果決定：primary image 如何處理、gallery/fallback 哪些可安全移除。"
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "檢查失敗：",
    error instanceof Error
      ? error.message
      : error
  );
  console.error("");
  process.exitCode = 1;
});
