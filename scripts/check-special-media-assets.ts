import fs from "node:fs/promises";
import path from "node:path";

const names = [
  "db-4.jpg",
  "logo.png",
  "no1.png",
  "no2.png",
  "TOP1.png",
  "TOP2.png",
  "TOP3.png",
  "TOP4.png",
  "TOP5.png",
  "TOP6.png",
];

function loadEnvLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex <= 0) {
    return;
  }

  const key = trimmed
    .slice(0, separatorIndex)
    .trim();

  let value = trimmed
    .slice(separatorIndex + 1)
    .trim();

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
    original_name: string;
    storage_path: string;
  }>(
    `
      SELECT
        id,
        original_name,
        storage_path
      FROM media_assets
      WHERE original_name = ANY($1::text[])
      ORDER BY original_name
    `,
    [names]
  );

  console.log(
    "找到 Media Asset：",
    result.rows.length
  );

  console.table(result.rows);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });