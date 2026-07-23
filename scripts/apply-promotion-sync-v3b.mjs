import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "page.tsx");
const backupDir = path.join(root, "backup");
const backupPath = path.join(backupDir, "page-before-promotion-sync-v3b.tsx");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  fail("找不到 app/page.tsx");
}

let source = fs.readFileSync(pagePath, "utf8");

if (source.includes("databasePromotionSyncReadyV3B")) {
  console.log("ℹ️ Phase 3B 已套用過，不重複修改 app/page.tsx");
  process.exit(0);
}

if (!source.includes('products as fallbackProducts')) {
  fail("找不到 Phase 2B-5 的 fallbackProducts。請確認目前是已驗收成功的正式版本。");
}

if (!source.includes('getComboConfig,')) {
  fail("找不到 storefront-core 的 getComboConfig import，停止修改。");
}

if (!source.includes('type StorefrontProduct = Product & {')) {
  fail("找不到 StorefrontProduct 型別，停止修改。");
}

if (!source.includes('  const activeComboConfig = comboPickerProduct')) {
  fail("找不到 activeComboConfig 插入點，停止修改。");
}

if (!source.includes('return comboProductIds.has(product.id) || product.category === "組合價";')) {
  fail("找不到 hasComboPrice 舊邏輯，停止修改。");
}

if (!source.includes("      if (delta > 0 && currentTotal >= quantityLimit) {")) {
  fail("找不到任搭數量限制邏輯，停止修改。");
}

fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(pagePath, backupPath);
  console.log(`✅ 備份：${path.relative(root, backupPath)}`);
}

// 1) 保留舊 hardcoded config 當 fallback，但由本頁 wrapper 決定資料庫是否接管。
source = source.replace(
  "  getComboConfig,",
  "  getComboConfig as getFallbackComboConfig,"
);

// 2) 在 Home 前建立資料庫優惠 runtime cache。
const homeAnchor = "function Home() {";
const runtime = `let databaseComboConfigsV3B: Record<number, ComboConfig> = {};
let databaseManagedComboProductIdsV3B = new Set<number>();
let databasePromotionSyncReadyV3B = false;

function getComboConfig(productId: number) {
  if (
    databasePromotionSyncReadyV3B &&
    databaseManagedComboProductIdsV3B.has(productId)
  ) {
    return databaseComboConfigsV3B[productId] ?? null;
  }

  return getFallbackComboConfig(productId);
}

`;
source = source.replace(homeAnchor, runtime + homeAnchor);

// 3) 在既有商品 API 同步之後加入優惠 API 同步。
const activeAnchor = "  const activeComboConfig = comboPickerProduct";
const promotionSync = `  const [, setPromotionRevisionV3B] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadStorefrontPromotionsV3B() {
      try {
        const response = await fetch("/api/storefront/promotions", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = (await response.json()) as {
          comboConfigs?: Record<string, ComboConfig>;
          managedProductIds?: number[];
        };

        if (cancelled) return;

        const nextConfigs: Record<number, ComboConfig> = {};
        for (const [key, config] of Object.entries(payload.comboConfigs ?? {})) {
          const productId = Number(key);
          if (Number.isInteger(productId) && productId > 0) {
            nextConfigs[productId] = config;
          }
        }

        databaseComboConfigsV3B = nextConfigs;
        databaseManagedComboProductIdsV3B = new Set(
          (payload.managedProductIds ?? []).filter(
            (productId) => Number.isInteger(productId) && productId > 0
          )
        );
        databasePromotionSyncReadyV3B = true;
        setPromotionRevisionV3B((current) => current + 1);
      } catch (error) {
        console.error(
          "[Jourdeness] 優惠資料同步失敗，保留 storefront hardcoded fallback。",
          error
        );
      }
    }

    void loadStorefrontPromotionsV3B();

    return () => {
      cancelled = true;
    };
  }, []);

`;
source = source.replace(activeAnchor, promotionSync + activeAnchor);

// 4) DB 任搭也算「有組合價」，讓分類／標籤跟著後台設定。
source = source.replace(
  'return comboProductIds.has(product.id) || product.category === "組合價";',
  'return Boolean(getComboConfig(product.id)) || comboProductIds.has(product.id) || product.category === "組合價";'
);

// 5) 套用後台「允許同一商品重複選」設定。
source = source.replace(
  `      if (delta > 0 && currentTotal >= quantityLimit) {
        return current;
      }
`,
  `      const allowSameProductV3B =
        (
          activeComboConfig as ComboConfig & {
            allowSameProduct?: boolean;
          }
        ).allowSameProduct ?? true;

      if (delta > 0 && !allowSameProductV3B && currentQuantity >= 1) {
        return current;
      }

      if (delta > 0 && currentTotal >= quantityLimit) {
        return current;
      }
`
);

fs.writeFileSync(pagePath, source, "utf8");

console.log("✅ Phase 3B 任搭同步已套用");
console.log("   Neon promotions → /api/storefront/promotions → 任選視窗 / 購物車");
console.log("   API 失敗時保留舊 hardcoded 優惠 fallback");
console.log("   後台停用 DB 管理的任搭時，不會重新掉回舊活動");
console.log("");
console.log("下一步：npm run build");
