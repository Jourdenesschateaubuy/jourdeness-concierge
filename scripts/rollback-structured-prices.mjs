import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;
const outputDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : null;

if (!outputDir) {
  throw new Error("請提供 structured-price-migration-* 輸出資料夾路徑");
}

const products = JSON.parse(
  await fs.readFile(path.join(outputDir, "products-before.json"), "utf8")
);
const metadata = JSON.parse(
  await fs.readFile(path.join(outputDir, "migration-metadata.json"), "utf8")
);

const client = new Client({ connectionString: loadDatabaseUrl() });

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("LOCK TABLE products IN EXCLUSIVE MODE");

  for (const product of products) {
    await client.query(
      `
        UPDATE products
        SET
          original_price = $2,
          price = $3,
          price_note = $4,
          sale_price_amount = $5,
          original_price_amount = $6,
          promotion_text = $7,
          updated_at = $8
        WHERE id = $1
      `,
      [
        product.id,
        product.original_price,
        product.price,
        product.price_note,
        product.sale_price_amount ?? null,
        product.original_price_amount ?? null,
        product.promotion_text ?? null,
        product.updated_at,
      ]
    );
  }

  await client.query(`
    ALTER TABLE products
      DROP CONSTRAINT IF EXISTS products_sale_price_amount_positive,
      DROP CONSTRAINT IF EXISTS products_original_price_amount_positive
  `);

  const before = metadata.columnsBeforeMigration ?? {};
  if (!before.sale_price_amount) {
    await client.query(`ALTER TABLE products DROP COLUMN IF EXISTS sale_price_amount`);
  }
  if (!before.original_price_amount) {
    await client.query(`ALTER TABLE products DROP COLUMN IF EXISTS original_price_amount`);
  }
  if (!before.promotion_text) {
    await client.query(`ALTER TABLE products DROP COLUMN IF EXISTS promotion_text`);
  }

  await client.query("COMMIT");
  console.log("商品價格資料已還原。");
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  console.error("商品價格還原失敗：");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
