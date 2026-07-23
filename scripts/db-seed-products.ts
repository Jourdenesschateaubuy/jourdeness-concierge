import { Client } from "pg";
import { products } from "../lib/storefront-core";
import { loadDatabaseUrl } from "./_load-env.mjs";

function json(value: unknown) {
  return JSON.stringify(value ?? []);
}

async function main() {
  const connectionString = loadDatabaseUrl();

  const client = new Client({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await client.connect();
    await client.query("BEGIN");

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      const status =
        product.category === "新品預告" ? "coming_soon" : "active";

      await client.query(
        `
          INSERT INTO products (
            id,
            name,
            category,
            series,
            original_price,
            price,
            image,
            description,
            card_name,
            card_subtitle,
            spec,
            intro,
            price_note,
            expiry_note,
            internal_expiry_date,
            features,
            suitable_for,
            usage,
            notice,
            gallery,
            expanded_info,
            status,
            sort_order,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
            $16::jsonb,$17::jsonb,$18,$19,$20::jsonb,$21::jsonb,$22,$23,NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            series = EXCLUDED.series,
            original_price = EXCLUDED.original_price,
            price = EXCLUDED.price,
            image = EXCLUDED.image,
            description = EXCLUDED.description,
            card_name = EXCLUDED.card_name,
            card_subtitle = EXCLUDED.card_subtitle,
            spec = EXCLUDED.spec,
            intro = EXCLUDED.intro,
            price_note = EXCLUDED.price_note,
            expiry_note = EXCLUDED.expiry_note,
            internal_expiry_date = EXCLUDED.internal_expiry_date,
            features = EXCLUDED.features,
            suitable_for = EXCLUDED.suitable_for,
            usage = EXCLUDED.usage,
            notice = EXCLUDED.notice,
            gallery = EXCLUDED.gallery,
            expanded_info = EXCLUDED.expanded_info,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW()
        `,
        [
          product.id,
          product.name,
          product.category,
          product.series,
          product.originalPrice ?? null,
          product.price,
          product.image,
          product.description,
          product.cardName ?? null,
          product.cardSubtitle ?? null,
          product.spec ?? null,
          product.intro ?? null,
          product.priceNote ?? null,
          product.expiryNote ?? null,
          product.internalExpiryDate ?? null,
          json(product.features),
          json(product.suitableFor),
          product.usage ?? null,
          product.notice ?? null,
          json(product.gallery),
          json(product.expandedInfo),
          status,
          index,
        ]
      );
    }

    await client.query("COMMIT");

    const result = await client.query(
      "SELECT COUNT(*)::int AS count FROM products"
    );

    console.log(
      `✅ 匯入完成：storefront ${products.length} 筆；資料庫目前 ${result.rows[0].count} 筆`
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("❌ 商品匯入失敗");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error("❌ 商品匯入程式啟動失敗");
  console.error(error);
  process.exitCode = 1;
});
