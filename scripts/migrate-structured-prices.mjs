import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

function normalizeMoney(value) {
  const clean = String(value ?? "").trim();
  if (!clean) return { amount: null, reason: "blank" };

  const values = [...clean.matchAll(/(?:NT\$|\$)?\s*([\d,]+)/gi)]
    .map((match) => Number(match[1].replaceAll(",", "")))
    .filter((amount) => Number.isSafeInteger(amount) && amount > 0);

  const distinct = [...new Set(values)];
  if (distinct.length === 1) {
    return { amount: distinct[0], reason: "single-value" };
  }

  if (distinct.length === 0) {
    return { amount: null, reason: "no-value" };
  }

  return { amount: null, reason: "multiple-values", values: distinct };
}

function money(amount) {
  return Number(amount).toLocaleString("en-US");
}

function formatStandardPrice(amount, category) {
  const label = category === "外部廠商" ? "售價" : "產地價";
  return `${label} $ ${money(amount)}`;
}

function formatOriginalPrice(amount) {
  return amount ? `原價 $ ${money(amount)}` : null;
}

function formatComboPrice(config, fallback) {
  if (!config || !Array.isArray(config.plans)) return fallback;
  const unitLabel = String(config.unitLabel || "件").trim() || "件";

  if (config.type === "fixed_bundle") {
    const plan = config.plans.find(
      (item) => Number.isFinite(Number(item.price)) && Number(item.price) > 0
    );
    return plan ? `組合價 $${money(plan.price)}` : fallback;
  }

  const parts = [];
  if (
    Number.isFinite(Number(config.singleUnitPrice)) &&
    Number(config.singleUnitPrice) > 0
  ) {
    parts.push(`單${unitLabel} $${money(config.singleUnitPrice)}`);
  }

  for (const plan of config.plans) {
    const price = Number(plan.price);
    if (!Number.isFinite(price) || price <= 0) continue;

    if (config.type === "buy_get") {
      const required = Number(plan.requiredQuantity) || 1;
      const buy = Number(plan.buyQuantity) || Math.max(required - 1, 1);
      const free = Number(plan.freeQuantity) || 1;
      parts.push(`買${buy}送${free} $${money(price)}`);
    } else {
      parts.push(`任選${plan.requiredQuantity}${unitLabel} $${money(price)}`);
    }
  }

  return parts.length ? parts.join("｜") : fallback;
}

