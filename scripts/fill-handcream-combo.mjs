import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

/* 讀取 .env.local，但不輸出任何密鑰 */
const envPath = path.resolve(".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ 找不到 .env.local");
  process.exit(1);
}

for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) continue;

  const equalIndex = line.indexOf("=");
  if (equalIndex <= 0) continue;

  const key = line.slice(0, equalIndex).trim();
  let value = line.slice(equalIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!(key in process.env)) {
    process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("❌ .env.local 找不到 DATABASE_URL");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

try {
  const result = await client.query(
    `
      SELECT id, name, combo_config
      FROM products
      WHERE id = $1
      LIMIT 1
    `,
    [108]
  );

  if (result.rowCount !== 1) {
    throw new Error("找不到 ID 108 商品");
  }

  const product = result.rows[0];
  const current = product.combo_config ?? {};

  /* 保留原本方案 ID，避免購物車識別不必要地改變 */
  const planId =
    current?.plans?.[0]?.id ??
    "hand-cream-buy-2-get-1";

  const comboConfig = {
    productId: 108,
    type: "buy_get",
    unitLabel: "條",
    allowSameProduct: true,

    singleUnitPrice: 290,
    singlePriceLabel: "單條 $290",

    options: [
      {
        id: "lavender-hand-cream",
        name: "薰衣草舒緩護手霜",
      },
      {
        id: "sakura-hand-cream",
        name: "櫻之雪亮澤護手霜",
      },
      {
        id: "tea-tree-hand-cream",
        name: "茶樹防禦護手霜",
      },
    ],

    plans: [
      {
        id: planId,
        label: "買二送一・共 3 條",
        requiredQuantity: 3,
        buyQuantity: 2,
        freeQuantity: 1,
        price: 580,
        priceLabel: "$580",
      },
    ],

    ...(current?.note
      ? { note: current.note }
      : {}),
  };

  await client.query(
    `
      UPDATE products
      SET
        combo_config = $1::jsonb,
        updated_at = NOW()
      WHERE id = $2
    `,
    [JSON.stringify(comboConfig), 108]
  );

  console.log("✅ 護手霜三款自由配 組合內容已直接寫入");
  console.log("✅ 單條 NT$290");
  console.log("✅ 薰衣草／櫻之雪／茶樹 共 3 款");
  console.log("✅ 買 2 送 1・共 3 條 NT$580");
  console.log("✅ 允許同款重複選擇");
  console.log("✅ 其他商品資料沒有修改");
} finally {
  await client.end();
}
