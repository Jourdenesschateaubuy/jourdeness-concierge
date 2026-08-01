const fs = require("fs");

const repositoryFile = "lib/product-repository.ts";
const actionsFile = "app/admin/products/actions.ts";

let repository = fs.readFileSync(repositoryFile, "utf8");
let actions = fs.readFileSync(actionsFile, "utf8");

// 1. 修改 createDatabaseProduct 函式參數
const signaturePattern =
  /export async function createDatabaseProduct\s*\(\s*input:\s*ProductWriteInput\s*\)\s*\{/;

if (!signaturePattern.test(repository)) {
  throw new Error("找不到 createDatabaseProduct 函式宣告");
}

repository = repository.replace(
  signaturePattern,
  `export async function createDatabaseProduct(
  input: ProductWriteInput,
  productType: "product" | "combo" = "product"
) {`
);

// 2. 在取得新 ID 後建立組合商品初始設定
const idPattern =
  /(const id\s*=\s*Number\(idResult\.rows\[0\]\?\.id\s*\?\?\s*1\);)/;

if (!idPattern.test(repository)) {
  throw new Error("找不到新商品 ID 計算程式");
}

repository = repository.replace(
  idPattern,
  `$1

      const comboConfig =
        input.comboConfig ??
        (productType === "combo"
          ? {
              productId: id,
              type: "mix_match" as const,
              unitLabel: "件",
              allowSameProduct: true,
              options: [],
              plans: [],
            }
          : undefined);`
);

// 3. INSERT 改用上述 comboConfig
const comboPattern =
  /input\.comboConfig\s*\?\s*JSON\.stringify\(input\.comboConfig\)\s*:\s*null,/;

if (!comboPattern.test(repository)) {
  throw new Error("找不到 INSERT 的 comboConfig 寫入程式");
}

repository = repository.replace(
  comboPattern,
  `comboConfig ? JSON.stringify(comboConfig) : null,`
);

// 4. createProductAction 讀取 productType
const actionPattern =
  /export async function createProductAction\(formData: FormData\)\s*\{\s*await requireAdmin\(\);\s*const product = await createDatabaseProduct\(\s*productInputFromForm\(formData\)\s*\);/;

if (!actionPattern.test(actions)) {
  throw new Error("找不到 createProductAction 原始程式");
}

actions = actions.replace(
  actionPattern,
  `export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const productType =
    stringValue(formData, "productType") === "combo"
      ? "combo"
      : "product";

  const product = await createDatabaseProduct(
    productInputFromForm(formData),
    productType
  );`
);

fs.writeFileSync(repositoryFile, repository, "utf8");
fs.writeFileSync(actionsFile, actions, "utf8");

console.log("✓ createDatabaseProduct 已支援商品類型");
console.log("✓ 組合商品會建立初始 comboConfig");
console.log("✓ 一般商品仍維持 comboConfig = null");
