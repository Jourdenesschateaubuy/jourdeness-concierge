/**
 * Jourdeness storefront-core missing fallback cleanup
 *
 * Preview only:
 *   npx tsx .\scripts\apply-storefront-missing-fallback-cleanup.ts
 *
 * Apply:
 *   npx tsx .\scripts\apply-storefront-missing-fallback-cleanup.ts --apply
 *
 * Safety:
 * - Only edits lib/storefront-core.ts
 * - Creates a timestamped .bak before APPLY
 * - Does NOT modify database
 * - Does NOT move/delete files
 * - Removes only the confirmed-missing legacy /products/... URLs listed below
 * - Keeps valid /api/studio/media/.../file entries in mixed arrays
 * - Rewrites primary image refs to "" instead of deleting the property
 * - Rewrites gallery arrays by removing only missing items
 * - Rewrites productImageFallbacks arrays by removing only missing items
 */

import fs from "node:fs/promises";
import path from "node:path";

const MISSING = new Set([
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
]);

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    "_",
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join("");
}

function extractQuotedStrings(input: string) {
  const result: string[] = [];
  const regex = /"([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input))) {
    result.push(match[1]);
  }

  return result;
}

function serializeArray(items: string[]) {
  return `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const sourcePath = path.resolve(
    process.cwd(),
    "lib",
    "storefront-core.ts"
  );

  const source = await fs.readFile(sourcePath, "utf8");
  const lines = source.split(/\r?\n/);

  const fallbackStartIndex = lines.findIndex((line) =>
    line.includes("export const productImageFallbacks")
  );

  if (fallbackStartIndex < 0) {
    throw new Error(
      "找不到 productImageFallbacks 區塊，為安全起見停止。"
    );
  }

  let primaryChanged = 0;
  let galleryChanged = 0;
  let fallbackChanged = 0;
  let removedItems = 0;

  const preview: string[] = [];

  const nextLines = lines.map((line, index) => {
    const lineNumber = index + 1;
    let next = line;

    // 1) Primary image: image: "/products/xxx"
    const primaryMatch = next.match(
      /^(\s*image\s*:\s*)"([^"]*)"(\s*,?\s*)$/
    );

    if (primaryMatch && MISSING.has(primaryMatch[2])) {
      const before = next;
      next =
        `${primaryMatch[1]}""${primaryMatch[3]}`;

      primaryChanged++;
      removedItems++;

      preview.push(
        `L${lineNumber} PRIMARY`,
        `  BEFORE: ${before.trim()}`,
        `  AFTER : ${next.trim()}`
      );

      return next;
    }

    // 2) Gallery line: gallery: [...]
    const galleryMatch = next.match(
      /^(\s*gallery\s*:\s*)(\[[^\]]*\])(\s*,?\s*)$/
    );

    if (galleryMatch) {
      const items = extractQuotedStrings(
        galleryMatch[2]
      );

      const kept = items.filter(
        (item) => !MISSING.has(item)
      );

      if (kept.length !== items.length) {
        const before = next;
        const removed =
          items.length - kept.length;

        next =
          `${galleryMatch[1]}${serializeArray(kept)}${galleryMatch[3]}`;

        galleryChanged++;
        removedItems += removed;

        preview.push(
          `L${lineNumber} GALLERY`,
          `  BEFORE: ${before.trim()}`,
          `  AFTER : ${next.trim()}`
        );
      }

      return next;
    }

    // 3) productImageFallbacks entries, e.g. 30: ["...", "..."],
    if (index >= fallbackStartIndex) {
      const fallbackMatch = next.match(
        /^(\s*\d+\s*:\s*)(\[[^\]]*\])(\s*,?\s*)$/
      );

      if (fallbackMatch) {
        const items = extractQuotedStrings(
          fallbackMatch[2]
        );

        const kept = items.filter(
          (item) => !MISSING.has(item)
        );

        if (kept.length !== items.length) {
          const before = next;
          const removed =
            items.length - kept.length;

          next =
            `${fallbackMatch[1]}${serializeArray(kept)}${fallbackMatch[3]}`;

          fallbackChanged++;
          removedItems += removed;

          preview.push(
            `L${lineNumber} FALLBACK`,
            `  BEFORE: ${before.trim()}`,
            `  AFTER : ${next.trim()}`
          );
        }

        return next;
      }

      // 4) Multi-line fallback array element lines that only contain a string
      const stringOnlyMatch = next.match(
        /^(\s*)"([^"]*)"(\s*,?\s*)$/
      );

      if (
        stringOnlyMatch &&
        MISSING.has(stringOnlyMatch[2])
      ) {
        const before = next;
        next = "";

        fallbackChanged++;
        removedItems++;

        preview.push(
          `L${lineNumber} FALLBACK-ELEMENT`,
          `  BEFORE: ${before.trim()}`,
          `  AFTER : (removed)`
        );

        return next;
      }
    }

    return next;
  });

  const nextSource = nextLines.join("\n");

  const remainingMatches = Array.from(
    nextSource.matchAll(
      /"\/products\/[^"]+"/g
    )
  ).map((m) => m[0].slice(1, -1));

  const remainingMissing = Array.from(
    new Set(
      remainingMatches.filter((url) =>
        MISSING.has(url)
      )
    )
  );

  console.log("");
  console.log(
    "===================================================="
  );
  console.log(
    apply
      ? " Jourdeness Missing Fallback Cleanup - APPLY"
      : " Jourdeness Missing Fallback Cleanup - PREVIEW"
  );
  console.log(
    apply
      ? " 只修改 storefront-core.ts"
      : " 不會修改任何檔案"
  );
  console.log(
    "===================================================="
  );
  console.log("");

  console.log("---------------- SUMMARY ----------------");
  console.log(`Primary image 變更：      ${primaryChanged}`);
  console.log(`Gallery 行變更：          ${galleryChanged}`);
  console.log(`Fallback 行/元素變更：    ${fallbackChanged}`);
  console.log(`總移除 missing refs：     ${removedItems}`);
  console.log(`修改後仍殘留 missing URL：${remainingMissing.length}`);
  console.log("-----------------------------------------");
  console.log("");

  if (preview.length > 0) {
    console.log("=== PREVIEW ===");
    for (const line of preview) {
      console.log(line);
    }
    console.log("");
  }

  if (remainingMissing.length > 0) {
    console.log(
      "⚠ 修改後仍殘留以下 missing URL："
    );
    for (const url of remainingMissing) {
      console.log(`  - ${url}`);
    }
    console.log("");
  }

  if (!apply) {
    console.log(
      "PREVIEW 完成：storefront-core.ts 沒有被修改。"
    );
    console.log("");
    console.log("確認結果後正式執行：");
    console.log(
      "npx tsx .\\scripts\\apply-storefront-missing-fallback-cleanup.ts --apply"
    );
    console.log("");
    return;
  }

  if (remainingMissing.length > 0) {
    throw new Error(
      "清理模擬後仍有 missing URL，為安全起見停止 APPLY。"
    );
  }

  const backupPath =
    `${sourcePath}.missing-fallback-cleanup-${timestamp()}.bak`;

  await fs.copyFile(sourcePath, backupPath);
  await fs.writeFile(
    sourcePath,
    nextSource,
    "utf8"
  );

  console.log("============== APPLY RESULT ==============");
  console.log(`備份：${backupPath}`);
  console.log(`Primary image 變更：   ${primaryChanged}`);
  console.log(`Gallery 行變更：       ${galleryChanged}`);
  console.log(`Fallback 行/元素變更： ${fallbackChanged}`);
  console.log(`總移除 missing refs：  ${removedItems}`);
  console.log("==========================================");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "Cleanup 失敗：",
    error instanceof Error
      ? error.message
      : error
  );
  console.error("");
  process.exitCode = 1;
});