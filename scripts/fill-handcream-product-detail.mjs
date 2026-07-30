import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const envPath = path.resolve(".env.local");

for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;

  const index = line.indexOf("=");
  if (index <= 0) continue;

  const key = line.slice(0, index).trim();
  let value = line.slice(index + 1).trim();

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
  console.error("❌ 找不到 DATABASE_URL");
  process.exit(1);
}

const features = [
  "薰衣草、櫻之雪、茶樹三款護手霜，可依喜好自由搭配。",
  "適合日常手部保養，雙手乾燥時可隨時補擦。",
  "買二送一，共 3 條 $580，並可選擇同款重複搭配。"
];

const suitableFor = [
  "手部乾燥",
  "日常保養",
  "隨身補擦",
  "香氛護手"
];

const usage =
  "取適量護手霜均勻塗抹於雙手與指緣，輕柔按摩至吸收；雙手感到乾燥時可隨時補擦。";

const notice =
  "請避免接觸眼睛、黏膜及傷口；使用後如有不適請停止使用。實際商品資訊與效期以商品包裝標示或 LINE 小幫手確認為準。";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

try {
  const before = await client.query(
    `
      SELECT
        id,
        name,
        features,
        suitable_for,
        usage,
        notice
      FROM products
      WHERE id = 108
    `
  );

  if (before.rowCount !== 1) {
    throw new Error("找不到 ID 108 護手霜自由配");
  }

  await client.query(
    `
      UPDATE products
      SET
        features = $1::jsonb,
        suitable_for = $2::jsonb,
        usage = $3,
        notice = $4,
        updated_at = NOW()
      WHERE id = 108
    `,
    [
      JSON.stringify(features),
      JSON.stringify(suitableFor),
      usage,
      notice,
    ]
  );

  console.log("✅ 護手霜自由配商品特色：3 條");
  console.log("✅ 適合需求：4 個");
  console.log("✅ 使用方式已補齊");
  console.log("✅ 配送／注意提醒已補齊");
  console.log("✅ 原本規格、簡介、價格、圖片、組合設定完全不動");
} finally {
  await client.end();
}
