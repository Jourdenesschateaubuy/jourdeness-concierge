import fs from "node:fs/promises";
import path from "node:path";

function loadEnvLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!process.env[key]) {
    process.env[key] = value;
  }
}

async function loadEnvLocal() {
  const envPath = path.resolve(
    process.cwd(),
    ".env.local"
  );

  const content = await fs.readFile(
    envPath,
    "utf8"
  );

  for (const line of content.split(/\r?\n/)) {
    loadEnvLine(line);
  }
}

async function main() {
  await loadEnvLocal();

  const { dbQuery } = await import(
    "../lib/db"
  );

  const result = await dbQuery<{
    id: number;
    display_code: string;
    name: string;
    image: string;
    gallery: string[] | null;
  }>(
    `
      SELECT
        id,
        display_code,
        name,
        image,
        gallery
      FROM products
      WHERE
        image LIKE '/products/%'
        OR gallery::text LIKE '%/products/%'
      ORDER BY id
    `
  );

  console.log(
    "仍使用舊 /products/ 的商品數：",
    result.rows.length
  );

  console.table(
    result.rows.map((row) => ({
      id: row.id,
      code: row.display_code,
      name: row.name,
      image: row.image,
      galleryCount:
        Array.isArray(row.gallery)
          ? row.gallery.filter((item) =>
              item.startsWith("/products/")
            ).length
          : 0,
    }))
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});