import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

const projectRoot = process.cwd();
const backupDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : "";

if (!backupDir) {
  throw new Error(
    "請提供遷移輸出資料夾，例如：node scripts/rollback-product-codes-combos.mjs outputs/product-code-combo-migration-日期時間"
  );
}

const beforeProductsPath = path.join(
  backupDir,
  "before-products.json"
);
const beforeSeriesPath = path.join(
  backupDir,
  "before-series.json"
);

if (
  !fs.existsSync(beforeProductsPath) ||
  !fs.existsSync(beforeSeriesPath)
) {
  throw new Error("指定資料夾缺少 before-products.json 或 before-series.json");
}

const beforeProducts = JSON.parse(
  fs.readFileSync(beforeProductsPath, "utf8")
);
const beforeSeries = JSON.parse(
  fs.readFileSync(beforeSeriesPath, "utf8")
);

const client = new Client({
  connectionString: loadDatabaseUrl(),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  await client.connect();
  await client.query("BEGIN");

  try {
    await client.query("LOCK TABLE products IN EXCLUSIVE MODE");
    await client.query("LOCK TABLE catalog_series IN EXCLUSIVE MODE");

    const originalIds = new Set(
      beforeProducts.map((item) => Number(item.id))
    );

    const currentProbiotic = await client.query(
      `SELECT id FROM products WHERE name = '玻尿酸益生菌'`
    );

    for (const row of currentProbiotic.rows) {
      if (!originalIds.has(Number(row.id))) {
        await client.query(`DELETE FROM products WHERE id = $1`, [row.id]);
      }
    }

    for (const item of beforeProducts) {
      await client.query(
        `UPDATE products
         SET sku = $2,
             name = $3,
             category = $4,
             series = $5,
             storefront_category = $6,
             original_price = $7,
             price = $8,
             image = $9,
             description = $10,
             card_name = $11,
             card_subtitle = $12,
             spec = $13,
             intro = $14,
             price_note = $15,
             expiry_note = $16,
             internal_expiry_date = $17,
             features = $18::jsonb,
             suitable_for = $19::jsonb,
             usage = $20,
             notice = $21,
             gallery = $22::jsonb,
             expanded_info = $23::jsonb,
             combo_config = $24::jsonb,
             status = $25,
             sort_order = $26,
             updated_at = $27
         WHERE id = $1`,
        [
          item.id,
          item.sku,
          item.name,
          item.category,
          item.series,
          item.storefront_category,
          item.original_price,
          item.price,
          item.image,
          item.description,
          item.card_name,
          item.card_subtitle,
          item.spec,
          item.intro,
          item.price_note,
          item.expiry_note,
          item.internal_expiry_date,
          JSON.stringify(item.features ?? []),
          JSON.stringify(item.suitable_for ?? []),
          item.usage,
          item.notice,
          JSON.stringify(item.gallery ?? []),
          JSON.stringify(item.expanded_info ?? []),
          item.combo_config
            ? JSON.stringify(item.combo_config)
            : null,
          item.status,
          item.sort_order,
          item.updated_at,
        ]
      );
    }

    for (const item of beforeSeries) {
      await client.query(
        `UPDATE catalog_series
         SET category_id = $2,
             name = $3,
             sort_order = $4,
             is_active = $5,
             updated_at = $6
         WHERE id = $1`,
        [
          item.id,
          item.category_id,
          item.name,
          item.sort_order,
          item.is_active,
          item.updated_at,
        ]
      );
    }

    await client.query(`
      DROP INDEX IF EXISTS products_display_code_unique;
      DROP INDEX IF EXISTS catalog_series_display_code_unique;

      ALTER TABLE products
        DROP CONSTRAINT IF EXISTS products_product_type_check;

      ALTER TABLE products
        DROP COLUMN IF EXISTS display_code,
        DROP COLUMN IF EXISTS product_type;

      ALTER TABLE catalog_series
        DROP COLUMN IF EXISTS display_code;

      DROP SEQUENCE IF EXISTS product_standard_code_seq;
      DROP SEQUENCE IF EXISTS product_combo_code_seq;
      DROP SEQUENCE IF EXISTS catalog_series_code_seq;
    `);

    await client.query("COMMIT");
    console.log("資料庫已還原到遷移前狀態。");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error("還原失敗：");
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
