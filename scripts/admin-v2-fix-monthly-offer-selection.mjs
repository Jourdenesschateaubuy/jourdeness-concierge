import fs from "node:fs";

const path = "./app/page.tsx";

let source = fs
  .readFileSync(path, "utf8")
  .replace(/\r\n/g, "\n");

const before = `      if (product) {
        openProductDetail(product);
        return;
      }`;

const after = `      if (product) {
        if (isAdminMode && isAdminEditMode) {
          setManagedProductId(product.id);
          return;
        }

        openProductDetail(product);
        return;
      }`;

if (!source.includes(before)) {
  console.error("❌ 找不到本月優惠商品點擊邏輯");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 3001 修改模式：本月優惠商品改為選取");
console.log("✅ 不會再直接開商品詳情");
console.log("✅ 3000 正式網站仍然正常開商品詳情");
console.log("✅ 選取後可使用底部「修改」");
