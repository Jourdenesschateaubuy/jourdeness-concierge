import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagePath = path.join(root, "app", "page.tsx");
const backupDir = path.join(root, "backup");
const backupPath = path.join(backupDir, "page-before-storefront-api-sync.tsx");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  fail("找不到 app/page.tsx");
}

let source = fs.readFileSync(pagePath, "utf8");

if (!source.includes('"use client";')) {
  fail("app/page.tsx 不是預期的 client storefront。請先執行 rollback-storefront-db-sync.mjs 還原。");
}

if (!source.includes("function Home() {")) {
  fail("找不到 function Home()。");
}

if (!source.includes("  products,")) {
  fail("找不到 storefront-core 的 products import。");
}

if (!source.includes("  const activeComboConfig =")) {
  fail("找不到 activeComboConfig 插入點。");
}

if (!source.includes('return product.price.includes("新品預告")')) {
  fail("找不到 isComingSoon 舊邏輯。");
}

if (!source.includes('return product.price.includes("缺貨");')) {
  fail("找不到 isSoldOut 舊邏輯。");
}

fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(pagePath, backupPath);
  console.log(`✅ 備份：${path.relative(root, backupPath)}`);
}

// 1) 原本靜態商品改名為 fallback。
source = source.replace(
  "  products,",
  "  products as fallbackProducts,"
);

// 2) 在 Home 上方加入帶資料庫狀態的前台商品型別。
source = source.replace(
  "function Home() {",
  `type StorefrontProductStatus =
  | "active"
  | "inactive"
  | "coming_soon"
  | "sold_out";

type StorefrontProduct = Product & {
  status?: StorefrontProductStatus;
  sortOrder?: number;
  sku?: string;
};

function Home() {
  const [products, setProducts] = useState<StorefrontProduct[]>(
    () => fallbackProducts as StorefrontProduct[]
  );`
);

// 3) 在既有商城狀態後加入一次 API 同步。
// fetch 使用 no-store；若 Neon/API 暫時失敗，保留 fallback，不影響商城。
const apiSync = `
  useEffect(() => {
    let cancelled = false;

    async function loadStorefrontProducts() {
      try {
        const response = await fetch("/api/storefront/products", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = (await response.json()) as {
          products?: StorefrontProduct[];
        };

        if (
          !cancelled &&
          Array.isArray(payload.products) &&
          payload.products.length > 0
        ) {
          setProducts(payload.products);
        }
      } catch (error) {
        console.error(
          "[Jourdeness] 商品資料同步失敗，保留 storefront fallback。",
          error
        );
      }
    }

    void loadStorefrontProducts();

    return () => {
      cancelled = true;
    };
  }, []);

`;

source = source.replace(
  "  const activeComboConfig =",
  apiSync + "  const activeComboConfig ="
);

// 4) 商品狀態優先使用 Neon status，舊文字規則保留 fallback。
source = source.replace(
  `  function isComingSoon(product: Product) {
    return product.price.includes("新品預告") || productContent(product).priceNote?.includes("新品預告") || false;
  }

  function isSoldOut(product: Product) {
    return product.price.includes("缺貨");
  }`,
  `  function getStorefrontStatus(product: Product) {
    return (product as StorefrontProduct).status;
  }

  function isComingSoon(product: Product) {
    if (getStorefrontStatus(product) === "coming_soon") return true;
    return product.price.includes("新品預告") || productContent(product).priceNote?.includes("新品預告") || false;
  }

  function isSoldOut(product: Product) {
    if (getStorefrontStatus(product) === "sold_out") return true;
    return product.price.includes("缺貨");
  }`
);

fs.writeFileSync(pagePath, source, "utf8");

console.log("✅ Phase 2B-5 V2 已套用");
console.log("   app/page.tsx 保留完整 Client Storefront");
console.log("   /api/storefront/products 從 Neon 讀取");
console.log("   Neon 失敗時自動保留原本商品 fallback");
console.log("");
console.log("下一步：npm run build");
