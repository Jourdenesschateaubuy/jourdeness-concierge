import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadDatabaseUrl } from "./_load-env.mjs";

const { Client } = pg;

const projectRoot = process.cwd();
const connectionString = loadDatabaseUrl();
const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .replace(/\..+$/, "")
  .replace("T", "-");
const outputDir = path.join(
  projectRoot,
  "outputs",
  `product-code-combo-migration-${timestamp}`
);

const comboIds = [
  1, 10, 51, 54, 55, 56, 58, 59, 67, 68, 69, 100, 108, 112, 119, 120,
];

const comboStorefrontCategories = new Map([
  [1, "健康補給"],
  [10, "臉部保養"],
  [51, "身體洗護"],
  [54, "身體洗護"],
  [55, "臉部保養"],
  [56, "健康補給"],
  [58, "健康補給"],
  [59, "臉部保養"],
  [67, "身體洗護"],
  [68, "臉部保養"],
  [69, "健康補給"],
  [100, "精油香氛"],
  [108, "身體洗護"],
  [112, "身體洗護"],
  [119, "身體洗護"],
  [120, "臉部保養"],
]);

function readEnvValue(name) {
  if (process.env[name]?.trim()) return process.env[name].trim();
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return "";
  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!line) return "";
  let value = line.slice(name.length + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value;
}

function findFile(root, targetName) {
  if (!root || !fs.existsSync(root)) return "";
  const stack = [root];
  const target = targetName.toLowerCase();
  let scanned = 0;

  while (stack.length > 0 && scanned < 20000) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      scanned += 1;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase() === target) {
        return fullPath;
      }
    }
  }

  return "";
}

function publicUrlForFile(filePath, uploadRoot) {
  if (!filePath) return "";
  const normalizedFile = path.resolve(filePath);

  if (uploadRoot) {
    const normalizedUpload = path.resolve(uploadRoot);
    const relative = path.relative(normalizedUpload, normalizedFile);
    if (
      relative &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative)
    ) {
      return `/api/uploads/${relative.split(path.sep).join("/")}`;
    }
  }

  const publicRoot = path.join(projectRoot, "public");
  const publicRelative = path.relative(publicRoot, normalizedFile);
  if (
    publicRelative &&
    !publicRelative.startsWith("..") &&
    !path.isAbsolute(publicRelative)
  ) {
    return `/${publicRelative.split(path.sep).join("/")}`;
  }

  return "";
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}

function fixedBundleConfig(productId, unitLabel, options, price, note, bonusGift) {
  return {
    productId,
    type: "fixed_bundle",
    unitLabel,
    allowSameProduct: false,
    options,
    plans: [
      {
        id: "fixed-bundle",
        label: "固定套組",
        requiredQuantity: Math.max(
          options.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
          1
        ),
        price,
        priceLabel: formatMoney(price),
        note,
        ...(bonusGift ? { bonusGift } : {}),
      },
    ],
    note,
  };
}