async function columnExists(client, columnName) {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'products'
          AND column_name = $1
      ) AS exists
    `,
    [columnName]
  );
  return Boolean(result.rows[0]?.exists);
}

const connectionString = loadDatabaseUrl();
const client = new Client({ connectionString });
const now = new Date();
const stamp = now
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+$/, "")
  .replace("T", "-");
const outputDir = path.resolve(
  process.cwd(),
  "outputs",
  `structured-price-migration-${stamp}`
);
await fs.mkdir(outputDir, { recursive: true });

const columns = [
  "sale_price_amount",
  "original_price_amount",
  "promotion_text",
];

try {
  await client.connect();

  const beforeColumns = {};
  for (const column of columns) {
    beforeColumns[column] = await columnExists(client, column);
  }

  const beforeResult = await client.query(`SELECT * FROM products ORDER BY id`);
  await fs.writeFile(
    path.join(outputDir, "products-before.json"),
    JSON.stringify(beforeResult.rows, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(outputDir, "migration-metadata.json"),
    JSON.stringify(
      {
        generatedAt: now.toISOString(),
        columnsBeforeMigration: beforeColumns,
      },
      null,
      2
    ),
    "utf8"
  );

  await client.query("BEGIN");
  await client.query("LOCK TABLE products IN EXCLUSIVE MODE");
  await client.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS sale_price_amount INTEGER,
      ADD COLUMN IF NOT EXISTS original_price_amount INTEGER,
      ADD COLUMN IF NOT EXISTS promotion_text TEXT
  `);

  const productsResult = await client.query(`
    SELECT
      id, display_code, product_type, name, category,
      original_price, price, price_note, combo_config,
      status
    FROM products
    ORDER BY id
  `);

  const reportRows = [];
  let standardStructured = 0;
  let standardUnresolved = 0;
  let comboStructured = 0;

  for (const product of productsResult.rows) {
    const original = normalizeMoney(product.original_price);
    const promotionText = String(product.price_note ?? "").trim() || null;

    if (product.product_type === "combo") {
      const comboPrice = formatComboPrice(product.combo_config, product.price);

      await client.query(
        `
          UPDATE products
          SET
            sale_price_amount = NULL,
            original_price_amount = $2,
            promotion_text = $3,
            original_price = $4,
            price = $5,
            price_note = $3,
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          product.id,
          original.amount,
          promotionText,
          formatOriginalPrice(original.amount),
          comboPrice,
        ]
      );

      comboStructured += 1;
      reportRows.push({
        id: product.id,
        displayCode: product.display_code,
        productType: "combo",
        name: product.name,
        result: "combo-config-authoritative",
        salePriceAmount: null,
        originalPriceAmount: original.amount,
        legacyPriceAfter: comboPrice,
      });
      continue;
    }

    const sale = normalizeMoney(product.price);
    const isInquiry = /洽詢|詢價|請洽/i.test(String(product.price ?? ""));
    const canStructure = Boolean(sale.amount);

    await client.query(
      `
        UPDATE products
        SET
          sale_price_amount = $2,
          original_price_amount = $3,
          promotion_text = $4,
          original_price = $5,
          price = $6,
          price_note = $4,
          updated_at = NOW()
        WHERE id = $1
      `,
      [
        product.id,
        sale.amount,
        original.amount,
        promotionText,
        formatOriginalPrice(original.amount),
        canStructure
          ? formatStandardPrice(sale.amount, product.category)
          : product.price,
      ]
    );

    if (canStructure) standardStructured += 1;
    else standardUnresolved += 1;

    reportRows.push({
      id: product.id,
      displayCode: product.display_code,
      productType: "standard",
      name: product.name,
      status: product.status,
      result: canStructure
        ? "structured"
        : isInquiry
          ? "kept-as-inquiry"
          : "needs-review",
      saleParseReason: sale.reason,
      saleCandidates: sale.values ?? [],
      salePriceAmount: sale.amount,
      originalPriceAmount: original.amount,
      legacyPriceBefore: product.price,
      legacyPriceAfter: canStructure
        ? formatStandardPrice(sale.amount, product.category)
        : product.price,
    });
  }

  await client.query(`
    ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_sale_price_amount_positive,
      DROP CONSTRAINT IF EXISTS products_original_price_amount_positive
  `);
  await client.query(`
    ALTER TABLE products
      ADD CONSTRAINT products_sale_price_amount_positive
        CHECK (sale_price_amount IS NULL OR sale_price_amount > 0),
      ADD CONSTRAINT products_original_price_amount_positive
        CHECK (original_price_amount IS NULL OR original_price_amount > 0)
  `);

  await client.query("COMMIT");

  const summary = {
    generatedAt: now.toISOString(),
    totalProducts: reportRows.length,
    standardStructured,
    standardUnresolved,
    comboStructured,
    databaseWritePerformed: true,
  };

  const markdown = [
    "# Jourdeness 商品價格結構化遷移報告",
    "",
    `- 一般商品成功結構化：${standardStructured}`,
    `- 一般商品待人工確認：${standardUnresolved}`,
    `- 組合商品由 comboConfig 管理：${comboStructured}`,
    "- 售價欄位：sale_price_amount",
    "- 原價欄位：original_price_amount",
    "- 促銷文字欄位：promotion_text",
    "- 舊 price／original_price／price_note 保留並同步，供現有前台與回滾使用。",
    "",
    "## 待人工確認",
    "",
    ...reportRows
      .filter((item) => item.result === "needs-review")
      .map(
        (item) =>
          `- ${item.displayCode} ${item.name}：${item.legacyPriceBefore}`
      ),
    "",
  ].join("\n");

  try {
    await Promise.all([
      fs.writeFile(
        path.join(outputDir, "structured-price-report.json"),
        JSON.stringify({ summary, products: reportRows }, null, 2),
        "utf8"
      ),
      fs.writeFile(
        path.join(outputDir, "商品價格結構化報告.md"),
        markdown,
        "utf8"
      ),
    ]);
  } catch (reportError) {
    console.warn("資料庫已完成遷移，但報告檔寫入失敗：");
    console.warn(reportError);
  }

  console.log("");
  console.log("商品價格結構化遷移完成。");
  console.log(`一般商品成功結構化：${standardStructured}`);
  console.log(`一般商品待人工確認：${standardUnresolved}`);
  console.log(`組合商品由 comboConfig 管理：${comboStructured}`);
  console.log(`輸出報告：${outputDir}`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("商品價格結構化遷移失敗：");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
