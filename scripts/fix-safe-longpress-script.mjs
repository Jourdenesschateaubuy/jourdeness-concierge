import fs from "node:fs";

const path = "./scripts/admin-v2-safe-longpress.mjs";

let source = fs.readFileSync(path, "utf8");

source = source.replace(
  'let source = fs.readFileSync(pagePath, "utf8");',
  'let source = fs.readFileSync(pagePath, "utf8").replace(/\\r\\n/g, "\\n");'
);

source = source.replace(
  'let shell = fs.readFileSync(shellPath, "utf8");',
  'let shell = fs.readFileSync(shellPath, "utf8").replace(/\\r\\n/g, "\\n");'
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 已修正 Admin V2 腳本的 Windows 換行問題");
