import fs from "node:fs";

const file = "scripts/admin-v2-wire-create-series.mjs";
let source = fs.readFileSync(file, "utf8");

const from = [
  "      setAdminSeriesMessage(",
  "        `已建立「${payload.series?.name || name}」`",
  "      );",
].join("\n");

const to = [
  "      setAdminSeriesMessage(",
  '        "已建立「" + (payload.series?.name || name) + "」"',
  "      );",
].join("\n");

const normalized = source.replace(/\r\n/g, "\n");

if (!normalized.includes(from)) {
  throw new Error("找不到需要修正的成功訊息區塊");
}

source = normalized.replace(from, to);

fs.writeFileSync(file, source, "utf8");

console.log("✅ 新增系列腳本語法已修正");
