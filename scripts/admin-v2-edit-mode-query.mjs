import fs from "node:fs";

const path =
  "./app/admin/_components/AdminStorefrontShell.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

const before = `        src="/?admin=1"`;

const after = `        src={
          editMode
            ? "/?admin=1&edit=1"
            : "/?admin=1"
        }`;

if (!source.includes(before)) {
  console.error("❌ 找不到 iframe src");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 一般管理使用 /?admin=1");
console.log("✅ 修改模式使用 /?admin=1&edit=1");
console.log("✅ 不再只依賴 postMessage 傳遞修改狀態");
