import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "page.tsx");
const backupDir = path.join(root, "backup");
const backupPath = path.join(backupDir, "page-before-buyget-v3c1a.tsx");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  fail("找不到 app/page.tsx");
}

let source = fs.readFileSync(pagePath, "utf8");

if (source.includes("databaseBuyGetConfigsV3C1A")) {
  console.log("ℹ️ Phase 3C-1A 已套用，不重複修改 app/page.tsx");
  process.exit(0);
}

if (!source.includes("let databasePromotionSyncReadyV3B = false;")) {
  fail("找不到 Phase 3B runtime 插入點。");
}

if (!source.includes("comboConfigs?: Record<string, ComboConfig>;")) {
  fail("找不到 Phase 3B promotions payload 型別。");
}

if (!source.includes("managedProductIds?: number[];")) {
  fail("找不到 Phase 3B managedProductIds payload。");
}

if (!source.includes("databasePromotionSyncReadyV3B = true;")) {
  fail("找不到 Phase 3B runtime assignment。");
}

fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(pagePath, backupPath);
  console.log(`✅ 備份：${path.relative(root, backupPath)}`);
}

const runtime = `

type StorefrontBuyGetConfigV3C1A = {
  promotionId: number;
  name: string;
  buyProductId: number;
  buyQuantity: number;
  giftQuantity: number;
  giftMode: "same_product" | "fixed_product" | "gift_pool";
  repeatable: boolean;
  priority: number;
  giftProductIds: number[];
  note?: string;
};

let databaseBuyGetConfigsV3C1A: Record<
  number,
  StorefrontBuyGetConfigV3C1A
> = {};
let databaseManagedBuyGetProductIdsV3C1A = new Set<number>();

function getBuyGetConfigV3C1A(productId: number) {
  return databaseBuyGetConfigsV3C1A[productId] ?? null;
}
`;

source = source.replace(
  "let databasePromotionSyncReadyV3B = false;",
  "let databasePromotionSyncReadyV3B = false;" + runtime
);

source = source.replace(
  `          comboConfigs?: Record<string, ComboConfig>;
          managedProductIds?: number[];`,
  `          comboConfigs?: Record<string, ComboConfig>;
          managedProductIds?: number[];
          buyGetConfigs?: Record<string, StorefrontBuyGetConfigV3C1A>;
          managedBuyGetProductIds?: number[];`
);

const assignment = `
        const nextBuyGetConfigsV3C1A: Record<
          number,
          StorefrontBuyGetConfigV3C1A
        > = {};

        for (const [key, config] of Object.entries(
          payload.buyGetConfigs ?? {}
        )) {
          const productId = Number(key);
          if (Number.isInteger(productId) && productId > 0) {
            nextBuyGetConfigsV3C1A[productId] = config;
          }
        }

        databaseBuyGetConfigsV3C1A = nextBuyGetConfigsV3C1A;
        databaseManagedBuyGetProductIdsV3C1A = new Set(
          (payload.managedBuyGetProductIds ?? []).filter(
            (productId) => Number.isInteger(productId) && productId > 0
          )
        );
`;

source = source.replace(
  "        databasePromotionSyncReadyV3B = true;",
  assignment + "\n        databasePromotionSyncReadyV3B = true;"
);

fs.writeFileSync(pagePath, source, "utf8");

console.log("✅ Phase 3C-1A 已套用");
console.log("   promotions API 現在同時讀：任搭組合 + 買幾送幾");
console.log("   app/page.tsx 已載入 buyGetConfigs runtime");
console.log("   本階段尚未改購物車計價，避免一次改太大");
console.log("");
console.log("下一步：npm run build");
