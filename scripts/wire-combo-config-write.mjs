import fs from "node:fs";

const corePath = "./lib/storefront-core.ts";
const repoPath = "./lib/product-repository.ts";
const actionPath = "./app/admin/products/actions.ts";

let core = fs.readFileSync(corePath, "utf8").replace(/\r\n/g, "\n");
let repo = fs.readFileSync(repoPath, "utf8").replace(/\r\n/g, "\n");
let actions = fs.readFileSync(actionPath, "utf8").replace(/\r\n/g, "\n");

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    console.error(`❌ 找不到：${label}`);
    process.exit(1);
  }

  return source.replace(before, after);
}

/* =====================================================
   A. Combo 型別正式補齊 Admin V2 需要的資料
===================================================== */

if (!core.includes('type?: "mix_match" | "buy_get";')) {
  core = replaceOnce(
    core,
`type ComboOption = {
  id: string;
  name: string;
  singleUnitPrice?: number;
  singlePriceLabel?: string;
};`,
`export type ComboOption = {
  id: string;
  name: string;
  productId?: number;
  singleUnitPrice?: number;
  singlePriceLabel?: string;
};`,
    "ComboOption"
  );

  core = replaceOnce(
    core,
`type ComboPlan = {
  id: string;
  label: string;
  requiredQuantity: number;
  price: number;
  priceLabel: string;
  note?: string;
};`,
`export type ComboPlan = {
  id: string;
  label: string;
  requiredQuantity: number;
  price: number;
  priceLabel: string;
  note?: string;
  buyQuantity?: number;
  freeQuantity?: number;
  bonusGift?: {
    name: string;
    quantity: number;
    unitLabel?: string;
  };
};`,
    "ComboPlan"
  );

  core = replaceOnce(
    core,
`export type ComboConfig = {
  productId: number;
  unitLabel: string;`,
`export type ComboConfig = {
  productId: number;
  type?: "mix_match" | "buy_get";
  unitLabel: string;
  allowSameProduct?: boolean;`,
    "ComboConfig"
  );
}

/* =====================================================
   B. ProductWriteInput 加入 comboConfig
===================================================== */

if (!repo.includes("comboConfig?: ComboConfig;")) {
  repo = replaceOnce(
    repo,
`  expandedInfo: NonNullable<Product["expandedInfo"]>;
  status: ProductStatus;`,
`  expandedInfo: NonNullable<Product["expandedInfo"]>;
  comboConfig?: ComboConfig;
  status: ProductStatus;`,
    "ProductWriteInput.comboConfig"
  );
}

/* =====================================================
   C. DB 讀回時補上 productId
   migration JSON 本身沒有 productId，因此以商品 id 為準
===================================================== */

repo = repo.replace(
`    comboConfig: row.combo_config ?? undefined,`,
`    comboConfig: row.combo_config
      ? {
          ...row.combo_config,
          productId: row.id,
        }
      : undefined,`
);

/* =====================================================
   D. INSERT 支援 combo_config
===================================================== */

if (!repo.includes("gallery, expanded_info, combo_config,")) {
  repo = replaceOnce(
    repo,
`            features, suitable_for, usage, notice, gallery, expanded_info,
            status, sort_order, updated_at`,
`            features, suitable_for, usage, notice, gallery, expanded_info, combo_config,
            status, sort_order, updated_at`,
    "INSERT columns"
  );

  repo = replaceOnce(
    repo,
`            $17::jsonb,$18::jsonb,$19,$20,$21::jsonb,$22::jsonb,$23,$24,NOW()`,
`            $17::jsonb,$18::jsonb,$19,$20,$21::jsonb,$22::jsonb,$23::jsonb,$24,$25,NOW()`,
    "INSERT placeholders"
  );

  repo = replaceOnce(
    repo,
`          JSON.stringify(input.gallery ?? []),
          JSON.stringify(input.expandedInfo ?? []),
          input.status,
          input.sortOrder,`,
`          JSON.stringify(input.gallery ?? []),
          JSON.stringify(input.expandedInfo ?? []),
          input.comboConfig ? JSON.stringify(input.comboConfig) : null,
          input.status,
          input.sortOrder,`,
    "INSERT parameters"
  );
}

/* =====================================================
   E. UPDATE 支援 combo_config

   重點：
   一般商品編輯表單沒有送 comboConfig 時，
   COALESCE 會保留原本資料，不會把現有組合設定清掉。
===================================================== */

if (!repo.includes("combo_config = COALESCE($23::jsonb, combo_config)")) {
  repo = replaceOnce(
    repo,
`        gallery = $21::jsonb,
        expanded_info = $22::jsonb,
        status = $23,
        sort_order = $24,`,
`        gallery = $21::jsonb,
        expanded_info = $22::jsonb,
        combo_config = COALESCE($23::jsonb, combo_config),
        status = $24,
        sort_order = $25,`,
    "UPDATE columns"
  );

  repo = replaceOnce(
    repo,
`      JSON.stringify(input.gallery ?? []),
      JSON.stringify(input.expandedInfo ?? []),
      input.status,
      input.sortOrder,`,
`      JSON.stringify(input.gallery ?? []),
      JSON.stringify(input.expandedInfo ?? []),
      input.comboConfig ? JSON.stringify(input.comboConfig) : null,
      input.status,
      input.sortOrder,`,
    "UPDATE parameters"
  );
}

/* =====================================================
   F. Server Action 解析 comboConfig
===================================================== */

if (!actions.includes("function parseComboConfig(")) {
  const marker =
`function parseSortOrder(value: string) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}`;

  const replacement =
`${marker}

function parseComboConfig(
  formData: FormData
): ProductWriteInput["comboConfig"] {
  const raw = stringValue(formData, "comboConfig");
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw) as ProductWriteInput["comboConfig"];

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.unitLabel ||
      !Array.isArray(parsed.options) ||
      !Array.isArray(parsed.plans)
    ) {
      throw new Error("invalid combo config");
    }

    return parsed;
  } catch {
    throw new Error("組合價設定格式無效");
  }
}`;

  actions = replaceOnce(
    actions,
    marker,
    replacement,
    "parseComboConfig"
  );
}

if (!actions.includes("comboConfig: parseComboConfig(formData)")) {
  actions = replaceOnce(
    actions,
`    expandedInfo: expandedInfoValues(formData),
    status: parseStatus(stringValue(formData, "status")),`,
`    expandedInfo: expandedInfoValues(formData),
    comboConfig: parseComboConfig(formData),
    status: parseStatus(stringValue(formData, "status")),`,
    "productInputFromForm.comboConfig"
  );
}

fs.writeFileSync(corePath, core, "utf8");
fs.writeFileSync(repoPath, repo, "utf8");
fs.writeFileSync(actionPath, actions, "utf8");

console.log("✅ ComboConfig 型別已補齊");
console.log("✅ ProductWriteInput 已支援 comboConfig");
console.log("✅ INSERT 已能建立組合設定");
console.log("✅ UPDATE 已能修改組合設定");
console.log("✅ 一般商品儲存不會清掉既有組合設定");
console.log("✅ Server Action 已能解析 comboConfig");
