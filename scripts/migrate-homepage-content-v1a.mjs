import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

function loadEnvLocal() {
  const envPath = path.resolve(
    process.cwd(),
    ".env.local"
  );

  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(
    envPath,
    "utf8"
  );

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index <= 0) continue;

    const key = line
      .slice(0, index)
      .trim();

    let value = line
      .slice(index + 1)
      .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const connectionString =
  process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL 尚未設定。請確認專案根目錄 .env.local。"
  );
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

const FALLBACKS = {
  "home-summer-whitening": {
    name: "夏日美白精選",
    description:
      "夏季亮白與透亮保養精選。",
    productIds: [68, 47, 48, 49, 110],
  },

  "home-body-care": {
    name: "身體洗護精選",
    description:
      "洗髮沐浴、牙膏、手工皂與身體保養集中選購。",
    productIds: [54, 67, 108, 119, 112],
    siteStudioKey: "bodyCare",
  },

  "home-health": {
    name: "健康補給精選",
    description:
      "益生菌、葉黃素、膠原蛋白與日常營養補給。",
    productIds: [1, 58, 2, 3, 69, 56],
    siteStudioKey: "health",
  },

  "home-aroma": {
    name: "精油香氛精選",
    description:
      "單方、複方精油與擴香選品，打造日常香氛儀式。",
    productIds: [85, 74, 79, 82, 75, 76],
    siteStudioKey: "aroma",
  },
};

function parseJson(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  return value;
}

function getConfiguredProductIds(
  siteStudioConfig,
  sectionKey,
  fallbackIds
) {
  if (!sectionKey) {
    return fallbackIds;
  }

  const sections =
    Array.isArray(siteStudioConfig?.sections)
      ? siteStudioConfig.sections
      : [];

  const match = sections.find(
    (section) => section?.key === sectionKey
  );

  const configuredIds =
    Array.isArray(match?.productIds)
      ? match.productIds
          .map(Number)
          .filter(Number.isInteger)
      : [];

  return configuredIds.length > 0
    ? configuredIds
    : fallbackIds;
}

async function filterExistingProducts(
  client,
  productIds
) {
  const unique = [
    ...new Set(
      productIds
        .map(Number)
        .filter(
          (id) =>
            Number.isInteger(id) &&
            id > 0
        )
    ),
  ];

  if (unique.length === 0) {
    return [];
  }

  const result = await client.query(
    `
      SELECT id
      FROM products
      WHERE id = ANY($1::int[])
    `,
    [unique]
  );

  const existing = new Set(
    result.rows.map(
      (row) => Number(row.id)
    )
  );

  return unique.filter(
    (id) => existing.has(id)
  );
}

async function ensureSection(
  client,
  {
    code,
    name,
    description,
    sortOrder,
  }
) {
  const result = await client.query(
    `
      INSERT INTO storefront_sections (
        code,
        name,
        description,
        section_type,
        is_active,
        sort_order,
        layout_type,
        desktop_columns,
        mobile_columns,
        max_items,
        background_style,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        'homepage',
        TRUE,
        $4,
        'grid',
        4,
        2,
        8,
        'default',
        NOW()
      )
      ON CONFLICT (code)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        section_type = 'homepage',
        layout_type = 'grid',
        updated_at = NOW()
      RETURNING id
    `,
    [
      code,
      name,
      description,
      sortOrder,
    ]
  );

  const id = Number(
    result.rows[0]?.id
  );

  if (!id) {
    throw new Error(
      `建立首頁區塊失敗：${code}`
    );
  }

  return id;
}

async function syncSectionItems(
  client,
  sectionId,
  productIds
) {
  for (
    let index = 0;
    index < productIds.length;
    index += 1
  ) {
    const productId =
      productIds[index];

    await client.query(
      `
        INSERT INTO storefront_section_items (
          section_id,
          product_id,
          sort_order,
          is_visible,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          TRUE,
          NOW()
        )
        ON CONFLICT (
          section_id,
          product_id
        )
        DO UPDATE SET
          sort_order =
            EXCLUDED.sort_order,
          is_visible = TRUE,
          updated_at = NOW()
      `,
      [
        sectionId,
        productId,
        index + 1,
      ]
    );
  }

  if (productIds.length === 0) {
    await client.query(
      `
        DELETE FROM
          storefront_section_items
        WHERE section_id = $1
      `,
      [sectionId]
    );

    return;
  }

  await client.query(
    `
      DELETE FROM
        storefront_section_items
      WHERE section_id = $1
        AND NOT (
          product_id =
          ANY($2::int[])
        )
    `,
    [
      sectionId,
      productIds,
    ]
  );
}

async function main() {
  const client =
    await pool.connect();

  try {
    await client.query("BEGIN");

    const siteStudioResult =
      await client.query(
        `
          SELECT value
          FROM site_studio_content
          WHERE content_key = 'homepage'
          LIMIT 1
        `
      );

    const siteStudioConfig =
      parseJson(
        siteStudioResult.rows[0]?.value
      );

    const maxSortResult =
      await client.query(
        `
          SELECT
            COALESCE(
              MAX(sort_order),
              0
            ) AS max_sort
          FROM storefront_sections
          WHERE section_type = 'homepage'
        `
      );

    const startSort =
      Number(
        maxSortResult.rows[0]
          ?.max_sort ?? 0
      );

    const entries =
      Object.entries(FALLBACKS);

    const summary = [];

    for (
      let index = 0;
      index < entries.length;
      index += 1
    ) {
      const [code, config] =
        entries[index];

      const sourceIds =
        getConfiguredProductIds(
          siteStudioConfig,
          config.siteStudioKey,
          config.productIds
        );

      const productIds =
        await filterExistingProducts(
          client,
          sourceIds
        );

      const sectionId =
        await ensureSection(
          client,
          {
            code,
            name: config.name,
            description:
              config.description,
            sortOrder:
              startSort +
              (index + 1) * 10,
          }
        );

      await syncSectionItems(
        client,
        sectionId,
        productIds
      );

      summary.push({
        code,
        sectionId,
        name: config.name,
        productIds,
        source:
          config.siteStudioKey
            ? "Site Studio productIds or fallback"
            : "Current storefront fixed IDs",
      });
    }

    await client.query("COMMIT");

    console.log(
      "Homepage Content Migration v1A completed."
    );
    console.log(
      "Only Draft source data was copied. No frontend render was removed."
    );
    console.log("");

    for (const item of summary) {
      console.log(
        `- ${item.name} (${item.code})`
      );
      console.log(
        `  products: ${item.productIds.join(", ")}`
      );
      console.log(
        `  source: ${item.source}`
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    "Homepage Content Migration v1A failed:"
  );
  console.error(error);
  process.exitCode = 1;
});
