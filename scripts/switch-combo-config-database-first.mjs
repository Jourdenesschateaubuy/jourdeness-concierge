import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

/* 1. 舊 getComboConfig 改名成 fallback */
if (
  source.includes("  getComboConfig,") &&
  !source.includes("getComboConfig as getFallbackComboConfig")
) {
  source = source.replace(
    "  getComboConfig,",
    "  getComboConfig as getFallbackComboConfig,"
  );
}

/* 2. 在 products state 後加入資料庫優先 resolver */
if (!source.includes("function getComboConfig(productId: number): ComboConfig | null")) {
  const marker = `  const [products, setProducts] = useState<StorefrontProduct[]>(
    () => fallbackProducts as StorefrontProduct[]
  );`;

  const replacement = `${marker}

  function getComboConfig(productId: number): ComboConfig | null {
    const databaseConfig =
      products.find((product) => product.id === productId)?.comboConfig;

    return databaseConfig ?? getFallbackComboConfig(productId);
  }`;

  if (!source.includes(marker)) {
    console.error("❌ 找不到 products state 插入位置");
    process.exit(1);
  }

  source = source.replace(marker, replacement);
}

/* 3. 基本安全檢查 */
if (!source.includes("getComboConfig as getFallbackComboConfig")) {
  console.error("❌ fallback import 沒有完成");
  process.exit(1);
}

if (!source.includes("databaseConfig ?? getFallbackComboConfig(productId)")) {
  console.error("❌ 資料庫優先 resolver 沒有完成");
  process.exit(1);
}

fs.writeFileSync(path, source, "utf8");

console.log("✅ 舊組合設定已改為 fallback");
console.log("✅ 前台優先使用 product.comboConfig");
console.log("✅ 無資料庫設定時仍會使用舊 hardcode");
console.log("✅ 現有 getComboConfig 呼叫點不需逐一修改");
