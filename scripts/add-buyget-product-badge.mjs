import fs from "node:fs";

const path = "./app/page.tsx";
let source = fs.readFileSync(path, "utf8");

if (source.includes("function getBuyGetBadgeLabelV3C")) {
  console.log("ℹ️ 買送商品標籤已經存在，不重複修改");
  process.exit(0);
}

const displayTagsPattern =
  /  function displayTags\(product: Product\) \{\r?\n    const tags: string\[\] = \[\];/;

if (!displayTagsPattern.test(source)) {
  console.error("❌ 找不到 displayTags 插入點");
  process.exit(1);
}

const commerceBadgePattern =
  /  function getCommerceBadgeLabel\(product: Product\) \{/;

if (!commerceBadgePattern.test(source)) {
  console.error("❌ 找不到 getCommerceBadgeLabel 插入點");
  process.exit(1);
}

const helper = `  function getBuyGetBadgeLabelV3C(product: Product) {
    const config = buyGetConfigsStateV3C[product.id];

    if (!config) return "";
    if (config.buyQuantity <= 0 || config.giftQuantity <= 0) return "";

    return \`買\${config.buyQuantity}送\${config.giftQuantity}\`;
  }

`;

source = source.replace(
  /  function displayTags\(product: Product\) \{/,
  helper + "  function displayTags(product: Product) {"
);

source = source.replace(
  displayTagsPattern,
  `  function displayTags(product: Product) {
    const tags: string[] = [];

    const buyGetBadgeV3C = getBuyGetBadgeLabelV3C(product);
    if (buyGetBadgeV3C) tags.push(buyGetBadgeV3C);`
);

source = source.replace(
  commerceBadgePattern,
  `  function getCommerceBadgeLabel(product: Product) {
    const buyGetBadgeV3C = getBuyGetBadgeLabelV3C(product);
    if (buyGetBadgeV3C) return buyGetBadgeV3C;`
);

fs.writeFileSync(path, source, "utf8");

console.log("✅ 買幾送幾已接到商品卡與商品詳情標籤");
console.log("✅ DB 優惠會直接顯示：買1送1、買2送1...");
