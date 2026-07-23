import fs from "node:fs";
import path from "node:path";

export function loadDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      "找不到 .env.local。請在專案根目錄建立 .env.local，內容為 DATABASE_URL=你的PostgreSQL連線字串"
    );
  }

  const content = fs.readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith("DATABASE_URL="));

  if (!line) {
    throw new Error(".env.local 裡找不到 DATABASE_URL。");
  }

  let value = line.slice("DATABASE_URL=".length).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!value) {
    throw new Error("DATABASE_URL 是空的。");
  }

  process.env.DATABASE_URL = value;
  return value;
}
