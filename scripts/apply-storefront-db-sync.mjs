import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const pagePath = path.join(projectRoot, "app", "page.tsx");
const clientPath = path.join(projectRoot, "app", "storefront-client.tsx");
const actionsPath = path.join(projectRoot, "app", "admin", "products", "actions.ts");
const backupDir = path.join(projectRoot, "backup");
const backupPath = path.join(backupDir, "page-before-storefront-db-sync.tsx");

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(pagePath)) {
  fail("找不到 app/page.tsx");
}

const originalPage = fs.readFileSync(pagePath, "utf8");

if (!originalPage.includes('"use client";')) {
  fail("目前 app/page.tsx 不是預期的 client storefront，先不要套用。");
}

if (!originalPage.includes("function Home()")) {
  fail("找不到 function Home()，目前 storefront 版本與套件預期不同。");
}

if (!originalPage.includes("  products,")) {
  fail("找不到 storefront-core 的 products import。");
}

if (!originalPage.includes('return product.price.includes("新品預告")')) {
  fail("找不到既有新品預告判斷，先不要套用。");
}

if (!originalPage.includes('return product.price.includes("缺貨");')) {
  fail("找不到既有售罄判斷，先不要套用。");
}

fs.mkdirSync(backupDir, { recursive: true });

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(pagePath, backupPath);
  console.log(`✅ 已備份：${path.relative(projectRoot, backupPath)}`);
} else {
  console.log(`ℹ️ 備份已存在：${path.relative(projectRoot, backupPath)}`);
}

let clientSource = originalPage;

// 將舊的靜態商品資料改名為 fallback，只在資料庫失敗時使用。
clientSource = clientSource.replace(
  "  products,",
  "  products as fallbackProducts,"
);

// 讓 client storefront 接受 Server Component 傳入的 Neon 商品。
clientSource = clientSource.replace(
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

function Home({
  products = fallbackProducts as StorefrontProduct[],
}: {
  products?: StorefrontProduct[];
}) {`
);

// status 優先於舊版文字判斷；舊資料仍保留 fallback。
clientSource = clientSource.replace(
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

fs.writeFileSync(clientPath, clientSource, "utf8");

const serverPage = `import StorefrontClient from "./storefront-client";
import { listDatabaseProducts } from "../lib/product-repository";
import {
  products as fallbackProducts,
  type Product,
} from "../lib/storefront-core";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StorefrontProduct = Product & {
  status?: "active" | "inactive" | "coming_soon" | "sold_out";
  sortOrder?: number;
  sku?: string;
};

export default async function Page() {
  let products: StorefrontProduct[] =
    fallbackProducts as StorefrontProduct[];

  try {
    const databaseProducts = await listDatabaseProducts({
      includeInactive: true,
    });

    const visibleProducts = databaseProducts
      .filter((product) => product.status !== "inactive")
      .map((product) => ({
        ...product,
        // 新品預告在前台集中進「新品預告」分類；
        // 資料庫原始 category 不會被修改。
        category:
          product.status === "coming_soon"
            ? ("新品預告" as Product["category"])
            : product.category,
      }));

    // 資料庫若暫時異常或意外為空，保留舊商城資料作為安全 fallback。
    if (visibleProducts.length > 0) {
      products = visibleProducts;
    }
  } catch (error) {
    console.error(
      "[Jourdeness] Neon 商品讀取失敗，暫時使用 storefront fallback。",
      error
    );
  }

  return <StorefrontClient products={products} />;
}
`;

fs.writeFileSync(pagePath, serverPage, "utf8");

// CRUD 後主動讓首頁失效；即使首頁本身已是 force-dynamic，仍保留明確同步意圖。
if (fs.existsSync(actionsPath)) {
  let actions = fs.readFileSync(actionsPath, "utf8");

  if (!actions.includes('revalidatePath("/");')) {
    actions = actions.replaceAll(
      'revalidatePath("/admin/products");',
      'revalidatePath("/admin/products");\n  revalidatePath("/");'
    );
    fs.writeFileSync(actionsPath, actions, "utf8");
    console.log("✅ 已更新商品 CRUD：變更後同步刷新正式商城");
  }
}

console.log("✅ Phase 2B-5 已套用");
console.log("   app/page.tsx                → Server storefront");
console.log("   app/storefront-client.tsx   → 原本完整商城 UI");
console.log("   Neon                        → 正式商品來源");
console.log("");
console.log("下一步請執行：npm run build");
