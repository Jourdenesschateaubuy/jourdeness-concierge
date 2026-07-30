import fs from "node:fs";

const path =
  "./app/admin/products/_components/ProductCardEditForm.tsx";

let source = fs.readFileSync(path, "utf8");

const before =
`  const [category, setCategory] = useState(
    product.category ?? "保養品"
  );`;

const after =
`  const [category, setCategory] = useState<string>(
    product.category ?? "保養品"
  );`;

if (!source.includes(before)) {
  console.error("❌ 找不到 category state");
  process.exit(1);
}

source = source.replace(before, after);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 商品分類 TypeScript 型別已修正");
