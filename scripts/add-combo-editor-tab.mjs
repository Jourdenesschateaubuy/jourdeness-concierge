import fs from "node:fs";

const path =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  source = source.replace(before, after);
}

/* import */
if (!source.includes('import ComboConfigEditor')) {
  replaceOnce(
    'import ProductImageUploader from "./ProductImageUploader";',
    `import ProductImageUploader from "./ProductImageUploader";
import ComboConfigEditor from "./ComboConfigEditor";`,
    "ComboConfigEditor import"
  );
}

/* Tab */
replaceOnce(
  'type Tab = "card" | "detail";',
  'type Tab = "card" | "combo" | "detail";',
  "Tab type"
);

/* hasCombo */
if (!source.includes("const hasCombo = Boolean(product.comboConfig);")) {
  replaceOnce(
    '  const [tab, setTab] = useState<Tab>("card");',
    `  const [tab, setTab] = useState<Tab>("card");
  const hasCombo = Boolean(product.comboConfig);`,
    "hasCombo"
  );
}

/* tabs 2 / 3 欄 */
replaceOnce(
  '<div className={styles.tabs}>',
  `<div
        className={styles.tabs}
        style={{
          gridTemplateColumns: hasCombo
            ? "repeat(3, minmax(0, 1fr))"
            : "repeat(2, minmax(0, 1fr))",
        }}
      >`,
  "tabs layout"
);

/* 在商品資訊按鈕前加入組合內容 */
const detailButton = `        <button
          type="button"
          className={tab === "detail" ? styles.activeTab : ""}
          onClick={() => setTab("detail")}
        >
          商品資訊
        </button>`;

if (!source.includes('setTab("combo")')) {
  replaceOnce(
    detailButton,
`        {hasCombo && (
          <button
            type="button"
            className={tab === "combo" ? styles.activeTab : ""}
            onClick={() => setTab("combo")}
          >
            組合內容
          </button>
        )}

${detailButton}`,
    "組合內容 tab"
  );
}

/* 在商品資訊 panel 前加入 combo editor */
const detailPanel = `      {tab === "detail" && (`;

if (!source.includes("<ComboConfigEditor")) {
  replaceOnce(
    detailPanel,
`      {hasCombo && product.comboConfig && (
        <div hidden={tab !== "combo"}>
          <ComboConfigEditor
            productId={product.id}
            initialConfig={product.comboConfig}
          />
        </div>
      )}

${detailPanel}`,
    "ComboConfigEditor panel"
  );
}

fs.writeFileSync(path, source, "utf8");

console.log("✅ 一般商品維持 2 個分頁");
console.log("✅ 組合價商品自動顯示第 3 個「組合內容」");
console.log("✅ 組合內容已接入 comboConfig hidden input");
console.log("✅ 切換分頁不會遺失尚未儲存的組合修改");