function buyGetConfig(productId, unitLabel, option, price, note) {
  return {
    productId,
    type: "buy_get",
    unitLabel,
    allowSameProduct: true,
    options: [option],
    plans: [
      {
        id: "buy-one-get-one",
        label: "買 1 送 1",
        requiredQuantity: 2,
        buyQuantity: 1,
        freeQuantity: 1,
        price,
        priceLabel: formatMoney(price),
        note,
      },
    ],
    note,
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const client = new Client({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  await client.connect();

  try {
    const beforeProducts = await client.query(`
      SELECT * FROM products ORDER BY id ASC
    `);
    const beforeSeries = await client.query(`
      SELECT * FROM catalog_series ORDER BY id ASC
    `);

    fs.writeFileSync(
      path.join(outputDir, "before-products.json"),
      JSON.stringify(beforeProducts.rows, null, 2),
      "utf8"
    );
    fs.writeFileSync(
      path.join(outputDir, "before-series.json"),
      JSON.stringify(beforeSeries.rows, null, 2),
      "utf8"
    );

    const existingImage = await client.query(
      `SELECT image FROM products WHERE LOWER(image) LIKE '%bc-ha.jpg' LIMIT 1`
    );

    const uploadRoot = readEnvValue("UPLOAD_ROOT");
    let bcHaImageUrl = existingImage.rows[0]?.image ?? "";

    if (!bcHaImageUrl) {
      const directCandidates = [
        uploadRoot ? path.join(uploadRoot, "products", "BC-HA.jpg") : "",
        path.join(projectRoot, "public", "products", "BC-HA.jpg"),
        path.join(projectRoot, "public", "images", "BC-HA.jpg"),
        path.join(projectRoot, "public", "BC-HA.jpg"),
      ].filter(Boolean);

      const directFile = directCandidates.find((candidate) =>
        fs.existsSync(candidate)
      );
      const foundFile =
        directFile ||
        findFile(uploadRoot, "BC-HA.jpg") ||
        findFile(path.join(projectRoot, "public"), "BC-HA.jpg");

      bcHaImageUrl = publicUrlForFile(foundFile, uploadRoot);
    }

    if (!bcHaImageUrl) {
      throw new Error(
        "找不到 BC-HA.jpg。請先將圖片放到 UPLOAD_ROOT\\products 或專案 public\\products，再重新執行。"
      );
    }

    await client.query("BEGIN");
    await client.query("LOCK TABLE products IN EXCLUSIVE MODE");
    await client.query("LOCK TABLE catalog_series IN EXCLUSIVE MODE");

    await client.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS product_type TEXT,
        ADD COLUMN IF NOT EXISTS display_code TEXT;

      ALTER TABLE catalog_series
        ADD COLUMN IF NOT EXISTS display_code TEXT;

      CREATE SEQUENCE IF NOT EXISTS product_standard_code_seq START 1;
      CREATE SEQUENCE IF NOT EXISTS product_combo_code_seq START 1;
      CREATE SEQUENCE IF NOT EXISTS catalog_series_code_seq START 1;
    `);

    await client.query(
      `UPDATE products
       SET product_type = CASE WHEN id = ANY($1::int[]) THEN 'combo' ELSE 'standard' END`,
      [comboIds]
    );

    for (const [productId, storefrontCategory] of comboStorefrontCategories) {
      await client.query(
        `UPDATE products
         SET storefront_category = $2, updated_at = NOW()
         WHERE id = $1`,
        [productId, storefrontCategory]
      );
    }

    await client.query(`
      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS number
        FROM products
        WHERE product_type = 'standard'
          AND (display_code IS NULL OR display_code = '')
      )
      UPDATE products p
      SET display_code = 'P-' || LPAD(ranked.number::text, 4, '0')
      FROM ranked
      WHERE p.id = ranked.id;

      WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY id ASC) AS number
        FROM products
        WHERE product_type = 'combo'
          AND (display_code IS NULL OR display_code = '')
      )
      UPDATE products p
      SET display_code = 'C-' || LPAD(ranked.number::text, 4, '0')
      FROM ranked
      WHERE p.id = ranked.id;

      WITH ranked AS (
        SELECT
          s.id,
          ROW_NUMBER() OVER (
            ORDER BY c.sort_order ASC, c.id ASC, s.sort_order ASC, s.id ASC
          ) AS number
        FROM catalog_series s
        JOIN catalog_categories c ON c.id = s.category_id
        WHERE s.display_code IS NULL OR s.display_code = ''
      )
      UPDATE catalog_series s
      SET display_code = 'S-' || LPAD(ranked.number::text, 3, '0')
      FROM ranked
      WHERE s.id = ranked.id;
    `);

    await client.query(`
      ALTER TABLE products
        ALTER COLUMN product_type SET DEFAULT 'standard';

      UPDATE products SET product_type = 'standard' WHERE product_type IS NULL;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'products_product_type_check'
        ) THEN
          ALTER TABLE products
            ADD CONSTRAINT products_product_type_check
            CHECK (product_type IN ('standard', 'combo'));
        END IF;
      END $$;

      CREATE UNIQUE INDEX IF NOT EXISTS products_display_code_unique
        ON products(display_code);
      CREATE UNIQUE INDEX IF NOT EXISTS catalog_series_display_code_unique
        ON catalog_series(display_code);

      ALTER TABLE products
        ALTER COLUMN product_type SET NOT NULL,
        ALTER COLUMN display_code SET NOT NULL;
      ALTER TABLE catalog_series
        ALTER COLUMN display_code SET NOT NULL;
    `);

    const standardMax = await client.query(`
      SELECT COALESCE(MAX(SUBSTRING(display_code FROM 3)::int), 0) AS value
      FROM products WHERE product_type = 'standard'
    `);
    const comboMax = await client.query(`
      SELECT COALESCE(MAX(SUBSTRING(display_code FROM 3)::int), 0) AS value
      FROM products WHERE product_type = 'combo'
    `);
    const seriesMax = await client.query(`
      SELECT COALESCE(MAX(SUBSTRING(display_code FROM 3)::int), 0) AS value
      FROM catalog_series
    `);

    const standardValue = Number(standardMax.rows[0]?.value ?? 0);
    const comboValue = Number(comboMax.rows[0]?.value ?? 0);
    const seriesValue = Number(seriesMax.rows[0]?.value ?? 0);

    await client.query(
      `SELECT setval('product_standard_code_seq', $1, $2)`,
      [Math.max(standardValue, 1), standardValue > 0]
    );
    await client.query(
      `SELECT setval('product_combo_code_seq', $1, $2)`,
      [Math.max(comboValue, 1), comboValue > 0]
    );
    await client.query(
      `SELECT setval('catalog_series_code_seq', $1, $2)`,
      [Math.max(seriesValue, 1), seriesValue > 0]
    );

    const probioticSeriesResult = await client.query(`
      SELECT s.name
      FROM catalog_series s
      JOIN catalog_categories c ON c.id = s.category_id
      WHERE c.name = '健康補給'
        AND s.name IN ('益生菌', '益生菌系列')
      ORDER BY CASE WHEN s.name = '益生菌' THEN 0 ELSE 1 END, s.id ASC
      LIMIT 1
    `);
    const probioticSeries = probioticSeriesResult.rows[0]?.name ?? "";

    let probiotic = await client.query(
      `SELECT id, display_code FROM products WHERE name = $1 ORDER BY id ASC LIMIT 1`,
      ["玻尿酸益生菌"]
    );

    let probioticId;
    let probioticDisplayCode;

    if (probiotic.rows[0]) {
      probioticId = Number(probiotic.rows[0].id);
      probioticDisplayCode = probiotic.rows[0].display_code;

      await client.query(
        `UPDATE products
         SET product_type = 'standard',
             category = '健康補給',
             storefront_category = '健康補給',
             series = $3,
             original_price = '原價 $ 1,500',
             price = '產地價 $ 1,300',
             image = $2,
             card_name = '玻尿酸益生菌',
             spec = '1盒',
             status = 'active',
             combo_config = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [probioticId, bcHaImageUrl, probioticSeries]
      );
    } else {
      const idResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM products`
      );
      probioticId = Number(idResult.rows[0]?.id ?? 1);
      const codeResult = await client.query(
        `SELECT nextval('product_standard_code_seq') AS value`
      );
      probioticDisplayCode = `P-${String(
        Number(codeResult.rows[0]?.value ?? 1)
      ).padStart(4, "0")}`;
      const sortResult = await client.query(
        `SELECT COALESCE(MAX(sort_order), 0) + 1 AS value FROM products`
      );
      const sortOrder = Number(sortResult.rows[0]?.value ?? 1);

      await client.query(
        `INSERT INTO products (
          id, display_code, product_type, sku, name, category, series,
          storefront_category, original_price, price, image, description,
          card_name, card_subtitle, spec, intro, price_note, expiry_note,
          internal_expiry_date, features, suitable_for, usage, notice,
          gallery, expanded_info, combo_config, status, sort_order, updated_at
        ) VALUES (
          $1,$2,'standard',NULL,'玻尿酸益生菌','健康補給',$3,
          '健康補給','原價 $ 1,500','產地價 $ 1,300',$4,
          '玻尿酸益生菌單盒商品。','玻尿酸益生菌',NULL,'1盒',NULL,NULL,NULL,
          NULL,'[]'::jsonb,'[]'::jsonb,NULL,NULL,'[]'::jsonb,'[]'::jsonb,
          NULL,'active',$5,NOW()
        )`,
        [probioticId, probioticDisplayCode, probioticSeries, bcHaImageUrl, sortOrder]
      );
    }

    const requiredLinks = [3, 15, 33, 35, 36, 47, 48, 49, 57];
    const linkedProducts = await client.query(
      `SELECT id, name FROM products WHERE id = ANY($1::int[])`,
      [requiredLinks]
    );
    const foundLinks = new Set(linkedProducts.rows.map((row) => Number(row.id)));
    const missingLinks = requiredLinks.filter((id) => !foundLinks.has(id));
    if (missingLinks.length > 0) {
      throw new Error(`缺少必要的內容商品 ID：${missingLinks.join("、")}`);
    }

    const comboConfigs = new Map([
      [
        10,
        buyGetConfig(
          10,
          "瓶",
          { id: "dragon-blood-repair-lotion", name: "龍血求麗修護乳", quantity: 1 },
          1290,
          "買一送一。"
        ),
      ],
      [
        56,
        buyGetConfig(
          56,
          "盒",
          { id: "epax-fish-oil", name: "挪威 EPAX 高活性 rTG 魚油軟膠囊", quantity: 1 },
          1580,
          "買一送一。"
        ),
      ],
      [
        58,
        fixedBundleConfig(
          58,
          "組",
          [
            {
              id: "hyaluronic-probiotic",
              name: "玻尿酸益生菌",
              productId: probioticId,
              quantity: 2,
            },
          ],
          2000,
          "玻尿酸益生菌 2 盒組。"
        ),
      ],
      [
        59,
        fixedBundleConfig(
          59,
          "組",
          [
            { id: "dragon-blood-cleansing-mousse", name: "龍血求麗潔顏慕絲", productId: 36, quantity: 1 },
            { id: "dragon-blood-cleansing-oil", name: "龍血求麗卸妝油", productId: 35, quantity: 1 },
          ],
          1080,
          "潔顏慕絲 1 瓶＋卸妝油 1 瓶。"
        ),
      ],
      [
        68,
        fixedBundleConfig(
          68,
          "組",
          [
            { id: "sakura-toner", name: "櫻の雪傳明酸美白化妝水", productId: 47, quantity: 1 },
            { id: "sakura-serum", name: "櫻の雪傳明酸美白精華液", productId: 48, quantity: 1 },
            { id: "sakura-lotion", name: "櫻の雪傳明酸美白乳液", productId: 49, quantity: 1 },
          ],
          1780,
          "櫻の雪傳明酸美白固定三件組。"
        ),
      ],
      [
        69,
        fixedBundleConfig(
          69,
          "組",
          [
            { id: "fish-collagen-drink", name: "亮妍魚膠原蛋白飲", productId: 3, quantity: 2 },
          ],
          4400,
          "亮妍魚膠原蛋白飲 2 盒，贈 EC 晶眸葉黃素 1 盒。",
          { name: "EC 晶眸葉黃素", quantity: 1, unitLabel: "盒" }
        ),
      ],
      [
        100,
        buyGetConfig(
          100,
          "片",
          { id: "diffuser-wood-chip", name: "擴香木片", quantity: 1 },
          199,
          "買一送一。"
        ),
      ],
      [
        112,
        fixedBundleConfig(
          112,
          "組",
          [
            { id: "dragon-blood-shampoo", name: "龍血求麗頭皮修護洗髮精", productId: 15, quantity: 1 },
            { id: "argan-scalp-treatment", name: "阿甘甦醒髮根養護液", productId: 57, quantity: 1 },
          ],
          1500,
          "龍血洗髮精＋阿甘甦醒髮根養護液固定套組。"
        ),
      ],
      [
        120,
        fixedBundleConfig(
          120,
          "組",
          [
            { id: "dragon-blood-serum-manual", name: "龍血求麗精華液", quantity: 1 },
            { id: "collagen-plumping-serum", name: "肌可佳膠原蛋白彈潤原液", productId: 33, quantity: 1 },
          ],
          1290,
          "龍血求麗精華液＋肌可佳膠原蛋白彈潤原液固定套組。"
        ),
      ],
    ]);

    const priceText = new Map([
      [10, "買1送1 $1,290"],
      [56, "買1送1 $1,580"],
      [58, "組合價 $2,000"],
      [59, "組合價 $1,080"],
      [68, "組合價 $1,780"],
      [69, "組合價 $4,400"],
      [100, "買1送1 $199"],
      [112, "組合價 $1,500"],
      [120, "組合價 $1,290"],
    ]);

    for (const [productId, config] of comboConfigs) {
      const result = await client.query(
        `UPDATE products
         SET product_type = 'combo',
             combo_config = $2::jsonb,
             price = $3,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [productId, JSON.stringify(config), priceText.get(productId)]
      );
      if (result.rowCount !== 1) {
        throw new Error(`找不到要遷移的組合商品 ID ${productId}`);
      }
    }

    const afterProducts = await client.query(`
      SELECT id, display_code, product_type, name, category, series,
             original_price, price, image, status, combo_config
      FROM products
      ORDER BY product_type ASC, display_code ASC
    `);
    const afterSeries = await client.query(`
      SELECT s.id, s.display_code, c.name AS category_name,
             s.name, s.sort_order, s.is_active
      FROM catalog_series s
      JOIN catalog_categories c ON c.id = s.category_id
      ORDER BY s.display_code ASC
    `);

    fs.writeFileSync(
      path.join(outputDir, "after-products.json"),
      JSON.stringify(afterProducts.rows, null, 2),
      "utf8"
    );
    fs.writeFileSync(
      path.join(outputDir, "after-series.json"),
      JSON.stringify(afterSeries.rows, null, 2),
      "utf8"
    );

    const standardCount = afterProducts.rows.filter(
      (item) => item.product_type === "standard"
    ).length;
    const comboCount = afterProducts.rows.filter(
      (item) => item.product_type === "combo"
    ).length;

    const report = [
      "# 商品編號與組合商品遷移結果",
      "",
      `- 一般商品：${standardCount} 筆`,
      `- 組合商品：${comboCount} 筆`,
      `- 系列編號：${afterSeries.rows.length} 筆`,
      `- 新增／更新單品：${probioticDisplayCode} 玻尿酸益生菌`,
      `- 圖片：${bcHaImageUrl}`,
      "- ID 69 贈品：EC 晶眸葉黃素 1 盒",
      "- ID 120：龍血求麗精華液保留手動品項，未錯綁 #34",
      "- 內部資料庫 ID 全部保留不變",
      "",
      "## 組合商品編號",
      "",
      ...afterProducts.rows
        .filter((item) => item.product_type === "combo")
        .map((item) => `- ${item.display_code}｜DB #${item.id}｜${item.name}`),
      "",
    ].join("\n");

    fs.writeFileSync(
      path.join(outputDir, "遷移結果.md"),
      report,
      "utf8"
    );

    await client.query("COMMIT");

    console.log("");
    console.log("商品編號與組合商品遷移完成。");
    console.log(`一般商品：${standardCount}`);
    console.log(`組合商品：${comboCount}`);
    console.log(`系列編號：${afterSeries.rows.length}`);
    console.log(`玻尿酸益生菌：${probioticDisplayCode}（DB #${probioticId}）`);
    console.log(`輸出報告：${outputDir}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error("");
  console.error("遷移失敗：");
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exitCode = 1;
});
