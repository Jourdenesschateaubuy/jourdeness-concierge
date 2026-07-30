import fs from "node:fs";

const corePath = "./lib/storefront-core.ts";
const repoPath = "./lib/product-repository.ts";

let core = fs.readFileSync(corePath, "utf8").replace(/\r\n/g, "\n");
let repo = fs.readFileSync(repoPath, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  return source.replace(before, after);
}

/* =====================================================
   1. Product 型別加入 comboConfig
===================================================== */

if (!core.includes("comboConfig?: ComboConfig;")) {
  const before =
`  expandedInfo?: Array<{
    title: string;
    content: string;
  }>;
};`;

  const after =
`  expandedInfo?: Array<{
    title: string;
    content: string;
  }>;
  comboConfig?: ComboConfig;
};`;

  core = replaceOnce(
    core,
    before,
    after,
    "Product.comboConfig"
  );
}

/* =====================================================
   2. Repository 匯入 ComboConfig
===================================================== */

repo = repo.replace(
  'import type { MainCategory, Product } from "./storefront-core";',
  'import type { ComboConfig, MainCategory, Product } from "./storefront-core";'
);

/* =====================================================
   3. ProductRow 加入 combo_config
===================================================== */

if (!repo.includes("combo_config: ComboConfig | null;")) {
  const before =
`  expanded_info: Product["expandedInfo"] | null;
  status: ProductStatus;`;

  const after =
`  expanded_info: Product["expandedInfo"] | null;
  combo_config: ComboConfig | null;
  status: ProductStatus;`;

  repo = replaceOnce(
    repo,
    before,
    after,
    "ProductRow.combo_config"
  );
}

/* =====================================================
   4. PostgreSQL row → 商品物件
===================================================== */

if (!repo.includes("comboConfig: row.combo_config")) {
  const before =
`    expandedInfo: row.expanded_info ?? [],
    status: row.status,`;

  const after =
`    expandedInfo: row.expanded_info ?? [],
    comboConfig: row.combo_config ?? undefined,
    status: row.status,`;

  repo = replaceOnce(
    repo,
    before,
    after,
    "rowToProduct.comboConfig"
  );
}

fs.writeFileSync(corePath, core, "utf8");
fs.writeFileSync(repoPath, repo, "utf8");

console.log("✅ Product 已加入 comboConfig");
console.log("✅ ProductRow 已讀取 combo_config");
console.log("✅ rowToProduct 已映射 comboConfig");
console.log("✅ storefront API 將自動回傳 comboConfig");
